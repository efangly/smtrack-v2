import { DailyRollupSchema } from './logday'

describe('DailyRollupSchema', () => {
  it('coerces string numeric aggregates (as returned by pg) into numbers', () => {
    const raw = {
      day: '2026-07-01T00:00:00.000Z',
      serial: 'DEV-001',
      avgTemp: '4.523',
      minTemp: '2.100',
      maxTemp: '7.900',
      samples: '42',
    }

    const parsed = DailyRollupSchema.parse(raw)

    expect(parsed.avgTemp).toBe(4.523)
    expect(parsed.minTemp).toBe(2.1)
    expect(parsed.maxTemp).toBe(7.9)
    expect(parsed.samples).toBe(42)
  })

  it('accepts already-numeric aggregates', () => {
    const raw = {
      day: '2026-07-01T00:00:00.000Z',
      serial: 'DEV-001',
      avgTemp: 4.5,
      minTemp: 2,
      maxTemp: 8,
      samples: 10,
    }

    expect(DailyRollupSchema.parse(raw)).toEqual(raw)
  })
})
