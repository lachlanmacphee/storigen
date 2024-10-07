import { prisma } from '#app/utils/db.server.ts'
import type { Story } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json, type LoaderFunctionArgs } from '@remix-run/router'

export async function loader({ params }: LoaderFunctionArgs) {
  const story = await prisma.story.findUnique({ where: { id: params.storyId } })
  if (!story) throw new Response('', { status: 404 })
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
