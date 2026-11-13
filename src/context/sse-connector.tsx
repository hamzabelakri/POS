import { useEffect, useState } from 'react'
import type { PrinterStatus } from '@/models/printer-model'
import type {
  ExitCar,
  GraylistExitedZeroPaymentData,
  SearchCarData,
} from '@/models/sse-model'
import type {
  GraylistResult,
  GraylistSeasonParkerData,
  SeasonParkerStatus,
} from '@/models/sse-model'
import {
  fetchEventSource,
  EventStreamContentType,
} from '@microsoft/fetch-event-source'
import { useAuthStore } from '@/stores/auth-store'
import { useSSEStore } from '@/stores/sse-store'

const SSE_URL = import.meta.env.VITE_SSE_URL

const BASE_DELAY_MS = 1_000
const MAX_DELAY_MS = 15_000

class RetriableError extends Error {}
class FatalError extends Error {}

/** Every message on the stream is { type, data, message, error_code, error_level }. */
type Envelope = {
  type: string
  data: unknown
  message?: string
  error_code?: number
  error_level?: string
}

type Handler = {
  handle: (data: unknown, envelope: Envelope) => void
  /** Still process messages whose envelope carries an error_code (state-carrying types). */
  allowError?: boolean
}

function handleNatsStatus(data: unknown) {
  const status = (data as { status?: unknown } | null)?.status
  if (typeof status !== 'boolean') return
  useSSEStore.getState().setNatsOnline(status)
}

function handlePrinter(data: unknown, envelope: Envelope) {
  const p = data as Partial<PrinterStatus> | null
  if (typeof p?.online !== 'boolean') return
  useSSEStore.getState().setPrinter({
    online: p.online,
    cover_closed: Boolean(p.cover_closed),
    paper_ok: Boolean(p.paper_ok),
    paper_low: Boolean(p.paper_low),
    error: Boolean(p.error),
    error_code: Number(p.error_code ?? 0),
    message: envelope.message ?? '',
  })
}

function handleExitCar(data: unknown) {
  const d = data as Partial<ExitCar> | null
  if (!d?.vehicle_info) return
  useSSEStore.getState().setExitEvent({ type: 'exit_car', data: d as ExitCar })
}

function handleSearchCar(data: unknown) {
  const d = data as Partial<SearchCarData> | null
  if (!d?.bucket?.vehicle_info) return
  useSSEStore
    .getState()
    .setExitEvent({ type: 'search_car', data: d as SearchCarData })
}

function handleGraylistLpn(data: unknown, envelope: Envelope) {
  const d = data as Partial<GraylistResult> | null
  if (typeof d?.found !== 'boolean') return
  useSSEStore.getState().setLaneAlert({
    type: 'graylist_lpn',
    data: d as GraylistResult,
    message: envelope.message ?? '',
  })
}

function handleGraylistSeasonParker(data: unknown, envelope: Envelope) {
  const d = data as Partial<GraylistSeasonParkerData> | null
  if (!d?.graylist || !d.season_parker) return
  useSSEStore.getState().setLaneAlert({
    type: 'graylist_season_parker',
    data: d as GraylistSeasonParkerData,
    message: envelope.message ?? '',
  })
}

function handleSeasonParkerStatus(data: unknown, envelope: Envelope) {
  const d = data as Partial<SeasonParkerStatus> | null
  if (typeof d?.state !== 'string' || !d.season_parker) return
  useSSEStore.getState().setLaneAlert({
    type: 'season_parker_status',
    data: d as SeasonParkerStatus,
    message: envelope.message ?? '',
  })
}

function handleGraylistExitedZeroPayment(data: unknown, envelope: Envelope) {
  const d = data as Partial<GraylistExitedZeroPaymentData> | null
  if (!d?.graylist || !d.bucket) return
  useSSEStore.getState().setLaneAlert({
    type: 'graylist_exited_with_zero_payment',
    data: d as GraylistExitedZeroPaymentData,
    message: envelope.message ?? '',
  })
}

function handleCarExitedInUnpaidGraceTime(data: unknown, envelope: Envelope) {
  const d = data as Partial<ExitCar> | null
  if (!d?.vehicle_info) return
  useSSEStore.getState().setLaneAlert({
    type: 'car_exited_in_unpaid_grace_time',
    data: d as ExitCar,
    message: envelope.message ?? '',
  })
}

function handleTariffError(data: unknown, envelope: Envelope) {
  const detail = typeof data === 'string' && data ? data : null
  // Technical cause (IP, port...): console only
  if (detail) console.error('SSE tariff_error:', detail)
  useSSEStore.getState().setLaneError({
    type: 'tariff_error',
    message: envelope.message ?? '',
    detail,
  })
}

function handleOpenBarrierTryAgain(_data: unknown, envelope: Envelope) {
  useSSEStore.getState().setLaneError({
    type: 'open_barrier_try_again',
    message: envelope.message ?? '',
    detail: null,
  })
}

/** Add a handler here when the backend starts sending a new `type`. */
const handlers: Record<string, Handler> = {
  status: { handle: handleNatsStatus, allowError: true },
  printer: { handle: handlePrinter, allowError: true },
  exit_car: { handle: handleExitCar },
  // "car not found" arrives with error_code 404, so it must allowError
  search_car: { handle: handleSearchCar, allowError: true },
  // These carry state; two of them arrive with error_code 200 (level "info")
  graylist_lpn: { handle: handleGraylistLpn, allowError: true },
  graylist_season_parker: {
    handle: handleGraylistSeasonParker,
    allowError: true,
  },
  graylist_exited_with_zero_payment: {
    handle: handleGraylistExitedZeroPayment,
    allowError: true,
  },
  season_parker_status: { handle: handleSeasonParkerStatus, allowError: true },
  // error_code 200: car left for free during the unpaid grace time
  car_exited_in_unpaid_grace_time: {
    handle: handleCarExitedInUnpaidGraceTime,
    allowError: true,
  },
  // These are errors (error_code 500), so allowError is required or they are dropped
  tariff_error: { handle: handleTariffError, allowError: true },
  open_barrier_try_again: {
    handle: handleOpenBarrierTryAgain,
    allowError: true,
  },
}

function dispatch(raw: string) {
  const envelope = JSON.parse(raw) as Envelope
  const handler = handlers[envelope.type]
  if (!handler) {
    console.debug('SSE: unhandled message type', envelope.type)
    return
  }
  if (envelope.error_code && !handler.allowError) return
  handler.handle(envelope.data, envelope)
}

export function SSEConnector() {
  const token = useAuthStore((s) => s.token)

  // Bumped when the browser comes back online, to reconnect immediately
  const [reconnectKey, setReconnectKey] = useState(0)

  useEffect(() => {
    const onOnline = () => setReconnectKey((k) => k + 1)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  useEffect(() => {
    const { setStatus, reset } = useSSEStore.getState()

    // Logged out: drop stale data. A token refresh does not reach this branch.
    if (!token) {
      reset()
      return
    }

    const ctrl = new AbortController()
    let attempt = 0

    setStatus('connecting')

    fetchEventSource(SSE_URL, {
      signal: ctrl.signal,
      openWhenHidden: true,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },

      async onopen(res) {
        if (
          res.ok &&
          res.headers.get('content-type')?.startsWith(EventStreamContentType)
        ) {
          attempt = 0
          setStatus('connected')
          return
        }
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new FatalError(`SSE failed: ${res.status}`)
        }
        throw new RetriableError(`SSE unavailable: ${res.status}`)
      },

      onmessage(event) {
        if (!event.data) return // ignore heartbeats
        try {
          dispatch(event.data)
        } catch (err) {
          // One bad message must never kill the stream
          console.warn('SSE: bad message', err)
        }
      },

      onclose() {
        if (ctrl.signal.aborted) return
        throw new RetriableError('SSE stream closed')
      },

      onerror(err) {
        if (err instanceof FatalError) throw err
        setStatus('reconnecting')
        const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
        attempt += 1
        return delay
      },
    }).catch((err) => {
      if (ctrl.signal.aborted) return
      setStatus('disconnected')
      console.error(
        err instanceof FatalError ? err.message : 'SSE stopped:',
        err
      )
    })

    return () => {
      ctrl.abort()
      setStatus('disconnected')
    }
  }, [token, reconnectKey])

  return null
}