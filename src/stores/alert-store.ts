import { AlertEnum, AlertType } from '@/models/alert-model'
import { create } from 'zustand'

interface AlertConfig {
  message: string
  type: AlertType
  // Optional subtitle shown under the message.
  description?: string
  // Primary button (default label: "Okay").
  confirmText?: string
  onConfirm?: () => void
  // Secondary button: only rendered when `cancelText` is provided.
  cancelText?: string
  onCancel?: () => void
}

interface AlertState extends AlertConfig {
  isOpen: boolean
  showAlert: (config: AlertConfig) => void
  hideAlert: () => void
}

// Everything optional, reset on every show/hide so one alert never inherits another's content.
const resetFields = {
  description: undefined,
  confirmText: undefined,
  onConfirm: undefined,
  cancelText: undefined,
  onCancel: undefined,
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  message: '',
  type: AlertEnum.INFO,
  ...resetFields,
  showAlert: (config) => set({
    isOpen: true,
    ...resetFields,
    ...config,
  }),
  hideAlert: () => set({
    isOpen: false,
    ...resetFields,
  }),
}))