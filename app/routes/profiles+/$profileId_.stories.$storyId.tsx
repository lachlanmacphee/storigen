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
    const imageURLs = await generateImages(story, chapterTexts)

    let generatedChapters: Chapter[] = []

    for (let i = 0; i < chapterTexts.length; i++) {
      generatedChapters.push({
        text: chapterTexts[i],
        image: imageURLs[i],
        storyId: story.id,
      } as Chapter)
    }

    const chapters = await prisma.chapter.createManyAndReturn({ data: generatedChapters })

    const title = await generateTitle(chapters)

    await prisma.story.update({
      data: { title, isGenerated: true },
      where: { id: story.id },
    })
  }

  const chapters = await prisma.chapter.findMany({ where: { storyId: story.id } })

  return json({ story, chapters } as const)
}

export default function StoryID() {
  const loaderData = useLoaderData<typeof loader>()
  const story = loaderData.story as Story
  const chapters = loaderData.chapters as Chapter[]

  return (
    <div className="mx-auto max-w-4xl space-y-8 bg-secondary p-8 text-white dark:bg-black">
      <h1 className="mb-4 text-center font-serif text-4xl text-primary">{story.title}</h1>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white bg-opacity-10 p-6 shadow-lg dark:border-gray-700">
        <p className="font-serif text-xl font-light leading-relaxed">
          <span className="font-bold">Plot:</span> {story.plot}
        </p>
        <p className="text-lg italic">
          <span className="font-bold">Moral:</span> {story.moral}
        </p>
        <p className="text-lg">
          <span className="font-bold">Theme:</span> {story.theme}
        </p>
        <p className="text-lg">
          <span className="font-bold">Setting:</span> {story.setting}
        </p>
      </div>

      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className="space-y-6 rounded-xl border border-gray-300 bg-white bg-opacity-20 p-8 shadow-md dark:border-gray-700">
          <p className="font-serif text-xl leading-relaxed text-gray-200 dark:text-gray-400">
            {chapter.text}
          </p>
          {chapter.image && (
            <div className="flex justify-center">
              <img
                src={chapter.image}
                alt="Story illustration"
                className="h-auto max-w-full rounded-lg border-4 border-gray-300 shadow-lg dark:border-gray-700"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
