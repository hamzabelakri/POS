import { Configuration } from '@/apps/config'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/config/')({
  component: Configuration,
})


