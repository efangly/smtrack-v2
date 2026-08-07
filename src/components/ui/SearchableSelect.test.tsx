import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import {
  SearchableSelect,
  type SearchableSelectOption,
} from './SearchableSelect'

const options: SearchableSelectOption[] = [
  { value: 'w-1', label: 'ICU', hint: 'รพ.สงขลา' },
  { value: 'w-2', label: 'OPD', hint: 'รพ.หาดใหญ่' },
  { value: 'w-3', label: 'ER', hint: 'รพ.สงขลา' },
]

function Harness({
  onChange,
  disabled,
}: {
  onChange?: (value: string) => void
  disabled?: boolean
}) {
  const [value, setValue] = useState('')
  return (
    <SearchableSelect
      ariaLabel="เลือกวอร์ด"
      options={options}
      value={value}
      disabled={disabled}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

function combobox() {
  return screen.getByRole('combobox', { name: 'เลือกวอร์ด' })
}

it('shows every option when opened', async () => {
  const user = userEvent.setup()
  render(<Harness />)

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  await user.click(combobox())

  expect(screen.getAllByRole('option')).toHaveLength(3)
})

it('filters by label and by hint', async () => {
  const user = userEvent.setup()
  render(<Harness />)

  await user.click(combobox())
  await user.type(combobox(), 'ic')
  expect(screen.getAllByRole('option')).toHaveLength(1)
  expect(screen.getByRole('option')).toHaveTextContent('ICU')

  // ค้นด้วยชื่อโรงพยาบาล (hint) ต้องเจอทุกวอร์ดของโรงพยาบาลนั้น
  await user.clear(combobox())
  await user.type(combobox(), 'สงขลา')
  expect(screen.getAllByRole('option')).toHaveLength(2)

  await user.clear(combobox())
  await user.type(combobox(), 'ไม่มีจริง')
  expect(screen.queryAllByRole('option')).toHaveLength(0)
  expect(screen.getByText('ไม่พบรายการที่ตรงกับคำค้น')).toBeInTheDocument()
})

it('selects by click and shows the label in the input', async () => {
  const onChange = jest.fn()
  const user = userEvent.setup()
  render(<Harness onChange={onChange} />)

  await user.click(combobox())
  await user.click(screen.getByRole('option', { name: /OPD/ }))

  expect(onChange).toHaveBeenCalledWith('w-2')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(combobox()).toHaveValue('OPD')
})

it('selects with arrow keys and Enter', async () => {
  const onChange = jest.fn()
  const user = userEvent.setup()
  render(<Harness onChange={onChange} />)

  await user.tab()
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

  expect(onChange).toHaveBeenCalledWith('w-3')
  expect(combobox()).toHaveValue('ER')
})

it('restores the selected value when Escape closes the panel', async () => {
  const user = userEvent.setup()
  render(<Harness />)

  await user.click(combobox())
  await user.click(screen.getByRole('option', { name: /ICU/ }))

  await user.click(combobox())
  await user.type(combobox(), 'OP')
  await user.keyboard('{Escape}')

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(combobox()).toHaveValue('ICU')
})

it('does not open when disabled', async () => {
  const user = userEvent.setup()
  render(<Harness disabled />)

  await user.click(combobox())
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})
