'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SystemPromptSettings from './SystemPromptSettings'

import { AISettings } from '@/types'
import { useSettingsStore } from '@/stores/settingsStore'

// 預設配置模板
const PRESET_CONFIGS = {
    openrouter: {
        name: 'OpenRouter',
        provider: 'openrouter',
        base_url: 'https://openrouter.ai/api/v1',
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 8192,
    },
    openai: {
        name: 'OpenAI GPT-4',
        provider: 'openai',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4',
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 4096,
    },
    minimax: {
        name: 'MiniMax M2.1',
        provider: 'openrouter',
        base_url: 'https://openrouter.ai/api/v1',
        model: 'minimax/minimax-m2.1',
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 8192,
    }
}

const DEFAULT_FORM_DATA = {
    id: null as number | null,
    name: '',
    provider: 'openrouter',
    api_key: '',
    base_url: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.7,
    top_p: 1.0,
    max_tokens: 8192,
    is_default: true,
}

export default function SettingsPage() {
    const {
        settings,
        isLoading: loading,
        fetchSettings,
        createSettings,
        updateSettings,
        deleteSettings,
        testConnection
    } = useSettingsStore()

    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [testing, setTesting] = useState<number | null>(null)
    const [testResult, setTestResult] = useState<{ id: number; success: boolean; message: string } | null>(null)

    const [formData, setFormData] = useState(DEFAULT_FORM_DATA)

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA)
        setEditMode(false)
        setShowForm(false)
    }

    const handleAddNew = () => {
        setFormData(DEFAULT_FORM_DATA)
        setEditMode(false)
        setShowForm(true)
    }

    const handleEdit = (setting: AISettings) => {
        setFormData({
            id: setting.id,
            name: setting.name,
            provider: setting.provider,
            api_key: '', // 不顯示已存在的 key
            base_url: setting.base_url,
            model: setting.model,
            temperature: setting.temperature,
            top_p: setting.top_p,
            max_tokens: setting.max_tokens,
            is_default: setting.is_default,
        })
        setEditMode(true)
        setShowForm(true)
    }

    const applyPreset = (presetKey: keyof typeof PRESET_CONFIGS) => {
        const preset = PRESET_CONFIGS[presetKey]
        setFormData(prev => ({
            ...prev,
            ...preset,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editMode && formData.id) {
                // 編輯模式 - 使用 PUT
                const updateData: Record<string, unknown> = {
                    name: formData.name,
                    provider: formData.provider,
                    base_url: formData.base_url,
                    model: formData.model,
                    temperature: formData.temperature,
                    top_p: formData.top_p,
                    max_tokens: formData.max_tokens,
                    is_default: formData.is_default,
                }
                // 只有在用戶輸入新 key 時才更新
                if (formData.api_key) {
                    updateData.api_key = formData.api_key
                }

                await updateSettings(formData.id, updateData)
                resetForm()
            } else {
                // 新增模式 - 使用 POST
                const { id, ...createData } = formData
                await createSettings(createData as Partial<AISettings>)
                resetForm()
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
        }
    }

    const handleTest = async (id: number) => {
        setTesting(id)
        setTestResult(null)
        try {
            const success = await testConnection(id)
            setTestResult({ id, success, message: success ? '測試成功' : '測試失敗' })
        } catch (error) {
            setTestResult({ id, success: false, message: '測試失敗' })
        } finally {
            setTesting(null)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('確定要刪除此設定？')) return
        try {
            await deleteSettings(id)
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const handleSetDefault = async (id: number) => {
        try {
            await updateSettings(id, { is_default: true })
        } catch (error) {
            console.error('Failed to set default:', error)
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
                            onClick={handleAddNew}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium"
                        >
                            + 新增配置
                        </button>
                    </div>

                    {/* OpenRouter 提示 */}
                    <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div>
                                <h4 className="font-medium text-blue-300 mb-1">推薦使用 OpenRouter</h4>
                                <p className="text-sm text-white/60">
                                    OpenRouter 提供統一的 API 接入多種 AI 模型（Claude、GPT-4、Gemini 等），
                                    訪問 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">openrouter.ai</a> 獲取 API Key。
                                </p>
                            </div>
                        </div>
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
                                onClick={handleAddNew}
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
                                        <div className="flex-1">
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
                                            <div className="text-xs text-white/40 mt-1">
                                                {setting.base_url}
                                            </div>
                                            {testResult?.id === setting.id && (
                                                <div className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                                    {testResult.success ? '✓ ' : '✗ '}{testResult.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            {!setting.is_default && (
                                                <button
                                                    onClick={() => handleSetDefault(setting.id)}
                                                    className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg"
                                                >
                                                    設為預設
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(setting)}
                                                className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg"
                                            >
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => handleTest(setting.id)}
                                                disabled={testing === setting.id}
                                                className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg"
                                            >
                                                {testing === setting.id ? '測試中...' : '測試'}
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

                <SystemPromptSettings />
            </main>

            {/* Add/Edit Settings Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editMode ? '編輯 AI 配置' : '新增 AI 配置'}
                        </h2>

                        {/* 預設配置按鈕 */}
                        {!editMode && (
                            <div className="mb-4">
                                <label className="block text-sm text-white/70 mb-2">快速選擇預設配置</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('openrouter')}
                                        className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30"
                                    >
                                        🌐 OpenRouter (推薦)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('minimax')}
                                        className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg border border-green-500/30"
                                    >
                                        🧠 MiniMax M2.1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('openai')}
                                        className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20"
                                    >
                                        OpenAI GPT-4
                                    </button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">配置名稱</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="例如：OpenRouter Claude"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">
                                    API Key {editMode && <span className="text-white/40">（留空則保持原有）</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.api_key}
                                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder={editMode ? "留空保持不變" : "sk-or-v1-..."}
                                    required={!editMode}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Base URL</label>
                                <input
                                    type="text"
                                    value={formData.base_url}
                                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="https://openrouter.ai/api/v1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">模型</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="anthropic/claude-3.5-sonnet"
                                />
                                <p className="text-xs text-white/40 mt-1">
                                    OpenRouter 模型列表: <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">openrouter.ai/models</a>
                                </p>
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
                                        max="32000"
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
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                                >
                                    {editMode ? '更新' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
