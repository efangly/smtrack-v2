import { test, expect, type Page } from '@playwright/test'

const username = process.env.E2E_ADMIN_USERNAME
const password = process.env.E2E_ADMIN_PASSWORD

async function signIn(page: Page) {
  await page.goto('/login')
  await page.getByLabel('ชื่อผู้ใช้').fill(username as string)
  await page.getByLabel('รหัสผ่าน', { exact: true }).fill(password as string)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
  await expect(page).toHaveURL('/')
}

test.describe('warranty', () => {
  test.skip(
    !username || !password,
    'ต้องตั้งค่า E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD ก่อนรันเทสนี้',
  )

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('/warranty renders its content or a permission notice', async ({
    page,
  }) => {
    await page.goto('/warranty')

    await expect(
      page.getByRole('heading', { name: 'จัดการประกัน', exact: true }),
    ).toBeVisible()

    // Card title เป็น static UI ไม่ผูกกับผลลัพธ์ backend — ต่างจากรายการประกันด้านใน
    // ที่ยังพึ่งพา resource GET /warranty ซึ่งยังไม่มีอยู่จริงในสภาพแวดล้อมนี้
    await expect(
      page
        .getByRole('heading', { name: 'รายการประกันอุปกรณ์ทั้งหมด' })
        .or(page.getByText('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')),
    ).toBeVisible()
  })
})
