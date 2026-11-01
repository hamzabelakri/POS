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
  
  component: AuthenticatedLayout,
})