import type { ReactNode } from 'react'

// <h1>ตั้งค่า</h1> อยู่ที่นี่ที่เดียว — หน้าย่อยใส่หัวข้อระดับการ์ดเท่านั้น
// เพื่อไม่ให้ข้อความซ้ำกันจนทำให้ locator ของ Playwright (strict mode) กำกวม
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      {children}
    </div>
  )
}
