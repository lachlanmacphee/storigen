import { useLocation } from '@remix-run/react'
import { ROUTE_PATH as PROFILES_PATH } from '#app/routes/profiles+/_layout'
import { ROUTE_PATH as BILLING_PATH } from '#app/routes/profiles+/settings.billing.tsx'
import { ROUTE_PATH as SETTINGS_PATH } from '#app/routes/profiles+/settings.tsx'

export function Header() {
  const location = useLocation()
  const allowedLocations = [PROFILES_PATH, BILLING_PATH, SETTINGS_PATH]

  const headerTitle = () => {
    if (location.pathname === PROFILES_PATH) return 'Profiles'
    if (location.pathname === BILLING_PATH) return 'Billing'
    if (location.pathname === SETTINGS_PATH) return 'Settings'
  }
  const headerDescription = () => {
    if (location.pathname === PROFILES_PATH) return 'Manage stories based on individuals.'
    if (location.pathname === SETTINGS_PATH) return 'Manage your account settings.'
    if (location.pathname === BILLING_PATH)
      return 'Manage billing and your subscription plan.'
  }

  if (!allowedLocations.includes(location.pathname as (typeof allowedLocations)[number]))
    return null

  return (
    <header className="z-10 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-12">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-medium text-primary/80">{headerTitle()}</h1>
          <p className="text-base font-normal text-primary/60">{headerDescription()}</p>
        </div>
      </div>
    </header>
  )
}
