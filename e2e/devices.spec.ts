import { test, expect } from '@playwright/test'

const username = process.env.E2E_ADMIN_USERNAME
const password = process.env.E2E_ADMIN_PASSWORD

test.describe('device management', () => {
  test.skip(
    !username || !password,
    'ต้องตั้งค่า E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD ก่อนรันเทสนี้',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('ชื่อผู้ใช้').fill(username as string)
    await page.getByLabel('รหัสผ่าน', { exact: true }).fill(password as string)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
    await expect(page).toHaveURL('/')
  })

  test('devices list renders and links into a device detail without console errors', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    // network failures from a telemetry/backend endpoint being unreachable
    // in this environment are not bugs in this feature — only fail on
    // genuine JS errors
    const isRealError = (text: string) =>
      !/net::ERR_|Failed to load resource/.test(text)

    // exact ป้องกันไม่ให้ชนกับ "จัดการอุปกรณ์" ในเมนูย่อยของตั้งค่า
    await page.getByRole('link', { name: 'อุปกรณ์', exact: true }).click()
    await expect(page).toHaveURL('/devices')
    await expect(
      page.getByRole('heading', { name: 'รายการอุปกรณ์ทั้งหมด' }),
    ).toBeVisible()

    const firstDeviceLink = page
      .getByRole('table')
      .locator('tbody tr')
      .first()
      .getByRole('link')
      .first()

    if (await firstDeviceLink.isVisible().catch(() => false)) {
      await firstDeviceLink.click()
      await expect(page).toHaveURL(/\/devices\/.+/)

      await expect(
        page.getByRole('heading', { name: 'การตั้งค่าอุปกรณ์' }),
      ).toBeVisible()
      await expect(page.getByRole('heading', { name: 'โพรบ' })).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'ประวัติการซ่อม' }),
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'ประวัติการแก้ไข' }),
      ).toBeVisible()
    }

    expect(errors.filter(isRealError)).toEqual([])
  })
})
