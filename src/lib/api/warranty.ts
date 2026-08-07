import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import { fetchAllPages } from '@/lib/api/pagination'

export const WarrantySchema = z.object({
  id: z.string(),
  serial: z.string(),
  devName: z.string().nullable(),
  product: z.string().nullable(),
  model: z.string().nullable(),
  installDate: z.string().nullable(),
  customerName: z.string().nullable(),
  customerAddress: z.string().nullable(),
  saleDepartment: z.string().nullable(),
  invoice: z.string().nullable(),
  expire: z.string(),
  status: z.boolean(),
  note: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Warranty = z.infer<typeof WarrantySchema>

export const CreateWarrantySchema = z.object({
  serial: z.string().min(1),
  devName: z.string().optional(),
  product: z.string().optional(),
  model: z.string().optional(),
  installDate: z.string().optional(),
  customerName: z.string().optional(),
  customerAddress: z.string().optional(),
  saleDepartment: z.string().optional(),
  invoice: z.string().optional(),
  expire: z.string().optional(),
  status: z.boolean().optional(),
  note: z.string().optional(),
})
export type CreateWarrantyInput = z.infer<typeof CreateWarrantySchema>
export type UpdateWarrantyInput = Partial<CreateWarrantyInput>

export async function getWarranties(
  params: { search?: string; expiringSoon?: boolean } = {},
): Promise<Warranty[]> {
  return fetchAllPages(async (pageParams) => {
    const { data } = await apiClient.get('/warranties', {
      params: { ...pageParams, ...params },
    })
    return z.array(WarrantySchema).parse(data)
  })
}

export async function createWarranty(
  dto: CreateWarrantyInput,
): Promise<Warranty> {
  const { data } = await apiClient.post('/warranties', dto)
  return WarrantySchema.parse(data)
}

export async function updateWarranty(
  id: string,
  dto: UpdateWarrantyInput,
): Promise<Warranty> {
  const { data } = await apiClient.put(
    `/warranties/${encodeURIComponent(id)}`,
    dto,
  )
  return WarrantySchema.parse(data)
}

export async function deleteWarranty(id: string): Promise<Warranty> {
  const { data } = await apiClient.delete(
    `/warranties/${encodeURIComponent(id)}`,
  )
  return WarrantySchema.parse(data)
}
