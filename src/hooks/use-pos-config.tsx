import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
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
    AxiosError<{ error: string }>,
    ConfigurePosVariables
  >({
    mutationFn: configurePos,
    onSuccess: (data, variables) => {
      // Only a real save persists the response and marks the terminal configured.
      if (variables.save) {
        setConfig(data)
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
