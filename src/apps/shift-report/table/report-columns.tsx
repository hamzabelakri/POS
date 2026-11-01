import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ShiftReportRow } from '@/models/shift-report-model'
import { IconCash, IconCreditCard } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/shared/data-table'

const paymentMethods: Record<string, { icon: any; variant: 'success' | 'secondary' }> = {
  cash: { icon: IconCash, variant: 'success' },
  card: { icon: IconCreditCard, variant: 'secondary' },
}

export const formatAmount = (value: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0)

// "2026-10-29 16:20:42.106814" -> "2026-10-29 16:20:42"
const formatEntryTime = (value?: string) => value?.split('.')[0] ?? '-'

export const useShiftReportColumns = (): ColumnDef<ShiftReportRow>[] => {
  const { t } = useTranslation()

  return useMemo<ColumnDef<ShiftReportRow>[]>(
    () => [
      {
        accessorKey: 'payment_id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('payment_id')} />
        ),
        meta: { label: t('payment_id') },
        cell: ({ row }) => <div className='w-fit'>{row.original.payment_id}</div>,
        enableHiding: false,
      },
      {
        accessorKey: 'payment_method',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('payment_method')} />
        ),
        meta: { label: t('payment_method') },
        cell: ({ row }) => {
          const method = row.original.payment_method
          const config = paymentMethods[method?.toLowerCase()]
          const Icon = config?.icon

          return (
            <Badge variant={config?.variant ?? 'secondary'} className='capitalize'>
              {Icon && <Icon className='size-3' />}
              {method || '-'}
            </Badge>
          )
        },
        filterFn: (row, id, value) => value.includes(row.original.payment_method),
      },
      {
        accessorKey: 'card_type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('card_type')} />
        ),
        meta: { label: t('card_type') },
        cell: ({ row }) => (
          <LongText className='max-w-36'>{row.original.card_type || '-'}</LongText>
        ),
      },
      {
        accessorKey: 'media',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('media')} />
        ),
        meta: { label: t('media') },
        // `media` is an object (empty in the sample); adapt once its shape is known.
        cell: ({ row }) => {
          const media = row.original.media
          const count = media ? Object.keys(media).length : 0
          return (
            <span className='text-muted-foreground text-sm'>
              {count > 0 ? count : '-'}
            </span>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'total',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('total')} />
        ),
        meta: { label: t('total') },
        cell: ({ row }) => (
          <div className='w-fit font-medium text-nowrap tabular-nums'>
            {formatAmount(row.original.total)}
          </div>
        ),
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
    ],
    [t]
  )
}