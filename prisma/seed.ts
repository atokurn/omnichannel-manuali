import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create basic permissions if they don't exist
  const permissionsToCreate = [
    { name: 'view_dashboard', description: 'Can view the main dashboard' },
    { name: 'manage_inventory', description: 'Can manage product inventory' },
    { name: 'view_products', description: 'Can view products' },
    { name: 'manage_orders', description: 'Can manage sales orders' },
    { name: 'view_users', description: 'Can view users' },
    // Add other essential permissions as needed
  ];

  const createdPermissions = [];
  for (const permData of permissionsToCreate) {
    const permission = await prisma.permission.upsert({
      where: { name: permData.name },
      update: {},
      create: permData,
    });
    createdPermissions.push(permission);
    console.log(`Created/found permission: ${permission.name}`);
  }

  // Create 'USER' role if it doesn't exist and connect basic permissions
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard user role with basic permissions',
      permissions: {
        connect: [
          { name: 'view_dashboard' },
          { name: 'view_products' },
          // Connect other relevant basic permissions for a standard user
        ],
      },
    },
    include: { permissions: true }, // Include permissions to check connections
  });
  console.log(`Created/found role: ${userRole.name} with permissions: ${userRole.permissions.map(p => p.name).join(', ')}`);

  // Create 'ADMIN' role if it doesn't exist and connect all permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role with all permissions',
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id })), // Connect all created permissions
      },
    },
     include: { permissions: true },
  });
  console.log(`Created/found role: ${adminRole.name} with permissions: ${adminRole.permissions.map(p => p.name).join(', ')}`);

  // You could also create a default admin user here if needed
  // Example:
  // const adminUser = await prisma.user.upsert({ ... });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });