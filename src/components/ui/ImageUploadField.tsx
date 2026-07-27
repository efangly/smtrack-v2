'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ImagePlus } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'

// ช่องอัปโหลดรูปที่ใช้ร่วมกันทุกเมนู (บัญชีของฉัน, จัดการผู้ใช้, จัดการอุปกรณ์)
// เป็น controlled component ล้วน ไม่ผูกกับ react-hook-form เพื่อให้ใช้ได้ทั้งในฟอร์ม
// (ครอบด้วย <Controller>) และนอกฟอร์ม (useState ธรรมดา)
export function ImageUploadField({
  label,
  currentUrl,
  value,
  onChange,
  shape = 'circle',
  size = 96,
  fit,
  fallback,
  disabled,
  maxSizeMB = 2,
  accept = 'image/*',
  hint,
}: {
  label?: string
  /** รูปเดิมจาก API (ผ่าน resolveApiImageUrl มาแล้ว) — ใช้เมื่อยังไม่ได้เลือกไฟล์ใหม่ */
  currentUrl?: string | null
  value: File | null
  onChange: (file: File | null) => void
  shape?: 'circle' | 'square'
  size?: number
  fit?: 'cover' | 'contain'
  fallback?: ReactNode
  disabled?: boolean
  maxSizeMB?: number
  accept?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const errorId = useId()

  // object URL ต้อง revoke เองเมื่อเลิกใช้ ไม่งั้น blob ค้างใน memory
  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  )
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const pick = (file: File | undefined) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('รองรับเฉพาะไฟล์รูปภาพ')
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`ไฟล์ต้องมีขนาดไม่เกิน ${maxSizeMB} MB`)
      return
    }

    setError(null)
    onChange(file)
  }

  const clear = () => {
    setError(null)
    onChange(null)
  }

  return (
    <div className="form-control">
      {label && <span className="label-text mb-1 block text-xs">{label}</span>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="cursor-pointer rounded-xl border border-base-300 p-0.5 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={label ? `เลือก${label}` : 'เลือกรูป'}
        >
          <Avatar
            src={previewUrl ?? currentUrl ?? null}
            alt={label ?? 'รูปภาพ'}
            size={size}
            shape={shape}
            fit={fit}
            fallback={
              fallback ?? (
                <ImagePlus
                  className="text-base-content/40"
                  style={{ width: size * 0.35, height: size * 0.35 }}
                  aria-hidden="true"
                />
              )
            }
          />
        </button>

        <div className="flex min-w-0 flex-col items-start gap-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              เลือกรูป
            </button>
            {value && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clear}
                disabled={disabled}
              >
                ล้าง
              </button>
            )}
          </div>

          <span className="text-xs text-base-content/60">
            {hint ?? `JPG/PNG ขนาดไม่เกิน ${maxSizeMB} MB`}
          </span>
          {value && (
            <span className="max-w-full truncate text-xs text-base-content/60">
              {value.name}
            </span>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        aria-label={label ?? 'เลือกรูป'}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          pick(event.target.files?.[0])
          // ล้างค่าใน input ทุกครั้งหลังอ่านไฟล์แล้ว (ตัว File ถูกถือไว้ที่ state ของ parent)
          // ไม่งั้นเลือกไฟล์เดิมซ้ำหรือกดล้างแล้วเลือกใหม่ event change จะไม่ยิง
          event.target.value = ''
        }}
      />

      {error && (
        <span id={errorId} role="alert" className="mt-1 text-xs text-error">
          {error}
        </span>
      )}
    </div>
  )
}
