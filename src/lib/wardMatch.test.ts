import { matchesWard } from './wardMatch'

describe('matchesWard', () => {
  const ward = { id: 'WID-123', wardName: 'ICU' }

  it('match กับ ward id แบบ case-insensitive', () => {
    expect(matchesWard('WID-123', ward)).toBe(true)
    expect(matchesWard('wid-123', ward)).toBe(true)
  })

  it('match กับชื่อวอร์ด (ข้อมูลเก่า) แบบ case-insensitive', () => {
    expect(matchesWard('ICU', ward)).toBe(true)
    expect(matchesWard('icu', ward)).toBe(true)
  })

  it('ตัดช่องว่างหัวท้ายก่อนเทียบ', () => {
    expect(matchesWard('  ICU  ', ward)).toBe(true)
  })

  it('ไม่ match เมื่อไม่ตรงทั้ง id และชื่อ', () => {
    expect(matchesWard('OPD', ward)).toBe(false)
    expect(matchesWard('WID-999', ward)).toBe(false)
  })
})
