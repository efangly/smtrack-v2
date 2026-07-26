import { Activity, Droplets, Radio, Thermometer } from 'lucide-react'

/* ตัวเลขในแผงนี้เป็นภาพประกอบล้วน ไม่ได้ดึงจาก API
   (หน้า login ยังไม่มี token จึงเรียก endpoint ใด ๆ ไม่ได้) */
const STATS = [
  { icon: Thermometer, value: '-20.4°C', label: 'อุณหภูมิเฉลี่ย' },
  { icon: Droplets, value: '48%', label: 'ความชื้น' },
  { icon: Activity, value: '24/7', label: 'เฝ้าระวังต่อเนื่อง' },
]

export function AuthBrandPanel() {
  return (
    <div
      aria-hidden="true"
      className="auth-brand relative hidden overflow-hidden bg-primary text-primary-content lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14"
    >
      <div className="brand-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_0%,color-mix(in_oklch,var(--color-primary-content)_22%,transparent),transparent_60%)]" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-content/15 backdrop-blur-sm">
          <Radio className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">SMtrack Dashboard</p>
          <p className="text-xs text-primary-content/70">
            ระบบเฝ้าระวังอุณหภูมิตู้แช่เย็นแบบเรียลไทม์
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="text-3xl font-semibold leading-snug xl:text-4xl">
          เฝ้าระวังอุณหภูมิทุกตู้แช่ ตลอดเวลา
        </p>
        <p className="mt-3 text-sm leading-relaxed text-primary-content/75">
          ติดตามค่าอุณหภูมิและความชื้นจากอุปกรณ์ IoT
          พร้อมแจ้งเตือนทันทีเมื่อค่าหลุดเกณฑ์ที่กำหนด
        </p>
      </div>

      <div className="relative flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-box border border-primary-content/15 bg-primary-content/10 p-3 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-primary-content/70" />
                <p className="mt-2 text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-primary-content/70">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <p className="flex items-center gap-2 text-xs text-primary-content/75">
          <span className="status-dot status-dot-live" />
          อุปกรณ์เชื่อมต่ออยู่
        </p>
      </div>
    </div>
  )
}
