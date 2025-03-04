export interface Exercise {
  id: string
  name: string
  videoUrl: string
  bilateral: boolean
  reps?: number
  duration?: number
  load?: number
  isBilateral?: boolean
  completed?: boolean
  completedReps?: number
  createdAt: Date
  updatedAt: Date
}

export interface Series {
  id: string
  name: string
  rounds: number
  exerciseIds: string[]
  icon?: string
  progress?: number
  createdAt: Date
  updatedAt: Date
}

export interface TrainingDay {
  id: string
  userId: string
  date: Date
  name: string
  series: Series[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  displayName?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  userId: string
  totalWorkouts: number
  totalExercises: number
  lastWorkout: Date
  favoriteExercises: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Day {
  id: string
  name: string
  date: string
  seriesIds: string[]
}

export interface GymTrackerData {
  days: Day[]
  series: Series[]
  exercises: Exercise[]
}

