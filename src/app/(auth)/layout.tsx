import { AuthBrandPanel } from '@/components/features/auth/AuthBrandPanel'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-base-200 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle />
      </div>

      <AuthBrandPanel />

      <div className="flex min-h-screen items-center justify-center p-4 lg:min-h-0">
        {children}
      </div>
    </div>
  )
}
