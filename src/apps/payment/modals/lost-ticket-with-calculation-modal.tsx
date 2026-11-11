import { useState } from "react"
import { format } from "date-fns"
import { IconTicket } from "@tabler/icons-react"
import { useTranslation } from 'react-i18next'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalculateTariffValues } from "@/models/payment-model"

const PLATE_SLOTS = 8

type Props = {
  onClose: () => void
  title?: string
  isPending?: boolean
  onSubmit: (values: CalculateTariffValues) => void
}

export function LostTicketWithCalculationModal({
  onClose,
  title,
  isPending = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation()
  const [plate, setPlate] = useState<string[]>(() =>
    Array<string>(PLATE_SLOTS).fill("")
  )
  // datetime-local value, local time: "yyyy-MM-ddTHH:mm"
  const [entry, setEntry] = useState("")

  const lpn = plate.join("").trim()
  const entryDate = entry ? new Date(entry) : null

  // An entry time is required, must be a valid date, and not in the future.
  const validEntry =
    !!entryDate &&
    !Number.isNaN(entryDate.getTime()) &&
    entryDate <= new Date()

  const canSubmit = validEntry && !isPending

  const handlePlateChange = (index: number, value: string) =>
    setPlate((prev) => prev.map((char, i) => (i === index ? value : char)))

  const handleSubmit = () => {
    if (!canSubmit || !entryDate) return // narrows entryDate to Date
    onSubmit({ lpn, entryTime: entryDate })
  }

  // No closing while the request is in flight
  const handleClose = () => {
    if (!isPending) onClose()
  }

  return (
    <Dialog open onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconTicket className="size-5" />
            </div>
            {title ?? t('lost_ticket')}
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
                aria-label={t('plate_character', { index: i + 1 })}
                onChange={(e) => handlePlateChange(i, e.target.value)}
              />
            ))}
            <div className="flex h-9 w-20 items-center justify-center rounded-md border text-sm">
              - - -
            </div>
          </div>

          <div className="space-y-2 sm:w-64">
            <Label htmlFor="entryTime">{t('entry_time')}</Label>
            <Input
              id="entryTime"
              type="datetime-local"
              value={entry}
              max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setEntry(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            {t('close')}
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {isPending ? t('calculating') : t('calculate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}