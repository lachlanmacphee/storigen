import type { Chapter, Character, Story } from '@prisma/client'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStory(
  story: Story,
  characters: Character[],
): Promise<string[]> {
  const { theme, moral, setting, plot } = story
  const messages = [
    {
      role: 'system' as const,
      content:
        "You are a creative assistant who helps generate long-format children's stories. The story must have five distinct chapters, each with approximately 150 words. You should return the text of each chapter as a string in the array. This means there should be 5 strings in the array.",
    },
    { role: 'user' as const, content: `Theme: ${theme}` },
    { role: 'user' as const, content: `Characters: ${characters}` },
    { role: 'user' as const, content: `Moral of the story: ${moral}` },
    { role: 'user' as const, content: `Location of the story: ${setting}` },
    { role: 'user' as const, content: `Plot: ${plot}` },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 3000,
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
                type: 'string',
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
  return parsedResult.chapters as string[]
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
      content: `Based on the following chapters of a story, generate a creative and engaging title: ${chapters.reduce<string>((acc, chapter) => acc + chapter.text + '\n\n', '').slice(0, 500)}`,
    },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 100,
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

export async function generateImages(
  story: Story,
  chapterTexts: String[],
  style = 'cartoon',
): Promise<string[]> {
  const { theme, setting } = story

  const imageURLs = await Promise.all(
    chapterTexts.map(async (chapter) => {
      const prompt = `Create an illustration for a chapter of a children's story. The theme is ${theme}. The setting is ${setting}. The style should be ${style}. Here is the chapter text: ${chapter.slice(0, 200)}`

      const imageResponse = await openai.images.generate({
        prompt,
        n: 1,
        size: '512x512',
      })

      return imageResponse.data[0].url as string
    }),
  )

  return imageURLs
}
