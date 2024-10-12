import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
// import type { Story } from '@prisma/client'
// import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/router'
import { redirect } from '@remix-run/router'

import { Input } from '#app/components/ui/input.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Form } from '@remix-run/react'
import { useState } from 'react'

export async function action({ request, params }: ActionFunctionArgs) {
  const story = params.storyId
  if (!story) return

  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) return

  const body = await request.formData()
  const entries = body.entries()

  // Count characters based on the name field
  let characterCount = 0

  for (const [key] of entries) {
    if (key.startsWith('character') && key.endsWith('-name')) {
      characterCount++
    }
  }

  // Iterate and create character records
  for (let i = 1; i <= characterCount; i++) {
    const name = body.get(`character${i}-name`) as string
    const personality = body.get(`character${i}-personality`) as string
    const appearance = body.get(`character${i}-appearance`) as string

    if (name && personality && appearance) {
      await prisma.character.create({
        data: {
          name,
          personality,
          appearance,
          storyId: story,
        },
      })
    }
  }

  return redirect(`/profiles/${profile.id}/stories/${story}/moral`)
}

export default function StoryCharacters() {
  const [characters, setCharacters] = useState([1])

  const handleAddCharacter = () => {
    setCharacters([...characters, characters[characters.length - 1] + 1])
  }

  return (
    <div className="flex justify-center p-8">
      <Form method="post" className="max-w-3xl flex-grow space-y-4">
        <h1 className="text-4xl font-bold">Characters</h1>
        <div className="flex flex-col gap-4">
          {characters.map((id) => (
            <div key={id} className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`character${id}-name`}>Character {id} Name</Label>
                <Input
                  type="text"
                  id={`character${id}-name`}
                  name={`character${id}-name`}
                  required
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`character${id}-personality`}>
                  Character {id} Personality
                </Label>
                <Input
                  type="text"
                  id={`character${id}-personality`}
                  name={`character${id}-personality`}
                  required
                  placeholder="Personality"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`character${id}-appearance`}>
                  Character {id} Appearance
                </Label>
                <Input
                  type="text"
                  id={`character${id}-appearance`}
                  name={`character${id}-appearance`}
                  required
                  placeholder="Appearance"
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="default_green"
          onClick={handleAddCharacter}
          type="button" // Ensure the button does not submit the form
        >
          Add Character
        </Button>
        <Button type="submit" variant="default_green" className="ml-4">
          Submit
        </Button>
      </Form>
    </div>
  )
}
