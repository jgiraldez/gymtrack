import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GymTracker from '@/components/gym-tracker'
import { exerciseService } from '@/lib/services'
import { initialData } from '@/lib/initial-data'
import type { Exercise } from '@/lib/types'

// Mock the exercise service
jest.mock('@/lib/services', () => ({
  exerciseService: {
    getAll: jest.fn() as jest.MockedFunction<typeof exerciseService.getAll>
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('GymTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialData))
    ;(exerciseService.getAll as jest.MockedFunction<typeof exerciseService.getAll>).mockResolvedValue([])
  })

  it('renders initial days list view', () => {
    render(<GymTracker />)
    expect(screen.getByText('Agregar Día')).toBeInTheDocument()
  })

  it('adds a new day', () => {
    render(<GymTracker />)
    fireEvent.click(screen.getByText('Agregar Día'))
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'gym-tracker-data',
      expect.stringContaining('Día 2')
    )
  })

  it('navigates to day detail view', () => {
    const mockData = {
      ...initialData,
      days: [{
        id: '1',
        name: 'Test Day',
        date: new Date().toISOString(),
        seriesIds: []
      }]
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))

    render(<GymTracker />)
    fireEvent.click(screen.getByText('Test Day'))
    expect(screen.getByText('Agregar Serie')).toBeInTheDocument()
  })

  it('adds a new series to a day', () => {
    const mockData = {
      ...initialData,
      days: [{
        id: '1',
        name: 'Test Day',
        date: new Date().toISOString(),
        seriesIds: []
      }]
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))

    render(<GymTracker />)
    fireEvent.click(screen.getByText('Test Day'))
    fireEvent.click(screen.getByText('Agregar Serie'))

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'gym-tracker-data',
      expect.stringContaining('Series 0')
    )
  })

  it('navigates to series detail view', () => {
    const mockData = {
      ...initialData,
      days: [{
        id: '1',
        name: 'Test Day',
        date: new Date().toISOString(),
        seriesIds: ['1']
      }],
      series: [{
        id: '1',
        name: 'Test Series',
        rounds: 3,
        exerciseIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))

    render(<GymTracker />)
    fireEvent.click(screen.getByText('Test Day'))
    fireEvent.click(screen.getByText('Test Series'))
    expect(screen.getByText('Agregar Ejercicio Existente')).toBeInTheDocument()
  })

  it('loads admin exercises on mount', async () => {
    const mockAdminExercises: Exercise[] = [{
      id: '1',
      name: 'Admin Exercise',
      videoUrl: 'https://youtube.com/test',
      bilateral: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]
    ;(exerciseService.getAll as jest.MockedFunction<typeof exerciseService.getAll>).mockResolvedValueOnce(mockAdminExercises)

    render(<GymTracker />)

    await waitFor(() => {
      expect(exerciseService.getAll).toHaveBeenCalled()
    })
  })

  it('handles navigation between views', () => {
    const mockData = {
      ...initialData,
      days: [{
        id: '1',
        name: 'Test Day',
        date: new Date().toISOString(),
        seriesIds: ['1']
      }],
      series: [{
        id: '1',
        name: 'Test Series',
        rounds: 3,
        exerciseIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))

    render(<GymTracker />)

    // Navigate to day view
    fireEvent.click(screen.getByText('Test Day'))
    expect(screen.getByText('Volver a Días')).toBeInTheDocument()

    // Navigate back to days
    fireEvent.click(screen.getByText('Volver a Días'))
    expect(screen.getByText('Agregar Día')).toBeInTheDocument()

    // Navigate to day and then series
    fireEvent.click(screen.getByText('Test Day'))
    fireEvent.click(screen.getByText('Test Series'))
    expect(screen.getByText('Volver al Día')).toBeInTheDocument()

    // Navigate back to day
    fireEvent.click(screen.getByText('Volver al Día'))
    expect(screen.getByText('Volver a Días')).toBeInTheDocument()
  })

  it('deletes a day and its associated series and exercises', () => {
    const mockData = {
      ...initialData,
      days: [{
        id: '1',
        name: 'Test Day',
        date: new Date().toISOString(),
        seriesIds: ['1']
      }],
      series: [{
        id: '1',
        name: 'Test Series',
        rounds: 3,
        exerciseIds: ['1'],
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      exercises: [{
        id: '1',
        name: 'Test Exercise',
        videoUrl: '',
        bilateral: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData))
    window.confirm = jest.fn(() => true)

    render(<GymTracker />)
    const deleteButton = screen.getByRole('button', { name: 'Eliminar día' })
    fireEvent.click(deleteButton)

    const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
    expect(savedData.days).toHaveLength(0)
    expect(savedData.series).toHaveLength(0)
    expect(savedData.exercises).toHaveLength(0)
  })
}) 