'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

import { useTelemetry } from '@/hooks/useTelemetry'

import { TelemetryChartModal, type TelemetryChartModalHandle } from './TelemetryChartModal'
import { TelemetryChartStack } from './TelemetryChartStack'
import { toChartData } from './telemetry-chart-utils'

export interface TelemetryGraphHandle {
  openFullscreen: () => void
}

export const TelemetryGraph = forwardRef<TelemetryGraphHandle, {
  serial: string
  probeId?: string
  from?: string
  to?: string
  tempMin?: number | null
  tempMax?: number | null
  title?: string
  deviceName?: string | null
  probeName?: string | null
}>(function TelemetryGraph(
  { serial, probeId, from, to, tempMin, tempMax, title = 'กราฟ telemetry', deviceName, probeName },
  ref,
) {
  const { data, isLoading, isError } = useTelemetry({
    serial,
    probeId,
    from,
    to,
  })

  const modalRef = useRef<TelemetryChartModalHandle>(null)

  useImperativeHandle(ref, () => ({
    openFullscreen: () => modalRef.current?.open(),
  }))

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดกราฟได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูลกราฟ</p>

  const chartData = toChartData(data)
  const syncId = `telemetry-${serial}-${probeId ?? 'all'}`

  return (
    <>
      <TelemetryChartStack
        data={chartData}
        syncId={syncId}
        tempMin={tempMin}
        tempMax={tempMax}
      />
      <TelemetryChartModal
        ref={modalRef}
        chartData={chartData}
        syncId={syncId}
        tempMin={tempMin}
        tempMax={tempMax}
        title={title}
        serial={serial}
        deviceName={deviceName}
        probeName={probeName}
      />
    </>
  )
})
