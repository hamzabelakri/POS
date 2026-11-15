import { useCallback, useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import { PlateSearchQueryParams } from '@/models/consult-model'
import { buildPlateSearchParams, normalizePlate } from '@/service/consult'
import { Search } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { usePlateSearch } from '@/hooks/use-consult'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { LpnInput } from '@/components/ui/input-otp'
import { PlateSearchModal } from '../modals/plate-search-modal'
import { PanelHeader } from './panel-header'

const toUpper = (s: string) => s.toUpperCase()

export function PlateSearch() {
  const { t } = useTranslation()
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  }))
  const [plate, setPlate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  // null until the first click on Search
  const [queryParams, setQueryParams] = useState<PlateSearchQueryParams | null>(
    null
  )

  // the modal reports errors, so the parent stays silent to avoid a double alert
  usePlateSearch(queryParams)

  // stable reference: the modal's table columns depend on it
  const closeModal = useCallback(() => setModalOpen(false), [])

  const handleSearch = () => {
    setQueryParams(buildPlateSearchParams(plate, range))
    setModalOpen(true)
  }

  return (
    <>
      <Card className='flex-1 gap-0 py-0'>
        <PanelHeader>
          <CardTitle className='text-base text-muted-foreground'>{t('search_lpn')}</CardTitle>
        </PanelHeader>
        <CardContent className='py-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <LpnInput value={plate} onChange={setPlate} sanitize={toUpper} />
              <div className='flex h-9 min-w-20 items-center justify-center rounded-md border px-2 font-mono text-sm tracking-widest'>
                {normalizePlate(plate) || '- - -'}
              </div>
            </div>

            <DatePickerWithRange value={range} onChange={setRange} />

            <Button className='min-w-24 flex-1' onClick={handleSearch}>
              <Search />
              {t('search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {modalOpen && queryParams && (
        <PlateSearchModal
          onClose={closeModal}
          initialPlate={plate}
          initialRange={range}
          initialParams={queryParams}
        />
      )}
    </>
  )
}