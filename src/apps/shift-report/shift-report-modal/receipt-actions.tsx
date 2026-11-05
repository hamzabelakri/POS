import { useState } from 'react'
import { IconEye, IconPrinter, IconReceipt2 } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { usePaymentReceiptPreview, usePrintReceipt } from '@/hooks/use-printer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { usePrinterUi } from '@/stores/printer-store'

// The API doesn't say whether `receipt` is a URL, a data URI or raw base64.
// This handles all three; adjust once you confirm the format (and the image type).
const toImageSrc = (receipt: string) => {
  if (/^(data:|https?:\/\/|\/)/.test(receipt)) return receipt
  return `data:image/png;base64,${receipt}`
}

export function ReceiptActions({ paymentId }: { paymentId: number }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const isEvaluated = useEvaluationStore((s) => s.isEvaluated)
  const printerUi = usePrinterUi()
  const print = usePrintReceipt() 

  const {
    data: receipt,
    isLoading,
    isError,
  } = usePaymentReceiptPreview(paymentId, open)

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setOpen(true)}
        >
          <IconEye className='size-4' />
          {t('preview')}
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={!isEvaluated || printerUi.blocked || print.isPending}
          onClick={() => print.mutate(paymentId)}
        >
          <IconPrinter className='size-4' />
          {printerUi.blocked ? printerUi.label : t('print')}
        </Button>
      </div>

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