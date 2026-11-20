import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { PlateSearchDetail } from '@/models/consult-model'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProceedConsult } from '@/hooks/use-consult'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/shared/data-table'
import type { VariantProps } from 'class-variance-authority'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

// "2026-09-01 08:22:04" (drops fractional seconds if the API ever sends them)
const formatEntryTime = (value?: string) => value?.split('.')[0] ?? '-'

const CARD_TYPE_BADGE_VARIANT: Record<string, BadgeVariant> = {
  'Short Term Parker': 'success',
  'Reservation Parker': 'info',
  Unknown: 'warning',
}

const getCardTypeBadgeVariant = (cardType?: string): BadgeVariant => {
  if (!cardType) return 'outline'
  return CARD_TYPE_BADGE_VARIANT[cardType] ?? 'outline'
}

// each row owns its mutation, so only the clicked button shows the spinner
function ProceedButton({
  car,
  onSuccess,
}: {
  car: PlateSearchDetail
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
): ColumnDef<PlateSearchDetail>[] => {
  const { t } = useTranslation()

  return useMemo<ColumnDef<PlateSearchDetail>[]>(
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
            {row.original.external_unique_id}
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
        cell: ({ row }) => {
          const cardType = row.original.card_type
          const variant = getCardTypeBadgeVariant(cardType)

          return (
            <Badge variant={variant} className='max-w-36 text-xs'>
              <LongText>{cardType || '-'}</LongText>
            </Badge>
          )
        },
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
          <DataTableColumnHeader
            column={column}
            title={t('actions')}
            className='flex justify-end'
          />
        ),
        meta: { label: t('actions') },
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <ProceedButton car={row.original} onSuccess={onProceedSuccess} />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t, onProceedSuccess]
  )
}