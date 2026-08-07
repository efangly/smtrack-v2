'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import toast, { Toaster, useToasterStore } from 'react-hot-toast'
import type { ReactNode } from 'react'

import { getQueryClient } from '@/lib/queryClient'

const TOAST_LIMIT = 3

function ToastLimiter() {
  const { toasts } = useToasterStore()

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= TOAST_LIMIT)
      .forEach((t) => toast.dismiss(t.id))
  }, [toasts])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" />
      <ToastLimiter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
