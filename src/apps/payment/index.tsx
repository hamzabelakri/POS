import { useEffect, useMemo, useRef, useState } from 'react'
import { useCancelLostTicketPayment } from '@/hooks/use-articles'
import {
  LOST_TICKET_CODE,
  LOST_TICKET_WITH_CALCULATION_CODE,
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

// Articles whose removal must be confirmed by the cancel API first
const needsCancelRequest = (article: Article) =>
  article.code === LOST_TICKET_CODE ||
  article.code === LOST_TICKET_WITH_CALCULATION_CODE

export function Payment() {
  // Billing is the only state shared between cards (articles -> billing)
  const [billing, setBilling] = useState<BillingLine[]>([])
  const lineKey = useRef(0)
  const clearExitEvent = useSSEStore((s) => s.clearExitEvent)
  const { cancelLostTicket, isPending: isCancelling } =
    useCancelLostTicketPayment()

  // Ids of articles already billed (used to lock articles in <Articles />)
  const billedIds = useMemo(
    () => new Set(billing.map((l) => l.article.id)),
    [billing]
  )

  // Removing the last line resets the exit event, like Clear All.
  // The ref avoids resetting on mount, when the list is empty from the start.
  const hadLines = useRef(false)
  useEffect(() => {
    if (billing.length > 0) {
      hadLines.current = true
    } else if (hadLines.current) {
      hadLines.current = false
      clearExitEvent()
    }
  }, [billing.length, clearExitEvent])

  const addToBilling = (
    article: Article,
    extras?: Pick<BillingLine, 'adminId' | 'calculation'>
  ) => {
    const key = ++lineKey.current
    setBilling((prev) =>
      // A production article can be added only once; checked against the
      // latest list so a stale closure can't sneak in a duplicate.
      article.isProduction && prev.some((l) => l.article.id === article.id)
        ? prev
        : [...prev, { key, article, ...extras }]
    )
  }

  const removeLine = (key: number) =>
    setBilling((prev) => prev.filter((line) => line.key !== key))

  const removeFromBilling = (key: number) => {
    const line = billing.find((l) => l.key === key)
    if (!line || isCancelling) return // isCancelling avoids double cancels

    // Lost ticket articles are removed only after the cancel API succeeds
    if (needsCancelRequest(line.article)) {
      cancelLostTicket(line, () => removeLine(key))
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
          <Articles billedIds={billedIds} onSelect={addToBilling} />
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