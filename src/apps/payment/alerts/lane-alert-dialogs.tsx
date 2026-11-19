// src/apps/payment/modals/lane-alert-dialogs.tsx
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  toImageSrc,
  toVehicleView,
  type ExitCar,
  type GraylistResult,
  type QueuedLaneAlert,
  type SeasonParker,
  type SeasonParkerStatus,
} from '@/models/sse-model'
import { useSSEStore } from '@/stores/sse-store'
import {
  StatusAlertDialog,
  type DetailItem,
  type DialogTone,
} from './status-alert-dialogs'
import { Badge } from '@/components/ui/badge'

type DismissProps = { onDismiss: (id: number) => void }

/* ───────── Shared pieces ───────── */

/** open / close / OK wiring shared by every modal below. */
function dialogControls(id: number, onDismiss: (id: number) => void, t: TFunction) {
  return {
    open: true as const,
    onOpenChange: (open: boolean) => {
      if (!open) onDismiss(id)
    },
    confirmButton: { label: t('ok'), onClick: () => onDismiss(id) },
  }
}

function blockedBadge(blocked: boolean, t: TFunction) {
  return <Badge variant={blocked ? 'destructive' : 'success'}>{blocked ? t('blocked') : t('allowed')}</Badge>
}

/** Dark "terminal" box: window dots, copy action and the error text. */
function ErrorTerminal({ text, copyLabel }: { text: string; copyLabel: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. non-secure context): ignore
    }
  }

  return (
    <div
      dir="ltr"
      className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-left shadow-lg ring-1 ring-black/20"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copyLabel}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-all p-4 font-mono text-xs leading-relaxed text-red-400">
        {text}
      </p>
    </div>
  )
}

/* ───────── Detail builders (booleans always last) ───────── */

function graylistDetails(data: GraylistResult, t: TFunction): DetailItem[] {
  const e = data.entry
  return [
    ...(e
      ? [
          { label: t('license_plate'), value: e.lpn || '—' },
          { label: t('person'), value: e.person_name || '—' },
          { label: t('car_model'), value: e.car_model || '—' },
          { label: t('reason'), value: e.reason || '—' },
          { label: t('last_seen'), value: e.last_seen || '—' },
        ]
      : []),
    { label: t('entry'), value: blockedBadge(data.block_entry, t) },
    { label: t('exit'), value: blockedBadge(data.block_exit, t) },
  ]
}

const SHORT_STATE_KEYS: Record<string, string> = {
  season_parker_valid: 'valid',
  season_parker_not_valid: 'not_valid',
  season_parker_not_present_in_facility: 'not_in_facility',
  season_parker_blocked: 'blocked',
}

function seasonParkerStatusBadge(state: string, t: TFunction) {
  const key = SHORT_STATE_KEYS[state]
  return (
    <Badge variant={state === 'season_parker_valid' ? 'success' : 'destructive'}>
      {key ? t(key) : state}
    </Badge>
  )
}

function seasonParkerTone(state: string): DialogTone {
  switch (state) {
    case 'season_parker_valid':
      return 'success'
    case 'season_parker_not_valid':
    case 'season_parker_not_present_in_facility':
    case 'season_parker_blocked':
      return 'destructive'
    default:
      return 'warning' // unknown future state
  }
}

function seasonParkerDetails(sp: SeasonParker, t: TFunction): DetailItem[] {
  return [
    {
      label: t('cardholder'),
      value: [sp.participant_first_name, sp.participant_last_name].filter(Boolean).join(' ') || '—',
    },
    { label: t('card_number'), value: sp.card_number || '—' },
    { label: t('license_plate'), value: sp.lpn?.length ? sp.lpn.join(', ') : '—' },
    { label: t('valid_from'), value: sp.validity_start || '—' },
    { label: t('valid_until'), value: sp.validity_end || '—' },
    { label: t('in_facility'), value: sp.facility_present ? t('yes') : t('no') },
  ]
}

function seasonParkerStatusDetails(status: SeasonParkerStatus, t: TFunction): DetailItem[] {
  return [
    ...seasonParkerDetails(status.season_parker, t),
    { label: t('status'), value: seasonParkerStatusBadge(status.state, t) },
  ]
}

function vehicleDetails(car: ExitCar, t: TFunction): DetailItem[] {
  const v = toVehicleView({ type: 'exit_car', data: car })
  if (!v) return []
  return [
    { label: t('license_plate'), value: v.plate || '—' },
    { label: t('card_type'), value: v.cardType || '—' },
    { label: t('entry_time'), value: v.entryTime || '—' },
    { label: t('parking_duration'), value: v.parkingDuration || '—' },
  ]
}

/* ───────── Modals ───────── */

function GraylistAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'graylist_lpn' }> } & DismissProps) {
  const { t } = useTranslation()
  const data = alert.data

  return (
    <StatusAlertDialog
      tone={data.block_entry ? 'destructive' : 'warning'}
      title={data.block_entry ? t('vehicle_blocked') : t('graylist_detection')}
      description={data.found ? t('graylist_subtitle') : undefined}
      image={toImageSrc(data.image)}
      imageAlt={t('graylisted_vehicle')}
      details={graylistDetails(data, t)}
      {...dialogControls(alert.id, onDismiss, t)}
    />
  )
}

function SeasonParkerStatusAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'season_parker_status' }> } & DismissProps) {
  const { t } = useTranslation()
  const data = alert.data

  return (
    <StatusAlertDialog
      tone={seasonParkerTone(data.state)}
      title={t(data.state, { defaultValue: data.state })}
      description={data.state === 'season_parker_valid' ? t('season_parker_valid_subtitle') : undefined}
      image={toImageSrc(data.image)}
      imageAlt={t('season_parker')}
      details={seasonParkerDetails(data.season_parker, t)}
      {...dialogControls(alert.id, onDismiss, t)}
    />
  )
}

function GraylistSeasonParkerAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'graylist_season_parker' }> } & DismissProps) {
  const { t } = useTranslation()
  const { graylist, season_parker } = alert.data

  return (
    <StatusAlertDialog
      tone={graylist.block_exit ? 'destructive' : 'warning'}
      title={t('graylist_season_parker')}
      description={graylist.found ? t('graylist_subtitle') : undefined}
      image={toImageSrc(graylist.image)}
      imageAlt={t('graylisted_vehicle')}
      sections={[
        { title: t('graylist'), details: graylistDetails(graylist, t) },
        { title: t('season_parker'), details: seasonParkerStatusDetails(season_parker, t) },
      ]}
      {...dialogControls(alert.id, onDismiss, t)}
    />
  )
}

function GraylistZeroPaymentAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'graylist_exited_with_zero_payment' }> } & DismissProps) {
  const { t } = useTranslation()
  const { graylist, bucket, reason } = alert.data

  return (
    <StatusAlertDialog
      tone="warning"
      title={t('graylist_exited_with_zero_payment')}
      description={t('graylist_zero_payment_subtitle')}
      image={toImageSrc(graylist.image)}
      imageAlt={t('graylisted_vehicle')}
      sections={[
        { title: t('graylist'), details: graylistDetails(graylist, t) },
        {
          title: t('vehicle'),
          details: [
            ...vehicleDetails(bucket, t),
            {
              label: t('reason'),
              value: reason ? t(`zero_payment_reason_${reason}`, { defaultValue: reason }) : '—',
            },
          ],
        },
      ]}
      {...dialogControls(alert.id, onDismiss, t)}
    />
  )
}

function UnpaidGraceTimeAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'car_exited_in_unpaid_grace_time' }> } & DismissProps) {
  const { t } = useTranslation()
  const view = toVehicleView({ type: 'exit_car', data: alert.data })

  return (
    <StatusAlertDialog
      tone="warning"
      title={t('car_exited_in_unpaid_grace_time')}
      description={t('unpaid_grace_time_subtitle')}
      image={view?.image ?? null}
      imageAlt={t('vehicle')}
      details={vehicleDetails(alert.data, t)}
      {...dialogControls(alert.id, onDismiss, t)}
    />
  )
}

function TariffErrorAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'tariff_error' }> } & DismissProps) {
  const { t } = useTranslation()
  const text = [alert.message, alert.data].filter(Boolean).join('\n') || t('tariff_error')

  return (
    <StatusAlertDialog
      tone="destructive"
      title={t('tariff_error')}
      {...dialogControls(alert.id, onDismiss, t)}
    >
      <ErrorTerminal text={text} copyLabel={t('copy_error')} />
    </StatusAlertDialog>
  )
}

/* ───────── Dispatcher ───────── */

function LaneAlertContent({ alert, onDismiss }: { alert: QueuedLaneAlert } & DismissProps) {
  switch (alert.type) {
    case 'graylist_lpn':
      return <GraylistAlertModal alert={alert} onDismiss={onDismiss} />
    case 'season_parker_status':
      return <SeasonParkerStatusAlertModal alert={alert} onDismiss={onDismiss} />
    case 'graylist_season_parker':
      return <GraylistSeasonParkerAlertModal alert={alert} onDismiss={onDismiss} />
    case 'graylist_exited_with_zero_payment':
      return <GraylistZeroPaymentAlertModal alert={alert} onDismiss={onDismiss} />
    case 'car_exited_in_unpaid_grace_time':
      return <UnpaidGraceTimeAlertModal alert={alert} onDismiss={onDismiss} />
    case 'tariff_error':
      return <TariffErrorAlertModal alert={alert} onDismiss={onDismiss} />
    default:
      return null // open_barrier_try_again → <BarrierRetryAlerts />; print_receipt_try_again → no UI yet
  }
}

export function LaneAlertDialogs() {
  const laneAlerts = useSSEStore((s) => s.laneAlerts)
  const clearLaneAlert = useSSEStore((s) => s.clearLaneAlert)

  return (
    <>
      {laneAlerts.map((a) => (
        <LaneAlertContent key={a.id} alert={a} onDismiss={clearLaneAlert} />
      ))}
    </>
  )
}