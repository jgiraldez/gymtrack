import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Youtube, Clock, DumbbellIcon as Barbell, Check, X } from "lucide-react"
import { getYoutubeThumbnailUrl } from "@/lib/utils"
import type { ExerciseCardProps } from "./types"

export const ExerciseCard: React.FC<ExerciseCardProps> = React.memo(({
  exercise,
  onEdit,
  onDelete,
  onVideoClick,
  isEditing,
  editExercise,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
}) => {
  const thumbnailUrl = exercise.videoUrl ? getYoutubeThumbnailUrl(exercise.videoUrl) : null

  return (
    <Card className="relative group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {isEditing ? (
            <input
              type="text"
              value={editExercise.name || exercise.name}
              onChange={(e) => onEditChange("name", e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          ) : (
            exercise.name
          )}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onEdit(exercise)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(exercise.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSaveEdit(exercise.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {thumbnailUrl && (
          <div className="relative aspect-video mb-4">
            <img
              src={thumbnailUrl}
              alt={exercise.name}
              className="rounded-md object-cover w-full h-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
              onClick={() => onVideoClick(exercise.videoUrl)}
            >
              <Youtube className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
        <div className="space-y-2">
          {isEditing ? (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editExercise.reps || exercise.reps || 0}
                  onChange={(e) => onEditChange("reps", parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="Reps"
                />
                <span className="text-sm text-muted-foreground">reps</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editExercise.duration || exercise.duration || 0}
                  onChange={(e) => onEditChange("duration", parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="Duration"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editExercise.weight || exercise.weight || 0}
                  onChange={(e) => onEditChange("weight", parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="Weight"
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </>
          ) : (
            <>
              {(exercise.reps ?? 0) > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{exercise.reps} reps</span>
                </div>
              )}
              {(exercise.duration ?? 0) > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{exercise.duration} seconds</span>
                </div>
              )}
              {(exercise.weight ?? 0) > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Barbell className="h-4 w-4 mr-2" />
                  <span>{exercise.weight} kg</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{exercise.bilateral ? "Bilateral" : "Unilateral"}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

ExerciseCard.displayName = "ExerciseCard" 