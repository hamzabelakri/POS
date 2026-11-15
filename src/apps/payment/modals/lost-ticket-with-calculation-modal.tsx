import { useMemo, useState } from 'react'
import { IconInfoCircle, IconTicket } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CalculateTariffValues } from '@/models/payment-model'

const PLATE_SLOTS = 8
const YEARS_BACK = 5

type EntryParts = {
  day: string
  month: string // 0-11 internally, displayed as 01-12
  year: string
  hour: string
  minute: string
}

type EntryKey = keyof EntryParts

// Defaults to the current local date and time
const getNowEntry = (): EntryParts => {
  const now = new Date()
  return {
    day: String(now.getDate()),
    month: String(now.getMonth()),
    year: String(now.getFullYear()),
    hour: String(now.getHours()),
    minute: String(now.getMinutes()),
  }
}

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)

const pad = (n: number) => n.toString().padStart(2, '0')

const getDaysInMonth = (year: string, month: string) => {
  if (month === '') return 31
  // Fallback to a leap year so Feb 29 stays selectable until a year is chosen
  const y = year === '' ? 2000 : Number(year)
  return new Date(y, Number(month) + 1, 0).getDate()
}

type Props = {
  onClose: () => void
  title?: string
  isPending?: boolean
  onSubmit: (values: CalculateTariffValues) => void
}

type PartSelectProps = {
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function PartSelect({
  value,
  placeholder,
  options,
  onChange,
}: PartSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className='w-full min-w-0 gap-1 px-2'
        aria-label={placeholder}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className='max-h-60'>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function LostTicketWithCalculationModal({
  onClose,
  title,
  isPending = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation()
  const [plate, setPlate] = useState<string[]>(() =>
    Array<string>(PLATE_SLOTS).fill('')
  )
  const [entry, setEntry] = useState<EntryParts>(getNowEntry)

  const lpn = plate.join('').trim()

  // ---- dropdown options ----
  const currentYear = new Date().getFullYear()

  const yearOptions = useMemo(
    () =>
      range(0, YEARS_BACK).map((i) => {
        const y = currentYear - i
        return { value: String(y), label: String(y) }
      }),
    [currentYear]
  )

  // value stays 0-11 for Date, label is the human month number 01-12
  const monthOptions = useMemo(
    () => range(0, 11).map((m) => ({ value: String(m), label: pad(m + 1) })),
    []
  )

  const dayOptions = useMemo(
    () =>
      range(1, getDaysInMonth(entry.year, entry.month)).map((d) => ({
        value: String(d),
        label: pad(d),
      })),
    [entry.year, entry.month]
  )

  const hourOptions = useMemo(
    () => range(0, 23).map((h) => ({ value: String(h), label: pad(h) })),
    []
  )

  const minuteOptions = useMemo(
    () => range(0, 59).map((m) => ({ value: String(m), label: pad(m) })),
    []
  )

  // ---- state handling ----
  const handleEntryChange = (key: EntryKey, value: string) =>
    setEntry((prev) => {
      const next = { ...prev, [key]: value }
      // Keep the day valid when month/year change (e.g. 31 -> 30 or 28)
      if ((key === 'month' || key === 'year') && next.day) {
        const max = getDaysInMonth(next.year, next.month)
        if (Number(next.day) > max) next.day = String(max)
      }
      return next
    })

  // Local-time Date, same result as new Date("yyyy-MM-ddTHH:mm")
  const entryDate = useMemo(() => {
    const { day, month, year, hour, minute } = entry
    if ([day, month, year, hour, minute].some((v) => v === '')) return null
    const d = new Date(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute)
    )
    return Number.isNaN(d.getTime()) || d.getMonth() !== Number(month)
      ? null
      : d
  }, [entry])

  const isFuture = !!entryDate && entryDate > new Date()
  const validEntry = !!entryDate && !isFuture
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
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader icon={IconTicket}>
          <DialogTitle>{title ?? t('lost_ticket')}</DialogTitle>
        </DialogHeader>

        <DialogBody className='space-y-4'>
          <div className='bg-card space-y-5 rounded-lg border p-4'>
            {/* Plate */}
            <div className='space-y-2'>
              <Label id='lost-ticket-plate-label'>{t('license_plate')}</Label>
              <div
                role='group'
                aria-labelledby='lost-ticket-plate-label'
                className='flex flex-wrap items-center gap-2'
              >
                {plate.map((char, i) => (
                  <Input
                    key={i}
                    value={char}
                    maxLength={1}
                    className='size-9 p-0 text-center'
                    aria-label={t('plate_character', { index: i + 1 })}
                    onChange={(e) => handlePlateChange(i, e.target.value)}
                  />
                ))}
                <div className='flex h-9 w-20 items-center justify-center rounded-md border text-sm'>
                  - - -
                </div>
              </div>
            </div>

            {/* Entry time: all fields in one row */}
            <div className='space-y-2'>
              <Label>{t('entry_time')}</Label>

              <div className='grid grid-cols-5 gap-2'>
                <PartSelect
                  value={entry.day}
                  placeholder={t('day')}
                  options={dayOptions}
                  onChange={(v) => handleEntryChange('day', v)}
                />
                <PartSelect
                  value={entry.month}
                  placeholder={t('month')}
                  options={monthOptions}
                  onChange={(v) => handleEntryChange('month', v)}
                />
                <PartSelect
                  value={entry.year}
                  placeholder={t('year')}
                  options={yearOptions}
                  onChange={(v) => handleEntryChange('year', v)}
                />
                <PartSelect
                  value={entry.hour}
                  placeholder={t('hour')}
                  options={hourOptions}
                  onChange={(v) => handleEntryChange('hour', v)}
                />
                <PartSelect
                  value={entry.minute}
                  placeholder={t('minute')}
                  options={minuteOptions}
                  onChange={(v) => handleEntryChange('minute', v)}
                />
              </div>

              {isFuture && (
                <p role='alert' className='text-destructive text-xs'>
                  {t('entry_time_in_future')}
                </p>
              )}
            </div>
          </div>

          {/* Hint, below the card */}
          <div className='bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-lg border p-3 text-sm'>
            <IconInfoCircle className='text-primary size-4 shrink-0' />
            <span>{t('lost_ticket_plate_hint')}</span>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isPending}
          >
            {t('close')}
          </Button>
          <Button type='button' disabled={!canSubmit} onClick={handleSubmit}>
            {isPending ? t('calculating') : t('calculate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}