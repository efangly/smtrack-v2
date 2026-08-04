'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)

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
      router.replace('/')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'
      toast.error(message)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="form-control">
        <label htmlFor="username" className="label-text mb-1.5 block">
          ชื่อผู้ใช้
        </label>
        <div className="input input-bordered flex items-center gap-2">
          <User className="h-4 w-4 shrink-0 text-base-content/40" aria-hidden />
          <input
            id="username"
            type="text"
            className="grow"
            autoComplete="username"
            autoFocus
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'username-error' : undefined}
            {...register('username')}
          />
        </div>
        <span
          id="username-error"
          aria-live="polite"
          className="mt-1 text-sm text-error empty:hidden"
        >
          {errors.username?.message}
        </span>
      </div>

      <div className="form-control">
        <label htmlFor="password" className="label-text mb-1.5 block">
          รหัสผ่าน
        </label>
        <div className="input input-bordered flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0 text-base-content/40" aria-hidden />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="grow"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle shrink-0"
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <span
          id="password-error"
          aria-live="polite"
          className="mt-1 text-sm text-error empty:hidden"
        >
          {errors.password?.message}
        </span>
      </div>

      <button
        type="submit"
        className="btn btn-primary mt-1 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <span className="loading loading-spinner loading-sm" aria-hidden />
        )}
        เข้าสู่ระบบ
      </button>
    </form>
  )
}
