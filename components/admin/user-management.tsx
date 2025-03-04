"use client"

import { useState, useEffect } from 'react'
import { userService, type UserProfile } from '@/lib/services/userService'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Edit2, Trash2 } from "lucide-react"
import { format } from 'date-fns'

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserProfile,
    direction: 'asc' | 'desc'
  }>({ key: 'email', direction: 'asc' })
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    displayName: '',
    role: 'user' as 'user' | 'admin'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await userService.updateProfile(editingUser.uid, {
        ...formData,
        updatedAt: new Date()
      })
      setEditingUser(null)
      setFormData({
        displayName: '',
        role: 'user'
      })
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      displayName: user.displayName || '',
      role: user.role
    })
  }

  const handleDelete = async (uid: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(uid)
        loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleSort = (key: keyof UserProfile) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const sortedUsers = [...users].sort((a, b) => {
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
      {editingUser && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-black">Edit User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-black">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full text-black bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-black">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                  className="w-full p-2 border rounded-md text-black bg-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Update User
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setEditingUser(null)
                    setFormData({ displayName: '', role: 'user' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-black">User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-2">
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('displayName')}>
                  <div className="flex items-center gap-2">
                    Display Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('role')}>
                  <div className="flex items-center gap-2">
                    Role
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black cursor-pointer" onClick={() => handleSort('lastLogin')}>
                  <div className="flex items-center gap-2">
                    Last Login
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-black text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium text-black">{user.email}</TableCell>
                  <TableCell className="text-black">{user.displayName || '-'}</TableCell>
                  <TableCell className="text-black capitalize">{user.role}</TableCell>
                  <TableCell className="text-black">
                    {user.lastLogin ? format(user.lastLogin, 'MMM d, yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.uid)}
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