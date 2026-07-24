'use client'

export default function DeviceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-semibold">ไม่สามารถโหลดข้อมูลอุปกรณ์ได้</h2>
      <p className="text-base-content/60">{error.message}</p>
      <button className="btn btn-primary" onClick={reset}>
        ลองใหม่
      </button>
    </div>
  )
}
