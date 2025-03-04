"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'
import ExerciseManagement from '@/components/admin/exercise-management'
import UserStatsManagement from '@/components/admin/user-stats-management'
import UserManagement from '@/components/admin/user-management'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("exercises")
  const [isMasterPasswordVerified, setIsMasterPasswordVerified] = useState(false)
  const [masterPassword, setMasterPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch('/api/auth/verify-master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: masterPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to verify master password')
      }

      const data = await response.json()

      if (data.isValid) {
        setIsMasterPasswordVerified(true)
      } else {
        setError("Invalid master password")
      }
    } catch (error) {
      console.error('Error verifying master password:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while verifying the master password')
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!isMasterPasswordVerified) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMasterPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <Input
                  id="masterPassword"
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <Button type="submit" className="w-full">
                Verify Master Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="stats">User Stats</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <ExerciseManagement />
        </TabsContent>

        <TabsContent value="stats">
          <UserStatsManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 