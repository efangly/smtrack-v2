import { act, renderHook } from '@testing-library/react'

import { useSse } from './useSse'

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

  dispatch(type: string, event: unknown) {
    for (const handler of this.listeners[type] ?? []) handler(event)
  }
}

describe('useSse', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    // @ts-expect-error test double
    global.EventSource = MockEventSource
  })

  it('subscribes to the given event name and forwards parsed data', () => {
    const onEvent = jest.fn()
    renderHook(() => useSse('/telemetry/stream', 'telemetry', onEvent))

    const instance = MockEventSource.instances[0]
    expect(instance).toBeDefined()

    instance.dispatch('telemetry', {
      data: JSON.stringify({ serial: 'DEV-1' }),
    })
    expect(onEvent).toHaveBeenCalledWith({ serial: 'DEV-1' })
  })

  it('closes the connection and removes listeners on unmount', () => {
    const onEvent = jest.fn()
    const { unmount } = renderHook(() =>
      useSse('/telemetry/stream', 'telemetry', onEvent),
    )

    const instance = MockEventSource.instances[0]
    unmount()

    expect(instance.closed).toBe(true)
    expect(instance.listeners['telemetry']).toHaveLength(0)
  })

  describe('reconnect', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('closes the dead connection and opens a new one after a backoff delay on error', () => {
      const onEvent = jest.fn()
      renderHook(() => useSse('/telemetry/stream', 'telemetry', onEvent))

      const first = MockEventSource.instances[0]
      expect(first).toBeDefined()

      act(() => {
        first.dispatch('error', {})
      })
      expect(first.closed).toBe(true)
      expect(MockEventSource.instances).toHaveLength(1)

      act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(MockEventSource.instances).toHaveLength(2)
      const second = MockEventSource.instances[1]
      expect(second.closed).toBe(false)

      act(() => {
        second.dispatch('telemetry', {
          data: JSON.stringify({ serial: 'DEV-1' }),
        })
      })
      expect(onEvent).toHaveBeenCalledWith({ serial: 'DEV-1' })
    })

    it('resets the backoff after a successful open', () => {
      const onEvent = jest.fn()
      renderHook(() => useSse('/telemetry/stream', 'telemetry', onEvent))

      const first = MockEventSource.instances[0]
      act(() => {
        first.dispatch('error', {})
        jest.runOnlyPendingTimers()
      })

      const second = MockEventSource.instances[1]
      act(() => {
        second.dispatch('open', {})
        second.dispatch('error', {})
      })

      const delayAfterReset = jest.getTimerCount()
      expect(delayAfterReset).toBe(1)

      act(() => {
        jest.runOnlyPendingTimers()
      })
      expect(MockEventSource.instances).toHaveLength(3)
    })

    it('does not reconnect after unmount while a retry is pending', () => {
      const onEvent = jest.fn()
      const { unmount } = renderHook(() =>
        useSse('/telemetry/stream', 'telemetry', onEvent),
      )

      const first = MockEventSource.instances[0]
      act(() => {
        first.dispatch('error', {})
      })
      expect(MockEventSource.instances).toHaveLength(1)

      unmount()

      expect(() => jest.runOnlyPendingTimers()).not.toThrow()
      expect(MockEventSource.instances).toHaveLength(1)
    })
  })
})
