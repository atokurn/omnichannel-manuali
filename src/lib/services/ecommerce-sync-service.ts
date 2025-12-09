// DEPRECATED: This service relied on Prisma tables (ProductMapping, etc.) that are no longer part of the schema.
// It has been disabled during the Drizzle migration.
// TODO: Re-implement using the new Schema (SkuMapping etc) if needed.

export class EcommerceSyncService {
  async getActivePlatforms() { return []; }
  async getStoresByPlatform(platformId: string) { return []; }
  async getFieldMappings(platformName: string) { return []; }
  async getCategoryMapping(universalCategoryId: string, platformId: string) { return null; }
  async getRequiredAttributes(categoryMappingId: string) { return []; }
  async upsertProductMapping(productId: string, platformId: string, storeId?: string) { throw new Error("Not implemented"); }
  async saveProductFieldValue(productMappingId: string, fieldName: string, fieldValue: string) { throw new Error("Not implemented"); }
  async logSync(data: any) { console.log("Sync Log:", data); }
  async prepareProductDataForPlatform(productId: string, platformId: string, storeId?: string) { throw new Error("Not implemented"); }
  async syncProductToPlatform(productId: string, platformId: string, storeId?: string) {
    return { success: false, message: "Service disabled during migration" };
  }
}

export const ecommerceSyncService = new EcommerceSyncService();