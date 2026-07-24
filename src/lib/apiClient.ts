import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { getStoredToken } from '@/lib/authToken'

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

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(attachAuthHeader)
apiClient.interceptors.response.use(unwrapEnvelope)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as
        | { message?: string | string[]; statusCode?: number; path?: string }
        | undefined
      const message = Array.isArray(body?.message)
        ? body.message.join(', ')
        : (body?.message ?? error.message)
      return Promise.reject(
        new ApiError(
          message,
          body?.statusCode ?? error.response.status,
          body?.path,
        ),
      )
    }
    return Promise.reject(error)
  },
)
