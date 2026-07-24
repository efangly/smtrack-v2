'use client'

import { useState } from 'react'

import { useExportMonth } from '@/hooks/useExportMonth'
import { isMonthString } from '@/lib/utils'

export function ExportMonthPicker() {
  const [month, setMonth] = useState('')
  const exportMonth = useExportMonth()

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isMonthString(month)) return
        exportMonth.mutate(month)
      }}
    >
      <label className="form-control">
        <span className="label-text mb-1">Export เดือนอื่น (YYYY-MM)</span>
        <input
          type="month"
          className="input input-bordered"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!isMonthString(month) || exportMonth.isPending}
      >
        {exportMonth.isPending ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          'Export'
        )}
      </button>
    </form>
  )
}
