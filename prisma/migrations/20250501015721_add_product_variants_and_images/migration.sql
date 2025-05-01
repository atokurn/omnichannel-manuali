/*
  Warnings:

  - You are about to drop the `AttributeMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EcommercePlatform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EcommerceStore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductFieldValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SyncLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttributeMapping" DROP CONSTRAINT "AttributeMapping_categoryMappingId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeMapping" DROP CONSTRAINT "AttributeMapping_platformId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryMapping" DROP CONSTRAINT "CategoryMapping_platformId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryMapping" DROP CONSTRAINT "CategoryMapping_universalCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "EcommerceStore" DROP CONSTRAINT "EcommerceStore_platformId_fkey";

-- DropForeignKey
ALTER TABLE "ProductFieldValue" DROP CONSTRAINT "ProductFieldValue_productMappingId_fkey";

-- DropForeignKey
ALTER TABLE "ProductMapping" DROP CONSTRAINT "ProductMapping_platformId_fkey";

-- DropForeignKey
ALTER TABLE "ProductMapping" DROP CONSTRAINT "ProductMapping_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductMapping" DROP CONSTRAINT "ProductMapping_storeId_fkey";

-- DropForeignKey
ALTER TABLE "SyncLog" DROP CONSTRAINT "SyncLog_productId_fkey";

-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPreorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mainImage" TEXT,
ADD COLUMN     "packageHeight" DOUBLE PRECISION,
ADD COLUMN     "packageLength" DOUBLE PRECISION,
ADD COLUMN     "packageWidth" DOUBLE PRECISION,
ADD COLUMN     "preorderDays" INTEGER,
ADD COLUMN     "purchaseLimit" INTEGER,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "weightUnit" TEXT,
ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "cost" DROP NOT NULL;

-- DropTable
DROP TABLE "AttributeMapping";

-- DropTable
DROP TABLE "CategoryMapping";

-- DropTable
DROP TABLE "EcommercePlatform";

-- DropTable
DROP TABLE "EcommerceStore";

-- DropTable
DROP TABLE "ProductFieldValue";

-- DropTable
DROP TABLE "ProductMapping";

-- DropTable
DROP TABLE "SyncLog";

-- DropEnum
DROP TYPE "AttributeType";

-- DropEnum
DROP TYPE "SyncAction";

-- DropEnum
DROP TYPE "SyncStatus";

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "image" TEXT,
    "variantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantCombination" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sku" TEXT,
    "weight" DOUBLE PRECISION,
    "weightUnit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombination_productId_combinationId_key" ON "ProductVariantCombination"("productId", "combinationId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantCombination" ADD CONSTRAINT "ProductVariantCombination_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
