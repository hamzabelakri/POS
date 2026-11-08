import { useRef, useState } from 'react'
import { useCancelLostTicketPayment } from '@/hooks/use-articles'
import {
  LOST_TICKET_CODE,
  BillingLine,
  type Article,
} from '@/models/articles-model'
import { useSSEStore } from '@/stores/sse-store'
import { Main } from '@/components/layout/main'
import { Articles } from './components/articles'
import { Billing } from './components/billing'
import { PaymentMethod } from './components/payment-method'
import { PlateSearch } from './components/plate-search'
import { QuickActions } from './components/quick-actions'
import { VehicleInfo } from './components/vehicle-info'

export function Payment() {
  // Billing is the only state shared between cards (articles -> billing)
  const [billing, setBilling] = useState<BillingLine[]>([])
  const lineKey = useRef(0)
  const clearExitEvent = useSSEStore((s) => s.clearExitEvent)
  const { cancelLostTicket, isPending: isCancelling } =
    useCancelLostTicketPayment()

  const addToBilling = (article: Article) => {
    const key = ++lineKey.current
    setBilling((prev) => [...prev, { key, article }])
  }

  const removeLine = (key: number) =>
    setBilling((prev) => prev.filter((line) => line.key !== key))

  const removeFromBilling = (key: number) => {
    const line = billing.find((l) => l.key === key)
    if (!line || isCancelling) return // isCancelling avoids double cancels

    // A lost ticket is removed only after the cancel API succeeds
    if (line.article.code === LOST_TICKET_CODE) {
      cancelLostTicket(line.article, () => removeLine(key))
      return
    }
    removeLine(key)
  }

  const clearAll = () => {
    setBilling([])
    clearExitEvent()
  }

  return (
    <Main>
      {/* Columns stretch to the same height (default grid behaviour) */}
      <div className='grid flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <div className='flex flex-col gap-4'>
          <VehicleInfo />
          <PlateSearch />
          <Articles onSelect={addToBilling} />
        </div>

        <div className='flex flex-col gap-4'>
          <Billing
            lines={billing}
            onRemove={removeFromBilling}
            onClear={clearAll}
          />
          <QuickActions />
          <PaymentMethod />
        </div>
      </div>
    </Main>
  )
}