function join(base: string | undefined, path: string, toOrigin: boolean) {
  if (!base) return null
  try {
    const prefix = toOrigin ? new URL(base).origin : base.replace(/\/+$/, '')
    return `${prefix}/${path.replace(/^\/+/, '')}`
  } catch {
    return null
  }
}

// รูปของ auth service (pic ของผู้ใช้, hosPic ของโรงพยาบาล) บางระบบเก็บเป็น URL เต็ม
// บางระบบเก็บเป็น path สัมพัทธ์ — helper นี้ทำให้ได้ URL ที่ใช้ได้จริงทั้งสองแบบ
// หมายเหตุ: ต่อกับ *origin* ของ base URL ไม่ใช่ base ทั้งก้อน เพราะ path รูปไม่ได้อยู่ใต้ /smtrack/auth
export function resolveApiImageUrl(
  path: string | null | undefined,
  source: 'auth' | 'log' = 'auth',
): string | null {
  const value = path?.trim()
  if (!value) return null
  if (/^(https?:|data:)/i.test(value)) return value

  // ต้องอ้าง process.env.NEXT_PUBLIC_* แบบตรงๆ ห้ามใช้ dynamic key
  // เพราะ Next.js แทนค่าตอน build ด้วยการ replace ข้อความ
  return join(
    source === 'log'
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
    value,
    true,
  )
}

/**
 * `positionPic` ของอุปกรณ์ไม่ใช่ path บนเว็บ แต่เป็น **object key ใน bucket** ของ MinIO/S3
 * (ดู DeviceImageStorageService ฝั่ง log service) — log service ไม่ได้ serve ไฟล์นี้ผ่าน HTTP
 * จึงต่อกับ origin ของ API base ไม่ได้
 *
 * ต้องตั้ง `NEXT_PUBLIC_DEVICE_IMAGE_BASE_URL` ให้ชี้ไปที่ base ของ bucket ที่อ่านได้จากเบราว์เซอร์
 * (เช่น `http://host:9000/media` หรือ endpoint ที่ backend ทำ presign/proxy ให้)
 * ถ้ายังไม่ได้ตั้ง จะคืน null เพื่อให้ UI ซ่อนรูปไปเลย ดีกว่าโชว์ลิงก์ที่ 403/404
 *
 * ต่อกับ base **ทั้งก้อน** ไม่ใช่แค่ origin เพราะชื่อ bucket เป็นส่วนหนึ่งของ path
 */
export function resolveDeviceImageUrl(
  path: string | null | undefined,
): string | null {
  const value = path?.trim()
  if (!value) return null
  if (/^(https?:|data:)/i.test(value)) return value

  return join(process.env.NEXT_PUBLIC_DEVICE_IMAGE_BASE_URL, value, false)
}
