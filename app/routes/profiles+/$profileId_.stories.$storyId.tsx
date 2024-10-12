import { prisma } from '#app/utils/db.server.ts'
import type { Chapter, Story } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json, type LoaderFunctionArgs } from '@remix-run/router'
import { Card, CardContent, CardHeader, CardTitle } from '#app/components/ui/card'
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
    console.log('Generating chapters...')
    const generatedChapters = await generateStory(story, characters)
    console.log(generatedChapters)
    console.log('Generating images...')
    const imageURLs = await generateImages(
      story,
      generatedChapters.map((chapter) => chapter.content),
    )
    let formattedChapters: Chapter[] = []

    for (let i = 0; i < generatedChapters.length; i++) {
      formattedChapters.push({
        title: generatedChapters[i].title,
        text: generatedChapters[i].content,
        image: imageURLs[i],
        storyId: story.id,
      } as Chapter)
    }

    const chapters = await prisma.chapter.createManyAndReturn({ data: formattedChapters })

    console.log('Generating title...')
    const title = await generateTitle(chapters)

    await prisma.story.update({
      data: { title, isGenerated: true },
      where: { id: story.id },
    })
  }

  const chapters = await prisma.chapter.findMany({ where: { storyId: story.id } })
  const refreshedStory = await prisma.story.findUnique({ where: { id: params.storyId } })
  return json({ story: refreshedStory, chapters } as const)
}

export default function Story() {
  const loaderData = useLoaderData<typeof loader>()
  const story = loaderData.story as Story
  const chapters = loaderData.chapters as Chapter[]

  return (
    <div className="mx-auto max-w-4xl space-y-8 bg-secondary p-8 text-white dark:bg-black">
      <Card className="border-4">
        <CardHeader>
          <CardTitle className="text-center font-serif text-4xl">{story.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            <span className="font-bold">Plot:</span> {story.plot}
          </p>
          <p className="text-lg">
            <span className="font-bold">Moral:</span> {story.moral}
          </p>
          <p className="text-lg">
            <span className="font-bold">Theme:</span> {story.theme}
          </p>
          <p className="text-lg">
            <span className="font-bold">Setting:</span> {story.setting}
          </p>
        </CardContent>
      </Card>

      {chapters.map((chapter) => (
        <Card key={chapter.id} className="border-4">
          <CardHeader>
            <CardTitle className="text-center font-serif text-2xl">
              {chapter.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="font-serif text-xl leading-relaxed">{chapter.text}</p>
            {chapter.image && (
              <div className="flex justify-center">
                <img
                  src={chapter.image}
                  alt="Story illustration"
                  className="h-auto max-w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
