'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { StageType, Stage, STAGE_INFO, STAGE_ORDER, StageStatus } from '@/types'
import ExportModal from '@/components/ExportModal'
import PromptEditorModal from '@/components/PromptEditorModal'
import VersionHistory from '@/components/editor/VersionHistory'

interface Project {
    id: number
    name: string
    description: string
}

export default function ProjectPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [stages, setStages] = useState<Record<StageType, Stage>>({} as Record<StageType, Stage>)
    const [currentStage, setCurrentStage] = useState<StageType>('idea')
    const [content, setContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showExport, setShowExport] = useState(false)
    const [showVersions, setShowVersions] = useState(false)
    const [showPromptEdit, setShowPromptEdit] = useState(false)
    const [showEditProject, setShowEditProject] = useState(false)
    const [editName, setEditName] = useState('')
    const [editDescription, setEditDescription] = useState('')

    useEffect(() => {
        fetchProject()
        fetchStages()
    }, [projectId])

    useEffect(() => {
        if (stages[currentStage]) {
            setContent(stages[currentStage].content || '')
        }
    }, [currentStage, stages])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/v1/projects/${projectId}`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setProject(data)
            }
        } catch (error) {
            console.error('Failed to fetch project:', error)
        }
    }

    const fetchStages = async () => {
        try {
            const stageData: Record<StageType, Stage> = {} as Record<StageType, Stage>
            for (const stageType of STAGE_ORDER) {
                const res = await fetch(`/api/v1/projects/${projectId}/stages/${stageType}`, { cache: 'no-store' })
                if (res.ok) {
                    stageData[stageType] = await res.json()
                }
            }
            setStages(stageData)
        } catch (error) {
            console.error('Failed to fetch stages:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/v1/projects/${projectId}/stages/${currentStage}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            if (res.ok) {
                const updatedStage = await res.json()
                setStages(prev => ({ ...prev, [currentStage]: updatedStage }))
            }
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const wsRef = useRef<WebSocket | null>(null)

    // Cleanup WebSocket on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    const handleGenerate = async () => {
        if (isGenerating) return

        setIsGenerating(true)
        setContent('') // Clear content for new generation

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws'
            const wsUrl = `${wsProtocol}://${backendUrl.replace(/^https?:\/\//, '')}/api/v1/ai/ws/generate`

            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    project_id: parseInt(projectId),
                    stage_type: currentStage,
                    // settings_id: 1, // Optional: Pass specific settings ID
                    // custom_prompt: "" // Optional: Pass custom prompt
                }))
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.type === 'token') {
                    setContent(prev => prev + data.content)
                } else if (data.type === 'done') {
                    ws.close()
                    setIsGenerating(false)
                    fetchStages() // Refresh status
                } else if (data.type === 'error') {
                    console.error('AI Error:', data.error)
                    alert(`AI 生成錯誤: ${data.error}`)
                    ws.close()
                    setIsGenerating(false)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error)
                // Don't alert here as onClose often triggers after error
            }

            ws.onclose = () => {
                setIsGenerating(false)
                wsRef.current = null
            }

        } catch (error) {
            console.error('Failed to setup WebSocket:', error)
            alert('無法連接到 AI 服務')
            setIsGenerating(false)
        }
    }

    const getStageStatus = (stageType: StageType): StageStatus => {
        const status = stages[stageType]?.status
        // Treat locked stages as unlocked to allow access to all steps
        if (!status || status === 'locked') {
            return 'unlocked'
        }
        return status
    }

    const canAccessStage = (stageType: StageType): boolean => {
        const status = getStageStatus(stageType)
        return status !== 'locked'
    }

    const handleUpdateProject = async () => {
        if (!project) return
        try {
            const res = await fetch(`/api/v1/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    description: editDescription
                })
            })
            if (res.ok) {
                const updated = await res.json()
                setProject(updated)
                setShowEditProject(false)
            }
        } catch (error) {
            console.error('Failed to update project:', error)
        }
    }

    const handleDeleteProject = async () => {
        if (!confirm('確定要刪除此專案嗎？此操作無法恢復。')) return
        try {
            const res = await fetch(`/api/v1/projects/${projectId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                router.push('/')
            }
        } catch (error) {
            console.error('Failed to delete project:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-white/70 hover:text-white">
                            ← 返回
                        </Link>
                        <h1 className="text-xl font-semibold text-white">{project?.name}</h1>
                        <button
                            onClick={() => {
                                if (project) {
                                    setEditName(project.name)
                                    setEditDescription(project.description)
                                    setShowEditProject(true)
                                }
                            }}
                            className="text-white/50 hover:text-white text-sm"
                            title="編輯專案"
                        >
                            ✏️
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/settings"
                            className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-lg"
                        >
                            AI 設定
                        </Link>
                        <button
                            onClick={() => setShowExport(true)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
                        >
                            匯出
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Stage Navigator Sidebar */}
                <aside className="w-64 border-r border-white/10 h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto">
                    <nav className="p-4">
                        <h2 className="text-sm font-medium text-white/50 mb-4">創作階段</h2>
                        <ul className="space-y-2">
                            {STAGE_ORDER.map((stageType, index) => {
                                const info = STAGE_INFO[stageType]
                                const status = getStageStatus(stageType)
                                const isActive = currentStage === stageType
                                const canAccess = canAccessStage(stageType)

                                return (
                                    <li key={stageType}>
                                        <button
                                            onClick={() => canAccess && setCurrentStage(stageType)}
                                            disabled={!canAccess}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive
                                                ? 'bg-purple-600/30 text-white border border-purple-500/50'
                                                : canAccess
                                                    ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                                    : 'text-white/30 cursor-not-allowed'
                                                }`}
                                        >
                                            <span className="text-xl">{info.icon}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{info.name}</div>
                                                <div className="text-xs text-white/50">
                                                    {status === 'locked' && '🔒 未解鎖'}
                                                    {status === 'unlocked' && '○ 待填寫'}
                                                    {status === 'in_progress' && '◐ 進行中'}
                                                    {status === 'completed' && '✓ 已完成'}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Stage Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{STAGE_INFO[currentStage].icon}</span>
                                <h2 className="text-2xl font-bold text-white">
                                    {STAGE_INFO[currentStage].name}
                                </h2>
                            </div>
                            <p className="text-white/60 text-sm">
                                {getStageDescription(currentStage)}
                            </p>
                        </div>

                        {/* Editor */}
                        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || getStageStatus(currentStage) === 'locked'}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg text-sm font-medium transition-all"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <span className="animate-spin">⚡</span>
                                                生成中...
                                            </>
                                        ) : (
                                            <>
                                                ✨ AI 生成
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowPromptEdit(true)}
                                        className="px-3 py-2 text-white/50 hover:text-white text-sm hover:bg-white/10 rounded-lg transition-all"
                                        title="修改系統提示詞"
                                    >
                                        ⚙️ 系統提示詞
                                    </button>
                                    {isSaving && <span className="text-xs text-white/50">保存中...</span>}
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>

                            {/* Text Editor */}
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onBlur={handleSave}
                                placeholder={`在此輸入${STAGE_INFO[currentStage].name}內容，或點擊「AI 生成」自動生成...`}
                                className="w-full h-[60vh] p-6 bg-transparent text-white placeholder-white/30 resize-none focus:outline-none text-sm leading-relaxed"
                                disabled={getStageStatus(currentStage) === 'locked'}
                            />

                            {/* Word Count */}
                            <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex justify-end">
                                <span className="text-xs text-white/50">
                                    字數：{content.length} 字
                                </span>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <h3 className="text-sm font-medium text-purple-300 mb-2">💡 提示</h3>
                            <p className="text-xs text-white/60">
                                {getStageTip(currentStage)}
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Export Modal */}
            {showExport && project && (
                <ExportModal
                    projectId={project.id}
                    projectName={project.name}
                    onClose={() => setShowExport(false)}
                />
            )}

            {/* Prompt Editor Modal */}
            {showPromptEdit && (
                <PromptEditorModal
                    stageType={currentStage}
                    onClose={() => setShowPromptEdit(false)}
                />
            )}

            {/* Edit Project Modal */}
            {showEditProject && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md animate-slideUp">
                        <h2 className="text-xl font-bold text-white mb-4">編輯專案</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">專案名稱</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">描述</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowEditProject(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdateProject}
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                                >
                                    保存
                                </button>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <button
                                    onClick={handleDeleteProject}
                                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                                >
                                    🗑️ 刪除此專案
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function getStageDescription(stage: StageType): string {
    const descriptions: Record<StageType, string> = {
        idea: '從最初的靈感開始，記錄您的創意想法、主題和概念。',
        story: '將靈感發展成完整的故事大綱，包含開頭、發展和結局。',
        script: '基於故事大綱，撰寫包含場景和對話的劇本初稿。',
        character: '為劇本中的角色設計詳細的外觀、性格和背景。',
        scene: '設計故事中的主要場景，包含環境、氛圍和視覺風格。',
        storyboard: '將劇本轉換為分鏡腳本，規劃每個鏡頭的畫面和運鏡。',
        image_prompt: '為每個分鏡生成 AI 圖像提示詞，用於生成視覺素材。',
        motion_prompt: '為需要動態效果的鏡頭生成動態分鏡提示詞。',
    }
    return descriptions[stage]
}

function getStageTip(stage: StageType): string {
    const tips: Record<StageType, string> = {
        idea: '可以先簡單描述一個場景、一個衝突或一個角色，AI 會幫您擴展成完整的概念。',
        story: '確保故事有清晰的三幕結構：鋪陳、衝突、解決。AI 會根據您的靈感自動生成。',
        script: '劇本會包含場景標題、動作描述和對話。您可以在生成後進行編輯調整。',
        character: 'AI 會為每個角色生成外觀、性格、背景等詳細設計，方便後續視覺呈現。',
        scene: '場景設計包含空間、光線、色調等，為分鏡和圖像生成提供視覺參考。',
        storyboard: '分鏡表會列出每個鏡頭的景別、運鏡和畫面描述。',
        image_prompt: '這些提示詞可直接用於 Midjourney、DALL-E 等 AI 圖像工具。',
        motion_prompt: '這些提示詞適用於 Runway、Pika 等 AI 影片生成工具。',
    }
    return tips[stage]
}
