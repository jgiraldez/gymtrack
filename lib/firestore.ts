import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import type { Exercise, Series } from '@/components/series-detail/types'

interface UserProfile {
  displayName: string
  email: string
  height?: number
  weight?: number
  goals?: string
}

interface Workout {
  id: string
  date: string
  exercises: {
    name: string
    sets: {
      reps: number
      weight: number
    }[]
  }[]
}

export const firestoreService = {
  // Exercise operations
  async createExercise(userId: string, exercise: Omit<Exercise, 'id'>) {
    const exerciseRef = doc(collection(db, 'users', userId, 'exercises'))
    await setDoc(exerciseRef, {
      ...exercise,
      createdAt: new Date().toISOString()
    })
    return exerciseRef.id
  },

  async getExercises(userId: string) {
    const exercisesRef = collection(db, 'users', userId, 'exercises')
    const q = query(exercisesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exercise[]
  },

  async updateExercise(userId: string, exerciseId: string, updates: Partial<Exercise>) {
    const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId)
    await updateDoc(exerciseRef, updates)
  },

  async deleteExercise(userId: string, exerciseId: string) {
    const exerciseRef = doc(db, 'users', userId, 'exercises', exerciseId)
    await deleteDoc(exerciseRef)
  },

  // Series operations
  async createSeries(userId: string, series: Omit<Series, 'id'>) {
    const seriesRef = doc(collection(db, 'users', userId, 'series'))
    await setDoc(seriesRef, {
      ...series,
      createdAt: new Date().toISOString()
    })
    return seriesRef.id
  },

  async getSeries(userId: string) {
    const seriesRef = collection(db, 'users', userId, 'series')
    const q = query(seriesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Series[]
  },

  async updateSeries(userId: string, seriesId: string, updates: Partial<Series>) {
    const seriesRef = doc(db, 'users', userId, 'series', seriesId)
    await updateDoc(seriesRef, updates)
  },

  async deleteSeries(userId: string, seriesId: string) {
    const seriesRef = doc(db, 'users', userId, 'series', seriesId)
    await deleteDoc(seriesRef)
  },

  // User profile operations
  async createUserProfile(userId: string, email: string) {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      email,
      createdAt: new Date().toISOString()
    })
  },

  async getUserProfile(userId: string): Promise<UserProfile> {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }
    return userDoc.data() as UserProfile
  },

  async updateUserProfile(userId: string, profile: UserProfile): Promise<void> {
    await updateDoc(doc(db, 'users', userId), profile)
  },

  async getUserWorkouts(userId: string): Promise<Workout[]> {
    const workoutsRef = collection(db, 'users', userId, 'workouts')
    const workoutsSnapshot = await getDocs(workoutsRef)
    return workoutsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Workout))
  }
} 