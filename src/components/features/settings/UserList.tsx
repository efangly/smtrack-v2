'use client'

import { useMemo, useRef, useState } from 'react'
import { KeyRound, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { useCreateUser } from '@/hooks/useCreateUser'
import { useDeleteUser } from '@/hooks/useDeleteUser'
import { useResetPassword } from '@/hooks/useResetPassword'
import { useUpdateUser } from '@/hooks/useUpdateUser'
import { useUsers } from '@/hooks/useUsers'
import type { CreateUserInput } from '@/lib/api/users'
import { resolveApiImageUrl } from '@/lib/imageUrl'
import { canManageUsers } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import { ROLE_LABELS, ROLE_OPTIONS, type Role } from '@/types/auth'

import {
  ResetPasswordDialog,
  type ResetPasswordDialogHandle,
} from './ResetPasswordDialog'
import { UserFormDialog, type UserFormDialogHandle } from './UserFormDialog'

export function UserList() {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageUsers(role)

  const { data: users, isLoading, isError } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const resetPassword = useResetPassword()

  const formDialogRef = useRef<UserFormDialogHandle>(null)
  const resetDialogRef = useRef<ResetPasswordDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')

  // POST /user รับ JSON เท่านั้น (handler ไม่อ่าน FormFile) รูปจึงต้องอัปโหลด
  // เป็นขั้นที่สองผ่าน PUT /user/:id หลังสร้างผู้ใช้สำเร็จแล้ว
  const createWithPic = async (dto: CreateUserInput, image?: File) => {
    const created = await createUser.mutateAsync(dto).catch(() => null)
    if (created && image) updateUser.mutate({ id: created.id, dto: { image } })
  }

  const filtered = useMemo(() => {
    if (!users) return []
    const needle = keyword.trim().toLowerCase()

    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (!needle) return true

      return [user.username, user.display, user.ward?.wardName]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle))
    })
  }, [users, keyword, roleFilter])

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดรายการผู้ใช้ได้</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
          <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
          <input
            type="search"
            className="grow"
            placeholder="ค้นหาชื่อผู้ใช้ / วอร์ด"
            aria-label="ค้นหาผู้ใช้"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            className="select select-sm select-bordered"
            aria-label="กรองตามสิทธิ์"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as Role | 'all')
            }
          >
            <option value="all">ทุกสิทธิ์</option>
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>

          {canManage && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => formDialogRef.current?.open()}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              เพิ่มผู้ใช้
            </button>
          )}
        </div>
      </div>

      {!users || users.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีผู้ใช้ในระบบ</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>ชื่อผู้ใช้</th>
                <th>ชื่อที่แสดง</th>
                <th>สิทธิ์</th>
                <th>วอร์ด</th>
                <th>สถานะ</th>
                {canManage && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={resolveApiImageUrl(user.pic)}
                        alt={user.display ?? user.username}
                        size={32}
                      />
                      <span className="font-mono">{user.username}</span>
                    </div>
                  </td>
                  <td>{user.display ?? '-'}</td>
                  <td>{ROLE_LABELS[user.role]}</td>
                  <td>{user.ward?.wardName ?? '-'}</td>
                  <td>
                    <Badge tone={user.status ? 'success' : 'neutral'}>
                      {user.status ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          aria-label={`แก้ไข ${user.username}`}
                          onClick={() => formDialogRef.current?.open(user)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          aria-label={`รีเซ็ตรหัสผ่าน ${user.username}`}
                          onClick={() =>
                            resetDialogRef.current?.open({
                              id: user.id,
                              username: user.username,
                            })
                          }
                        >
                          <KeyRound className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          aria-label={`ลบ ${user.username}`}
                          onClick={() => {
                            targetIdRef.current = user.id
                            deleteDialogRef.current?.showModal()
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserFormDialog
        ref={formDialogRef}
        isSubmitting={createUser.isPending || updateUser.isPending}
        onCreate={createWithPic}
        onUpdate={(id, dto) => updateUser.mutate({ id, dto })}
      />

      <ResetPasswordDialog
        ref={resetDialogRef}
        isSubmitting={resetPassword.isPending}
        onSubmit={(id, dto) => resetPassword.mutate({ id, dto })}
      />

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบผู้ใช้"
        description="ผู้ใช้นี้จะถูกลบออกจากระบบและเข้าสู่ระบบไม่ได้อีก"
        confirmLabel="ลบ"
        isLoading={deleteUser.isPending}
        onConfirm={() => deleteUser.mutate(targetIdRef.current)}
      />
    </div>
  )
}
