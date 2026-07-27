import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import {
  clearStoredRefreshToken,
  clearStoredToken,
  getStoredRefreshToken,
  getStoredToken,
  setStoredRefreshToken,
  setStoredToken,
} from '@/lib/authToken'
import type { RefreshResult } from '@/types/auth'

export class ApiError extends Error {
  statusCode: number
  path?: string
  // request config ที่ทำให้ error นี้เกิด — จำเป็นสำหรับ interceptor ที่ต่อคิว
  // หลัง toApiError เพราะมันไม่ได้รับ AxiosError ตัวจริงอีกแล้ว (ดู refresh flow ล่างสุด)
  config?: InternalAxiosRequestConfig

  constructor(
    message: string,
    statusCode: number,
    path?: string,
    config?: InternalAxiosRequestConfig,
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.path = path
    this.config = config
  }
}

export function attachAuthHeader(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const token = getStoredToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
}

// client ตั้ง Content-Type: application/json ไว้เป็นค่าเริ่มต้น ซึ่งจะทับ multipart
// ของ FormData ทำให้ request ไม่มี boundary — backend อ่านไฟล์ไม่เจอแล้วตอบ 200 เฉยๆ
// โดยไม่บันทึกรูป ต้องถอด header ทิ้งเพื่อให้เบราว์เซอร์ใส่ boundary ให้เอง
export function stripJsonContentTypeForFormData(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
}

// Backend wraps every successful response as
// { success, message, data, timestamp, statusCode } — unwrap to the payload
// so callers can parse `data` directly as the resource shape.
export function unwrapEnvelope(response: AxiosResponse): AxiosResponse {
  if (
    response.data &&
    typeof response.data === 'object' &&
    'success' in response.data
  ) {
    response.data = response.data.data
  }
  return response
}

export function toApiError(error: unknown): unknown {
  if (axios.isAxiosError(error) && error.response) {
    const body = error.response.data as
      | { message?: string | string[]; statusCode?: number; path?: string }
      | undefined
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? error.message)
    return new ApiError(
      message,
      body?.statusCode ?? error.response.status,
      body?.path,
      error.config,
    )
  }
  return error
}

function createApiClient(baseURL: string | undefined): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(attachAuthHeader)
  client.interceptors.request.use(stripJsonContentTypeForFormData)
  client.interceptors.response.use(unwrapEnvelope)
  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error)),
  )

  return client
}

export const apiClient = createApiClient(process.env.NEXT_PUBLIC_API_BASE_URL)

export const authApiClient = createApiClient(
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
)

function redirectToLogin(): void {
  clearStoredToken()
  clearStoredRefreshToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

// interceptor ตัวนี้ถูกลงทะเบียนหลัง toApiError ใน createApiClient จึงได้รับ
// `ApiError` ไม่ใช่ `AxiosError` — ต้องอ่าน status/config จาก ApiError เป็นทางหลัก
// (เคสที่ยัง axios อยู่จะเกิดได้เฉพาะ error ที่ไม่มี response เช่น network error)
function extractErrorContext(error: unknown): {
  status: number | null
  config: InternalAxiosRequestConfig | undefined
} {
  if (error instanceof ApiError) {
    return { status: error.statusCode, config: error.config }
  }
  if (axios.isAxiosError(error)) {
    return { status: error.response?.status ?? null, config: error.config }
  }
  return { status: null, config: undefined }
}

authApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { status, config } = extractErrorContext(error)

    const isAuthEndpoint =
      config?.url === '/login' || config?.url === '/refresh'

    if (status !== 401 || !config || config._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    try {
      const raw = await axios.post<{ data: RefreshResult }>(
        `${process.env.NEXT_PUBLIC_AUTH_API_BASE_URL}/refresh`,
        { token: refreshToken },
      )
      const result = raw.data.data
      setStoredToken(result.token)
      setStoredRefreshToken(result.refreshToken)

      config._retry = true
      return authApiClient(config)
    } catch (refreshError) {
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)
