import { useMemo, useState } from "react"
import { type DateRange } from "react-day-picker"
import { IconSearch } from "@tabler/icons-react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/shared/data-table"

import { usePosConfigStore } from "@/stores/pos-config-store"
import { usePlateSearchColumns } from "../table/plate-search-columns"
import { PlateSearchQueryParams } from "@/models/consult-model"
import { usePlateSearch } from "@/hooks/use-consult"
import { buildPlateSearchParams } from "@/service/consult"

// Radix Select forbids value="" on an item, so "All" uses a sentinel
const ALL_LANES = "all"

type Props = {
  onClose: () => void
  initialPlate: string[]
  initialRange: DateRange | undefined
  initialParams: PlateSearchQueryParams
}

export function PlateSearchModal({
  onClose,
  initialPlate,
  initialRange,
  initialParams,
}: Props) {
  const [plate, setPlate] = useState(initialPlate)
  const [range, setRange] = useState(initialRange)
  const [laneId, setLaneId] = useState<string | undefined>()
  // same params as the parent's request, so the first render is served from the cache
  const [queryParams, setQueryParams] = useState(initialParams)

  // `?? []` stays outside the selector so it doesn't return a new array each render
  const cameras = usePosConfigStore((s) => s.config?.cameras) ?? []

  const { data, isLoading } = usePlateSearch(queryParams)
  // a successful Proceed closes the modal
  const columns = usePlateSearchColumns(onClose)
  const cars = useMemo(() => data?.data.cars ?? [], [data])

  // the API has no `total_rows`, so it is approximated for the table's pagination
  const pagination = data?.data && {
    ...data.data,
    total_rows: data.data.total_pages * data.data.page_size,
  }

  const handlePlateChange = (index: number, value: string) =>
    setPlate((prev) => prev.map((char, i) => (i === index ? value : char)))

  const runSearch = () =>
    setQueryParams(buildPlateSearchParams(plate, range, 1, laneId))

  // the table's pagination sends partial params (e.g. { page }): merge into the last search
  const handleTableParams = (params: Record<string, any>) =>
    setQueryParams((prev) => ({ ...prev, ...params }))

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconSearch className="size-5" />
            </div>
            License Plate
          </DialogTitle>
        </DialogHeader>

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

          <Select
            value={laneId ?? ""}
            onValueChange={(v) => setLaneId(v === ALL_LANES ? undefined : v)}
          >
            <SelectTrigger className="w-40" aria-label="Lane">
              <SelectValue placeholder="All Lanes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LANES}>All</SelectItem>
              {cameras.map((camera) => (
                <SelectItem key={camera.id} value={String(camera.lane_id)}>
                  {camera.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="min-w-24 flex-1" onClick={runSearch}>
            <Search />
            Search
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-auto">
          <DataTable
            data={cars}
            columns={columns}
            showToolbar={false}
            isLoading={isLoading}
            queryParams={queryParams}
            setQueryParams={handleTableParams}
            pagination={pagination}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}