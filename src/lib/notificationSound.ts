export interface NotificationSoundOption {
  id: string
  label: string
  src: string
}

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  {
    id: 'notification-01',
    label: 'เสียง 1',
    src: '/sounds/notification-01.mp3',
  },
  {
    id: 'notification-02',
    label: 'เสียง 2',
    src: '/sounds/notification-02.mp3',
  },
  { id: 'n1', label: 'เสียง 3', src: '/sounds/n1.mp3' },
  { id: 'n2', label: 'เสียง 4', src: '/sounds/n2.wav' },
  { id: 'n3', label: 'เสียง 5', src: '/sounds/n3.wav' },
  { id: 'n4', label: 'เสียง 6', src: '/sounds/n4.wav' },
  { id: 'n5', label: 'เสียง 7', src: '/sounds/n5.wav' },
  { id: 'n6', label: 'เสียง 8', src: '/sounds/n6.wav' },
  { id: 'n7', label: 'เสียง 9', src: '/sounds/n7.wav' },
  { id: 'n8', label: 'เสียง 10', src: '/sounds/n8.mp3' },
  { id: 'n10', label: 'เสียง 11', src: '/sounds/n10.mp3' },
]

export const DEFAULT_NOTIFICATION_SOUND_ID = NOTIFICATION_SOUNDS[0].id

export const NOTIFICATION_SOUND_STORAGE_KEY = 'smtrack.notificationSound'

export interface NotificationSoundPref {
  enabled: boolean
  soundId: string
}

const DEFAULT_PREF: NotificationSoundPref = {
  enabled: true,
  soundId: DEFAULT_NOTIFICATION_SOUND_ID,
}

function isValidSoundId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    NOTIFICATION_SOUNDS.some((sound) => sound.id === value)
  )
}

export function getStoredNotificationSoundPref(): NotificationSoundPref {
  if (typeof window === 'undefined') return DEFAULT_PREF
  try {
    const raw = localStorage.getItem(NOTIFICATION_SOUND_STORAGE_KEY)
    if (!raw) return DEFAULT_PREF
    const parsed = JSON.parse(raw) as Partial<NotificationSoundPref>
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      soundId: isValidSoundId(parsed.soundId)
        ? parsed.soundId
        : DEFAULT_NOTIFICATION_SOUND_ID,
    }
  } catch {
    return DEFAULT_PREF
  }
}

export function setStoredNotificationSoundPref(
  pref: NotificationSoundPref,
): void {
  localStorage.setItem(NOTIFICATION_SOUND_STORAGE_KEY, JSON.stringify(pref))
}

export function getNotificationSoundSrc(soundId: string): string {
  return (
    NOTIFICATION_SOUNDS.find((sound) => sound.id === soundId)?.src ??
    NOTIFICATION_SOUNDS[0].src
  )
}

export function playNotificationSound(soundId: string): void {
  if (typeof window === 'undefined') return
  const audio = new Audio(getNotificationSoundSrc(soundId))
  // เบราว์เซอร์อาจบล็อก autoplay ในบางสถานการณ์ ปล่อยผ่านเงียบ ๆ ไม่ต้อง throw
  audio.play().catch(() => {})
}
