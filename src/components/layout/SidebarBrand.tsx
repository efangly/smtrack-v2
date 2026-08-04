'use client'

import Link from 'next/link'
import { Hospital } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { resolveApiImageUrl } from '@/lib/imageUrl'

export function SidebarBrand() {
  const { data: user, hydrated } = useCurrentUser()

  const hospital = user?.ward?.hospital
  const logoUrl = hydrated ? resolveApiImageUrl(hospital?.hosPic) : null

  return (
    <div className="flex items-center gap-3 border-b border-base-300 bg-linear-to-b from-primary/5 to-transparent px-5 py-4">
      <Avatar
        src={logoUrl}
        alt={hospital?.hosName ?? 'โลโก้โรงพยาบาล'}
        shape="square"
        fit="contain"
        fallback={
          <span className="flex h-full w-full items-center justify-center bg-primary text-primary-content">
            <Hospital className="h-5 w-5" aria-hidden="true" />
          </span>
        }
      />

      <div className="min-w-0">
        <Link href="/" className="block truncate font-semibold text-xl">
          SMtrack Dashboard
        </Link>
        <span className="block truncate text-xs text-base-content/50">
          {hospital?.hosName ?? 'IoT telemetry monitoring'}
        </span>
      </div>
    </div>
  )
}
