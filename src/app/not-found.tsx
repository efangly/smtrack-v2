import Link from 'next/link'

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">ไม่พบหน้าที่ต้องการ</h1>
      <Link href="/" className="btn btn-primary">
        กลับหน้าแรก
      </Link>
    </div>
  )
}
