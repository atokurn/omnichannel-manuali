import { MaterialStatus } from './db/schema';

export interface PaginationState {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

export interface FormattedDynamicPrice {
    id: string;
    supplier: string;
    price: number;
    materialId?: string;
}

export interface FormattedMaterial {
    id: string;
    name: string;
    code: string;
    unit: string;
    stock: number;
    initialStock: number;
    basePrice: number;
    description?: string | null;
    status: MaterialStatus;
    isDynamicPrice: boolean;
    createdAt: string; // ISO string from JSON serialization
    updatedAt: string;
    productsCount?: number;
    imageUrl?: string | null;
    dynamicPrices?: FormattedDynamicPrice[];
    minStockLevel?: number;
    tenantId?: string;
    categoryId?: string | null;
}

export interface ApiResponse<T> {
    data: T;
    pagination?: PaginationState;
    error?: string;
}
