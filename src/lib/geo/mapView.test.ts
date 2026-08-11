import type { Polygon } from 'geojson'

import { boundsForGeometries, fitZoomAndCenter } from './mapView'
import { geometryBounds } from './pointInPolygon'

const smallSquare: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [100, 13],
      [100, 13.1],
      [100.1, 13.1],
      [100.1, 13],
      [100, 13],
    ],
  ],
}

const bigSquare: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [97, 6],
      [97, 20],
      [105, 20],
      [105, 6],
      [97, 6],
    ],
  ],
}

const fitOpts = {
  scale: 2700,
  width: 500,
  height: 900,
  padding: 0.8,
  minZoom: 1,
  maxZoom: 12,
}

describe('boundsForGeometries', () => {
  it('รวม bounding box ของหลาย geometry เป็นกล่องเดียว', () => {
    expect(boundsForGeometries([smallSquare, bigSquare])).toEqual([
      97, 6, 105, 20,
    ])
  })

  it('คืน [0,0,0,0] เมื่อไม่มี geometry เลย', () => {
    expect(boundsForGeometries([])).toEqual([0, 0, 0, 0])
  })
})

describe('fitZoomAndCenter', () => {
  it('จังหวัดเล็กได้ zoom สูงกว่าจังหวัดใหญ่', () => {
    const small = fitZoomAndCenter(geometryBounds(smallSquare), fitOpts)
    const big = fitZoomAndCenter(geometryBounds(bigSquare), fitOpts)
    expect(small.zoom).toBeGreaterThan(big.zoom)
  })

  it('center คือจุดกึ่งกลาง bounding box', () => {
    const { center } = fitZoomAndCenter(geometryBounds(bigSquare), fitOpts)
    expect(center).toEqual([101, 13])
  })

  it('zoom ถูก clamp ไม่เกิน maxZoom สำหรับกล่องที่เล็กมาก', () => {
    const tiny: [number, number, number, number] = [
      100, 13, 100.0001, 13.0001,
    ]
    const { zoom } = fitZoomAndCenter(tiny, fitOpts)
    expect(zoom).toBe(fitOpts.maxZoom)
  })

  it('zoom ถูก clamp ไม่ต่ำกว่า minZoom สำหรับกล่องที่ใหญ่มาก', () => {
    const huge: [number, number, number, number] = [-179, -85, 179, 85]
    const { zoom } = fitZoomAndCenter(huge, fitOpts)
    expect(zoom).toBe(fitOpts.minZoom)
  })
})
