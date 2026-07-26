import { test as setup } from '@playwright/test'

const username = process.env.E2E_ADMIN_USERNAME
const password = process.env.E2E_ADMIN_PASSWORD

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  setup.skip(
    !username || !password,
    'ต้องตั้งค่า E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD ก่อนรันเทสนี้',
  )

  await page.goto('/login')
  await page.getByLabel('ชื่อผู้ใช้').fill(username as string)
  await page.getByLabel('รหัสผ่าน', { exact: true }).fill(password as string)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: authFile })
})
