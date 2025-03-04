"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { firestoreService } from '@/lib/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

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

export default function History() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (user) {
        try {
          const userWorkouts = await firestoreService.getUserWorkouts(user.uid)
          setWorkouts(userWorkouts)
        } catch (error) {
          console.error('Error fetching workouts:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchWorkouts()
  }, [user])

  // Group workouts by date
  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const date = format(new Date(workout.date), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(workout)
    return acc
  }, {} as Record<string, Workout[]>)

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>
      {Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {format(new Date(date), 'MMMM d, yyyy')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dateWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(new Date(workout.date), 'h:mm a')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="border-b pb-2 last:border-0">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex}>
                              Set {setIndex + 1}: {set.reps} reps @ {set.weight}kg
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      {Object.keys(groupedWorkouts).length === 0 && (
        <div className="text-center text-muted-foreground">
          No workouts found. Start tracking your workouts to see your history here.
        </div>
      )}
    </div>
  )
}

