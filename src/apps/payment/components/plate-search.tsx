import { useState } from "react"
import { endOfDay, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { emptyPlate, PlateSearchFields } from "./plate-search-fields"
import { PlateSearchModal } from "./plate-search-modal"

export function PlateSearch({
  onSearch,
}: {
  // range.from / range.to already include the selected times
  onSearch: (range: DateRange | undefined) => void
}) {
  // Defaults to the whole of today; the chosen times live inside the dates
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  }))
  const [plate, setPlate] = useState<string[]>(emptyPlate)
  const [modalOpen, setModalOpen] = useState(false)

  const handlePlateChange = (index: number, value: string) =>
    setPlate((prev) => prev.map((char, i) => (i === index ? value : char)))

  const runSearch = () => onSearch(range)

  return (
    <>
      <Card className="gap-3 py-4">
        <CardHeader>
          <CardTitle>License Plate</CardTitle>
        </CardHeader>
        <CardContent>
          <PlateSearchFields
            plate={plate}
            onPlateChange={handlePlateChange}
            range={range}
            onRangeChange={setRange}
            onSearch={() => {
              runSearch()
              setModalOpen(true)
            }}
          />
        </CardContent>
      </Card>

      <PlateSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plate={plate}
        onPlateChange={handlePlateChange}
        range={range}
        onRangeChange={setRange}
        onSearch={runSearch}
      />
    </>
  )
}