import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Card } from '@/components/ui/Card'
import { BackupMonthsTable } from '@/components/features/backup/BackupMonthsTable'
import { ExportMonthPicker } from '@/components/features/backup/ExportMonthPicker'

export const metadata: Metadata = { title: 'Backup / Archive | SMtrack' }

export default function BackupPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card title="Export เดือนที่ยังไม่มีในรายการ">
        <ExportMonthPicker />
      </Card>

      <Card title="เดือนที่มีการ backup">
        <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
          <BackupMonthsTable />
        </Suspense>
      </Card>
    </div>
  )
}
