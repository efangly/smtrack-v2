import { test, expect } from '@playwright/test'

import { NAV_ITEMS, SETTINGS_ITEM } from '../src/components/layout/navItems'

const username = process.env.E2E_ADMIN_USERNAME
const password = process.env.E2E_ADMIN_PASSWORD

test.describe('login (admin)', () => {
  test.skip(
    !username || !password,
    'ต้องตั้งค่า E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD ก่อนรันเทสนี้',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page
      .getByLabel('ชื่อผู้ใช้')
      .fill(username as string)
    await page
      .getByLabel('รหัสผ่าน', { exact: true })
      .fill(password as string)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
    await expect(page).toHaveURL('/')
  })

  test('logs in and shows the user role in the user menu', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'เมนูผู้ใช้' }).click()
    await expect(
      page.getByText(/^(SUPER|SERVICE|ADMIN|USER|LEGACY_ADMIN|LEGACY_USER|GUEST)$/),
    ).toBeVisible()
  })

  test('every menu item is reachable and renders without console errors', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    // network failures from the telemetry API being unreachable in this
    // environment are not menu bugs — only fail on genuine JS errors
    const isNavError = (text: string) => !/net::ERR_|Failed to load resource/.test(text)

    for (const item of [...NAV_ITEMS, SETTINGS_ITEM]) {
      await page.getByRole('link', { name: item.label }).click()
      await expect(page).toHaveURL(item.href)
      await expect(page.getByRole('link', { name: item.label })).toHaveClass(
        /menu-active/,
      )
    }

    expect(errors.filter(isNavError)).toEqual([])
  })
})
