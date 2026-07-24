import Link from 'next/link'

export default function DeviceNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-semibold">ไม่พบอุปกรณ์นี้</h2>
      <Link href="/" className="btn btn-primary">
        กลับหน้าแรก
      </Link>
    </div>
  )
}
