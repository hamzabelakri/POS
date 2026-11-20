// src/apps/payment/modals/season-parker-modal.tsx
import { useMemo, useState } from 'react'
import { IconId } from '@tabler/icons-react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LpnInput } from '@/components/ui/input-otp'
import { DataTable } from '@/components/shared/data-table'

import { useSeasonParkerColumns } from '../table/season-parker-columns'
import { useSeasonParkerSearch } from '@/hooks/use-season-parker'
import { buildSeasonParkerParams } from '@/service/season-parker'
import { normalizePlate } from '@/service/consult'
import type { PaginationMetadata } from '@/models/api'

const toUpper = (s: string) => s.toUpperCase()

type Props = {
  onClose: () => void
  title?: string
}

export function SeasonParkerModal({ onClose, title }: Props) {
  const { t } = useTranslation()
  const [plate, setPlate] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  // starts with an empty search so the first page is listed on open
  const [queryParams, setQueryParams] = useState(() =>
    buildSeasonParkerParams('', '')
  )

  // `res` is the envelope: { status, message, data: SeasonParkerSearchData }
  const { data: res, isLoading } = useSeasonParkerSearch(queryParams)
  // a successful Proceed closes the modal
  const columns = useSeasonParkerColumns(onClose)
  const result = res?.data
  const parkers = useMemo(() => result?.season_parkers ?? [], [result])

  // the API has no `total_rows`, so it is approximated for the table's pagination
  const pagination: PaginationMetadata | undefined = result && {
    current_page: result.current_page,
    page_size: result.page_size,
    total_pages: result.total_pages,
    total_rows: result.total_pages * result.page_size,
  }

  const runSearch = () =>
    setQueryParams(buildSeasonParkerParams(plate, cardNumber, 1))

  // the table's pagination sends partial params (e.g. { page }): merge into the last search
  const handleTableParams = (params: Record<string, any>) =>
    setQueryParams((prev) => ({ ...prev, ...params }))

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='sm:max-w-6xl'>
        <DialogHeader icon={IconId}>
          <DialogTitle>{title ?? t('season_parker')}</DialogTitle>
        </DialogHeader>

        {/* p-0 so the DataTable card becomes the single visual surface.
            DialogBody is already the flex-1 overflow-y-auto scroller. */}
        <DialogBody className='p-0'>
          <DataTable
            data={parkers}
            columns={columns}
            showToolbar={false}
            isLoading={isLoading}
            queryParams={queryParams}
            setQueryParams={handleTableParams}
            pagination={pagination}
            // strip the card chrome so it merges into the dialog surface
            className='rounded-none border-0 shadow-none'
            header={
              <div className='border-b px-6 py-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <LpnInput
                      value={plate}
                      onChange={setPlate}
                      sanitize={toUpper}
                    />
                    <div className='flex h-9 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border px-2 font-mono text-sm tracking-widest'>
                      <span className='truncate'>
                        {normalizePlate(plate) || '- - -'}
                      </span>
                    </div>
                  </div>

                  <Input
                    value={cardNumber}
                    className='w-44'
                    placeholder={t('card_number')}
                    aria-label={t('card_number')}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />

                  <Button className='min-w-24 flex-1' onClick={runSearch}>
                    <Search />
                    {t('search')}
                  </Button>
                </div>
              </div>
            }
          />
        </DialogBody>

        <DialogFooter>
          <Button
            type='button'
            variant='ghost'
            onClick={onClose}
            className='text-muted-foreground'
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}