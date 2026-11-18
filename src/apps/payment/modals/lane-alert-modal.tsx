import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { AlertEnum } from '@/models/alert-model'
import {
  toImageSrc,
  toVehicleView,
  type ExitCar,
  type GraylistResult,
  type QueuedLaneAlert,
  type SeasonParkerStatus,
} from '@/models/sse-model'
import { useAlertStore, type AlertConfig } from '@/stores/alert-store'
import { useSSEStore } from '@/stores/sse-store'
import { useRetryOpenBarrier } from '@/hooks/use-barrier'

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
      <span className='text-end font-medium'>{value || '—'}</span>
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

function ErrorDetailSection({ detail }: { detail: string | null }) {
  const { t } = useTranslation()
  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-semibold'>{t('details')}</h3>
      <pre className='bg-muted/30 rounded-lg border p-3 font-mono text-xs break-words whitespace-pre-wrap'>
        {detail ?? '—'}
      </pre>
    </div>
  )
}

/* ───────── Alert type per season parker state ───────── */

const SEASON_PARKER_STATES: Record<
  string,
  { type: AlertConfig['type']; titleKey: string }
> = {
  // INFO, not SUCCESS: ConfirmAlert auto-hides success alerts without running callbacks
  season_parker_valid: { type: AlertEnum.INFO, titleKey: 'season_parker_valid' },
  season_parker_not_present_in_facility: {
    type: AlertEnum.WARNING,
    titleKey: 'season_parker_not_present_in_facility',
  },
}
const SEASON_PARKER_FALLBACK = {
  type: AlertEnum.ERROR,
  titleKey: 'season_parker_not_valid',
}

/* ───────── Lane alert → ConfirmAlert config ───────── */

type View = Pick<AlertConfig, 'type' | 'message' | 'description' | 'content' | 'wide'>

// Show the backend message as a subtitle only when it isn't already the title
const sub = (title: string, msg: string) => (msg && msg !== title ? msg : undefined)

function buildView(alert: QueuedLaneAlert, t: TFunction): View {
  switch (alert.type) {
    case 'graylist_lpn':
      return {
        type: AlertEnum.ERROR,
        message: t('graylisted_plate'),
        description: alert.message || undefined,
        wide: true,
        content: <GraylistSection g={alert.data} />,
      }

    case 'graylist_season_parker':
      return {
        type: AlertEnum.ERROR,
        message: t('graylisted_season_parker'),
        description: alert.message || undefined,
        wide: true,
        content: (
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
        ),
      }

    case 'season_parker_status': {
      const { type, titleKey } =
        SEASON_PARKER_STATES[alert.data.state] ?? SEASON_PARKER_FALLBACK
      return {
        type,
        message: t(titleKey),
        description: alert.message || undefined,
        wide: true,
        content: <SeasonParkerSection s={alert.data} />,
      }
    }

    case 'graylist_exited_with_zero_payment':
      return {
        type: AlertEnum.WARNING,
        message: t('exited_with_zero_payment'),
        description: alert.message || undefined,
        wide: true,
        content: (
          <div className='space-y-4'>
            <GraylistSection g={alert.data.graylist} />
            <div className='border-t pt-4'>
              <Row
                label={t('reason')}
                value={alert.data.reason.replace(/_/g, ' ')}
              />
            </div>
          </div>
        ),
      }

    case 'car_exited_in_unpaid_grace_time':
      return {
        type: AlertEnum.WARNING,
        message: t('exited_in_unpaid_grace_time'),
        description: alert.message || undefined,
        wide: true,
        content: <VehicleSection car={alert.data} />,
      }

    case 'tariff_error': {
      const title = t('tariff_error', { defaultValue: alert.message })
      return {
        type: AlertEnum.ERROR,
        message: title,
        description: sub(title, alert.message),
        content: alert.data ? <ErrorDetailSection detail={alert.data} /> : undefined,
      }
    }

    case 'open_barrier_try_again': {
      const title = t('open_barrier_try_again', { defaultValue: alert.message })
      return {
        type: AlertEnum.WARNING,
        message: title,
        description: sub(title, alert.message),
      }
    }

    case 'print_receipt_try_again': {
      const title = t('print_receipt_try_again', { defaultValue: alert.message })
      return {
        type: AlertEnum.WARNING,
        message: title,
        description: sub(title, alert.message),
      }
    }
  }
}

/* ───────── Entry point ───────── */

/**
 * Shows the newest lane alert through the shared ConfirmAlert. Older ones stay
 * queued in the SSE store and come back, newest first, as each one is closed.
 */
export function LaneAlertModal() {
  const { t } = useTranslation()
  const alerts = useSSEStore((s) => s.laneAlerts)
  const close = useSSEStore((s) => s.clearLaneAlert)
  const { mutate: retryBarrier } = useRetryOpenBarrier()
  const shownId = useRef<number | null>(null)

  useEffect(() => {
    const top = alerts.at(-1)

    // Queue emptied elsewhere (Clear All, logout): close what we opened
    if (!top) {
      if (shownId.current !== null) {
        shownId.current = null
        useAlertStore.getState().hideAlert()
      }
      return
    }
    if (shownId.current === top.id) return
    shownId.current = top.id

    const isBarrier = top.type === 'open_barrier_try_again'
    const done = () => {
      shownId.current = null
      close(top.id)
    }

    useAlertStore.getState().showAlert({
      ...buildView(top, t),
      confirmText: isBarrier ? t('try') : t('ok', { defaultValue: 'Okay' }),
      cancelText: isBarrier ? t('cancel') : undefined,
      onConfirm: () => {
        done()
        if (isBarrier) retryBarrier()
      },
      onCancel: done,
    })
  }, [alerts, t, close, retryBarrier])

  return null
}