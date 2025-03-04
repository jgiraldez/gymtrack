"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import type { SeriesDetailProps, Exercise } from "./types"
import { ExerciseCard } from "./ExerciseCard"
import { ExerciseTable } from "./ExerciseTable"
import { VideoDialog } from "./VideoDialog"

export default function SeriesDetail({
  series,
  exercises,
  allExercises,
  onUpdateExercise,
  onDeleteExercise,
  onUpdateSeries,
  onSeriesCompleted,
}: SeriesDetailProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [activeVideoUrl, setActiveVideoUrl] = useState("")
  const [editExercise, setEditExercise] = useState<Partial<Exercise>>({})

  const handleEditClick = useCallback((exercise: Exercise) => {
    setEditingExerciseId(exercise.id)
    setEditExercise(exercise)
  }, [])

  const handleSaveEdit = useCallback((exerciseId: string) => {
    onUpdateExercise(exerciseId, editExercise)
    setEditingExerciseId(null)
    setEditExercise({})
  }, [editExercise, onUpdateExercise])

  const handleCancelEdit = useCallback(() => {
    setEditingExerciseId(null)
    setEditExercise({})
  }, [])

  const handleDeleteClick = useCallback((exerciseId: string) => {
    onDeleteExercise(exerciseId)
  }, [onDeleteExercise])

  const handleVideoClick = useCallback((videoUrl: string) => {
    setActiveVideoUrl(videoUrl)
    setShowVideoDialog(true)
  }, [])

  const handleEditChange = useCallback((field: keyof Exercise, value: any) => {
    setEditExercise(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{series.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-accent" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onVideoClick={handleVideoClick}
                  isEditing={editingExerciseId === exercise.id}
                  editExercise={editExercise}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditChange={handleEditChange}
                />
              ))}
            </div>
          ) : (
            <ExerciseTable
              exercises={exercises}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onVideoClick={handleVideoClick}
              isEditing={editingExerciseId !== null}
              editExercise={editExercise}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditChange={handleEditChange}
            />
          )}
        </CardContent>
      </Card>

      <VideoDialog
        isOpen={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        videoUrl={activeVideoUrl}
      />
    </div>
  )
} 