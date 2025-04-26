import { NextRequest, NextResponse } from 'next/server';
import { getStockInData, getStockOutData, getWarehouses } from '@/lib/services/stock-service';

/**
 * API endpoint untuk mendapatkan data stock
 * 
 * Mendukung query parameters:
 * - type: 'in' | 'out' - Tipe stock (in/out)
 * - warehouseId: string - Filter berdasarkan warehouse
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const warehouseId = searchParams.get('warehouseId') || undefined;
    
    // Validasi parameter
    if (!type || (type !== 'in' && type !== 'out')) {
      return NextResponse.json(
        { error: 'Invalid stock type. Must be "in" or "out"' },
        { status: 400 }
      );
    }
    
    // Ambil data sesuai tipe
    let data;
    if (type === 'in') {
      data = await getStockInData(warehouseId);
    } else {
      data = await getStockOutData(warehouseId);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint untuk mendapatkan data warehouse
 */
export async function POST(request: NextRequest) {
  try {
    // Implementasi untuk menambahkan data stock akan dibuat nanti
    // Saat ini hanya mengembalikan response sukses dummy
    
    return NextResponse.json(
      { success: true, message: 'Stock data added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding stock data:', error);
    return NextResponse.json(
      { error: 'Failed to add stock data' },
      { status: 500 }
    );
  }
}