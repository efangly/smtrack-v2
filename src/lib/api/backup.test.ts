import { exportMonth, restoreMonth, removeRestoreMonth } from './backup'

describe('backup month validation', () => {
  it.each([
    ['exportMonth', exportMonth],
    ['restoreMonth', restoreMonth],
    ['removeRestoreMonth', removeRestoreMonth],
  ])(
    '%s rejects a malformed month string before calling the API',
    async (_name, fn) => {
      await expect(fn('2026-13')).rejects.toThrow(/Invalid month format/)
      await expect(fn('not-a-month')).rejects.toThrow(/Invalid month format/)
    },
  )
})
