import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'

export interface Exercise {
  id: string
  name: string
  description: string
  muscleGroup: string
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  videoUrl?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const exerciseService = {
  async create(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const exerciseRef = doc(collection(db, 'exercises'))
    const exerciseData = {
      ...exercise,
      id: exerciseRef.id,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    }
    await setDoc(exerciseRef, exerciseData)
  },

  async getAll(): Promise<Exercise[]> {
    const exercisesQuery = query(collection(db, 'exercises'))
    const exerciseDocs = await getDocs(exercisesQuery)
    
    return exerciseDocs.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Exercise
    })
  },

  async getById(id: string): Promise<Exercise | null> {
    const exerciseRef = doc(db, 'exercises', id)
    const exerciseDoc = await getDoc(exerciseRef)
    if (!exerciseDoc.exists()) return null

    const data = exerciseDoc.data()
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Exercise
  },

  async update(id: string, data: Partial<Exercise>): Promise<void> {
    const exerciseRef = doc(db, 'exercises', id)
    await updateDoc(exerciseRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date())
    })
  },

  async delete(id: string): Promise<void> {
    const exerciseRef = doc(db, 'exercises', id)
    await deleteDoc(exerciseRef)
  },

  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const exercisesQuery = query(
      collection(db, 'exercises'),
      where('muscleGroup', '==', muscleGroup)
    )
    const exerciseDocs = await getDocs(exercisesQuery)
    
    return exerciseDocs.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Exercise
    })
  },

  async getByDifficulty(difficulty: Exercise['difficulty']): Promise<Exercise[]> {
    const exercisesQuery = query(
      collection(db, 'exercises'),
      where('difficulty', '==', difficulty)
    )
    const exerciseDocs = await getDocs(exercisesQuery)
    
    return exerciseDocs.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Exercise
    })
  }
}

export { exerciseService } 