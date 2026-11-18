import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  toImageSrc,
  type GraylistResult,
  type QueuedLaneAlert,
} from '@/models/sse-model'
import { useSSEStore } from '@/stores/sse-store'
import { useRetryOpenBarrier } from '@/hooks/use-barrier'
import { StatusAlertDialog, type DetailItem } from './status-alert-dialogs'
import { Badge } from '@/components/ui/badge' // Import your Badge component

function blockedBadge(blocked: boolean, t: TFunction) {
  return (
    <Badge variant={blocked ? 'destructive' : 'success'}>
      {blocked ? t('blocked', { defaultValue: 'Blocked' }) : t('allowed', { defaultValue: 'Allowed' })}
    </Badge>
  )
}

function GraylistAlertModal({
  alert,
  onDismiss,
}: {
  alert: Extract<QueuedLaneAlert, { type: 'graylist_lpn' }>
  onDismiss: (id: number) => void
}) {
  const { t } = useTranslation()
  const data = alert.data
  const e = data.entry

  const details: DetailItem[] = [
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

  return (
    <StatusAlertDialog
      tone="warning" // Changed from "success" to "warning"
      title={data.found ? t('graylisted_plate') : t('not_in_graylist')}
      description={alert.message}
      image={toImageSrc(data.image)}
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

function BarrierRetryAlertModal({
  alert,
  onDismiss,
}: {
  alert: Extract<QueuedLaneAlert, { type: 'open_barrier_try_again' }>
  onDismiss: (id: number) => void
}) {
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

function LaneAlertContent({
  alert,
  onDismiss,
}: {
  alert: QueuedLaneAlert
  onDismiss: (id: number) => void
}) {
  switch (alert.type) {
    case 'graylist_lpn':
      return <GraylistAlertModal alert={alert} onDismiss={onDismiss} />
    case 'open_barrier_try_again':
      return <BarrierRetryAlertModal alert={alert} onDismiss={onDismiss} />
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