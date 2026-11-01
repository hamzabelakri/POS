import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { StartShift } from '@/apps/auth/start-shift'
import { isPosConfigured } from '@/stores/pos-config-store'
import { useAuthStore } from '@/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/start-shift')({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (!isPosConfigured()) {
      throw redirect({ to: '/pos-setup' })
    }

    const { token, hasOpenShift } = useAuthStore.getState()

    // Must be signed in first.
    if (!token) {
      throw redirect({ to: '/sign-in', search: { redirect: search.redirect } })
    }

    // A shift is already open: no need to start one.
    if (hasOpenShift) {
      throw redirect({ to: '/' })
    }
  },
  component: StartShift,
})