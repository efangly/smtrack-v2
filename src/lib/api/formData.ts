// backend หลายตัวรับ multipart/form-data เมื่อ payload มีไฟล์แนบ (positionPic ของ
// อุปกรณ์, `image` ของ user/hospital) — axios จะถอด Content-Type: application/json
// ให้เองเมื่อเจอ body เป็น FormData จึงไม่ต้องเซ็ต header เพิ่ม
export function toFormData(input: Record<string, unknown>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue
    formData.append(key, value instanceof File ? value : String(value))
  }
  return formData
}

/** true เมื่อ payload มีไฟล์แนบอยู่ — ใช้เลือกว่าจะส่ง multipart หรือ JSON */
export function hasFile(input: Record<string, unknown>): boolean {
  return Object.values(input).some((value) => value instanceof File)
}
