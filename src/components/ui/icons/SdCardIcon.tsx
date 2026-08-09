import type { SVGProps } from 'react'

// lucide-react ไม่มีไอคอนรูปการ์ด SD ให้ใช้ (เช็คถึง v1.30.0 แล้ว) วาดเองในสไตล์เดียวกับ lucide
// (24x24, stroke-based, linecap/linejoin round) เพื่อให้ปนกับไอคอน Wifi/Plug/Battery ในชุดเดียวกันได้กลมกลืน
export function SdCardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 3v6" />
      <path d="M12 3v6" />
      <path d="M15 3v6" />
      <path d="M5 9h15" />
    </svg>
  )
}
