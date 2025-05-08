/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductVariantCombination` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "ProductVariantCombination" DROP COLUMN "imageUrl";
