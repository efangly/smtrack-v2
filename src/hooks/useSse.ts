'use client'

import { useEffect, useRef, useState } from 'react'

import { getStoredToken } from '@/lib/authToken'

export type SseStatus = 'connecting' | 'open' | 'error' | 'reconnecting'

const INITIAL_RETRY_DELAY_MS = 1000
const MAX_RETRY_DELAY_MS = 30000
const JITTER_RATIO = 0.2

function getRetryDelay(attempt: number) {
  const base = Math.min(
    INITIAL_RETRY_DELAY_MS * 2 ** attempt,
    MAX_RETRY_DELAY_MS,
  )
  const jitter = base * JITTER_RATIO * (Math.random() * 2 - 1)
  return Math.max(0, base + jitter)
}

export function useSse<T>(
  path: string,
  eventName: string,
  onEvent: (data: T) => void,
) {
  return useSseChannels(path, {
    [eventName]: (data) => onEvent(data as T),
  })
}

/**
 * เหมือน useSse แต่รับ event หลายชื่อบน EventSource เดียวกัน — ใช้กับ endpoint
 * multiplexed ที่ยิงหลาย channel มาบน connection เดียว (เช่น `/stream?channels=...`)
 *
 * เมื่อ connection หลุด จะ retry ใหม่อัตโนมัติด้วย exponential backoff (มี jitter,
 * ไม่มี cap จำนวนครั้ง) แทนที่จะพึ่ง browser auto-reconnect เฉย ๆ — และ build
 * URL/token ใหม่ทุกครั้งที่ retry เผื่อ token ถูก refresh ระหว่างที่หลุดอยู่
 */
export function useSseChannels(
  path: string,
  handlers: Record<string, (data: unknown) => void>,
) {
  const handlersRef = useRef(handlers)
  const [status, setStatus] = useState<SseStatus>('connecting')

  useEffect(() => {
    handlersRef.current = handlers
  })

  const eventNames = Object.keys(handlers).sort().join(',')

  useEffect(() => {
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0
    let activeConnection: {
      source: EventSource
      listeners: { name: string; handleEvent: (event: MessageEvent<string>) => void }[]
      handleOpen: () => void
      handleError: () => void
    } | null = null

    const teardown = () => {
      if (!activeConnection) return
      const { source, listeners, handleOpen, handleError } = activeConnection
      for (const { name, handleEvent } of listeners) {
        source.removeEventListener(name, handleEvent)
      }
      source.removeEventListener('open', handleOpen)
      source.removeEventListener('error', handleError)
      source.close()
      activeConnection = null
    }

    const connect = () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
      // EventSource ไม่รองรับการตั้ง header เอง จึงต้องแนบ token ผ่าน query
      // param แทน — backend (SseAuthGuard) รองรับทั้ง Authorization header
      // และ ?token= สำหรับ endpoint กลุ่มนี้
      const token = getStoredToken()
      const url = new URL(`${baseUrl}${path}`, window.location.origin)
      if (token) url.searchParams.set('token', token)
      const source = new EventSource(url.toString())

      const listeners = eventNames.split(',').map((name) => {
        const handleEvent = (event: MessageEvent<string>) => {
          try {
            handlersRef.current[name]?.(JSON.parse(event.data))
          } catch {
            // ignore malformed payloads
          }
        }
        source.addEventListener(name, handleEvent)
        return { name, handleEvent }
      })

      const handleOpen = () => {
        attempt = 0
        setStatus('open')
      }

      const handleError = () => {
        teardown()
        if (cancelled) return

        setStatus('error')
        const delay = getRetryDelay(attempt)
        attempt += 1
        retryTimer = setTimeout(() => {
          if (cancelled) return
          setStatus('reconnecting')
          connect()
        }, delay)
      }

      source.addEventListener('open', handleOpen)
      source.addEventListener('error', handleError)

      activeConnection = { source, listeners, handleOpen, handleError }
    }

    connect()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      teardown()
    }
  }, [path, eventNames])

  return status
}
