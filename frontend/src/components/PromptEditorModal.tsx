'use client'

import { useState, useEffect } from 'react'
import { StageType, STAGE_INFO } from '@/types'

interface PromptEditorModalProps {
    stageType: StageType
    onClose: () => void
}

export default function PromptEditorModal({ stageType, onClose }: PromptEditorModalProps) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [resetting, setResetting] = useState(false)

    useEffect(() => {
        fetchPrompt()
    }, [stageType])

    const fetchPrompt = async () => {
        try {
            const res = await fetch(`/api/v1/prompts/${stageType}`)
            if (res.ok) {
                const data = await res.json()
                setContent(data.content)
            }
        } catch (error) {
            console.error('Failed to fetch prompt:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/v1/prompts/${stageType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            if (res.ok) {
                onClose()
            }
        } catch (error) {
            console.error('Failed to save prompt:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleReset = async () => {
        if (!confirm('確定要將提示詞重置為系統預設值嗎？')) return

        setResetting(true)
        try {
            const res = await fetch(`/api/v1/prompts/${stageType}/reset`, {
                method: 'POST'
            })
            if (res.ok) {
                const data = await res.json()
                setContent(data.content)
            }
        } catch (error) {
            console.error('Failed to reset prompt:', error)
        } finally {
            setResetting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl h-[80vh] flex flex-col animate-slideUp">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>{STAGE_INFO[stageType].icon}</span>
                        編輯提示詞 - {STAGE_INFO[stageType].name}
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
                </div>

                <div className="flex-1 min-h-0 bg-slate-900 rounded-lg border border-white/10 p-4 mb-4">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-white/50">載入中...</div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                            placeholder="在此編輯提示詞..."
                        />
                    )}
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={handleReset}
                        disabled={resetting || loading}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/20"
                    >
                        {resetting ? '重置中...' : '重置為預設值'}
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg min-w-[80px]"
                        >
                            {saving ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
