import { LoginForm } from '@/components/features/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="card w-full max-w-sm border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div>
          <h1 className="card-title text-xl">เข้าสู่ระบบ</h1>
          <p className="mt-0.5 text-sm text-base-content/60">
            SMtrack Dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
