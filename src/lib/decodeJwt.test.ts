import { decodeJwtPayload } from './decodeJwt'

function makeToken(payload: object): string {
  const base64url = (input: string) =>
    Buffer.from(input)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('decodeJwtPayload', () => {
  it('decodes a well-formed JWT payload', () => {
    const token = makeToken({
      id: 'u1',
      name: 'Test User',
      role: 'ADMIN',
      wardId: 'w1',
    })
    expect(decodeJwtPayload(token)).toEqual({
      id: 'u1',
      name: 'Test User',
      role: 'ADMIN',
      wardId: 'w1',
    })
  })

  it('decodes UTF-8 multi-byte characters (Thai name) correctly', () => {
    const token = makeToken({
      id: 'u2',
      name: 'สมชาย ใจดี',
      role: 'ADMIN',
      wardId: 'w1',
    })
    expect(decodeJwtPayload<{ name: string }>(token)?.name).toBe('สมชาย ใจดี')
  })

  it('returns null for a malformed token', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull()
  })
})
