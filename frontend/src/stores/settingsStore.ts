import { create } from 'zustand'
import { AISettings } from '@/types'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface SettingsState {
    settings: AISettings[]
    currentSettings: AISettings | null
    isLoading: boolean
    error: string | null

    // Actions
    fetchSettings: () => Promise<void>
    createSettings: (data: Partial<AISettings>) => Promise<void>
    updateSettings: (id: number, data: Partial<AISettings>) => Promise<void>
    deleteSettings: (id: number) => Promise<void>
    testConnection: (id: number) => Promise<boolean>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: [],
    currentSettings: null,
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null })
        try {
            // The API returns { items: [], total: number } but apiClient might strip text if not typed?
            // Actually apiClient.get returns res.data. 
            // The backend returns AISettingsListResponse which has items and total.
            const response = await apiClient.get<{ items: AISettings[], total: number }>(API_ENDPOINTS.SETTINGS.GET_ALL)
            // Handle both array (legacy?) or object response
            if (Array.isArray(response)) {
                set({ settings: response })
            } else if (response && Array.isArray(response.items)) {
                set({ settings: response.items })
            } else {
                set({ settings: [] })
            }
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch settings' })
            set({ settings: [] }) // Reset to empty array on error
        } finally {
            set({ isLoading: false })
        }
    },

    createSettings: async (data) => {
        set({ isLoading: true, error: null })
        try {
            await apiClient.post(API_ENDPOINTS.SETTINGS.CREATE, data)
            // Refresh list using the fixed logic
            await get().fetchSettings()
        } catch (err: any) {
            set({ error: err.message || 'Failed to create settings' })
            throw err
        } finally {
            set({ isLoading: false })
        }
    },

    updateSettings: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
            await apiClient.put(API_ENDPOINTS.SETTINGS.UPDATE(id.toString()), data)
            // Refresh list
            await get().fetchSettings()
        } catch (err: any) {
            set({ error: err.message || 'Failed to update settings' })
            throw err
        } finally {
            set({ isLoading: false })
        }
    },

    deleteSettings: async (id) => {
        set({ isLoading: true, error: null })
        try {
            await apiClient.delete(API_ENDPOINTS.SETTINGS.DELETE(id.toString()))
            // Refresh list
            await get().fetchSettings()
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete settings' })
            throw err
        } finally {
            set({ isLoading: false })
        }
    },

    testConnection: async (id) => {
        try {
            await apiClient.post(API_ENDPOINTS.SETTINGS.TEST(id.toString()))
            return true
        } catch (err: any) {
            set({ error: err.message || 'Connection test failed' })
            return false
        }
    }
}))
