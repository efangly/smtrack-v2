'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="th">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-2xl font-semibold">เกิดข้อผิดพลาด</h1>
          <p className="text-base-content/60">{error.message}</p>
          <button className="btn btn-primary" onClick={reset}>
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  )
}
