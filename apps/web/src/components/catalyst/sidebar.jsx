'use client'

/**
 * Sidebar components with TIER Golf Blue Palette
 *
 * Uses Tailwind classes mapped to CSS variables in tailwind.config.js:
 * - bg-ak-primary → var(--accent)
 * - bg-ak-primary-light → var(--accent-hover)
 * - bg-ak-gold → var(--achievement)
 */

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { LayoutGroup, motion } from 'motion/react'
import React, { forwardRef, useId } from 'react'
import { TouchTarget } from './button'
import { Link } from './link'
import { SubSectionTitle } from '../typography'

export function Sidebar({ className, ...props }) {
  return <nav {...props} className={clsx(className, 'flex h-full min-h-0 flex-col bg-tier-navy')} />
}

export function SidebarHeader({ className, ...props }) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-b border-white/10 p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarBody({ className, ...props }) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8'
      )}
    />
  )
}

export function SidebarFooter({ className, ...props }) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-t border-white/10 p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarSection({ className, ...props }) {
  let id = useId()

  return (
    <LayoutGroup id={id}>
      <div {...props} data-slot="section" className={clsx(className, 'flex flex-col gap-0.5')} />
    </LayoutGroup>
  )
}

export function SidebarDivider({ className, ...props }) {
  return <hr {...props} className={clsx(className, 'my-4 border-t border-white/10 lg:-mx-4')} />
}

export function SidebarSpacer({ className, ...props }) {
  return <div aria-hidden="true" {...props} className={clsx(className, 'mt-8 flex-1')} />
}

export function SidebarHeading({ className, children, ...props }) {
  return (
    <SubSectionTitle {...props} className={clsx(className, 'mb-1 px-2 text-xs/6 font-medium text-white/60')}>
      {children}
    </SubSectionTitle>
  )
}

export const SidebarItem = forwardRef(function SidebarItem(
  { current, className, children, ...props },

  ref
) {
  let classes = clsx(
    // Base - white text on navy sidebar
    'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-white sm:py-2 sm:text-sm/5',
    // Leading icon
    '*:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-white sm:*:data-[slot=icon]:size-5',
    // Trailing icon (down chevron or similar)
    '*:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4',
    // Avatar
    '*:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 sm:*:data-[slot=avatar]:size-6',
    // Hover - gold highlight
    'data-hover:bg-tier-navy-light data-hover:text-tier-gold data-hover:*:data-[slot=icon]:text-tier-gold',
    // Active
    'data-active:bg-tier-navy-light data-active:text-tier-gold data-active:*:data-[slot=icon]:text-tier-gold',
    // Current - full gold
    'data-current:bg-tier-navy-light data-current:text-tier-gold data-current:*:data-[slot=icon]:text-tier-gold'
  )

  return (
    <span className={clsx(className, 'relative')}>
      {current && (
        <motion.span
          layoutId="current-indicator"
          className="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-tier-gold"
        />
      )}
      {typeof props.href === 'string' ? (
        <Headless.CloseButton
          as={Link}
          {...props}
          className={classes}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.CloseButton>
      ) : (
        <Headless.Button
          {...props}
          className={clsx('cursor-default', classes)}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.Button>
      )}
    </span>
  )
})

export function SidebarLabel({ className, ...props }) {
  return <span {...props} className={clsx(className, 'truncate')} />
}
