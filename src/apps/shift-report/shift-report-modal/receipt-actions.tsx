// src/apps/shift-report/table/receipt-actions.tsx
import {
  IconEye,
  IconLoader2,
  IconPrinter,
  IconPrinterOff,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { usePrintReceipt } from '@/hooks/use-printer'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const tip = {
  colorClass: 'bg-primary text-primary-foreground',
  arrowClass: 'bg-primary fill-primary',
}

interface ReceiptActionsProps {
  paymentId: number
  /** true when printing is not allowed right now (not evaluated / printer blocked) */
  printDisabled: boolean
  /** tooltip text explaining why print is disabled */
  disabledReason?: string
  onPreview: () => void
}

export function ReceiptActions({
  paymentId,
  printDisabled,
  disabledReason,
  onPreview,
}: ReceiptActionsProps) {
  const { t } = useTranslation()
  // Per-row mutation: only the clicked row shows the spinner
  const print = usePrintReceipt()

  const printLabel = t('print', { defaultValue: 'Print' })
  const disabledText = disabledReason ?? t('printer_disabled_tooltip')

  return (
    <div className='flex items-center justify-end gap-2'>
      {/* Preview — round, quiet icon button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            aria-label={t('preview_receipt_tooltip')}
            className='text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary size-8 rounded-full shadow-none transition-colors'
            onClick={onPreview}
          >
            <IconEye size={16} aria-hidden='true' />
          </Button>
        </TooltipTrigger>
        <TooltipContent {...tip}>{t('preview_receipt_tooltip')}</TooltipContent>
      </Tooltip>

      {/* Print — solid primary pill, the one action that stands out */}
      {printDisabled ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span keeps the tooltip working: disabled buttons swallow pointer events */}
            <span tabIndex={0} className='inline-flex cursor-not-allowed'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled
                aria-label={disabledText}
                className='text-muted-foreground h-8 gap-1.5 rounded-full border-dashed px-3 text-xs shadow-none'
              >
                <IconPrinterOff size={15} aria-hidden='true' />
                <span className='hidden md:inline'>{printLabel}</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent {...tip}>{disabledText}</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              size='sm'
              disabled={print.isPending}
              aria-busy={print.isPending}
              aria-label={t('print_receipt_tooltip')}
              className='h-8 gap-1.5 rounded-full px-3 text-xs font-medium shadow-sm transition-all hover:shadow-md active:scale-95'
              onClick={() => print.mutate(paymentId)}
            >
              {print.isPending ? (
                <IconLoader2
                  size={15}
                  className='motion-safe:animate-spin'
                  aria-hidden='true'
                />
              ) : (
                <IconPrinter size={15} aria-hidden='true' />
              )}
              <span className='hidden md:inline'>{printLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent {...tip}>{t('print_receipt_tooltip')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}