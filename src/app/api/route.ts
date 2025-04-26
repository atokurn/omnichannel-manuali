import { NextRequest, NextResponse } from 'next/server';
import { prisma, processTransaction, updateInventory, checkLowStock, getInventoryValue } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

// API Routes for Inventory Management System

// Products API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');
    
    let whereClause = {};
    
    if (category) {
      whereClause = {
        ...whereClause,
        category: {
          name: category
        }
      };
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        inventories: true,
      },
    });
    
    // Filter for low stock if requested
    if (lowStock === 'true') {
      return NextResponse.json(
        products.filter(product => 
          product.inventories.some(inv => inv.quantity < product.minStockLevel)
        )
      );
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Create Product (Protected - Admin/Manager only)
export const POST = withRole(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const user = (req as any).user;
    
    const product = await prisma.product.create({
      data: {
        ...data,
        createdById: user.userId,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}, ['ADMIN', 'MANAGER']);

// Warehouse API routes
export const getWarehouses = withAuth(async (req: NextRequest) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
});

// Create Warehouse (Admin only)
export const createWarehouse = withRole(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    const warehouse = await prisma.warehouse.create({
      data,
    });
    
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    );
  }
}, ['ADMIN']);

// Transactions API
export const createTransaction = withAuth(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const user = (req as any).user;
    
    // Add user ID to transaction data
    data.createdById = user.userId;
    
    // Process the transaction (this handles inventory updates)
    const transaction = await processTransaction(data);
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
});

// Get transactions
export const getTransactions = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let whereClause: any = {};
    
    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        warehouse: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
});

// Categories API
export const getCategories = withAuth(async (req: NextRequest) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
});

// Create Category (Admin/Manager only)
export const createCategory = withRole(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    const category = await prisma.category.create({
      data,
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}, ['ADMIN', 'MANAGER']);

// Update Category (Admin/Manager only)
export const updateCategory = withRole(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}, ['ADMIN', 'MANAGER']);

// Delete Category (Admin only)
export const deleteCategory = withRole(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Check if category has products
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    
    if (categoryWithProducts?.products.length) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      );
    }
    
    await prisma.category.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}, ['ADMIN']);

// User Management API
export const getUsers = withRole(async (req: NextRequest) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        warehouses: true,
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}, ['ADMIN']);

// Create User (Admin only)
export const createUser = withRole(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Hash password logic would be here in a real application
    // For demo purposes, we're just storing it directly
    
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}, ['ADMIN']);

// Update User (Admin only)
export const updateUser = withRole(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    
    // Remove password from update if it's empty
    if (data.password === '') {
      delete data.password;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        warehouses: true,
      },
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}, ['ADMIN']);

// Financial Reports API
export const getFinancialReports = withRole(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const warehouseId = searchParams.get('warehouseId');
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }
    
    let whereClause: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
    
    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }
    
    // Get sales transactions
    const salesTransactions = await prisma.transaction.findMany({
      where: {
        ...whereClause,
        type: 'SALE',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });
    
    // Get purchase transactions
    const purchaseTransactions = await prisma.transaction.findMany({
      where: {
        ...whereClause,
        type: 'PURCHASE',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });
    
    // Calculate revenue, cost, and profit
    const revenue = salesTransactions.reduce((total, sale) => {
      const saleTotal = sale.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
      return total + saleTotal;
    }, 0);
    
    const cost = purchaseTransactions.reduce((total, purchase) => {
      const purchaseTotal = purchase.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
      return total + purchaseTotal;
    }, 0);
    
    // Calculate profit by product category
    const categorySales: Record<string, number> = {};
    
    for (const sale of salesTransactions) {
      for (const item of sale.items) {
        const categoryId = item.product.categoryId || 'uncategorized';
        const saleAmount = item.price * item.quantity;
        
        if (!categorySales[categoryId]) {
          categorySales[categoryId] = 0;
        }
        
        categorySales[categoryId] += saleAmount;
      }
    }
    
    // Get category names
    const categories = await prisma.category.findMany();
    const categoryMap = categories.reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {} as Record<string, string>);
    
    const salesByCategory = Object.entries(categorySales).map(([categoryId, amount]) => ({
      category: categoryId === 'uncategorized' ? 'Uncategorized' : categoryMap[categoryId] || 'Unknown',
      amount,
    }));
    
    return NextResponse.json({
      startDate,
      endDate,
      revenue,
      cost,
      profit: revenue - cost,
      salesByCategory,
      salesCount: salesTransactions.length,
      purchaseCount: purchaseTransactions.length,
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial report' },
      { status: 500 }
    );
  }
}, ['ADMIN', 'MANAGER']);

// Analytics API
export const getAnalytics = withRole(async (req: NextRequest) => {
  try {
    // Get total inventory value
    const totalValue = await getInventoryValue();
    
    // Get low stock products across all warehouses
    const warehouses = await prisma.warehouse.findMany();
    let lowStockProducts: any[] = [];
    
    for (const warehouse of warehouses) {
      const lowStock = await checkLowStock(warehouse.id);
      lowStockProducts = [...lowStockProducts, ...lowStock];
    }
    
    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: {
        date: 'desc',
      },
      include: {
        items: true,
        warehouse: true,
      },
    });
    
    // Calculate sales and purchases for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const salesThisMonth = await prisma.transaction.findMany({
      where: {
        type: 'SALE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        items: true,
      },
    });
    
    const purchasesThisMonth = await prisma.transaction.findMany({
      where: {
        type: 'PURCHASE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        items: true,
      },
    });
    
    // Calculate total sales and purchases
    const totalSales = salesThisMonth.reduce((total, sale) => {
      const saleTotal = sale.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
      return total + saleTotal;
    }, 0);
    
    const totalPurchases = purchasesThisMonth.reduce((total, purchase) => {
      const purchaseTotal = purchase.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
      return total + purchaseTotal;
    }, 0);
    
    return NextResponse.json({
      totalInventoryValue: totalValue,
      lowStockProductsCount: lowStockProducts.length,
      lowStockProducts,
      recentTransactions,
      monthlyStats: {
        sales: totalSales,
        purchases: totalPurchases,
        profit: totalSales - totalPurchases,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}, ['ADMIN', 'MANAGER']);