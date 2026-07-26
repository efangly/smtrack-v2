import { z } from 'zod'

import { authApiClient } from '@/lib/apiClient'
import { hasFile, toFormData } from '@/lib/api/formData'
import { RoleSchema } from '@/types/auth'

// วอร์ดที่ backend preload มากับผู้ใช้ — GET /user ให้แค่ ward, ส่วน GET /user/:id
// ให้ ward.hospital มาด้วย จึงทำ hospital เป็น optional เพื่อ parse ได้ทั้งสองรูปแบบ
const UserWardSchema = z.object({
  id: z.string().optional(),
  wardName: z.string(),
  hosId: z.string(),
  hospital: z
    .object({
      hosName: z.string(),
      hosPic: z.string().nullish(),
    })
    .nullish(),
})

export const UserSchema = z.object({
  id: z.string(),
  wardId: z.string(),
  username: z.string(),
  status: z.boolean(),
  role: RoleSchema,
  display: z.string().nullable(),
  pic: z.string().nullable(),
  comment: z.string().nullable(),
  createBy: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
  ward: UserWardSchema.nullish(),
})
export type User = z.infer<typeof UserSchema>

export const CreateUserInputSchema = z.object({
  wardId: z.string().min(1, 'กรุณาเลือกวอร์ด').max(100),
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้')
    .max(40, 'ชื่อผู้ใช้ยาวไม่เกิน 40 ตัวอักษร'),
  password: z
    .string()
    .min(4, 'รหัสผ่านอย่างน้อย 4 ตัวอักษร')
    .max(20, 'รหัสผ่านยาวไม่เกิน 20 ตัวอักษร'),
  status: z.boolean().optional(),
  role: RoleSchema.optional(),
  display: z.string().min(1).max(50).optional(),
  comment: z.string().max(255).optional(),
})
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>

export const UpdateUserInputSchema = CreateUserInputSchema.partial()
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema> & {
  /** รูปโปรไฟล์ — backend อ่านจาก form field ชื่อ `image` แล้วเก็บผลลัพธ์ลง pic */
  image?: File
}

export const ResetPasswordInputSchema = z.object({
  password: z
    .string()
    .min(4, 'รหัสผ่านอย่างน้อย 4 ตัวอักษร')
    .max(20, 'รหัสผ่านยาวไม่เกิน 20 ตัวอักษร'),
  oldPassword: z.string().min(4).max(20).optional(),
})
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>

export async function getUsers(): Promise<User[]> {
  const { data } = await authApiClient.get('/user')
  return z.array(UserSchema).parse(data)
}

export async function getUser(id: string): Promise<User> {
  const { data } = await authApiClient.get(`/user/${encodeURIComponent(id)}`)
  return UserSchema.parse(data)
}

// POST /user รับ JSON เท่านั้น — handler ฝั่ง backend ไม่ได้อ่าน FormFile
// การตั้งรูปโปรไฟล์จึงต้องทำเป็นขั้นที่สองผ่าน updateUser
export async function createUser(dto: CreateUserInput): Promise<User> {
  const { data } = await authApiClient.post('/user', dto)
  return UserSchema.parse(data)
}

export async function updateUser(
  id: string,
  dto: UpdateUserInput,
): Promise<User> {
  const { data } = await authApiClient.put(
    `/user/${encodeURIComponent(id)}`,
    hasFile(dto) ? toFormData(dto) : dto,
  )
  return UserSchema.parse(data)
}

export async function deleteUser(id: string): Promise<User> {
  const { data } = await authApiClient.delete(`/user/${encodeURIComponent(id)}`)
  return UserSchema.parse(data)
}

// PATCH /auth/reset/:id — ผู้ใช้ทั่วไปต้องส่ง oldPassword มายืนยัน ส่วน admin
// ที่รีเซ็ตรหัสของคนอื่นส่งแค่ password ก็พอ ผลลัพธ์เป็นข้อความ ไม่ใช่ entity
export async function resetPassword(
  id: string,
  dto: ResetPasswordInput,
): Promise<string> {
  const { data } = await authApiClient.patch(
    `/reset/${encodeURIComponent(id)}`,
    dto,
  )
  return z.string().parse(data)
}
