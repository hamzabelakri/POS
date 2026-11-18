import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  toImageSrc,
  toVehicleView,
  type GraylistResult,
  type QueuedLaneAlert,
  type SeasonParker,
  type SeasonParkerStatus,
} from '@/models/sse-model'
import { useSSEStore } from '@/stores/sse-store'
import { useRetryOpenBarrier } from '@/hooks/use-barrier'
import {
  StatusAlertDialog,
  type DetailItem,
  type DialogTone,
} from './status-alert-dialogs'
import { Badge } from '@/components/ui/badge'

/* ───────── Shared helpers ───────── */

function blockedBadge(blocked: boolean, t: TFunction) {
  return (
    <Badge variant={blocked ? 'destructive' : 'success'}>
      {blocked ? t('blocked', { defaultValue: 'Blocked' }) : t('allowed', { defaultValue: 'Allowed' })}
    </Badge>
  )
}

/* ───────── Shared detail builders ───────── */

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

const SEASON_PARKER_STATE_DEFAULTS: Record<string, string> = {
  season_parker_valid: 'Season parker valid',
  season_parker_not_valid: 'Season parker not valid',
  season_parker_not_present_in_facility: 'Season parker not present in facility',
  season_parker_blocked: 'Season parker blocked',
}

function seasonParkerStateLabel(state: string, t: TFunction) {
  return t(state, { defaultValue: SEASON_PARKER_STATE_DEFAULTS[state] ?? state })
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
      return 'warning' // unknown future state: flag it without claiming success or failure
  }
}

function seasonParkerDetails(sp: SeasonParker, t: TFunction): DetailItem[] {
  return [
    {
      label: t('card_holder'),
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
    {
      label: t('status'),
      value: (
        <Badge variant={status.state === 'season_parker_valid' ? 'success' : 'destructive'}>
          {seasonParkerStateLabel(status.state, t)}
        </Badge>
      ),
    },
    ...seasonParkerDetails(status.season_parker, t),
  ]
}

/* ───────── Modals ───────── */

type DismissProps = { onDismiss: (id: number) => void }

/** 1. Graylist Plate Alert */
function GraylistAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'graylist_lpn' }> } & DismissProps) {
  const { t } = useTranslation()
  const data = alert.data

  return (
    <StatusAlertDialog
      tone="warning"
      title={data.found ? t('graylisted_plate') : t('not_in_graylist')}
      description={alert.message}
      image={toImageSrc(data.image)}
      imageAlt={t('graylisted_vehicle')}
      details={graylistDetails(data, t)}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/** 2. Graylist & Season Parker Combined Alert */
function GraylistSeasonParkerAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'graylist_season_parker' }> } & DismissProps) {
  const { t } = useTranslation()
  const { graylist, season_parker } = alert.data

  return (
    <StatusAlertDialog
      // Driven only by the graylist's exit block, whatever the season parker state is
      tone={graylist.block_exit ? 'destructive' : 'warning'}
      title={t('graylist_season_parker', { defaultValue: 'Graylist and season parker' })}
      description={alert.message}
      sections={[
        {
          title: t('graylist'),
          image: toImageSrc(graylist.image),
          imageAlt: t('graylisted_vehicle'),
          details: graylistDetails(graylist, t),
        },
        {
          title: t('season_parker'),
          image: toImageSrc(season_parker.image),
          imageAlt: t('season_parker'),
          details: seasonParkerStatusDetails(season_parker, t),
        },
      ]}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/** 3. Season Parker Status Alert */
function SeasonParkerStatusAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'season_parker_status' }> } & DismissProps) {
  const { t } = useTranslation()
  const data = alert.data

  return (
    <StatusAlertDialog
      tone={seasonParkerTone(data.state)}
      title={seasonParkerStateLabel(data.state, t)}
      image={toImageSrc(data.image)}
      imageAlt={t('season_parker')}
      details={seasonParkerDetails(data.season_parker, t)}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/** 4. Graylist Exited with Zero Payment (Success Tone) */
function GraylistExitedZeroPaymentModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'graylist_exited_with_zero_payment' }> } & DismissProps) {
  const { t } = useTranslation()
  const data = alert.data

  const details: DetailItem[] = [
    { label: t('reason'), value: data.reason.replace(/_/g, ' ') || '—' },
    { label: t('entry'), value: blockedBadge(data.graylist.block_entry, t) },
    { label: t('exit'), value: blockedBadge(data.graylist.block_exit, t) },
  ]

  return (
    <StatusAlertDialog
      tone="success"
      title={t('exited_with_zero_payment')}
      description={alert.message}
      image={toImageSrc(data.graylist.image)}
      imageAlt={t('graylisted_vehicle')}
      details={details}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/** 5. Car Exited in Unpaid Grace Time (Success Tone) */
function CarExitedUnpaidGraceModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'car_exited_in_unpaid_grace_time' }> } & DismissProps) {
  const { t } = useTranslation()
  const car = alert.data
  const v = toVehicleView({ type: 'exit_car', data: car })

  const details: DetailItem[] = [
    { label: t('license_plate'), value: v?.plate || '—' },
    { label: t('epan'), value: v?.epan || '—' },
    { label: t('card_type'), value: v?.cardType || '—' },
    { label: t('entry_time'), value: v?.entryTime || '—' },
    { label: t('parking_duration'), value: v?.parkingDuration || '—' },
  ]

  return (
    <StatusAlertDialog
      tone="success"
      title={t('exited_in_unpaid_grace_time')}
      description={alert.message}
      image={toImageSrc(car.vehicle_info.image)}
      imageAlt={t('exit')}
      details={details}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/** 6. Tariff Error Alert (Destructive/Danger Tone) */
function TariffErrorModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'tariff_error' }> } & DismissProps) {
  const { t } = useTranslation()
  const title = t('tariff_error', { defaultValue: alert.message })

  const details: DetailItem[] = alert.data
    ? [{ label: t('details'), value: alert.data }]
    : []

  return (
    <StatusAlertDialog
      tone="destructive"
      title={title}
      description={alert.message !== title ? alert.message : undefined}
      details={details}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/** 7. Open Barrier Retry Alert */
function BarrierRetryAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'open_barrier_try_again' }> } & DismissProps) {
  const { t } = useTranslation()
  const { mutate: retryBarrier, isPending: isRetrying } = useRetryOpenBarrier()

  const title = t('open_barrier_try_again', { defaultValue: alert.message })

  return (
    <StatusAlertDialog
      tone="warning"
      title={title}
      description={alert.message !== title ? alert.message : undefined}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      cancelButton={{
        label: t('cancel'),
        disabled: isRetrying,
      }}
      confirmButton={{
        label: t('try'),
        loading: isRetrying,
        disabled: isRetrying,
        onClick: (e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault()
          retryBarrier(undefined, {
            onSuccess: () => onDismiss(alert.id),
          })
        },
      }}
    />
  )
}

/** 8. Print Receipt Retry Alert */
function PrintReceiptRetryAlertModal({
  alert,
  onDismiss,
}: { alert: Extract<QueuedLaneAlert, { type: 'print_receipt_try_again' }> } & DismissProps) {
  const { t } = useTranslation()
  const title = t('print_receipt_try_again', { defaultValue: alert.message })

  return (
    <StatusAlertDialog
      tone="warning"
      title={title}
      description={alert.message !== title ? alert.message : undefined}
      open
      onOpenChange={(open) => {
        if (!open) onDismiss(alert.id)
      }}
      confirmButton={{
        label: t('ok', { defaultValue: 'OK' }),
        onClick: () => onDismiss(alert.id),
      }}
    />
  )
}

/* ───────── Dispatcher & Entry Point ───────── */

function LaneAlertContent({ alert, onDismiss }: { alert: QueuedLaneAlert } & DismissProps) {
  switch (alert.type) {
    case 'graylist_lpn':
      return <GraylistAlertModal alert={alert} onDismiss={onDismiss} />
    case 'graylist_season_parker':
      return <GraylistSeasonParkerAlertModal alert={alert} onDismiss={onDismiss} />
    case 'season_parker_status':
      return <SeasonParkerStatusAlertModal alert={alert} onDismiss={onDismiss} />
    case 'graylist_exited_with_zero_payment':
      return <GraylistExitedZeroPaymentModal alert={alert} onDismiss={onDismiss} />
    case 'car_exited_in_unpaid_grace_time':
      return <CarExitedUnpaidGraceModal alert={alert} onDismiss={onDismiss} />
    case 'tariff_error':
      return <TariffErrorModal alert={alert} onDismiss={onDismiss} />
  
    case 'print_receipt_try_again':
      return <PrintReceiptRetryAlertModal alert={alert} onDismiss={onDismiss} />
    default:
      return null
  }
}

export function LaneAlertDialogs() {
  const laneAlerts = useSSEStore((s) => s.laneAlerts)
  const clearLaneAlert = useSSEStore((s) => s.clearLaneAlert)

  return (
    <>
      {laneAlerts.map((a) => (
        <LaneAlertContent
          key={a.id}
          alert={a}
          onDismiss={clearLaneAlert}
        />
      ))}
    </>
  )
}