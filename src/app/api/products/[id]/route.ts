import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const { id } = params;
        const cacheKey = `product:${id}`;

        await ensureRedisConnection();
        const cached = await redisClient.get(cacheKey);
        if (cached) return NextResponse.json(JSON.parse(cached));

        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                category: { columns: { name: true } },
                inventories: {
                    with: { warehouse: { columns: { name: true } } }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        if (product.tenantId !== tenantId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await redisClient.set(cacheKey, JSON.stringify(product), { EX: 3600 });
        return NextResponse.json(product);

    } catch (error) {
        console.error('Failed to fetch product:', error);
        return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
    }
}
