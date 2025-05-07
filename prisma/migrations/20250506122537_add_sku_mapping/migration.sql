-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS');

-- CreateTable
CREATE TABLE "EcommercePlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiBaseUrl" TEXT,
    "apiVersion" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcommercePlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcommerceStore" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalStoreId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiToken" TEXT,
    "apiTokenExpiry" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcommerceStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkuMapping" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "storeId" TEXT,
    "sellerSku" TEXT NOT NULL,
    "storeSku" TEXT,
    "externalProductId" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EcommercePlatform_name_key" ON "EcommercePlatform"("name");

-- CreateIndex
CREATE INDEX "EcommerceStore_tenantId_idx" ON "EcommerceStore"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "EcommerceStore_platformId_externalStoreId_key" ON "EcommerceStore"("platformId", "externalStoreId");

-- CreateIndex
CREATE INDEX "SkuMapping_tenantId_idx" ON "SkuMapping"("tenantId");

-- CreateIndex
CREATE INDEX "SkuMapping_sellerSku_idx" ON "SkuMapping"("sellerSku");

-- CreateIndex
CREATE INDEX "SkuMapping_storeSku_idx" ON "SkuMapping"("storeSku");

-- CreateIndex
CREATE INDEX "SkuMapping_externalProductId_idx" ON "SkuMapping"("externalProductId");

-- CreateIndex
CREATE UNIQUE INDEX "SkuMapping_variantId_platformId_storeId_key" ON "SkuMapping"("variantId", "platformId", "storeId");

-- AddForeignKey
ALTER TABLE "EcommerceStore" ADD CONSTRAINT "EcommerceStore_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "EcommercePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceStore" ADD CONSTRAINT "EcommerceStore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuMapping" ADD CONSTRAINT "SkuMapping_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuMapping" ADD CONSTRAINT "SkuMapping_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "EcommercePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuMapping" ADD CONSTRAINT "SkuMapping_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "EcommerceStore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuMapping" ADD CONSTRAINT "SkuMapping_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
