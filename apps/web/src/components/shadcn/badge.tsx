import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-ak-primary text-white shadow",
        secondary:
          "border-transparent bg-ak-snow text-text-primary",
        destructive:
          "border-transparent bg-ak-error text-white shadow",
        success:
          "border-transparent bg-ak-success text-white shadow",
        warning:
          "border-transparent bg-ak-warning text-white shadow",
        outline:
          "text-text-primary border-border-default",
        // Golf-specific variants
        categoryA:
          "border-transparent bg-ak-success/10 text-ak-success",
        categoryB:
          "border-transparent bg-ak-primary/10 text-ak-primary",
        categoryC:
          "border-transparent bg-ak-warning/10 text-ak-warning",
        categoryD:
          "border-transparent bg-ak-steel/10 text-ak-steel",
        // Training category variants
        fysisk:
          "border-transparent bg-category-fys-muted text-category-fys",
        teknikk:
          "border-transparent bg-category-tek-muted text-category-tek",
        slag:
          "border-transparent bg-category-slag-muted text-category-slag",
        spill:
          "border-transparent bg-category-spill-muted text-category-spill",
        turnering:
          "border-transparent bg-category-turn-muted text-category-turn",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
