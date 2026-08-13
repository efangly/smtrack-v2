'use client'

import type { ReactNode } from 'react'

import type { Device } from '@/lib/api/devices'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { useWards } from '@/hooks/useWards'
import { resolveDeviceImageUrl } from '@/lib/imageUrl'
import { matchesWard } from '@/lib/wardMatch'

import { DeviceInfoStats } from './DeviceInfoStats'
import { DeviceStatusBadge } from './DeviceStatusBadge'

export function DeviceInfoCard({
  device,
  action,
}: {
  device: Device
  action?: ReactNode
}) {
  const positionPicUrl = resolveDeviceImageUrl(device.positionPic)
  const title = device.name ?? '-'

  const { data: wards, isLoading: isWardsLoading } = useWards(!!device.ward)
  const matchedWard = wards?.find((ward) => matchesWard(device.ward, ward))
  const isWardLoading = !!device.ward && isWardsLoading

  return (
    <Card
      title={title}
      action={
        <div className="flex items-center gap-2">
          <DeviceStatusBadge online={device.online} variant="pill" />
          {action}
        </div>
      }
    >
      {/* รูปอยู่ซ้าย รายละเอียดอยู่ขวา — บนจอเล็กวางซ้อนกันตามปกติ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {positionPicUrl && (
          <figure className="flex shrink-0 flex-col gap-1">
            <Avatar
              src={positionPicUrl}
              alt={`รูปตำแหน่งติดตั้งของ ${title}`}
              shape="square"
              fit="contain"
              size={160}
            />
            <figcaption className="text-xs text-base-content/60">
              รูปตำแหน่งติดตั้ง
            </figcaption>
          </figure>
        )}

        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
          <div>
            <dt className="text-base-content/60">Serial</dt>
            <dd>{device.serial ?? 'ยังไม่มีกล่องเสียบ'}</dd>
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
            <dt className="text-base-content/60">หมายเหตุ</dt>
            <dd>{device.remark ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">วอร์ด</dt>
            <dd>
              {isWardLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                (matchedWard?.wardName ?? '-')
              )}
            </dd>
          </div>
          <div>
            <dt className="text-base-content/60">โรงพยาบาล</dt>
            <dd>
              {isWardLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                (matchedWard?.hospital?.hosName ?? '-')
              )}
            </dd>
          </div>

          <DeviceInfoStats device={device} />
        </dl>
      </div>
    </Card>
  )
}
