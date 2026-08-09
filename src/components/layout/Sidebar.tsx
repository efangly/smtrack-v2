import { ConnectionStatus } from './ConnectionStatus'
import { SidebarBrand } from './SidebarBrand'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="sidebar-surface flex min-h-full w-80 flex-col border-r border-base-300">
      <SidebarBrand />

      <div className="flex-1 overflow-y-auto scrollbar-slim">
        <SidebarNav />
      </div>

      <div className="border-t border-base-300 px-5 py-3">
        <ConnectionStatus />
      </div>
    </aside>
  )
}
