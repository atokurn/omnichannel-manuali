import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'

// Custom render function that wraps components with necessary providers
function customRender(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, {
        // Add any global providers here
        ...options,
    })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }

// Helper for async component testing
export async function waitForLoadingToFinish() {
    // Wait for any loading states to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))
}

// Helper to create mock fetch responses
export function createMockFetchResponse<T>(data: T, status = 200) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        headers: new Headers(),
        redirected: false,
        statusText: status === 200 ? 'OK' : 'Error',
        type: 'basic' as ResponseType,
        url: '',
        clone: function () { return this },
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
    } as Response)
}

// Helper for mocking API calls
export function mockFetch(data: unknown, status = 200) {
    global.fetch = vi.fn().mockImplementation(() =>
        createMockFetchResponse(data, status)
    )
}

// Type-safe mock function creator
export function createMockFn<T extends (...args: unknown[]) => unknown>() {
    return vi.fn() as unknown as T
}
