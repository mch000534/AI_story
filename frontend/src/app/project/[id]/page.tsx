'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { StageType, Stage, STAGE_INFO, STAGE_ORDER, StageStatus } from '@/types'
import ExportModal from '@/components/ExportModal'
import PromptEditorModal from '@/components/PromptEditorModal'
import VersionHistory from '@/components/editor/VersionHistory'
import RichTextEditor from '@/components/editor/RichTextEditor'

import { useProjectStore } from '@/stores/projectStore'
import { useStageStore } from '@/stores/stageStore'
import { useAI } from '@/hooks/useAI'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useStageNavigation } from '@/hooks/useStageNavigation'
import { useUIStore } from '@/stores/uiStore'
import { useToast } from '@/hooks/useToast'

export default function ProjectPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const { showToast } = useToast()

    const { currentProject: project, getProject, updateProject, deleteProject } = useProjectStore()
    const { stages, fetchStages, updateStageContent, isGenerating: isStoreGenerating, setIsGenerating: setStoreIsGenerating } = useStageStore()

    const {
        content,
        setContent,
        isGenerating,
        generate
    } = useAI({
        onComplete: () => {
            fetchStages(parseInt(projectId))
            showToast('AI 生成完成', 'success')
        },
        onError: (err) => showToast(`AI 生成錯誤: ${err}`, 'error')
    })

    // Navigation
    const { currentStage, navigateToStage } = useStageNavigation()

    // UI State
    const { isSidebarOpen, toggleSidebar } = useUIStore()

    // Local state (removed currentStage)

    // Auto Save
    const { isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
        value: content,
        enabled: !isGenerating && !isStoreGenerating,
        onSave: async (newContent) => {
            if (projectId) {
                await updateStageContent(parseInt(projectId), currentStage, newContent)
            }
        }
    })

    const [showExport, setShowExport] = useState(false)
    const [showPromptEdit, setShowPromptEdit] = useState(false)
    const [showEditProject, setShowEditProject] = useState(false)
    const [editName, setEditName] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [showVersionHistory, setShowVersionHistory] = useState(false)

    // Load data
    useEffect(() => {
        if (projectId) {
            getProject(parseInt(projectId))
            fetchStages(parseInt(projectId))
        }
    }, [projectId, getProject, fetchStages])

    // Sync content from store to local state when stage changes 
    // or when store content updates (e.g. from AI)
    useEffect(() => {
        if (stages[currentStage]) {
            // Only update local content if we are not typing? 
            // Actually, we should sync completely. 
            // The typing updates local state `content`. 
            // If store updates (e.g. AI streaming finishes), we update local.
            // But we need to be careful not to overwrite user input if they act simultaneously (rare).
            // For now, simple sync.
            setContent(stages[currentStage].content || '')
        }
    }, [currentStage, stages])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.metaKey || e.ctrlKey

            // ESC to close modals
            if (e.key === 'Escape') {
                if (showExport) setShowExport(false)
                if (showPromptEdit) setShowPromptEdit(false)
                if (showEditProject) setShowEditProject(false)
                return
            }

            // Don't trigger shortcuts when typing in inputs
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                // Allow Ctrl+S even in editor
                if (isMod && e.key === 's') {
                    e.preventDefault()
                    handleSave()
                    showToast('已保存', 'success')
                }
                return
            }

            if (isMod && e.key === 's') {
                e.preventDefault()
                handleSave()
                showToast('已保存', 'success')
            } else if (isMod && e.key === 'g') {
                e.preventDefault()
                if (!isGenerating) {
                    handleGenerate()
                }
            } else if (isMod && e.key === 'ArrowLeft') {
                e.preventDefault()
                const currentIndex = STAGE_ORDER.indexOf(currentStage)
                if (currentIndex > 0) {
                    navigateToStage(STAGE_ORDER[currentIndex - 1])
                }
            } else if (isMod && e.key === 'ArrowRight') {
                e.preventDefault()
                const currentIndex = STAGE_ORDER.indexOf(currentStage)
                if (currentIndex < STAGE_ORDER.length - 1) {
                    navigateToStage(STAGE_ORDER[currentIndex + 1])
                }
            } else if (isMod && e.key === 'h') {
                e.preventDefault()
                setShowVersionHistory(!showVersionHistory)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showExport, showPromptEdit, showEditProject, showVersionHistory, isGenerating, currentStage])

    // Handle save manually (e.g. on blur or button click)
    const handleSave = async () => {
        await saveNow()
    }

    // Sync store generating state with local hook state (optional, if we want store to know)
    useEffect(() => {
        setStoreIsGenerating(isGenerating)
    }, [isGenerating, setStoreIsGenerating])

    const handleGenerate = async () => {
        generate(parseInt(projectId), currentStage)
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
            await updateProject(project.id, {
                name: editName,
                description: editDescription
            })
            setShowEditProject(false)
        } catch (error) {
            console.error('Failed to update project:', error)
        }
    }

    const handleDeleteProject = async () => {
        if (!confirm('確定要刪除此專案嗎？此操作無法恢復。')) return
        try {
            await deleteProject(parseInt(projectId))
            router.push('/')
        } catch (error) {
            console.error('Failed to delete project:', error)
        }
    }

    if (!project) {
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
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? '◀' : '▶'}
                        </button>
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
                        <button
                            onClick={() => setShowVersionHistory(!showVersionHistory)}
                            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${showVersionHistory
                                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                                : 'text-white/70 hover:text-white border-white/20'
                                }`}
                        >
                            📜 版本
                        </button>
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
                <aside
                    className={`${isSidebarOpen ? 'w-64 border-r' : 'w-0 overflow-hidden'
                        } border-white/10 h-[calc(100vh-65px)] sticky top-[65px] transition-all duration-300 ease-in-out bg-slate-900/50 backdrop-blur-sm`}
                >
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
                                            onClick={() => canAccess && navigateToStage(stageType)}
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
                                    {isSaving ? (
                                        <span className="text-xs text-white/50">保存中...</span>
                                    ) : hasUnsavedChanges ? (
                                        <span className="text-xs text-yellow-500/70">未保存</span>
                                    ) : (
                                        <span className="text-xs text-green-500/50">已保存</span>
                                    )}
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
                            <div className="flex-1 bg-slate-950/20">
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    onBlur={handleSave}
                                    placeholder={`在此輸入${STAGE_INFO[currentStage]?.name}內容，或點擊「AI 生成」自動生成...`}
                                    editable={getStageStatus(currentStage) !== 'locked'}
                                />
                            </div>

                            {/* Word Count */}
                            <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex justify-end">
                                <span className="text-xs text-white/50">
                                    字數：{content.replace(/<[^>]*>/g, '').length} 字
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

                {/* Version History Modal */}
                {showVersionHistory && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 rounded-xl w-[95vw] h-[95vh] overflow-hidden flex flex-col animate-slideUp">
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">版本歷史 - {STAGE_INFO[currentStage]?.name}</h3>
                                <button
                                    onClick={() => setShowVersionHistory(false)}
                                    className="text-white/50 hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <VersionHistory
                                    projectId={parseInt(projectId)}
                                    stageType={currentStage}
                                    onRestore={(restoredContent) => {
                                        setContent(restoredContent)
                                        setShowVersionHistory(false)
                                        showToast('版本已恢復', 'success')
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
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
