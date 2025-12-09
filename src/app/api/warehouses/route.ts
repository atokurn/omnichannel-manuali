import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { warehouses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

export async function GET(request: NextRequest) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');

        if (!tenantId) {
            return NextResponse.json({ message: 'Tenant ID not found' }, { status: 400 });
        }

        await ensureRedisConnection();
        const cacheKey = `warehouses:tenant:${tenantId}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return NextResponse.json(JSON.parse(cachedData));
        }

        const warehousesData = await db.query.warehouses.findMany({
            where: eq(warehouses.tenantId, tenantId),
            columns: {
                id: true,
                name: true,
                location: true
            }
        });

        await redisClient.set(cacheKey, JSON.stringify(warehousesData), { EX: 3600 });

        return NextResponse.json(warehousesData);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        return NextResponse.json({ message: 'Failed to fetch warehouses' }, { status: 500 });
    }
}
