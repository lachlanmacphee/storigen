import type { Chapter, Character, Story } from '@prisma/client'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStory(
  story: Story,
  characters: Character[],
): Promise<{ title: string; content: string }[]> {
  const { theme, moral, setting, plot } = story
  const messages = [
    {
      role: 'system' as const,
      content:
        "You are a creative assistant who helps generate long-format children's stories. The story must have five distinct chapters, each with 150 words maximum. You should return an array of objects, consisting of the title for each chapter and the contents of the chapter. This means there should always be 5 objects in the array.",
    },
    { role: 'user' as const, content: `Theme: ${theme}` },
    {
      role: 'user' as const,
      content: `Characters: ${JSON.stringify(characters.map((character) => `Name: ${character.name}\nPersonality: ${character.personality}\nAppearance: ${character.appearance}`))}`,
    },
    { role: 'user' as const, content: `Moral of the story: ${moral}` },
    { role: 'user' as const, content: `Location of the story: ${setting}` },
    { role: 'user' as const, content: `Plot: ${plot}` },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 3000,
    temperature: 0.7,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'story_response',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            chapters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                  },
                  content: {
                    type: 'string',
                  },
                },
                required: ['title', 'content'],
                additionalProperties: false,
              },
            },
          },
          required: ['chapters'],
          additionalProperties: false,
        },
      },
    },
  })

  const result = response.choices[0].message.content as string
  const parsedResult = JSON.parse(result)
  return parsedResult.chapters as { title: string; content: string }[]
}

export async function generateTitle(chapters: Chapter[]): Promise<string> {
  const messages = [
    {
      role: 'system' as const,
      content:
        "You are a creative assistant who helps create engaging titles for children's stories.",
    },
    {
      role: 'user' as const,
      content: `Based on the following chapters of a story, generate a creative and engaging title: ${chapters.reduce<string>((acc, chapter) => acc + chapter.text + '\n\n', '')}`,
    },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 100,
    temperature: 0.7,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'story_title_response',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
            },
          },
          required: ['title'],
          additionalProperties: false,
        },
      },
    },
  })

  const result = response.choices[0].message.content as string
  const parsedResult = JSON.parse(result)
  return parsedResult.title as string
}

async function generateCharacterDescriptions(fullStory: string): Promise<string> {
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are a creative assistant who helps generate detailed character descriptions for illustration purposes.',
    },
    { role: 'user' as const, content: 'Here is the full story:' },
    { role: 'user' as const, content: fullStory },
    {
      role: 'user' as const,
      content:
        'Please create detailed descriptions of the key characters from this story, focusing on their physical appearance. These descriptions will be used for generating consistent characters across illustrations for a comic book.',
    },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    max_tokens: 1000,
    temperature: 0.7,
  })

  return response.choices[0].message.content as string
}

async function generateIllustrationDescriptions(
  chapters: string[],
  theme: string,
  characterDescriptions: string,
  style: string = 'cartoon',
): Promise<string[]> {
  const illustrationDescriptions: string[] = []
  let previousIllustration: string | null = null // To store the previous illustration description

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    // Construct the prompt for the current illustration, referencing the previous one if available
    let prompt: string

    if (previousIllustration) {
      prompt =
        `Theme: ${theme}. Style: ${style}. Chapter ${i + 1}: ${chapter}. Character: ${characterDescriptions} ` +
        `Please generate a brief but vivid visual description for an illustration that fits this chapter. ` +
        `Take into account the previous illustration: ${previousIllustration}. Focus on key characters, setting, and mood.`
    } else {
      prompt =
        `Theme: ${theme}. Style: ${style}. Chapter ${i + 1}: ${chapter}. Character: ${characterDescriptions} ` +
        `Please generate a brief but vivid visual description for an illustration that fits this chapter. ` +
        `Focus on key characters, setting, and mood.`
    }

    // Use GPT-4 to generate a concise visual description for the illustration
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are a creative assistant who generates concise visual descriptions for illustrations based on story chapters.',
      },
      { role: 'user' as const, content: prompt },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    })

    // Extract the visual description from the GPT-4 response
    const illustrationDescription = response.choices[0].message.content as string
    illustrationDescriptions.push(illustrationDescription)

    // Update the previous illustration description for the next iteration
    previousIllustration = illustrationDescription
  }

  return illustrationDescriptions
}

export async function generateImages(
  story: Story,
  chapterTexts: string[],
  style = 'cartoon',
): Promise<string[]> {
  const { theme, setting } = story
  const fullStoryText = chapterTexts.reduce<string>(
    (acc, chapter) => acc + chapter + '\n\n',
    '',
  )
  const characterDescriptions = await generateCharacterDescriptions(fullStoryText)
  const illustrationDescriptions = await generateIllustrationDescriptions(
    chapterTexts,
    theme,
    characterDescriptions,
  )

  const imageURLs = await Promise.all(
    illustrationDescriptions.map(async (chapter) => {
      const prompt = `Create an illustration for a chapter of a children's story. The theme is ${theme}. The setting is ${setting}. The style should be ${style}. Here is the chapter text: ${chapter.slice(0, 200)}`

      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      })

      return imageResponse.data[0].url as string
    }),
  )

  return imageURLs
}
