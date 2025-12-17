import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils'
import { LowStockWidget } from '@/components/dashboard/low-stock-widget'

const mockLowStockItems = [
    {
        id: '1',
        name: 'Material A',
        sku: 'MAT-001',
        currentStock: 5,
        minStock: 20,
        type: 'material' as const,
    },
    {
        id: '2',
        name: 'Product B',
        sku: 'PRD-002',
        currentStock: 15,
        minStock: 20,
        type: 'product' as const,
    },
]

describe('LowStockWidget', () => {
    it('renders title correctly', () => {
        render(<LowStockWidget items={[]} />)
        expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    })

    it('renders custom title when provided', () => {
        render(<LowStockWidget items={[]} title="Stock Rendah" />)
        expect(screen.getByText('Stock Rendah')).toBeInTheDocument()
    })

    it('shows empty state when no items', () => {
        render(<LowStockWidget items={[]} />)
        expect(screen.getByText('Tidak ada item dengan stok rendah')).toBeInTheDocument()
    })

    it('renders items correctly', () => {
        render(<LowStockWidget items={mockLowStockItems} />)

        expect(screen.getByText('Material A')).toBeInTheDocument()
        expect(screen.getByText('Product B')).toBeInTheDocument()
        expect(screen.getByText(/SKU: MAT-001/)).toBeInTheDocument()
        expect(screen.getByText(/SKU: PRD-002/)).toBeInTheDocument()
    })

    it('shows correct item count badge', () => {
        render(<LowStockWidget items={mockLowStockItems} />)
        expect(screen.getByText('2 items')).toBeInTheDocument()
    })

    it('displays Critical badge for items below 50% of min stock', () => {
        render(<LowStockWidget items={mockLowStockItems} />)
        // Material A has 5/20 = 25%, should be critical
        expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    it('displays Low badge for items between 50-100% of min stock', () => {
        render(<LowStockWidget items={mockLowStockItems} />)
        // Product B has 15/20 = 75%, should be low (not critical)
        expect(screen.getByText('Low')).toBeInTheDocument()
    })

    it('shows stock percentage correctly', () => {
        render(<LowStockWidget items={mockLowStockItems} />)
        // 5/20 = 25%
        expect(screen.getByText('25%')).toBeInTheDocument()
        // 15/20 = 75%
        expect(screen.getByText('75%')).toBeInTheDocument()
    })
})
