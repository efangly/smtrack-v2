import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as devicesApi from '@/lib/api/devices'
import * as hospitalsApi from '@/lib/api/hospitals'

import { DeviceList } from './DeviceList'

jest.mock('@/lib/api/devices')
jest.mock('@/lib/api/hospitals')

let currentSearch = ''
const replace = jest.fn((url: string) => {
  const queryIndex = url.indexOf('?')
  currentSearch = queryIndex === -1 ? '' : url.slice(queryIndex + 1)
})
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(currentSearch),
}))

// ตัวกรองเป็น SearchableSelect (combobox ที่พิมพ์ค้นได้) ไม่ใช่ native select แล้ว
// จึงเลือกค่าด้วยการเปิด panel แล้วคลิก option แทน user.selectOptions()
async function pickOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: string,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }))
  await user.click(screen.getByRole('option', { name: optionName }))
}

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const baseDevice = {
  serial: null,
  staticName: 'static',
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

// อุปกรณ์เก่าเก็บชื่อวอร์ดเป็น free text ส่วนอุปกรณ์ที่ migrate มาใหม่กลับเก็บ
// wardId ลงในฟิลด์เดียวกันแทน — ทั้งสองแบบต้องกรองด้วยโรงพยาบาล/วอร์ดเดียวกันได้
const devices: devicesApi.Device[] = [
  {
    ...baseDevice,
    id: 'd-legacy',
    name: 'legacy-device',
    staticName: 'legacy-static',
    ward: 'ICU',
  },
  {
    ...baseDevice,
    id: 'd-migrated',
    name: 'migrated-device',
    staticName: 'migrated-static',
    ward: 'w-1',
  },
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
    ward: [
      { id: 'w-1', wardName: 'ICU', wardSeq: 1, hosId: 'h-1' },
      { id: 'w-2', wardName: 'OPD', wardSeq: 2, hosId: 'h-1' },
    ],
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  currentSearch = ''
  jest.mocked(devicesApi.getDevices).mockResolvedValue(devices)
  jest.mocked(hospitalsApi.getHospitals).mockResolvedValue(hospitals)
})

describe('DeviceList ward filter', () => {
  it('shows devices whose ward is stored as a name and as a migrated wardId', async () => {
    const user = userEvent.setup()
    renderWithClient(<DeviceList />)

    await screen.findByText('legacy-device')
    expect(screen.getByText('migrated-device')).toBeInTheDocument()

    await pickOption(user, 'กรองตามโรงพยาบาล', 'รพ.ทดสอบ')

    expect(screen.getByText('legacy-device')).toBeInTheDocument()
    expect(screen.getByText('migrated-device')).toBeInTheDocument()
  })
})

describe('DeviceList ward query string sync', () => {
  it('reflects the ward filter into the URL without touching page/limit', async () => {
    const user = userEvent.setup()
    renderWithClient(<DeviceList />)
    await screen.findByText('legacy-device')

    // เลือกโรงพยาบาล -> auto-select ward แรก -> ส่ง ward เดียวลง query
    await pickOption(user, 'กรองตามโรงพยาบาล', 'รพ.ทดสอบ')
    expect(replace).toHaveBeenLastCalledWith('/?ward=w-1', { scroll: false })

    // เลือก ward กลับเป็น ALL -> ส่งทุกวอร์ดของโรงพยาบาลนั้นเป็น query ซ้ำ key เดียวกัน
    await pickOption(user, 'กรองตามวอร์ด', 'ALL')
    expect(replace).toHaveBeenLastCalledWith('/?ward=w-1&ward=w-2', {
      scroll: false,
    })

    // เลือกโรงพยาบาลกลับเป็น ALL -> ไม่ส่ง ward เลย
    await pickOption(user, 'กรองตามโรงพยาบาล', 'ALL')
    expect(replace).toHaveBeenLastCalledWith('/', { scroll: false })
  })
})
