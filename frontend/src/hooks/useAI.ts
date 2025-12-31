import { useState, useRef, useEffect, useCallback } from 'react'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface UseAIOptions {
    onComplete?: () => void
    onError?: (error: string) => void
}

interface UseAIReturn {
    content: string
    setContent: (content: string | ((prev: string) => string)) => void
    isGenerating: boolean
    error: string | null
    generate: (projectId: number, stageType: string) => void
    stop: () => void
}

export function useAI({ onComplete, onError }: UseAIOptions = {}): UseAIReturn {
    const [content, setContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const stop = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
        setIsGenerating(false)
    }, [])

    const generate = useCallback((projectId: number, stageType: string) => {
        if (isGenerating) return

        setIsGenerating(true)
        setError(null)
        setContent('')

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws'
            // Strip protocol from backendUrl if present to avoid double protocol
            const cleanBackendUrl = backendUrl.replace(/^https?:\/\//, '')
            // Ensure we use the correct endpoint path. 
            // Note: API_ENDPOINTS.AI.GENERATE_WS is '/ai/ws/generate'
            // We need to match valid backend route: /api/v1/ai/ws/generate
            const wsUrl = `${wsProtocol}://${cleanBackendUrl}/api/v1${API_ENDPOINTS.AI.GENERATE_WS}`

            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    project_id: projectId,
                    stage_type: stageType,
                }))
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.type === 'token') {
                        setContent(prev => prev + data.content)
                    } else if (data.type === 'done') {
                        stop()
                        onComplete?.()
                    } else if (data.type === 'error') {
                        const errMsg = data.error || 'Unknown error'
                        setError(errMsg)
                        onError?.(errMsg)
                        stop()
                    }
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err)
                }
            }

            ws.onerror = (event) => {
                console.error('WebSocket Error:', event)
                setError('Connection failed')
                // Don't call stop() immediately here, as onClose usually follows
            }

            ws.onclose = () => {
                setIsGenerating(false)
                wsRef.current = null
            }

        } catch (err: any) {
            const errMsg = err.message || 'Failed to setup WebSocket'
            console.error(errMsg)
            setError(errMsg)
            onError?.(errMsg)
            setIsGenerating(false)
        }
    }, [isGenerating, onComplete, onError, stop])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    return {
        content,
        setContent,
        isGenerating,
        error,
        generate,
        stop
    }
}
