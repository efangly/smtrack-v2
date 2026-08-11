import type { Feature, Polygon } from 'geojson'

import {
  findProvinceForPoint,
  parseLatLng,
  provinceDisplayName,
  provinceKey,
} from './provinceLookup'

// สี่เหลี่ยมเล็กๆ ครอบพื้นที่ lng 100-101, lat 10-11 (ทิศทวนเข็มนาฬิกาตาม right-hand rule
// ของ GeoJSON/RFC7946 เมื่อมองจากนอกทรงกลม)
const squareFeature: Feature<Polygon> = {
  type: 'Feature',
  properties: { NAME_1: 'Test Province' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [100, 10],
        [100, 11],
        [101, 11],
        [101, 10],
        [100, 10],
      ],
    ],
  },
}

const songkhlaLakeFeature: Feature<Polygon> = {
  type: 'Feature',
  properties: { NAME_1: 'Songkhla (Songkhla Lake)' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [102, 20],
        [102, 21],
        [103, 21],
        [103, 20],
        [102, 20],
      ],
    ],
  },
}

describe('findProvinceForPoint', () => {
  it('คืน feature ของจังหวัดที่จุดตกอยู่ข้างใน', () => {
    const result = findProvinceForPoint(
      [squareFeature, songkhlaLakeFeature],
      [100.5, 10.5],
    )
    expect(result).toBe(squareFeature)
  })

  it('คืน null เมื่อจุดไม่ตกในจังหวัดไหนเลย (เช่น ไม่มีในระบบอย่างบึงกาฬ)', () => {
    const result = findProvinceForPoint(
      [squareFeature, songkhlaLakeFeature],
      [0, 0],
    )
    expect(result).toBeNull()
  })
})

describe('provinceKey', () => {
  it('ตัดคำต่อท้าย (Songkhla Lake) ออกก่อนใช้เป็น key เพื่อ group รวมกับจังหวัดหลัก', () => {
    expect(provinceKey(songkhlaLakeFeature)).toBe('songkhla')
  })

  it('lowercase ชื่อจังหวัดปกติ', () => {
    expect(provinceKey(squareFeature)).toBe('test province')
  })
})

describe('provinceDisplayName', () => {
  it('แปลชื่ออังกฤษที่รู้จักเป็นภาษาไทย', () => {
    const feature: Feature<Polygon> = {
      ...squareFeature,
      properties: { NAME_1: 'Chiang Mai' },
    }
    expect(provinceDisplayName(feature)).toBe('เชียงใหม่')
  })

  it('คืนชื่อเดิมเมื่อไม่มีในตารางแปล', () => {
    expect(provinceDisplayName(squareFeature)).toBe('Test Province')
  })
})

describe('parseLatLng', () => {
  it('parse ค่า string เป็น [lng, lat]', () => {
    expect(parseLatLng('13.7563', '100.5018')).toEqual([100.5018, 13.7563])
  })

  it('คืน null เมื่อค่าเป็น null', () => {
    expect(parseLatLng(null, '100.5')).toBeNull()
    expect(parseLatLng('13.7', null)).toBeNull()
  })

  it('คืน null เมื่อ parse ไม่ได้', () => {
    expect(parseLatLng('abc', '100.5')).toBeNull()
  })

  it('คืน null เมื่อค่านอกช่วงพิกัดที่เป็นไปได้', () => {
    expect(parseLatLng('999', '100.5')).toBeNull()
    expect(parseLatLng('13.7', '999')).toBeNull()
  })
})
