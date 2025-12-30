/**
 * TypeScript type definitions for the AI Story app
 */

// Stage types
export type StageType =
    | 'idea'
    | 'story'
    | 'script'
    | 'character'
    | 'scene'
    | 'storyboard'
    | 'image_prompt'
    | 'motion_prompt'

export type StageStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed'

// Stage info
export const STAGE_INFO: Record<StageType, { name: string; icon: string }> = {
    idea: { name: '靈感發想', icon: '💡' },
    story: { name: '故事大綱', icon: '📖' },
    script: { name: '劇本初稿', icon: '📜' },
    character: { name: '角色設計', icon: '👤' },
    scene: { name: '場景設計', icon: '🎬' },
    storyboard: { name: '分鏡腳本', icon: '🎞️' },
    image_prompt: { name: 'AI 圖像提示詞', icon: '🖼️' },
    motion_prompt: { name: '動態分鏡提示詞', icon: '🎥' },
}

export const STAGE_ORDER: StageType[] = [
    'idea',
    'story',
    'script',
    'character',
    'scene',
    'storyboard',
    'image_prompt',
    'motion_prompt',
]

// Project
export interface Project {
    id: number
    name: string
    description: string
    category: string
    tags: string[]
    created_at: string
    updated_at: string
    is_deleted: boolean
}

// Stage
export interface Stage {
    id: number
    project_id: number
    stage_type: StageType
    status: StageStatus
    content: string
    last_ai_model?: string
    last_ai_params?: Record<string, unknown>
    created_at: string
    updated_at: string
}

// Stage Version
export interface StageVersion {
    id: number
    stage_id: number
    version_number: number
    content: string
    source: 'manual' | 'ai'
    ai_model?: string
    ai_params?: Record<string, unknown>
    created_at: string
}

// AI Settings
export interface AISettings {
    id: number
    name: string
    provider: string
    base_url: string
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    is_default: boolean
    is_active: boolean
    has_api_key: boolean
    created_at: string
    updated_at: string
}

// API Response types
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface AIGenerateResponse {
    content: string
    model: string
    tokens_used?: number
    stage_type: StageType
}
