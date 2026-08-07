'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

const PANEL_MAX_HEIGHT = 256
const PANEL_GAP = 4

export interface SearchableSelectOption {
  value: string
  label: string
  /** ข้อความรองต่อท้าย เช่น ชื่อโรงพยาบาลของวอร์ด — ใช้ค้นหาได้ด้วย */
  hint?: string
}

/**
 * combobox ที่พิมพ์ค้นหาได้ (ARIA 1.2 pattern: input + listbox popover)
 * ใช้แทน <select> ในลิสต์ที่ยาวเกินกว่าจะ scroll หา เช่น โรงพยาบาล 100+ แห่ง
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  id,
  ariaLabel,
  placeholder = '',
  disabled = false,
  className = '',
  emptyText = 'ไม่พบรายการที่ตรงกับคำค้น',
  onBlur,
}: {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  id?: string
  ariaLabel?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyText?: string
  onBlur?: () => void
}) {
  const reactId = useId()
  const listId = `${id ?? reactId}-listbox`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  // panel ถูก portal ออกไปนอก container เพราะ .modal-box มี overflow-y:auto —
  // ถ้าปล่อยไว้ในที่เดิม dropdown จะโดนตัดและดันให้ dialog เลื่อนเอง
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>()
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  const selected = options.find((option) => option.value === value)
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return options
    return options.filter((option) =>
      `${option.label} ${option.hint ?? ''}`.toLowerCase().includes(keyword),
    )
  }, [options, query])

  // ปิดตอนคลิกนอกพื้นที่ (ลอจิกเดียวกับ Dropdown.tsx)
  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      // panel อยู่นอก container (portal) จึงต้องเช็ค listRef ด้วย ไม่งั้นคลิกเลือกแล้ว
      // panel จะถูกถอดทิ้งก่อน click จะมาถึง
      if (
        !containerRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        close()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  // วาง panel ด้วยพิกัดจริงของ input (position: fixed) และพลิกขึ้นบนถ้าที่ด้านล่างไม่พอ
  useLayoutEffect(() => {
    if (!open) return

    // อยู่ใน <dialog> ต้อง portal เข้า dialog นั้น ไม่ใช่ body — ไม่งั้นจะจมอยู่ใต้ top layer
    setPortalTarget(containerRef.current?.closest('dialog') ?? document.body)

    const update = () => {
      const rect = inputRef.current?.getBoundingClientRect()
      if (!rect) return
      const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP
      const spaceAbove = rect.top - PANEL_GAP
      const openUp = spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > spaceBelow
      setPanelStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + PANEL_GAP }
          : { top: rect.bottom + PANEL_GAP }),
        maxHeight: Math.min(
          PANEL_MAX_HEIGHT,
          Math.max(96, openUp ? spaceAbove : spaceBelow),
        ),
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  // เลื่อน option ที่ highlight ให้อยู่ในระยะมองเห็นเสมอตอนกดลูกศร
  useEffect(() => {
    if (!open) return
    // jsdom ไม่มี scrollIntoView — เรียกแบบ optional เพื่อให้เทสไม่พัง
    listRef.current?.children[activeIndex]?.scrollIntoView?.({
      block: 'nearest',
    })
  }, [open, activeIndex])

  function openPanel() {
    if (disabled || open) return
    setQuery('')
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    )
    setOpen(true)
  }

  /** ปิดโดยไม่เลือก — คืนค่าที่เลือกไว้เดิม */
  function close() {
    setOpen(false)
    setQuery('')
  }

  function select(option: SearchableSelectOption) {
    onChange(option.value)
    close()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openPanel()
        return
      }
      if (filtered.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex(
        (previous) => (previous + step + filtered.length) % filtered.length,
      )
      return
    }

    if (event.key === 'Enter' && open) {
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) select(option)
      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      close()
      return
    }

    if (event.key === 'Tab' && open) close()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        type="text"
        autoComplete="off"
        className="input input-sm input-bordered w-full pr-8"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listId}-${filtered[activeIndex].value}`
            : undefined
        }
        disabled={disabled}
        placeholder={placeholder}
        value={open ? query : (selected?.label ?? '')}
        onChange={(event) => {
          if (!open) openPanel()
          setQuery(event.target.value)
          setActiveIndex(0)
        }}
        onFocus={openPanel}
        onClick={openPanel}
        onBlur={() => {
          close()
          onBlur?.()
        }}
        onKeyDown={handleKeyDown}
      />
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
        aria-hidden="true"
      />

      {open &&
        portalTarget &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={panelStyle}
            className="scrollbar-slim z-50 overflow-y-auto rounded-box border border-base-300 bg-base-100 py-1 shadow-xl"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-base-content/60">
                {emptyText}
              </li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${option.value}`}
                  role="option"
                  aria-selected={option.value === value}
                  className={`cursor-pointer px-3 py-1.5 text-sm ${
                    index === activeIndex ? 'bg-base-200' : ''
                  } ${option.value === value ? 'font-medium' : ''}`}
                  // กัน focus หลุดจาก input ตอนกดเมาส์ ไม่งั้น blur จะปิด panel ก่อน click มาถึง
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(option)}
                  onPointerEnter={() => setActiveIndex(index)}
                >
                  {option.label}
                  {option.hint && (
                    <span className="ml-1 text-base-content/60">
                      — {option.hint}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>,
          portalTarget,
        )}
    </div>
  )
}
