"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Exercise } from "@/lib/types"

interface ImportCSVProps {
  onImport: (exercises: Exercise[]) => void
  onCancel: () => void
}

export default function ImportCSV({ onImport, onCancel }: ImportCSVProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Exercise[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n")

        // Check header
        const header = lines[0].trim().split(",")
        const requiredColumns = ["name", "videoUrl"]
        const missingColumns = requiredColumns.filter((col) => !header.includes(col))

        if (missingColumns.length > 0) {
          setError(`CSV is missing required columns: ${missingColumns.join(", ")}`)
          return
        }

        // Parse data
        const exercises: Exercise[] = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = line.split(",")
          if (values.length !== header.length) {
            setError(`Line ${i + 1} has incorrect number of values`)
            return
          }

          const exercise: any = {
            id: crypto.randomUUID(),
            completed: false,
          }

          header.forEach((column, index) => {
            const value = values[index].trim()

            if (column === "name" || column === "videoUrl") {
              exercise[column] = value
            } else if (column === "reps" || column === "duration" || column === "load") {
              exercise[column] = Number.parseInt(value) || 0
            } else if (column === "isBilateral") {
              exercise[column] = value.toLowerCase() === "true"
            }
          })

          // Set defaults for missing fields
          if (exercise.reps === undefined) exercise.reps = 0
          if (exercise.duration === undefined) exercise.duration = 0
          if (exercise.load === undefined) exercise.load = 0
          if (exercise.isBilateral === undefined) exercise.isBilateral = true

          exercises.push(exercise as Exercise)
        }

        setPreview(exercises)
        setError(null)
      } catch (err) {
        setError("Failed to parse CSV file. Please check the format.")
        console.error(err)
      }
    }

    reader.onerror = () => {
      setError("Failed to read file")
    }

    reader.readAsText(file)
  }

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <FileText className="mr-2 h-5 w-5" />
          Import Exercises from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file" className="text-white">
            Upload CSV File
          </Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <p className="text-xs text-zinc-400">
            CSV should include columns: name, videoUrl, reps, duration, load, isBilateral
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {preview.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-white">Preview ({preview.length} exercises)</h3>
            <div className="max-h-60 overflow-y-auto bg-zinc-800 rounded p-2">
              <ul className="space-y-1">
                {preview.map((exercise, index) => (
                  <li key={index} className="text-sm text-white">
                    {exercise.name} - {exercise.videoUrl ? "✓ Has video" : "✗ No video"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} className="text-white">
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={preview.length === 0}
          className="bg-zinc-700 hover:bg-zinc-600 text-white"
        >
          Import {preview.length} Exercises
        </Button>
      </CardFooter>
    </Card>
  )
}

