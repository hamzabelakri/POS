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

// Shared look for both halves of the segmented control
const segment =
  'h-full gap-1.5 rounded-none border-0 px-2.5 text-xs font-medium shadow-none'

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

  return (
    <div className='bg-background inline-flex h-8 items-stretch divide-x overflow-hidden rounded-lg border shadow-xs'>
      {/* Preview */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            aria-label={t('preview_receipt_tooltip')}
            className={`${segment} text-muted-foreground hover:bg-muted hover:text-foreground`}
            onClick={onPreview}
          >
            <IconEye size={15} aria-hidden='true' />
            <span className='hidden lg:inline'>
              {t('preview', { defaultValue: 'Preview' })}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent {...tip}>{t('preview_receipt_tooltip')}</TooltipContent>
      </Tooltip>

      {/* Print */}
      {printDisabled ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span keeps the tooltip working: disabled buttons swallow pointer events */}
            <span tabIndex={0} className='inline-flex cursor-not-allowed'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled
                aria-label={disabledReason ?? t('printer_disabled_tooltip')}
                className={`${segment} bg-muted/50 text-muted-foreground opacity-60`}
              >
                <IconPrinterOff size={15} aria-hidden='true' />
                <span className='hidden lg:inline'>
                  {t('print', { defaultValue: 'Print' })}
                </span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent {...tip}>
            {disabledReason ?? t('printer_disabled_tooltip')}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={print.isPending}
              aria-busy={print.isPending}
              aria-label={t('print_receipt_tooltip')}
              className={`${segment} text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary`}
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
              <span className='hidden lg:inline'>
                {t('print', { defaultValue: 'Print' })}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent {...tip}>{t('print_receipt_tooltip')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}