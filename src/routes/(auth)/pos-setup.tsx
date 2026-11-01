import PosSetup from '@/apps/setup/pos-setup'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/pos-setup')({
  component: PosSetup,
})