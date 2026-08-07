import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BackupMonthsTable } from './BackupMonthsTable'
import * as backupApi from '@/lib/api/backup'

jest.mock('@/lib/api/backup')

// usePaginationParams เรียก useRouter/useSearchParams ซึ่งไม่มี app router ในเทส
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/settings/backup',
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('BackupMonthsTable', () => {
  beforeEach(() => {
    jest.mocked(backupApi.getBackupMonths).mockResolvedValue([
      { month: '2026-05', sizeBytes: 1024, restored: false },
      { month: '2026-06', sizeBytes: 2048, restored: true },
    ])
  })

  it('disables Restore for an already-restored month and enables remove-restore', async () => {
    renderWithClient(<BackupMonthsTable />)

    const restoredRow = (await screen.findByText('2026-06')).closest(
      'tr',
    ) as HTMLElement
    const restoreButton = within(restoredRow).getByRole('button', {
      name: 'Restore',
    })
    const removeButton = within(restoredRow).getByRole('button', {
      name: 'ลบ restore',
    })

    expect(restoreButton).toBeDisabled()
    expect(removeButton).not.toBeDisabled()
  })

  it('does not fire the export mutation until the confirm dialog is accepted', async () => {
    const user = userEvent.setup()
    renderWithClient(<BackupMonthsTable />)

    const row = (await screen.findByText('2026-05')).closest(
      'tr',
    ) as HTMLElement
    await user.click(within(row).getByRole('button', { name: 'Export' }))

    expect(backupApi.exportMonth).not.toHaveBeenCalled()

    const dialog = screen
      .getByText('ยืนยัน Export')
      .closest('.modal-box') as HTMLElement
    await user.click(within(dialog).getByRole('button', { name: 'Export' }))

    expect(backupApi.exportMonth).toHaveBeenCalledWith('2026-05')
  })
})
