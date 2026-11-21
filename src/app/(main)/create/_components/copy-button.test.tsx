// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import CreateCopyButton from './copy-button'

function stubClipboard(writeText: () => Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
    })
}

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    cleanup()
    vi.useRealTimers()
})

async function clickCopy() {
    await act(async () => {
        fireEvent.click(screen.getByRole('button'))
        await Promise.resolve()
    })
}

describe('CreateCopyButton', () => {
    it('announces the copy and resets after two seconds', async () => {
        const writeText = vi.fn(async () => undefined)
        stubClipboard(writeText)
        render(<CreateCopyButton text="https://statbox.live/widget/x" />)

        await clickCopy()

        expect(writeText).toHaveBeenCalledWith('https://statbox.live/widget/x')
        expect(screen.getByRole('status').textContent).toBe('Copied')
        act(() => {
            vi.advanceTimersByTime(2000)
        })
        expect(screen.getByRole('status').textContent).toBe('')
    })

    it('says so when the browser refuses the clipboard', async () => {
        stubClipboard(async () => {
            throw new DOMException('denied', 'NotAllowedError')
        })
        render(<CreateCopyButton text="x" />)

        await clickCopy()

        expect(screen.getByRole('button').textContent).toContain('Copy failed')
        expect(screen.getByRole('status').textContent).toMatch(/select/i)
    })

    it('stops its timer when it unmounts', async () => {
        stubClipboard(async () => undefined)
        const { unmount } = render(<CreateCopyButton text="x" />)

        await clickCopy()
        unmount()

        expect(vi.getTimerCount()).toBe(0)
    })
})
