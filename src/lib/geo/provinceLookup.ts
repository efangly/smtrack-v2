import type { Feature, Geometry } from 'geojson'

import { pointInGeometry } from './pointInPolygon'
import { toProvinceNameTh } from './provinceNamesTh'

// เทียบพิกัด [lng, lat] กับขอบเขต GeoJSON ของแต่ละจังหวัดด้วย point-in-polygon —
// ไม่มีฟิลด์จังหวัดเก็บอยู่ที่ device/hospital เลย จึงต้องคำนวณจากพิกัดจริงแทน
// คืน null ถ้าไม่ตกอยู่ในจังหวัดไหนเลย (เช่น พิกัดผิด หรือจังหวัดที่ dataset ไม่มี เช่น บึงกาฬ)
export function findProvinceForPoint(
  features: Feature<Geometry>[],
  coordinates: [number, number],
): Feature<Geometry> | null {
  return (
    features.find((province) =>
      pointInGeometry(coordinates, province.geometry),
    ) ?? null
  )
}

export function provinceDisplayName(feature: Feature<Geometry>): string {
  const nameEn = String(feature.properties?.NAME_1 ?? '')
  return toProvinceNameTh(nameEn) || nameEn
}

// key ที่ใช้ group จังหวัดเดียวกันแม้ dataset จะแยกโพลิกอนส่วนทะเลสาบสงขลาเป็นอีก feature
// (Phatthalung / Phatthalung (Songkhla Lake) ฯลฯ) — ต้องนับรวมเป็นจังหวัดเดียวกัน
export function provinceKey(feature: Feature<Geometry>): string {
  return String(feature.properties?.NAME_1 ?? '')
    .replace(/\s*\(Songkhla Lake\)\s*/i, '')
    .trim()
    .toLowerCase()
}

export function parseLatLng(
  hosLatitude: string | null,
  hosLongitude: string | null,
): [number, number] | null {
  if (!hosLatitude || !hosLongitude) return null
  const lat = Number.parseFloat(hosLatitude)
  const lng = Number.parseFloat(hosLongitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return [lng, lat]
}
