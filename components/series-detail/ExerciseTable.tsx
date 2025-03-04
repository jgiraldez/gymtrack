import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Youtube, Check, X } from "lucide-react"
import type { ExerciseTableProps } from "./types"

export const ExerciseTable: React.FC<ExerciseTableProps> = React.memo(({
  exercises,
  onEdit,
  onDelete,
  onVideoClick,
  isEditing,
  editExercise,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Weight</TableHead>
          <TableHead>Video</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exercises.map((exercise) => (
          <TableRow key={exercise.id}>
            <TableCell>
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
            </TableCell>
            <TableCell>
              {isEditing ? (
                <input
                  type="number"
                  value={editExercise.duration || exercise.duration}
                  onChange={(e) => onEditChange("duration", parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                />
              ) : (
                `${exercise.duration} seconds`
              )}
            </TableCell>
            <TableCell>
              {isEditing ? (
                <input
                  type="number"
                  value={editExercise.weight || exercise.weight}
                  onChange={(e) => onEditChange("weight", parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                />
              ) : (
                `${exercise.weight} kg`
              )}
            </TableCell>
            <TableCell>
              {exercise.videoUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onVideoClick(exercise.videoUrl)}
                >
                  <Youtube className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
            <TableCell>
              {!isEditing ? (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(exercise)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSaveEdit(exercise.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
})

ExerciseTable.displayName = "ExerciseTable" 