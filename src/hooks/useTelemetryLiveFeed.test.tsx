import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { useTelemetryLiveFeed } from './useTelemetryLiveFeed'
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

  removeEventListener() {}
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

describe('useTelemetryLiveFeed', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    // @ts-expect-error test double
    global.EventSource = MockEventSource
  })

  it('prepends matching-serial points into the telemetry query cache', () => {
    const client = new QueryClient()
    client.setQueryData(
      ['telemetry', { serial: 'DEV-1', limit: 50 }],
      [makeLogDay({ id: 'old' })],
    )

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    renderHook(() => useTelemetryLiveFeed('DEV-1'), { wrapper })

    const instance = MockEventSource.instances[0]
    instance.dispatch('telemetry', makeLogDay({ id: 'new' }))

    const cached = client.getQueryData<LogDay[]>([
      'telemetry',
      { serial: 'DEV-1', limit: 50 },
    ])
    expect(cached?.map((p) => p.id)).toEqual(['new', 'old'])
  })

  it('ignores points for a different serial', () => {
    const client = new QueryClient()
    client.setQueryData(
      ['telemetry', { serial: 'DEV-1', limit: 50 }],
      [makeLogDay({ id: 'old' })],
    )

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    renderHook(() => useTelemetryLiveFeed('DEV-1'), { wrapper })

    const instance = MockEventSource.instances[0]
    instance.dispatch('telemetry', makeLogDay({ id: 'other', serial: 'DEV-2' }))

    const cached = client.getQueryData<LogDay[]>([
      'telemetry',
      { serial: 'DEV-1', limit: 50 },
    ])
    expect(cached?.map((p) => p.id)).toEqual(['old'])
  })
})
