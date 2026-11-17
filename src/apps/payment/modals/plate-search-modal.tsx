import { useMemo, useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { IconSearch } from '@tabler/icons-react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
        <DialogHeader className='pt-5 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg'>
              <IconSearch className='text-primary size-5' />
            </div>
            <div>
              <DialogTitle>{t('license_plate')}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <DialogBody className='space-y-4'>
          <Card className='gap-0 py-0'>
            <CardContent className='py-4'>
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
                      <SelectItem key={camera.id} value={String(camera.lane_id)}>
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
            </CardContent>
          </Card>

          <div className='max-h-[50vh] overflow-auto'>
            <DataTable
              data={cars}
              columns={columns}
              showToolbar={false}
              isLoading={isLoading}
              queryParams={queryParams}
              setQueryParams={handleTableParams}
              pagination={pagination}
            />
          </div>
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