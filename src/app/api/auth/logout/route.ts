import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = cookies()
    // Hapus cookie otentikasi
    cookieStore.delete('inventory-auth-token')

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'An error occurred during logout.' },
      { status: 500 }
    )
  }
}