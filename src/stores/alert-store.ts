import { AlertEnum, AlertType } from '@/models/alert-model'
import { ReactNode } from 'react'
import { create } from 'zustand'

interface AlertConfig {
 message: string
  type: AlertType
  description?: string
  /** Extra body under the title (details, images…). */
  content?: ReactNode
  /** Wider dialog, for rich content. */
  wide?: boolean
  confirmText?: string
  onConfirm?: () => void
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
  content: undefined,
  wide: undefined,

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