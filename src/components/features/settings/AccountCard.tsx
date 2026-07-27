'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUpdateUser } from '@/hooks/useUpdateUser'
import { resolveApiImageUrl } from '@/lib/imageUrl'
import { ROLE_LABELS } from '@/types/auth'

export function AccountCard() {
  const { data: user, payload, hydrated } = useCurrentUser()
  const updateUser = useUpdateUser()
  const [pic, setPic] = useState<File | null>(null)

  if (!hydrated || !payload) {
    return (
      <span className="text-sm text-base-content/60">ไม่พบข้อมูลผู้ใช้</span>
    )
  }

  const displayName = user?.display ?? payload.name

  const rows: { label: string; value: string }[] = [
    { label: 'ชื่อผู้ใช้', value: user?.username ?? '-' },
    { label: 'ชื่อที่แสดง', value: displayName },
    { label: 'วอร์ด', value: user?.ward?.wardName ?? payload.wardId },
    {
      label: 'โรงพยาบาล',
      value: user?.ward?.hospital?.hosName ?? payload.hosId,
    },
  ]

  // บันทึกเฉพาะรูป — useUpdateUser invalidate ['users', id] ซึ่งเป็น query เดียวกับที่
  // useCurrentUser ใช้ รูปใหม่จึงขึ้นเองทั้งการ์ดนี้และ sidebar โดยไม่ต้อง refresh
  const savePic = () => {
    if (!pic) return
    updateUser.mutate(
      { id: payload.id, dto: { image: pic } },
      { onSuccess: () => setPic(null) },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <ImageUploadField
          label="รูปโปรไฟล์"
          currentUrl={resolveApiImageUrl(user?.pic)}
          value={pic}
          onChange={setPic}
          shape="circle"
          size={96}
          fallback={
            <span className="text-2xl font-semibold uppercase">
              {displayName.trim().charAt(0) || '?'}
            </span>
          }
          disabled={updateUser.isPending}
        />

        {pic && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={savePic}
            disabled={updateUser.isPending}
          >
            {updateUser.isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
            บันทึกรูป
          </button>
        )}
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-base-content/60">{row.label}</dt>
            <dd className="font-medium break-words">{row.value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs text-base-content/60">สิทธิ์</dt>
          <dd className="mt-0.5">
            <Badge tone="info">{ROLE_LABELS[payload.role]}</Badge>
          </dd>
        </div>
      </dl>
    </div>
  )
}
