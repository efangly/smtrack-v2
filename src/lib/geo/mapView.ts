import type { Geometry } from 'geojson'

import { geometryBounds } from './pointInPolygon'

// raw web mercator (ไม่มี translate ผูกกับ container จริง ใช้แค่หาสัดส่วนความกว้าง/สูงที่
// โปรเจกต์แล้วของ bounding box หนึ่งกล่อง เพื่อคำนวณ zoom ที่พอดีกับ viewport) — คำนวณเองแทนพึ่ง
// d3-geo ด้วยเหตุผลเดียวกับ pointInPolygon.ts (เลี่ยงปัญหา ESM/jest transform)
function mercatorX(lngDeg: number): number {
  return (lngDeg * Math.PI) / 180
}

function mercatorY(latDeg: number): number {
  const latRad = (latDeg * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2))
}

// รวม bounding box ของหลาย geometry เป็นกล่องเดียว [minLng, minLat, maxLng, maxLat] —
// ใช้ตอน fit-to-bounds ของกลุ่มจังหวัด (เช่น กรุงเทพฯ+ปริมณฑล) แทนจังหวัดเดียว
export function boundsForGeometries(
  geometries: Geometry[],
): [number, number, number, number] {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  for (const geometry of geometries) {
    const [gMinLng, gMinLat, gMaxLng, gMaxLat] = geometryBounds(geometry)
    if (gMinLng < minLng) minLng = gMinLng
    if (gMinLat < minLat) minLat = gMinLat
    if (gMaxLng > maxLng) maxLng = gMaxLng
    if (gMaxLat > maxLat) maxLat = gMaxLat
  }

  if (!Number.isFinite(minLng)) return [0, 0, 0, 0]
  return [minLng, minLat, maxLng, maxLat]
}

// คำนวณจุดกึ่งกลาง + zoom level ที่พอดี (fit) กับ bounding box ที่กำหนด ภายใต้ projection
// geoMercator scale เดียวกับที่ ComposableMap ใช้จริง — แทนที่ fixed zoom level เดิมที่ใช้ค่า
// เดียวกันไม่ว่าจังหวัดจะเล็กหรือใหญ่แค่ไหน
export function fitZoomAndCenter(
  bounds: [number, number, number, number],
  opts: {
    scale: number
    width: number
    height: number
    padding: number
    minZoom: number
    maxZoom: number
  },
): { center: [number, number]; zoom: number } {
  const [minLng, minLat, maxLng, maxLat] = bounds
  const center: [number, number] = [
    (minLng + maxLng) / 2,
    (minLat + maxLat) / 2,
  ]

  const projectedWidth =
    opts.scale * Math.abs(mercatorX(maxLng) - mercatorX(minLng))
  const projectedHeight =
    opts.scale * Math.abs(mercatorY(maxLat) - mercatorY(minLat))

  if (projectedWidth === 0 || projectedHeight === 0) {
    return { center, zoom: opts.minZoom }
  }

  const zoomX = (opts.width * opts.padding) / projectedWidth
  const zoomY = (opts.height * opts.padding) / projectedHeight
  const zoom = Math.min(zoomX, zoomY)

  return {
    center,
    zoom: Math.min(opts.maxZoom, Math.max(opts.minZoom, zoom)),
  }
}
