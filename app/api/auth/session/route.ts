import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Session route handler for authentication
export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin if it hasn't been initialized
    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
      const projectId = process.env.FIREBASE_PROJECT_ID
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

      console.log('Checking Firebase configuration...')
      console.log('Project ID exists:', !!projectId)
      console.log('Client Email exists:', !!clientEmail)
      console.log('Private Key exists:', !!privateKey)

      if (!privateKey) {
        console.error('FIREBASE_PRIVATE_KEY is not set')
        return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 })
      }

      if (!projectId) {
        console.error('FIREBASE_PROJECT_ID is not set')
        return NextResponse.json({ error: 'Server configuration error: Missing project ID' }, { status: 500 })
      }

      if (!clientEmail) {
        console.error('FIREBASE_CLIENT_EMAIL is not set')
        return NextResponse.json({ error: 'Server configuration error: Missing client email' }, { status: 500 })
      }

      try {
        console.log('Attempting to initialize Firebase Admin...')
        // Handle the private key format
        const formattedPrivateKey = privateKey
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/^"|"$/g, '')

        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: formattedPrivateKey,
          }),
        })
        console.log('Firebase Admin initialized successfully')
      } catch (initError) {
        console.error('Firebase Admin initialization error:', initError)
        return NextResponse.json({ 
          error: 'Server configuration error',
          details: initError instanceof Error ? initError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    const { idToken } = await request.json()
    if (!idToken) {
      console.error('No ID token provided')
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 })
    }

    const cookieStore = await cookies()
    
    try {
      console.log('Creating session cookie...')
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

      console.log('Session cookie created and set successfully')
      return NextResponse.json({ success: true })
    } catch (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ 
        error: 'Invalid ID token',
        details: authError instanceof Error ? authError.message : 'Unknown error'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Unexpected error in session creation:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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