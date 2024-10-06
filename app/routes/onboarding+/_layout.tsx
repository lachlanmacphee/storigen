import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { json, redirect } from '@remix-run/node'
import { requireUser } from '#app/modules/auth/auth.server'
import { getDomainPathname } from '#app/utils/misc.server'
import { ROUTE_PATH as PROFILES_PATH } from '#app/routes/profiles+/_layout'
import { ROUTE_PATH as ONBOARDING_USERNAME_PATH } from '#app/routes/onboarding+/username'
import { Logo } from '#app/components/logo'

export const ROUTE_PATH = '/onboarding' as const

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  const pathname = getDomainPathname(request)
  const isOnboardingPathname = pathname === ROUTE_PATH
  const isOnboardingUsernamePathname = pathname === ONBOARDING_USERNAME_PATH

  if (isOnboardingPathname) return redirect(PROFILES_PATH)
  if (user.username && isOnboardingUsernamePathname) return redirect(PROFILES_PATH)

  return json({})
}

export default function Onboarding() {
  return (
    <div className="relative flex h-screen w-full bg-card">
      <div className="absolute left-1/2 top-8 mx-auto -translate-x-1/2 transform justify-center">
        <Logo />
      </div>
      <div className="z-10 h-screen w-screen">
        <Outlet />
      </div>
      <div className="base-grid fixed h-screen w-screen opacity-40" />
      <div className="fixed bottom-0 h-screen w-screen bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
    </div>
  )
}
