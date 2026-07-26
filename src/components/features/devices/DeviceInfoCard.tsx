import type { ReactNode } from 'react'

import type { Device } from '@/lib/api/devices'
import { Card } from '@/components/ui/Card'

import { DeviceStatusBadge } from './DeviceStatusBadge'

export function DeviceInfoCard({
  device,
  action,
}: {
  device: Device
  action?: ReactNode
}) {
  return (
    <Card title={device.name ?? device.staticName} action={action}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
        <div>
          <dt className="text-base-content/60">Serial</dt>
          <dd>{device.serial ?? 'ยังไม่มีกล่องเสียบ'}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">Ward</dt>
          <dd>{device.ward}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">Firmware</dt>
          <dd>{device.hardware?.firmware ?? '-'}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">ตำแหน่ง</dt>
          <dd>{device.position ?? '-'}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">สถานะ</dt>
          <dd>
            <DeviceStatusBadge online={device.online} />
          </dd>
        </div>
        <div>
          <dt className="text-base-content/60">หมายเหตุ</dt>
          <dd>{device.remark ?? '-'}</dd>
        </div>
      </dl>
    </Card>
  )
}
