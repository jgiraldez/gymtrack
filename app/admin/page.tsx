"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExerciseManagement from '@/components/admin/exercise-management'
import UserManagement from '@/components/admin/user-management'

const MASTER_PASSWORD = process.env.NEXT_PUBLIC_MASTER_PASSWORD

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === MASTER_PASSWORD) {
      setIsAuthorized(true)
    } else {
      alert('Invalid password')
    }
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-white max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-black">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Master Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black bg-white"
                  required
                />
              </div>
              <Button type="submit">Access Admin Panel</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="exercises">
          <ExerciseManagement />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 