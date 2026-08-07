import { classifyNotification } from './notificationType'

describe('classifyNotification', () => {
  it('classifies box-level report messages', () => {
    expect(classifyNotification('REPORT/TEMP 25.0 C, HUMI 60%').category).toBe(
      'report',
    )
  })

  it('classifies box-level temp-over messages as error', () => {
    const result = classifyNotification('TEMP/OVER')
    expect(result.category).toBe('temp')
    expect(result.tone).toBe('error')
  })

  it('classifies probe-level temp back-to-normal as success', () => {
    const result = classifyNotification('PROBE1/TEMP/NORMAL')
    expect(result.category).toBe('temp')
    expect(result.tone).toBe('success')
  })

  it('classifies probe-level door open as error', () => {
    const result = classifyNotification('PROBE1/DOOR1/ON')
    expect(result.category).toBe('door')
    expect(result.tone).toBe('error')
  })

  it('classifies probe-level door closed as success', () => {
    const result = classifyNotification('PROBE1/DOOR1/OFF')
    expect(result.category).toBe('door')
    expect(result.tone).toBe('success')
  })

  it('classifies sdcard-off messages', () => {
    const result = classifyNotification('SD/OFF')
    expect(result.category).toBe('sdcard')
    expect(result.tone).toBe('error')
  })

  it('classifies probe-level sensor connect as success', () => {
    const result = classifyNotification('PROBE2/SENSOR/ON')
    expect(result.category).toBe('sensor')
    expect(result.tone).toBe('success')
  })

  it('classifies probe-level sensor disconnect as error', () => {
    const result = classifyNotification('PROBE2/SENSOR/OFF')
    expect(result.category).toBe('sensor')
    expect(result.tone).toBe('error')
  })

  it('classifies internet-off messages', () => {
    const result = classifyNotification('INTERNET/OFF')
    expect(result.category).toBe('internet')
    expect(result.tone).toBe('error')
  })

  it('classifies plug/power-off messages', () => {
    const result = classifyNotification('AC/OFF')
    expect(result.category).toBe('plug')
    expect(result.tone).toBe('error')
  })

  it('falls back to other for unrecognized messages', () => {
    const result = classifyNotification('unrecognized message')
    expect(result.category).toBe('other')
    expect(result.tone).toBe('muted')
  })
})
