'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'

// แสดงรูปจาก backend พร้อม fallback เมื่อไม่มีรูปหรือโหลดไม่ขึ้น
// ใช้ unoptimized เพราะ next.config.ts ยังไม่ได้ประกาศ images.remotePatterns
export function Avatar({
  src,
  alt,
  size = 40,
  shape = 'circle',
  fit = 'cover',
  fallback,
  className = '',
}: {
  /** URL ที่ผ่าน resolveApiImageUrl มาแล้ว */
  src: string | null
  alt: string
  size?: number
  shape?: 'circle' | 'square'
  /** โลโก้ใช้ contain เพื่อไม่ให้ถูกครอบตัด ส่วนรูปคนใช้ cover */
  fit?: 'cover' | 'contain'
  /** ค่าเริ่มต้นคือตัวอักษรแรกของ alt */
  fallback?: ReactNode
  className?: string
}) {
  // เก็บ src ที่โหลดพัง ไม่ใช่ boolean — พอเปลี่ยนรูปใหม่จะได้กลับไปลองโหลดเอง
  // โดยไม่ต้อง reset ผ่าน effect
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = !!src && failedSrc === src

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-xl'
  const box = `flex shrink-0 items-center justify-center overflow-hidden ${radius} ${className}`
  const style = { width: size, height: size }

  if (!src || failed) {
    return (
      <span
        className={`${box} bg-base-200 text-base-content/60`}
        style={style}
        aria-hidden={fallback ? undefined : true}
      >
        {fallback ?? (
          <span
            className="font-semibold uppercase"
            style={{ fontSize: Math.max(11, Math.round(size * 0.4)) }}
          >
            {alt.trim().charAt(0) || '?'}
          </span>
        )}
      </span>
    )
  }

  return (
    <span className={`${box} bg-base-200`} style={style}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={style}
        className={fit === 'contain' ? 'object-contain' : 'object-cover'}
        onError={() => setFailedSrc(src)}
        unoptimized
      />
    </span>
  )
}
