import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as usersApi from '@/lib/api/users'
import * as wardsApi from '@/lib/api/wards'
import { useAuthStore } from '@/store/useAuthStore'
import type { Role } from '@/types/auth'

import { UserList } from './UserList'

jest.mock('@/lib/api/users')
jest.mock('@/lib/api/wards')

// usePaginationParams เรียก useRouter/useSearchParams ซึ่งไม่มี app router ในเทส
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/settings/users',
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

function signInAs(role: Role) {
  useAuthStore.setState({
    token: 'token',
    refreshToken: 'refresh',
    payload: {
      id: 'me',
      name: 'ฉัน',
      role,
      hosId: 'h-1',
      wardId: 'w-1',
    },
  })
}

const users: usersApi.User[] = [
  {
    id: 'u-1',
    wardId: 'w-1',
    username: 'somchai',
    status: true,
    role: 'ADMIN',
    display: 'สมชาย',
    pic: null,
    comment: null,
    createBy: null,
    createAt: '2026-07-01T00:00:00Z',
    updateAt: '2026-07-01T00:00:00Z',
    ward: { id: 'w-1', wardName: 'ICU', hosId: 'h-1' },
  },
  {
    id: 'u-2',
    wardId: 'w-2',
    username: 'malee',
    status: false,
    role: 'USER',
    display: null,
    pic: null,
    comment: null,
    createBy: null,
    createAt: '2026-07-01T00:00:00Z',
    updateAt: '2026-07-01T00:00:00Z',
    ward: { id: 'w-2', wardName: 'OPD', hosId: 'h-1' },
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(usersApi.getUsers).mockResolvedValue(users)
  jest.mocked(wardsApi.getWards).mockResolvedValue([
    {
      id: 'w-1',
      wardName: 'ICU',
      wardSeq: 1,
      type: 'NEW',
      hosId: 'h-1',
      createAt: '2026-07-01T00:00:00Z',
      updateAt: '2026-07-01T00:00:00Z',
    },
  ])
})

describe('UserList', () => {
  it('renders each user with its ward and status', async () => {
    signInAs('SUPER')
    renderWithClient(<UserList />)

    const row = (await screen.findByText('somchai')).closest(
      'tr',
    ) as HTMLElement
    expect(within(row).getByText('ICU')).toBeInTheDocument()
    expect(within(row).getByText('ใช้งาน')).toBeInTheDocument()

    const disabledRow = screen.getByText('malee').closest('tr') as HTMLElement
    expect(within(disabledRow).getByText('ปิดใช้งาน')).toBeInTheDocument()
  })

  it('hides the management column and add button for roles without permission', async () => {
    signInAs('USER')
    renderWithClient(<UserList />)

    await screen.findByText('somchai')
    expect(screen.queryByText('การจัดการ')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'เพิ่มผู้ใช้' }),
    ).not.toBeInTheDocument()
  })

  it('filters the table by keyword', async () => {
    signInAs('SUPER')
    const user = userEvent.setup()
    renderWithClient(<UserList />)

    await screen.findByText('somchai')
    await user.type(
      screen.getByRole('searchbox', { name: 'ค้นหาผู้ใช้' }),
      'malee',
    )

    expect(screen.queryByText('somchai')).not.toBeInTheDocument()
    expect(screen.getByText('malee')).toBeInTheDocument()
  })

  // POST /user รับ JSON เท่านั้น รูปจึงต้องตามไปเป็น PUT อีกครั้งหลังสร้างสำเร็จ
  it('uploads the picture as a second step after creating a user', async () => {
    signInAs('SUPER')
    const created = { ...users[0], id: 'u-new', username: 'newbie' }
    jest.mocked(usersApi.createUser).mockResolvedValue(created)
    jest.mocked(usersApi.updateUser).mockResolvedValue(created)

    const user = userEvent.setup()
    renderWithClient(<UserList />)

    await screen.findByText('somchai')
    await user.click(screen.getByRole('button', { name: 'เพิ่มผู้ใช้' }))

    const dialog = screen
      .getByText('เพิ่มผู้ใช้', { selector: 'h3' })
      .closest('.modal-box') as HTMLElement
    // ช่องที่ยังใช้ <label> แบบไม่ผูก htmlFor ต้องหาตามลำดับ/ชนิดแทน
    await user.type(within(dialog).getAllByRole('textbox')[0], 'newbie')
    await user.type(
      dialog.querySelector('input[type="password"]') as HTMLElement,
      'secret',
    )
    // ช่องวอร์ดเป็น SearchableSelect — เปิด panel แล้วคลิก option
    // (panel ถูก portal ออกไปนอก .modal-box จึงหาด้วย screen ไม่ใช่ within(dialog))
    await user.click(within(dialog).getByLabelText('วอร์ด *'))
    await user.click(screen.getByRole('option', { name: /ICU/ }))

    const pic = new File(['x'], 'avatar.png', { type: 'image/png' })
    await user.upload(within(dialog).getByLabelText('รูปโปรไฟล์'), pic)
    await user.click(within(dialog).getByRole('button', { name: 'บันทึก' }))

    await waitFor(() => expect(usersApi.createUser).toHaveBeenCalled())
    // ขั้นแรกต้องไม่มีรูปติดไปด้วย ไม่งั้น backend จะไม่รับ
    expect(
      jest.mocked(usersApi.createUser).mock.calls[0][0],
    ).not.toHaveProperty('image')
    await waitFor(() =>
      expect(usersApi.updateUser).toHaveBeenCalledWith('u-new', { image: pic }),
    )
  })

  it('does not delete until the confirm dialog is accepted', async () => {
    signInAs('SUPER')
    const user = userEvent.setup()
    renderWithClient(<UserList />)

    await screen.findByText('somchai')
    await user.click(screen.getByRole('button', { name: 'ลบ somchai' }))

    expect(usersApi.deleteUser).not.toHaveBeenCalled()

    const dialog = screen
      .getByText('ยืนยันลบผู้ใช้')
      .closest('.modal-box') as HTMLElement
    await user.click(within(dialog).getByRole('button', { name: 'ลบ' }))

    expect(usersApi.deleteUser).toHaveBeenCalledWith('u-1')
  })
})
