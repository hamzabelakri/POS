import { useState } from 'react'
import { IconEye, IconReceipt2 } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { usePaymentReceiptPreview } from '@/hooks/use-receipt-preview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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

export function ReceiptPreviewButton({ paymentId }: { paymentId: number }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const isEvaluated = useEvaluationStore((s) => s.isEvaluated)
  const {
    data: receipt,
    isLoading,
    isError,
  } = usePaymentReceiptPreview(paymentId, open)

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={!isEvaluated}
        onClick={() => setOpen(true)}
      >
        <IconEye className='size-4' />
        {t('preview')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader className='border-b pb-3'>
            <DialogTitle className='flex items-center gap-2'>
              <div className='bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <IconReceipt2 className='size-5' />
              </div>
              {t('receipt')} #{paymentId}
            </DialogTitle>
          </DialogHeader>

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
                alt={`${t('receipt')} #${paymentId}`}
                className='h-auto max-w-full'
              />
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('receipt_not_available')}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
