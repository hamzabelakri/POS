import { useMemo } from 'react'
import { useBilledLines, useCancelArticle } from '@/hooks/use-articles'
import { useSSEStore } from '@/stores/sse-store'
import { Main } from '@/components/layout/main'
import { Articles } from './components/articles'
import { Billing } from './components/billing'
import { PaymentMethod } from './components/payment-method'
import { PlateSearch } from './components/plate-search'
import { QuickActions } from './components/quick-actions'
import { VehicleInfo } from './components/vehicle-info'

export function Payment() {
  // Billing comes from the last exit_car message, not from local state
  const lines = useBilledLines()
  const clearExitEvent = useSSEStore((s) => s.clearExitEvent)
  const { cancelArticle, isPending: isCancelling } = useCancelArticle()

  const billedIds = useMemo(
    () => new Set(lines.map((l) => l.article.id)),
    [lines]
  )

  const removeFromBilling = (key: string) => {
    const line = lines.find((l) => l.key === key)
    if (!line || isCancelling) return // avoids double cancels
    cancelArticle(line) // the line disappears after the cancel succeeds
  }

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
          <PaymentMethod />
        </div>
      </div>
    </Main>
  )
}