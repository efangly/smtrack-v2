import type { ReactNode } from 'react'

export function Card({
  title,
  description,
  action,
  accentClass,
  className = '',
  children,
}: {
  title?: string
  description?: string
  /** เนื้อหาชิดขวาของหัวการ์ด เช่น ป้ายสถานะ live หรือปุ่มลัด */
  action?: ReactNode
  /** class ประจำหมวดจาก CATEGORY_ACCENT_CLASS — ใส่แล้วได้แถบสีด้านซ้าย */
  accentClass?: string
  className?: string
  children: ReactNode
}) {
  const hasHeader = Boolean(title || description || action)

  return (
    <div
      className={`card surface-card ${accentClass ? `accent-bar ${accentClass}` : ''} ${className}`}
    >
      <div
        className={`card-body gap-4 p-4 md:p-5 ${accentClass ? 'pl-5 md:pl-6' : ''}`}
      >
        {hasHeader && (
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {title && <h2 className="card-title text-base">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-sm text-base-content/60">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
