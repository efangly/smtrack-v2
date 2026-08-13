import { test, expect, type Page } from '@playwright/test'

const username = process.env.E2E_ADMIN_USERNAME
const password = process.env.E2E_ADMIN_PASSWORD

/**
 * เมนูย่อยของตั้งค่าโชว์ตาม role ของบัญชีที่ใช้เทส และแต่ละหน้าถูก SettingsGuard คุมอยู่
 * เทสจึงยืนยันว่า "เข้าถึงได้ หรือเห็นข้อความไม่มีสิทธิ์" แทนการผูกกับ role ใด role หนึ่ง
 */
const SUB_PAGES: { path: string; heading: string }[] = [
  { path: '/settings/users', heading: 'รายการผู้ใช้งานทั้งหมด' },
  { path: '/settings/hospitals', heading: 'รายการโรงพยาบาลทั้งหมด' },
  { path: '/settings/devices', heading: 'ทะเบียนอุปกรณ์' },
]

async function signIn(page: Page) {
  await page.goto('/login')
  await page.getByLabel('ชื่อผู้ใช้').fill(username as string)
  await page.getByLabel('รหัสผ่าน', { exact: true }).fill(password as string)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
  await expect(page).toHaveURL('/')
}

test.describe('settings', () => {
  test.skip(
    !username || !password,
    'ต้องตั้งค่า E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD ก่อนรันเทสนี้',
  )

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('redirects the settings root to the account page', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings/account')

    await expect(page.getByRole('heading', { name: 'ตั้งค่า' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'บัญชีผู้ใช้' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'เปลี่ยนรหัสผ่าน' }),
    ).toBeVisible()
  })

  test('expands the settings submenu and navigates to my account', async ({
    page,
  }) => {
    await page.getByText('ตั้งค่า', { exact: true }).click()

    const accountLink = page.getByRole('link', { name: 'บัญชีของฉัน' })
    await expect(accountLink).toBeVisible()
    await accountLink.click()

    await expect(page).toHaveURL('/settings/account')
    await expect(accountLink).toHaveClass(/menu-active/)
  })

  for (const subPage of SUB_PAGES) {
    test(`${subPage.path} renders its content or a permission notice`, async ({
      page,
    }) => {
      await page.goto(subPage.path)

      // หัวข้อ <h1>ตั้งค่า</h1> มาจาก layout จึงต้องเห็นเสมอไม่ว่าจะมีสิทธิ์หรือไม่
      await expect(page.getByRole('heading', { name: 'ตั้งค่า' })).toBeVisible()

      await expect(
        page
          .getByRole('heading', { name: subPage.heading })
          .or(page.getByText('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')),
      ).toBeVisible()
    })
  }
})
