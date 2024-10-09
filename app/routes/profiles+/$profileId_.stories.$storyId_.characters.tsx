import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
// import type { Story } from '@prisma/client'
// import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/router'
import { redirect } from '@remix-run/router'

import { Input } from '#app/components/ui/input.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Form } from '@remix-run/react'

export async function action({ request, params }: ActionFunctionArgs) {
  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) return
  // const user = await requireUser(request)

  // validate profile belongs to user

  const body = await request.formData()
  const characters = body.get('characters') as string | null
  if (!characters) return

  return redirect(`/profiles/${profile.id}/stories/${params.storyId}/moral`)
}

export default function StoryID() {
  return (
    <div className="space-y-1 p-8">
      <Form method="post" className="space-y-1">
        <Label htmlFor="characters">Characters</Label>
        <Input type="text" id="characters" name="characters" required />
        <Button type="submit" className="mr-2">
          Submit
        </Button>
      </Form>
    </div>
  )
}
