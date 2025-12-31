import { create } from 'zustand'
import { Project, PaginatedResponse } from '@/types'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface ProjectState {
    projects: Project[]
    currentProject: Project | null
    totalProjects: number
    isLoading: boolean
    error: string | null

    // Actions
    fetchProjects: (page?: number, limit?: number) => Promise<void>
    getProject: (id: number) => Promise<void>
    createProject: (data: Partial<Project>) => Promise<Project>
    updateProject: (id: number, data: Partial<Project>) => Promise<void>
    deleteProject: (id: number) => Promise<void>
    clearCurrentProject: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    currentProject: null,
    totalProjects: 0,
    isLoading: false,
    error: null,

    fetchProjects: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null })
        try {
            const res = await apiClient.get<PaginatedResponse<Project>>(
                `${API_ENDPOINTS.PROJECTS.LIST}?page=${page}&page_size=${limit}`
            )
            set({
                projects: res.items,
                totalProjects: res.total
            })
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch projects' })
        } finally {
            set({ isLoading: false })
        }
    },

    getProject: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
            const data = await apiClient.get<Project>(API_ENDPOINTS.PROJECTS.DETAIL(id.toString()))
            set({ currentProject: data })
        } catch (err: any) {
            set({ error: err.message || 'Failed to get project' })
        } finally {
            set({ isLoading: false })
        }
    },

    createProject: async (data: Partial<Project>) => {
        set({ isLoading: true, error: null })
        try {
            const newProject = await apiClient.post<Project>(API_ENDPOINTS.PROJECTS.CREATE, data)
            // Optionally prepend to list if we are on page 1, or just refresh
            // For simplicity, we just add it to current list if it's not full
            const { projects, totalProjects } = get()
            set({
                projects: [newProject, ...projects],
                totalProjects: totalProjects + 1
            })
            return newProject
        } catch (err: any) {
            set({ error: err.message || 'Failed to create project' })
            throw err
        } finally {
            set({ isLoading: false })
        }
    },

    updateProject: async (id: number, data: Partial<Project>) => {
        set({ isLoading: true, error: null })
        try {
            const updated = await apiClient.put<Project>(API_ENDPOINTS.PROJECTS.UPDATE(id.toString()), data)
            set((state) => ({
                currentProject: state.currentProject?.id === id ? updated : state.currentProject,
                projects: state.projects.map(p => p.id === id ? updated : p)
            }))
        } catch (err: any) {
            set({ error: err.message || 'Failed to update project' })
            throw err
        } finally {
            set({ isLoading: false })
        }
    },

    deleteProject: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
            await apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(id.toString()))
            set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                currentProject: state.currentProject?.id === id ? null : state.currentProject,
                totalProjects: state.totalProjects - 1
            }))
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete project' })
            throw err
        } finally {
            set({ isLoading: false })
        }
    },

    clearCurrentProject: () => {
        set({ currentProject: null })
    }
}))
