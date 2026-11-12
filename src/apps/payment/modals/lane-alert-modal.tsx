import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  toImageSrc,
  toVehicleView,
  type ExitCar,
  type GraylistResult,
  type SeasonParkerStatus,
} from '@/models/sse-model'
import { BadgeAlert, BadgeCheck, BadgeX, Clock, ShieldAlert } from 'lucide-react'
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
  const { t } = useTranslation()
  const url = toImageSrc(src)
  return (
    <div className='bg-muted/30 flex aspect-video items-center justify-center overflow-hidden rounded-lg border'>
      {url ? (
        <img src={url} alt={label} className='size-full object-cover' />
      ) : (
        <span className='text-muted-foreground text-sm'>
          {t('no_image_available')}
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
  const { t } = useTranslation()
  return (
    <span
      className={
        on
          ? 'bg-destructive/10 text-destructive rounded-md px-2 py-0.5 text-xs font-medium'
          : 'bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs'
      }
    >
      {label}: {on ? t('blocked') : t('allowed')}
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
  const { t } = useTranslation()
  const e = g.entry
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <AlertImage src={g.image} label={t('graylisted_vehicle')} />
      <div className='space-y-2'>
        {e ? (
          <>
            <Row label={t('license_plate')} value={e.lpn} />
            <Row label={t('person')} value={e.person_name} />
            <Row label={t('car_model')} value={e.car_model} />
            <Row label={t('reason')} value={e.reason} />
            <Row label={t('last_seen')} value={e.last_seen} />
          </>
        ) : (
          <p className='text-muted-foreground text-sm'>
            {t('not_in_graylist')}
          </p>
        )}
        <div className='flex flex-wrap gap-2 pt-2'>
          <Flag label={t('entry')} on={g.block_entry} />
          <Flag label={t('exit')} on={g.block_exit} />
        </div>
      </div>
    </div>
  )
}

function SeasonParkerSection({ s }: { s: SeasonParkerStatus }) {
  const { t } = useTranslation()
  const p = s.season_parker
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <AlertImage src={s.image} label={t('season_parker')} />
      <div className='space-y-2'>
        <Row
          label={t('name')}
          value={`${p.participant_first_name} ${p.participant_last_name}`}
        />
        <Row label={t('card_number')} value={p.card_number} />
        <Row label={t('license_plate')} value={p.lpn.join(', ')} />
        <Row label={t('epan')} value={p.epan} />
        <Row label={t('valid_from')} value={p.validity_start} />
        <Row label={t('valid_until')} value={p.validity_end} />
        <div className='flex flex-wrap gap-2 pt-2'>
          <Flag label={t('card')} on={p.blocked} />
        </div>
      </div>
    </div>
  )
}

function VehicleSection({ car }: { car: ExitCar }) {
  const { t } = useTranslation()
  const v = toVehicleView({ type: 'exit_car', data: car })
  if (!v) return null
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <AlertImage src={car.vehicle_info.image} label={t('exit')} />
      <div className='space-y-2'>
        <Row label={t('license_plate')} value={v.plate} />
        <Row label={t('epan')} value={v.epan} />
        <Row label={t('card_type')} value={v.cardType} />
        <Row label={t('entry_time')} value={v.entryTime} />
        <Row label={t('parking_duration')} value={v.parkingDuration} />
      </div>
    </div>
  )
}

const SEASON_PARKER_STATES: Record<
  string,
  { Icon: typeof BadgeCheck; color: string; titleKey: string }
> = {
  season_parker_valid: {
    Icon: BadgeCheck,
    color: 'text-green-600',
    titleKey: 'season_parker_valid',
  },
  season_parker_not_present_in_facility: {
    Icon: BadgeAlert,
    color: 'text-amber-500',
    titleKey: 'season_parker_not_present_in_facility',
  },
}

// Any other state is treated as not valid
const SEASON_PARKER_FALLBACK = {
  Icon: BadgeX,
  color: 'text-destructive',
  titleKey: 'season_parker_not_valid',
}

/* ───────── Entry point ───────── */

export function LaneAlertModal() {
  const { t } = useTranslation()
  const alert = useSSEStore((s) => s.laneAlert)
  const close = useSSEStore((s) => s.clearLaneAlert)

  if (!alert) return null

  switch (alert.type) {
    case 'graylist_lpn':
      return (
        <Shell
          icon={<ShieldAlert className='text-destructive size-5' />}
          title={t('graylisted_plate')}
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
          title={t('graylisted_season_parker')}
          message={alert.message}
          onClose={close}
        >
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>{t('graylist')}</h3>
              <GraylistSection g={alert.data.graylist} />
            </div>
            <div className='space-y-2 border-t pt-4'>
              <h3 className='text-sm font-semibold'>{t('season_parker')}</h3>
              <SeasonParkerSection s={alert.data.season_parker} />
            </div>
          </div>
        </Shell>
      )

       case 'season_parker_status': {
      const { Icon, color, titleKey } =
        SEASON_PARKER_STATES[alert.data.state] ?? SEASON_PARKER_FALLBACK
      return (
        <Shell
          icon={<Icon className={`size-5 ${color}`} />}
          title={t(titleKey)}
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
          title={t('exited_with_zero_payment')}
          message={alert.message}
          onClose={close}
        >
          <div className='space-y-4'>
            <GraylistSection g={alert.data.graylist} />
            <div className='border-t pt-4'>
              <Row
                label={t('reason')}
                value={alert.data.reason.replace(/_/g, ' ')}
              />
            </div>
          </div>
        </Shell>
      )

    case 'car_exited_in_unpaid_grace_time':
      return (
        <Shell
          icon={<Clock className='size-5 text-amber-500' />}
          title={t('exited_in_unpaid_grace_time')}
          message={alert.message}
          onClose={close}
        >
          <VehicleSection car={alert.data} />
        </Shell>
      )
  }
  
}