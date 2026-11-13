import { useMemo, useState } from 'react'
import { buildPlateSearchParams } from '@/service/consult'
import { toVehicleView, type ExitVehicleEvent } from '@/models/sse-model'
import { useBilledLines } from '@/hooks/use-articles'
import { useCancelArticle } from '@/hooks/use-payment'
import { useSSEStore } from '@/stores/sse-store'
import { Main } from '@/components/layout/main'
import { Articles } from './components/articles'
import { Billing } from './components/billing'
import { PaymentActions } from './components/payment-actions'
import { PlateSearch } from './components/plate-search'
import { QuickActions } from './components/quick-actions'
import { VehicleInfo } from './components/vehicle-info'
import { LaneAlertModal } from './modals/lane-alert-modal'
import { PlateSearchModal } from './modals/plate-search-modal'
import { LaneErrorAlert } from './modals/lane-error-alert'

export function Payment() {
  // Billing comes from the last exit_car message, not from local state
  const lines = useBilledLines()
  const exitEvent = useSSEStore((s) => s.exitEvent)
  const clearExitEvent = useSSEStore((s) => s.clearExitEvent)
  const { cancelArticle, isPending: isCancelling } = useCancelArticle()

  const billedIds = useMemo(
    () => new Set(lines.map((l) => l.article.id)),
    [lines]
  )

  const removeFromBilling = (key: string) => {
    if (isCancelling) return // avoids double cancels
    cancelArticle(key) // the line disappears after the cancel succeeds
  }

  // Each message is a new object, so a new search_car reopens the modal
  const [dismissedSearch, setDismissedSearch] =
    useState<ExitVehicleEvent | null>(null)
  const searchEvent =
    exitEvent?.type === 'search_car' && dismissedSearch !== exitEvent
      ? exitEvent
      : null
  const searchPlate = toVehicleView(searchEvent)?.plate ?? ''

  return (
    <Main>
      <div className='grid flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <div className='flex flex-col gap-4'>
          <VehicleInfo />
          <PlateSearch />
          <Articles billedIds={billedIds} />
        </div>

        <div className='flex flex-col gap-4'>
          <Billing
            lines={lines}
            onRemove={removeFromBilling}
            onClear={clearExitEvent}
          />
          <QuickActions />
          <PaymentActions />
        </div>
      </div>

      <LaneAlertModal />
            <LaneErrorAlert />
      {searchEvent && (
        <PlateSearchModal
          onClose={() => setDismissedSearch(searchEvent)}
          initialPlate={searchPlate}
          initialRange={undefined}
          initialParams={buildPlateSearchParams(searchPlate, undefined, 1)}
        />
      )}
    </Main>
  )
}