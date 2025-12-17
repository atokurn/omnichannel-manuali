import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../src/lib/db/schema';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const queryClient = postgres(connectionString);
const db = drizzle(queryClient, { schema });

async function main() {
    console.log('🌱 Starting seed...');

    // Create basic permissions
    const permissionsToCreate = [
        { id: crypto.randomUUID(), name: 'view_dashboard', description: 'Can view the main dashboard', resource: 'dashboard', action: 'read' },
        { id: crypto.randomUUID(), name: 'manage_inventory', description: 'Can manage product inventory', resource: 'inventory', action: 'manage' },
        { id: crypto.randomUUID(), name: 'view_products', description: 'Can view products', resource: 'products', action: 'read' },
        { id: crypto.randomUUID(), name: 'manage_products', description: 'Can manage products', resource: 'products', action: 'manage' },
        { id: crypto.randomUUID(), name: 'manage_orders', description: 'Can manage sales orders', resource: 'orders', action: 'manage' },
        { id: crypto.randomUUID(), name: 'view_users', description: 'Can view users', resource: 'users', action: 'read' },
        { id: crypto.randomUUID(), name: 'manage_users', description: 'Can manage users', resource: 'users', action: 'manage' },
    ];

    const createdPermissions: typeof permissionsToCreate = [];

    for (const permData of permissionsToCreate) {
        // Check if permission exists
        const existing = await db.query.permissions.findFirst({
            where: (p, { eq }) => eq(p.name, permData.name)
        });

        if (existing) {
            console.log(`  ✓ Permission exists: ${permData.name}`);
            createdPermissions.push({ ...permData, id: existing.id });
        } else {
            const [inserted] = await db.insert(schema.permissions).values(permData).returning();
            console.log(`  + Created permission: ${inserted.name}`);
            createdPermissions.push(permData);
        }
    }

    console.log(`\n✅ Seeded ${createdPermissions.length} permissions`);
    console.log('🌱 Seed completed!');

    process.exit(0);
}

main().catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
});
