import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError, AxiosHeaders } from 'axios'

import { ApiError, attachAuthHeader, toApiError, unwrapEnvelope } from './apiClient'
import { clearStoredToken, setStoredToken } from './authToken'

function makeResponse(data: unknown): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  }
}

describe('unwrapEnvelope', () => {
  it('unwraps the backend success envelope to the inner payload', () => {
    const envelope = {
      success: true,
      message: 'Request Successfully',
      data: { id: '1', serial: 'ABC' },
      timestamp: '2026-07-24T00:00:00.000Z',
      statusCode: 200,
    }
    const result = unwrapEnvelope(makeResponse(envelope))
    expect(result.data).toEqual({ id: '1', serial: 'ABC' })
  })

  it('passes through responses that are not enveloped', () => {
    const raw = { foo: 'bar' }
    const result = unwrapEnvelope(makeResponse(raw))
    expect(result.data).toEqual(raw)
  })

  it('passes through non-object bodies untouched', () => {
    const result = unwrapEnvelope(makeResponse('plain text'))
    expect(result.data).toBe('plain text')
  })
})

describe('toApiError', () => {
  function makeAxiosError(status: number, data: unknown): AxiosError {
    const config = {
      url: '/user',
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig
    const error = new AxiosError('Request failed', undefined, config)
    error.response = {
      data,
      status,
      statusText: '',
      headers: {},
      config,
    } as AxiosResponse
    return error
  }

  it('maps an axios error to ApiError using the response status', () => {
    // auth service ตอบ { message, success, data } โดยไม่มี statusCode
    const result = toApiError(
      makeAxiosError(403, { message: 'You do not have the required role', success: false }),
    )
    expect(result).toBeInstanceOf(ApiError)
    expect((result as ApiError).message).toBe('You do not have the required role')
    expect((result as ApiError).statusCode).toBe(403)
  })

  it('joins array messages from validation errors', () => {
    const result = toApiError(makeAxiosError(400, { message: ['a', 'b'] }))
    expect((result as ApiError).message).toBe('a, b')
  })

  // ตัว refresh interceptor ถูกลงทะเบียนหลัง toApiError จึงต้องพึ่ง config ที่ติดมากับ
  // ApiError ในการยิง request เดิมซ้ำ — ถ้า field นี้หายไป auto-refresh จะตายเงียบ
  it('carries the originating request config so the refresh interceptor can retry', () => {
    const result = toApiError(makeAxiosError(401, { message: 'Unauthorized' }))
    expect((result as ApiError).config?.url).toBe('/user')
  })

  it('passes through errors that are not axios errors', () => {
    const plain = new Error('boom')
    expect(toApiError(plain)).toBe(plain)
  })
})

describe('attachAuthHeader', () => {
  afterEach(() => {
    clearStoredToken()
  })

  it('attaches an Authorization bearer header when a token is stored', () => {
    setStoredToken('test-token')
    const config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig
    const result = attachAuthHeader(config)
    expect(result.headers.get('Authorization')).toBe('Bearer test-token')
  })

  it('leaves the Authorization header unset when no token is stored', () => {
    const config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig
    const result = attachAuthHeader(config)
    expect(result.headers.get('Authorization')).toBeUndefined()
  })
})
