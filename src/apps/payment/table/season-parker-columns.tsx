import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/shared/data-table'
import { SeasonParker } from '@/models/season-parker-model'
import { useSeasonParkerExit } from '@/hooks/use-season-parker'

// "2026-10-28 00:00:00" -> "2026-10-28"
const formatDate = (value?: string) => value?.split(' ')[0] ?? '-'

// each row owns its mutation, so only the clicked button shows the spinner
function ProceedButton({
  parker,
  onSuccess,
}: {
  parker: SeasonParker
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { mutate, isPending } = useSeasonParkerExit({ onSuccess })

  return (
    <Button
      size='sm'
      disabled={isPending}
      onClick={() =>
        mutate({
          participant_id: parker.participant_id,
          company_id: parker.company_id,
        })
      }
    >
      {isPending && <Loader2 className='animate-spin' />}
      {t('proceed')}
    </Button>
  )
}

export const useSeasonParkerColumns = (
  onProceedSuccess: () => void
): ColumnDef<SeasonParker>[] => {
  const { t } = useTranslation()

  return useMemo<ColumnDef<SeasonParker>[]>(
    () => [
      {
        id: 'participant',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('participant')} />
        ),
        meta: { label: t('participant') },
        cell: ({ row }) => (
          <LongText className='max-w-48'>
            {`${row.original.participant_first_name} ${row.original.participant_last_name}`.trim() ||
              '-'}
          </LongText>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'card_number',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('card_number')} />
        ),
        meta: { label: t('card_number') },
        cell: ({ row }) => (
          <div className='w-fit font-medium'>
            {row.original.card_number || '-'}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'lpn',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('license_plate')} />
        ),
        meta: { label: t('license_plate') },
        cell: ({ row }) => (
          <LongText className='max-w-48'>
            {row.original.lpn?.join(', ') || '-'}
          </LongText>
        ),
        enableSorting: false,
      },
      {
        id: 'validity',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('validity')} />
        ),
        meta: { label: t('validity') },
        cell: ({ row }) => (
          <Badge variant='secondary' className='text-xs'>
            {formatDate(row.original.validity_start)} →{' '}
            {formatDate(row.original.validity_end)}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'blocked',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('status')} />
        ),
        meta: { label: t('status') },
        cell: ({ row }) =>
          row.original.blocked ? (
            <Badge variant='destructive' className='text-xs'>
              {t('blocked')}
            </Badge>
          ) : (
            <Badge variant='secondary' className='text-xs'>
              {t('active')}
            </Badge>
          ),
        enableSorting: false,
      },
      {
        accessorKey: 'epan',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('epan')} />
        ),
        meta: { label: t('epan') },
        cell: ({ row }) => (
          <LongText className='max-w-48'>{row.original.epan || '-'}</LongText>
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('actions')} />
        ),
        meta: { label: t('actions') },
        cell: ({ row }) => (
          <ProceedButton parker={row.original} onSuccess={onProceedSuccess} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t, onProceedSuccess]
  )
}