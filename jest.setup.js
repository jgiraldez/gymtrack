import '@testing-library/jest-dom'

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver

// Mock window.crypto.randomUUID
window.crypto.randomUUID = () => 'test-uuid'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// Mock window.confirm
window.confirm = jest.fn(() => true)

// Suppress console errors during tests
console.error = jest.fn()

// Add custom matchers if needed
expect.extend({
  // Add your custom matchers here
}) 