'use client'

import { useEffect, useRef, useState } from 'react'

import { getStoredToken } from '@/lib/authToken'

export type SseStatus = 'connecting' | 'open' | 'error'

export function useSse<T>(
  path: string,
  eventName: string,
  onEvent: (data: T) => void,
) {
  const onEventRef = useRef(onEvent)
  const [status, setStatus] = useState<SseStatus>('connecting')

  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
    // EventSource ไม่รองรับการตั้ง header เอง จึงต้องแนบ token ผ่าน query
    // param แทน — backend (SseAuthGuard) รองรับทั้ง Authorization header
    // และ ?token= สำหรับ endpoint กลุ่มนี้
    const token = getStoredToken()
    const url = new URL(`${baseUrl}${path}`, window.location.origin)
    if (token) url.searchParams.set('token', token)
    const source = new EventSource(url.toString())

    const handleEvent = (event: MessageEvent<string>) => {
      try {
        onEventRef.current(JSON.parse(event.data) as T)
      } catch {
        // ignore malformed payloads
      }
    }
    const handleOpen = () => setStatus('open')
    const handleError = () => setStatus('error')

    source.addEventListener(eventName, handleEvent)
    source.addEventListener('open', handleOpen)
    source.addEventListener('error', handleError)

    return () => {
      source.removeEventListener(eventName, handleEvent)
      source.removeEventListener('open', handleOpen)
      source.removeEventListener('error', handleError)
      source.close()
    }
  }, [path, eventName])

  return status
}
