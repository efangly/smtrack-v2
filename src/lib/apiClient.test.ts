import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'

import { attachAuthHeader, unwrapEnvelope } from './apiClient'
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
