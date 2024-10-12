import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
// import type { Story } from '@prisma/client'
// import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/router'
import { redirect } from '@remix-run/router'

import { Textarea } from '#app/components/ui/textarea.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Form } from '@remix-run/react'

export async function action({ request, params }: ActionFunctionArgs) {
  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) return
  // const user = await requireUser(request)

  // validate profile belongs to user

  const body = await request.formData()
  const plot = body.get('plot') as string | null
  if (!plot) return

  const story = await prisma.story.update({
    where: {
      id: params.storyId,
    },
    data: {
      plot,
    },
  })

  return redirect(`/profiles/${profile.id}/stories/${story.id}`)
}

export default function StoryPlot() {
  return (
    <div className="flex justify-center p-8">
      <Form method="post" className="max-w-3xl flex-grow space-y-4">
        <div className="space-y-1">
          <Label htmlFor="plot">Plot</Label>
          <Textarea id="plot" name="plot" required />
        </div>
        <Button type="submit" variant="default_green" className="mr-2">
          Submit
        </Button>
      </Form>
    </div>
  )
}
