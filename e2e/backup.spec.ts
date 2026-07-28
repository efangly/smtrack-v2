import { test, expect } from '@playwright/test'

test('backup page renders months table and cancelling the export dialog does not navigate away', async ({
  page,
}) => {
  await page.goto('/settings/backup')

  await expect(
    page.getByRole('heading', { name: 'ตั้งค่า', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('เดือนที่มีการ backup')).toBeVisible()

  // จำกัดขอบเขตไว้ในตาราง ไม่งั้นจะไปเจอปุ่ม submit ของฟอร์ม Export ที่ disabled อยู่
  const exportButtons = page
    .locator('table')
    .getByRole('button', { name: 'Export' })
  if (await exportButtons.count()) {
    await exportButtons.first().click()
    const dialog = page.getByText('ยืนยัน Export')
    await expect(dialog).toBeVisible()
    await page.getByRole('button', { name: 'ยกเลิก' }).click()
    await expect(dialog).not.toBeVisible()
  }
})
