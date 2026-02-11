import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '@/lib/i18n-context'
import type { ApiClient } from '@/api/client'
import type { Machine } from '@/types/api'
import { NewSession } from './index'

function renderWithProviders(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        }
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                {ui}
            </I18nProvider>
        </QueryClientProvider>
    )
}

describe('NewSession initial directory preset', () => {
    afterEach(() => {
        cleanup()
    })

    beforeEach(() => {
        localStorage.clear()
        localStorage.setItem('hapi-lang', 'en')
        localStorage.setItem('hapi:lastMachineId', 'machine-1')
        localStorage.setItem('hapi:recentPaths', JSON.stringify({
            'machine-1': ['/recent/path']
        }))
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: false,
                media: '',
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })
    })

    it('keeps initialDirectory instead of overriding with recent path', async () => {
        const getSessions = vi.fn(async () => ({ sessions: [] }))
        const checkMachinePathsExists = vi.fn(async (_machineId: string, paths: string[]) => ({
            exists: Object.fromEntries(paths.map((path) => [path, true]))
        }))

        const api = {
            getSessions,
            checkMachinePathsExists,
            spawnSession: vi.fn()
        } as unknown as ApiClient

        const machines: Machine[] = [
            {
                id: 'machine-1',
                active: true,
                metadata: {
                    host: 'devbox',
                    platform: 'linux',
                    happyCliVersion: '0.15.2'
                }
            }
        ]

        renderWithProviders(
            <NewSession
                api={api}
                machines={machines}
                initialDirectory="/preset/project"
                onSuccess={vi.fn()}
                onCancel={vi.fn()}
            />
        )

        await waitFor(() => {
            expect(checkMachinePathsExists).toHaveBeenCalled()
        })

        expect(screen.getByPlaceholderText('/path/to/project')).toHaveValue('/preset/project')
    })
})
