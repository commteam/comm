import { useNotificationStore } from '../app/stores/notification.store'

export function useToast() {
  const { addToast } = useNotificationStore()

  return {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
  }
}
