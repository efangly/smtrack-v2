'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { login } from '@/lib/api/auth'
import { ApiError } from '@/lib/apiClient'
import { useAuthStore } from '@/store/useAuthStore'
import { LoginRequestSchema, type LoginRequest } from '@/types/auth'

export function LoginForm() {
  const router = useRouter()
  const storeLogin = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values)
      storeLogin(result)
      toast.success('เข้าสู่ระบบสำเร็จ')
      router.push('/')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'
      toast.error(message)
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="form-control">
        <span className="label-text mb-1">ชื่อผู้ใช้</span>
        <input
          type="text"
          className="input input-bordered"
          autoComplete="username"
          {...register('username')}
        />
        {errors.username && (
          <span className="text-error text-sm mt-1">
            {errors.username.message}
          </span>
        )}
      </label>

      <label className="form-control">
        <span className="label-text mb-1">รหัสผ่าน</span>
        <input
          type="password"
          className="input input-bordered"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <span className="text-error text-sm mt-1">
            {errors.password.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        className="btn btn-primary mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  )
}
