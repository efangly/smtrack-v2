'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, List, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Pagination } from '@/components/ui/Pagination'
import { useDevices } from '@/hooks/useDevices'
import { useHospitals } from '@/hooks/useHospitals'
import { usePaginationParams } from '@/hooks/usePaginationParams'

import { DeviceCard } from './DeviceCard'
import { DeviceRow } from './DeviceRow'

type StatusFilter = 'all' | 'online' | 'offline'
type ViewMode = 'list' | 'grid'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'online', label: 'ออนไลน์' },
  { value: 'offline', label: 'ออฟไลน์' },
]

const ALL = 'all'

export function DeviceList() {
  const { data: devices, isLoading, isError } = useDevices()
  const { data: hospitals } = useHospitals()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [hospitalId, setHospitalId] = useState(ALL)
  const [wardId, setWardId] = useState(ALL)
  const [view, setView] = useState<ViewMode>('list')
  const { page, limit, setPage, setLimit } = usePaginationParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedHospital = hospitals?.find(
    (hospital) => hospital.id === hospitalId,
  )
  const wardOptions = [...(selectedHospital?.ward ?? [])].sort(
    (a, b) => a.wardSeq - b.wardSeq,
  )

  function handleHospitalChange(nextHospitalId: string) {
    setHospitalId(nextHospitalId)
    const nextHospital = hospitals?.find(
      (hospital) => hospital.id === nextHospitalId,
    )
    const firstWard = [...(nextHospital?.ward ?? [])].sort(
      (a, b) => a.wardSeq - b.wardSeq,
    )[0]
    setWardId(firstWard?.id ?? ALL)
  }

  // device.ward (log service) เป็น free text คนละชุดกับ Ward ของ auth service —
  // ไม่มี wardId/hosId ผูกกับ device จริง ข้อมูลเก่าเก็บเป็น "ชื่อวอร์ด" แต่ข้อมูล
  // ที่ migrate มาใหม่บางส่วนกลับเก็บ wardId (เช่น "WID-xxxx") ลงในฟิลด์เดียวกัน
  // จึงต้องเทียบกับได้ทั้ง id และชื่อ (case-insensitive) ไม่ใช่ชื่ออย่างเดียว
  function matchesWard(
    device: NonNullable<typeof devices>[number],
    ward: (typeof wardOptions)[number],
  ) {
    const deviceWard = device.ward.trim().toLowerCase()
    return (
      deviceWard === ward.id.toLowerCase() ||
      deviceWard === ward.wardName.trim().toLowerCase()
    )
  }

  const needle = keyword.trim().toLowerCase()
  const filtered = devices
    ? devices.filter((device) => {
        if (status === 'online' && !device.online) return false
        if (status === 'offline' && device.online) return false

        if (hospitalId !== ALL) {
          if (wardId !== ALL) {
            const selectedWard = wardOptions.find((ward) => ward.id === wardId)
            if (!selectedWard || !matchesWard(device, selectedWard))
              return false
          } else if (!wardOptions.some((ward) => matchesWard(device, ward))) {
            return false
          }
        }

        if (!needle) return true

        return [device.serial, device.ward, device.name, device.staticName]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(needle))
      })
    : []

  // เปลี่ยนตัวกรอง/คำค้นแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้นอาจค้างอยู่หน้าที่เกินผลลัพธ์ใหม่
  useEffect(() => {
    if (page !== 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, status, hospitalId, wardId])

  // sync ward filter ขึ้น URL (ไม่แตะ page/limit ที่ sync ผ่าน usePaginationParams
  // อยู่แล้ว): ไม่เลือกโรงพยาบาล = ไม่ส่ง ward, เลือกโรงพยาบาลแต่ ward เป็น ALL =
  // ส่งทุกวอร์ดของโรงพยาบาลนั้นเป็น query ซ้ำ key เดียวกัน, เลือก ward เจาะจง = ส่งค่าเดียว
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('ward')

    if (hospitalId !== ALL) {
      if (wardId === ALL) {
        wardOptions.forEach((ward) => params.append('ward', ward.id))
      } else {
        params.set('ward', wardId)
      }
    }

    const query = params.toString()
    if (query === searchParams.toString()) return

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }, [hospitalId, wardId, wardOptions, router, pathname, searchParams])

  const totalItems = filtered.length
  const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

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

        <select
          className="select select-sm select-bordered"
          aria-label="กรองตามโรงพยาบาล"
          value={hospitalId}
          onChange={(event) => handleHospitalChange(event.target.value)}
        >
          <option value={ALL}>ALL</option>
          {hospitals?.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.hosName}
            </option>
          ))}
        </select>

        <select
          className="select select-sm select-bordered"
          aria-label="กรองตามวอร์ด"
          value={wardId}
          disabled={hospitalId === ALL}
          onChange={(event) => setWardId(event.target.value)}
        >
          <option value={ALL}>ALL</option>
          {wardOptions.map((ward) => (
            <option key={ward.id} value={ward.id}>
              {ward.wardName}
            </option>
          ))}
        </select>

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

        <div role="group" aria-label="สลับมุมมอง" className="join self-start">
          <button
            type="button"
            className={`btn join-item btn-sm ${view === 'list' ? 'btn-active btn-primary' : ''}`}
            aria-pressed={view === 'list'}
            aria-label="มุมมองรายการ"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`btn join-item btn-sm ${view === 'grid' ? 'btn-active btn-primary' : ''}`}
            aria-pressed={view === 'grid'}
            aria-label="มุมมองการ์ด"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข
        </p>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paged.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table-pin-rows table table-zebra">
            <thead>
              <tr>
                <th>Serial</th>
                <th>ชื่ออุปกรณ์</th>
                <th>อุณหภูมิ</th>
                <th>ความชื้น</th>
                <th>สัญญาณ / แบตเตอรี่</th>
                <th>สถานะ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paged.map((device) => (
                <DeviceRow key={device.id} device={device} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        limit={limit}
        totalItems={totalItems}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <p className="text-xs text-base-content/50">
        แสดง {filtered.length} จาก {devices.length} อุปกรณ์ · อัปเดตอัตโนมัติทุก
        20 วินาที
      </p>
    </div>
  )
}
