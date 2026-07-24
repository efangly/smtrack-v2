import { Card } from '@/components/ui/Card'
import { BackupMonthsTable } from '@/components/features/backup/BackupMonthsTable'
import { ExportMonthPicker } from '@/components/features/backup/ExportMonthPicker'

export default function BackupPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Backup / Archive</h1>

      <Card title="Export เดือนที่ยังไม่มีในรายการ">
        <ExportMonthPicker />
      </Card>

      <Card title="เดือนที่มีการ backup">
        <BackupMonthsTable />
      </Card>
    </div>
  )
}
