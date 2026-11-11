import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import type {
  CaptureResponse,
  UpdateImagePayload,
  UpdateImageResponse,
} from '@/models/bridge-model'
import type { Cashier } from '@/models/payment-model'
import type { ExitCar } from '@/models/sse-model'
import { captureImage, updateImage } from '@/service/bridge'
import { useAlertStore } from '@/stores/alert-store'
import { getExitCar, useShiftCashier } from '@/hooks/use-payment'

// The latest exit_car (it already carries the SSE image) with the frontend cashier
export const buildUpdateImagePayload = (
  event: ExitCar,
  cashier: Cashier
): UpdateImagePayload => ({ ...event, cashier })

/* ───────── Update the exit picture: PUT /bridge/update-image ───────── */

export function useUpdateImage() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    UpdateImageResponse,
    AxiosError<ApiError>,
    UpdateImagePayload
  >({
    mutationFn: updateImage,
    onSuccess: (res) =>
      showAlert({
        message: res.message ?? 'Image updated successfully.',
        type: AlertEnum.SUCCESS,
      }),
    onError: (error) =>
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to update the image. Please try again.',
        type: AlertEnum.ERROR,
      }),
  })

  const updateVehicleImage = () => {
    const data = getExitCar() // read on click: the latest SSE image
    if (!data?.vehicle_info.image) return
    mutation.mutate(buildUpdateImagePayload(data, cashier))
  }

  return { ...mutation, updateVehicleImage }
}

/* ───────── Capture a picture: POST /bridge/capture ───────── */

export function useCaptureImage() {
  const { showAlert } = useAlertStore()

  return useMutation<CaptureResponse, AxiosError<ApiError>, void>({
    mutationFn: captureImage,
    onError: (error) =>
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to capture the image. Please try again.',
        type: AlertEnum.ERROR,
      }),
  })
}