import { Payment } from '@/apps/payment'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: Payment,
})
