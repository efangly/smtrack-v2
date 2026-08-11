'use client'

import { useMemo } from 'react'

import { useDevices } from '@/hooks/useDevices'
import { useHospitals } from '@/hooks/useHospitals'
import { matchesWard } from '@/lib/wardMatch'

export type HospitalDeviceStats = {
  online: number
  offline: number
  total: number
}

// device.ward ไม่มี hospitalId ผูกตรง ๆ — ต้องไล่เทียบกับ hospital.ward[] ของแต่ละ รพ.
// ผ่าน matchesWard() (เทียบได้ทั้ง wardId และชื่อวอร์ด) ถึงจะรู้ว่าอุปกรณ์นี้อยู่ รพ. ไหน
export function useHospitalDeviceStats() {
  const { data: hospitals, isLoading: hospitalsLoading } = useHospitals()
  const { data: devices, isLoading: devicesLoading } = useDevices()

  const statsByHospitalId = useMemo(() => {
    const stats = new Map<string, HospitalDeviceStats>()
    if (!hospitals || !devices) return stats

    for (const hospital of hospitals) {
      const wards = hospital.ward ?? []
      if (wards.length === 0) continue

      let online = 0
      let offline = 0
      for (const device of devices) {
        if (!wards.some((ward) => matchesWard(device.ward, ward))) continue
        if (device.online) online += 1
        else offline += 1
      }
      stats.set(hospital.id, { online, offline, total: online + offline })
    }

    return stats
  }, [hospitals, devices])

  return {
    statsByHospitalId,
    isLoading: hospitalsLoading || devicesLoading,
  }
}
