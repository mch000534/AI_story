'use client'

import { useState, useEffect, useCallback } from 'react'
import { StageVersion } from '@/types'
import VersionCompareModal from './VersionCompareModal'

interface VersionHistoryProps {
    projectId: number
    stageType: string
    onRestore: (content: string) => void
}

export default function VersionHistory({ projectId, stageType, onRestore }: VersionHistoryProps) {
    const [versions, setVersions] = useState<StageVersion[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVersion, setSelectedVersion] = useState<StageVersion | null>(null)
    const [compareVersions, setCompareVersions] = useState<StageVersion[]>([])
    const [compareIndices, setCompareIndices] = useState<[number, number]>([0, 1])
    const [showCompareModal, setShowCompareModal] = useState(false)

    useEffect(() => {
        fetchVersions()
        setCompareVersions([])  // Clear compare selection when stage changes
        setSelectedVersion(null)
    }, [projectId, stageType])

    // Keyboard navigation for version preview
    useEffect(() => {
        if (!selectedVersion) return

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey
            if (!isMod) return

            const currentIndex = versions.findIndex(v => v.id === selectedVersion.id)

            if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault()
                setSelectedVersion(versions[currentIndex - 1])
            } else if (e.key === 'ArrowDown' && currentIndex < versions.length - 1) {
                e.preventDefault()
                setSelectedVersion(versions[currentIndex + 1])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedVersion, versions])

    const fetchVersions = async () => {
        try {
            const res = await fetch(`/api/v1/projects/${projectId}/stages/${stageType}/versions`)
            if (res.ok) {
                const data = await res.json()
                setVersions(data.items || [])
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async (version: StageVersion) => {
        try {
            const res = await fetch(`/api/v1/projects/${projectId}/stages/${stageType}/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_id: version.id })
            })
            if (res.ok) {
                onRestore(version.content)
                setSelectedVersion(null)
            }
        } catch (error) {
            console.error('Failed to restore version:', error)
        }
    }

    const handleVersionClick = (version: StageVersion) => {
        setSelectedVersion(version)
    }

    const toggleCompareSelection = (version: StageVersion) => {
        if (isSelected(version)) {
            // Remove from selection
            setCompareVersions(compareVersions.filter(v => v.id !== version.id))
        } else if (compareVersions.length < 2) {
            // Add to selection
            setCompareVersions([...compareVersions, version])
        } else {
            // Replace second selection
            setCompareVersions([compareVersions[0], version])
        }
    }

    const isSelected = (version: StageVersion) => {
        return compareVersions.some(v => v.id === version.id)
    }

    const handleRename = async (version: StageVersion) => {
        const newLabel = prompt('請輸入版本名稱：', (version as any).label || `版本 ${version.version_number}`)
        if (newLabel === null) return

        try {
            const res = await fetch(
                `/api/v1/projects/${projectId}/stages/${stageType}/versions/${version.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ label: newLabel })
                }
            )
            if (res.ok) {
                fetchVersions()
            }
        } catch (error) {
            console.error('Failed to rename version:', error)
        }
    }

    const handleDelete = async (version: StageVersion) => {
        if (!confirm(`確定要刪除版本 ${(version as any).label || version.version_number} 嗎？此操作無法恢復。`)) return

        try {
            const res = await fetch(
                `/api/v1/projects/${projectId}/stages/${stageType}/versions/${version.id}`,
                { method: 'DELETE' }
            )
            if (res.ok) {
                fetchVersions()
            }
        } catch (error) {
            console.error('Failed to delete version:', error)
        }
    }

    if (loading) {
        return (
            <div className="p-4 text-center text-white/50">
                載入中...
            </div>
        )
    }

    if (versions.length === 0) {
        return (
            <div className="p-4 text-center text-white/50">
                尚無版本記錄
            </div>
        )
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-white/70">版本歷史</h3>
                {compareVersions.length === 2 && (
                    <button
                        onClick={() => setShowCompareModal(true)}
                        className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded"
                    >
                        查看比較
                    </button>
                )}
            </div>

            {compareVersions.length > 0 && compareVersions.length < 2 && (
                <div className="mb-3 p-2 bg-purple-900/20 rounded-lg text-xs text-purple-300">
                    請選擇第二個版本進行比較
                </div>
            )}

            <div className="flex-1 space-y-2 overflow-y-auto">
                {versions.map((version) => (
                    <div
                        key={version.id}
                        onClick={() => handleVersionClick(version)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${isSelected(version)
                            ? 'bg-purple-600/30 border-purple-500'
                            : selectedVersion?.id === version.id
                                ? 'bg-purple-600/20 border-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-white">
                                    {isSelected(version) && (
                                        <span className="inline-block w-5 h-5 text-center bg-purple-600 rounded-full mr-2 text-xs leading-5">
                                            {compareVersions.findIndex(v => v.id === version.id) + 1}
                                        </span>
                                    )}
                                    {(version as any).label || `版本 ${version.version_number}`}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                    {version.source === 'ai' ? '🤖 AI 生成' : '✏️ 手動編輯'}
                                    {version.ai_model && ` • ${version.ai_model}`}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-xs text-white/40">
                                    {new Date(version.created_at).toLocaleString('zh-TW')}
                                </div>
                                <div className="flex gap-1 mt-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRename(version)
                                        }}
                                        className="text-xs px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-white/60 hover:text-white"
                                        title="重命名"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleCompareSelection(version)
                                        }}
                                        className={`text-xs px-1.5 py-0.5 rounded ${isSelected(version)
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white'
                                            }`}
                                        title="選取比較"
                                    >
                                        ⚖️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(version)
                                        }}
                                        className="text-xs px-1.5 py-0.5 bg-red-500/10 hover:bg-red-500/30 rounded text-red-300/60 hover:text-red-300"
                                        title="刪除"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Version Preview Modal */}
            {selectedVersion && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-[95vw] h-[95vh] overflow-hidden flex flex-col animate-slideUp">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">
                                {(selectedVersion as any).label || `版本 ${selectedVersion.version_number}`} 預覽
                            </h2>
                            <button
                                onClick={() => setSelectedVersion(null)}
                                className="text-white/50 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg p-4 mb-4">
                            <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
                                {selectedVersion.content}
                            </pre>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedVersion(null)}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleRestore(selectedVersion)}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                            >
                                恢復此版本
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Version Compare Modal */}
            {showCompareModal && compareVersions.length === 2 && (
                <VersionCompareModal
                    leftVersion={{
                        number: compareVersions[0].version_number,
                        content: compareVersions[0].content,
                        createdAt: compareVersions[0].created_at,
                        label: (compareVersions[0] as any).label
                    }}
                    rightVersion={{
                        number: compareVersions[1].version_number,
                        content: compareVersions[1].content,
                        createdAt: compareVersions[1].created_at,
                        label: (compareVersions[1] as any).label
                    }}
                    onClose={() => {
                        setShowCompareModal(false)
                    }}
                    onApply={(content) => {
                        onRestore(content)
                        setShowCompareModal(false)
                        setCompareVersions([])
                    }}
                    canNavigateLeft={{
                        prev: versions.findIndex(v => v.id === compareVersions[0].id) > 0,
                        next: versions.findIndex(v => v.id === compareVersions[0].id) < versions.length - 1
                    }}
                    canNavigateRight={{
                        prev: versions.findIndex(v => v.id === compareVersions[1].id) > 0,
                        next: versions.findIndex(v => v.id === compareVersions[1].id) < versions.length - 1
                    }}
                    onNavigateLeft={(direction) => {
                        const currentIdx = versions.findIndex(v => v.id === compareVersions[0].id)
                        const newIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1
                        if (newIdx >= 0 && newIdx < versions.length) {
                            setCompareVersions([versions[newIdx], compareVersions[1]])
                        }
                    }}
                    onNavigateRight={(direction) => {
                        const currentIdx = versions.findIndex(v => v.id === compareVersions[1].id)
                        const newIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1
                        if (newIdx >= 0 && newIdx < versions.length) {
                            setCompareVersions([compareVersions[0], versions[newIdx]])
                        }
                    }}
                />
            )}
        </div>
    )
}

