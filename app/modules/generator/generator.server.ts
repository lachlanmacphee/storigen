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
        "You are a creative assistant who helps generate long-format children's stories. The story must have five distinct chapters. You should return the text of each chapter as a string in the array. This means there should be 5 strings in the array.",
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
    max_tokens: 1000,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'story_response',
        strict: true,
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })

  const result = response.choices[0].message.content as string
  return JSON.parse(result) as string[]
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
      content: `Based on the following chapters of a story, generate a creative and engaging title: ${chapters}`,
    },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    max_tokens: 100,
  })

  const result = response.choices[0].message.content
  if (!result) return ''

  return result
}

export async function generateImages(
  story: Story,
  chapterTexts: String[],
  style = 'cartoon',
): Promise<string[]> {
  const { theme, setting } = story

  const imageURLs = await Promise.all(
    chapterTexts.map(async (chapter) => {
      const prompt = `Create an illustration for a chapter of a children's story. The theme is ${theme}. The setting is ${setting}. The style should be ${style}. Here is the chapter text: ${chapter}`

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
