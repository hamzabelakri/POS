import { useMemo, useState } from "react"
import { IconId } from "@tabler/icons-react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"

import { useSeasonParkerColumns } from "../table/season-parker-columns"
import { useSeasonParkerSearch } from "@/hooks/use-season-parker"
import { buildSeasonParkerParams } from "@/service/season-parker"

const PLATE_SLOTS = 8

type Props = {
  onClose: () => void
  title?: string
}

export function SeasonParkerModal({ onClose, title }: Props) {
  const [plate, setPlate] = useState<string[]>(() =>
    Array<string>(PLATE_SLOTS).fill("")
  )
  const [cardNumber, setCardNumber] = useState("")
  // starts with an empty search so the first page is listed on open
  const [queryParams, setQueryParams] = useState(() =>
    buildSeasonParkerParams(Array<string>(PLATE_SLOTS).fill(""), "")
  )

  const { data, isLoading } = useSeasonParkerSearch(queryParams)
  // a successful Proceed closes the modal
  const columns = useSeasonParkerColumns(onClose)
  const parkers = useMemo(() => data?.season_parkers ?? [], [data])

  // the API has no `total_rows`, so it is approximated for the table's pagination
  const pagination = data && {
    ...data,
    total_rows: data.total_pages * data.page_size,
  }

  const handlePlateChange = (index: number, value: string) =>
    setPlate((prev) => prev.map((char, i) => (i === index ? value : char)))

  const runSearch = () =>
    setQueryParams(buildSeasonParkerParams(plate, cardNumber, 1))

  // the table's pagination sends partial params (e.g. { page }): merge into the last search
  const handleTableParams = (params: Record<string, any>) =>
    setQueryParams((prev) => ({ ...prev, ...params }))

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconId className="size-5" />
            </div>
            {title ?? "Season Parker"}
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

          <Input
            value={cardNumber}
            className="w-44"
            placeholder="Card number"
            aria-label="Card number"
            onChange={(e) => setCardNumber(e.target.value)}
          />

          <Button className="min-w-24 flex-1" onClick={runSearch}>
            <Search />
            Search
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-auto">
          <DataTable
            data={parkers}
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