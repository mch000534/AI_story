'use client'

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
    onRetry?: () => void
}

interface ToastStore {
    toasts: Toast[]
    showToast: (message: string, type?: ToastType, onRetry?: () => void) => void
    hideToast: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
    toasts: [],
    showToast: (message, type = 'info', onRetry) => {
        const id = Date.now().toString()
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, onRetry }]
        }))
        // Auto-dismiss after 5 seconds for errors with retry, 3 seconds otherwise
        const duration = onRetry ? 5000 : 3000
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            }))
        }, duration)
    },
    hideToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }))
    }
}))
