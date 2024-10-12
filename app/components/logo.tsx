import { cn } from '#app/utils/misc.js'

type LogoProps = {
  width?: number
  height?: number
  className?: string
  [key: string]: unknown | undefined
}

export function Logo({ width, height, className, ...args }: LogoProps) {
  return (
    <img
      src="/images/logo.png"
      alt="logo"
      width={width ?? 60}
      height={height ?? 60}
      className={cn(`text-primary ${className}`)}
    />
  )
}
