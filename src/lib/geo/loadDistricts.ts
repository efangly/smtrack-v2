import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

const DISTRICTS_URL = '/geo/bangkok-metro-districts.topojson'
const OBJECT_KEY = 'bangkok-metro-districts'

let cache: Promise<Feature<Geometry>[]> | null = null

// เก็บ promise เดียวไว้ใช้ร่วมกันทั้งแอป เหมือน loadProvinceFeatures — โหลดเฉพาะตอนซูมเข้า
// กรุงเทพฯ/ปริมณฑลครั้งแรกเท่านั้น (ไม่ต้อง fetch ไฟล์นี้ถ้าไม่เคยซูมเข้าไปในกลุ่มนี้เลย)
export function loadDistrictFeatures(): Promise<Feature<Geometry>[]> {
  if (!cache) {
    cache = fetch(DISTRICTS_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        const collection = feature(
          topology,
          topology.objects[OBJECT_KEY] as GeometryCollection,
        ) as FeatureCollection<Geometry>
        return collection.features
      })
      .catch((error) => {
        cache = null
        throw error
      })
  }
  return cache
}

export { DISTRICTS_URL }
