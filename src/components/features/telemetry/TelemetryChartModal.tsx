'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { useHydrated } from '@/hooks/useHydrated'
import { exportChartAsJpg, exportChartAsPdf, exportChartAsPng } from '@/lib/chartExport'

import { TelemetryChartStack } from './TelemetryChartStack'
import type { ChartRow } from './telemetry-chart-utils'

export interface TelemetryChartModalHandle {
  open: () => void
}

// ค่าตรงกับบล็อก :root[data-theme='light'] ใน globals.css — ใช้บังคับภาพ export ให้เป็น
// พื้นหลังขาว/สีอ่านง่ายเสมอ เพราะ --color-primary/--color-cat-* ผูกกับ :root เท่านั้น
// (ใส่ data-theme="light" บน div ลูกไม่ทำให้สีพวกนี้เปลี่ยนตาม)
const LIGHT_CHART_VARS: Record<string, string> = {
  '--chart-surface': '#ffffff',
  '--chart-text-secondary': 'rgba(0,0,0,0.72)',
  '--chart-muted': 'rgba(0,0,0,0.5)',
  '--chart-grid': 'rgba(0,0,0,0.12)',
  '--chart-axis': 'rgba(0,0,0,0.25)',
  '--chart-series-temp': 'oklch(56% 0.17 25)',
  '--chart-series-humidity': 'oklch(55% 0.14 245)',
  '--chart-series-door': 'oklch(54% 0.13 150)',
  '--chart-series-internet': 'oklch(54% 0.16 292)',
  '--chart-threshold': 'oklch(64% 0.14 70)',
}

interface TelemetryChartModalProps {
  chartData: ChartRow[]
  syncId: string
  tempMin?: number | null
  tempMax?: number | null
  title: string
  serial: string
  deviceName?: string | null
  probeName?: string | null
}

export const TelemetryChartModal = forwardRef<
  TelemetryChartModalHandle,
  TelemetryChartModalProps
>(function TelemetryChartModal(
  { chartData, syncId, tempMin, tempMax, title, serial, deviceName, probeName },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const hydrated = useHydrated()

  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null)
  const [refAreaLeft, setRefAreaLeft] = useState<string>('')
  const [refAreaRight, setRefAreaRight] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => {
      setZoomRange(null)
      dialogRef.current?.showModal()
      // <dialog> autofocuses the first focusable descendant (the export button),
      // which trips daisyUI's :focus-within dropdown open on mount — steal focus
      // back to the dialog itself so the export menu starts closed.
      dialogRef.current?.focus()
    },
  }))

  if (!hydrated) return null

  const visibleData = zoomRange ? chartData.slice(zoomRange[0], zoomRange[1] + 1) : chartData

  const handleSelectEnd = () => {
    if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
      const indexOf = (label: string) => chartData.findIndex((row) => row.sendTime === label)
      let left = indexOf(refAreaLeft)
      let right = indexOf(refAreaRight)
      if (left > right) [left, right] = [right, left]
      if (left !== -1 && right !== -1) setZoomRange([left, right])
    }
    setRefAreaLeft('')
    setRefAreaRight('')
  }

  const handleExport = async (kind: 'png' | 'jpg' | 'pdf') => {
    if (!exportRef.current) return
    setIsExporting(true)
    const el = exportRef.current
    // ภาพ export ต้องพื้นหลังขาวเสมอไม่ว่า app จะอยู่ theme ไหน — ทับ CSS variable ของ .viz-root
    // ด้วยค่า light theme ตรงๆ (คัดลอกจาก globals.css) เฉพาะตอน capture แล้วลบออกหลังจบ ไม่งั้น
    // กราฟที่แสดงอยู่บนจอจะเปลี่ยนสีค้างตามไปด้วย
    Object.entries(LIGHT_CHART_VARS).forEach(([key, value]) => el.style.setProperty(key, value))
    try {
      // title มักมี "/" ปนอยู่ (เช่น "กราฟอุณหภูมิ/ความชื้น/...") ซึ่งใช้เป็นชื่อไฟล์ไม่ได้
      // เบราว์เซอร์จะดาวน์โหลดเงียบๆ ไม่สำเร็จถ้า download attribute มี "/"
      const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-')
      const filename = `${safeTitle}-${new Date().toISOString().slice(0, 10)}`
      if (kind === 'png') await exportChartAsPng(el, filename)
      else if (kind === 'jpg') await exportChartAsJpg(el, filename)
      else await exportChartAsPdf(el, filename)
    } finally {
      Object.keys(LIGHT_CHART_VARS).forEach((key) => el.style.removeProperty(key))
      setIsExporting(false)
    }
  }

  return createPortal(
    <dialog ref={dialogRef} className="modal" tabIndex={-1}>
      <div className="modal-box flex h-[96vh] w-[97vw] max-w-[97vw] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="flex items-center gap-2">
            {zoomRange && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setZoomRange(null)}
              >
                รีเซ็ตซูม
              </button>
            )}
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-sm"
                disabled={isExporting}
              >
                {isExporting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Export'
                )}
              </button>
              <ul className="dropdown-content menu z-10 w-32 rounded-box bg-base-100 p-2 shadow">
                <li>
                  <button type="button" onClick={() => handleExport('png')}>
                    PNG
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleExport('jpg')}>
                    JPG
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleExport('pdf')}>
                    PDF
                  </button>
                </li>
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square"
              aria-label="ปิด"
              onClick={() => dialogRef.current?.close()}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div
          ref={exportRef}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-base-100 p-2"
        >
          <div className="flex w-fit flex-col gap-0.5 text-xs text-base-content/70">
            {deviceName && (
              <p>
                <span className="font-medium text-base-content">ชื่ออุปกรณ์:</span>{' '}
                {deviceName}
              </p>
            )}
            <p>
              <span className="font-medium text-base-content">Serial:</span> {serial}
            </p>
            {probeName && (
              <p>
                <span className="font-medium text-base-content">Probe:</span> {probeName}
              </p>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <TelemetryChartStack
              data={visibleData}
              syncId={syncId}
              tempMin={tempMin}
              tempMax={tempMax}
              mainHeight={360}
              stripHeight={80}
              zoomable
              refAreaLeft={refAreaLeft}
              refAreaRight={refAreaRight}
              onSelectStart={setRefAreaLeft}
              onSelectMove={setRefAreaRight}
              onSelectEnd={handleSelectEnd}
            />
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>,
    document.body,
  )
})
