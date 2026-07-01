import { create } from 'zustand'
import type { ToastNotification, NotificationType } from '../../shared/types'
import { generateId } from '../../shared/utils'

interface NotificationStore {
  toasts: ToastNotification[]
  addToast: (type: NotificationType, title: string, message?: string, duration?: number) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  toasts: [],

  addToast: (type, title, message, duration = 4000) => {
    const toast: ToastNotification = {
      id: generateId(),
      type,
      title,
      message,
      duration,
    }
    set(state => ({ toasts: [...state.toasts, toast] }))
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== toast.id) }))
    }, duration)
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },

  clearAll: () => set({ toasts: [] }),
}))
