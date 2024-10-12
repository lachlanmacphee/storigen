import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { requireUser } from '#app/modules/auth/auth.server'
import { prisma } from '#app/utils/db.server'
import { Button, buttonVariants } from '#app/components/ui/button.tsx'
import { Form, Link, useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/router'
import { redirect } from '@remix-run/router'
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

export const meta: MetaFunction = () => {
  return [{ title: `Profiles` }]
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request)
  const body = await request.formData()
  const name = body.get('name') as string | null
  const age = body.get('age') as string | null
  const gender = body.get('gender') as string | null
  if (!name || !age || !gender) {
    return
  }
  const profile = await prisma.profile.create({
    data: {
      name,
      age: parseInt(age),
      gender,
      userId: user.id,
    },
  })
  return redirect(`/profiles/${profile.id}`)
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })
  const profiles = await prisma.profile.findMany({
    where: {
      userId: user.id,
    },
  })
  return json({ user, subscription, profiles } as const)
}

export default function Profiles() {
  const { t } = useTranslation()
  const { profiles } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl flex-col gap-4">
        <div className="flex justify-end">
          {/* Controls Row */}
          <Dialog>
            <DialogTrigger
              className={
                buttonVariants({ variant: 'default_green', size: 'lg' }) + ' gap-2'
              }>
              <span className="font-semibold">Create Profile</span>
              <Plus />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Profile</DialogTitle>
                <DialogDescription>
                  This will create a new profile under your account. You can always remove
                  this profile if you no longer want it.
                </DialogDescription>
              </DialogHeader>
              <Form method="post" className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" name="name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="age">Age</Label>
                  <Input type="text" id="age" name="age" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Input type="text" id="gender" name="gender" />
                </div>
                <Button type="submit" variant="default_green">
                  Create Profile
                </Button>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
          <div className="relative mx-auto flex w-full flex-col items-center p-6">
            <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-lg border border-border bg-secondary px-6 py-24 dark:bg-card">
              {profiles.length == 0 && (
                <div className="z-10 flex max-w-[460px] flex-col items-center gap-4">
                  <Button
                    variant="outline"
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card hover:border-primary/40">
                    <Plus className="h-8 w-8 stroke-[1.5px] text-primary/60" />
                  </Button>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base font-medium text-primary">{t('title')}</p>
                    <p className="text-center text-base font-normal text-primary/60">
                      {t('description')}
                    </p>
                  </div>
                </div>
              )}
              {profiles.length != 0 && (
                <div className="z-10 flex gap-10">
                  {profiles.map((profile) => (
                    <Link
                      key={profile.id}
                      to={profile.id}
                      className="z-10 flex h-52 w-52 flex-col items-center justify-center gap-4 rounded-2xl border border-primary/20 bg-card p-2 hover:border-primary/40">
                      <img
                        src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${profile.name}&eyes=plain,closed,closed2,wink&mouth=cute,lilSmile,smileTeeth,wideSmile`}
                        alt="avatar"
                        className="h-20 w-20 rounded-md"
                      />
                      <p className="text-2xl font-semibold text-primary">
                        {profile.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              <div className="base-grid absolute h-full w-full opacity-40" />
              <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
