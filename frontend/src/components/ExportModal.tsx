'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { useToast } from '@/hooks/useToast'

interface ExportModalProps {
    projectId: number
    projectName: string
    onClose: () => void
}

export default function ExportModal({ projectId, projectName, onClose }: ExportModalProps) {
    const [exporting, setExporting] = useState<string | null>(null)
    const { showToast } = useToast()

    const handleExport = async (type: string, format?: string) => {
        setExporting(type)
        try {
            const pid = projectId.toString()
            let endpoint = ''

            switch (type) {
                case 'script':
                    endpoint = API_ENDPOINTS.EXPORT.SCRIPT(pid)
                    break
                case 'storyboard':
                    endpoint = API_ENDPOINTS.EXPORT.STORYBOARD(pid)
                    break
                case 'prompts':
                    endpoint = API_ENDPOINTS.EXPORT.PROMPTS(pid)
                    break
                case 'complete':
                    endpoint = API_ENDPOINTS.EXPORT.COMPLETE(pid)
                    break
                default:
                    throw new Error('Unknown export type')
            }

            if (format) {
                endpoint += `?format=${format}`
            }

            // use apiClient.instance to get full response including headers
            const res = await apiClient.instance.post(endpoint, {}, {
                responseType: 'blob'
            })

            if (res.status === 200) {
                const blob = new Blob([res.data], { type: res.headers['content-type'] })
                const contentDisposition = res.headers['content-disposition']
                let filename = `${projectName}_${type}`

                if (contentDisposition) {
                    // Try to extract filename* (UTF-8) first, then filename
                    // Example: attachment; filename*=utf-8''encoded.ext; filename=default.ext
                    const matchUtf8 = contentDisposition.match(/filename\*=utf-8''(.+)/i)
                    if (matchUtf8) {
                        filename = decodeURIComponent(matchUtf8[1])
                    } else {
                        const match = contentDisposition.match(/filename="?([^";]+)"?/i)
                        if (match) filename = match[1]
                    }
                }

                // Fallback extension
                if (!filename.includes('.')) {
                    if (format === 'pdf') filename += '.pdf'
                    else if (format === 'docx') filename += '.docx'
                    else if (format === 'fountain') filename += '.fountain'
                    else if (type === 'storyboard') filename += '.xlsx'
                    else if (type === 'prompts') filename += '.txt'
                    else if (type === 'complete') filename += '.zip'
                }

                const downloadUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = downloadUrl
                a.download = filename
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(downloadUrl)
                a.remove()

                showToast('匯出成功', 'success')
            } else {
                showToast('匯出失敗', 'error')
            }
        } catch (error: any) {
            console.error('Export failed:', error)
            const message = error.message || '匯出失敗，請檢查網絡連接或稍後再試'
            showToast(`匯出失敗: ${message}`, 'error')
        } finally {
            setExporting(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-slate-800 rounded-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-white">匯出專案</h2>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white text-xl p-1"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Script exports */}
                    <div className="p-3 md:p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-medium text-white mb-2 md:mb-3 text-sm md:text-base">📜 劇本</h3>
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
                    <div className="p-3 md:p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-medium text-white mb-2 md:mb-3 text-sm md:text-base">🎬 分鏡表</h3>
                        <ExportButton
                            label="Excel"
                            loading={exporting === 'storyboard'}
                            onClick={() => handleExport('storyboard')}
                        />
                    </div>

                    {/* Prompts export */}
                    <div className="p-3 md:p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-medium text-white mb-2 md:mb-3 text-sm md:text-base">🖼️ AI 提示詞</h3>
                        <ExportButton
                            label="文字檔"
                            loading={exporting === 'prompts'}
                            onClick={() => handleExport('prompts')}
                        />
                    </div>

                    {/* Complete export */}
                    <div className="p-3 md:p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <h3 className="font-medium text-white mb-2 md:mb-3 text-sm md:text-base">📦 完整專案</h3>
                        <p className="text-xs text-white/60 mb-2 md:mb-3">
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
                    className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm md:text-base"
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
