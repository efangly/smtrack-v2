import { test, expect } from '@playwright/test'

test('unknown device serial shows the not-found page', async ({ page }) => {
  await page.goto('/devices/does-not-exist-serial')
  await expect(
    page.getByRole('heading', { name: 'ไม่พบอุปกรณ์นี้' }),
  ).toBeVisible()
})
