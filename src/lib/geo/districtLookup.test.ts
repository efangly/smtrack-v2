import type { Feature, Polygon } from 'geojson'

import {
  districtDisplayName,
  districtKey,
  districtProvinceKey,
} from './districtLookup'

const bangkokDistrict: Feature<Polygon> = {
  type: 'Feature',
  properties: { shapeName: 'Bang Rak', PROVINCE_NAME_1: 'Bangkok Metropolis' },
  geometry: { type: 'Polygon', coordinates: [[[100, 13], [100, 14], [101, 14], [101, 13], [100, 13]]] },
}

const nonthaburiDistrict: Feature<Polygon> = {
  type: 'Feature',
  properties: { shapeName: 'Pak Kret', PROVINCE_NAME_1: 'Nonthaburi' },
  geometry: { type: 'Polygon', coordinates: [[[100, 13], [100, 14], [101, 14], [101, 13], [100, 13]]] },
}

const unknownDistrict: Feature<Polygon> = {
  type: 'Feature',
  properties: { shapeName: 'Somewhere Else', PROVINCE_NAME_1: 'Pathum Thani' },
  geometry: { type: 'Polygon', coordinates: [[[100, 13], [100, 14], [101, 14], [101, 13], [100, 13]]] },
}

describe('districtKey', () => {
  it('lowercase ชื่อเขต/อำเภอ', () => {
    expect(districtKey(bangkokDistrict)).toBe('bang rak')
  })
})

describe('districtProvinceKey', () => {
  it('lowercase ชื่อจังหวัดแม่ ให้ตรงกับ provinceKey()', () => {
    expect(districtProvinceKey(bangkokDistrict)).toBe('bangkok metropolis')
    expect(districtProvinceKey(nonthaburiDistrict)).toBe('nonthaburi')
  })
})

describe('districtDisplayName', () => {
  it('ใช้คำนำหน้า "เขต" สำหรับกรุงเทพฯ', () => {
    expect(districtDisplayName(bangkokDistrict)).toBe('เขตบางรัก')
  })

  it('ใช้คำนำหน้า "อำเภอ" สำหรับจังหวัดอื่น', () => {
    expect(districtDisplayName(nonthaburiDistrict)).toBe('อำเภอปากเกร็ด')
  })

  it('คืนชื่ออังกฤษเดิมเมื่อไม่มีในตารางแปล', () => {
    expect(districtDisplayName(unknownDistrict)).toBe('อำเภอSomewhere Else')
  })
})
