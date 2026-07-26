import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { DeviceInfoCard } from '@/components/features/devices/DeviceInfoCard'
import { DeviceConfigPanel } from '@/components/features/devices/DeviceConfigPanel'
import { ProbeList } from '@/components/features/devices/ProbeList'
import { RepairList } from '@/components/features/devices/RepairList'
import { DeviceAuditTable } from '@/components/features/devices/DeviceAuditTable'
import { SwapDeviceDialog } from '@/components/features/devices/SwapDeviceDialog'
import { TelemetryGraph } from '@/components/features/telemetry/TelemetryGraph'
import { TelemetryTable } from '@/components/features/telemetry/TelemetryTable'
import { TelemetryLiveFeed } from '@/components/features/telemetry/TelemetryLiveFeed'
import { DailyRollupChart } from '@/components/features/logday/DailyRollupChart'
import { NotificationList } from '@/components/features/notifications/NotificationList'
import { NotificationLiveFeed } from '@/components/features/notifications/NotificationLiveFeed'
import { getDeviceByStaticName } from '@/lib/api/devices'
import { ApiError } from '@/lib/apiClient'
import { TOKEN_COOKIE_NAME } from '@/lib/authToken'

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ serial: string }>
}) {
  // ค่านี้คือ staticName ของจุดติดตั้ง — ใช้แทน serial ของกล่องฮาร์ดแวร์เพราะ
  // serial อาจว่างได้ถ้ายังไม่มีกล่องเสียบอยู่ ส่วน staticName คงที่เสมอ
  const { serial: rawStaticName } = await params
  // ค่านี้มาจาก URL ที่ DeviceList เข้ารหัสด้วย encodeURIComponent ไว้แล้ว
  // (เช่น "Fridge 1 (test-postman-001)" -> "Fridge%201%20(test-postman-001)")
  // แต่ Next ไม่ decode ให้อัตโนมัติ — ต้อง decode ก่อน ไม่งั้น encodeURIComponent
  // ใน getDeviceByStaticName จะเข้ารหัสซ้ำซ้อนแล้วหา backend ไม่เจอ
  const staticName = decodeURIComponent(rawStaticName)

  // apiClient แนบ Authorization header จาก localStorage เท่านั้น ซึ่งไม่มีอยู่
  // ฝั่ง server — ต้องอ่าน token จาก cookie เดียวกันแล้วแนบ header เองที่นี่
  const token = (await cookies()).get(TOKEN_COOKIE_NAME)?.value
  const device = await getDeviceByStaticName(
    staticName,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  ).catch((error: unknown) => {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound()
    }
    throw error
  })
  const serial = device.serial ?? ''

  return (
    <div className="flex flex-col gap-6">
      <DeviceInfoCard
        device={device}
        action={<SwapDeviceDialog staticName={device.staticName} />}
      />

      <Card title="กราฟอุณหภูมิ/ความชื้น">
        <TelemetryGraph serial={serial} />
      </Card>

      <Card title="สรุปรายวัน">
        <DailyRollupChart serial={serial} />
      </Card>

      <Card
        title="ข้อมูล telemetry ล่าสุด"
        action={<TelemetryLiveFeed serial={serial} />}
      >
        <TelemetryTable serial={serial} />
      </Card>

      <Card
        title="การแจ้งเตือน"
        action={<NotificationLiveFeed serial={serial} />}
      >
        <NotificationList serial={serial} />
      </Card>

      <Card title="การตั้งค่าอุปกรณ์">
        <DeviceConfigPanel deviceId={device.id} />
      </Card>

      <Card title="โพรบ">
        <ProbeList deviceId={device.id} />
      </Card>

      <Card title="ประวัติการซ่อม">
        <RepairList serial={serial} />
      </Card>

      <Card title="ประวัติการแก้ไข">
        <DeviceAuditTable staticName={device.staticName} />
      </Card>
    </div>
  )
}
