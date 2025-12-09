import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, inventories, productVariants, productVariantOptions, productVariantCombinations } from '@/lib/db/schema';
import { eq, like, or, and, sql, desc, count } from 'drizzle-orm';
import { getCurrentUser as getUser } from '@/lib/auth';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

// Helper to get user
async function getCurrentUser() {
  const user = await getUser();
  if (!user || !user.id || !user.tenantId) {
    throw new Error('User tidak terautentikasi atau data user tidak lengkap.');
  }
  return user;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received product data:', body);

    if (!body.productName) {
      return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;

    // Generate SKU logic using Drizzle
    async function generateSKU(productName: string, hasVariant: boolean): Promise<string> {
      const prefix = productName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase();

      const variantMarker = hasVariant ? 'V-' : '';
      const uniqueDigits = Math.floor(100000 + Math.random() * 900000).toString();

      const skuCandidate = `PRD-${prefix}-${variantMarker}${uniqueDigits}`;

      const existingSKU = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.sku, skuCandidate)
      });

      if (existingSKU) {
        return generateSKU(productName, hasVariant);
      }
      return skuCandidate;
    }

    // Start Transaction
    const result = await db.transaction(async (tx) => {
      const sku = await generateSKU(body.productName, body.addVariant);
      const price = body.addVariant ? 0 : parseFloat(body.defaultPrice.replace(/[.,]/g, ''));

      // 1. Create Product
      const [newProduct] = await tx.insert(products).values({
        id: crypto.randomUUID(),
        name: body.productName,
        description: body.productDescription || '',
        price: price,
        mainImage: body.mainImage || '',
        hasVariants: body.addVariant || false,
        createdById: currentUser.id,
        tenantId: tenantId,
        sku: sku,
        // Defaults as per schema if not provided
        minStockLevel: 0
      }).returning();

      // 2. Inventory for non-variant products
      if (!body.addVariant && body.defaultQuantity) {
        // Find default warehouse for tenant
        const defaultWarehouse = await tx.query.warehouses.findFirst({
          where: (warehouses, { eq }) => eq(warehouses.tenantId, tenantId),
          with: {
            shelves: {
              limit: 1
            }
          }
        });

        if (defaultWarehouse && defaultWarehouse.shelves.length > 0) {
          const defaultShelf = defaultWarehouse.shelves[0];
          await tx.insert(inventories).values({
            id: crypto.randomUUID(),
            quantity: parseInt(body.defaultQuantity),
            productId: newProduct.id,
            shelfId: defaultShelf.id,
            warehouseId: defaultWarehouse.id
          });
        } else {
          console.warn('Tidak dapat menyimpan data inventory: Warehouse atau shelf tidak tersedia');
        }
      }

      // 3. Variants
      if (body.addVariant && body.variants && body.variants.length > 0) {
        for (const variant of body.variants) {
          if (variant.name && variant.options && variant.options.length > 0) {
            // Create Variant
            const [newVariant] = await tx.insert(productVariants).values({
              id: crypto.randomUUID(),
              name: variant.name,
              productId: newProduct.id
            }).returning();

            // Create Options
            const validOptions = variant.options.filter((o: any) => o.value.trim() !== '');
            if (validOptions.length > 0) {
              await tx.insert(productVariantOptions).values(
                validOptions.map((opt: any) => ({
                  id: crypto.randomUUID(),
                  value: opt.value,
                  image: opt.image || null,
                  variantId: newVariant.id
                }))
              );
            }
          }
        }

        // 4. Combinations
        if (body.variantCombinations && body.variantCombinations.length > 0) {
          await tx.insert(productVariantCombinations).values(
            body.variantCombinations.map((combo: any) => ({
              id: crypto.randomUUID(),
              productId: newProduct.id,
              combinationId: combo.combinationId,
              options: combo.options,
              price: parseFloat(combo.price.toString().replace(/[.,]/g, '')),
              quantity: parseInt(combo.quantity),
              sku: combo.sku || '',
              weight: parseFloat(combo.weight),
              weightUnit: combo.weightUnit || 'g'
            }))
          );
        }
      }

      return newProduct;
    });

    console.log('Product created successfully:', result);
    return NextResponse.json({ message: 'Product created successfully', product: result }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    let errorMessage = 'Failed to create product';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const currentUser = await getCurrentUser();
    const tenantId = currentUser.tenantId;
    const skip = (page - 1) * limit;

    // Filters
    // Postgres specific case-insensitive like (ILIKE)
    const searchConditionsPg = search
      ? or(
        sql`${products.name} ILIKE ${`%${search}%`}`,
        sql`${products.sku} ILIKE ${`%${search}%`}`,
        sql`${products.description} ILIKE ${`%${search}%`}`
      )
      : undefined;

    const whereCondition = searchConditionsPg
      ? and(eq(products.tenantId, tenantId), searchConditionsPg)
      : eq(products.tenantId, tenantId);

    // Fetch products
    const productsData = await db.query.products.findMany({
      where: whereCondition,
      limit: limit,
      offset: skip,
      orderBy: [desc(products.createdAt)],
      // Select specific fields + relations
      columns: {
        id: true,
        name: true,
        description: true,
        sku: true,
        price: true,
        cost: true,
        minStockLevel: true,
        weight: true,
        weightUnit: true,
        packageLength: true,
        packageWidth: true,
        packageHeight: true,
        isPreorder: true,
        preorderDays: true,
        purchaseLimit: true,
        hasVariants: true,
        mainImage: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        categoryId: true,
        tenantId: true,
      },
      with: {
        variants: {
          columns: { id: true }
        },
        inventories: {
          columns: { quantity: true }
        }
      }
    });

    // Count
    const [countResult] = await db.select({ count: count() })
      .from(products)
      .where(whereCondition);

    const totalProducts = countResult ? countResult.count : 0;

    // Process logic (Redis caching etc) - Mostly copied from original
    const productsProcessed = await Promise.all(productsData.map(async (product) => {
      let totalStock = 0;
      let minVariantPrice: number | null = null;
      let maxVariantPrice: number | null = null;
      let processedCombinations: any[] = [];

      if (product.hasVariants) {
        const cacheKey = `product:${product.id}:combinations_with_imageUrl_v1`;
        let cachedDataString: string | null = null;
        try {
          await ensureRedisConnection();
          cachedDataString = await redisClient.get(cacheKey);
        } catch (redisError) {
          console.warn(`Redis GET error for key ${cacheKey}:`, redisError);
        }

        if (cachedDataString) {
          try {
            processedCombinations = JSON.parse(cachedDataString);
          } catch (parseError) {
            cachedDataString = null;
          }
        }

        if (!cachedDataString) {
          const rawCombinations = await db.query.productVariantCombinations.findMany({
            where: (combinations, { eq }) => eq(combinations.productId, product.id),
            columns: {
              id: true,
              combinationId: true,
              options: true,
              price: true,
              quantity: true,
              sku: true,
              weight: true,
              weightUnit: true,
              createdAt: true,
              updatedAt: true
            }
          });

          // Fetch options with images
          // Note: Drizzle Relational Query might be easier here to go from Variant -> Option.
          // Or standard select from Options where variant.productId = product.id.
          // Using join:
          const productVariantOptionsWithImages = await db.select({
            value: productVariantOptions.value,
            image: productVariantOptions.image,
            variantName: productVariants.name
          })
            .from(productVariantOptions)
            .innerJoin(productVariants, eq(productVariantOptions.variantId, productVariants.id))
            .where(
              and(
                eq(productVariants.productId, product.id),
                sql`${productVariantOptions.image} IS NOT NULL`
              )
            );

          const findRepresentativeImage = (
            comboOpts: Record<string, string>,
            allOptsWithImgs: Array<{ value: string, image: string | null, variantName: string }>
          ): string | null => {
            for (const variantNameKey in comboOpts) {
              const optionVal = comboOpts[variantNameKey];
              const foundOpt = allOptsWithImgs.find(
                opt => opt.variantName === variantNameKey && opt.value === optionVal && opt.image
              );
              if (foundOpt && foundOpt.image) {
                return foundOpt.image;
              }
            }
            return null;
          };

          processedCombinations = rawCombinations.map(combo => ({
            ...combo,
            imageUrl: findRepresentativeImage(combo.options as Record<string, string>, productVariantOptionsWithImages),
          }));

          try {
            await redisClient.set(cacheKey, JSON.stringify(processedCombinations), { EX: 300 });
          } catch (e) { console.warn(e); }
        }

        totalStock = processedCombinations.reduce((sum, combo) => sum + (combo.quantity || 0), 0);
        if (processedCombinations.length > 0) {
          const prices = processedCombinations.map(c => c.price);
          minVariantPrice = Math.min(...prices);
          maxVariantPrice = Math.max(...prices);
        }

      } else {
        // Non-variant stock
        if (product.inventories) {
          totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        }
      }

      return {
        ...product,
        totalStock,
        variantCount: product.variants.length,
        minVariantPrice,
        maxVariantPrice,
        combinations: product.hasVariants ? processedCombinations : undefined,
        variants: undefined,
        inventories: undefined
      };
    }));

    return NextResponse.json({
      data: productsProcessed,
      total: totalProducts,
      page,
      limit,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    let errorMessage = 'Failed to fetch products';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}