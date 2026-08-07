'use client'

import { useEffect } from 'react'
import { Play } from 'lucide-react'

import { NOTIFICATION_SOUNDS, playNotificationSound } from '@/lib/notificationSound'
import { useNotificationSoundStore } from '@/store/useNotificationSoundStore'

export function NotificationSoundSettingsCard() {
  const enabled = useNotificationSoundStore((state) => state.enabled)
  const soundId = useNotificationSoundStore((state) => state.soundId)
  const hydrated = useNotificationSoundStore((state) => state.hydrated)
  const setEnabled = useNotificationSoundStore((state) => state.setEnabled)
  const setSoundId = useNotificationSoundStore((state) => state.setSoundId)
  const hydrate = useNotificationSoundStore((state) => state.hydrate)

  useEffect(() => hydrate(), [hydrate])

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">เปิดเสียงแจ้งเตือน</span>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={hydrated ? enabled : true}
          onChange={(e) => setEnabled(e.target.checked)}
        />
      </label>

      <ul
        className={`flex flex-col gap-0.5 transition-opacity ${
          enabled ? '' : 'pointer-events-none opacity-50'
        }`}
      >
        {NOTIFICATION_SOUNDS.map((sound) => {
          const selected = hydrated && soundId === sound.id
          return (
            <li key={sound.id} className="flex items-center gap-2">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-base-200">
                <input
                  type="radio"
                  name="notification-sound"
                  className="radio radio-primary radio-sm"
                  checked={selected}
                  disabled={!enabled}
                  onChange={() => setSoundId(sound.id)}
                />
                <span className="text-sm">{sound.label}</span>
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                aria-label={`ทดลองฟัง ${sound.label}`}
                onClick={() => playNotificationSound(sound.id)}
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
