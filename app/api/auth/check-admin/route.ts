import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

export async function GET() {
  try {
    // Initialize Firebase Admin if it hasn't been initialized
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ isAdmin: false, error: 'No session cookie found' }, { status: 401 })
    }

    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie)
    const db = getFirestore()
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get()
    const userData = userDoc.data()

    if (!userData) {
      return NextResponse.json({ isAdmin: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ isAdmin: userData.role === 'admin' })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 })
  }
} 