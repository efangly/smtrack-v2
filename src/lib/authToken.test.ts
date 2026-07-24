import { clearStoredToken, getStoredToken, setStoredToken } from './authToken'

describe('authToken', () => {
  afterEach(() => {
    clearStoredToken()
  })

  it('returns null when no token is stored', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('stores and retrieves a token', () => {
    setStoredToken('abc.def.ghi')
    expect(getStoredToken()).toBe('abc.def.ghi')
  })

  it('clears a stored token', () => {
    setStoredToken('abc.def.ghi')
    clearStoredToken()
    expect(getStoredToken()).toBeNull()
  })
})
