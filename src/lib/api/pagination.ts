export interface PaginationQuery {
  page?: number
  limit?: number
}

// backend จำกัด limit สูงสุดไว้ที่ 100 (ดู PaginationQueryDto ฝั่ง backend)
const MAX_LIMIT = 100

// endpoint ที่ backend เปิด pagination ไว้แต่ frontend ยังต้องการ "รายการทั้งหมด"
// (เช่น เอาไป filter/aggregate ฝั่ง client เอง) ให้ loop ดึงทีละหน้าด้วย limit สูงสุด
// จนกว่าหน้าที่ได้จะสั้นกว่า limit ซึ่งแปลว่าหมดแล้ว — เคสส่วนใหญ่ (≤100 รายการ) ยังเป็น
// 1 request เหมือนเดิม
export async function fetchAllPages<T>(
  fetchPage: (params: PaginationQuery) => Promise<T[]>,
): Promise<T[]> {
  const result: T[] = []
  let page = 1
  for (;;) {
    const batch = await fetchPage({ page, limit: MAX_LIMIT })
    result.push(...batch)
    if (batch.length < MAX_LIMIT) break
    page += 1
  }
  return result
}
