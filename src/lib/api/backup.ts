import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import { isMonthString } from '@/lib/utils'

export const BackupMonthSchema = z.object({
  month: z.string(),
  sizeBytes: z.number(),
  restored: z.boolean(),
})
export type BackupMonth = z.infer<typeof BackupMonthSchema>

export const ExportResultSchema = z.object({
  month: z.string(),
  rowCount: z.number(),
  sha256: z.string(),
  exportedAt: z.string(),
})
export type ExportResult = z.infer<typeof ExportResultSchema>

export const RestoreResultSchema = z.object({
  month: z.string(),
  rowCount: z.number(),
  objectKey: z.string(),
})
export type RestoreResult = z.infer<typeof RestoreResultSchema>

export const RemoveRestoreResultSchema = z.object({
  month: z.string(),
  removedRows: z.number(),
})
export type RemoveRestoreResult = z.infer<typeof RemoveRestoreResultSchema>

function assertMonthString(month: string): void {
  if (!isMonthString(month)) {
    throw new Error(`Invalid month format: "${month}", expected YYYY-MM`)
  }
}

export async function getBackupMonths(): Promise<BackupMonth[]> {
  const { data } = await apiClient.get('/backup/months')
  return z.array(BackupMonthSchema).parse(data)
}

export async function exportMonth(month: string): Promise<ExportResult> {
  assertMonthString(month)
  const { data } = await apiClient.post(`/backup/exports/${month}`)
  return ExportResultSchema.parse(data)
}

export async function restoreMonth(month: string): Promise<RestoreResult> {
  assertMonthString(month)
  const { data } = await apiClient.post(`/backup/restores/${month}`)
  return RestoreResultSchema.parse(data)
}

export async function removeRestoreMonth(
  month: string,
): Promise<RemoveRestoreResult> {
  assertMonthString(month)
  const { data } = await apiClient.delete(`/backup/restores/${month}`)
  return RemoveRestoreResultSchema.parse(data)
}
