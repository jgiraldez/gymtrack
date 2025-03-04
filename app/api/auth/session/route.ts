import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin if it hasn't been initialized
    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
      if (!privateKey) {
        console.error('FIREBASE_PRIVATE_KEY is not set')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }

      try {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: JSON.parse(privateKey),
          }),
        })
      } catch (initError) {
        console.error('Firebase Admin initialization error:', initError)
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }
    }

    const { idToken } = await request.json()
    if (!idToken) {
      console.error('No ID token provided')
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 })
    }

    const cookieStore = await cookies()
    
    try {
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
    } catch (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Unexpected error in session creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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