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
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { toImageSrc } from '@/lib/utils'

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

  const {
    data: receipt,
    isLoading,
    isError,
  } = usePaymentReceiptPreview(paymentId ?? 0, open && paymentId !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader icon={IconFileDescription}>
          <DialogTitle>{t('receipt')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className='flex max-h-[50vh] min-h-32 items-center justify-center overflow-auto'>
            {isLoading ? (
              <Spinner variant='circle' />
            ) : isError ? (
              <p className='text-destructive text-sm'>
                {t('receipt_load_failed')}
              </p>
            ) : receipt ? (
              <img
                src={toImageSrc(receipt)}
                alt={t('receipt')}
                className='h-auto max-h-[50vh] w-60 object-contain'
              />
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('receipt_not_available')}
              </p>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}