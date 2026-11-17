import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthLayout } from '@/apps/auth/auth-layout'

export const Route = createFileRoute('/(auth)')({
  component: AuthRouteLayout,
})

function AuthRouteLayout() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}