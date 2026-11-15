import { ShiftReportDialogEnum } from '@/models/shift-report-model'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { useShiftReportStore } from '@/stores/shift-report-store'
import { EvaluationModal } from '@/components/shared/modal/evaluation-modal'
import { ReceiptPreviewModal } from './receipt-preview-modal'

export function ShiftReportModals() {
  const { open, setOpen, currentPaymentId, setCurrentPaymentId } =
    useShiftReportStore()
  const setEvaluated = useEvaluationStore((s) => s.setEvaluated)

  const handleClose = () => {
    setOpen(null)
    setCurrentPaymentId(null)
  }

  return (
    <>
      <EvaluationModal
        type='shift'
        open={open === ShiftReportDialogEnum.EVALUATION}
        onClose={handleClose}
        onSuccess={() => setEvaluated(true)}
      />

      <ReceiptPreviewModal
        paymentId={currentPaymentId}
        open={open === ShiftReportDialogEnum.RECEIPT}
        onOpenChange={(next) => {
          if (!next) handleClose()
        }}
      />
    </>
  )
}