export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  action?: NotificationAction
  timestamp: Date
  read: boolean
}

export interface NotificationAction {
  label: string
  handler: () => void
}

export interface ToastNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration: number
}
