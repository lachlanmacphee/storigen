import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
// import type { Story } from '@prisma/client'
// import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/router'
import { redirect } from '@remix-run/router'

import { Button } from '#app/components/ui/button.tsx'
import { Form } from '@remix-run/react'
import { useState } from 'react'

const themes = [
  { value: 'fantasy', label: 'Fantasy', color: 'bg-red-500' }, // Red
  { value: 'mystery', label: 'Mystery', color: 'bg-orange-500' }, // Orange
  { value: 'educational', label: 'Educational', color: 'bg-yellow-500' }, // Yellow
  { value: 'adventure', label: 'Adventure', color: 'bg-green-500' }, // Green
  { value: 'fairy_tale', label: 'Fairy Tale', color: 'bg-blue-500' }, // Blue
  { value: 'animals', label: 'Animals', color: 'bg-indigo-500' }, // Indigo
  { value: 'space', label: 'Space', color: 'bg-purple-500' }, // Purple
  { value: 'friendship', label: 'Friendship', color: 'bg-pink-500' }, // Pink
  { value: 'superheroes', label: 'Superheroes', color: 'bg-teal-500' }, // Teal
  { value: 'pirates', label: 'Pirates', color: 'bg-gray-500' }, // Gray
]

export async function action({ request, params }: ActionFunctionArgs) {
  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) return
  // const user = await requireUser(request)

  // validate profile belongs to user

  const body = await request.formData()
  const theme = body.get('theme') as string | null
  if (!theme) return

  const story = await prisma.story.update({
    where: {
      id: params.storyId,
    },
    data: {
      theme,
    },
  })

  return redirect(`/profiles/${profile.id}/stories/${story.id}/characters`)
}

export default function StoryTheme() {
  const [selectedTheme, setSelectedTheme] = useState<string>('fantasy')

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
  }

  return (
    <div className="flex justify-center p-8">
      <Form method="post" className="max-w-3xl flex-grow space-y-4">
        <div className="space-y-1">
          <Label htmlFor="theme">Theme</Label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {themes.map((theme) => (
              <Button
                key={theme.value}
                type="button"
                variant="ghost"
                onClick={() => handleThemeChange(theme.value)}
                className={`${selectedTheme === theme.value ? 'bg-white text-black' : `${theme.color} text-white`} h-20 px-8 py-4 text-lg transition duration-200 ease-in-out`}>
                {theme.label}
              </Button>
            ))}
          </div>
        </div>
        <input type="hidden" name="theme" value={selectedTheme} />
        <Button type="submit" variant="default_green" className="mr-2">
          Submit
        </Button>
      </Form>
    </div>
  )
}
