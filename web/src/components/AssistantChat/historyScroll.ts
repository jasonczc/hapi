export function restoreScrollTopByDelta(params: {
    previousScrollTop: number
    previousScrollHeight: number
    nextScrollHeight: number
}): number {
    const delta = params.nextScrollHeight - params.previousScrollHeight
    return Math.max(0, params.previousScrollTop + delta)
}

export function shouldTriggerLoadOlder(params: {
    previousScrollTop: number
    currentScrollTop: number
    thresholdPx: number
    isArmed: boolean
    isLoadingMessages: boolean
    isLoadingMoreMessages: boolean
    hasMoreMessages: boolean
    lastTriggeredAtMs: number
    nowMs: number
    cooldownMs: number
}): boolean {
    const crossedIntoTopTriggerZone = (
        params.previousScrollTop > params.thresholdPx
        && params.currentScrollTop <= params.thresholdPx
    )
    const isUserScrollingUp = params.currentScrollTop < params.previousScrollTop - 0.5

    return (
        crossedIntoTopTriggerZone
        && isUserScrollingUp
        && params.isArmed
        && (params.nowMs - params.lastTriggeredAtMs > params.cooldownMs)
        && !params.isLoadingMessages
        && !params.isLoadingMoreMessages
        && params.hasMoreMessages
    )
}
