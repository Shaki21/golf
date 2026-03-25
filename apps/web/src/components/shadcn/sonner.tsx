import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-text-primary group-[.toaster]:border-border-subtle group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-secondary",
          actionButton:
            "group-[.toast]:bg-ak-primary group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-ak-snow group-[.toast]:text-text-secondary",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-ak-success",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-ak-error",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-ak-warning",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-ak-primary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

// Re-export toast function for convenience
export { toast } from "sonner"
