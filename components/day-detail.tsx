"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, LayoutGrid, List, Calendar } from "lucide-react"
import type { Day, Series } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layers, Dumbbell, MonitorIcon as Running, Heart, Zap, Target, Flame, Activity } from "lucide-react"

const iconOptions = [
  { value: "layers", label: "Capas", icon: Layers },
  { value: "dumbbell", label: "Mancuerna", icon: Dumbbell },
  { value: "running", label: "Correr", icon: Running },
  { value: "heart", label: "Corazón", icon: Heart },
  { value: "zap", label: "Rayo", icon: Zap },
  { value: "target", label: "Objetivo", icon: Target },
  { value: "flame", label: "Llama", icon: Flame },
  { value: "activity", label: "Actividad", icon: Activity },
]

const iconComponents = {
  layers: Layers,
  dumbbell: Dumbbell,
  running: Running,
  heart: Heart,
  zap: Zap,
  target: Target,
  flame: Flame,
  activity: Activity,
}

interface DayDetailProps {
  day: Day
  series: Series[]
  onSeriesClick: (seriesId: string) => void
  onUpdateSeries: (seriesId: string, updatedSeries: Partial<Series>) => void
  onDeleteSeries: (seriesId: string) => void
}

export default function DayDetail({ day, series, onSeriesClick, onUpdateSeries, onDeleteSeries }: DayDetailProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editSeries, setEditSeries] = useState(0)
  const [editIcon, setEditIcon] = useState<string>("layers")

  const handleEditClick = (series: Series, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSeriesId(series.id)
    setEditName(series.name)
    setEditSeries(series.rounds)
    setEditIcon(series.icon || "layers")
  }

  const handleSaveEdit = (seriesId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateSeries(seriesId, {
      name: editName,
      rounds: editSeries,
      icon: editIcon,
    })
    setEditingSeriesId(null)
  }

  const handleDeleteClick = (seriesId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("¿Estás seguro de que quieres eliminar esta serie y todos sus ejercicios?")) {
      onDeleteSeries(seriesId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          {day.name}
        </h2>
        <div className="flex space-x-2">
          <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
            Cuadrícula
          </Button>
          <Button size="sm" variant={viewMode === "table" ? "default" : "outline"} onClick={() => setViewMode("table")}>
            <List className="h-4 w-4" />
            Lista
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <Card key={s.id} className="card cursor-pointer bg-card" onClick={() => onSeriesClick(s.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  {editingSeriesId === s.id ? (
                    <div className="flex flex-col space-y-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input"
                        placeholder="Nombre de la serie"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          value={editSeries}
                          onChange={(e) => setEditSeries(Number.parseInt(e.target.value) || 1)}
                          className="input w-24"
                          placeholder="Series"
                        />
                        <Select value={editIcon} onValueChange={(value) => setEditIcon(value)}>
                          <SelectTrigger className="w-[120px] bg-transparent border-black text-black">
                            <SelectValue placeholder="Icono" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-black">
                            {iconOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-black">
                                <div className="flex items-center">
                                  {React.createElement(option.icon, { className: "mr-2 h-4 w-4" })}
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={(e) => handleSaveEdit(s.id, e)} className="btn-primary">
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="card-title flex items-center">
                        {React.createElement(iconOptions.find((opt) => opt.value === s.icon)?.icon || Layers, {
                          className: "mr-2 h-5 w-5",
                        })}
                        {s.name}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleEditClick(s, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDeleteClick(s.id, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">{s.rounds} series</p>
                <p className="text-sm text-muted">{s.exerciseIds.length} ejercicios</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Serie</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Ejercicios</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => onSeriesClick(s.id)}>
                <TableCell>
                  <div className="flex items-center">
                    {React.createElement(iconComponents[s.icon as keyof typeof iconComponents] || Layers, {
                      className: "mr-2 h-4 w-4",
                    })}
                    {s.name}
                  </div>
                </TableCell>
                <TableCell>{s.rounds}</TableCell>
                <TableCell>{s.exerciseIds.length}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(s, e)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(s.id, e)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {series.length === 0 && (
        <div className="text-center py-10 text-muted">
          <p>No hay series añadidas aún. Haz clic en "Agregar Serie" para comenzar.</p>
        </div>
      )}
    </div>
  )
}

