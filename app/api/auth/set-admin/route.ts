import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the current user is an admin
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie)
    const db = getFirestore()
    const currentUserDoc = await db.collection('users').doc(decodedClaims.uid).get()
    const currentUserData = currentUserDoc.data()

    if (currentUserData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Get the target user email from the request body
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    // Find the user by email
    const usersRef = db.collection('users')
    const querySnapshot = await usersRef.where('email', '==', email).get()

    if (querySnapshot.empty) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Update the user's role to admin
    const userDoc = querySnapshot.docs[0]
    await userDoc.ref.update({
      role: 'admin',
      updatedAt: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting admin role:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 