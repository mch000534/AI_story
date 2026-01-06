'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Project {
    id: number
    name: string
    description: string
    updated_at: string
}

export default function Home() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/v1/projects')
            const data = await res.json()
            setProjects(data.items || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const createProject = async (name: string, description: string) => {
        try {
            const res = await fetch('/api/v1/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            })
            if (res.ok) {
                fetchProjects()
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Failed to create project:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                    <h1 className="text-lg md:text-2xl font-bold text-white">
                        <span className="gradient-text bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI 故事創作
                        </span>
                    </h1>
                    <div className="flex gap-2 md:gap-4">
                        <Link
                            href="/settings"
                            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white/70 hover:text-white transition-colors"
                        >
                            ⚙️ <span className="hidden sm:inline">設定</span>
                        </Link>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium text-xs md:text-sm"
                        >
                            + <span className="hidden sm:inline">新建專案</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-6 py-6 md:py-12">
                <div className="mb-4 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">我的專案</h2>
                    <p className="text-white/60 text-sm md:text-base">管理您的故事創作專案</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-medium text-white mb-2">還沒有專案</h3>
                        <p className="text-white/60 mb-6">點擊「新建專案」開始您的創作之旅</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium"
                        >
                            新建專案
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/project/${project.id}`}
                                className="group p-4 md:p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
                            >
                                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2 group-hover:text-purple-300 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-white/60 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                                    {project.description || '無描述'}
                                </p>
                                <div className="text-xs text-white/40">
                                    更新於 {new Date(project.updated_at).toLocaleDateString('zh-TW')}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createProject}
                />
            )}
        </div>
    )
}

function CreateProjectModal({
    onClose,
    onCreate,
}: {
    onClose: () => void
    onCreate: (name: string, description: string) => void
}) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [templates, setTemplates] = useState<{ id: string, name: string, icon: string, description: string }[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    useEffect(() => {
        // Fetch templates
        fetch('/api/v1/templates/')
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(() => { })
    }, [])

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplate(templateId)
        try {
            const res = await fetch(`/api/v1/templates/${templateId}`)
            const data = await res.json()
            if (data.project) {
                setName(data.project.name)
                setDescription(data.project.description)
            }
        } catch (error) {
            console.error('Failed to load template:', error)
        }
    }

    // ESC to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-slate-800 rounded-xl p-4 md:p-6 w-full max-w-lg animate-slideUp max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg md:text-xl font-bold text-white mb-4">新建專案</h2>

                {/* Template Selection */}
                {templates.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm text-white/70 mb-2">選擇模板（可選）</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleTemplateSelect(t.id)}
                                    className={`p-2 rounded-lg text-center transition-all ${selectedTemplate === t.id
                                            ? 'bg-purple-600/30 border-purple-500 border'
                                            : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                                        }`}
                                    title={t.description}
                                >
                                    <span className="text-xl">{t.icon}</span>
                                    <div className="text-xs text-white/70 mt-1 truncate">{t.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/70 mb-1">專案名稱</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-purple-500 focus:outline-none"
                            placeholder="輸入專案名稱"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">描述（選填）</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-purple-500 focus:outline-none resize-none"
                            rows={3}
                            placeholder="簡單描述您的故事構想"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => onCreate(name, description)}
                        disabled={!name.trim()}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        創建
                    </button>
                </div>
            </div>
        </div>
    )
}
