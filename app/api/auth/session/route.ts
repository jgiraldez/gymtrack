import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin if it hasn't been initialized
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY) : undefined,
        }),
      })
    }

    const { idToken } = await request.json()
    const cookieStore = await cookies()
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 7 * 1000 // 1 week
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn })
    
    // Set session cookie
    cookieStore.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn / 1000 // Convert to seconds
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    
    // Clear session cookie
    cookieStore.delete('session')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing session:', error)
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 })
  }
} 