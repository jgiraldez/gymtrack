jest.mock('@/lib/services', () => ({
  exerciseService: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn().mockResolvedValue([])
  }
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExerciseManagement from '@/components/admin/exercise-management'
import type { Exercise } from '@/lib/types'
import { exerciseService } from '@/lib/services'

// Mock functions
const mockCreate = exerciseService.create as jest.MockedFunction<typeof exerciseService.create>
const mockUpdate = exerciseService.update as jest.MockedFunction<typeof exerciseService.update>
const mockDelete = exerciseService.delete as jest.MockedFunction<typeof exerciseService.delete>
const mockGetAll = exerciseService.getAll as jest.MockedFunction<typeof exerciseService.getAll>

describe('ExerciseManagement', () => {
  beforeEach(() => {
    mockCreate.mockClear()
    mockUpdate.mockClear()
    mockDelete.mockClear()
    mockGetAll.mockClear()
  })

  it('should render the add exercise form', async () => {
    render(<ExerciseManagement />)
    await waitFor(() => {
      expect(screen.getByText('Add New Exercise')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Video URL')).toBeInTheDocument()
      expect(screen.getByLabelText('Bilateral Exercise')).toBeInTheDocument()
    })
  })

  it('should create a new exercise', async () => {
    const mockExercise = {
      name: 'Test Exercise',
      videoUrl: 'https://youtube.com/test',
      bilateral: true
    }

    mockCreate.mockResolvedValueOnce({ 
      id: '123', 
      ...mockExercise,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    render(<ExerciseManagement />)

    await waitFor(() => {
      // Wait for loading to finish
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: mockExercise.name } })
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: mockExercise.videoUrl } })
    fireEvent.click(screen.getByLabelText('Bilateral Exercise'))

    // Submit the form
    fireEvent.click(screen.getByText('Add Exercise'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        ...mockExercise,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  it('should update an existing exercise', async () => {
    const existingExercise: Exercise = {
      id: '123',
      name: 'Test Exercise',
      videoUrl: 'https://youtube.com/test',
      bilateral: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Mock getAll to return our test exercise
    mockGetAll.mockResolvedValueOnce([existingExercise])
    mockUpdate.mockResolvedValueOnce({
      ...existingExercise,
      name: 'Updated Exercise',
      updatedAt: new Date()
    })

    render(<ExerciseManagement />)

    await waitFor(() => {
      // Wait for loading to finish
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    // Change the name
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Exercise' } })
    fireEvent.click(screen.getByText('Update Exercise'))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('123', {
        name: 'Updated Exercise',
        videoUrl: 'https://youtube.com/test',
        bilateral: true,
        updatedAt: expect.any(Date)
      })
    })
  })

  it('should delete an exercise', async () => {
    const existingExercise: Exercise = {
      id: '123',
      name: 'Test Exercise',
      videoUrl: 'https://youtube.com/test',
      bilateral: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Mock getAll to return our test exercise
    mockGetAll.mockResolvedValueOnce([existingExercise])
    mockDelete.mockResolvedValueOnce(undefined)

    render(<ExerciseManagement />)

    await waitFor(() => {
      // Wait for loading to finish
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Mock window.confirm
    window.confirm = jest.fn(() => true)

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('123')
    })
  })
}) 