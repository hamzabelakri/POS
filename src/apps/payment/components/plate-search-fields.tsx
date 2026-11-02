import { type DateRange } from "react-day-picker"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"

export const PLATE_SLOTS = 8
export const emptyPlate = () => Array<string>(PLATE_SLOTS).fill("")

type Props = {
  plate: string[]
  onPlateChange: (index: number, value: string) => void
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
  onSearch: () => void
}

// Shared by the License Plate card and the search modal
export function PlateSearchFields({
  plate,
  onPlateChange,
  range,
  onRangeChange,
  onSearch,
}: Props) {
  return (
    // One wrapping row: wide enough -> plate, range and search share a
    // single row; otherwise range + search wrap below the plate boxes.
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {plate.map((char, i) => (
          <Input
            key={i}
            value={char}
            maxLength={1}
            className="size-9 p-0 text-center"
            aria-label={`Plate character ${i + 1}`}
            onChange={(e) => onPlateChange(i, e.target.value)}
          />
        ))}
        <div className="flex h-9 w-20 items-center justify-center rounded-md border text-sm">
          - - -
        </div>
      </div>

      <DatePickerWithRange value={range} onChange={onRangeChange} />

      <Button className="min-w-24 flex-1" onClick={onSearch}>
        <Search />
        Search
      </Button>
    </div>
  )
}