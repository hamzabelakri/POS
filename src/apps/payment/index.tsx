import { useMemo, useState } from 'react'
import { toVehicleView, type ExitVehicleEvent } from '@/models/sse-model'
import { buildPlateSearchParams } from '@/service/consult'
import { useSSEStore } from '@/stores/sse-store'
import { useBilledLines } from '@/hooks/use-articles'
import { useCancelArticle } from '@/hooks/use-payment'
import { Main } from '@/components/layout/main'
import { Articles } from './components/articles'
import { Billing } from './components/billing'
import { PaymentActions } from './components/payment-actions'
import { PlateSearch } from './components/plate-search'
import { QuickActions } from './components/quick-actions'
import { VehicleInfo } from './components/vehicle-info'
import { LaneAlertDialogs } from './alerts/lane-alert-dialogs'
import { BarrierRetryAlerts } from './alerts/barrier-retry-alerts'
import { PlateSearchModal } from './modals/plate-search-modal'


export function Payment() {
  const lines = useBilledLines()
  const exitEvent = useSSEStore((s) => s.exitEvent)
  const clearExitEvent = useSSEStore((s) => s.clearExitEvent)
  const { cancelArticle, isPending: isCancelling } = useCancelArticle()

  const exitCar = exitEvent?.type === 'exit_car' ? exitEvent.data : null
  const transactions = exitCar?.transactions ?? {}
  const total = exitCar?.payment_summary.total ?? 0

  const billedIds = useMemo(
    () => new Set(lines.map((l) => l.article.id)),
    [lines]
  )

  const removeFromBilling = (key: string) => {
    if (isCancelling) return
    cancelArticle(key)
  }

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
        <div className='flex flex-col gap-6'>
          <VehicleInfo />
          <PlateSearch />
          <Articles billedIds={billedIds} />
        </div>

        <div className='flex flex-col gap-6'>
          <Billing
            lines={lines}
            transactions={transactions}
            total={total}
            onRemove={removeFromBilling}
            onClear={clearExitEvent}
          />
          <QuickActions />
          <PaymentActions />
        </div>
      </div>

      <LaneAlertDialogs />
      <BarrierRetryAlerts />

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
