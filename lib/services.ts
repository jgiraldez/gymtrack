import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore'
import type { Exercise, Series, TrainingDay, UserStats } from './types'

// Exercise services
export const exerciseService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, 'exercises'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exercise[]
  },

  async getById(id: string) {
    const docRef = doc(db, 'exercises', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Exercise
  },

  async create(exercise: Omit<Exercise, 'id'>) {
    const docRef = await addDoc(collection(db, 'exercises'), exercise)
    return { id: docRef.id, ...exercise } as Exercise
  },

  async update(id: string, exercise: Partial<Exercise>) {
    const docRef = doc(db, 'exercises', id)
    await updateDoc(docRef, exercise)
    return { id, ...exercise } as Exercise
  },

  async delete(id: string) {
    const docRef = doc(db, 'exercises', id)
    await deleteDoc(docRef)
  }
}

// Training day services
export const trainingDayService = {
  async getAllByUserId(userId: string) {
    const q = query(
      collection(db, 'trainingDays'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TrainingDay[]
  },

  async getById(id: string) {
    const docRef = doc(db, 'trainingDays', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as TrainingDay
  },

  async create(trainingDay: Omit<TrainingDay, 'id'>) {
    const docRef = await addDoc(collection(db, 'trainingDays'), {
      ...trainingDay,
      date: Timestamp.fromDate(new Date(trainingDay.date))
    })
    return { id: docRef.id, ...trainingDay } as TrainingDay
  },

  async update(id: string, trainingDay: Partial<TrainingDay>) {
    const docRef = doc(db, 'trainingDays', id)
    await updateDoc(docRef, {
      ...trainingDay,
      date: trainingDay.date ? Timestamp.fromDate(new Date(trainingDay.date)) : undefined
    })
    return { id, ...trainingDay } as TrainingDay
  },

  async delete(id: string) {
    const docRef = doc(db, 'trainingDays', id)
    await deleteDoc(docRef)
  }
}

// Series services
export const seriesService = {
  async getAllByTrainingDayId(trainingDayId: string) {
    const q = query(
      collection(db, 'series'),
      where('trainingDayId', '==', trainingDayId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Series[]
  },

  async create(series: Omit<Series, 'id'>) {
    const docRef = await addDoc(collection(db, 'series'), {
      ...series,
      createdAt: Timestamp.now()
    })
    return { id: docRef.id, ...series } as Series
  },

  async update(id: string, series: Partial<Series>) {
    const docRef = doc(db, 'series', id)
    await updateDoc(docRef, series)
    return { id, ...series } as Series
  },

  async delete(id: string) {
    const docRef = doc(db, 'series', id)
    await deleteDoc(docRef)
  }
}

// User stats services
export const userStatsService = {
  async getByUserId(userId: string) {
    const docRef = doc(db, 'userStats', userId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    const data = docSnap.data() as DocumentData
    return {
      id: docSnap.id,
      userId: data.userId,
      totalWorkouts: data.totalWorkouts,
      totalExercises: data.totalExercises,
      lastWorkout: data.lastWorkout ? (data.lastWorkout as Timestamp).toDate() : null,
      favoriteExercises: data.favoriteExercises,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate()
    } as UserStats
  },

  async create(userId: string, stats: Omit<UserStats, 'id'>) {
    const docRef = doc(db, 'userStats', userId)
    const now = Timestamp.now()
    const data = {
      ...stats,
      createdAt: now,
      updatedAt: now
    }
    await updateDoc(docRef, data)
    return {
      id: userId,
      ...stats,
      createdAt: now.toDate(),
      updatedAt: now.toDate()
    } as UserStats
  },

  async update(userId: string, stats: Partial<UserStats>) {
    const docRef = doc(db, 'userStats', userId)
    const now = Timestamp.now()
    const data = {
      ...stats,
      updatedAt: now
    }
    await updateDoc(docRef, data)
    return {
      id: userId,
      ...stats,
      updatedAt: now.toDate()
    } as UserStats
  }
} 