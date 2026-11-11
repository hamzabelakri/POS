import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import type { Article } from '@/models/articles-model'
import type {
  AppliedArticle,
  CalculateTariffPayload,
  CalculateTariffResponse,
  CalculateTariffValues,
  Cashier,
  CancelPayload,
  CancelResponse,
  PaymentMethodType,
  PaymentPayload,
  PaymentRequestPayload,
  PaymentResponse,
  PayVariables,
} from '@/models/payment-model'
import type { ExitCar, ExitCarTransaction } from '@/models/sse-model'
import { calculateTariff, cancelPayment, payOrder } from '@/service/payment'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { useAutoPrintStore } from '@/stores/printer-store'
import { useSSEStore } from '@/stores/sse-store'

const ZERO_DATE = '0001-01-01 00:00:00' // the backend's "no date" value

/* ───────── Shared helpers ───────── */

// Cashier name and shift id come from the saved shift (falls back to the cashier's name).
export function useShiftCashier(): Cashier {
  const cashier = useAuthStore((s) => s.cashier)
  const shift = useAuthStore((s) => s.shift)
  return {
    name:
      shift?.cashier_name ??
      [cashier?.first_name, cashier?.last_name].filter(Boolean).join(' '),
    shift_id: shift?.id ?? 0,
  }
}

// adminId: the admin who approved the action (evaluation response),
// 0 when the article has no evaluation.
export const toAppliedArticle = (
  article: Article,
  adminId: number
): AppliedArticle => ({
  name: article.name, // '' when there is no translated name
  description: article.description ?? '',
  code: article.code,
  admin_id: adminId,
})

// The latest exit_car data, or null. Read on click: it is the latest backend state.
export const getExitCar = (): ExitCar | null => {
  const event = useSSEStore.getState().exitEvent
  return event?.type === 'exit_car' ? event.data : null
}

export const getUntrackedLpn = (): string => {
  const data = getExitCar()
  return data?.is_untracked ? data.vehicle_info.media.lpn : ''
}


/* ───────── Payload builders ───────── */

// Request that applies an article (POST /transactions, /payments/calculate-tariff).
// Everything the backend fills in stays empty; only the article, the cashier
// and, when known, the plate, entry time (ISO string) and untracked flag are set.
export function buildArticlePayload(
  article: Article,
  cashier: Cashier,
  adminId = 0,
  vehicle: { lpn?: string; entryTime?: string; isUntracked?: boolean } = {}
): PaymentRequestPayload {
  const entryTime = vehicle.entryTime ?? ''
  return {
    vehicle_info: {
      image: '',
      entry_image: '',
      media: { lpn: vehicle.lpn ?? '', barcode: '', rfid: '', uhf: '', oa: '' },
      card_type: '',
      entry_time: entryTime,
      tariff_time: entryTime,
      parking_duration: '',
      external_unique_id: '',
    },
    transactions: {}, // the backend fills it in (see the exit_car message)
    payment_summary: {
      subtotal: 0,
      discounts: 0,
      tax_rate: 0,
      tax_value: 0,
      total: 0,
      is_cancelled: false,
      tariff_relev_time: ZERO_DATE,
    },
    applied_article: toAppliedArticle(article, adminId),
    cashier,
    is_untracked: vehicle.isUntracked ?? false,
  }
}

// The backend already computed everything in the last exit_car message:
// resend it as is, with the frontend cashier. `key` limits it to one line.
function buildRequestPayload(
  event: ExitCar,
  cashier: Cashier,
  isCancelled: boolean,
  key?: string
): PaymentRequestPayload {
  return {
    ...event,
    transactions: key
      ? { [key]: event.transactions?.[key] as ExitCarTransaction }
      : (event.transactions ?? {}),
    payment_summary: { ...event.payment_summary, is_cancelled: isCancelled },
    cashier,
  }
}

// One line, marked as cancelled
export const buildCancelPayload = (
  event: ExitCar,
  key: string,
  cashier: Cashier
): CancelPayload => buildRequestPayload(event, cashier, true, key)

// All lines, not cancelled
export const buildPaymentPayload = (
  event: ExitCar,
  cashier: Cashier
): PaymentPayload => buildRequestPayload(event, cashier, false)

/* ───────── Calculate tariff: POST /payments/calculate-tariff ───────── */

export function useCalculateTariff() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    CalculateTariffResponse,
    AxiosError<ApiError>,
    CalculateTariffPayload
  >({
    mutationFn: calculateTariff,
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to calculate the tariff. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  // `onSuccess` only closes the modal; the line comes from the SSE message.
  const submitCalculation = (
    article: Article,
    values: CalculateTariffValues,
    onSuccess: () => void
  ) =>
    mutation.mutate(
      buildArticlePayload(article, cashier, 0, {
        lpn: values.lpn,
        entryTime: values.entryTime.toISOString(), // "2026-11-09T12:42:00.000Z"
      }),
      { onSuccess }
    )

  return { ...mutation, submitCalculation }
}

/* ───────── Cancel one billed line: POST /payments/cancel ───────── */

export function useCancelArticle() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    CancelResponse,
    AxiosError<ApiError>,
    CancelPayload
  >({
    mutationFn: cancelPayment,
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to cancel the article. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  // `key` is the transaction key of the line (BillingLine.key)
  const cancelArticle = (key: string) => {
    const data = getExitCar()
    // The event may have changed since the click was rendered: nothing to cancel
    if (!data?.transactions?.[key]) return

    mutation.mutate(buildCancelPayload(data, key, cashier), {
      // No exit_car follows a cancel, so update the stored event ourselves.
      onSuccess: () => useSSEStore.getState().removeExitTransaction(key),
    })
  }

  return { ...mutation, cancelArticle }
}

/* ───────── Pay the whole bill: POST /payments/cash | /payments/card ───────── */

export function usePayment() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    PaymentResponse,
    AxiosError<ApiError>,
    PayVariables
  >({
    mutationFn: payOrder,
    onSuccess: (res) => {
      showAlert({
        message: res.message ?? 'Payment completed successfully.',
        type: AlertEnum.SUCCESS,
      })
      // The bill is settled: empty the billing list and the vehicle card
      useSSEStore.getState().clearExitEvent()
    },
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to complete the payment. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  const pay = (method: PaymentMethodType) => {
    const data = getExitCar()
    // The event may have been cleared since the click was rendered: nothing to pay
    if (!data || Object.keys(data.transactions ?? {}).length === 0) return

    mutation.mutate({
      method,
      payload: buildPaymentPayload(data, cashier),
      // Read on click, so the latest Auto Print value is used
      printReceipt: useAutoPrintStore.getState().autoPrint,
    })
  }

  return { ...mutation, pay }
}


// Evaluation is asked only when BOTH the cashier needs approval and the
// article requires it. A cashier with permission is never asked.
export function useNeedsEvaluation() {
  const cashierRequires = useAuthStore(
    (s) => s.cashier?.permission_required ?? true // no cashier loaded: stay safe
  )
  return (article: Article) => cashierRequires || article.permissionRequired
}



