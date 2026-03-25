import * as React from "react"
import { cn } from "lib/utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "xs" | "sm" | "md" | "lg" | "xl"
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, ...props }, ref) => {
  // Don't render if src is empty/undefined to avoid showing alt text
  if (!src) return null;

  return (
    <img
      ref={ref}
      src={src}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-ak-primary/10 text-ak-primary font-semibold",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
