import type { GymTrackerData } from "./types"

export const initialData: GymTrackerData = {
  days: [
    {
      id: "day-1",
      name: "Upper Body Day",
      date: new Date().toISOString(),
      seriesIds: ["series-1", "series-2"],
    },
  ],
  series: [
    {
      id: "series-1",
      name: "Warm-up",
      rounds: 2,
      exerciseIds: ["exercise-1", "exercise-2"],
    },
    {
      id: "series-2",
      name: "Main Workout",
      rounds: 3,
      exerciseIds: ["exercise-3"],
    },
  ],
  exercises: [
    {
      id: "exercise-1",
      name: "Push-ups",
      reps: 10,
      duration: 0,
      load: 0,
      isBilateral: true,
      videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
      completed: false,
    },
    {
      id: "exercise-2",
      name: "Arm Circles",
      reps: 0,
      duration: 30,
      load: 0,
      isBilateral: true,
      videoUrl: "https://www.youtube.com/shorts/Xyd_fa5zoEU",
      completed: false,
    },
    {
      id: "exercise-3",
      name: "Dumbbell Bench Press",
      reps: 12,
      duration: 0,
      load: 20,
      isBilateral: true,
      videoUrl: "https://www.youtube.com/watch?v=VmB1G1K7v94",
      completed: false,
    },
  ],
}

