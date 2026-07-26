import { z } from 'zod'

import { authApiClient } from '@/lib/apiClient'

export const WardTypeSchema = z.enum(['NEW', 'LEGACY'])
export type WardType = z.infer<typeof WardTypeSchema>

export const WARD_TYPE_OPTIONS = WardTypeSchema.options

export const WARD_TYPE_LABELS: Record<WardType, string> = {
  NEW: 'ระบบใหม่',
  LEGACY: 'ระบบเดิม',
}

// โรงพยาบาลที่ backend preload มากับวอร์ด — ใช้แค่ชื่อในการแสดงผล จึงไม่ต้อง
// parse ทุก field ของ HospitalSchema (และเลี่ยง import วนไปมาระหว่างสองไฟล์)
const WardHospitalSchema = z.object({
  id: z.string(),
  hosName: z.string(),
})

export const WardSchema = z.object({
  id: z.string(),
  wardName: z.string(),
  wardSeq: z.number(),
  type: WardTypeSchema.nullable(),
  hosId: z.string(),
  createAt: z.string(),
  updateAt: z.string(),
  hospital: WardHospitalSchema.nullish(),
})
export type Ward = z.infer<typeof WardSchema>

export const WardInputSchema = z.object({
  wardName: z.string().min(1, 'กรุณากรอกชื่อวอร์ด').max(150),
  wardSeq: z.number().int().optional(),
  type: WardTypeSchema.optional(),
  hosId: z.string().min(1, 'กรุณาเลือกโรงพยาบาล').max(100),
})
export type WardInput = z.infer<typeof WardInputSchema>

export async function getWards(): Promise<Ward[]> {
  const { data } = await authApiClient.get('/ward')
  return z.array(WardSchema).parse(data)
}

export async function getWard(id: string): Promise<Ward> {
  const { data } = await authApiClient.get(`/ward/${encodeURIComponent(id)}`)
  return WardSchema.parse(data)
}

export async function createWard(dto: WardInput): Promise<Ward> {
  const { data } = await authApiClient.post('/ward', dto)
  return WardSchema.parse(data)
}

export async function updateWard(
  id: string,
  dto: Partial<WardInput>,
): Promise<Ward> {
  const { data } = await authApiClient.put(
    `/ward/${encodeURIComponent(id)}`,
    dto,
  )
  return WardSchema.parse(data)
}

// ต่างจาก resource อื่น — WardService.Remove คืนเป็นข้อความ ไม่ใช่ entity ที่ถูกลบ
export async function deleteWard(id: string): Promise<string> {
  const { data } = await authApiClient.delete(
    `/ward/${encodeURIComponent(id)}`,
  )
  return z.string().parse(data)
}
