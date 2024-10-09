import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
// import type { Story } from '@prisma/client'
// import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/router'
import { redirect } from '@remix-run/router'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#app/components/ui/select'
import { Button } from '#app/components/ui/button.tsx'
import { Form } from '@remix-run/react'

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

export default function StoryID() {
  return (
    <Form method="post" className="space-y-1 p-8">
      <Label htmlFor="theme">Theme</Label>
      <Select name="theme">
        <SelectTrigger id="theme">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fantasy">Fantasy</SelectItem>
          <SelectItem value="mystery">Mystery</SelectItem>
          <SelectItem value="educational">Educational</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="mr-2">
        Submit
      </Button>
    </Form>
  )
}
