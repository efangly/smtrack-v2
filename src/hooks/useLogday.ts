'use client'

import { useQuery } from '@tanstack/react-query'

import { getLogday } from '@/lib/api/logday'

export function useLogday(serial: string) {
  return useQuery({
    queryKey: ['logday', serial],
    queryFn: () => getLogday(serial),
    enabled: !!serial,
  })
}
