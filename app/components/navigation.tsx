import type { User } from '@prisma/client'
import { Link, useLocation, useSubmit, useNavigate } from '@remix-run/react'
import { Settings, LogOut } from 'lucide-react'
// import { PLANS } from '#app/modules/stripe/plans'
import { useRequestInfo } from '#app/utils/hooks/use-request-info'
import { getUserImgSrc, cn } from '#app/utils/misc'
import { ROUTE_PATH as LOGOUT_PATH } from '#app/routes/auth+/logout'
import { ROUTE_PATH as PROFILES_PATH } from '#app/routes/profiles+/_layout'
import { ROUTE_PATH as PROFILE_SETTINGS_PATH } from '#app/routes/profiles+/settings.tsx'
import { ROUTE_PATH as PROFILE_SETTINGS_BILLING_PATH } from '#app/routes/profiles+/settings.billing.tsx'
import { ThemeSwitcher } from '#app/components/misc/theme-switcher'
import { LanguageSwitcher } from '#app/components/misc/language-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '#app/components/ui/dropdown-menu'
import { Button, buttonVariants } from '#app/components/ui/button'
import { Logo } from '#app/components/logo'

/**
 * Required to handle JsonifyObject Typescript mismatch.
 * This will be fixed in future versions of Remix.
 */
type JsonifyObjectUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  image: {
    id: string
  } | null
  roles: {
    name: string
  }[]
  createdAt: string | null
  updatedAt: string | null
}

type NavigationProps = {
  user: JsonifyObjectUser | null
  planId?: string
}

export function Navigation({ user, planId }: NavigationProps) {
  const navigate = useNavigate()
  const submit = useSubmit()
  const requestInfo = useRequestInfo()

  const location = useLocation()
  const isProfilesPath = location.pathname === PROFILES_PATH
  const isSettingsPath = location.pathname === PROFILE_SETTINGS_PATH
  const isBillingPath = location.pathname === PROFILE_SETTINGS_BILLING_PATH

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <div className="flex h-10 items-center gap-2">
          <Link
            to={PROFILES_PATH}
            prefetch="intent"
            className="flex h-10 items-center gap-1">
            <Logo />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 items-center border-b-2 ${isProfilesPath ? 'border-primary' : 'border-transparent'}`}>
            <Link
              to={PROFILES_PATH}
              prefetch="intent"
              className={cn(
                `${buttonVariants({ variant: 'ghost', size: 'sm' })} text-primary/80`,
              )}>
              Profiles
            </Link>
          </div>
          <div
            className={`flex h-12 items-center border-b-2 ${isSettingsPath ? 'border-primary' : 'border-transparent'}`}>
            <Link
              to={PROFILE_SETTINGS_PATH}
              prefetch="intent"
              className={cn(
                `${buttonVariants({ variant: 'ghost', size: 'sm' })} text-primary/80`,
              )}>
              Settings
            </Link>
          </div>
          <div
            className={`flex h-12 items-center border-b-2 ${isBillingPath ? 'border-primary' : 'border-transparent'}`}>
            <Link
              to={PROFILE_SETTINGS_BILLING_PATH}
              prefetch="intent"
              className={cn(
                `${buttonVariants({ variant: 'ghost', size: 'sm' })} text-primary/80`,
              )}>
              Billing
            </Link>
          </div>
        </div>

        <div className="flex h-10 items-center gap-3">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full">
                {user?.image?.id ? (
                  <img
                    className="min-h-8 min-w-8 rounded-full object-cover"
                    alt={user.username ?? user.email}
                    src={getUserImgSrc(user.image?.id)}
                  />
                ) : (
                  <span className="min-h-8 min-w-8 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              className="fixed -right-4 min-w-56 bg-card p-2">
              <DropdownMenuItem className="group flex-col items-start focus:bg-transparent">
                <p className="text-sm font-medium text-primary/80 group-hover:text-primary group-focus:text-primary">
                  {user?.username || ''}
                </p>
                <p className="text-sm text-primary/60">{user?.email}</p>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => navigate(PROFILE_SETTINGS_PATH)}>
                <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Settings
                </span>
                <Settings className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className={cn(
                  'group flex h-9 justify-between rounded-md px-2 hover:bg-transparent',
                )}>
                <span className="w-full text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Theme
                </span>
                <ThemeSwitcher userPreference={requestInfo.userPrefs.theme} />
              </DropdownMenuItem>

              <DropdownMenuItem
                className={cn(
                  'group flex h-9 justify-between rounded-md px-2 hover:bg-transparent',
                )}>
                <span className="w-full text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Language
                </span>
                <LanguageSwitcher />
              </DropdownMenuItem>

              <DropdownMenuSeparator className="mx-0 my-2" />

              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => submit({}, { action: LOGOUT_PATH, method: 'POST' })}>
                <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Log Out
                </span>
                <LogOut className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
