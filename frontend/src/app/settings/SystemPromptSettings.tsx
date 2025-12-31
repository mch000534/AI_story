
'use client'

import { useState, useEffect } from 'react'

interface SystemPrompt {
    id: number
    stage: string
    content: string
}

const STAGE_NAMES: Record<string, string> = {
    idea: "靈感發想",
    story: "故事大綱",
    script: "劇本初稿",
    character: "角色設計",
    scene: "場景設計",
    storyboard: "分鏡腳本",
    image_prompt: "AI 圖像提示詞",
    motion_prompt: "動態分鏡提示詞",
}

export default function SystemPromptSettings() {
    const [prompts, setPrompts] = useState<SystemPrompt[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStage, setSelectedStage] = useState<string>('idea')
    const [editingPrompt, setEditingPrompt] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchPrompts()
    }, [])

    useEffect(() => {
        if (prompts.length > 0) {
            const current = prompts.find(p => p.stage === selectedStage)
            setEditingPrompt(current?.content || '')
        }
    }, [selectedStage, prompts])

    const fetchPrompts = async () => {
        try {
            const res = await fetch('/api/v1/prompts')
            if (res.ok) {
                const data = await res.json()
                setPrompts(data)
            }
        } catch (error) {
            console.error('Failed to fetch prompts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/v1/prompts/${selectedStage}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editingPrompt })
            })
            if (res.ok) {
                const updated = await res.json()
                setPrompts(prev => prev.map(p => p.stage === selectedStage ? updated : p))
                setMessage({ type: 'success', text: '保存成功' })
            } else {
                setMessage({ type: 'error', text: '保存失敗' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '保存時發生錯誤' })
        } finally {
            setSaving(false)
        }
    }

    const handleReset = async () => {
        if (!confirm('確定要還原此階段的預設提示詞？所有的修改將會遺失。')) return

        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/v1/prompts/${selectedStage}/reset`, {
                method: 'POST'
            })
            if (res.ok) {
                const updated = await res.json()
                setPrompts(prev => prev.map(p => p.stage === selectedStage ? updated : p))
                setEditingPrompt(updated.content)
                setMessage({ type: 'success', text: '已還原預設值' })
            } else {
                setMessage({ type: 'error', text: '還原失敗' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '還原時發生錯誤' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
    )

    return (
        <section className="mt-12 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">系統提示詞設定</h2>
                    <p className="text-white/60 text-sm mt-1">自定義各階段的 AI 系統提示詞以調整生成風格</p>
                </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
                        <div className="p-2 space-y-1">
                            {Object.entries(STAGE_NAMES).map(([key, name]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedStage(key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedStage === key
                                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-white">
                                {STAGE_NAMES[selectedStage]} 提示詞
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                    disabled={saving}
                                >
                                    還原預設
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                                    disabled={saving}
                                >
                                    {saving ? '保存中...' : '保存變更'}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="relative">
                            <textarea
                                value={editingPrompt}
                                onChange={(e) => setEditingPrompt(e.target.value)}
                                className="w-full h-[500px] bg-black/30 border border-white/10 rounded-lg p-4 text-white/90 text-sm font-mono leading-relaxed focus:border-purple-500 focus:outline-none resize-none"
                                spellCheck={false}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-white/30 pointer-events-none">
                                {editingPrompt.length} chars
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            提示：可以使用 {'{project_name}'}, {'{idea}'}, {'{story}'} 等變數插入上下文內容。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
