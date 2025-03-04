import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SeriesDetail from '@/components/series-detail'
import type { Series, Exercise } from '@/lib/types'

let currentValue = ''
let selectedItemText = ''
const mockOnValueChange = jest.fn((value) => {
  currentValue = value
  console.log('Value changed:', value)
})

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => {
    currentValue = value
    console.log('Select value:', value)
    mockOnValueChange.mockImplementation(onValueChange)
    return (
      <div data-testid="select">
        {children}
      </div>
    )
  },
  SelectTrigger: ({ children }: any) => (
    <button data-testid="select-trigger">
      {children}
    </button>
  ),
  SelectValue: ({ children, placeholder }: any) => {
    console.log('SelectValue currentValue:', currentValue)
    console.log('SelectValue children:', children)
    return (
      <span data-testid="select-value">
        {currentValue ? selectedItemText : placeholder}
      </span>
    )
  },
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">
      {children}
    </div>
  ),
  SelectItem: ({ children, value }: any) => {
    if (value === currentValue) {
      selectedItemText = children
    }
    return (
      <button
        data-testid="select-item"
        onClick={() => {
          console.log('SelectItem clicked:', value)
          currentValue = value
          selectedItemText = children
          mockOnValueChange(value)
        }}
      >
        {children}
      </button>
    )
  },
  SelectItemText: ({ children }: any) => <span>{children}</span>,
  SelectItemIndicator: () => null,
  SelectPortal: ({ children }: any) => <div>{children}</div>,
  SelectScrollUpButton: () => null,
  SelectScrollDownButton: () => null,
  SelectViewport: ({ children }: any) => <div>{children}</div>,
  SelectGroup: ({ children }: any) => <div>{children}</div>,
  SelectLabel: ({ children }: any) => <div>{children}</div>,
  SelectSeparator: () => null,
}))

// Add displayName to the mocked components
const mockSelect = jest.requireMock('@/components/ui/select')
mockSelect.Select.displayName = 'Select'
mockSelect.SelectTrigger.displayName = 'SelectTrigger'
mockSelect.SelectValue.displayName = 'SelectValue'
mockSelect.SelectContent.displayName = 'SelectContent'
mockSelect.SelectItem.displayName = 'SelectItem'
mockSelect.SelectItemText.displayName = 'SelectItemText'
mockSelect.SelectItemIndicator.displayName = 'SelectItemIndicator'
mockSelect.SelectPortal.displayName = 'SelectPortal'
mockSelect.SelectScrollUpButton.displayName = 'SelectScrollUpButton'
mockSelect.SelectScrollDownButton.displayName = 'SelectScrollDownButton'
mockSelect.SelectViewport.displayName = 'SelectViewport'
mockSelect.SelectGroup.displayName = 'SelectGroup'
mockSelect.SelectLabel.displayName = 'SelectLabel'
mockSelect.SelectSeparator.displayName = 'SelectSeparator'

describe('SeriesDetail', () => {
  const mockSeries: Series = {
    id: '1',
    name: 'Test Series',
    rounds: 3,
    exerciseIds: ['1', '2'],
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: 0
  }

  const mockExercises: Exercise[] = [
    {
      id: '1',
      name: 'Exercise 1',
      videoUrl: 'https://youtube.com/test1',
      bilateral: true,
      isBilateral: true,
      reps: 10,
      completed: false,
      completedReps: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Exercise 2',
      videoUrl: 'https://youtube.com/test2',
      bilateral: false,
      isBilateral: false,
      duration: 30,
      completed: false,
      completedReps: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const mockAdminExercises: Exercise[] = [
    {
      id: '3',
      name: 'Admin Exercise',
      videoUrl: 'https://youtube.com/admin',
      bilateral: true,
      isBilateral: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const mockUpdateExercise = jest.fn()
  const mockDeleteExercise = jest.fn()
  const mockUpdateSeries = jest.fn()
  const mockSeriesCompleted = jest.fn()

  const mockProps = {
    series: mockSeries,
    exercises: mockExercises,
    allExercises: mockAdminExercises,
    onUpdateExercise: mockUpdateExercise,
    onDeleteExercise: mockDeleteExercise,
    onUpdateSeries: mockUpdateSeries,
    onSeriesCompleted: mockSeriesCompleted
  }

  beforeEach(() => {
    mockUpdateExercise.mockClear()
    mockDeleteExercise.mockClear()
    mockUpdateSeries.mockClear()
    mockSeriesCompleted.mockClear()
  })

  it('renders series name and rounds', () => {
    render(<SeriesDetail {...mockProps} />)
    expect(screen.getByText(`${mockSeries.name} (${mockSeries.rounds} series)`)).toBeInTheDocument()
  })

  it('displays exercise cards in grid view', () => {
    render(<SeriesDetail {...mockProps} />)
    expect(screen.getByText('Exercise 1')).toBeInTheDocument()
    expect(screen.getByText('Exercise 2')).toBeInTheDocument()
  })

  it('allows toggling between grid and table view', () => {
    render(<SeriesDetail {...mockProps} />)
    const gridViewButton = screen.getByRole('button', { name: 'Ver en cuadrícula' })
    const listViewButton = screen.getByRole('button', { name: 'Ver en lista' })
    
    expect(gridViewButton).toHaveAttribute('aria-pressed', 'true')
    expect(listViewButton).toHaveAttribute('aria-pressed', 'false')
    
    fireEvent.click(listViewButton)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(gridViewButton).toHaveAttribute('aria-pressed', 'false')
    expect(listViewButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('handles exercise completion', async () => {
    render(<SeriesDetail {...mockProps} />)
    const completeButtons = screen.getAllByRole('button', { name: /completar/i })
    fireEvent.click(completeButtons[0])

    expect(mockUpdateExercise).toHaveBeenCalledWith('1', {
      completedReps: 1,
      completed: false
    })
  })

  it('shows completion overlay when all exercises are completed', async () => {
    const completedExercises = mockExercises.map(ex => ({
      ...ex,
      completed: true,
      completedReps: 3
    }))

    render(
      <SeriesDetail
        {...mockProps}
        exercises={completedExercises}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('¡Felicidades!')).toBeInTheDocument()
    })
  })

  it('allows adding existing exercise from admin list', async () => {
    const user = userEvent.setup()
    const mockUpdateExercise = jest.fn()
    const mockUpdateSeries = jest.fn()
    const mockSeries: Series = {
      id: '1',
      name: 'Test Series',
      rounds: 3,
      exerciseIds: [],
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const mockExercises: Exercise[] = []
    const mockAllExercises: Exercise[] = [
      {
        id: 'admin-1',
        name: 'Admin Exercise',
        videoUrl: 'https://youtube.com/watch?v=123',
        bilateral: false,
        isBilateral: false,
        reps: 10,
        duration: 0,
        load: 20,
        completed: false,
        completedReps: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    await act(async () => {
      render(
        <SeriesDetail
          series={mockSeries}
          exercises={mockExercises}
          allExercises={mockAllExercises}
          onUpdateExercise={mockUpdateExercise}
          onDeleteExercise={jest.fn()}
          onUpdateSeries={mockUpdateSeries}
          onSeriesCompleted={jest.fn()}
        />
      )
    })

    // Click the add button
    const addButton = screen.getByTestId('add-existing-exercise-button')
    await act(async () => {
      await user.click(addButton)
    })

    // Wait for the dialog to be visible
    await waitFor(() => {
      expect(screen.getByTestId('add-existing-exercise-dialog')).toBeInTheDocument()
    })

    // Click the select trigger to open the dropdown
    const selectTrigger = screen.getByTestId('select-trigger')
    await act(async () => {
      await user.click(selectTrigger)
    })

    // Click the first select item
    const selectItem = screen.getByTestId('select-item')
    await act(async () => {
      await user.click(selectItem)
    })

    // Wait for the select value to update
    await waitFor(() => {
      const selectValue = screen.getByTestId('select-value')
      expect(selectValue).toHaveTextContent('Admin Exercise')
    })

    // Click the submit button
    const submitButton = screen.getByText('Agregar Ejercicio')
    await act(async () => {
      await user.click(submitButton)
    })

    // Verify that the mock functions were called with the correct arguments
    expect(mockUpdateExercise).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        name: 'Admin Exercise',
        videoUrl: 'https://youtube.com/watch?v=123',
        bilateral: false,
        isBilateral: false,
        reps: 0,
        duration: 0,
        load: 0,
        completed: false,
        completedReps: 0
      })
    )

    expect(mockUpdateSeries).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        exerciseIds: expect.arrayContaining([expect.any(String)])
      })
    )
  })

  it('allows editing exercise details', () => {
    render(<SeriesDetail {...mockProps} />)
    
    const editButtons = screen.getAllByRole('button', { name: 'Editar ejercicio' })
    fireEvent.click(editButtons[0])

    const nameInput = screen.getByDisplayValue('Exercise 1')
    fireEvent.change(nameInput, { target: { value: 'Updated Exercise' } })
    
    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(saveButton)

    expect(mockUpdateExercise).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Exercise'
    }))
  })

  it('confirms before deleting exercise', () => {
    window.confirm = jest.fn(() => true)
    render(<SeriesDetail {...mockProps} />)
    
    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar ejercicio' })
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteExercise).toHaveBeenCalledWith('1')
  })
}) 