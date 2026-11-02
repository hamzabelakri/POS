import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { isPosConfigured } from '@/stores/pos-config-store'

// App flow, checked in this order on every protected navigation:
//   1. POS not configured   -> /pos-setup
//   2. Not signed in        -> /sign-in
//   3. No open shift        -> /start-shift
//   4. Otherwise            -> allowed through (main page)
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (!isPosConfigured()) {
      throw redirect({ to: '/pos-setup' })
    }

    const { token, hasOpenShift } = useAuthStore.getState()

    if (!token) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }

    if (!hasOpenShift) {
      throw redirect({ to: '/start-shift', search: { redirect: location.href } })
    }
  },
  component: AuthenticatedLayout,
})