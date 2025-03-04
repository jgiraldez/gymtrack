import { config } from 'dotenv'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore()

async function setUserAsAdmin(email: string) {
  try {
    // Find the user by email
    const usersRef = db.collection('users')
    const querySnapshot = await usersRef.where('email', '==', email).get()

    if (querySnapshot.empty) {
      console.error('User not found')
      return
    }

    // Update the user's role to admin
    const userDoc = querySnapshot.docs[0]
    await userDoc.ref.update({
      role: 'admin',
      updatedAt: new Date()
    })

    console.log(`Successfully set ${email} as admin`)
  } catch (error) {
    console.error('Error setting admin role:', error)
  }
}

// Set the user as admin
setUserAsAdmin('giraldezblack@gmail.com') 