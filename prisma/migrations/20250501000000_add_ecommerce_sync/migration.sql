-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'DATE', 'BOOLEAN', 'IMAGE');

-- CreateEnum
CREATE TYPE "SyncAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'GET');

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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiToken" TEXT,
    "apiTokenExpiry" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcommerceStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMapping" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "storeId" TEXT,
    "externalProductId" TEXT,
    "externalSku" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFieldValue" (
    "id" TEXT NOT NULL,
    "productMappingId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryMapping" (
    "id" TEXT NOT NULL,
    "universalCategoryId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "externalCategoryId" TEXT NOT NULL,
    "externalCategoryPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeMapping" (
    "id" TEXT NOT NULL,
    "categoryMappingId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "attributeName" TEXT NOT NULL,
    "attributeType" "AttributeType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "platformId" TEXT,
    "storeId" TEXT,
    "action" "SyncAction" NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "message" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EcommercePlatform_name_key" ON "EcommercePlatform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EcommerceStore_platformId_externalStoreId_key" ON "EcommerceStore"("platformId", "externalStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMapping_productId_platformId_storeId_key" ON "ProductMapping"("productId", "platformId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFieldValue_productMappingId_fieldName_key" ON "ProductFieldValue"("productMappingId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMapping_universalCategoryId_platformId_key" ON "CategoryMapping"("universalCategoryId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeMapping_categoryMappingId_attributeName_key" ON "AttributeMapping"("categoryMappingId", "attributeName");

-- AddForeignKey
ALTER TABLE "EcommerceStore" ADD CONSTRAINT "EcommerceStore_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "EcommercePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMapping" ADD CONSTRAINT "ProductMapping_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMapping" ADD CONSTRAINT "ProductMapping_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "EcommercePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMapping" ADD CONSTRAINT "ProductMapping_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "EcommerceStore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFieldValue" ADD CONSTRAINT "ProductFieldValue_productMappingId_fkey" FOREIGN KEY ("productMappingId") REFERENCES "ProductMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryMapping" ADD CONSTRAINT "CategoryMapping_universalCategoryId_fkey" FOREIGN KEY ("universalCategoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryMapping" ADD CONSTRAINT "CategoryMapping_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "EcommercePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeMapping" ADD CONSTRAINT "AttributeMapping_categoryMappingId_fkey" FOREIGN KEY ("categoryMappingId") REFERENCES "CategoryMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeMapping" ADD CONSTRAINT "AttributeMapping_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "EcommercePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;