/**
 * Dialog Component - shadcn API compatible wrapper for Catalyst Dialog
 *
 * NOW POWERED BY CATALYST UI
 *
 * Note: Catalyst Dialog is a controlled component (uses open/onClose props).
 * Some shadcn features like DialogTrigger require parent state management.
 */

import * as React from "react"
import {
  Dialog as CatalystDialog,
  DialogTitle as CatalystDialogTitle,
  DialogDescription as CatalystDialogDescription,
  DialogBody as CatalystDialogBody,
  DialogActions as CatalystDialogActions,
} from "../catalyst/dialog"
import { cn } from "lib/utils"

// Re-export Catalyst Dialog directly for new code
export {
  CatalystDialog,
  CatalystDialogTitle,
  CatalystDialogDescription,
  CatalystDialogBody,
  CatalystDialogActions,
}

// Context for Dialog state (for backward compatibility)
interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

/**
 * Dialog Root - Wrapper that provides open state
 * For Catalyst: pass open and onClose directly to Dialog
 */
interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

const Dialog: React.FC<DialogProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = React.useCallback((value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }, [isControlled, onOpenChange])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

/**
 * DialogTrigger - Opens the dialog when clicked
 */
interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const context = React.useContext(DialogContext)

    const handleClick = () => {
      context?.setOpen(true)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
      })
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)
DialogTrigger.displayName = "DialogTrigger"

/**
 * DialogClose - Closes the dialog when clicked
 */
const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const context = React.useContext(DialogContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context?.setOpen(false)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    })
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
DialogClose.displayName = "DialogClose"

/**
 * DialogContent - The actual dialog panel using Catalyst
 */
interface DialogContentProps {
  children: React.ReactNode
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
}

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
  size = "lg",
}) => {
  const context = React.useContext(DialogContext)

  if (!context) {
    console.warn("DialogContent must be used within a Dialog")
    return null
  }

  return (
    <CatalystDialog
      open={context.open}
      onClose={() => context.setOpen(false)}
      size={size}
      className={className}
    >
      {children}
    </CatalystDialog>
  )
}
DialogContent.displayName = "DialogContent"

/**
 * DialogHeader - Wrapper for title section
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * DialogFooter - Use DialogActions from Catalyst
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <CatalystDialogActions className={className} {...props} />
)
DialogFooter.displayName = "DialogFooter"

/**
 * DialogTitle - Uses Catalyst DialogTitle
 */
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CatalystDialogTitle className={className} {...props} />
))
DialogTitle.displayName = "DialogTitle"

/**
 * DialogDescription - Uses Catalyst DialogDescription
 */
const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CatalystDialogDescription className={className} {...props} />
))
DialogDescription.displayName = "DialogDescription"

/**
 * DialogBody - Alias for Catalyst DialogBody
 */
const DialogBody = CatalystDialogBody

// Legacy exports for backward compatibility (no-ops)
const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
const DialogOverlay: React.FC = () => null

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
}
