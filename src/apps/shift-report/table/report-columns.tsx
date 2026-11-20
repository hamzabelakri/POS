import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  ShiftReportRow,
  ShiftReportDialogEnum,
} from '@/models/shift-report-model'
import { IconEye, IconPrinter, IconPrinterOff } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useEvaluationStore } from '@/stores/evaluation-store'
import { usePrinterUi } from '@/stores/printer-store'
import { useShiftReportStore } from '@/stores/shift-report-store'
import { formatAmount } from '@/lib/utils'
import { usePrintReceipt } from '@/hooks/use-printer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/shared/data-table'
import { ReceiptActions } from '../shift-report-modal/receipt-actions'

// "2026-10-29 16:20:42.106814" -> "2026-10-29 16:20:42"
const formatEntryTime = (value?: string) => value?.split('.')[0] ?? '-'

// "NEWLPN" -> "N E W L P N"
const formatLpn = (value?: string) => (value ? value.split('').join(' ') : '-')

export const useShiftReportColumns = (): ColumnDef<ShiftReportRow>[] => {
  const { t } = useTranslation()
  const { setOpen, setCurrentPaymentId } = useShiftReportStore()
  const isEvaluated = useEvaluationStore((s) => s.isEvaluated)
  const printerUi = usePrinterUi()
  const print = usePrintReceipt()

  return useMemo<ColumnDef<ShiftReportRow>[]>(
    () => [
      {
        accessorKey: 'card_type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('card_type')} />
        ),
        meta: { label: t('card_type') },
        cell: ({ row }) => (
          <div className='w-fit capitalize'>{t(row.original.card_type)}</div>
        ),
      },
      {
        id: 'lpn',
        accessorFn: (row) => row.media?.lpn,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('lpn')} />
        ),
        meta: { label: t('lpn') },
        cell: ({ row }) => {
          const lpn = row.original.media?.lpn
          if (!lpn) return null

          return (
            <Badge variant='outline' className='font-mono whitespace-nowrap'>
              {formatLpn(lpn)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'total',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('total')} />
        ),
        meta: { label: t('total') },
        cell: ({ row }) => (
          <div className='text-success w-fit font-mono font-bold text-nowrap slashed-zero tabular-nums'>
            {formatAmount(row.original.total)}
          </div>
        ),
      },
      {
        accessorKey: 'payment_method',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('payment_method')} />
        ),
        meta: { label: t('payment_method') },
        cell: ({ row }) => (
          <div className='w-fit capitalize'>{row.original.payment_method}</div>
        ),
        filterFn: (row, id, value) =>
          value.includes(row.original.payment_method),
      },
      {
        accessorKey: 'entry_time',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('entry_time')} />
        ),
        meta: { label: t('entry_time') },
        cell: ({ row }) => (
          <Badge variant='secondary' className='max-w-44 text-xs'>
            <LongText>{formatEntryTime(row.original.entry_time)}</LongText>
          </Badge>
        ),
      },
      {
        id: 'receipt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('receipt')}
            className='flex justify-end'
          />
        ),
        meta: { label: t('receipt') },
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <ReceiptActions
              paymentId={row.original.payment_id}
              printDisabled={!isEvaluated || printerUi.blocked}
              disabledReason={
                printerUi.blocked
                  ? printerUi.label
                  : t('printer_disabled_tooltip')
              }
              onPreview={() => {
                setCurrentPaymentId(row.original.payment_id)
                setOpen(ShiftReportDialogEnum.RECEIPT)
              }}
            />
          </div>
        ),
      },
    ],
    [
      t,
      setOpen,
      setCurrentPaymentId,
      isEvaluated,
      printerUi.blocked,
      printerUi.label,
      print,
    ]
  )
}
