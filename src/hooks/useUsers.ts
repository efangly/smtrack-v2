'use client'

import { useQuery } from '@tanstack/react-query'

import { getUsers } from '@/lib/api/users'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled,
  })
}
