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

  for (const pair of entries) {
    const value = pair[1] as string
    const values = value.split(';')
    await prisma.character.create({
      data: {
        name: values[0],
        personality: values[1],
        appearance: values[2],
        storyId: story,
      },
    })
  }

  return redirect(`/profiles/${profile.id}/stories/${params.storyId}/moral`)
}

export default function StoryID() {
  const [characters, setCharacters] = useState([1])

  return (
    <div className="p-8">
      <Form method="post" className="space-y-4">
        <div className="space-y-1">
          <h1>Characters</h1>
          <h2>Format: name;personality;appearance</h2>
        </div>
        <div className="space-y-1">
          {characters.map((id) => (
            <div key={id} className="space-y-1">
              <Label htmlFor={`character${id}`}>Character {id}</Label>
              <Input type="text" id={`character${id}`} name={`character${id}`} required />
            </div>
          ))}
        </div>
        <Button
          onClick={() =>
            setCharacters([...characters, characters[characters.length - 1] + 1])
          }>
          Add Character
        </Button>
        <Button type="submit" className="ml-4">
          Submit
        </Button>
      </Form>
    </div>
  )
}
