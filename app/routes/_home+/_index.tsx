import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { authenticator } from '#app/modules/auth/auth.server'
import { cn } from '#app/utils/misc'
import { useTheme } from '#app/utils/hooks/use-theme.js'
import { siteConfig } from '#app/utils/constants/brand'
import { ROUTE_PATH as LOGIN_PATH } from '#app/routes/auth+/login'
import { Button, buttonVariants } from '#app/components/ui/button'
import { ThemeSwitcherHome } from '#app/components/misc/theme-switcher'
import { Logo } from '#app/components/logo'
import ShadowPNG from '#public/images/shadow.png'

export const meta: MetaFunction = () => {
  return [{ title: siteConfig.siteTitle }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionUser = await authenticator.isAuthenticated(request)
  return json({ user: sessionUser } as const)
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()
  const theme = useTheme()

  return (
    <div className="relative flex h-full w-full flex-col bg-card">
      {/* Navigation */}
      <div className="sticky top-0 z-50 mx-auto flex w-full max-w-screen-lg items-center justify-between p-6 py-3">
        <Link to="/" prefetch="intent" className="flex h-10 items-center gap-1">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <Link to={LOGIN_PATH} className={buttonVariants({ size: 'sm' })}>
            {user ? 'Profiles' : 'Get Started'}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="z-10 mx-auto flex w-full max-w-screen-lg flex-grow flex-col gap-4 px-6">
        <div className="z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-12 md:p-24">
          <Button
            variant="outline"
            className={cn(
              'hidden h-8 rounded-full bg-white/40 px-3 text-sm font-bold backdrop-blur hover:text-primary dark:bg-secondary md:flex',
            )}>
            <span className="mr-1 flex items-center font-medium text-primary/60">
              Introducing
            </span>
            {siteConfig.siteTitle}
          </Button>
          <h1 className="text-center text-6xl font-bold leading-tight text-primary md:text-7xl lg:leading-tight">
            Create Your World
          </h1>
          <p className="max-w-screen-md text-center text-lg !leading-normal text-muted-foreground md:text-xl">
            Generate illustrated stories in minutes with a modern{' '}
            <span className="font-medium text-primary">easy-to-use tool</span>.
          </p>
          <div className="mt-2 flex w-full items-center justify-center gap-2">
            <Link
              to={LOGIN_PATH}
              className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:flex')}>
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 flex w-full flex-col items-center justify-center gap-8 py-6">
        <ThemeSwitcherHome />
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <p className="flex items-center whitespace-nowrap text-center text-sm font-medium text-primary/60">
            Built by&nbsp;
            <a
              href="https://github.com/lachlanmacphees"
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-primary hover:text-primary hover:underline">
              INSEAD Team #
            </a>
          </p>
          <p className="flex items-center whitespace-nowrap text-center text-sm font-medium text-primary/60">
            Source code available on&nbsp;{' '}
            <a
              href="https://github.com/lachlanmacphee/creative-kidz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:text-primary hover:underline">
              GitHub.
            </a>
          </p>
        </div>
      </footer>

      {/* Background */}
      <img
        src={ShadowPNG}
        alt="Hero"
        className={`fixed left-0 top-0 z-0 h-full w-full opacity-60 ${theme === 'dark' ? 'invert' : ''}`}
      />
      <div className="base-grid fixed h-screen w-screen opacity-40" />
      <div className="fixed bottom-0 h-screen w-screen bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
    </div>
  )
}
