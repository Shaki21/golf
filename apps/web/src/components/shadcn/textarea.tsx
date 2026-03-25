import * as React from "react"
import { cn } from "lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ak-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
