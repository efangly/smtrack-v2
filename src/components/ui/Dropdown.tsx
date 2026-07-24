'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * dropdown ที่คุม state เอง (ไม่พึ่ง :focus ของ daisyUI)
 * เพื่อให้ปิดได้แน่นอนเมื่อคลิกนอกพื้นที่หรือกด Escape
 */
export function Dropdown({
  ariaLabel,
  trigger,
  children,
  onOpen,
  panelClassName = '',
}: {
  ariaLabel: string
  trigger: ReactNode
  /** รับฟังก์ชันปิดไปใช้ตอนคลิกเมนูย่อย */
  children: (close: () => void) => ReactNode
  onOpen?: () => void
  panelClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="btn btn-ghost btn-circle btn-sm"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((previous) => {
            if (!previous) onOpen?.()
            return !previous
          })
        }}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-50 mt-2 rounded-box border border-base-300 bg-base-100 shadow-xl ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
