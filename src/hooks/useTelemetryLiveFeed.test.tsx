import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { useTelemetryLiveFeed } from './useTelemetryLiveFeed'
import { RealtimeFeedProvider } from '@/components/features/realtime/RealtimeFeedProvider'
import type { LogDay } from '@/lib/api/telemetry'

class MockEventSource {
  static instances: MockEventSource[] = []
  listeners: Record<string, ((event: unknown) => void)[]> = {}

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

  close() {}

  dispatch(type: string, data: unknown) {
    for (const handler of this.listeners[type] ?? []) {
      handler({ data: JSON.stringify(data) })
    }
  }
}

function makeLogDay(overrides: Partial<LogDay>): LogDay {
  return {
    id: 'id-1',
    serial: 'DEV-1',
    temp: 4,
    tempDisplay: 4,
    humidity: 50,
    humidityDisplay: 50,
    sendTime: '2026-07-21T10:00:00.000Z',
    plug: true,
    door1: false,
    door2: false,
    door3: false,
    internet: true,
    probe: '1',
    probeId: 'probe-1',
    battery: 100,
    tempInternal: null,
    extMemory: false,
    createAt: '2026-07-21T10:00:00.000Z',
    updateAt: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

/**
 * hook นี้ไม่เปิด EventSource เองแล้ว — รับ event ผ่าน stream กลางของ
 * RealtimeFeedProvider จึงต้องห่อ Provider ให้ด้วย
 */
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  client.setQueryData(['notifications', 'unread-count'], 0)
  client.setQueryData(
    ['telemetry', { serial: 'DEV-1', limit: 50 }],
    [makeLogDay({ id: 'old' })],
  )

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RealtimeFeedProvider>{children}</RealtimeFeedProvider>
    </QueryClientProvider>
  )

  renderHook(() => useTelemetryLiveFeed('DEV-1'), { wrapper })

  return { client, source: MockEventSource.instances.at(-1)! }
}

describe('useTelemetryLiveFeed', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    // @ts-expect-error test double
    global.EventSource = MockEventSource
  })

  it('prepends matching-serial points into the telemetry query cache', () => {
    const { client, source } = setup()

    act(() => {
      source.dispatch('telemetry', makeLogDay({ id: 'new' }))
    })

    const cached = client.getQueryData<LogDay[]>([
      'telemetry',
      { serial: 'DEV-1', limit: 50 },
    ])
    expect(cached?.map((p) => p.id)).toEqual(['new', 'old'])
  })

  it('ignores points for a different serial', () => {
    const { client, source } = setup()

    act(() => {
      source.dispatch('telemetry', makeLogDay({ id: 'other', serial: 'DEV-2' }))
    })

    const cached = client.getQueryData<LogDay[]>([
      'telemetry',
      { serial: 'DEV-1', limit: 50 },
    ])
    expect(cached?.map((p) => p.id)).toEqual(['old'])
  })

  it('ใช้ stream กลางเส้นเดียว ไม่เปิด /telemetry/stream ของตัวเอง', () => {
    const { source } = setup()

    expect(source.url).toContain('/stream?channels=')
    expect(
      MockEventSource.instances.some((i) => i.url.includes('/telemetry/stream')),
    ).toBe(false)
  })
})
