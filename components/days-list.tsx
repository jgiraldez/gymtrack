"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Calendar, LayoutGrid, List } from "lucide-react"
import type { Day } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface DaysListProps {
  days: Day[]
  onDayClick: (dayId: string) => void
  onUpdateDay: (dayId: string, updatedDay: Partial<Day>) => void
  onDeleteDay: (dayId: string) => void
}

export default function DaysList({ days, onDayClick, onUpdateDay, onDeleteDay }: DaysListProps) {
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const handleEditClick = (day: Day, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingDayId(day.id)
    setEditName(day.name)
  }

  const handleSaveEdit = (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateDay(dayId, { name: editName })
    setEditingDayId(null)
  }

  const handleDeleteClick = (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this day and all its series and exercises?")) {
      onDeleteDay(dayId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex space-x-2">
          <Button size="sm" variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cuadrícula
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Día</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map((day) => (
              <TableRow key={day.id} className="cursor-pointer" onClick={() => onDayClick(day.id)}>
                <TableCell>
                  {editingDayId === day.id ? (
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input"
                        autoFocus
                      />
                      <Button size="sm" onClick={(e) => handleSaveEdit(day.id, e)} className="btn-primary">
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {day.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>{formatDate(day.date)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleEditClick(day, e)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteClick(day.id, e)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => (
            <Card key={day.id} className="card cursor-pointer" onClick={() => onDayClick(day.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  {editingDayId === day.id ? (
                    <div className="flex space-x-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input"
                        autoFocus
                      />
                      <Button size="sm" onClick={(e) => handleSaveEdit(day.id, e)} className="btn-primary">
                        Save
                      </Button>
                    </div>
                  ) : (
                    <CardTitle className="card-title flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      {day.name}
                    </CardTitle>
                  )}
                  {editingDayId !== day.id && (
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleEditClick(day, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(day.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(day.date)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {days.length === 0 && (
        <div className="text-center py-10 text-muted">
          <p>No hay días añadidos aún. Haz clic en "Agregar Día" para comenzar.</p>
        </div>
      )}
    </div>
  )
}

