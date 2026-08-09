import {
  Bell,
  DoorClosed,
  DoorOpen,
  FileText,
  Plug,
  Radio,
  Thermometer,
  WifiOff,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { SdCardIcon } from '@/components/ui/icons/SdCardIcon'

// lucide-react ไม่มีไอคอน SD card จึงใช้ SdCardIcon ที่วาดเอง (ดู DeviceTelemetryIcons.tsx) —
// type ของ icon จึงต้องกว้างกว่า LucideIcon (ForwardRefExoticComponent) เพื่อรองรับ function component ทั่วไปด้วย
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export type Tone = 'success' | 'error' | 'muted'

export const TONE_CLASS: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-error',
  muted: 'text-base-content/50',
}

export type NotificationFilterValue =
  'all' | 'report' | 'temp' | 'door' | 'sdcard' | 'sensor' | 'internet' | 'plug'

// value ตรงกับ ?filter= ของ backend (notification.service.ts: filterToMessageContains)
// ยกเว้น 'sensor' ที่ backend ไม่มี case ตั้งชื่อไว้ — ตกไป default ซึ่ง contains
// ด้วยค่าที่ส่งไปตรงๆ จึงต้องส่ง queryValue เป็น 'SENSOR' ตัวพิมพ์ใหญ่ให้ตรงกับ
// token ที่เก็บจริงในข้อความ (เช่น "PROBE1/SENSOR/ON")
export const NOTIFICATION_FILTERS: {
  value: NotificationFilterValue
  label: string
  icon: IconComponent
  queryValue?: string
}[] = [
  { value: 'all', label: 'ทั้งหมด', icon: Bell },
  { value: 'report', label: 'รายงาน', icon: FileText },
  { value: 'temp', label: 'อุณหภูมิ', icon: Thermometer },
  { value: 'door', label: 'ประตู', icon: DoorOpen },
  { value: 'sdcard', label: 'SD Card', icon: SdCardIcon },
  { value: 'sensor', label: 'เซนเซอร์', icon: Radio, queryValue: 'SENSOR' },
  { value: 'internet', label: 'อินเทอร์เน็ต', icon: WifiOff },
  { value: 'plug', label: 'ไฟเข้า', icon: Plug },
]

export type NotificationCategory =
  Exclude<NotificationFilterValue, 'all'> | 'other'

// class เหล่านี้ประกาศไว้ใน globals.css (ตั้ง --accent-hue ให้ subtree)
// component ใช้คู่กับ accent-bar/accent-chip/accent-text เพื่อระบายสีตามหมวด
// 'other' ไม่มีสีประจำ ปล่อยให้ตกไปที่ค่า fallback ของ accent-bar (base-300)
export const CATEGORY_ACCENT_CLASS: Record<NotificationCategory, string> = {
  temp: 'accent-temp',
  door: 'accent-door',
  sdcard: 'accent-sdcard',
  sensor: 'accent-sensor',
  internet: 'accent-internet',
  plug: 'accent-plug',
  report: 'accent-report',
  other: '',
}

export interface NotificationClassification {
  category: NotificationCategory
  icon: IconComponent
  tone: Tone
}

// อ่าน message แบบเดียวกับ backend (NotificationService.findCount /
// filterToMessageContains, notification.service.ts) — message เป็นสตริงคั่นด้วย
// '/' โดย token แรกบอกว่าเป็นการแจ้งเตือนระดับกล่อง (TEMP, SD, AC, INTERNET,
// REPORT) หรือระดับโพรบ (ชื่อโพรบนำหน้า แล้วตามด้วย DOOR<n>/TEMP/SENSOR)
export function classifyNotification(
  message: string,
): NotificationClassification {
  const parts = message.split('/')
  const head = parts[0]

  switch (head) {
    case 'SD':
      return { category: 'sdcard', icon: SdCardIcon, tone: 'error' }
    case 'AC':
      return { category: 'plug', icon: Plug, tone: 'error' }
    case 'INTERNET':
      return { category: 'internet', icon: WifiOff, tone: 'error' }
    case 'REPORT':
      return { category: 'report', icon: FileText, tone: 'muted' }
    case 'TEMP':
      return {
        category: 'temp',
        icon: Thermometer,
        tone: parts[1] === 'OVER' || parts[1] === 'LOWER' ? 'error' : 'success',
      }
    default: {
      // ระดับโพรบ: parts[0] คือชื่อโพรบ, parts[1] คือประเภทย่อย
      const sub = parts[1]
      if (sub?.startsWith('DOOR')) {
        const isOpen = parts[2] === 'ON'
        return {
          category: 'door',
          icon: isOpen ? DoorOpen : DoorClosed,
          tone: isOpen ? 'error' : 'success',
        }
      }
      if (sub === 'TEMP') {
        return {
          category: 'temp',
          icon: Thermometer,
          tone:
            parts[2] === 'OVER' || parts[2] === 'LOWER' ? 'error' : 'success',
        }
      }
      if (sub === 'SENSOR') {
        const connected = parts[2] === 'ON'
        return {
          category: 'sensor',
          icon: connected ? Radio : WifiOff,
          tone: connected ? 'success' : 'error',
        }
      }
      return { category: 'other', icon: Bell, tone: 'muted' }
    }
  }
}
