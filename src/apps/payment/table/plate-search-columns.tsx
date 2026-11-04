import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/shared/data-table'
import { PlateSearchCar } from '@/models/consult-model'
import { useProceedConsult } from '@/hooks/use-consult'

// "2026-09-01 08:22:04" (drops fractional seconds if the API ever sends them)
const formatEntryTime = (value?: string) => value?.split('.')[0] ?? '-'

// each row owns its mutation, so only the clicked button shows the spinner
function ProceedButton({
  car,
  onSuccess,
}: {
  car: PlateSearchCar
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { mutate, isPending } = useProceedConsult({ onSuccess })

  return (
    <Button
      size='sm'
      disabled={isPending}
      onClick={() =>
        mutate({
          media: { lpn: car.license_plate },
          image_id: car.image_id,
          entry_time: car.entry_time,
        })
      }
    >
      {isPending && <Loader2 className='animate-spin' />}
      {t('proceed')}
    </Button>
  )
}

export const usePlateSearchColumns = (
  onProceedSuccess: () => void
): ColumnDef<PlateSearchCar>[] => {
  const { t } = useTranslation()

  return useMemo<ColumnDef<PlateSearchCar>[]>(
    () => [
      {
        accessorKey: 'license_plate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('license_plate')} />
        ),
        meta: { label: t('license_plate') },
        cell: ({ row }) => (
          <div className='w-fit font-medium'>{row.original.license_plate}</div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'external_unique_id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('epan')} />
        ),
        meta: { label: t('epan') },
        cell: ({ row }) => (
          <LongText className='max-w-48'>
            {row.original.external_unique_id || '-'}
          </LongText>
        ),
        enableSorting: false,
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
        enableSorting: false,
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
        enableSorting: false,
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('actions')} />
        ),
        meta: { label: t('actions') },
        cell: ({ row }) => (
          <ProceedButton car={row.original} onSuccess={onProceedSuccess} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t, onProceedSuccess]
  )
}