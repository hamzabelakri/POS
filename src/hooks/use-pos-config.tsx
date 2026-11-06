import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  ConfigurePosVariables,
  PosConfigResponse,
} from '@/models/pos-config-model'
import { configurePos } from '@/service/pos-config'
import { useAlertStore } from '@/stores/alert-store'
import { usePosConfigStore } from '@/stores/pos-config-store'

export function useConfigurePos() {
  const setConfig = usePosConfigStore((state) => state.setConfig)
  const { showAlert } = useAlertStore()

  return useMutation<
    PosConfigResponse,
    AxiosError<ApiError>,
    ConfigurePosVariables
  >({
    mutationFn: configurePos,
    onSuccess: (res, variables) => {
      // Only a real save persists the config and marks the terminal configured.
      // The store keeps the config itself, not the response envelope.
      if (variables.save) {
        setConfig(res.data)
      }
    },
    onError: (error) => {
      console.error('POS configuration failed: ', error?.response?.data?.error)
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to configure the POS. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })
}