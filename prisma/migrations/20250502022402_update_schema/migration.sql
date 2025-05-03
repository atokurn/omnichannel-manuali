/*
  Warnings:

  - A unique constraint covering the columns `[name,tenantId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,tenantId]` on the table `Material` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,tenantId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,tenantId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,tenantId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,tenantId]` on the table `Warehouse` will be added. If there are existing duplicate values, this will fail.

*/

-- Create default tenant first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tenant table first
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Insert default tenant with fixed ID
INSERT INTO "Tenant" ("id", "name", "plan", "status", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Tenant', 'free', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add tenantId column with default value to existing tables
ALTER TABLE "Category" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Material" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Product" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Role" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Supplier" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Transaction" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "User" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Warehouse" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add action and resource columns to Permission with default values
ALTER TABLE "Permission" ADD COLUMN "action" TEXT NOT NULL DEFAULT 'read';
ALTER TABLE "Permission" ADD COLUMN "resource" TEXT NOT NULL DEFAULT 'all';

-- Remove the default constraints after data is populated
ALTER TABLE "Category" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Material" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Role" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Supplier" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Warehouse" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Permission" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "Permission" ALTER COLUMN "resource" DROP DEFAULT;
-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Material_code_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "Supplier_email_idx";

-- DropIndex
DROP INDEX "Supplier_email_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';


-- CreateIndex
CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_tenantId_key" ON "Category"("name", "tenantId");

-- CreateIndex
CREATE INDEX "Material_tenantId_idx" ON "Material"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Material_code_tenantId_key" ON "Material"("code", "tenantId");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE INDEX "Product_createdById_idx" ON "Product"("createdById");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_tenantId_key" ON "Role"("name", "tenantId");

-- CreateIndex
CREATE INDEX "Supplier_tenantId_idx" ON "Supplier"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_tenantId_key" ON "Supplier"("email", "tenantId");

-- CreateIndex
CREATE INDEX "Transaction_tenantId_idx" ON "Transaction"("tenantId");

-- CreateIndex
CREATE INDEX "Transaction_createdById_idx" ON "Transaction"("createdById");

-- CreateIndex
CREATE INDEX "Transaction_warehouseId_idx" ON "Transaction"("warehouseId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_tenantId_key" ON "User"("email", "tenantId");

-- CreateIndex
CREATE INDEX "Warehouse_tenantId_idx" ON "Warehouse"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_tenantId_key" ON "Warehouse"("name", "tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
