'use client'

import { useState, useEffect } from 'react'
import { StageVersion } from '@/types'

interface VersionHistoryProps {
    projectId: number
    stageType: string
    onRestore: (content: string) => void
}

export default function VersionHistory({ projectId, stageType, onRestore }: VersionHistoryProps) {
    const [versions, setVersions] = useState<StageVersion[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVersion, setSelectedVersion] = useState<StageVersion | null>(null)

    useEffect(() => {
        fetchVersions()
    }, [projectId, stageType])

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
        <div className="p-4">
            <h3 className="text-sm font-medium text-white/70 mb-3">版本歷史</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {versions.map((version) => (
                    <button
                        key={version.id}
                        onClick={() => setSelectedVersion(version)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedVersion?.id === version.id
                                ? 'bg-purple-600/20 border-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-medium text-white">
                                    版本 {version.version_number}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                    {version.source === 'ai' ? '🤖 AI 生成' : '✏️ 手動編輯'}
                                    {version.ai_model && ` • ${version.ai_model}`}
                                </div>
                            </div>
                            <div className="text-xs text-white/40">
                                {new Date(version.created_at).toLocaleString('zh-TW')}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Version Preview Modal */}
            {selectedVersion && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slideUp">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">
                                版本 {selectedVersion.version_number} 預覽
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
        </div>
    )
}
