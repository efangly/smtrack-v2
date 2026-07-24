import { test, expect } from '@playwright/test'

test('theme toggle switches to dark and persists across reloads', async ({
  page,
}) => {
  await page.goto('/')

  const html = page.locator('html')
  await page.getByRole('button', { name: 'สลับธีม' }).click()
  await page.getByRole('menuitemradio', { name: 'มืด' }).click()
  await expect(html).toHaveAttribute('data-theme', 'dark')

  await page.reload()
  await expect(html).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: 'สลับธีม' }).click()
  await page.getByRole('menuitemradio', { name: 'สว่าง' }).click()
  await expect(html).toHaveAttribute('data-theme', 'light')
})

test('notification bell opens a panel and closes on Escape', async ({
  page,
}) => {
  await page.goto('/')

  const bell = page.getByRole('button', { name: 'การแจ้งเตือน' })
  await expect(bell).toBeVisible()

  await bell.click()
  await expect(page.getByText('ศูนย์การแจ้งเตือน')).toBeVisible()
  await expect(bell).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(page.getByText('ศูนย์การแจ้งเตือน')).toHaveCount(0)
})
