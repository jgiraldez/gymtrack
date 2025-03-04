"use client"

import { useState, useEffect } from 'react'
import { exerciseService } from '@/lib/services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Exercise } from '@/lib/types'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscleGroup: '',
    equipment: '',
    difficulty: 'beginner' as Difficulty,
    instructions: '',
    videoUrl: '',
    imageUrl: ''
  })

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const data = await exerciseService.getAll()
      setExercises(data)
    } catch (error) {
      console.error('Error loading exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await exerciseService.create({
        ...formData,
        equipment: formData.equipment.split(',').map(item => item.trim()),
        instructions: formData.instructions.split('\n').filter(line => line.trim()),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setFormData({
        name: '',
        description: '',
        muscleGroup: '',
        equipment: '',
        difficulty: 'beginner',
        instructions: '',
        videoUrl: '',
        imageUrl: ''
      })
      loadExercises()
    } catch (error) {
      console.error('Error creating exercise:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      try {
        await exerciseService.delete(id)
        loadExercises()
      } catch (error) {
        console.error('Error deleting exercise:', error)
      }
    }
  }

  if (loading) {
    return <div className="text-black">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-black">Add New Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full text-black bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="muscleGroup" className="text-black">Muscle Group</Label>
                <Input
                  id="muscleGroup"
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  required
                  className="w-full text-black bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-black">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="w-full text-black bg-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment" className="text-black">Equipment (comma-separated)</Label>
                <Input
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  required
                  className="w-full text-black bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-black">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value as Difficulty })}
                >
                  <SelectTrigger className="w-full text-black bg-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-black">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full text-black bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-black">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full text-black bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-black">Instructions (one per line)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                required
                className="w-full text-black bg-white"
              />
            </div>
            <Button type="submit" className="w-full">Add Exercise</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-black">Exercise List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black">Name</TableHead>
                <TableHead className="text-black">Muscle Group</TableHead>
                <TableHead className="text-black">Difficulty</TableHead>
                <TableHead className="text-black">Equipment</TableHead>
                <TableHead className="w-[100px] text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium text-black">{exercise.name}</TableCell>
                  <TableCell className="text-black">{exercise.muscleGroup}</TableCell>
                  <TableCell className="capitalize text-black">{exercise.difficulty}</TableCell>
                  <TableCell className="text-black">{exercise.equipment.join(', ')}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(exercise.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 