import { create } from 'zustand'
import { Stage, StageType, StageVersion } from '@/types'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface StageState {
    stages: Record<StageType, Stage>
    currentStage: StageType
    versions: StageVersion[]
    isLoading: boolean
    isGenerating: boolean
    error: string | null

    // Actions
    setCurrentStage: (stage: StageType) => void
    fetchStages: (projectId: number) => Promise<void>
    updateStageContent: (projectId: number, stageType: StageType, content: string) => Promise<Stage>
    setStageStatus: (stageType: StageType, newStageData: Stage) => void
    setIsGenerating: (isGenerating: boolean) => void
    fetchVersions: (projectId: number, stageType: StageType) => Promise<void>
    restoreVersion: (projectId: number, stageType: StageType, versionId: number) => Promise<void>
}

// Helper to initial stage order with empty or default values if needed
// But here we rely on fetching.

export const useStageStore = create<StageState>((set, get) => ({
    stages: {} as Record<StageType, Stage>,
    currentStage: 'idea',
    versions: [],
    isLoading: false,
    isGenerating: false,
    error: null,

    setCurrentStage: (stage) => set({ currentStage: stage }),

    fetchStages: async (projectId: number) => {
        set({ isLoading: true, error: null })
        try {
            // We need to fetch all stages. The API doesn't seem to have "get all stages for project" endpoint
            // but we can iterate STAGE_ORDER or maybe there should be one.
            // Current page.tsx implementation fetches one by one.
            // Optimization: Backend should probably support getting all stages in one go or included in project detail.
            // For now, let's keep the concurrent fetch logic same as page.tsx

            // Note: Since STAGE_ORDER imports from types, we can use it.
            // But to avoid circular dependency issues if types import stores (unlikely), we'll define list or import.
            // Imported STAGE_ORDER from types.

            const { STAGE_ORDER } = await import('@/types')

            const stagePromises = STAGE_ORDER.map(type =>
                apiClient.get<Stage>(API_ENDPOINTS.STAGES.GET(projectId.toString(), type))
                    .then(stage => ({ type, stage }))
                    .catch(() => ({ type, stage: null }))
            )

            const results = await Promise.all(stagePromises)
            const newStages = {} as Record<StageType, Stage>

            results.forEach(({ type, stage }) => {
                if (stage) {
                    newStages[type as StageType] = stage
                }
            })

            set({ stages: newStages })
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch stages' })
        } finally {
            set({ isLoading: false })
        }
    },

    updateStageContent: async (projectId: number, stageType: StageType, content: string) => {
        // Optimistic update?
        // Maybe better to wait for server response to ensure it saved
        try {
            const updatedStage = await apiClient.put<Stage>(
                API_ENDPOINTS.STAGES.UPDATE(projectId.toString(), stageType),
                { content }
            )
            set((state) => ({
                stages: {
                    ...state.stages,
                    [stageType]: updatedStage
                }
            }))
            return updatedStage
        } catch (err: any) {
            set({ error: err.message || 'Failed to update stage content' })
            throw err
        }
    },

    setStageStatus: (stageType, newStageData) => {
        set((state) => ({
            stages: {
                ...state.stages,
                [stageType]: newStageData
            }
        }))
    },

    setIsGenerating: (status) => set({ isGenerating: status }),

    fetchVersions: async (projectId, stageType) => {
        // set({ isLoading: true }) // Don't trigger global loading for versions
        try {
            const versions = await apiClient.get<StageVersion[]>(
                API_ENDPOINTS.STAGES.VERSIONS(projectId.toString(), stageType)
            )
            set({ versions })
        } catch (err: any) {
            console.error('Failed to fetch versions', err)
        }
    },

    restoreVersion: async (projectId, stageType, versionId) => {
        set({ isLoading: true })
        try {
            // Assuming there's an API for restore, or we just update content with version content
            // The endpoints.ts has RESTORE
            const updatedStage = await apiClient.post<Stage>(
                API_ENDPOINTS.STAGES.RESTORE(projectId.toString(), stageType),
                { version_id: versionId }
            )
            set((state) => ({
                stages: {
                    ...state.stages,
                    [stageType]: updatedStage
                }
            }))
        } catch (err: any) {
            set({ error: err.message || 'Failed to restore version' })
        } finally {
            set({ isLoading: false })
        }
    }
}))
