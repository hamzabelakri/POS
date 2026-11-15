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

// The API doesn't say whether `receipt` is a URL, a data URI or raw base64.
// This handles all three; adjust once you confirm the format (and the image type).
const toImageSrc = (receipt: string) => {
  if (/^(data:|https?:\/\/|\/)/.test(receipt)) return receipt
  return `data:image/png;base64,${receipt}`
}

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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader icon={IconFileDescription}>
          <DialogTitle>{t('receipt')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className='flex max-h-[70vh] min-h-40 items-center justify-center overflow-auto'>
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
                className='h-auto max-w-full'
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