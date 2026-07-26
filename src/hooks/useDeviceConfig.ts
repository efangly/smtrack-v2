'use client'

import { useQuery } from '@tanstack/react-query'

import { getDeviceConfig } from '@/lib/api/deviceConfig'
import { ApiError } from '@/lib/apiClient'

export function useDeviceConfig(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId, 'config'],
    queryFn: () => getDeviceConfig(deviceId),
    enabled: !!deviceId,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.statusCode === 404) &&
      failureCount < 1,
  })
}
