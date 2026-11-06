import { useState } from "react"
import { format } from "date-fns"
import { IconTicket } from "@tabler/icons-react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PLATE_SLOTS = 8

export type LostTicketValues = {
  lpn: string
  date: Date
}

type Props = {
  onClose: () => void
  title?: string
  // wired to the calculation request later
  onSubmit?: (values: LostTicketValues) => void
}

export function LostTicketModal({ onClose, title, onSubmit }: Props) {
  const [plate, setPlate] = useState<string[]>(() =>
    Array<string>(PLATE_SLOTS).fill("")
  )
  const [date, setDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const lpn = plate.join("").trim()
  const canSubmit = lpn.length > 0 && !!date

  const handlePlateChange = (index: number, value: string) =>
    setPlate((prev) => prev.map((char, i) => (i === index ? value : char)))

  const handleSubmit = () => {
    if (!canSubmit || !date) return
    onSubmit?.({ lpn, date })
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconTicket className="size-5" />
            </div>
            {title ?? "Lost Ticket"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start font-normal sm:w-64"
              >
                <CalendarIcon />
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(next) => {
                  setDate(next)
                  setCalendarOpen(false)
                }}
                disabled={(d) => d > new Date()}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            Calculate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}