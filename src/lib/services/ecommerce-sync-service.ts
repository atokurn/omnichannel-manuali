import { PrismaClient, SyncStatus, SyncAction, Product, EcommercePlatform, EcommerceStore, ProductMapping } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface untuk field mapping yang digunakan dalam sinkronisasi
 */
interface FieldMapping {
  baseField: string;
  platformFields: {
    [platform: string]: {
      fieldName: string;
      required: boolean;
      transformation?: (value: any) => any;
    }
  }
}

/**
 * Service untuk menangani sinkronisasi produk dengan platform e-commerce
 */
export class EcommerceSyncService {
  /**
   * Mendapatkan daftar platform e-commerce yang aktif
   */
  async getActivePlatforms(): Promise<EcommercePlatform[]> {
    return prisma.ecommercePlatform.findMany({
      where: { isActive: true }
    });
  }

  /**
   * Mendapatkan daftar toko untuk platform tertentu
   */
  async getStoresByPlatform(platformId: string): Promise<EcommerceStore[]> {
    return prisma.ecommerceStore.findMany({
      where: { 
        platformId,
        isActive: true 
      }
    });
  }

  /**
   * Mendapatkan pemetaan field untuk platform tertentu
   */
  async getFieldMappings(platformName: string): Promise<FieldMapping[]> {
    // Ini bisa diimplementasikan dengan mengambil dari database atau hardcoded
    // Contoh implementasi hardcoded untuk demo
    const fieldMappings: FieldMapping[] = [
      {
        baseField: "name",
        platformFields: {
          shopee: { fieldName: "name", required: true },
          tokopedia: { fieldName: "product_name", required: true },
          tiktok: { 
            fieldName: "product_title", 
            required: true,
            transformation: (value) => value.substring(0, 100) // TikTok membatasi judul 100 karakter
          }
        }
      },
      {
        baseField: "description",
        platformFields: {
          shopee: { fieldName: "description", required: true },
          tokopedia: { fieldName: "product_description", required: true },
          tiktok: { 
            fieldName: "product_description", 
            required: true,
            transformation: (value) => value.substring(0, 5000) // TikTok membatasi deskripsi 5000 karakter
          }
        }
      },
      {
        baseField: "price",
        platformFields: {
          shopee: { fieldName: "price", required: true },
          tokopedia: { fieldName: "price", required: true },
          tiktok: { fieldName: "price", required: true }
        }
      },
      // Tambahkan field mapping lainnya sesuai kebutuhan
    ];

    return fieldMappings.filter(mapping => 
      mapping.platformFields[platformName.toLowerCase()] !== undefined
    );
  }

  /**
   * Mendapatkan pemetaan kategori untuk platform tertentu
   */
  async getCategoryMapping(universalCategoryId: string, platformId: string) {
    return prisma.categoryMapping.findUnique({
      where: {
        universalCategoryId_platformId: {
          universalCategoryId,
          platformId
        }
      },
      include: {
        attributeMappings: true
      }
    });
  }

  /**
   * Mendapatkan atribut wajib untuk kategori tertentu di platform
   */
  async getRequiredAttributes(categoryMappingId: string) {
    return prisma.attributeMapping.findMany({
      where: {
        categoryMappingId,
        isRequired: true
      }
    });
  }

  /**
   * Membuat atau memperbarui pemetaan produk untuk platform tertentu
   */
  async upsertProductMapping(productId: string, platformId: string, storeId?: string) {
    return prisma.productMapping.upsert({
      where: {
        productId_platformId_storeId: {
          productId,
          platformId,
          storeId: storeId || null
        }
      },
      update: {
        syncEnabled: true,
        syncStatus: SyncStatus.PENDING
      },
      create: {
        productId,
        platformId,
        storeId,
        syncEnabled: true,
        syncStatus: SyncStatus.PENDING
      }
    });
  }

  /**
   * Menyimpan nilai field spesifik platform untuk produk
   */
  async saveProductFieldValue(productMappingId: string, fieldName: string, fieldValue: string) {
    return prisma.productFieldValue.upsert({
      where: {
        productMappingId_fieldName: {
          productMappingId,
          fieldName
        }
      },
      update: { fieldValue },
      create: {
        productMappingId,
        fieldName,
        fieldValue
      }
    });
  }

  /**
   * Mencatat log sinkronisasi
   */
  async logSync(data: {
    productId?: string;
    platformId?: string;
    storeId?: string;
    action: SyncAction;
    status: SyncStatus;
    message?: string;
    requestPayload?: any;
    responsePayload?: any;
  }) {
    return prisma.syncLog.create({
      data: {
        productId: data.productId,
        platformId: data.platformId,
        storeId: data.storeId,
        action: data.action,
        status: data.status,
        message: data.message,
        requestPayload: data.requestPayload,
        responsePayload: data.responsePayload
      }
    });
  }

  /**
   * Mempersiapkan data produk untuk sinkronisasi ke platform
   */
  async prepareProductDataForPlatform(productId: string, platformId: string, storeId?: string) {
    // Ambil data produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }

    // Ambil platform
    const platform = await prisma.ecommercePlatform.findUnique({
      where: { id: platformId }
    });

    if (!platform) {
      throw new Error('Platform tidak ditemukan');
    }

    // Ambil field mapping
    const fieldMappings = await this.getFieldMappings(platform.name);

    // Ambil category mapping jika produk memiliki kategori
    let categoryMapping = null;
    let requiredAttributes = [];
    
    if (product.categoryId) {
      categoryMapping = await this.getCategoryMapping(product.categoryId, platformId);
      
      if (categoryMapping) {
        requiredAttributes = await this.getRequiredAttributes(categoryMapping.id);
      }
    }

    // Ambil nilai field spesifik platform yang sudah disimpan
    const productMapping = await this.upsertProductMapping(productId, platformId, storeId);
    const fieldValues = await prisma.productFieldValue.findMany({
      where: { productMappingId: productMapping.id }
    });

    // Buat object untuk menyimpan data yang akan dikirim ke platform
    const platformData: Record<string, any> = {};

    // Transformasi field dasar produk ke format platform
    for (const mapping of fieldMappings) {
      const platformField = mapping.platformFields[platform.name.toLowerCase()];
      if (platformField) {
        const baseValue = (product as any)[mapping.baseField];
        let transformedValue = baseValue;

        // Terapkan transformasi jika ada
        if (platformField.transformation && baseValue !== undefined) {
          transformedValue = platformField.transformation(baseValue);
        }

        // Simpan ke object data platform
        platformData[platformField.fieldName] = transformedValue;

        // Simpan ke database untuk referensi
        if (transformedValue !== undefined) {
          await this.saveProductFieldValue(
            productMapping.id, 
            platformField.fieldName, 
            String(transformedValue)
          );
        }
      }
    }

    // Tambahkan data kategori jika ada
    if (categoryMapping) {
      platformData['category_id'] = categoryMapping.externalCategoryId;
    }

    // Tambahkan nilai field yang sudah disimpan sebelumnya
    for (const fieldValue of fieldValues) {
      // Hanya tambahkan jika belum ada di platformData
      if (platformData[fieldValue.fieldName] === undefined) {
        platformData[fieldValue.fieldName] = fieldValue.fieldValue;
      }
    }

    return {
      product,
      platform,
      platformData,
      categoryMapping,
      requiredAttributes,
      productMapping,
      fieldValues,
      missingRequiredFields: this.checkMissingRequiredFields(platformData, fieldMappings, platform.name, requiredAttributes)
    };
  }

  /**
   * Memeriksa field wajib yang belum diisi
   */
  private checkMissingRequiredFields(
    platformData: Record<string, any>,
    fieldMappings: FieldMapping[],
    platformName: string,
    requiredAttributes: any[]
  ) {
    const missingFields: string[] = [];

    // Periksa field dasar yang wajib
    for (const mapping of fieldMappings) {
      const platformField = mapping.platformFields[platformName.toLowerCase()];
      if (platformField && platformField.required) {
        if (platformData[platformField.fieldName] === undefined || 
            platformData[platformField.fieldName] === null || 
            platformData[platformField.fieldName] === '') {
          missingFields.push(platformField.fieldName);
        }
      }
    }

    // Periksa atribut kategori yang wajib
    for (const attr of requiredAttributes) {
      if (platformData[attr.attributeName] === undefined || 
          platformData[attr.attributeName] === null || 
          platformData[attr.attributeName] === '') {
        missingFields.push(attr.attributeName);
      }
    }

    return missingFields;
  }

  /**
   * Sinkronisasi produk ke platform e-commerce
   */
  async syncProductToPlatform(productId: string, platformId: string, storeId?: string) {
    try {
      // Persiapkan data produk untuk platform
      const {
        product,
        platform,
        platformData,
        productMapping,
        missingRequiredFields
      } = await this.prepareProductDataForPlatform(productId, platformId, storeId);

      // Periksa apakah ada field wajib yang belum diisi
      if (missingRequiredFields.length > 0) {
        await prisma.productMapping.update({
          where: { id: productMapping.id },
          data: {
            syncStatus: SyncStatus.FAILED,
            syncMessage: `Field wajib belum diisi: ${missingRequiredFields.join(', ')}`
          }
        });

        await this.logSync({
          productId,
          platformId,
          storeId,
          action: SyncAction.CREATE,
          status: SyncStatus.FAILED,
          message: `Field wajib belum diisi: ${missingRequiredFields.join(', ')}`,
          requestPayload: platformData
        });

        return {
          success: false,
          message: `Field wajib belum diisi: ${missingRequiredFields.join(', ')}`,
          missingRequiredFields
        };
      }

      // Update status sinkronisasi menjadi IN_PROGRESS
      await prisma.productMapping.update({
        where: { id: productMapping.id },
        data: {
          syncStatus: SyncStatus.IN_PROGRESS
        }
      });

      // Di sini implementasikan logika untuk mengirim data ke API platform
      // Contoh implementasi dummy untuk demo
      const response = await this.callPlatformAPI(platform.name, platformData, productMapping.externalProductId);

      // Update status sinkronisasi berdasarkan response
      if (response.success) {
        await prisma.productMapping.update({
          where: { id: productMapping.id },
          data: {
            syncStatus: SyncStatus.SUCCESS,
            externalProductId: response.externalProductId || productMapping.externalProductId,
            externalSku: response.externalSku || productMapping.externalSku,
            lastSyncedAt: new Date(),
            syncMessage: 'Sinkronisasi berhasil'
          }
        });

        await this.logSync({
          productId,
          platformId,
          storeId,
          action: productMapping.externalProductId ? SyncAction.UPDATE : SyncAction.CREATE,
          status: SyncStatus.SUCCESS,
          message: 'Sinkronisasi berhasil',
          requestPayload: platformData,
          responsePayload: response
        });

        return {
          success: true,
          message: 'Sinkronisasi berhasil',
          externalProductId: response.externalProductId,
          externalSku: response.externalSku
        };
      } else {
        await prisma.productMapping.update({
          where: { id: productMapping.id },
          data: {
            syncStatus: SyncStatus.FAILED,
            syncMessage: response.message || 'Sinkronisasi gagal'
          }
        });

        await this.logSync({
          productId,
          platformId,
          storeId,
          action: productMapping.externalProductId ? SyncAction.UPDATE : SyncAction.CREATE,
          status: SyncStatus.FAILED,
          message: response.message || 'Sinkronisasi gagal',
          requestPayload: platformData,
          responsePayload: response
        });

        return {
          success: false,
          message: response.message || 'Sinkronisasi gagal'
        };
      }
    } catch (error) {
      // Tangani error
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat sinkronisasi';
      
      await prisma.productMapping.update({
        where: {
          productId_platformId_storeId: {
            productId,
            platformId,
            storeId: storeId || null
          }
        },
        data: {
          syncStatus: SyncStatus.FAILED,
          syncMessage: errorMessage
        }
      });

      await this.logSync({
        productId,
        platformId,
        storeId,
        action: SyncAction.CREATE,
        status: SyncStatus.FAILED,
        message: errorMessage
      });

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Panggil API platform e-commerce (implementasi dummy)
   */
  private async callPlatformAPI(platformName: string, data: any, externalProductId?: string | null): Promise<any> {
    // Implementasi dummy untuk demo
    // Dalam implementasi sebenarnya, ini akan memanggil API platform e-commerce
    
    console.log(`Calling ${platformName} API with data:`, data);
    
    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulasi response sukses
    if (Math.random() > 0.2) { // 80% kemungkinan sukses
      return {
        success: true,
        externalProductId: externalProductId || `ext-${platformName.toLowerCase()}-${Date.now()}`,
        externalSku: data.sku || `${platformName.toLowerCase()}-${Date.now()}`,
        message: 'Produk berhasil disinkronkan'
      };
    } else {
      // Simulasi response gagal
      return {
        success: false,
        message: 'Gagal menghubungi API platform'
      };
    }
  }
}

// Export instance singleton
export const ecommerceSyncService = new EcommerceSyncService();