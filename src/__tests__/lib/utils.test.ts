import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
    it('merges class names correctly', () => {
        const result = cn('px-4', 'py-2', 'bg-blue-500')
        expect(result).toContain('px-4')
        expect(result).toContain('py-2')
        expect(result).toContain('bg-blue-500')
    })

    it('handles conditional classes', () => {
        const isActive = true
        const result = cn('base-class', isActive && 'active-class')
        expect(result).toContain('base-class')
        expect(result).toContain('active-class')
    })

    it('handles falsy values', () => {
        const result = cn('base-class', false && 'hidden', undefined, null)
        expect(result).toBe('base-class')
    })

    it('merges tailwind classes correctly (last wins)', () => {
        const result = cn('text-red-500', 'text-blue-500')
        expect(result).toContain('text-blue-500')
        expect(result).not.toContain('text-red-500')
    })
})

// Placeholder tests for formatter utilities (to be implemented in @/lib/utils)
// - formatCurrency: Format IDR currency
// - formatNumber: Format numbers with thousand separators
// - formatDate: Format dates in Indonesian format
// - formatPercentage: Format percentages
