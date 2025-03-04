"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import DaysList from "@/components/days-list"
import DayDetail from "@/components/day-detail"
import SeriesDetail from "@/components/series-detail"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialData } from "@/lib/initial-data"
import { exerciseService } from "@/lib/services"
import type { Day, Series, Exercise } from "@/lib/types"

export default function GymTracker() {
  const [data, setData] = useLocalStorage("gym-tracker-data", initialData)
  const [activeView, setActiveView] = useState<"days" | "day" | "series">("days")
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null)
  const [adminExercises, setAdminExercises] = useState<Exercise[]>([])

  useEffect(() => {
    loadAdminExercises()
  }, [])

  const loadAdminExercises = async () => {
    try {
      const exercises = await exerciseService.getAll()
      setAdminExercises(exercises)
    } catch (error) {
      console.error('Error loading admin exercises:', error)
    }
  }

  const handleAddDay = () => {
    const newDay: Day = {
      id: crypto.randomUUID(),
      name: `Día ${data.days.length + 1}`,
      date: new Date().toISOString(),
      seriesIds: [],
    }
    setData({
      ...data,
      days: [...data.days, newDay],
    })
  }

  const handleDayClick = (dayId: string) => {
    setActiveDayId(dayId)
    setActiveView("day")
  }

  const handleSeriesClick = (seriesId: string) => {
    setActiveSeriesId(seriesId)
    setActiveView("series")
  }

  const handleBackToDays = () => {
    setActiveView("days")
    setActiveDayId(null)
  }

  const handleBackToDay = () => {
    setActiveView("day")
    setActiveSeriesId(null)
  }

  const handleAddSeries = (dayId: string) => {
    const newSeries: Series = {
      id: crypto.randomUUID(),
      name: `Series ${data.days.find((d) => d.id === dayId)?.seriesIds.length ?? 0 + 1}`,
      rounds: 3,
      exerciseIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setData({
      ...data,
      series: [...data.series, newSeries],
      days: data.days.map((day) => (day.id === dayId ? { ...day, seriesIds: [...day.seriesIds, newSeries.id] } : day)),
    })
  }

  const handleAddExercise = (seriesId: string) => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: `Exercise ${data.exercises.length + 1}`,
      reps: 0,
      duration: 0,
      load: 0,
      isBilateral: true,
      bilateral: true,
      videoUrl: "",
      completed: false,
      completedReps: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setData({
      ...data,
      exercises: [...data.exercises, newExercise],
      series: data.series.map((series) =>
        series.id === seriesId
          ? { ...series, exerciseIds: [...series.exerciseIds, newExercise.id] }
          : series
      ),
    })
  }

  const handleUpdateExercise = (exerciseId: string, updatedExercise: Partial<Exercise>) => {
    setData((prevData) => ({
      ...prevData,
      exercises: prevData.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...updatedExercise } : exercise,
      ),
    }))
  }

  const handleDeleteExercise = (exerciseId: string, seriesId: string) => {
    setData({
      ...data,
      exercises: data.exercises.filter((exercise) => exercise.id !== exerciseId),
      series: data.series.map((series) =>
        series.id === seriesId
          ? { ...series, exerciseIds: series.exerciseIds.filter((id) => id !== exerciseId) }
          : series,
      ),
    })
  }

  const handleUpdateSeries = useCallback(
    (seriesId: string, updatedSeries: Partial<Series>) => {
      setData((prevData) => ({
        ...prevData,
        series: prevData.series.map((series) => (series.id === seriesId ? { ...series, ...updatedSeries } : series)),
      }))
    },
    [setData],
  )

  const handleDeleteSeries = (seriesId: string, dayId: string) => {
    // Get all exercise IDs from this series
    const seriesToDelete = data.series.find((s) => s.id === seriesId)
    const exerciseIdsToDelete = seriesToDelete?.exerciseIds || []

    setData({
      ...data,
      series: data.series.filter((series) => series.id !== seriesId),
      exercises: data.exercises.filter((exercise) => !exerciseIdsToDelete.includes(exercise.id)),
      days: data.days.map((day) =>
        day.id === dayId ? { ...day, seriesIds: day.seriesIds.filter((id) => id !== seriesId) } : day,
      ),
    })
  }

  const handleUpdateDay = (dayId: string, updatedDay: Partial<Day>) => {
    setData({
      ...data,
      days: data.days.map((day) => (day.id === dayId ? { ...day, ...updatedDay } : day)),
    })
  }

  const handleDeleteDay = (dayId: string) => {
    // Get all series IDs from this day
    const dayToDelete = data.days.find((d) => d.id === dayId)
    const seriesIdsToDelete = dayToDelete?.seriesIds || []

    // Get all exercise IDs from these series
    const exerciseIdsToDelete = seriesIdsToDelete.flatMap((seriesId) => {
      const series = data.series.find((s) => s.id === seriesId)
      return series?.exerciseIds || []
    })

    setData({
      ...data,
      days: data.days.filter((day) => day.id !== dayId),
      series: data.series.filter((series) => !seriesIdsToDelete.includes(series.id)),
      exercises: data.exercises.filter((exercise) => !exerciseIdsToDelete.includes(exercise.id)),
    })

    handleBackToDays()
  }

  const handleSeriesCompletion = (completedSeriesId: string) => {
    const currentDay = data.days.find((day) => day.seriesIds.includes(completedSeriesId))
    if (currentDay) {
      const currentSeriesIndex = currentDay.seriesIds.indexOf(completedSeriesId)
      if (currentSeriesIndex < currentDay.seriesIds.length - 1) {
        // Move to the next series in the current day
        const nextSeriesId = currentDay.seriesIds[currentSeriesIndex + 1]
        setActiveSeriesId(nextSeriesId)
      } else {
        // All series in the day are completed, you can handle this case if needed
        // For example, show a day completion message or move to the next day
        handleBackToDay()
      }
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        {activeView === "days" ? (
          <Button onClick={handleAddDay} className="btn-primary w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Agregar Día
          </Button>
        ) : activeView === "day" ? (
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button onClick={handleBackToDays} variant="secondary" className="btn-secondary w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Días
            </Button>
            <Button onClick={() => handleAddSeries(activeDayId!)} className="btn-primary w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Agregar Serie
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button onClick={handleBackToDay} variant="secondary" className="btn-secondary w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Día
            </Button>
            <Button onClick={() => handleAddExercise(activeSeriesId!)} className="btn-primary w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Agregar Ejercicio
            </Button>
          </div>
        )}
      </div>

      {activeView === "days" && (
        <DaysList
          days={data.days}
          onDayClick={handleDayClick}
          onUpdateDay={handleUpdateDay}
          onDeleteDay={handleDeleteDay}
        />
      )}

      {activeView === "day" && activeDayId && (
        <DayDetail
          day={data.days.find((day) => day.id === activeDayId)!}
          series={data.series.filter((series) => data.days.find((day) => day.id === activeDayId)?.seriesIds.includes(series.id))}
          onSeriesClick={handleSeriesClick}
          onUpdateSeries={handleUpdateSeries}
          onDeleteSeries={(seriesId) => handleDeleteSeries(seriesId, activeDayId)}
        />
      )}

      {activeView === "series" && activeSeriesId && (
        <SeriesDetail
          series={data.series.find((series) => series.id === activeSeriesId)!}
          exercises={data.exercises.filter((exercise) =>
            data.series.find((series) => series.id === activeSeriesId)?.exerciseIds.includes(exercise.id)
          )}
          allExercises={adminExercises}
          onUpdateExercise={handleUpdateExercise}
          onDeleteExercise={(exerciseId) => handleDeleteExercise(exerciseId, activeSeriesId)}
          onUpdateSeries={(seriesId, updatedSeries) => handleUpdateSeries(seriesId, updatedSeries)}
          onSeriesCompleted={handleSeriesCompletion}
        />
      )}
    </div>
  )
}

