import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/apps/auth/sign-in'
import { isPosConfigured } from '@/stores/pos-config-store'
import { useAuthStore } from '@/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    // The terminal must be configured before anyone can sign in.
    if (!isPosConfigured()) {
      throw redirect({ to: '/pos-setup' })
    }

    const { token, hasOpenShift } = useAuthStore.getState()

    // Signed in with an open shift: nothing to do here.
    if (token && hasOpenShift) {
      throw redirect({ to: '/' })
    }

    // Signed in but no shift yet: continue where the user left off.
    if (token) {
      throw redirect({ to: '/start-shift', search: { redirect: search.redirect } })
    }
  },
  component: SignIn,
})