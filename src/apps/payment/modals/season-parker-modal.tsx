import { useMemo, useState } from "react"
import { IconId } from "@tabler/icons-react"
import { Search } from "lucide-react"
import { useTranslation } from 'react-i18next'

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
import type { PaginationMetadata } from "@/models/api"

const PLATE_SLOTS = 8

type Props = {
  onClose: () => void
  title?: string
}

export function SeasonParkerModal({ onClose, title }: Props) {
  const { t } = useTranslation()
  const [plate, setPlate] = useState<string[]>(() =>
    Array<string>(PLATE_SLOTS).fill("")
  )
  const [cardNumber, setCardNumber] = useState("")
  // starts with an empty search so the first page is listed on open
  const [queryParams, setQueryParams] = useState(() =>
    buildSeasonParkerParams(Array<string>(PLATE_SLOTS).fill(""), "")
  )

  // `res` is the envelope: { status, message, data: SeasonParkerSearchData }
  const { data: res, isLoading } = useSeasonParkerSearch(queryParams)
  // a successful Proceed closes the modal
  const columns = useSeasonParkerColumns(onClose)
  const result = res?.data
  const parkers = useMemo(() => result?.season_parkers ?? [], [result])

  // the API has no `total_rows`, so it is approximated for the table's pagination
  const pagination: PaginationMetadata | undefined = result && {
    current_page: result.current_page,
    page_size: result.page_size,
    total_pages: result.total_pages,
    total_rows: result.total_pages * result.page_size,
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
            {title ?? t('season_parker')}
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
                aria-label={t('plate_character', { index: i + 1 })}
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
            placeholder={t('card_number')}
            aria-label={t('card_number')}
            onChange={(e) => setCardNumber(e.target.value)}
          />

          <Button className="min-w-24 flex-1" onClick={runSearch}>
            <Search />
            {t('search')}
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
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}