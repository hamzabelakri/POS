import type { ReactNode } from 'react'
import {
  toImageSrc,
  type GraylistResult,
  type SeasonParkerStatus,
} from '@/models/sse-model'
import { BadgeCheck, BadgeX, ShieldAlert } from 'lucide-react'
import { useSSEStore } from '@/stores/sse-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ───────── Shared pieces ───────── */

function AlertImage({ src, label }: { src: string; label: string }) {
  const url = toImageSrc(src)
  return (
    <div className='bg-muted/30 flex aspect-video items-center justify-center overflow-hidden rounded-lg border'>
      {url ? (
        <img src={url} alt={label} className='size-full object-cover' />
      ) : (
        <span className='text-muted-foreground text-sm'>
          No image available
        </span>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value || '—'}</span>
    </div>
  )
}

function Flag({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={
        on
          ? 'bg-destructive/10 text-destructive rounded-md px-2 py-0.5 text-xs font-medium'
          : 'bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs'
      }
    >
      {label}: {on ? 'Blocked' : 'Allowed'}
    </span>
  )
}

function Shell({
  icon,
  title,
  message,
  onClose,
  wide,
  children,
}: {
  icon: ReactNode
  title: string
  message: string
  onClose: () => void
  wide?: boolean
  children: ReactNode
}) {
  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={wide ? 'sm:max-w-5xl' : 'sm:max-w-3xl'}>
        <DialogHeader className='border-b pb-3'>
          <DialogTitle className='flex items-center gap-2'>
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/* ───────── Sections ───────── */

function GraylistSection({ g }: { g: GraylistResult }) {
  const e = g.entry
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <AlertImage src={g.image} label='Graylisted vehicle' />
      <div className='space-y-2'>
        {e ? (
          <>
            <Row label='License Plate' value={e.lpn} />
            <Row label='Person' value={e.person_name} />
            <Row label='Car Model' value={e.car_model} />
            <Row label='Reason' value={e.reason} />
            <Row label='Last Seen' value={e.last_seen} />
          </>
        ) : (
          <p className='text-muted-foreground text-sm'>Not in the graylist.</p>
        )}
        <div className='flex flex-wrap gap-2 pt-2'>
          <Flag label='Entry' on={g.block_entry} />
          <Flag label='Exit' on={g.block_exit} />
        </div>
      </div>
    </div>
  )
}

function SeasonParkerSection({ s }: { s: SeasonParkerStatus }) {
  const p = s.season_parker
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <AlertImage src={s.image} label='Season parker' />
      <div className='space-y-2'>
        <Row
          label='Name'
          value={`${p.participant_first_name} ${p.participant_last_name}`}
        />
        <Row label='Card Number' value={p.card_number} />
        <Row label='License Plate' value={p.lpn.join(', ')} />
        <Row label='EPAN' value={p.epan} />
        <Row label='Valid From' value={p.validity_start} />
        <Row label='Valid Until' value={p.validity_end} />
        <div className='flex flex-wrap gap-2 pt-2'>
          <Flag label='Card' on={p.blocked} />
        </div>
      </div>
    </div>
  )
}

const isValid = (s: SeasonParkerStatus) => s.state === 'season_parker_valid'

/* ───────── Entry point ───────── */

export function LaneAlertModal() {
  const alert = useSSEStore((s) => s.laneAlert)
  const close = useSSEStore((s) => s.clearLaneAlert)

  if (!alert) return null

  switch (alert.type) {
    case 'graylist_lpn':
      return (
        <Shell
          icon={<ShieldAlert className='text-destructive size-5' />}
          title='Graylisted Plate'
          message={alert.message}
          onClose={close}
        >
          <GraylistSection g={alert.data} />
        </Shell>
      )

    case 'graylist_season_parker':
      return (
        <Shell
          wide
          icon={<ShieldAlert className='text-destructive size-5' />}
          title='Graylisted Season Parker'
          message={alert.message}
          onClose={close}
        >
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>Graylist</h3>
              <GraylistSection g={alert.data.graylist} />
            </div>
            <div className='space-y-2 border-t pt-4'>
              <h3 className='text-sm font-semibold'>Season Parker</h3>
              <SeasonParkerSection s={alert.data.season_parker} />
            </div>
          </div>
        </Shell>
      )

    case 'season_parker_status': {
      const valid = isValid(alert.data)
      return (
        <Shell
          icon={
            valid ? (
              <BadgeCheck className='size-5 text-green-600' />
            ) : (
              <BadgeX className='text-destructive size-5' />
            )
          }
          title={valid ? 'Season Parker Valid' : 'Season Parker Not Valid'}
          message={alert.message}
          onClose={close}
        >
          <SeasonParkerSection s={alert.data} />
        </Shell>
      )
    }
    case 'graylist_exited_with_zero_payment':
      return (
        <Shell
          icon={<ShieldAlert className='size-5 text-amber-500' />}
          title='Exited With Zero Payment'
          message={alert.message}
          onClose={close}
        >
          <div className='space-y-4'>
            <GraylistSection g={alert.data.graylist} />
            <div className='border-t pt-4'>
              <Row
                label='Reason'
                value={alert.data.reason.replace(/_/g, ' ')}
              />
            </div>
          </div>
        </Shell>
      )
  }
}
