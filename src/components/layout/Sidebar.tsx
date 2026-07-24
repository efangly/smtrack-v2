import Link from 'next/link'
import { Radio } from 'lucide-react'

import { ConnectionStatus } from './ConnectionStatus'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="flex min-h-full w-72 flex-col border-r border-base-300 bg-base-100">
      <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
          <Radio className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Link href="/" className="block truncate font-semibold">
            SMtrack Dashboard
          </Link>
          <span className="text-xs text-base-content/50">
            IoT telemetry monitoring
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-slim">
        <SidebarNav />
      </div>

      <div className="border-t border-base-300 px-5 py-3">
        <ConnectionStatus />
      </div>
    </aside>
  )
}
