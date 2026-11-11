import { ShiftReportDialogEnum } from '@/models/shift-report-model'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { useShiftReportStore } from '@/stores/shift-report-store'
import { EvaluationModal } from '@/components/shared/modal/evaluation-modal'

export function ShiftReportModals() {
  const { open, setOpen } = useShiftReportStore()
  const setEvaluated = useEvaluationStore((s) => s.setEvaluated)

  const handleCloseModal = () => setOpen(null)

  return (
    <EvaluationModal
      type='shift'
      open={open === ShiftReportDialogEnum.EVALUATION}
      onClose={handleCloseModal}
      onSuccess={() => setEvaluated(true)}
    />
  )
}
