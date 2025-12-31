import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions<T> {
    value: T
    onSave: (value: T) => Promise<void> | void
    delay?: number
    enabled?: boolean
}

interface UseAutoSaveReturn {
    isSaving: boolean
    hasUnsavedChanges: boolean
    lastSavedAt: Date | null
    saveNow: () => Promise<void>
}

export function useAutoSave<T>({
    value,
    onSave,
    delay = 2000,
    enabled = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
    const [isSaving, setIsSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

    // Use refs to keep track of latest values without triggering effects
    const valueRef = useRef(value)
    const onSaveRef = useRef(onSave)
    const lastSavedValueRef = useRef(value)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        valueRef.current = value
    }, [value])

    useEffect(() => {
        onSaveRef.current = onSave
    }, [onSave])

    // Detect changes
    useEffect(() => {
        if (!enabled) return

        // Deep comparison could be expensive, here we assume simple equality or ref equality is enough for now.
        // For strings (our main use case), strict equality is fine.
        if (value !== lastSavedValueRef.current) {
            setHasUnsavedChanges(true)

            // Clear existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            // Set new timer
            timerRef.current = setTimeout(async () => {
                await performSave()
            }, delay)
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [value, delay, enabled])

    const performSave = useCallback(async () => {
        if (!hasUnsavedChanges && valueRef.current === lastSavedValueRef.current) return

        setIsSaving(true)
        try {
            await onSaveRef.current(valueRef.current)
            lastSavedValueRef.current = valueRef.current
            setLastSavedAt(new Date())
            setHasUnsavedChanges(false)
        } catch (error) {
            console.error('AutoSave failed:', error)
        } finally {
            setIsSaving(false)
        }
    }, [hasUnsavedChanges])

    // Manual save
    const saveNow = useCallback(async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        await performSave()
    }, [performSave])

    return {
        isSaving,
        hasUnsavedChanges,
        lastSavedAt,
        saveNow
    }
}
