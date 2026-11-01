import { ShiftReport } from '@/apps/shift-report'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/shift-report/')({
  component: ShiftReport,
})


