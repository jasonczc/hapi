import { describe, expect, it } from 'vitest'
import { restoreScrollTopByDelta, shouldTriggerLoadOlder } from './historyScroll'

describe('historyScroll helpers', () => {
    it('restores scrollTop by scrollHeight delta', () => {
        expect(restoreScrollTopByDelta({
            previousScrollTop: 80,
            previousScrollHeight: 1000,
            nextScrollHeight: 1200
        })).toBe(280)
    })

    it('never returns negative restored scrollTop', () => {
        expect(restoreScrollTopByDelta({
            previousScrollTop: 20,
            previousScrollHeight: 1200,
            nextScrollHeight: 1000
        })).toBe(0)
    })

    it('triggers only when crossing top threshold while scrolling up', () => {
        expect(shouldTriggerLoadOlder({
            previousScrollTop: 120,
            currentScrollTop: 80,
            thresholdPx: 96,
            isArmed: true,
            isLoadingMessages: false,
            isLoadingMoreMessages: false,
            hasMoreMessages: true,
            lastTriggeredAtMs: 0,
            nowMs: 1000,
            cooldownMs: 300
        })).toBe(true)

        expect(shouldTriggerLoadOlder({
            previousScrollTop: 80,
            currentScrollTop: 70,
            thresholdPx: 96,
            isArmed: true,
            isLoadingMessages: false,
            isLoadingMoreMessages: false,
            hasMoreMessages: true,
            lastTriggeredAtMs: 0,
            nowMs: 1000,
            cooldownMs: 300
        })).toBe(false)
    })

    it('does not trigger during cooldown / loading / disarmed', () => {
        const base = {
            previousScrollTop: 120,
            currentScrollTop: 80,
            thresholdPx: 96,
            isLoadingMessages: false,
            isLoadingMoreMessages: false,
            hasMoreMessages: true,
            cooldownMs: 300
        }

        expect(shouldTriggerLoadOlder({
            ...base,
            isArmed: false,
            lastTriggeredAtMs: 0,
            nowMs: 1000
        })).toBe(false)

        expect(shouldTriggerLoadOlder({
            ...base,
            isArmed: true,
            isLoadingMoreMessages: true,
            lastTriggeredAtMs: 0,
            nowMs: 1000
        })).toBe(false)

        expect(shouldTriggerLoadOlder({
            ...base,
            isArmed: true,
            lastTriggeredAtMs: 900,
            nowMs: 1000
        })).toBe(false)
    })
})
