import { test, expect } from '@playwright/test'

test('dashboard overview loads without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'ภาพรวมระบบ' })).toBeVisible()
  await expect(page.getByText('อุปกรณ์ทั้งหมด')).toBeVisible()
  await expect(page.getByText('การแจ้งเตือนล่าสุด')).toBeVisible()

  expect(errors).toEqual([])
})
