import { type DateRange } from "react-day-picker"
import { IconSearch } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlateSearchFields } from "./plate-search-fields"

type Props = {
  open: boolean
  onClose: () => void
  plate: string[]
  onPlateChange: (index: number, value: string) => void
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
  onSearch: () => void
}

// Placeholder columns until the search API is defined
const COLUMNS = ["License Plate", "EPAN", "Card Type", "Entry Time"]

export function PlateSearchModal({ open, onClose, ...fields }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconSearch className="size-5" />
            </div>
            License Plate
          </DialogTitle>
        </DialogHeader>

        <PlateSearchFields {...fields} />

        {/* Results: empty for now */}
        <div className="max-h-72 overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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