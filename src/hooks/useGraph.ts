'use client'

import { useQuery } from '@tanstack/react-query'

import { getGraph } from '@/lib/api/graph'

export function useGraph(serial: string) {
  return useQuery({
    queryKey: ['graph', serial],
    queryFn: () => getGraph(serial),
    enabled: !!serial,
    refetchInterval: 60_000,
  })
}
