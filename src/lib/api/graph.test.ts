import { GraphPointSchema } from './graph'

describe('GraphPointSchema', () => {
  it('coerces string numeric aggregates into numbers', () => {
    const raw = {
      bucket: '2026-07-21T10:00:00.000Z',
      avgTemp: '4.2',
      avgHumidity: '55.7',
    }
    const parsed = GraphPointSchema.parse(raw)

    expect(parsed.avgTemp).toBe(4.2)
    expect(parsed.avgHumidity).toBe(55.7)
  })
})
