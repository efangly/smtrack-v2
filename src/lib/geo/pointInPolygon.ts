import type { Geometry, Position } from 'geojson'

// Ray-casting point-in-polygon แบบ planar (ไม่คิดความโค้งของทรงกลม) — เพียงพอสำหรับขอบเขต
// ระดับจังหวัดของไทยซึ่งไม่ข้าม antimeridian และไม่ต้องการความแม่นยำระดับสำรวจ
// เลือกทำเองแทนพึ่ง d3-geo (ESM-only) เพื่อเลี่ยงปัญหา jest transform ของ node_modules
function pointInRing(point: Position, ring: Position[]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

// ring แรกคือขอบนอก ring ที่เหลือคือรู (holes) — อยู่ในโพลิกอนก็ต่อเมื่ออยู่ในขอบนอกและไม่ได้อยู่ในรูใดเลย
function pointInPolygonRings(point: Position, rings: Position[][]): boolean {
  if (rings.length === 0 || !pointInRing(point, rings[0])) return false
  for (let i = 1; i < rings.length; i += 1) {
    if (pointInRing(point, rings[i])) return false
  }
  return true
}

export function pointInGeometry(point: Position, geometry: Geometry): boolean {
  if (geometry.type === 'Polygon') {
    return pointInPolygonRings(point, geometry.coordinates)
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((rings) =>
      pointInPolygonRings(point, rings),
    )
  }
  return false
}

// bounding box [minLng, minLat, maxLng, maxLat] ของขอบนอกทุกโพลิกอนใน geometry —
// ใช้ทั้งหาจุดกึ่งกลางกล้อง (geometryCentroid) และคำนวณ zoom-to-fit (mapView.ts)
export function geometryBounds(
  geometry: Geometry,
): [number, number, number, number] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  function visitRing(ring: Position[]) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }

  if (geometry.type === 'Polygon') {
    visitRing(geometry.coordinates[0] ?? [])
  } else if (geometry.type === 'MultiPolygon') {
    for (const rings of geometry.coordinates) visitRing(rings[0] ?? [])
  }

  if (!Number.isFinite(minX)) return [0, 0, 0, 0]
  return [minX, minY, maxX, maxY]
}

// จุดกึ่งกลาง bounding box ของขอบนอกทุกโพลิกอนใน geometry — ใช้จัดกล้องแผนที่ตอน zoom
// เข้าจังหวัด ไม่ใช่ centroid ทางคณิตศาสตร์จริง แต่แม่นยำพอสำหรับ framing ภาพ
export function geometryCentroid(geometry: Geometry): [number, number] {
  const [minX, minY, maxX, maxY] = geometryBounds(geometry)
  return [(minX + maxX) / 2, (minY + maxY) / 2]
}
