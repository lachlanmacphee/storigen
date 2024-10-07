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
import { Label } from '#app/components/ui/label.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Badge } from '#app/components/ui/badge'
import { Plus } from 'lucide-react'
import { Button, buttonVariants } from '#app/components/ui/button.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'
// import { requireUser } from '#app/modules/auth/auth.server.ts'

export async function action({ request, params }: ActionFunctionArgs) {
  const profile = await prisma.profile.findUnique({ where: { id: params.profileId } })
  if (!profile) return
  // const user = await requireUser(request)

  // validate profile belongs to user

  const body = await request.formData()
  const title = body.get('title') as string | null
  const theme = body.get('theme') as string | null
  const moral = body.get('moral') as string | null
  const location = body.get('location') as string | null
  const plot = body.get('plot') as string | null
  if (!title || !theme || !moral || !location || !plot) return
  const story = await prisma.story.create({
    data: {
      title,
      theme,
      moral,
      location,
      plot,
      profileId: profile.id,
    },
  })
  return redirect(`/profiles/${profile.id}/story/${story.id}`)
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
        <h1 className="text-2xl font-semibold">{profile.name}</h1>

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
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input type="text" id="title" name="title" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="theme">Theme</Label>
                <Input type="text" id="theme" name="theme" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="moral">Moral</Label>
                <Input type="text" id="moral" name="moral" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input type="text" id="location" name="location" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plot">Plot</Label>
                <Textarea id="plot" name="plot" required />
              </div>
              <Button type="submit" className="mr-2">
                Submit
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
                  <strong>Location:</strong> {story.location}
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
    </div>
  )
}
