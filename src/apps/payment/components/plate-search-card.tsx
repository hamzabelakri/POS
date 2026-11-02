import { useState } from "react"
import { endOfDay, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"

const PLATE_SLOTS = 8

export function PlateSearchCard({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>License Plate</CardTitle>
      </CardHeader>
      <CardContent>
        {/* One wrapping row: wide enough -> plate, range and search share a
            single row; otherwise range + search wrap below the plate boxes. */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: PLATE_SLOTS }).map((_, i) => (
              <Input
                key={i}
                maxLength={1}
                className="size-9 p-0 text-center"
                aria-label={`Plate character ${i + 1}`}
              />
            ))}
            <div className="flex h-9 w-20 items-center justify-center rounded-md border text-sm">
              - - -
            </div>
          </div>

          <DatePickerWithRange value={range} onChange={setRange} />

          <Button className="min-w-24 flex-1" onClick={() => onSearch(range)}>
            <Search />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}