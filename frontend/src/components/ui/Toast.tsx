'use client'

import { useToast, ToastType } from '@/hooks/useToast'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
}

const bgMap: Record<ToastType, string> = {
    success: 'bg-green-500/20 border-green-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    warning: 'bg-yellow-500/20 border-yellow-500/30',
    info: 'bg-blue-500/20 border-blue-500/30'
}

export default function ToastContainer() {
    const { toasts, hideToast } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slideUp ${bgMap[toast.type]}`}
                >
                    {iconMap[toast.type]}
                    <span className="text-white text-sm">{toast.message}</span>
                    <button
                        onClick={() => hideToast(toast.id)}
                        className="ml-2 text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
