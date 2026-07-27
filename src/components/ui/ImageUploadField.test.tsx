import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ImageUploadField } from './ImageUploadField'

// object URL API ถูก stub ไว้ที่ jest.setup.ts เพราะ jsdom ไม่มีให้

function makeFile(name: string, type: string, sizeBytes: number) {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

/** ห่อด้วย state จริงเพื่อให้ปุ่ม "ล้าง" (ซึ่งโผล่เมื่อมี value) ทำงานได้ */
function Harness({ onChange }: { onChange: (file: File | null) => void }) {
  const [value, setValue] = useState<File | null>(null)
  return (
    <ImageUploadField
      label="รูปโปรไฟล์"
      value={value}
      onChange={(file) => {
        setValue(file)
        onChange(file)
      }}
    />
  )
}

describe('ImageUploadField', () => {
  it('ส่งไฟล์ที่ถูกต้องออกมาทาง onChange', async () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)

    const file = makeFile('avatar.png', 'image/png', 1024)
    await userEvent.upload(screen.getByLabelText('รูปโปรไฟล์'), file)

    expect(onChange).toHaveBeenCalledWith(file)
    expect(screen.getByText('avatar.png')).toBeInTheDocument()
  })

  it('ปฏิเสธไฟล์ที่ไม่ใช่รูปภาพ', async () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)

    // userEvent.upload กรองไฟล์ตาม accept="image/*" ให้ก่อน จึงต้องยิง change ตรงๆ
    // เพื่อทดสอบด่านสองฝั่ง component (เบราว์เซอร์บางตัวก็ปล่อยไฟล์ผิดชนิดผ่าน accept มาได้)
    const input = screen.getByLabelText('รูปโปรไฟล์')
    fireEvent.change(input, {
      target: { files: [makeFile('report.pdf', 'application/pdf', 1024)] },
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('รองรับเฉพาะไฟล์รูปภาพ')
  })

  it('ปฏิเสธไฟล์ที่ใหญ่เกินกำหนด', async () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)

    await userEvent.upload(
      screen.getByLabelText('รูปโปรไฟล์'),
      makeFile('big.png', 'image/png', 3 * 1024 * 1024),
    )

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('ไม่เกิน 2 MB')
  })

  it('ปุ่มล้างคืนค่าเป็น null', async () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)

    await userEvent.upload(
      screen.getByLabelText('รูปโปรไฟล์'),
      makeFile('avatar.png', 'image/png', 1024),
    )
    await userEvent.click(screen.getByRole('button', { name: 'ล้าง' }))

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(
      screen.queryByRole('button', { name: 'ล้าง' }),
    ).not.toBeInTheDocument()
  })
})
