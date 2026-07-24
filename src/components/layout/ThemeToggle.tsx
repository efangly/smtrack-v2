'use client'

import { useEffect } from 'react'
import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'

import { Dropdown } from '@/components/ui/Dropdown'
import type { ThemeMode } from '@/lib/theme'
import { useThemeStore } from '@/store/useThemeStore'

const OPTIONS: { mode: ThemeMode; label: string; icon: LucideIcon }[] = [
  { mode: 'light', label: 'สว่าง', icon: Sun },
  { mode: 'dark', label: 'มืด', icon: Moon },
  { mode: 'system', label: 'ตามระบบ', icon: Monitor },
]

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode)
  const resolved = useThemeStore((state) => state.resolved)
  const hydrated = useThemeStore((state) => state.hydrated)
  const setMode = useThemeStore((state) => state.setMode)
  const hydrate = useThemeStore((state) => state.hydrate)

  useEffect(() => hydrate(), [hydrate])

  // ก่อน hydrate ยังไม่รู้ค่าจริงจาก localStorage จึงโชว์ไอคอนกลาง ๆ ไว้ก่อน
  const TriggerIcon = !hydrated ? Monitor : resolved === 'dark' ? Moon : Sun

  return (
    <Dropdown
      ariaLabel="สลับธีม"
      trigger={<TriggerIcon className="h-5 w-5" aria-hidden="true" />}
      panelClassName="w-44 p-1.5"
    >
      {(close) => (
        <ul className="flex flex-col gap-0.5">
          {OPTIONS.map((option) => {
            const Icon = option.icon
            const selected = hydrated && mode === option.mode
            return (
              <li key={option.mode}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-base-200"
                  onClick={() => {
                    setMode(option.mode)
                    close()
                  }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="flex-1 text-left">{option.label}</span>
                  {selected && (
                    <Check
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Dropdown>
  )
}
