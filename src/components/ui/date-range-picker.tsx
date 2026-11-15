import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DATE_TIME_FORMAT = "dd-MM-yyyy HH:mm:ss"
const TIME_FORMAT = "HH:mm:ss"

// "HH:mm" or "HH:mm:ss" (browsers differ) -> same day with that time
function withTime(date: Date, time: string) {
  const [h = 0, m = 0, s = 0] = time.split(":").map(Number)
  const next = new Date(date)
  next.setHours(h, m, s, 0)
  return next
}

type DatePickerWithRangeProps = {
  /** from / to are full Dates: the chosen times live inside them */
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  label?: string
  className?: string
}

export function DatePickerWithRange({
  value,
  onChange,
  label,
  className,
}: DatePickerWithRangeProps) {
  const { t } = useTranslation()
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  // edited inside the popover, only committed on Apply
  const [draft, setDraft] = React.useState<DateRange | undefined>(value)

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(value) // always start from the committed value
    setOpen(next)
  }

  const handleApply = () => {
    onChange?.(draft)
    setOpen(false)
  }

  // Times currently applied to the draft (defaults cover the whole day)
  const fromTime = draft?.from ? format(draft.from, TIME_FORMAT) : "00:00:00"
  const toTime = draft?.to ? format(draft.to, TIME_FORMAT) : "23:59:59"

  return (
    <Field className={cn("w-96", className)}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            aria-label={label ?? t('date_range')}
            className="justify-start px-2.5 font-normal tabular-nums"
          >
            <CalendarIcon data-icon="inline-start" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, DATE_TIME_FORMAT)} -{" "}
                  {format(value.to, DATE_TIME_FORMAT)}
                </>
              ) : (
                format(value.from, DATE_TIME_FORMAT)
              )
            ) : (
              <span>{t('pick_a_date')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={draft?.from}
            selected={draft}
            numberOfMonths={2}
            onSelect={(range) => {
              if (!range?.from) {
                setDraft(undefined)
                return
              }
              setDraft({
                from: withTime(range.from, fromTime),
                to: range.to ? withTime(range.to, toTime) : undefined,
              })
            }}
          />

          {/* Time inputs (with seconds) */}
          <div className="grid grid-cols-2 gap-3 border-t p-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-from-time`}>{t('from_time')}</Label>
              <Input
                id={`${id}-from-time`}
                type="time"
                step={1}
                disabled={!draft?.from}
                value={fromTime}
                onChange={(e) => {
                  if (draft?.from && e.target.value) {
                    setDraft({
                      ...draft,
                      from: withTime(draft.from, e.target.value),
                    })
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-to-time`}>{t('to_time')}</Label>
              <Input
                id={`${id}-to-time`}
                type="time"
                step={1}
                disabled={!draft?.to}
                value={toTime}
                onChange={(e) => {
                  if (draft?.to && e.target.value) {
                    setDraft({
                      ...draft,
                      to: withTime(draft.to, e.target.value),
                    })
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t p-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              {t('apply')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  )
}