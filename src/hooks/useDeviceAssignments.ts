'use client'

import { useQuery } from '@tanstack/react-query'

import { getDeviceAssignments } from '@/lib/api/devices'

export function useDeviceAssignments(staticName: string) {
  return useQuery({
    queryKey: ['devices', 'assignments', staticName],
    queryFn: () => getDeviceAssignments(staticName),
    enabled: !!staticName,
  })
}
