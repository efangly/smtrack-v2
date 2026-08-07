import { act, render } from '@testing-library/react'
import toast from 'react-hot-toast'

import type { Notification } from '@/lib/api/notifications'
import { playNotificationSound } from '@/lib/notificationSound'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'
import { useNotificationSoundStore } from '@/store/useNotificationSoundStore'

import { NotificationToastEmitter } from './NotificationToastEmitter'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { custom: jest.fn(), dismiss: jest.fn() },
}))

jest.mock('@/lib/notificationSound', () => ({
  ...jest.requireActual('@/lib/notificationSound'),
  playNotificationSound: jest.fn(),
}))

function makeNotification(overrides: Partial<Notification>): Notification {
  return {
    id: 'n-1',
    serial: 'SN-001',
    message: 'ข้อความแจ้งเตือน',
    detail: '',
    status: false,
    deliveredSse: true,
    deliveredFcm: false,
    isRead: false,
    readAt: null,
    category: 'OTHER',
    severity: 'info',
    createAt: '2026-08-04T00:00:00Z',
    updateAt: '2026-08-04T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  useNotificationFeedStore.setState({
    items: [],
    unreadCount: 0,
    status: 'connecting',
  })
  useNotificationSoundStore.setState({
    enabled: true,
    soundId: 'notification-01',
    hydrated: true,
  })
})

describe('NotificationToastEmitter', () => {
  it('does not toast for items already in the store at mount', () => {
    useNotificationFeedStore.setState({ items: [makeNotification({ id: 'existing' })] })

    render(<NotificationToastEmitter />)

    expect(toast.custom).not.toHaveBeenCalled()
  })

  it('toasts exactly once when a new notification is pushed', () => {
    render(<NotificationToastEmitter />)

    act(() => {
      useNotificationFeedStore.getState().push(makeNotification({ id: 'new-1' }))
    })

    expect(toast.custom).toHaveBeenCalledTimes(1)
  })

  it('toasts once per notification for sequential pushes', () => {
    render(<NotificationToastEmitter />)

    act(() => {
      useNotificationFeedStore.getState().push(makeNotification({ id: 'new-1' }))
    })
    act(() => {
      useNotificationFeedStore.getState().push(makeNotification({ id: 'new-2' }))
    })

    expect(toast.custom).toHaveBeenCalledTimes(2)
  })

  it('plays the selected sound when a new notification arrives and sound is enabled', () => {
    useNotificationSoundStore.setState({ soundId: 'n3' })
    render(<NotificationToastEmitter />)

    act(() => {
      useNotificationFeedStore.getState().push(makeNotification({ id: 'new-1' }))
    })

    expect(playNotificationSound).toHaveBeenCalledTimes(1)
    expect(playNotificationSound).toHaveBeenCalledWith('n3')
  })

  it('does not play a sound when the user has muted notifications', () => {
    useNotificationSoundStore.setState({ enabled: false })
    render(<NotificationToastEmitter />)

    act(() => {
      useNotificationFeedStore.getState().push(makeNotification({ id: 'new-1' }))
    })

    expect(toast.custom).toHaveBeenCalledTimes(1)
    expect(playNotificationSound).not.toHaveBeenCalled()
  })

  it('does not play a sound for items already in the store at mount', () => {
    useNotificationFeedStore.setState({ items: [makeNotification({ id: 'existing' })] })
    render(<NotificationToastEmitter />)

    expect(playNotificationSound).not.toHaveBeenCalled()
  })
})
