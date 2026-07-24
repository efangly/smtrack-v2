import { test, expect } from '@playwright/test'

test('sidebar renders nav links and highlights the active route on desktop', async ({
  page,
}) => {
  await page.goto('/')

  const sidebar = page.getByRole('link', { name: 'SMtrack Dashboard' })
  await expect(sidebar).toBeVisible()

  await expect(page.getByRole('link', { name: 'ภาพรวม' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'การแจ้งเตือน' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Backup / Archive' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'การแจ้งเตือน' }).click()
  await expect(page).toHaveURL('/notifications')
  await expect(page.getByRole('link', { name: 'การแจ้งเตือน' })).toHaveClass(
    /menu-active/,
  )
})

test('mobile hamburger toggles the sidebar drawer', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 800 })
  await page.goto('/')

  const drawerToggle = page.locator('#main-drawer')
  await expect(drawerToggle).not.toBeChecked()

  await page.getByRole('button', { name: 'เปิดเมนู' }).click()
  await expect(drawerToggle).toBeChecked()
})
