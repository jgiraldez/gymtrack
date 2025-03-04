"use client"

import { useState } from 'react'
import { exerciseService } from '@/lib/services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { Exercise } from '@/lib/types'

export default function ExerciseManagement() {
  const [formData, setFormData] = useState({
    name: '',
    videoUrl: '',
    bilateral: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await exerciseService.create({
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setFormData({
        name: '',
        videoUrl: '',
        bilateral: false
      })
    } catch (error) {
      console.error('Error creating exercise:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-black">Add New Exercise</CardTitle>
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
            <Button type="submit" className="w-full">Add Exercise</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 