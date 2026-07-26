const TOKEN_STORAGE_KEY = 'smtrack.authToken'
const REFRESH_STORAGE_KEY = 'smtrack.refreshToken'
export const TOKEN_COOKIE_NAME = 'smtrack.authToken'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  document.cookie = `${TOKEN_COOKIE_NAME}=${token}; path=/; SameSite=Lax`
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_STORAGE_KEY)
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_STORAGE_KEY, token)
}

export function clearStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_STORAGE_KEY)
}
