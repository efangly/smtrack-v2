import { Badge } from '@/components/ui/Badge'

export function DeviceStatusBadge({ online }: { online: boolean }) {
  return (
    <Badge tone={online ? 'success' : 'error'}>
      {online ? 'ออนไลน์' : 'ออฟไลน์'}
    </Badge>
  )
}
