import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import * as devicesApi from '@/lib/api/devices'
import * as hospitalsApi from '@/lib/api/hospitals'

import { useHospitalDeviceStats } from './useHospitalDeviceStats'

jest.mock('@/lib/api/devices')
jest.mock('@/lib/api/hospitals')

const baseDevice = {
  serial: null,
  staticName: 'static',
  name: null,
  status: true,
  seq: 1,
  location: null,
  remark: null,
  position: null,
  positionPic: null,
  online: true,
  tag: null,
  hardware: null,
  createAt: '2026-07-01T00:00:00Z',
  updateAt: '2026-07-01T00:00:00Z',
}

const devices: devicesApi.Device[] = [
  { ...baseDevice, id: 'd-1', ward: 'ICU', online: true },
  { ...baseDevice, id: 'd-2', ward: 'w-1', online: true },
  { ...baseDevice, id: 'd-3', ward: 'w-1', online: false },
  { ...baseDevice, id: 'd-4', ward: 'unmatched-ward', online: true },
]

const hospitals: hospitalsApi.Hospital[] = [
  {
    id: 'h-1',
    hosName: 'รพ.ทดสอบ',
    hosSeq: 1,
    hosAddress: null,
    hosTel: null,
    userContact: null,
    userTel: null,
    hosLatitude: null,
    hosLongitude: null,
    hosPic: null,
    hosType: 'HOSPITAL',
    createAt: '2026-07-01T00:00:00Z',
    updateAt: '2026-07-01T00:00:00Z',
    ward: [{ id: 'w-1', wardName: 'ICU', wardSeq: 1, hosId: 'h-1' }],
  },
  {
    id: 'h-2',
    hosName: 'รพ.ไม่มีวอร์ด',
    hosSeq: 2,
    hosAddress: null,
    hosTel: null,
    userContact: null,
    userTel: null,
    hosLatitude: null,
    hosLongitude: null,
    hosPic: null,
    hosType: 'HOSPITAL',
    createAt: '2026-07-01T00:00:00Z',
    updateAt: '2026-07-01T00:00:00Z',
    ward: [],
  },
]

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(devicesApi.getDevices).mockResolvedValue(devices)
  jest.mocked(hospitalsApi.getHospitals).mockResolvedValue(hospitals)
})

describe('useHospitalDeviceStats', () => {
  it('รวมจำนวนอุปกรณ์ online/offline ต่อโรงพยาบาลผ่าน ward id และชื่อวอร์ด', async () => {
    const { result } = renderHook(() => useHospitalDeviceStats(), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // d-1 (ward='ICU' ชื่อ) + d-2 (ward='w-1' id) online, d-3 (ward='w-1') offline
    expect(result.current.statsByHospitalId.get('h-1')).toEqual({
      online: 2,
      offline: 1,
      total: 3,
    })
  })

  it('ข้ามโรงพยาบาลที่ไม่มีวอร์ด (ไม่มีทางจับคู่กับอุปกรณ์ได้)', async () => {
    const { result } = renderHook(() => useHospitalDeviceStats(), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.statsByHospitalId.has('h-2')).toBe(false)
  })
})
