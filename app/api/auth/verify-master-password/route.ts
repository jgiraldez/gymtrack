import { NextResponse } from 'next/server'

const MASTER_PASSWORD = 'jamas123'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === MASTER_PASSWORD) {
      return NextResponse.json({ isValid: true })
    }

    return NextResponse.json({ isValid: false }, { status: 401 })
  } catch (error) {
    console.error('Error verifying master password:', error)
    return NextResponse.json({ isValid: false }, { status: 500 })
  }
} 