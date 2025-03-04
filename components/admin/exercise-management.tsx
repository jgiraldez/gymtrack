"use client"

import { useState, useEffect } from 'react'
import { exerciseService } from '@/lib/services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Edit2, Trash2 } from "lucide-react"
import type { Exercise } from '@/lib/types'

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Exercise,
    direction: 'asc' | 'desc'
  }>({ key: 'name', direction: 'asc' })
  const [formData, setFormData] = useState({
    name: '',
    videoUrl: '',
    bilateral: false
  })
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

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
      if (editingExercise) {
        await exerciseService.update(editingExercise.id, {
          ...formData,
          updatedAt: new Date()
        })
        setEditingExercise(null)
      } else {
        await exerciseService.create({
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      setFormData({
        name: '',
        videoUrl: '',
        bilateral: false
      })
      loadExercises()
    } catch (error) {
      console.error('Error saving exercise:', error)
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData({
      name: exercise.name,
      videoUrl: exercise.videoUrl,
      bilateral: exercise.bilateral
    })
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

  const handleSort = (key: keyof Exercise) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const sortedExercises = [...exercises].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
  })

  if (loading) {
    return <div className="text-black">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-black">
            {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
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
              <Label htmlFor="videoUrl" className="text-black">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                required
                className="w-full text-black bg-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="bilateral"
                checked={formData.bilateral}
                onCheckedChange={(checked) => setFormData({ ...formData, bilateral: checked })}
              />
              <Label htmlFor="bilateral" className="text-black">Bilateral Exercise</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingExercise ? 'Update Exercise' : 'Add Exercise'}
              </Button>
              {editingExercise && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setEditingExercise(null)
                    setFormData({ name: '', videoUrl: '', bilateral: false })
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
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
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('videoUrl')}>
                  <div className="flex items-center gap-2">
                    Video URL
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('bilateral')}>
                  <div className="flex items-center gap-2">
                    Bilateral
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium text-black">{exercise.name}</TableCell>
                  <TableCell className="text-black">{exercise.videoUrl}</TableCell>
                  <TableCell className="text-black">{exercise.bilateral ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(exercise)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(exercise.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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