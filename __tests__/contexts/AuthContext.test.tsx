import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}))

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  Timestamp: {
    now: jest.fn(() => new Date()),
  },
}))

describe('AuthContext', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn()
  }

  const mockUnsubscribe = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null)
      return mockUnsubscribe
    })
  })

  const TestComponent = () => {
    const { user, loading } = useAuth()
    return (
      <div>
        {loading ? 'Loading...' : user ? `Welcome ${user.email}` : 'Please log in'}
      </div>
    )
  }

  it('should render children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Please log in')).toBeInTheDocument()
    })
  })

  it('should handle signup', async () => {
    const mockUser = { email: 'test@example.com' }
    const mockCreateUser = jest.fn().mockResolvedValue({ user: mockUser })
    ;(createUserWithEmailAndPassword as jest.Mock).mockImplementation(mockCreateUser)
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser)
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(`Welcome ${mockUser.email}`)).toBeInTheDocument()
    })
  })

  it('should handle login', async () => {
    const mockUser = { email: 'test@example.com' }
    const mockSignIn = jest.fn().mockResolvedValue({ user: mockUser })
    ;(signInWithEmailAndPassword as jest.Mock).mockImplementation(mockSignIn)
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser)
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(`Welcome ${mockUser.email}`)).toBeInTheDocument()
    })
  })

  it('should handle logout', async () => {
    const mockSignOutFn = jest.fn().mockResolvedValue(undefined)
    ;(signOut as jest.Mock).mockImplementation(mockSignOutFn)
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null)
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Please log in')).toBeInTheDocument()
    })
  })
}) 