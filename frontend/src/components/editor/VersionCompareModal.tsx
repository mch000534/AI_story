'use client'

import { useEffect, useMemo } from 'react'
import * as Diff from 'diff'

interface VersionCompareModalProps {
    leftVersion: {
        number: number
        content: string
        createdAt: string
        label?: string
    }
    rightVersion: {
        number: number
        content: string
        createdAt: string
        label?: string
    }
    onClose: () => void
    onApply?: (content: string) => void
    // Navigation props
    canNavigateLeft?: { prev: boolean; next: boolean }
    canNavigateRight?: { prev: boolean; next: boolean }
    onNavigateLeft?: (direction: 'prev' | 'next') => void
    onNavigateRight?: (direction: 'prev' | 'next') => void
}

export default function VersionCompareModal({
    leftVersion,
    rightVersion,
    onClose,
    onApply,
    canNavigateLeft,
    canNavigateRight,
    onNavigateLeft,
    onNavigateRight
}: VersionCompareModalProps) {
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

    // Compute unified diff
    const diffResult = useMemo(() => {
        return Diff.diffLines(leftVersion.content, rightVersion.content)
    }, [leftVersion.content, rightVersion.content])

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl w-[95vw] h-[95vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">
                        版本比較
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Version Headers */}
                <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/10">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => onNavigateLeft?.('prev')}
                                disabled={!canNavigateLeft?.prev}
                                className="p-1 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="上一個版本"
                            >
                                ◀
                            </button>
                            <div className="text-sm font-medium text-white">
                                {leftVersion.label || `版本 ${leftVersion.number}`}
                            </div>
                            <button
                                onClick={() => onNavigateLeft?.('next')}
                                disabled={!canNavigateLeft?.next}
                                className="p-1 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="下一個版本"
                            >
                                ▶
                            </button>
                        </div>
                        <div className="text-xs text-white/50 mt-1">
                            {new Date(leftVersion.createdAt).toLocaleString('zh-TW')}
                        </div>
                        {onApply && (
                            <button
                                onClick={() => {
                                    onApply(leftVersion.content)
                                    onClose()
                                }}
                                className="mt-2 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded"
                            >
                                套用此版本
                            </button>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => onNavigateRight?.('prev')}
                                disabled={!canNavigateRight?.prev}
                                className="p-1 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="上一個版本"
                            >
                                ◀
                            </button>
                            <div className="text-sm font-medium text-white">
                                {rightVersion.label || `版本 ${rightVersion.number}`}
                            </div>
                            <button
                                onClick={() => onNavigateRight?.('next')}
                                disabled={!canNavigateRight?.next}
                                className="p-1 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="下一個版本"
                            >
                                ▶
                            </button>
                        </div>
                        <div className="text-xs text-white/50 mt-1">
                            {new Date(rightVersion.createdAt).toLocaleString('zh-TW')}
                        </div>
                        {onApply && (
                            <button
                                onClick={() => {
                                    onApply(rightVersion.content)
                                    onClose()
                                }}
                                className="mt-2 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded"
                            >
                                套用此版本
                            </button>
                        )}
                    </div>
                </div>

                {/* Diff View */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                        {diffResult.map((part, index) => {
                            const bgColor = part.added
                                ? 'bg-green-900/40'
                                : part.removed
                                    ? 'bg-red-900/40'
                                    : ''
                            const textColor = part.added
                                ? 'text-green-300'
                                : part.removed
                                    ? 'text-red-300'
                                    : 'text-white/70'
                            const prefix = part.added ? '+' : part.removed ? '-' : ' '

                            return (
                                <div key={index} className={`${bgColor} whitespace-pre-wrap`}>
                                    {part.value.split('\n').map((line, lineIndex) => (
                                        line && (
                                            <div
                                                key={lineIndex}
                                                className={`${textColor} px-2 py-0.5`}
                                            >
                                                <span className="inline-block w-4 mr-2 text-white/30">{prefix}</span>
                                                {line}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex justify-center gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-green-900/50 rounded"></span>
                            新增
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-900/50 rounded"></span>
                            刪除
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-slate-700 rounded"></span>
                            未變更
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
