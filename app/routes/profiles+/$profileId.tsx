import { prisma } from '#app/utils/db.server.ts'
import type { Profile, Story } from '@prisma/client'
import { Form, Link, redirect, useLoaderData } from '@remix-run/react'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#app/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#app/components/ui/dialog'

import { Badge } from '#app/components/ui/badge'
import { Plus } from 'lucide-react'
import { Button, buttonVariants } from '#app/components/ui/button.tsx'

export async function action({ request, params }: ActionFunctionArgs) {
  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) return

  const story = await prisma.story.create({
    data: {
      title: '',
      theme: '',
      moral: '',
      setting: '',
      plot: '',
      profileId: profile.id,
      isGenerated: false,
    },
  })

  return redirect(`/profiles/${profile.id}/stories/${story.id}/theme`)
}

export async function loader({ params }: LoaderFunctionArgs) {
  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) throw new Response('', { status: 404 })
  const stories = await prisma.story.findMany({
    where: { profileId: params.profileId },
    include: {
      characters: true,
    },
  })
  return json({ profile, stories } as const)
}

export default function ProfileID() {
  const loaderData = useLoaderData<typeof loader>()
  const profile = loaderData.profile as Profile
  const stories = loaderData.stories as Story[]

  return (
    <div className="space-y-8 bg-secondary p-6 text-white dark:bg-black">
      <div className="flex justify-between">
        {/* Profile Information */}
        <h1 className="text-2xl font-semibold">{profile.name}'s Stories</h1>

        {/* Create New Story */}
        <Dialog>
          <DialogTrigger
            className={buttonVariants({ variant: 'default', size: 'lg' }) + ' gap-2'}>
            <span className="font-semibold">Create Story</span>
            <Plus className="stroke-" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Story</DialogTitle>
              <DialogDescription>
                This will create a new story under this profile. You can always remove
                this story if you no longer want it.
              </DialogDescription>
            </DialogHeader>
            <Form method="post" className="space-y-3">
              <Button type="submit" className="mr-2">
                Go
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stories List */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.length > 0 ? (
          stories.map((story: Story) => (
            <Card key={story.id} className="bg-primary dark:bg-secondary">
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>{story.theme}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Moral:</strong> {story.moral}
                </p>
                <p>
                  <strong>Setting:</strong> {story.setting}
                </p>
                <p>
                  <strong>Plot:</strong> {story.plot}
                </p>
                {/* Display a list of characters as badges if available */}
                <div className="mt-4 space-x-2">
                  {/* @ts-ignore */}
                  {story.characters.map((character) => (
                    <Badge key={character.id} className="bg-accent">
                      {character.name}
                    </Badge>
                  ))}
                </div>
                <Link to={`stories/${story.id}`}>Go to story</Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No stories found for this profile.
          </p>
        )}
      </div>

      <h1 className="text-2xl font-semibold">Community Stories</h1>
      <p>No community stories have been published yet. Check back soon!</p>
    </div>
  )
}
