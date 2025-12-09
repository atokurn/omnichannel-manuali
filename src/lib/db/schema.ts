import { relations } from 'drizzle-orm';
import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    doublePrecision,
    json,
    unique,
    pgEnum,
    primaryKey,
    index
} from 'drizzle-orm/pg-core';

// Enums (Prisma enums are usually created as types in Postgres)
// Prisma Enum Name -> Postgres Type Name.
// Usually Prisma uses "TransactionType" (PascalCase) if defined so.
export const transactionTypeEnum = pgEnum('TransactionType', [
    'PURCHASE',
    'SALE',
    'TRANSFER',
    'ADJUSTMENT'
]);

export const transactionStatusEnum = pgEnum('TransactionStatus', [
    'PENDING',
    'COMPLETED',
    'CANCELLED'
]);

export const materialStatusEnum = pgEnum('MaterialStatus', [
    'AKTIF',
    'NONAKTIF'
]);

export enum MaterialStatus {
    AKTIF = 'AKTIF',
    NONAKTIF = 'NONAKTIF'
}

export const syncStatusEnum = pgEnum('SyncStatus', [
    'PENDING',
    'IN_PROGRESS',
    'SUCCESS',
    'FAILED',
    'PARTIAL_SUCCESS'
]);

export const productionStatusEnum = pgEnum('ProductionStatus', [
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
]);

export const productStockBatchSourceEnum = pgEnum('ProductStockBatchSource', [
    'PRODUCTION',
    'PURCHASE',
    'ADJUSTMENT'
]);

// Tables
// Note: Prisma 'String' @id @default(uuid()) is typically TEXT in Postgres unless @db.Uuid is used.
// We will use text() for IDs to be safe and compatible.

export const tenants = pgTable('Tenant', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    plan: text('plan').notNull().default('free'),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const users = pgTable('User', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    email: text('email').notNull(),
    name: text('name').notNull(),
    password: text('password').notNull(),
    status: text('status').notNull().default('active'),
    lastLogin: timestamp('lastLogin', { mode: 'date', precision: 3 }),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        emailTenantUnique: unique().on(table.email, table.tenantId)
    };
});

export const roles = pgTable('Role', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    description: text('description'),
    isDefault: boolean('isDefault').notNull().default(false),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        nameTenantUnique: unique().on(table.name, table.tenantId)
    };
});

export const permissions = pgTable('Permission', {
    id: text('id').primaryKey(),
    name: text('name').unique().notNull(),
    description: text('description'),
    resource: text('resource').notNull(),
    action: text('action').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const userRoles = pgTable('UserRole', {
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assignedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    assignedBy: text('assignedBy')
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.roleId] })
    };
});

// Explicit many-to-many table often implicit in Prisma, but needed if explicit model defined. 
// Prisma schema had `roles Role[] @relation("RolePermissions")`
// This usually implies a join table `_RolePermissions` or similar managed by Prisma if not explicit.
// Wait, looking at Step 10: `permissions Permission[] @relation("RolePermissions")`
// And `roles Role[] @relation("RolePermissions")` in Permission model.
// THIS IS AN IMPLICIT MANY-TO-MANY. Prisma creates table `_RolePermissions` (A, B).
// Drizzle NEEDS this table definition to access it, naming it `_RolePermissions` with columns `A` (Role) and `B` (Permission).
// I will SKIP defining `_RolePermissions` for now as I might not need to query it via Drizzle immediately.

export const categories = pgTable('Category', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        nameTenantUnique: unique().on(table.name, table.tenantId)
    };
});

export const products = pgTable('Product', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    description: text('description'),
    sku: text('sku'),
    price: doublePrecision('price').notNull(),
    cost: doublePrecision('cost'),
    minStockLevel: integer('minStockLevel').notNull().default(0),
    weight: doublePrecision('weight'),
    weightUnit: text('weightUnit'),
    packageLength: doublePrecision('packageLength'),
    packageWidth: doublePrecision('packageWidth'),
    packageHeight: doublePrecision('packageHeight'),
    isPreorder: boolean('isPreorder').notNull().default(false),
    preorderDays: integer('preorderDays'),
    purchaseLimit: integer('purchaseLimit'),
    hasVariants: boolean('hasVariants').notNull().default(false),
    mainImage: text('mainImage'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date()),
    createdById: text('createdById').notNull().references(() => users.id),
    categoryId: text('categoryId').references(() => categories.id)
});

export const productVariants = pgTable('ProductVariant', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const productVariantOptions = pgTable('ProductVariantOption', {
    id: text('id').primaryKey(),
    value: text('value').notNull(),
    image: text('image'),
    variantId: text('variantId').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const productVariantCombinations = pgTable('ProductVariantCombination', {
    id: text('id').primaryKey(),
    productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    combinationId: text('combinationId').notNull(),
    options: json('options').notNull(),
    price: doublePrecision('price').notNull(),
    quantity: integer('quantity').notNull(),
    sku: text('sku'),
    weight: doublePrecision('weight'),
    weightUnit: text('weightUnit'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        productCombinationUnique: unique().on(table.productId, table.combinationId)
    };
});

export const productImages = pgTable('ProductImage', {
    id: text('id').primaryKey(),
    url: text('url').notNull(),
    productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    isMain: boolean('isMain').notNull().default(false),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const productCompositions = pgTable('ProductComposition', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    productId: text('productId').references(() => products.id, { onDelete: 'cascade' }),
    isTemplate: boolean('isTemplate').notNull().default(false),
    templateName: text('templateName'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const materials = pgTable('Material', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    code: text('code').notNull(),
    unit: text('unit').notNull(),
    initialStock: integer('initialStock').notNull().default(0),
    minStockLevel: integer('minStockLevel').notNull().default(0),
    basePrice: doublePrecision('basePrice').notNull(),
    description: text('description'),
    status: materialStatusEnum('status').default('AKTIF'),
    isDynamicPrice: boolean('isDynamicPrice').notNull().default(false),
    imageUrl: text('imageUrl'),
    categoryId: text('categoryId').references(() => categories.id),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        codeTenantUnique: unique().on(table.code, table.tenantId)
    };
});

export const compositionMaterials = pgTable('CompositionMaterial', {
    id: text('id').primaryKey(),
    compositionId: text('compositionId').notNull().references(() => productCompositions.id, { onDelete: 'cascade' }),
    materialId: text('materialId').notNull().references(() => materials.id),
    quantity: doublePrecision('quantity').notNull(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        compMatUnique: unique().on(table.compositionId, table.materialId)
    };
});

export const suppliers = pgTable('Supplier', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    contactPerson: text('contactPerson').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    address: text('address').notNull(),
    status: text('status').notNull().default('Aktif'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        emailTenantUnique: unique().on(table.email, table.tenantId)
    };
});

export const materialDynamicPrices = pgTable('MaterialDynamicPrice', {
    id: text('id').primaryKey(),
    supplier: text('supplier').notNull(),
    price: doublePrecision('price').notNull(),
    materialId: text('materialId').notNull().references(() => materials.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        matSupplierUnique: unique().on(table.materialId, table.supplier)
    };
});

export const materialStockBatches = pgTable('MaterialStockBatch', {
    id: text('id').primaryKey(),
    materialId: text('materialId').notNull().references(() => materials.id, { onDelete: 'cascade' }),
    batchCode: text('batchCode').notNull(),
    qtyTotal: doublePrecision('qtyTotal').notNull(),
    qtyRemaining: doublePrecision('qtyRemaining').notNull(),
    costPerUnit: doublePrecision('costPerUnit').notNull(),
    receivedAt: timestamp('receivedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    expirationDate: timestamp('expirationDate', { mode: 'date', precision: 3 }),
    warehouseId: text('warehouseId').notNull().references(() => warehouses.id),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const productionBatches = pgTable('ProductionBatch', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    batchCode: text('batchCode').notNull(),
    productId: text('productId').notNull().references(() => products.id),
    plannedQty: integer('plannedQty').notNull(),
    producedQty: integer('producedQty'),
    status: productionStatusEnum('status').notNull().default('PLANNED'),
    startedAt: timestamp('startedAt', { mode: 'date', precision: 3 }),
    completedAt: timestamp('completedAt', { mode: 'date', precision: 3 }),
    totalMaterialCost: doublePrecision('totalMaterialCost'),
    overheadCost: doublePrecision('overheadCost'),
    totalCost: doublePrecision('totalCost'),
    hppPerUnit: doublePrecision('hppPerUnit'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const productionMaterialUsages = pgTable('ProductionMaterialUsage', {
    id: text('id').primaryKey(),
    productionBatchId: text('productionBatchId').notNull().references(() => productionBatches.id, { onDelete: 'cascade' }),
    materialBatchId: text('materialBatchId').notNull().references(() => materialStockBatches.id),
    qtyUsed: doublePrecision('qtyUsed').notNull(),
    costAtUsage: doublePrecision('costAtUsage').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const productStockBatches = pgTable('ProductStockBatch', {
    id: text('id').primaryKey(),
    productId: text('productId').notNull().references(() => products.id),
    warehouseId: text('warehouseId').notNull().references(() => warehouses.id),
    batchCode: text('batchCode').notNull(),
    source: productStockBatchSourceEnum('source').notNull(),
    referenceId: text('referenceId'), // ID of ProductionBatch or Purchase Transaction
    qtyTotal: integer('qtyTotal').notNull(),
    qtyRemaining: integer('qtyRemaining').notNull(),
    costPerUnit: doublePrecision('costPerUnit').notNull(),
    receivedAt: timestamp('receivedAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const warehouses = pgTable('Warehouse', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    location: text('location').notNull(),
    description: text('description'),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        nameTenantUnique: unique().on(table.name, table.tenantId)
    };
});

export const areas = pgTable('Area', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    warehouseId: text('warehouseId').notNull().references(() => warehouses.id),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        nameWarehouseUnique: unique().on(table.name, table.warehouseId)
    };
});

export const shelves = pgTable('Shelf', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    position: text('position'),
    capacity: integer('capacity'),
    status: text('status').notNull().default('Aktif'),
    areaId: text('areaId').notNull().references(() => areas.id),
    warehouseId: text('warehouseId').notNull().references(() => warehouses.id),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => {
    return {
        nameAreaUnique: unique().on(table.name, table.areaId)
    };
});

export const inventories = pgTable('Inventory', {
    id: text('id').primaryKey(),
    quantity: integer('quantity').notNull(),
    productId: text('productId').notNull().references(() => products.id),
    shelfId: text('shelfId').notNull().references(() => shelves.id),
    warehouseId: text('warehouseId').notNull().references(() => warehouses.id),
    lastUpdated: timestamp('lastUpdated', { mode: 'date', precision: 3 }).notNull().defaultNow()
}, (table) => {
    return {
        productShelfUnique: unique().on(table.productId, table.shelfId)
    };
});

export const transactions = pgTable('Transaction', {
    id: text('id').primaryKey(),
    tenantId: text('tenantId').notNull().references(() => tenants.id),
    type: transactionTypeEnum('type').notNull(),
    status: transactionStatusEnum('status').default('PENDING'),
    date: timestamp('date', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    notes: text('notes'),
    createdById: text('createdById').notNull().references(() => users.id),
    warehouseId: text('warehouseId').notNull().references(() => warehouses.id),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const transactionItems = pgTable('TransactionItem', {
    id: text('id').primaryKey(),
    transactionId: text('transactionId').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
    productId: text('productId').references(() => products.id, { onDelete: 'set null' }),
    variantId: text('variantId').references(() => productVariantCombinations.id, { onDelete: 'set null' }),
    materialId: text('materialId').references(() => materials.id, { onDelete: 'set null' }),
    quantity: integer('quantity').notNull(),
    price: doublePrecision('price').notNull(),
    cogs: doublePrecision('cogs'), // Added COGS column
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const transactionItemBatchUsages = pgTable('TransactionItemBatchUsage', {
    id: text('id').primaryKey(),
    transactionItemId: text('transactionItemId').notNull().references(() => transactionItems.id, { onDelete: 'cascade' }),
    productStockBatchId: text('productStockBatchId').notNull().references(() => productStockBatches.id),
    qtyUsed: doublePrecision('qtyUsed').notNull(),
    costAtUsage: doublePrecision('costAtUsage').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow()
});


// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
    users: many(users),
    products: many(products),
    categories: many(categories),
    warehouses: many(warehouses),
    suppliers: many(suppliers),
    materials: many(materials),
    roles: many(roles),
    transactions: many(transactions),
    productCompositions: many(productCompositions),
    compositionMaterials: many(compositionMaterials)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
    createdProducts: many(products, { relationName: 'productCreator' }),
    createdTransactions: many(transactions, { relationName: 'transactionCreator' }),
    userRoles: many(userRoles)
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
    tenant: one(tenants, { fields: [roles.tenantId], references: [tenants.id] }),
    userRoles: many(userRoles),
    permissions: many(rolePermissions)
}));


export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, { fields: [userRoles.userId], references: [users.id] }),
    role: one(roles, { fields: [userRoles.roleId], references: [roles.id] })
}));


export const categoriesRelations = relations(categories, ({ one, many }) => ({
    tenant: one(tenants, { fields: [categories.tenantId], references: [tenants.id] }),
    products: many(products),
    materials: many(materials)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    tenant: one(tenants, { fields: [products.tenantId], references: [tenants.id] }),
    category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
    createdBy: one(users, { fields: [products.createdById], references: [users.id], relationName: 'productCreator' }),
    variants: many(productVariants),
    images: many(productImages),
    variantCombos: many(productVariantCombinations),
    inventories: many(inventories),
    transactionItems: many(transactionItems),
    compositions: many(productCompositions),
    productionBatches: many(productionBatches),
    stockBatches: many(productStockBatches)
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, { fields: [productVariants.productId], references: [products.id] }),
    options: many(productVariantOptions)
}));

export const productVariantOptionsRelations = relations(productVariantOptions, ({ one }) => ({
    variant: one(productVariants, { fields: [productVariantOptions.variantId], references: [productVariants.id] })
}));

export const productVariantCombinationsRelations = relations(productVariantCombinations, ({ one, many }) => ({
    product: one(products, { fields: [productVariantCombinations.productId], references: [products.id] }),
    transactionItems: many(transactionItems)
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, { fields: [productImages.productId], references: [products.id] })
}));

export const productCompositionsRelations = relations(productCompositions, ({ one, many }) => ({
    tenant: one(tenants, { fields: [productCompositions.tenantId], references: [tenants.id] }),
    product: one(products, { fields: [productCompositions.productId], references: [products.id] }),
    materials: many(compositionMaterials)
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
    tenant: one(tenants, { fields: [materials.tenantId], references: [tenants.id] }),
    category: one(categories, { fields: [materials.categoryId], references: [categories.id] }),
    dynamicPrices: many(materialDynamicPrices),
    transactionItems: many(transactionItems),
    compositionMaterials: many(compositionMaterials),
    stockBatches: many(materialStockBatches)
}));

export const compositionMaterialsRelations = relations(compositionMaterials, ({ one }) => ({
    composition: one(productCompositions, { fields: [compositionMaterials.compositionId], references: [productCompositions.id] }),
    material: one(materials, { fields: [compositionMaterials.materialId], references: [materials.id] }),
    tenant: one(tenants, { fields: [compositionMaterials.tenantId], references: [tenants.id] })
}));

export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
    tenant: one(tenants, { fields: [warehouses.tenantId], references: [tenants.id] }),
    areas: many(areas),
    inventoryItems: many(inventories),
    shelves: many(shelves),
    transactions: many(transactions),
    materialStockBatches: many(materialStockBatches),
    productStockBatches: many(productStockBatches)
}));

export const areasRelations = relations(areas, ({ one, many }) => ({
    warehouse: one(warehouses, { fields: [areas.warehouseId], references: [warehouses.id] }),
    shelves: many(shelves)
}));

export const shelvesRelations = relations(shelves, ({ one, many }) => ({
    area: one(areas, { fields: [shelves.areaId], references: [areas.id] }),
    warehouse: one(warehouses, { fields: [shelves.warehouseId], references: [warehouses.id] }),
    inventoryItems: many(inventories)
}));

export const inventoriesRelations = relations(inventories, ({ one }) => ({
    product: one(products, { fields: [inventories.productId], references: [products.id] }),
    shelf: one(shelves, { fields: [inventories.shelfId], references: [shelves.id] }),
    warehouse: one(warehouses, { fields: [inventories.warehouseId], references: [warehouses.id] })
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    tenant: one(tenants, { fields: [transactions.tenantId], references: [tenants.id] }),
    createdBy: one(users, { fields: [transactions.createdById], references: [users.id], relationName: 'transactionCreator' }),
    warehouse: one(warehouses, { fields: [transactions.warehouseId], references: [warehouses.id] }),
    items: many(transactionItems)
}));

export const transactionItemsRelations = relations(transactionItems, ({ one, many }) => ({
    transaction: one(transactions, { fields: [transactionItems.transactionId], references: [transactions.id] }),
    product: one(products, { fields: [transactionItems.productId], references: [products.id] }),
    variant: one(productVariantCombinations, { fields: [transactionItems.variantId], references: [productVariantCombinations.id] }),
    material: one(materials, { fields: [transactionItems.materialId], references: [materials.id] }),
    batchUsages: many(transactionItemBatchUsages)
}));

export const transactionItemBatchUsagesRelations = relations(transactionItemBatchUsages, ({ one }) => ({
    transactionItem: one(transactionItems, { fields: [transactionItemBatchUsages.transactionItemId], references: [transactionItems.id] }),
    productBatch: one(productStockBatches, { fields: [transactionItemBatchUsages.productStockBatchId], references: [productStockBatches.id] })
}));

export const suppliersRelations = relations(suppliers, ({ one }) => ({
    tenant: one(tenants, { fields: [suppliers.tenantId], references: [tenants.id] })
}));

export const materialDynamicPricesRelations = relations(materialDynamicPrices, ({ one }) => ({
    material: one(materials, { fields: [materialDynamicPrices.materialId], references: [materials.id] })
}));

export const materialStockBatchesRelations = relations(materialStockBatches, ({ one, many }) => ({
    material: one(materials, { fields: [materialStockBatches.materialId], references: [materials.id] }),
    warehouse: one(warehouses, { fields: [materialStockBatches.warehouseId], references: [warehouses.id] }),
    usages: many(productionMaterialUsages)
}));

export const productionBatchesRelations = relations(productionBatches, ({ one, many }) => ({
    tenant: one(tenants, { fields: [productionBatches.tenantId], references: [tenants.id] }),
    product: one(products, { fields: [productionBatches.productId], references: [products.id] }),
    materialUsages: many(productionMaterialUsages)
}));

export const productionMaterialUsagesRelations = relations(productionMaterialUsages, ({ one }) => ({
    productionBatch: one(productionBatches, { fields: [productionMaterialUsages.productionBatchId], references: [productionBatches.id] }),
    materialBatch: one(materialStockBatches, { fields: [productionMaterialUsages.materialBatchId], references: [materialStockBatches.id] })
}));

export const productStockBatchesRelations = relations(productStockBatches, ({ one }) => ({
    product: one(products, { fields: [productStockBatches.productId], references: [products.id] }),
    warehouse: one(warehouses, { fields: [productStockBatches.warehouseId], references: [warehouses.id] })
}));

// Prisma Implicit Many-to-Many Table for Role Permissions
export const rolePermissions = pgTable('_RolePermissions', {
    roleId: text('A').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: text('B').notNull().references(() => permissions.id, { onDelete: 'cascade' })
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
    permissionIdx: unique('_RolePermissions_AB_unique').on(t.roleId, t.permissionId),
    roleIdx: index('_RolePermissions_B_index').on(t.permissionId)
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
    permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] })
}));

// Update Roles Relation to include permissions via join table
// Note: We need to redefine rolesRelations to add 'permissions' field

