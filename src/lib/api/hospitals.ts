import { z } from 'zod'

import { authApiClient } from '@/lib/apiClient'
import { hasFile, toFormData } from '@/lib/api/formData'

export const HosTypeSchema = z.enum([
  'HOSPITAL',
  'LEGACY',
  'CLINIC',
  'PHARMACY',
  'LAB',
  'OTHER',
])
export type HosType = z.infer<typeof HosTypeSchema>

export const HOS_TYPE_OPTIONS = HosTypeSchema.options

export const HOS_TYPE_LABELS: Record<HosType, string> = {
  HOSPITAL: 'โรงพยาบาล',
  LEGACY: 'ระบบเดิม',
  CLINIC: 'คลินิก',
  PHARMACY: 'ร้านขายยา',
  LAB: 'แล็บ',
  OTHER: 'อื่นๆ',
}

// วอร์ดที่ติดมากับโรงพยาบาล — backend preload ให้ใต้ key `ward` (เป็น array แม้ชื่อจะเอกพจน์)
// และใส่ `omitempty` ไว้ จึงอาจไม่มี key นี้เลยเมื่อโรงพยาบาลยังไม่มีวอร์ด
const HospitalWardSchema = z.object({
  id: z.string(),
  wardName: z.string(),
  wardSeq: z.number(),
  hosId: z.string(),
})

export const HospitalSchema = z.object({
  id: z.string(),
  hosName: z.string(),
  hosSeq: z.number(),
  hosAddress: z.string().nullable(),
  hosTel: z.string().nullable(),
  userContact: z.string().nullable(),
  userTel: z.string().nullable(),
  hosLatitude: z.string().nullable(),
  hosLongitude: z.string().nullable(),
  hosPic: z.string().nullable(),
  hosType: HosTypeSchema,
  createAt: z.string(),
  updateAt: z.string(),
  ward: z.array(HospitalWardSchema).nullish(),
})
export type Hospital = z.infer<typeof HospitalSchema>

export const HospitalInputSchema = z.object({
  hosName: z.string().min(1, 'กรุณากรอกชื่อโรงพยาบาล').max(150),
  hosSeq: z.number().int().optional(),
  hosAddress: z.string().max(255).optional(),
  hosTel: z.string().max(255).optional(),
  userContact: z.string().max(255).optional(),
  userTel: z.string().max(20).optional(),
  hosLatitude: z.string().max(255).optional(),
  hosLongitude: z.string().max(255).optional(),
  hosType: HosTypeSchema.optional(),
})
export type HospitalInput = z.infer<typeof HospitalInputSchema> & {
  /** ไฟล์รูปโรงพยาบาล — backend อ่านจาก form field ชื่อ `image` แล้วเก็บผลลัพธ์ลง hosPic */
  image?: File
}

export async function getHospitals(): Promise<Hospital[]> {
  const { data } = await authApiClient.get('/hospital')
  return z.array(HospitalSchema).parse(data)
}

export async function getHospital(id: string): Promise<Hospital> {
  const { data } = await authApiClient.get(
    `/hospital/${encodeURIComponent(id)}`,
  )
  return HospitalSchema.parse(data)
}

export async function createHospital(dto: HospitalInput): Promise<Hospital> {
  const { data } = await authApiClient.post(
    '/hospital',
    hasFile(dto) ? toFormData(dto) : dto,
  )
  return HospitalSchema.parse(data)
}

export async function updateHospital(
  id: string,
  dto: Partial<HospitalInput>,
): Promise<Hospital> {
  const { data } = await authApiClient.put(
    `/hospital/${encodeURIComponent(id)}`,
    hasFile(dto) ? toFormData(dto) : dto,
  )
  return HospitalSchema.parse(data)
}

export async function deleteHospital(id: string): Promise<Hospital> {
  const { data } = await authApiClient.delete(
    `/hospital/${encodeURIComponent(id)}`,
  )
  return HospitalSchema.parse(data)
}
