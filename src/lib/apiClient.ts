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

  constructor(message: string, statusCode: number, path?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.path = path
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

function toApiError(error: unknown): unknown {
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

authApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = axios.isAxiosError(error)
      ? error.config
      : undefined
    const status = axios.isAxiosError(error) ? error.response?.status : null

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
