import { useMemo, useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { IconSearch } from '@tabler/icons-react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { LpnInput } from '@/components/ui/input-otp'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'

import { usePosConfigStore } from '@/stores/pos-config-store'
import { usePlateSearchColumns } from '../table/plate-search-columns'
import { PlateSearchQueryParams } from '@/models/consult-model'
import { usePlateSearch, useUntrackedConsult } from '@/hooks/use-consult'
import { buildPlateSearchParams, normalizePlate } from '@/service/consult'

// Radix Select forbids value="" on an item, so "All" uses a sentinel
const ALL_LANES = 'all'

const toUpper = (s: string) => s.toUpperCase()

type Props = {
  onClose: () => void
  initialPlate: string
  initialRange: DateRange | undefined
  initialParams: PlateSearchQueryParams
}

export function PlateSearchModal({
  onClose,
  initialPlate,
  initialRange,
  initialParams,
}: Props) {
  const { t } = useTranslation()
  const [plate, setPlate] = useState(initialPlate)
  const [range, setRange] = useState(initialRange)
  const [laneId, setLaneId] = useState<string | undefined>()
  // same params as the parent's request, so the first render is served from the cache
  const [queryParams, setQueryParams] = useState(initialParams)

  // `?? []` stays outside the selector so it doesn't return a new array each render
  const cameras = usePosConfigStore((s) => s.config?.cameras) ?? []

  const { data, isLoading, isError } = usePlateSearch(queryParams)
  const untracked = useUntrackedConsult()

  // a successful Proceed closes the modal
  const columns = usePlateSearchColumns(onClose)
  const cars = useMemo(() => data?.data.cars ?? [], [data])

  // the API has no `total_rows`, so it is approximated for the table's pagination
  const pagination = data?.data && {
    ...data.data,
    total_rows: data.data.total_pages * data.data.page_size,
  }

  // A finished search for a plate that found nothing
  const searchedPlate = queryParams.license_plate
  const noResults = !!data && !isLoading && !isError && cars.length === 0

  // Closing without a result: register the plate as untracked.
  // A successful Proceed closes through `onClose` directly (cars is not empty then).
  const handleClose = () => {
    if (noResults && searchedPlate) {
      untracked.mutate({ lpn: searchedPlate })
    }
    onClose()
  }

  const runSearch = () =>
    setQueryParams(buildPlateSearchParams(plate, range, 1, laneId))

  // the table's pagination sends partial params (e.g. { page }): merge into the last search
  const handleTableParams = (params: Record<string, any>) =>
    setQueryParams((prev) => ({ ...prev, ...params }))

  return (
    <Dialog open onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className='sm:max-w-6xl'>
{/* ── Header ── */}
<DialogHeader className='relative overflow-hidden border-b-0 bg-gradient-to-br from-[#0b2a4d] via-[#081f3b] to-[#040f20] px-0 pr-0 pt-5 pb-4 text-white'>
  {/* blue glow, top right */}
  <div
    aria-hidden
    className='pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-sky-500/15 blur-3xl'
  />
  {/* warm glow, bottom left */}
  <div
    aria-hidden
    className='pointer-events-none absolute -bottom-24 left-24 size-64 rounded-full bg-amber-500/10 blur-3xl'
  />

  <div className='relative flex items-center gap-3 px-6'>
    <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10'>
      <IconSearch className='size-5 text-white' />
    </div>
    <div>
      <DialogTitle className='text-white'>{t('license_plate')}</DialogTitle>
    </div>
  </div>
</DialogHeader>

        {/* ── Body ── */}
        {/* p-0 so the DataTable card becomes the single visual surface.
            DialogBody is already the flex-1 overflow-y-auto scroller. */}
        <DialogBody className='p-0'>
          <DataTable
            data={cars}
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

                  <DatePickerWithRange value={range} onChange={setRange} />

                  <Select
                    value={laneId ?? ''}
                    onValueChange={(v) =>
                      setLaneId(v === ALL_LANES ? undefined : v)
                    }
                  >
                    <SelectTrigger className='w-32' aria-label={t('lane')}>
                      <SelectValue placeholder={t('all_lanes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_LANES}>{t('all')}</SelectItem>
                      {cameras.map((camera) => (
                        <SelectItem
                          key={camera.id}
                          value={String(camera.lane_id)}
                        >
                          {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size='icon'
                    className='shrink-0'
                    aria-label={t('search')}
                    onClick={runSearch}
                  >
                    <Search />
                  </Button>
                </div>
              </div>
            }
          />
        </DialogBody>

        {/* ── Footer ── */}
        <DialogFooter>
          <Button
            type='button'
            variant='ghost'
            onClick={handleClose}
            className='text-muted-foreground'
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}