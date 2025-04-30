-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "initialStock" INTEGER NOT NULL DEFAULT 0,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "MaterialStatus" NOT NULL DEFAULT 'AKTIF',
    "isDynamicPrice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialDynamicPrice" (
    "id" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "materialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialDynamicPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Material_code_key" ON "Material"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialDynamicPrice_materialId_supplier_key" ON "MaterialDynamicPrice"("materialId", "supplier");

-- AddForeignKey
ALTER TABLE "MaterialDynamicPrice" ADD CONSTRAINT "MaterialDynamicPrice_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
