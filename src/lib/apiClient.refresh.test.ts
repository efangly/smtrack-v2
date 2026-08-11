import type { AxiosStatic, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'

// authApiClient เก็บ refreshPromise/redirecting เป็น module-level state จึงต้อง
// require ใหม่ทุกเทสผ่าน isolateModules ไม่งั้นเทสจะรบกวนกันเอง
let apiClientModule: typeof import('./apiClient')
let authStoreModule: typeof import('@/store/useAuthStore')
let axiosMod: AxiosStatic

function make401Response(config: InternalAxiosRequestConfig) {
  const error = new AxiosError('Unauthorized', undefined, config)
  error.response = {
    data: { message: 'Unauthorized' },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  } as never
  return Promise.reject(error)
}

function makeSuccessResponse(config: InternalAxiosRequestConfig) {
  return Promise.resolve({
    data: { success: true, message: 'ok', data: { ok: true }, statusCode: 200 },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
}

// adapter จำลอง backend: request แรกตอบ 401 เสมอ ยกเว้น request ที่ retry แล้ว
// (config._retry === true จาก refresh interceptor) ให้ตอบ 200
function make401ThenSuccessAdapter() {
  return jest.fn((config: InternalAxiosRequestConfig) => {
    if (config._retry) return makeSuccessResponse(config)
    return make401Response(config)
  })
}

beforeEach(() => {
  localStorage.clear()
  jest.isolateModules(() => {
    /* eslint-disable @typescript-eslint/no-require-imports -- ต้อง require แบบ
       dynamic ให้ jest.isolateModules สร้าง module instance ใหม่ทุกเทส เพื่อรีเซ็ต
       refreshPromise/redirecting ที่เป็น module-level state ใน apiClient.ts */
    axiosMod = require('axios')
    apiClientModule = require('./apiClient')
    authStoreModule = require('@/store/useAuthStore')
    /* eslint-enable @typescript-eslint/no-require-imports */
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('authApiClient refresh interceptor', () => {
  it('refreshes once and retries the original request on a single 401', async () => {
    localStorage.setItem('smtrack.refreshToken', 'old-refresh')
    const postSpy = jest.spyOn(axiosMod, 'post').mockResolvedValue({
      data: { data: { token: 'new-token', refreshToken: 'new-refresh' } },
    } as never)
    apiClientModule.authApiClient.defaults.adapter = make401ThenSuccessAdapter()

    const response = await apiClientModule.authApiClient.get('/protected')

    expect(response.data).toEqual({ ok: true })
    expect(postSpy).toHaveBeenCalledTimes(1)
  })

  it('serializes concurrent 401s into a single /refresh call', async () => {
    localStorage.setItem('smtrack.refreshToken', 'old-refresh')
    const postSpy = jest.spyOn(axiosMod, 'post').mockResolvedValue({
      data: { data: { token: 'new-token', refreshToken: 'new-refresh' } },
    } as never)
    apiClientModule.authApiClient.defaults.adapter = make401ThenSuccessAdapter()

    const results = await Promise.all([
      apiClientModule.authApiClient.get('/a'),
      apiClientModule.authApiClient.get('/b'),
      apiClientModule.authApiClient.get('/c'),
    ])

    expect(results.every((r) => r.data.ok === true)).toBe(true)
    expect(postSpy).toHaveBeenCalledTimes(1)
  })

  it('syncs the auth store with the new tokens after a successful refresh', async () => {
    localStorage.setItem('smtrack.refreshToken', 'old-refresh')
    jest.spyOn(axiosMod, 'post').mockResolvedValue({
      data: { data: { token: 'new-token', refreshToken: 'new-refresh' } },
    } as never)
    apiClientModule.authApiClient.defaults.adapter = make401ThenSuccessAdapter()

    await apiClientModule.authApiClient.get('/protected')

    const state = authStoreModule.useAuthStore.getState()
    expect(state.token).toBe('new-token')
    expect(state.refreshToken).toBe('new-refresh')
    expect(localStorage.getItem('smtrack.authToken')).toBe('new-token')
  })

  it('logs out and redirects to /login when refresh fails', async () => {
    localStorage.setItem('smtrack.authToken', 'stale-token')
    localStorage.setItem('smtrack.refreshToken', 'old-refresh')
    jest
      .spyOn(axiosMod, 'post')
      .mockRejectedValue(new Error('refresh rejected'))
    apiClientModule.authApiClient.defaults.adapter = jest.fn(
      (config: InternalAxiosRequestConfig) => make401Response(config),
    )

    await expect(
      apiClientModule.authApiClient.get('/protected'),
    ).rejects.toBeTruthy()

    expect(authStoreModule.useAuthStore.getState().token).toBeNull()
    expect(localStorage.getItem('smtrack.authToken')).toBeNull()
  })

  it('redirects immediately without calling /refresh when no refresh token is stored', async () => {
    const postSpy = jest.spyOn(axiosMod, 'post')
    apiClientModule.authApiClient.defaults.adapter = jest.fn(
      (config: InternalAxiosRequestConfig) => make401Response(config),
    )

    await expect(
      apiClientModule.authApiClient.get('/protected'),
    ).rejects.toBeTruthy()

    expect(postSpy).not.toHaveBeenCalled()
  })

  it('does not attempt a refresh when the 401 comes from /refresh itself', async () => {
    localStorage.setItem('smtrack.refreshToken', 'old-refresh')
    const postSpy = jest.spyOn(axiosMod, 'post')
    apiClientModule.authApiClient.defaults.adapter = jest.fn(
      (config: InternalAxiosRequestConfig) => make401Response(config),
    )

    await expect(
      apiClientModule.authApiClient.post('/refresh', { token: 'old-refresh' }),
    ).rejects.toBeTruthy()

    expect(postSpy).not.toHaveBeenCalled()
  })

  it('only redirects once when several requests fail refresh concurrently', async () => {
    localStorage.setItem('smtrack.refreshToken', 'old-refresh')
    jest
      .spyOn(axiosMod, 'post')
      .mockRejectedValue(new Error('refresh rejected'))
    apiClientModule.authApiClient.defaults.adapter = jest.fn(
      (config: InternalAxiosRequestConfig) => make401Response(config),
    )
    const logoutSpy = jest.spyOn(
      authStoreModule.useAuthStore.getState(),
      'logout',
    )

    await Promise.allSettled([
      apiClientModule.authApiClient.get('/a'),
      apiClientModule.authApiClient.get('/b'),
    ])

    expect(logoutSpy).toHaveBeenCalledTimes(1)
  })
})
