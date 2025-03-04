"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Youtube, Clock, DumbbellIcon as Barbell } from "lucide-react"
import type { Series, Exercise } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getYoutubeVideoId, getYoutubeThumbnailUrl } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"

import { Check, LayoutGrid, List, Play, Layers } from "lucide-react"

interface SeriesDetailProps {
  series: Series
  exercises: Exercise[]
  allExercises: Exercise[]
  onUpdateExercise: (exerciseId: string, updatedExercise: Partial<Exercise>) => void
  onDeleteExercise: (exerciseId: string) => void
  onUpdateSeries: (seriesId: string, updatedSeries: Partial<Series>) => void
  onSeriesCompleted: (seriesId: string) => void
}

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
  const [addFromExisting, setAddFromExisting] = useState(false)
  const [selectedExistingId, setSelectedExistingId] = useState("")
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null)
  const [showCongratulationsOverlay, setShowCongratulationsOverlay] = useState(false)

  const handleToggleComplete = useCallback(
    (exerciseId: string) => {
      const exercise = exercises.find((e) => e.id === exerciseId)
      if (exercise) {
        const newCompletedReps = (exercise.completedReps || 0) + 1
        const isExerciseCompleted = newCompletedReps >= series.rounds
        onUpdateExercise(exerciseId, {
          completedReps: newCompletedReps,
          completed: isExerciseCompleted,
        })

        if (isExerciseCompleted) {
          setCurrentExerciseId(exerciseId)
          setShowRatingDialog(true)
        }
      }
    },
    [exercises, series.rounds, onUpdateExercise],
  )

  const handleRateExercise = (rating: number) => {
    if (currentExerciseId) {
      onUpdateExercise(currentExerciseId, { rating })
      setShowRatingDialog(false)
      checkSeriesCompletion()
    }
  }

  const checkSeriesCompletion = useCallback(() => {
    const allExercisesCompleted = exercises.every((exercise) => exercise.completed)
    if (allExercisesCompleted) {
      setShowCongratulationsOverlay(true)
      setTimeout(() => {
        setShowCongratulationsOverlay(false)
        onSeriesCompleted(series.id)
      }, 2000) // Show congratulations for 2 seconds before moving to the next series
    }
  }, [exercises, series.id, onSeriesCompleted])

  useEffect(() => {
    checkSeriesCompletion()
  }, [checkSeriesCompletion])

  const updateSeriesProgress = useCallback(() => {
    const totalCompletedReps = exercises.reduce((sum, e) => sum + (e.completedReps || 0), 0)
    const totalPossibleReps = exercises.length * series.rounds
    const newProgress = totalPossibleReps > 0 ? totalCompletedReps / totalPossibleReps : 0
    if (newProgress !== series.progress) {
      onUpdateSeries(series.id, { progress: newProgress })
    }
  }, [exercises, series.id, series.rounds, series.progress, onUpdateSeries])

  useEffect(() => {
    updateSeriesProgress()
  }, [updateSeriesProgress])

  const handleEditClick = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingExerciseId(exercise.id)
    setEditExercise({
      name: exercise.name,
      reps: exercise.reps,
      duration: exercise.duration,
      load: exercise.load,
      isBilateral: exercise.isBilateral,
      videoUrl: exercise.videoUrl,
    })
  }

  const handleSaveEdit = (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateExercise(exerciseId, editExercise)
    setEditingExerciseId(null)
  }

  const handleDeleteClick = (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this exercise?")) {
      onDeleteExercise(exerciseId)
    }
  }

  const handleVideoClick = (videoUrl: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveVideoUrl(videoUrl)
    setShowVideoDialog(true)
  }

  const handleAddExistingExercise = () => {
    if (!selectedExistingId) return

    const existingExercise = allExercises.find((e) => e.id === selectedExistingId)
    if (!existingExercise) return

    const newExercise: Exercise = {
      ...existingExercise,
      id: crypto.randomUUID(),
      completed: false,
      completedReps: 0,
    }

    onUpdateExercise(newExercise.id, newExercise)
    onUpdateSeries(series.id, {
      exerciseIds: [...series.exerciseIds, newExercise.id],
    })

    setAddFromExisting(false)
    setSelectedExistingId("")
  }

  const availableExercises = allExercises.filter((e) => !series.exerciseIds.includes(e.id))

  const completedExercises = exercises.filter((e) => e.completed).length
  const totalExercises = exercises.length
  const completedSeries = Math.floor(completedExercises / totalExercises)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Layers className="mr-2 h-6 w-6" />
          {series.name} ({series.rounds} series)
        </h2>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setAddFromExisting(true)} variant="secondary" className="btn-secondary">
            Agregar Ejercicio Existente
          </Button>
        </div>
      </div>

      <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
        <p className="text-lg font-semibold">Progreso de la Serie: {Math.floor(series.progress * 100)}%</p>
        <progress
          className="w-full"
          value={exercises.reduce((sum, exercise) => sum + (exercise.completedReps || 0), 0)}
          max={exercises.length * series.rounds}
        ></progress>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className={`card ${exercise.completed ? "border-l-4 border-l-green-500" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  {editingExerciseId === exercise.id ? (
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editExercise.name}
                        onChange={(e) => setEditExercise({ ...editExercise, name: e.target.value })}
                        className="input mb-2"
                        placeholder="Exercise name"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <CardTitle className="card-title flex items-center">{exercise.name}</CardTitle>
                  )}
                  {editingExerciseId !== exercise.id && (
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleEditClick(exercise, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(exercise.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingExerciseId === exercise.id ? (
                  <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    <Tabs defaultValue="reps" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-secondary">
                        <TabsTrigger value="reps">Reps</TabsTrigger>
                        <TabsTrigger value="duration">Duration (sec)</TabsTrigger>
                      </TabsList>
                      <TabsContent value="reps" className="pt-2">
                        <Input
                          type="number"
                          value={editExercise.reps}
                          onChange={(e) =>
                            setEditExercise({ ...editExercise, reps: Number.parseInt(e.target.value) || 0 })
                          }
                          className="input"
                          placeholder="Number of reps"
                        />
                      </TabsContent>
                      <TabsContent value="duration" className="pt-2">
                        <Input
                          type="number"
                          value={editExercise.duration}
                          onChange={(e) =>
                            setEditExercise({ ...editExercise, duration: Number.parseInt(e.target.value) || 0 })
                          }
                          className="input"
                          placeholder="Duration in seconds"
                        />
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                      <Input
                        id="load"
                        type="number"
                        value={editExercise.load}
                        onChange={(e) =>
                          setEditExercise({ ...editExercise, load: Number.parseInt(e.target.value) || 0 })
                        }
                        className="input"
                        placeholder="Weight"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="bilateral"
                        checked={editExercise.isBilateral}
                        onCheckedChange={(checked) => setEditExercise({ ...editExercise, isBilateral: checked })}
                      />
                      <Label htmlFor="bilateral">Bilateral exercise</Label>
                    </div>

                    <div className="space-y-2">
                      <Input
                        id="videoUrl"
                        value={editExercise.videoUrl}
                        onChange={(e) => setEditExercise({ ...editExercise, videoUrl: e.target.value })}
                        className="input"
                        placeholder="https://youtube.com/..."
                      />
                    </div>

                    <Button onClick={(e) => handleSaveEdit(exercise.id, e)} className="w-full btn-primary">
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {exercise.reps > 0 && (
                        <div className="flex items-center text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">
                          <span>{exercise.reps} reps</span>
                        </div>
                      )}
                      {exercise.duration > 0 && (
                        <div className="flex items-center text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{exercise.duration}s</span>
                        </div>
                      )}
                      {exercise.load > 0 && (
                        <div className="flex items-center text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">
                          <Barbell className="h-3 w-3 mr-1" />
                          <span>{exercise.load} kg</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">
                        <span>{exercise.isBilateral ? "Bilateral" : "Unilateral"}</span>
                      </div>
                    </div>

                    {exercise.videoUrl && getYoutubeVideoId(exercise.videoUrl) && (
                      <div
                        className="relative aspect-video bg-secondary rounded overflow-hidden cursor-pointer"
                        onClick={(e) => handleVideoClick(exercise.videoUrl, e)}
                      >
                        <img
                          src={getYoutubeThumbnailUrl(exercise.videoUrl) || "/placeholder.svg"}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Youtube className="h-10 w-10 text-red-500" />
                        </div>
                      </div>
                    )}
                    {exercise.rating && (
                      <div className="flex items-center mt-2">
                        <Star className={`h-4 w-4 ${exercise.rating <= 3 ? "text-yellow-500" : "text-red-500"} mr-1`} />
                        <span className="text-sm">Rated: {exercise.rating}/5</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <span>
                      Completado: {exercise.completedReps || 0} / {series.rounds}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleToggleComplete(exercise.id)}
                    className="w-full border border-black text-black bg-transparent hover:bg-black hover:text-white transition-colors"
                    variant="outline"
                  >
                    {exercise.completedReps === series.rounds ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Completado
                      </>
                    ) : (
                      `Completar (${exercise.completedReps || 0}/${series.rounds})`
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ejercicio</TableHead>
              <TableHead>Repeticiones/Duración</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Video</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Barbell className="mr-2 h-4 w-4" />
                    {exercise.name}
                  </div>
                </TableCell>
                <TableCell>{exercise.reps > 0 ? `${exercise.reps} reps` : `${exercise.duration}s`}</TableCell>
                <TableCell>{exercise.load > 0 ? `${exercise.load} kg` : "-"}</TableCell>
                <TableCell>{exercise.isBilateral ? "Bilateral" : "Unilateral"}</TableCell>
                <TableCell>
                  {exercise.videoUrl && (
                    <Button size="sm" variant="outline" onClick={(e) => handleVideoClick(exercise.videoUrl, e)}>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleToggleComplete(exercise.id)}
                    className="w-full border border-black text-black bg-transparent hover:bg-black hover:text-white transition-colors"
                    variant="outline"
                  >
                    {exercise.completedReps === series.rounds ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Completado
                      </>
                    ) : (
                      `Complete (${exercise.completedReps || 0}/${series.rounds})`
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={(e) => handleEditClick(exercise, e)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(e) => handleDeleteClick(exercise.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {exercises.length === 0 && (
        <div className="text-center py-10 text-muted">
          <p>No hay ejercicios añadidos aún. Haz clic en "Agregar Ejercicio" para comenzar.</p>
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-[800px] secondary-box">
          <DialogHeader>
            <DialogTitle>Video del Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {activeVideoUrl && getYoutubeVideoId(activeVideoUrl) && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(activeVideoUrl)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowVideoDialog(false)} className="btn-primary">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Existing Exercise Dialog */}
      <Dialog open={addFromExisting} onOpenChange={setAddFromExisting}>
        <DialogContent className="sm:max-w-[500px] secondary-box">
          <DialogHeader>
            <DialogTitle>Agregar Ejercicio Existente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedExistingId} onValueChange={setSelectedExistingId}>
              <SelectTrigger className="bg-secondary border-input text-white">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-input">
                {availableExercises.length > 0 ? (
                  availableExercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id} className="text-white">
                      {exercise.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="text-white">
                    No available exercises
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAddFromExisting(false)} className="btn-secondary text-white">
              Cancelar
            </Button>
            <Button
              onClick={handleAddExistingExercise}
              disabled={!selectedExistingId}
              className="btn-primary text-white"
            >
              Agregar Ejercicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Califica el ejercicio</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center space-x-2 py-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                onClick={() => handleRateExercise(rating)}
                variant="outline"
                className="w-12 h-12 rounded-full"
              >
                <Star className={`h-6 w-6 ${rating <= 3 ? "text-yellow-500" : "text-red-500"}`} />
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRatingDialog(false)} variant="secondary">
              Omitir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Congratulations Overlay */}
      {showCongratulationsOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">¡Felicidades!</h2>
            <p>Has completado todos los ejercicios en esta serie.</p>
          </div>
        </div>
      )}
    </div>
  )
}

