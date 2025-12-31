import { useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useStageStore } from '@/stores/stageStore'
import { STAGE_ORDER, StageType } from '@/types'

export function useStageNavigation() {
    const router = useRouter()
    const pathname = usePathname()
    // Optional: Sync with URL params if we want shareable URLs for stages
    // const searchParams = useSearchParams()

    const { currentStage, setCurrentStage, stages } = useStageStore()

    const navigateToStage = useCallback((stageType: StageType) => {
        // Here we can check if stage is locked, but we relaxed this rule.
        // We can just set the store state.
        setCurrentStage(stageType)

        // Optionally update URL query param without refreshing
        // const params = new URLSearchParams(searchParams.toString())
        // params.set('stage', stageType)
        // router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [setCurrentStage])

    const nextStage = useCallback(() => {
        const currentIndex = STAGE_ORDER.indexOf(currentStage)
        if (currentIndex < STAGE_ORDER.length - 1) {
            const nextStageType = STAGE_ORDER[currentIndex + 1]
            navigateToStage(nextStageType)
        }
    }, [currentStage, navigateToStage])

    const prevStage = useCallback(() => {
        const currentIndex = STAGE_ORDER.indexOf(currentStage)
        if (currentIndex > 0) {
            const prevStageType = STAGE_ORDER[currentIndex - 1]
            navigateToStage(prevStageType)
        }
    }, [currentStage, navigateToStage])

    return {
        currentStage,
        navigateToStage,
        nextStage,
        prevStage,
        isFirstStage: currentStage === STAGE_ORDER[0],
        isLastStage: currentStage === STAGE_ORDER[STAGE_ORDER.length - 1]
    }
}
