import { resolveApiImageUrl, resolveDeviceImageUrl } from './imageUrl'

const ORIGINAL_BASE = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL
const ORIGINAL_LOG_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

describe('resolveApiImageUrl', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL =
      'https://tms.siamatic.co.th/smtrack/auth'
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://log.example.com/smtrack/log'
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL = ORIGINAL_BASE
    process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_LOG_BASE
  })

  it('คืน null เมื่อไม่มีค่า', () => {
    expect(resolveApiImageUrl(null)).toBeNull()
    expect(resolveApiImageUrl(undefined)).toBeNull()
    expect(resolveApiImageUrl('   ')).toBeNull()
  })

  it('คืนค่าเดิมเมื่อเป็น URL เต็มหรือ data URI', () => {
    expect(resolveApiImageUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    )
    expect(resolveApiImageUrl('http://cdn.example.com/a.png')).toBe(
      'http://cdn.example.com/a.png',
    )
    expect(resolveApiImageUrl('data:image/png;base64,AAA')).toBe(
      'data:image/png;base64,AAA',
    )
  })

  it('ต่อ path สัมพัทธ์กับ origin ของ auth base URL (ไม่ติด /smtrack/auth)', () => {
    expect(resolveApiImageUrl('/img/hospital/a.png')).toBe(
      'https://tms.siamatic.co.th/img/hospital/a.png',
    )
    expect(resolveApiImageUrl('img/hospital/a.png')).toBe(
      'https://tms.siamatic.co.th/img/hospital/a.png',
    )
  })

  it('ใช้ base ของ log service เมื่อ source เป็น log', () => {
    expect(resolveApiImageUrl('/img/device/a.png', 'log')).toBe(
      'https://log.example.com/img/device/a.png',
    )
    expect(resolveApiImageUrl('img/device/a.png', 'log')).toBe(
      'https://log.example.com/img/device/a.png',
    )
  })

  it('คืน null เมื่อ env ว่างหรือ parse ไม่ผ่าน', () => {
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL = ''
    expect(resolveApiImageUrl('/img/a.png')).toBeNull()

    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL = 'not-a-url'
    expect(resolveApiImageUrl('/img/a.png')).toBeNull()

    process.env.NEXT_PUBLIC_API_BASE_URL = ''
    expect(resolveApiImageUrl('/img/a.png', 'log')).toBeNull()
  })
})

describe('resolveDeviceImageUrl', () => {
  const ORIGINAL = process.env.NEXT_PUBLIC_DEVICE_IMAGE_BASE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEVICE_IMAGE_BASE_URL =
      'http://siamatic.thddns.net:9000/media'
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_DEVICE_IMAGE_BASE_URL = ORIGINAL
  })

  // ชื่อ bucket อยู่ใน path จึงต้องต่อกับ base ทั้งก้อน ไม่ใช่แค่ origin
  it('ต่อ object key กับ base ของ bucket ทั้งก้อน', () => {
    expect(resolveDeviceImageUrl('devices/abc.png')).toBe(
      'http://siamatic.thddns.net:9000/media/devices/abc.png',
    )
    expect(resolveDeviceImageUrl('/devices/abc.png')).toBe(
      'http://siamatic.thddns.net:9000/media/devices/abc.png',
    )
  })

  it('คืนค่าเดิมเมื่อ backend ส่ง URL เต็มมาแล้ว (เช่น presigned URL)', () => {
    expect(resolveDeviceImageUrl('https://cdn.example.com/a.png?sig=1')).toBe(
      'https://cdn.example.com/a.png?sig=1',
    )
  })

  it('คืน null เมื่อยังไม่ได้ตั้ง base — UI จะซ่อนรูปแทนที่จะโชว์ลิงก์เสีย', () => {
    process.env.NEXT_PUBLIC_DEVICE_IMAGE_BASE_URL = ''
    expect(resolveDeviceImageUrl('devices/abc.png')).toBeNull()
    expect(resolveDeviceImageUrl(null)).toBeNull()
  })
})
