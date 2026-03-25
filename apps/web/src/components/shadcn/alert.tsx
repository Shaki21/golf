import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-white text-text-primary border-border-default",
        info: "bg-ak-primary/5 text-ak-primary border-ak-primary/20 [&>svg]:text-ak-primary",
        success: "bg-ak-success/5 text-ak-success border-ak-success/20 [&>svg]:text-ak-success",
        warning: "bg-ak-warning/5 text-ak-warning border-ak-warning/20 [&>svg]:text-ak-warning",
        destructive: "bg-ak-error/5 text-ak-error border-ak-error/20 [&>svg]:text-ak-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertIcons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, onClose, ...props }, ref) => {
    const Icon = alertIcons[variant || "default"]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Lukk</span>
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="heading"
    aria-level={5}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
