'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PAGE_SIZE_OPTIONS } from '@/hooks/usePaginationParams'

interface BasePaginationProps {
  page: number
  limit: number
  onPageChange: (page: number) => void
  /** ไม่ส่ง prop นี้มา = ไม่แสดง dropdown เลือกจำนวนแถวต่อหน้า */
  onLimitChange?: (limit: number) => void
  className?: string
}

function RowsPerPageSelect({
  limit,
  onLimitChange,
}: {
  limit: number
  onLimitChange: (limit: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-base-content/50">
      แถวต่อหน้า
      <select
        className="select select-sm select-bordered w-auto"
        aria-label="จำนวนแถวต่อหน้า"
        value={limit}
        onChange={(event) => onLimitChange(Number(event.target.value))}
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

interface FullPaginationProps extends BasePaginationProps {
  /** จำนวนรายการทั้งหมด — ใช้คำนวณ totalPages ได้จริง (client-side pagination) */
  totalItems: number
  hasNextPage?: never
}

interface ConservativePaginationProps extends BasePaginationProps {
  totalItems?: never
  /** backend ยังไม่คืน total มาด้วย จึงบอกได้แค่ว่ามีหน้าถัดไปหรือไม่ */
  hasNextPage: boolean
}

type PaginationProps = FullPaginationProps | ConservativePaginationProps

function pageWindow(page: number, totalPages: number): (number | 'ellipsis')[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('ellipsis')
    result.push(p)
  })
  return result
}

export function Pagination(props: PaginationProps) {
  const { page, limit, onPageChange, onLimitChange, className = '' } = props

  if ('totalItems' in props && props.totalItems !== undefined) {
    const { totalItems } = props
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    if (totalPages <= 1) {
      if (!onLimitChange) return null
      return (
        <div className={`flex items-center justify-end gap-3 ${className}`}>
          <RowsPerPageSelect limit={limit} onLimitChange={onLimitChange} />
        </div>
      )
    }

    const start = totalItems === 0 ? 0 : (page - 1) * limit + 1
    const end = Math.min(page * limit, totalItems)

    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
      >
        <p className="text-xs text-base-content/50">
          แสดง {start}–{end} จาก {totalItems} รายการ
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {onLimitChange && (
            <RowsPerPageSelect limit={limit} onLimitChange={onLimitChange} />
          )}
          <div role="group" aria-label="เปลี่ยนหน้า" className="join">
            <button
              type="button"
              className="btn join-item btn-sm"
              aria-label="หน้าก่อนหน้า"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {pageWindow(page, totalPages).map((p, i) =>
              p === 'ellipsis' ? (
                <button
                  key={`ellipsis-${i}`}
                  type="button"
                  className="btn join-item btn-sm btn-disabled"
                  aria-hidden="true"
                >
                  …
                </button>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`btn join-item btn-sm ${p === page ? 'btn-active btn-primary' : ''}`}
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`หน้า ${p}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              className="btn join-item btn-sm"
              aria-label="หน้าถัดไป"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { hasNextPage } = props
  if (page <= 1 && !hasNextPage) {
    if (!onLimitChange) return null
    return (
      <div className={`flex items-center justify-end gap-3 ${className}`}>
        <RowsPerPageSelect limit={limit} onLimitChange={onLimitChange} />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <p className="text-xs text-base-content/50">หน้า {page}</p>
      <div className="flex flex-wrap items-center gap-3">
        {onLimitChange && (
          <RowsPerPageSelect limit={limit} onLimitChange={onLimitChange} />
        )}
        <div role="group" aria-label="เปลี่ยนหน้า" className="join">
          <button
            type="button"
            className="btn join-item btn-sm"
            aria-label="หน้าก่อนหน้า"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn join-item btn-sm"
            aria-label="หน้าถัดไป"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
