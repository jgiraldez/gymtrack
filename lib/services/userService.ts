import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import type { User } from 'firebase/auth'

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
  lastLogin: Date
  totalWorkouts: number
  totalExercises: number
  streak: number
  lastWorkoutDate: Date | null
}

export interface WorkoutHistory {
  id: string
  userId: string
  date: Date
  duration: number
  exercises: {
    id: string
    name: string
    sets: number
    reps: number
    weight: number
  }[]
  notes: string
}

const userService = {
  async createProfile(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid)
    const userData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      totalWorkouts: 0,
      totalExercises: 0,
      streak: 0,
      lastWorkoutDate: null
    }
    await setDoc(userRef, userData)
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) return null

    const data = userDoc.data()
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastLogin: data.lastLogin.toDate(),
      lastWorkoutDate: data.lastWorkoutDate?.toDate() || null
    } as UserProfile
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    })
  },

  async addWorkoutHistory(history: Omit<WorkoutHistory, 'id'>): Promise<void> {
    const historyRef = doc(collection(db, 'workoutHistory'))
    const historyData = {
      ...history,
      id: historyRef.id,
      date: Timestamp.fromDate(history.date)
    }
    await setDoc(historyRef, historyData)

    // Update user stats
    const userRef = doc(db, 'users', history.userId)
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const lastWorkoutDate = userData.lastWorkoutDate?.toDate() || null
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let streak = userData.streak || 0
      if (lastWorkoutDate) {
        if (lastWorkoutDate.toDateString() === yesterday.toDateString()) {
          streak++
        } else if (lastWorkoutDate.toDateString() !== today.toDateString()) {
          streak = 1
        }
      } else {
        streak = 1
      }

      await updateDoc(userRef, {
        totalWorkouts: (userData.totalWorkouts || 0) + 1,
        totalExercises: (userData.totalExercises || 0) + history.exercises.length,
        streak,
        lastWorkoutDate: Timestamp.fromDate(today),
        updatedAt: Timestamp.fromDate(new Date())
      })
    }
  },

  async getWorkoutHistory(userId: string): Promise<WorkoutHistory[]> {
    const historyQuery = query(
      collection(db, 'workoutHistory'),
      where('userId', '==', userId)
    )
    const historyDocs = await getDocs(historyQuery)
    
    return historyDocs.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        date: data.date.toDate()
      } as WorkoutHistory
    })
  },

  async updateLastLogin(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      lastLogin: new Date(),
      updatedAt: new Date()
    })
  }
}

export { userService } 