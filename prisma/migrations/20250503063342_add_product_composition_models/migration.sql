-- CreateTable
CREATE TABLE "ProductComposition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "templateName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionMaterial" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompositionMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductComposition_tenantId_idx" ON "ProductComposition"("tenantId");

-- CreateIndex
CREATE INDEX "ProductComposition_productId_idx" ON "ProductComposition"("productId");

-- CreateIndex
CREATE INDEX "CompositionMaterial_compositionId_idx" ON "CompositionMaterial"("compositionId");

-- CreateIndex
CREATE INDEX "CompositionMaterial_materialId_idx" ON "CompositionMaterial"("materialId");

-- CreateIndex
CREATE INDEX "CompositionMaterial_tenantId_idx" ON "CompositionMaterial"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionMaterial_compositionId_materialId_key" ON "CompositionMaterial"("compositionId", "materialId");

-- AddForeignKey
ALTER TABLE "ProductComposition" ADD CONSTRAINT "ProductComposition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComposition" ADD CONSTRAINT "ProductComposition_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionMaterial" ADD CONSTRAINT "CompositionMaterial_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "ProductComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionMaterial" ADD CONSTRAINT "CompositionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionMaterial" ADD CONSTRAINT "CompositionMaterial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
