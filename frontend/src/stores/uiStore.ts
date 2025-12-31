import { create } from 'zustand'

interface UIState {
    isSidebarOpen: boolean
    theme: 'light' | 'dark' | 'system'
    activeModals: Record<string, boolean>

    // Actions
    toggleSidebar: () => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    openModal: (modalId: string) => void
    closeModal: (modalId: string) => void
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: true,
    theme: 'dark', // Default to dark as per design
    activeModals: {},

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setTheme: (theme) => set({ theme }),

    openModal: (modalId) => set((state) => ({
        activeModals: { ...state.activeModals, [modalId]: true }
    })),

    closeModal: (modalId) => set((state) => ({
        activeModals: { ...state.activeModals, [modalId]: false }
    }))
}))
