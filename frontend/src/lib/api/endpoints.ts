// API 端點常數定義

export const API_ENDPOINTS = {
    // 專案管理
    PROJECTS: {
        LIST: '/projects',
        CREATE: '/projects',
        DETAIL: (id: string) => `/projects/${id}`,
        UPDATE: (id: string) => `/projects/${id}`,
        DELETE: (id: string) => `/projects/${id}`,
    },

    // 階段管理
    STAGES: {
        GET: (projectId: string, type: string) => `/projects/${projectId}/stages/${type}`,
        UPDATE: (projectId: string, type: string) => `/projects/${projectId}/stages/${type}`,
        VERSIONS: (projectId: string, type: string) => `/projects/${projectId}/stages/${type}/versions`,
        RESTORE: (projectId: string, type: string) => `/projects/${projectId}/stages/${type}/restore`,
    },

    // AI 生成
    AI: {
        GENERATE: '/ai/generate',
        GENERATE_WS: '/ai/ws/generate',
    },

    // 設定管理
    SETTINGS: {
        GET_ALL: '/settings/ai',
        CREATE: '/settings/ai',
        UPDATE: (id: string) => `/settings/ai/${id}`,
        DELETE: (id: string) => `/settings/ai/${id}`,
        TEST: (id: string) => `/settings/ai/${id}/test`,
    },

    // 匯出功能
    EXPORT: {
        SCRIPT: '/export/script',
        STORYBOARD: '/export/storyboard',
        PROMPTS: '/export/prompts',
        COMPLETE: '/export/complete',
    },
};
