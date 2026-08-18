import { decodeJwtPayload } from '@/lib/decodeJwt'
import type { UserJwtPayload } from '@/types/auth'

const TOKEN_STORAGE_KEY = 'smtrack.authToken'
const REFRESH_STORAGE_KEY = 'smtrack.refreshToken'
export const TOKEN_COOKIE_NAME = 'smtrack.authToken'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

// cookie ต้องหมดอายุพร้อมกับ token ใน localStorage เสมอ ไม่งั้น proxy.ts (เช็ค
// cookie) กับ LoginGuard (เช็ค store ที่มาจาก localStorage) จะเห็นสถานะ login
// ไม่ตรงกัน แล้วเกิด redirect loop ระหว่าง `/` กับ `/login` ไม่จบ — เดิมไม่ใส่
// max-age คือ session cookie ที่หายไปเมื่อปิด browser แต่ localStorage อยู่ถาวร
//
// `Secure` ใส่ได้เฉพาะตอนหน้าเว็บเสิร์ฟผ่าน HTTPS จริงเท่านั้น — เบราว์เซอร์จะ
// เงียบๆ ไม่ยอมตั้ง cookie ที่มี Secure ให้เลยถ้าเพจเป็น HTTP (เช่น เข้าผ่าน
// http://<lan-ip> ตอน dev) ซึ่งทำให้เกิด redirect loop ข้างบนพอดี เพราะ
// localStorage มี token แต่ cookie ไม่มี
const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:'

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  const exp = decodeJwtPayload<UserJwtPayload>(token)?.exp
  const maxAge =
    exp !== undefined ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : undefined
  document.cookie = `${TOKEN_COOKIE_NAME}=${token}; path=/; SameSite=Lax${
    isSecureContext ? '; Secure' : ''
  }${maxAge !== undefined ? `; max-age=${maxAge}` : ''}`
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${
    isSecureContext ? '; Secure' : ''
  }`
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
