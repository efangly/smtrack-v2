export function decodeJwtPayload<T = unknown>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const percentEncoded = Array.from(
      binary,
      (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'),
    ).join('')
    const json = decodeURIComponent(percentEncoded)
    return JSON.parse(json) as T
  } catch {
    return null
  }
}
