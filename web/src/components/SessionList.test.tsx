import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from '@/lib/i18n-context'
import type { SessionSummary } from '@/types/api'
import { SessionList } from './SessionList'

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <I18nProvider>
            {ui}
        </I18nProvider>
    )
}

function createSession(overrides: Partial<SessionSummary> = {}): SessionSummary {
    return {
        id: 'session-1',
        active: false,
        thinking: false,
        activeAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
            path: '/workspace/project-a',
            machineId: 'machine-1'
        },
        todoProgress: null,
        pendingRequestsCount: 0,
        ...overrides
    }
}

describe('SessionList project quick-create action', () => {
    afterEach(() => {
        cleanup()
    })

    beforeEach(() => {
        localStorage.setItem('hapi-lang', 'en')
    })

    it('passes project directory and machineId when clicking group-level +', () => {
        const onNewSession = vi.fn()
        renderWithProviders(
            <SessionList
                sessions={[createSession()]}
                onSelect={vi.fn()}
                onNewSession={onNewSession}
                onRefresh={vi.fn()}
                isLoading={false}
                renderHeader={false}
                api={null}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'New Session in this project' }))

        expect(onNewSession).toHaveBeenCalledTimes(1)
        expect(onNewSession).toHaveBeenCalledWith({
            directory: '/workspace/project-a',
            machineId: 'machine-1'
        })
    })

    it('hides verbose metadata row in compact mode', () => {
        renderWithProviders(
            <SessionList
                sessions={[createSession()]}
                onSelect={vi.fn()}
                onNewSession={vi.fn()}
                onRefresh={vi.fn()}
                isLoading={false}
                renderHeader={false}
                api={null}
                density="compact"
            />
        )

        expect(screen.queryByText(/mode:/i)).not.toBeInTheDocument()
    })

    it('does not render group-level + for the Other group', () => {
        const view = renderWithProviders(
            <SessionList
                sessions={[
                    createSession({
                        id: 'session-other',
                        metadata: null
                    })
                ]}
                onSelect={vi.fn()}
                onNewSession={vi.fn()}
                onRefresh={vi.fn()}
                isLoading={false}
                renderHeader={false}
                api={null}
            />
        )

        expect(view.queryByRole('button', { name: 'New Session in this project' })).not.toBeInTheDocument()
    })
})
