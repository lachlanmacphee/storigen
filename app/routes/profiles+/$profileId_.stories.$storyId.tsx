import { prisma } from '#app/utils/db.server.ts'
import type { Chapter, Story } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json, type LoaderFunctionArgs } from '@remix-run/router'
import {
  generateImages,
  generateStory,
  generateTitle,
} from '#app/modules/generator/generator.server'

export async function loader({ params }: LoaderFunctionArgs) {
  const story = await prisma.story.findUnique({ where: { id: params.storyId } })
  if (!story) throw new Response('Failed to find this story', { status: 404 })
  const characters = await prisma.character.findMany({ where: { storyId: story.id } })
  if (characters.length == 0)
    throw new Response('No characters found for this story', { status: 500 })

  if (!story.isGenerated) {
    const chapterTexts = await generateStory(story, characters)
    console.log('Chapter texts', chapterTexts)
    const imageURLs = await generateImages(story, chapterTexts)
    console.log('Image URLs', imageURLs)

    let generatedChapters: Chapter[] = []

    for (let i = 0; i < chapterTexts.length; i++) {
      generatedChapters.push({
        text: chapterTexts[i],
        image: imageURLs[i],
        storyId: story.id,
      } as Chapter)
    }

    console.log('Generated chapters', generatedChapters)

    const chapters = await prisma.chapter.createManyAndReturn({ data: generatedChapters })

    const title = await generateTitle(chapters)
    console.log('title', title)

    await prisma.story.update({ data: { title }, where: { id: story.id } })
  }

  return json({ story } as const)
}

export default function StoryID() {
  const loaderData = useLoaderData<typeof loader>()
  const story = loaderData.story as Story

  return (
    <div className="space-y-8 bg-secondary p-6 text-white dark:bg-black">
      <p>{story.plot}</p>
    </div>
  )
}
