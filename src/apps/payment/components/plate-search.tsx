import { useCallback, useState } from "react"
import { endOfDay, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Search } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { PlateSearchModal } from "../modals/plate-search-modal"
import { PlateSearchQueryParams } from "@/models/consult-model"
import { usePlateSearch } from "@/hooks/use-consult"
import { buildPlateSearchParams } from "@/service/consult"

const PLATE_SLOTS = 8
const emptyPlate = () => Array<string>(PLATE_SLOTS).fill("")

export function PlateSearch() {
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  }))
  const [plate, setPlate] = useState<string[]>(emptyPlate)
  const [modalOpen, setModalOpen] = useState(false)
  // null until the first click on Search
  const [queryParams, setQueryParams] =
    useState<PlateSearchQueryParams | null>(null)

  // the modal reports errors, so the parent stays silent to avoid a double alert
  usePlateSearch(queryParams, { notifyOnError: false })

  const handlePlateChange = (index: number, value: string) =>
    setPlate((prev) => prev.map((char, i) => (i === index ? value : char)))

  // stable reference: the modal's table columns depend on it
  const closeModal = useCallback(() => setModalOpen(false), [])

  const handleSearch = () => {
    setQueryParams(buildPlateSearchParams(plate, range))
    setModalOpen(true)
  }

  return (
    <>
      <Card className="gap-3 py-4">
        <CardHeader>
          <CardTitle>License Plate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {plate.map((char, i) => (
                <Input
                  key={i}
                  value={char}
                  maxLength={1}
                  className="size-9 p-0 text-center"
                  aria-label={`Plate character ${i + 1}`}
                  onChange={(e) => handlePlateChange(i, e.target.value)}
                />
              ))}
              <div className="flex h-9 w-20 items-center justify-center rounded-md border text-sm">
                - - -
              </div>
            </div>

            <DatePickerWithRange value={range} onChange={setRange} />

            <Button className="min-w-24 flex-1" onClick={handleSearch}>
              <Search />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {modalOpen && queryParams && (
        <PlateSearchModal
          onClose={closeModal}
          initialPlate={plate}
          initialRange={range}
          initialParams={queryParams}
        />
      )}
    </>
  )
}