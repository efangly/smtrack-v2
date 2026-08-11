import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

const PROVINCES_URL = '/geo/thailand-provinces.topojson'
const OBJECT_KEY = 'thailand-provinces'

let cache: Promise<Feature<Geometry>[]> | null = null

// เก็บ promise เดียวไว้ใช้ร่วมกันทั้งแอป กัน fetch/parse ไฟล์ topojson (~200KB) ซ้ำ
// ทุกครั้งที่ HospitalMap หรือ province aggregation hook ถูก mount
export function loadProvinceFeatures(): Promise<Feature<Geometry>[]> {
  if (!cache) {
    cache = fetch(PROVINCES_URL)
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

export { PROVINCES_URL }
