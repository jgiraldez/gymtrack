export interface Exercise {
  id: string
  name: string
  videoUrl: string
  bilateral: boolean
  reps?: number
  duration?: number
  weight?: number
  completed?: boolean
}

export interface Series {
  id: string
  name: string
  exercises: string[]
}

export interface SeriesDetailProps {
  series: Series
  exercises: Exercise[]
  allExercises: Exercise[]
  onUpdateExercise: (exerciseId: string, updatedExercise: Partial<Exercise>) => void
  onDeleteExercise: (exerciseId: string) => void
  onUpdateSeries: (seriesId: string, updatedSeries: Partial<Series>) => void
  onSeriesCompleted: (seriesId: string) => void
}

export interface ExerciseCardProps {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDelete: (exerciseId: string) => void
  onVideoClick: (videoUrl: string) => void
  isEditing: boolean
  editExercise: Partial<Exercise>
  onSaveEdit: (exerciseId: string) => void
  onCancelEdit: () => void
  onEditChange: (field: keyof Exercise, value: any) => void
}

export interface ExerciseTableProps {
  exercises: Exercise[]
  onEdit: (exercise: Exercise) => void
  onDelete: (exerciseId: string) => void
  onVideoClick: (videoUrl: string) => void
  isEditing: boolean
  editExercise: Partial<Exercise>
  onSaveEdit: (exerciseId: string) => void
  onCancelEdit: () => void
  onEditChange: (field: keyof Exercise, value: any) => void
}

export interface VideoDialogProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
} 