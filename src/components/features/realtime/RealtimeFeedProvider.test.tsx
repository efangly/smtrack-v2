import { render, renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'

import { RealtimeFeedProvider } from './RealtimeFeedProvider'

class MockEventSource {
  static instances: MockEventSource[] = []
  listeners: Record<string, ((event: unknown) => void)[]> = {}
  closed = false

  constructor(public url: string) {
    MockEventSource.instances.push(this)
  }

  addEventListener(type: string, handler: (event: unknown) => void) {
    this.listeners[type] ??= []
    this.listeners[type].push(handler)
  }

  removeEventListener(type: string, handler: (event: unknown) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter(
      (h) => h !== handler,
    )
  }

  close() {
    this.closed = true
  }

  dispatch(type: string, data: unknown) {
    for (const handler of this.listeners[type] ?? []) {
      handler({ data: JSON.stringify(data) })
    }
  }
}

/** channel list ที่ถูกขอจาก server ของ connection ล่าสุด */
function latestChannels() {
  const latest = MockEventSource.instances.at(-1)
  return new URL(latest!.url).searchParams.get('channels')
}

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  // กัน useUnreadNotificationCount ยิง fetch จริงใน jsdom — seed ให้ข้อมูล fresh
  client.setQueryData(['notifications', 'unread-count'], 0)

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <RealtimeFeedProvider>{children}</RealtimeFeedProvider>
      </QueryClientProvider>
    )
  }
}

describe('RealtimeFeedProvider', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    // @ts-expect-error test double
    global.EventSource = MockEventSource
  })

  it('เปิด EventSource เส้นเดียวแม้มี consumer หลายตัว', () => {
    const wrapper = makeWrapper()

    renderHook(
      () => {
        useRealtimeChannel('telemetry', () => {})
        useRealtimeChannel('telemetry', () => {})
        useRealtimeChannel('notification', () => {})
      },
      { wrapper },
    )

    // instance ที่เกิน 1 มาจากการ reconnect ตอนเพิ่ม channel เท่านั้น — เส้นที่ยังเปิดค้าง
    // (ยังไม่ถูก close) ต้องมีตัวเดียว ไม่งั้นคือกินโควตา connection ของ browser ซ้ำ
    const open = MockEventSource.instances.filter((i) => !i.closed)
    expect(open).toHaveLength(1)
  })

  it('ขอ channel telemetry เฉพาะตอนมี subscriber', () => {
    const wrapper = makeWrapper()

    function Consumer() {
      useRealtimeChannel('telemetry', () => {})
      return null
    }

    const { rerender } = render(<div />, { wrapper })
    expect(latestChannels()).toBe('device,notification')

    rerender(<Consumer />)
    expect(latestChannels()).toBe('device,notification,telemetry')

    rerender(<div />)
    expect(latestChannels()).toBe('device,notification')
  })

  it('กระจาย event ให้ subscriber ทุกตัวของ channel นั้น', () => {
    const wrapper = makeWrapper()
    const first = jest.fn()
    const second = jest.fn()
    const other = jest.fn()

    renderHook(
      () => {
        useRealtimeChannel('telemetry', first)
        useRealtimeChannel('telemetry', second)
        useRealtimeChannel('notification', other)
      },
      { wrapper },
    )

    const latest = MockEventSource.instances.at(-1)!
    act(() => {
      latest.dispatch('telemetry', { serial: 'DEV-1' })
    })

    expect(first).toHaveBeenCalledWith({ serial: 'DEV-1' })
    expect(second).toHaveBeenCalledWith({ serial: 'DEV-1' })
    expect(other).not.toHaveBeenCalled()
  })
})
