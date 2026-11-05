import { useRef, useState } from "react"
import { type DateRange } from "react-day-picker"

import { Main } from "@/components/layout/main"
import { BillingLine, type Article } from "@/models/articles-model"
import { VehicleInfo } from "./components/vehicle-info"
import { PlateSearch } from "./components/plate-search"
import { Articles } from "./components/articles"
import { Billing } from "./components/billing"
import { PaymentMethod } from "./components/payment-method"
import { QuickActions } from "./components/quick-actions"


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


  return (
    <Main>
      {/* Columns stretch to the same height (default grid behaviour) */}
      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <VehicleInfo />
          <PlateSearch />
          <Articles onSelect={addToBilling} />
        </div>

        <div className="flex flex-col gap-4">
          <Billing
            lines={billing}
            onRemove={removeFromBilling}
            onClear={() => setBilling([])}
          />
          <QuickActions />
          <PaymentMethod />
        </div>
      </div>
    </Main>
  )
}