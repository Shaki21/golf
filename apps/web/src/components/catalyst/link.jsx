/**
 * Link component integrated with React Router
 */

import * as Headless from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export const Link = forwardRef(function Link({ href, ...props }, ref) {
  return (
    <Headless.DataInteractive>
      <RouterLink to={href} {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
