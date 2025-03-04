import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

// Mock the Firebase auth functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({})),
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

// Test component that uses the auth context
function TestComponent() {
  const { user, signup, login, logout } = useAuth()

  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button onClick={() => signup('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser = {
    email: 'test@example.com',
    uid: '123',
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Mock onAuthStateChanged to immediately call callback with null
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null)
      return () => {}
    })
  })

  it('should render children', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should handle signup', async () => {
    ;(createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: mockUser })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signupButton = screen.getByText('Sign Up')
    fireEvent.click(signupButton)

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      )
    })
  })

  it('should handle login', async () => {
    ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: mockUser })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      )
    })
  })

  it('should handle logout', async () => {
    ;(signOut as jest.Mock).mockResolvedValueOnce(undefined)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(expect.anything())
    })
  })
}) 