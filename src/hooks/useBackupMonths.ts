'use client'

import { useQuery } from '@tanstack/react-query'

import { getBackupMonths } from '@/lib/api/backup'

export function useBackupMonths() {
  return useQuery({
    queryKey: ['backup', 'months'],
    queryFn: getBackupMonths,
  })
}
