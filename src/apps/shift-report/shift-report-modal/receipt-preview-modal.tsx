// src/apps/shift-report/shift-report-modal/receipt-preview-modal.tsx
import { IconFileDescription } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { usePaymentReceiptPreview } from '@/hooks/use-printer'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toImageSrc } from '@/lib/utils'
import { ReceiptEmptyState } from './receipt-empty-state'
import { ReceiptViewer } from './receipt-viewer'

export function ReceiptPreviewModal({
  paymentId,
  open,
  onOpenChange,
}: {
  paymentId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  // Assumes a TanStack Query hook (refetch / isFetching). If yours doesn't
  // expose them, drop `onRetry` and `retrying` below.
  const {
    data: receipt,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePaymentReceiptPreview(paymentId ?? 0, open && paymentId !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader icon={IconFileDescription}>
          <DialogTitle>{t('receipt')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <ReceiptEmptyState variant='loading' />
          ) : isError ? (
            <ReceiptEmptyState
              variant='error'
              onRetry={() => refetch()}
              retrying={isFetching}
            />
          ) : receipt ? (
            // key resets zoom + load state when another receipt is opened
            <ReceiptViewer
              key={paymentId}
              src={toImageSrc(receipt)}
              alt={t('receipt')}
            />
          ) : (
            <ReceiptEmptyState variant='empty' />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}