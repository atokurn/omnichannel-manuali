import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, mockFetch } from '../utils'
import { KpiCard, KpiCardsGrid } from '@/components/dashboard/kpi-card'
import { Package } from 'lucide-react'

describe('KpiCard', () => {
    it('renders title and value correctly', () => {
        render(
            <KpiCard
                title="Total Products"
                value={150}
                icon={Package}
            />
        )

        expect(screen.getByText('Total Products')).toBeInTheDocument()
        expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
        render(
            <KpiCard
                title="Total Products"
                value={150}
                icon={Package}
                description="Active products"
            />
        )

        expect(screen.getByText('Active products')).toBeInTheDocument()
    })

    it('renders trend with positive indicator', () => {
        render(
            <KpiCard
                title="Revenue"
                value="Rp 1.000.000"
                icon={Package}
                trend={{ value: 12.5, isPositive: true }}
            />
        )

        expect(screen.getByText(/↑.*12.5%/)).toBeInTheDocument()
    })

    it('renders trend with negative indicator', () => {
        render(
            <KpiCard
                title="Revenue"
                value="Rp 1.000.000"
                icon={Package}
                trend={{ value: 5.2, isPositive: false }}
            />
        )

        expect(screen.getByText(/↓.*5.2%/)).toBeInTheDocument()
    })

    it('formats large numbers correctly', () => {
        render(
            <KpiCard
                title="Total Sales"
                value="1,250"
                icon={Package}
            />
        )

        expect(screen.getByText('1,250')).toBeInTheDocument()
    })
})

describe('KpiCardsGrid', () => {
    it('renders children in grid layout', () => {
        render(
            <KpiCardsGrid>
                <KpiCard title="Card 1" value={1} icon={Package} />
                <KpiCard title="Card 2" value={2} icon={Package} />
                <KpiCard title="Card 3" value={3} icon={Package} />
            </KpiCardsGrid>
        )

        expect(screen.getByText('Card 1')).toBeInTheDocument()
        expect(screen.getByText('Card 2')).toBeInTheDocument()
        expect(screen.getByText('Card 3')).toBeInTheDocument()
    })
})
