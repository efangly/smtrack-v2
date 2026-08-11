import type { Feature, Geometry } from 'geojson'

import { districtPrefix, toDistrictNameTh } from './districtNamesTh'

// key ที่ใช้ระบุเขต/อำเภอแต่ละแห่งในกลุ่ม กทม./ปริมณฑล — ใช้ property `shapeName` ตรงๆ
// (ไม่มีปัญหาโพลิกอนซ้ำแบบจังหวัดที่ต้องตัดคำต่อท้ายแบบ provinceKey)
export function districtKey(feature: Feature<Geometry>): string {
  return String(feature.properties?.shapeName ?? '')
    .trim()
    .toLowerCase()
}

// key ของจังหวัดแม่ (property `PROVINCE_NAME_1`) — ต้อง lowercase ให้ตรงกับ provinceKey()
// เพื่อเทียบกับ BANGKOK_METRO_KEYS ใน HospitalMap.tsx ได้
export function districtProvinceKey(feature: Feature<Geometry>): string {
  return String(feature.properties?.PROVINCE_NAME_1 ?? '')
    .trim()
    .toLowerCase()
}

export function districtDisplayName(feature: Feature<Geometry>): string {
  const nameEn = String(feature.properties?.shapeName ?? '')
  const provinceNameEn = String(feature.properties?.PROVINCE_NAME_1 ?? '')
  const nameTh = toDistrictNameTh(nameEn) || nameEn
  return `${districtPrefix(provinceNameEn)}${nameTh}`
}
