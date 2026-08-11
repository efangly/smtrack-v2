// device.ward (log service) เป็น free text คนละชุดกับ Ward ของ auth service —
// ไม่มี wardId/hosId ผูกกับ device จริง ข้อมูลเก่าเก็บเป็น "ชื่อวอร์ด" แต่ข้อมูล
// ที่ migrate มาใหม่บางส่วนกลับเก็บ wardId (เช่น "WID-xxxx") ลงในฟิลด์เดียวกัน
// จึงต้องเทียบกับได้ทั้ง id และชื่อ (case-insensitive) ไม่ใช่ชื่ออย่างเดียว
export function matchesWard(
  deviceWard: string,
  ward: { id: string; wardName: string },
): boolean {
  const normalized = deviceWard.trim().toLowerCase()
  return (
    normalized === ward.id.toLowerCase() ||
    normalized === ward.wardName.trim().toLowerCase()
  )
}
