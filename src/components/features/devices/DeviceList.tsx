'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'

import { useDevices } from '@/hooks/useDevices'

import { DeviceStatusBadge } from './DeviceStatusBadge'

type StatusFilter = 'all' | 'online' | 'offline'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'online', label: 'ออนไลน์' },
  { value: 'offline', label: 'ออฟไลน์' },
]

export function DeviceList() {
  const { data: devices, isLoading, isError } = useDevices()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    if (!devices) return []
    const needle = keyword.trim().toLowerCase()

    return devices.filter((device) => {
      if (status === 'online' && !device.online) return false
      if (status === 'offline' && device.online) return false
      if (!needle) return true

      return [device.serial, device.ward, device.name, device.staticName]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle))
    })
  }, [devices, keyword, status])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((row) => (
          <span key={row} className="skeleton h-10 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-error">ไม่สามารถโหลดรายการอุปกรณ์ได้</p>
  }

  if (!devices || devices.length === 0) {
    return <p className="text-base-content/60">ยังไม่มีอุปกรณ์ในระบบ</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
          <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
          <input
            type="search"
            className="grow"
            placeholder="ค้นหา serial / ชื่อ / ward"
            aria-label="ค้นหาอุปกรณ์"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>

        <div role="group" aria-label="กรองตามสถานะ" className="join self-start">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`btn join-item btn-sm ${
                status === filter.value ? 'btn-active btn-primary' : ''
              }`}
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table-pin-rows table table-zebra">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Ward</th>
                <th>ชื่ออุปกรณ์</th>
                <th>สถานะ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr key={device.id} className="hover">
                  <td>
                    <Link
                      href={`/devices/${encodeURIComponent(device.staticName)}`}
                      className="link link-primary font-mono"
                    >
                      {device.serial ?? '-'}
                    </Link>
                  </td>
                  <td className="text-base-content/70">{device.ward}</td>
                  <td className="font-medium">
                    {device.name ?? device.staticName}
                  </td>
                  <td>
                    <DeviceStatusBadge online={device.online} />
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/devices/${encodeURIComponent(device.staticName)}`}
                      className="btn btn-ghost btn-xs"
                      aria-label={`ดูรายละเอียด ${device.name ?? device.staticName}`}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-base-content/50">
        แสดง {filtered.length} จาก {devices.length} อุปกรณ์ · อัปเดตอัตโนมัติทุก
        20 วินาที
      </p>
    </div>
  )
}
