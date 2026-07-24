import { test, expect } from '@playwright/test'

test('notifications page renders the device selector and test form', async ({
  page,
}) => {
  await page.goto('/notifications')

  await expect(
    page.getByRole('heading', { name: 'การแจ้งเตือน', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('เลือกอุปกรณ์')).toBeVisible()
})
