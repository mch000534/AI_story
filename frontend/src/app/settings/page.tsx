'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AISettings {
    id: number
    name: string
    provider: string
    base_url: string
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    is_default: boolean
    has_api_key: boolean
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<AISettings[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [testing, setTesting] = useState<number | null>(null)
    const [testResult, setTestResult] = useState<{ id: number; success: boolean; message: string } | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        provider: 'openai',
        api_key: '',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4',
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 4096,
        is_default: false,
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/v1/settings/ai')
            if (res.ok) {
                const data = await res.json()
                setSettings(data.items || [])
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/v1/settings/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                fetchSettings()
                setShowForm(false)
                setFormData({
                    name: '',
                    provider: 'openai',
                    api_key: '',
                    base_url: 'https://api.openai.com/v1',
                    model: 'gpt-4',
                    temperature: 0.7,
                    top_p: 1.0,
                    max_tokens: 4096,
                    is_default: false,
                })
            }
        } catch (error) {
            console.error('Failed to create settings:', error)
        }
    }

    const handleTest = async (id: number) => {
        setTesting(id)
        setTestResult(null)
        try {
            const res = await fetch(`/api/v1/settings/ai/${id}/test`, { method: 'POST' })
            const data = await res.json()
            setTestResult({ id, success: data.success, message: data.message })
        } catch (error) {
            setTestResult({ id, success: false, message: '測試失敗' })
        } finally {
            setTesting(null)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('確定要刪除此設定？')) return
        try {
            const res = await fetch(`/api/v1/settings/ai/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchSettings()
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-white/70 hover:text-white">← 返回</Link>
                        <h1 className="text-xl font-semibold text-white">設定</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-4xl">
                {/* AI Settings Section */}
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">AI 模型設定</h2>
                            <p className="text-white/60 text-sm mt-1">配置 AI API 連接以啟用內容生成功能</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium"
                        >
                            + 新增配置
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : settings.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-4xl mb-4">🔧</div>
                            <h3 className="text-lg font-medium text-white mb-2">尚未配置 AI 設定</h3>
                            <p className="text-white/60 text-sm mb-4">請新增 AI API 配置以使用生成功能</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
                            >
                                新增配置
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {settings.map((setting) => (
                                <div
                                    key={setting.id}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-white">{setting.name}</h3>
                                                {setting.is_default && (
                                                    <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded">預設</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-white/60 mt-1">
                                                {setting.provider} / {setting.model}
                                            </div>
                                            <div className="text-xs text-white/40 mt-1">
                                                溫度: {setting.temperature} | Top-P: {setting.top_p} | Max Tokens: {setting.max_tokens}
                                            </div>
                                            {testResult?.id === setting.id && (
                                                <div className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                                    {testResult.success ? '✓ ' : '✗ '}{testResult.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleTest(setting.id)}
                                                disabled={testing === setting.id}
                                                className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg"
                                            >
                                                {testing === setting.id ? '測試中...' : '測試連接'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(setting.id)}
                                                className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                            >
                                                刪除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Add Settings Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
                        <h2 className="text-xl font-bold text-white mb-4">新增 AI 配置</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">配置名稱</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="例如：OpenAI GPT-4"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">API Key</label>
                                <input
                                    type="password"
                                    value={formData.api_key}
                                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="sk-..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Base URL</label>
                                <input
                                    type="text"
                                    value={formData.base_url}
                                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="https://api.openai.com/v1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">模型</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="gpt-4"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-1">溫度</label>
                                    <input
                                        type="number"
                                        value={formData.temperature}
                                        onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/70 mb-1">Top-P</label>
                                    <input
                                        type="number"
                                        value={formData.top_p}
                                        onChange={(e) => setFormData({ ...formData, top_p: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/70 mb-1">Max Tokens</label>
                                    <input
                                        type="number"
                                        value={formData.max_tokens}
                                        onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        min="100"
                                        max="16000"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="is_default" className="text-sm text-white/70">設為預設配置</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
