import { RealtimeFeedProvider } from '@/components/features/realtime/RealtimeFeedProvider'
import { NotificationToastEmitter } from '@/components/features/notifications/NotificationToastEmitter'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RealtimeFeedProvider>
      <NotificationToastEmitter />
      <div className="drawer lg:drawer-open">
        <input id="main-drawer" type="checkbox" className="drawer-toggle" />
        <div className="app-surface drawer-content flex min-h-screen flex-col">
          <Topbar />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1920px] p-2 md:p-4">
              {children}
            </div>
          </main>
        </div>
        <div className="drawer-side z-50">
          <label
            htmlFor="main-drawer"
            aria-label="ปิดเมนู"
            className="drawer-overlay"
          />
          <Sidebar />
        </div>
      </div>
    </RealtimeFeedProvider>
  )
}
