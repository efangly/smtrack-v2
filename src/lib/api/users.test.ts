import { authApiClient } from '@/lib/apiClient'

import { createUser, getUsers, resetPassword, updateUser } from './users'

jest.mock('@/lib/apiClient', () => ({
  authApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockClient = jest.mocked(authApiClient)

const userPayload = {
  id: 'u-1',
  wardId: 'w-1',
  username: 'somchai',
  status: true,
  role: 'ADMIN',
  display: 'สมชาย',
  pic: null,
  comment: null,
  createBy: null,
  createAt: '2026-07-01T00:00:00Z',
  updateAt: '2026-07-01T00:00:00Z',
  ward: { id: 'w-1', wardName: 'ICU', hosId: 'h-1' },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getUsers', () => {
  it('parses the list including the preloaded ward relation', async () => {
    mockClient.get.mockResolvedValue({ data: [userPayload] })

    const users = await getUsers()

    expect(mockClient.get).toHaveBeenCalledWith('/user')
    expect(users[0].ward?.wardName).toBe('ICU')
  })

  // relation ฝั่ง Go มี `omitempty` จึงหายไปทั้ง key เมื่อผู้ใช้ยังไม่ผูกวอร์ด
  it('accepts users without a ward relation', async () => {
    const withoutWard = { ...userPayload }
    delete (withoutWard as Partial<typeof userPayload>).ward
    mockClient.get.mockResolvedValue({ data: [withoutWard] })

    await expect(getUsers()).resolves.toHaveLength(1)
  })

  it('rejects a payload with an unknown role', async () => {
    mockClient.get.mockResolvedValue({
      data: [{ ...userPayload, role: 'WIZARD' }],
    })

    await expect(getUsers()).rejects.toThrow()
  })
})

describe('createUser', () => {
  // POST /auth/user ไม่ได้อ่าน FormFile จึงต้องส่ง JSON ไม่ใช่ FormData
  it('sends a plain JSON body', async () => {
    mockClient.post.mockResolvedValue({ data: userPayload })

    await createUser({ wardId: 'w-1', username: 'somchai', password: '1234' })

    const [, body] = mockClient.post.mock.calls[0]
    expect(body).not.toBeInstanceOf(FormData)
    expect(body).toEqual({
      wardId: 'w-1',
      username: 'somchai',
      password: '1234',
    })
  })
})

describe('updateUser', () => {
  it('sends JSON when no image is attached', async () => {
    mockClient.put.mockResolvedValue({ data: userPayload })

    await updateUser('u-1', { display: 'สมชาย ใจดี' })

    const [url, body] = mockClient.put.mock.calls[0]
    expect(url).toBe('/user/u-1')
    expect(body).not.toBeInstanceOf(FormData)
  })

  it('switches to multipart when an image is attached', async () => {
    mockClient.put.mockResolvedValue({ data: userPayload })
    const image = new File(['x'], 'avatar.png', { type: 'image/png' })

    await updateUser('u-1', { display: 'สมชาย', image })

    const [, body] = mockClient.put.mock.calls[0]
    expect(body).toBeInstanceOf(FormData)
    const formData = body as FormData
    expect(formData.get('display')).toBe('สมชาย')
    expect(formData.get('image')).toBe(image)
  })

  it('encodes the id into the path', async () => {
    mockClient.put.mockResolvedValue({ data: userPayload })

    await updateUser('u/1', { display: 'x' })

    expect(mockClient.put.mock.calls[0][0]).toBe('/user/u%2F1')
  })
})

describe('resetPassword', () => {
  // ResetPassword ฝั่ง service คืนเป็นข้อความ ไม่ใช่ entity
  it('parses the string response', async () => {
    mockClient.patch.mockResolvedValue({ data: 'Password reset successfully' })

    const result = await resetPassword('u-1', {
      password: '5678',
      oldPassword: '1234',
    })

    expect(mockClient.patch).toHaveBeenCalledWith('/reset/u-1', {
      password: '5678',
      oldPassword: '1234',
    })
    expect(result).toBe('Password reset successfully')
  })
})
