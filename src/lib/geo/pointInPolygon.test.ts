import type { Polygon, MultiPolygon } from 'geojson'

import { geometryCentroid, pointInGeometry } from './pointInPolygon'

const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ],
  ],
}

const squareWithHole: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ],
    [
      [4, 4],
      [4, 6],
      [6, 6],
      [6, 4],
      [4, 4],
    ],
  ],
}

const twoSquares: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
    [
      [
        [20, 20],
        [20, 21],
        [21, 21],
        [21, 20],
        [20, 20],
      ],
    ],
  ],
}

describe('pointInGeometry', () => {
  it('true เมื่อจุดอยู่ในสี่เหลี่ยม', () => {
    expect(pointInGeometry([5, 5], square)).toBe(true)
  })

  it('false เมื่อจุดอยู่นอกสี่เหลี่ยม', () => {
    expect(pointInGeometry([50, 50], square)).toBe(false)
  })

  it('false เมื่อจุดอยู่ในรู (hole) ของ polygon', () => {
    expect(pointInGeometry([5, 5], squareWithHole)).toBe(false)
    expect(pointInGeometry([1, 1], squareWithHole)).toBe(true)
  })

  it('true เมื่อจุดอยู่ใน polygon ใดๆ ของ MultiPolygon', () => {
    expect(pointInGeometry([0.5, 0.5], twoSquares)).toBe(true)
    expect(pointInGeometry([20.5, 20.5], twoSquares)).toBe(true)
    expect(pointInGeometry([10, 10], twoSquares)).toBe(false)
  })
})

describe('geometryCentroid', () => {
  it('คืนจุดกึ่งกลาง bounding box ของ Polygon', () => {
    expect(geometryCentroid(square)).toEqual([5, 5])
  })

  it('คืนจุดกึ่งกลาง bounding box รวมทุกส่วนของ MultiPolygon', () => {
    expect(geometryCentroid(twoSquares)).toEqual([10.5, 10.5])
  })
})
