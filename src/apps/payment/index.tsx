import { useRef, useState } from "react"
import { type DateRange } from "react-day-picker"

import { Main } from "@/components/layout/main"
import { type Article, type BillingLine } from "./types"
import { VehicleInfoCard } from "./components/vehicle-info-card"
import { PlateSearchCard } from "./components/plate-search-card"
import { ArticlesCard } from "./components/articles-card"
import { BillingCard } from "./components/billing-card"
import { BarrierActionsCard } from "./components/barrier-actions-card"
import { PaymentMethodCard } from "./components/payment-method-card"

export function Payment() {
  // Billing is the only state shared between cards (articles -> billing)
  const [billing, setBilling] = useState<BillingLine[]>([])
  const lineKey = useRef(0)

  const addToBilling = (article: Article) => {
    const key = ++lineKey.current
    setBilling((prev) => [...prev, { key, article }])
  }
  const removeFromBilling = (key: number) =>
    setBilling((prev) => prev.filter((line) => line.key !== key))

  const handleSearch = (range: DateRange | undefined) => {
    console.debug("search:", range)
  }

  return (
    <Main>
      {/* Columns stretch to the same height (default grid behaviour) */}
      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <VehicleInfoCard />
          <PlateSearchCard onSearch={handleSearch} />
          <ArticlesCard onSelect={addToBilling} />
        </div>

        <div className="flex flex-col gap-4">
          <BillingCard
            lines={billing}
            onRemove={removeFromBilling}
            onClear={() => setBilling([])}
          />
          <BarrierActionsCard />
          <PaymentMethodCard />
        </div>
      </div>
    </Main>
  )
}