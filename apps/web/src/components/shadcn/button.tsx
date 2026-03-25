import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "lib/utils"

/**
 * ============================================================
 * Button Variants - TIER Golf Design System v3.1
 * ============================================================
 *
 * Fargehierarki:
 * - default (gold)  → Primær handling: Lagre, Send, Logg
 * - destructive     → Destruktiv: Slett, Fjern
 * - outline         → Sekundær: Avbryt, Tilbake
 * - secondary       → Tertiær: Alternativ handling
 * - ghost           → Minimal: Ikoner, subtle actions
 * - link            → Tekst-lenke
 * - success         → Bekreftelse: Fullført, Godkjent
 * - info            → Informasjon: Les mer, Detaljer
 *
 * ============================================================
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primær handling - Gull (CTA, lagre, send, logg)
        // Uses navy text for better contrast with gold background
        default:
          "bg-tier-gold text-tier-navy shadow-sm hover:bg-tier-gold-dark hover:shadow-md focus-visible:ring-tier-gold active:scale-[0.98]",

        // Destruktiv - Rød (slett, fjern, avbryt farlig)
        destructive:
          "bg-status-error text-tier-white shadow-sm hover:bg-status-error/90 focus-visible:ring-status-error",

        // Sekundær - Navy outline (avbryt, tilbake, sekundær handling)
        outline:
          "border-2 border-tier-navy bg-transparent text-tier-navy hover:bg-tier-navy hover:text-tier-white focus-visible:ring-tier-navy",

        // Tertiær - Grå bakgrunn (mindre viktige handlinger)
        secondary:
          "bg-tier-surface-secondary text-tier-text-primary border border-tier-border-subtle hover:bg-tier-surface-tertiary focus-visible:ring-tier-navy/50",

        // Ghost - Transparent (ikoner, subtle)
        ghost:
          "text-tier-text-secondary hover:bg-tier-surface-secondary hover:text-tier-text-primary focus-visible:ring-tier-navy/30",

        // Link - Tekst-lenke stil
        link:
          "text-tier-navy underline-offset-4 hover:underline focus-visible:ring-tier-navy/30 h-auto p-0",

        // Suksess - Grønn (bekreftelse, fullført)
        success:
          "bg-status-success text-tier-white shadow-sm hover:bg-status-success/90 focus-visible:ring-status-success",

        // Info - Blå (informasjon, les mer)
        info:
          "bg-status-info text-tier-white shadow-sm hover:bg-status-info/90 focus-visible:ring-status-info",

        // Warning - Oransje (advarsel)
        // Uses navy text for better contrast with amber background
        warning:
          "bg-status-warning text-tier-navy shadow-sm hover:bg-status-warning/90 focus-visible:ring-status-warning",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
