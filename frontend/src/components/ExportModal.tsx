'use client'

import { useState } from 'react'

interface ExportModalProps {
    projectId: number
    projectName: string
    onClose: () => void
}

export default function ExportModal({ projectId, projectName, onClose }: ExportModalProps) {
    const [exporting, setExporting] = useState<string | null>(null)

    const handleExport = async (type: string, format?: string) => {
        setExporting(type)
        try {
            let url = `/api/v1/export/${type}/${projectId}`
            if (format) {
                url += `?format=${format}`
            }

            const res = await fetch(url, { method: 'POST' })
            if (res.ok) {
                const blob = await res.blob()
                const contentDisposition = res.headers.get('Content-Disposition')
                let filename = `${projectName}_${type}`
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename=(.+)/)
                    if (match) filename = match[1]
                }

                // Download file
                const downloadUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = downloadUrl
                a.download = filename
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(downloadUrl)
                a.remove()
            } else {
                alert('匯出失敗')
            }
        } catch (error) {
            console.error('Export failed:', error)
            alert('匯出失敗')
        } finally {
            setExporting(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md animate-slideUp">
                <h2 className="text-xl font-bold text-white mb-4">匯出專案</h2>

                <div className="space-y-3">
                    {/* Script exports */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-medium text-white mb-3">📜 劇本</h3>
                        <div className="flex flex-wrap gap-2">
                            <ExportButton
                                label="PDF"
                                loading={exporting === 'script-pdf'}
                                onClick={() => handleExport('script', 'pdf')}
                            />
                            <ExportButton
                                label="Word"
                                loading={exporting === 'script-docx'}
                                onClick={() => handleExport('script', 'docx')}
                            />
                            <ExportButton
                                label="Fountain"
                                loading={exporting === 'script-fountain'}
                                onClick={() => handleExport('script', 'fountain')}
                            />
                        </div>
                    </div>

                    {/* Storyboard export */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-medium text-white mb-3">🎬 分鏡表</h3>
                        <ExportButton
                            label="Excel"
                            loading={exporting === 'storyboard'}
                            onClick={() => handleExport('storyboard')}
                        />
                    </div>

                    {/* Prompts export */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-medium text-white mb-3">🖼️ AI 提示詞</h3>
                        <ExportButton
                            label="文字檔"
                            loading={exporting === 'prompts'}
                            onClick={() => handleExport('prompts')}
                        />
                    </div>

                    {/* Complete export */}
                    <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <h3 className="font-medium text-white mb-3">📦 完整專案</h3>
                        <p className="text-xs text-white/60 mb-3">
                            包含所有階段內容、劇本 PDF、分鏡表 Excel、提示詞文字檔
                        </p>
                        <ExportButton
                            label="下載 ZIP"
                            loading={exporting === 'complete'}
                            onClick={() => handleExport('complete')}
                            primary
                        />
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                    關閉
                </button>
            </div>
        </div>
    )
}

function ExportButton({
    label,
    loading,
    onClick,
    primary = false
}: {
    label: string
    loading: boolean
    onClick: () => void
    primary?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${primary
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? '匯出中...' : label}
        </button>
    )
}
