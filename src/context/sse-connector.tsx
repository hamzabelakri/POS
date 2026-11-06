import { useEffect, useState } from "react"
import {
  fetchEventSource,
  EventStreamContentType,
} from "@microsoft/fetch-event-source"
import { useAuthStore } from "@/stores/auth-store"
import { useSSEStore } from "@/stores/sse-store"
import type { PrinterStatus } from "@/models/printer-model"
import { ExitCar, SearchCarData } from "@/models/consult-model"

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
  if (typeof status !== "boolean") return
  useSSEStore.getState().setNatsOnline(status)
}

function handlePrinter(data: unknown, envelope: Envelope) {
  const p = data as Partial<PrinterStatus> | null
  if (typeof p?.online !== "boolean") return
  useSSEStore.getState().setPrinter({
    online: p.online,
    cover_closed: Boolean(p.cover_closed),
    paper_ok: Boolean(p.paper_ok),
    paper_low: Boolean(p.paper_low),
    error: Boolean(p.error),
    error_code: Number(p.error_code ?? 0),
    message: envelope.message ?? "",
  })
}

function handleExitCar(data: unknown) {
  const d = data as Partial<ExitCar> | null
  if (!d?.vehicle_info) return
  useSSEStore.getState().setExitEvent({ type: "exit_car", data: d as ExitCar })
}

function handleSearchCar(data: unknown) {
  const d = data as Partial<SearchCarData> | null
  if (!d?.bucket?.vehicle_info) return
  useSSEStore
    .getState()
    .setExitEvent({ type: "search_car", data: d as SearchCarData })
}

/** Add a handler here when the backend starts sending a new `type`. */
const handlers: Record<string, Handler> = {
  status: { handle: handleNatsStatus, allowError: true },
  printer: { handle: handlePrinter, allowError: true },
  exit_car: { handle: handleExitCar },
  // "car not found" arrives with error_code 404, so it must allowError
  search_car: { handle: handleSearchCar, allowError: true },
}

function dispatch(raw: string) {
  const envelope = JSON.parse(raw) as Envelope
  const handler = handlers[envelope.type]
  if (!handler) {
    console.debug("SSE: unhandled message type", envelope.type)
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
    window.addEventListener("online", onOnline)
    return () => window.removeEventListener("online", onOnline)
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

    setStatus("connecting")

    fetchEventSource(SSE_URL, {
      signal: ctrl.signal,
      openWhenHidden: true,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },

      async onopen(res) {
        if (
          res.ok &&
          res.headers.get("content-type")?.startsWith(EventStreamContentType)
        ) {
          attempt = 0
          setStatus("connected")
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
          console.warn("SSE: bad message", err)
        }
      },

      onclose() {
        if (ctrl.signal.aborted) return
        throw new RetriableError("SSE stream closed")
      },

      onerror(err) {
        if (err instanceof FatalError) throw err
        setStatus("reconnecting")
        const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
        attempt += 1
        return delay
      },
    }).catch((err) => {
      if (ctrl.signal.aborted) return
      setStatus("disconnected")
      console.error(err instanceof FatalError ? err.message : "SSE stopped:", err)
    })

    return () => {
      ctrl.abort()
      setStatus("disconnected")
    }
  }, [token, reconnectKey])

  return null
}