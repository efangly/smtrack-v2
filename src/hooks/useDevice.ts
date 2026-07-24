'use client'

import { useQuery } from '@tanstack/react-query'

import { getDevice } from '@/lib/api/devices'

export function useDevice(serial: string) {
  return useQuery({
    queryKey: ['devices', serial],
    queryFn: () => getDevice(serial),
    enabled: !!serial,
  })
}
