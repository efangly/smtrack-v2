'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { X } from 'lucide-react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  createCoordinates,
} from '@vnedyalk0v/react19-simple-maps'

import type { Hospital } from '@/lib/api/hospitals'
import { HOS_TYPE_LABELS } from '@/lib/api/hospitals'
import {
  districtDisplayName,
  districtKey,
  districtProvinceKey,
} from '@/lib/geo/districtLookup'
import { loadDistrictFeatures } from '@/lib/geo/loadDistricts'
import { loadProvinceFeatures } from '@/lib/geo/loadProvinces'
import { boundsForGeometries, fitZoomAndCenter } from '@/lib/geo/mapView'
import { geometryBounds, pointInGeometry } from '@/lib/geo/pointInPolygon'
import {
  findProvinceForPoint,
  parseLatLng,
  provinceDisplayName,
  provinceKey,
} from '@/lib/geo/provinceLookup'
import type { HospitalDeviceStats } from '@/hooks/useHospitalDeviceStats'

const THAILAND_CENTER = createCoordinates(101, 13.2)
const DEFAULT_ZOOM = 1
const MAX_ZOOM = 12
const MAP_SCALE = 2700
const MAP_WIDTH = 500
const MAP_HEIGHT = 900
const FIT_PADDING = 0.8

// กรุงเทพฯ + ปริมณฑลที่ติดกันแน่นจนคลิกแยกจังหวัดยากถ้าซูมเข้าทีละจังหวัดตรงๆ — จัดเป็นด่านซูมกลาง
// (metro) ก่อน ให้เห็นทั้งกลุ่มชัดเจนแล้วค่อยคลิกซ้ำเพื่อซูมเข้าจังหวัดเดียว
const BANGKOK_METRO_KEYS = new Set([
  'bangkok metropolis',
  'nonthaburi',
  'pathum thani',
  'samut prakan',
])

type MapView =
  | { level: 'country' }
  | { level: 'metro' }
  | { level: 'province'; key: string; from: 'country' | 'metro' }
  | { level: 'district'; key: string; provinceKey: string }

type AreaStats = HospitalDeviceStats & {
  displayName: string
  hospitalCount: number
}

function ratioColor(online: number, total: number): string {
  if (total === 0) return 'var(--color-base-300)'
  const ratio = online / total
  return `color-mix(in oklch, var(--color-success) ${Math.round(ratio * 100)}%, var(--color-error))`
}

export function HospitalMap({
  hospitals,
  statsByHospitalId,
  onEditHospital,
}: {
  hospitals: Hospital[]
  statsByHospitalId: Map<string, HospitalDeviceStats>
  onEditHospital?: (hospital: Hospital) => void
}) {
  const [provinceFeatures, setProvinceFeatures] = useState<
    Feature<Geometry>[] | null
  >(null)
  const [districtFeatures, setDistrictFeatures] = useState<
    Feature<Geometry>[] | null
  >(null)
  const [loadError, setLoadError] = useState(false)
  const [view, setView] = useState<MapView>({ level: 'country' })
  // k จริงของ ZoomableGroup ("scale(k)" ที่ครอบทุกอย่างรวมถึง Geography/Marker) — library นี้ไม่หัก
  // ลบ scale ให้ marker/text/stroke เอง ต้องหารด้วยค่านี้เองไม่งั้นบวมตาม zoom (ยิ่งเข้าเขตเล็กๆ ยิ่งชัด)
  // ใช้ค่าจาก event จริง (onMove/onMoveEnd) ไม่ใช่แค่ค่าที่เราสั่งซูมไป เพราะผู้ใช้ pinch/scroll ต่อได้เอง
  const [liveZoom, setLiveZoom] = useState(DEFAULT_ZOOM)
  const [prevZoom, setPrevZoom] = useState(DEFAULT_ZOOM)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null,
  )
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    let cancelled = false
    loadProvinceFeatures()
      .then((features) => {
        if (!cancelled) setProvinceFeatures(features)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedHospital) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [selectedHospital])

  // โหลดขอบเขตเขต/อำเภอ (~14.5KB) แบบขี้เกียจ — เฉพาะตอนผู้ใช้ซูมเข้ากลุ่ม กทม./ปริมณฑล
  // ครั้งแรกเท่านั้น ไม่ต้องโหลดถ้าไม่เคยเข้าโซนนี้เลย โหลดไม่สำเร็จก็ fallback ไปแสดงจังหวัด
  // เดิมโดยไม่ error ให้ผู้ใช้เห็น (แค่ไม่มีการซูมระดับเขต/อำเภอให้ใช้)
  const inMetroFlow =
    view.level === 'metro' ||
    view.level === 'district' ||
    (view.level === 'province' && BANGKOK_METRO_KEYS.has(view.key))
  useEffect(() => {
    if (!inMetroFlow || districtFeatures) return
    let cancelled = false
    loadDistrictFeatures()
      .then((features) => {
        if (!cancelled) setDistrictFeatures(features)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [inMetroFlow, districtFeatures])

  // จับคู่ รพ. แต่ละแห่งเข้ากับจังหวัดด้วย point-in-polygon (ไม่มีฟิลด์จังหวัดเก็บจริง) —
  // รพ. ที่พิกัดว่าง/parse ไม่ได้/ไม่ตกในจังหวัดไหนเลย จะถูกข้ามจากแผนที่ (นับจำนวนไว้แสดง note)
  const { hospitalsWithLocation, skippedCount } = useMemo(() => {
    if (!provinceFeatures)
      return { hospitalsWithLocation: [], skippedCount: 0 }

    let skipped = 0
    const located: {
      hospital: Hospital
      coordinates: [number, number]
      province: Feature<Geometry>
    }[] = []

    for (const hospital of hospitals) {
      const coordinates = parseLatLng(
        hospital.hosLatitude,
        hospital.hosLongitude,
      )
      const province =
        coordinates && findProvinceForPoint(provinceFeatures, coordinates)
      if (!coordinates || !province) {
        skipped += 1
        continue
      }
      located.push({ hospital, coordinates, province })
    }

    return { hospitalsWithLocation: located, skippedCount: skipped }
  }, [hospitals, provinceFeatures])

  const provinceStats = useMemo(() => {
    const stats = new Map<string, AreaStats>()
    for (const { hospital, province } of hospitalsWithLocation) {
      const key = provinceKey(province)
      const hospitalStats = statsByHospitalId.get(hospital.id) ?? {
        online: 0,
        offline: 0,
        total: 0,
      }
      const existing = stats.get(key) ?? {
        online: 0,
        offline: 0,
        total: 0,
        hospitalCount: 0,
        displayName: provinceDisplayName(province),
      }
      stats.set(key, {
        online: existing.online + hospitalStats.online,
        offline: existing.offline + hospitalStats.offline,
        total: existing.total + hospitalStats.total,
        hospitalCount: existing.hospitalCount + 1,
        displayName: existing.displayName,
      })
    }
    return stats
  }, [hospitalsWithLocation, statsByHospitalId])

  const selectedProvince = view.level === 'province' ? view.key : null

  const selectedProvinceHospitals = selectedProvince
    ? hospitalsWithLocation.filter(
        ({ province }) => provinceKey(province) === selectedProvince,
      )
    : []

  // จังหวัดที่ควรแสดงเป็นเขต/อำเภอย่อยแทนตัวจังหวัดเอง — ตอนซูมเข้าจังหวัดเดียวในกลุ่ม
  // กทม./ปริมณฑล (from: 'metro') หรือซูมลึกลงไปถึงระดับเขต/อำเภอแล้ว
  const districtProvinceKeyActive =
    view.level === 'province' && BANGKOK_METRO_KEYS.has(view.key)
      ? view.key
      : view.level === 'district'
        ? view.provinceKey
        : null

  const activeDistrictFeatures = useMemo(
    () =>
      districtProvinceKeyActive && districtFeatures
        ? districtFeatures.filter(
            (feature) =>
              districtProvinceKey(feature) === districtProvinceKeyActive,
          )
        : null,
    [districtProvinceKeyActive, districtFeatures],
  )

  const isDistrictMode = Boolean(
    activeDistrictFeatures && activeDistrictFeatures.length > 0,
  )

  const districtStats = useMemo(() => {
    const stats = new Map<string, AreaStats>()
    if (!activeDistrictFeatures || !districtProvinceKeyActive) return stats
    for (const { hospital, coordinates, province } of hospitalsWithLocation) {
      if (provinceKey(province) !== districtProvinceKeyActive) continue
      const district = findProvinceForPoint(activeDistrictFeatures, coordinates)
      if (!district) continue
      const key = districtKey(district)
      const hospitalStats = statsByHospitalId.get(hospital.id) ?? {
        online: 0,
        offline: 0,
        total: 0,
      }
      const existing = stats.get(key) ?? {
        online: 0,
        offline: 0,
        total: 0,
        hospitalCount: 0,
        displayName: districtDisplayName(district),
      }
      stats.set(key, {
        online: existing.online + hospitalStats.online,
        offline: existing.offline + hospitalStats.offline,
        total: existing.total + hospitalStats.total,
        hospitalCount: existing.hospitalCount + 1,
        displayName: existing.displayName,
      })
    }
    return stats
  }, [
    activeDistrictFeatures,
    districtProvinceKeyActive,
    hospitalsWithLocation,
    statsByHospitalId,
  ])

  const selectedDistrict = view.level === 'district' ? view.key : null

  const selectedDistrictHospitals = useMemo(() => {
    if (view.level !== 'district' || !activeDistrictFeatures) return []
    const feature = activeDistrictFeatures.find(
      (district) => districtKey(district) === view.key,
    )
    if (!feature) return []
    return hospitalsWithLocation.filter(
      ({ coordinates, province }) =>
        provinceKey(province) === view.provinceKey &&
        pointInGeometry(coordinates, feature.geometry),
    )
  }, [view, activeDistrictFeatures, hospitalsWithLocation])

  const selectedAreaName =
    view.level === 'province'
      ? (provinceStats.get(view.key)?.displayName ?? view.key)
      : view.level === 'district'
        ? (districtStats.get(view.key)?.displayName ?? view.key)
        : null

  const selectedAreaHospitals =
    view.level === 'province'
      ? selectedProvinceHospitals
      : view.level === 'district'
        ? selectedDistrictHospitals
        : null

  const fitOpts = {
    scale: MAP_SCALE,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    padding: FIT_PADDING,
    minZoom: DEFAULT_ZOOM,
    maxZoom: MAX_ZOOM,
  }

  const { center, zoom } = useMemo(() => {
    if (!provinceFeatures || view.level === 'country') {
      return { center: THAILAND_CENTER, zoom: DEFAULT_ZOOM }
    }
    if (view.level === 'metro') {
      const geometries = provinceFeatures
        .filter((feature) => BANGKOK_METRO_KEYS.has(provinceKey(feature)))
        .map((feature) => feature.geometry)
      const fit = fitZoomAndCenter(boundsForGeometries(geometries), fitOpts)
      return {
        center: createCoordinates(fit.center[0], fit.center[1]),
        zoom: fit.zoom,
      }
    }
    if (view.level === 'district') {
      const feature = districtFeatures?.find(
        (district) =>
          districtKey(district) === view.key &&
          districtProvinceKey(district) === view.provinceKey,
      )
      if (feature) {
        const fit = fitZoomAndCenter(geometryBounds(feature.geometry), fitOpts)
        return {
          center: createCoordinates(fit.center[0], fit.center[1]),
          zoom: fit.zoom,
        }
      }
      // ยังโหลดขอบเขตเขต/อำเภอไม่เสร็จ — จอดที่กรอบจังหวัดแม่ไปก่อนระหว่างรอ
    }
    const provinceKeyForFit =
      view.level === 'district' ? view.provinceKey : view.key
    const feature = provinceFeatures.find(
      (province) => provinceKey(province) === provinceKeyForFit,
    )
    if (!feature) return { center: THAILAND_CENTER, zoom: DEFAULT_ZOOM }
    const fit = fitZoomAndCenter(geometryBounds(feature.geometry), fitOpts)
    return {
      center: createCoordinates(fit.center[0], fit.center[1]),
      zoom: fit.zoom,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, provinceFeatures, districtFeatures])

  // sync liveZoom ให้ตรงเป้าหมายทุกครั้งที่ zoom เปลี่ยน (คลิกซูมไปจุดใหม่ หรือคำนวณ fit ใหม่ได้
  // หลัง district ของจังหวัดโหลดเสร็จ) — ปรับ state ระหว่าง render ตรงๆ ตามแนวทางของ React แทนการใช้
  // useEffect (เลี่ยง render ซ้ำเปล่าๆ) หลังจากนี้ onMove/onMoveEnd จะคอยอัปเดตต่อเองถ้าผู้ใช้
  // pinch/scroll ซูมเพิ่มเองจากจุดนี้
  if (zoom !== prevZoom) {
    setPrevZoom(zoom)
    setLiveZoom(zoom)
  }

  function handleProvinceClick(key: string) {
    if (!provinceStats.get(key)) return
    if (BANGKOK_METRO_KEYS.has(key)) {
      if (view.level === 'metro') {
        setView({ level: 'province', key, from: 'metro' })
      } else if (!(view.level === 'province' && view.key === key)) {
        setView({ level: 'metro' })
      }
    } else {
      setView({ level: 'province', key, from: 'country' })
    }
  }

  function handleDistrictClick(feature: Feature<Geometry>) {
    const key = districtKey(feature)
    if (!districtStats.get(key)) return
    setView({
      level: 'district',
      key,
      provinceKey: districtProvinceKey(feature),
    })
  }

  function goBack() {
    if (view.level === 'district') {
      setView({ level: 'province', key: view.provinceKey, from: 'metro' })
    } else if (view.level === 'province') {
      setView(view.from === 'metro' ? { level: 'metro' } : { level: 'country' })
    } else if (view.level === 'metro') {
      setView({ level: 'country' })
    }
  }

  const geographyFeatures = isDistrictMode
    ? activeDistrictFeatures
    : provinceFeatures

  const geography = useMemo<FeatureCollection<Geometry> | null>(
    () =>
      geographyFeatures
        ? { type: 'FeatureCollection', features: geographyFeatures }
        : null,
    [geographyFeatures],
  )

  if (loadError) {
    return (
      <p className="text-error">ไม่สามารถโหลดข้อมูลแผนที่ประเทศไทยได้</p>
    )
  }

  if (!geography) {
    return <span className="loading loading-spinner loading-md" />
  }

  return (
    <div className="flex flex-col gap-3">
      {view.level !== 'country' && (
        <button
          type="button"
          className="btn btn-ghost btn-sm self-start"
          onClick={goBack}
        >
          {view.level === 'district'
            ? `← กลับไปดู${provinceStats.get(view.provinceKey)?.displayName ?? 'จังหวัด'}`
            : view.level === 'province' && view.from === 'metro'
              ? '← กลับไปดูกรุงเทพฯ-ปริมณฑล'
              : '← กลับไปดูทั้งประเทศ'}
        </button>
      )}

      <div className="viz-root mx-auto flex h-[70vh] max-h-[720px] w-full max-w-xl justify-center overflow-hidden rounded-box border border-base-300">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: MAP_SCALE }}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={{ width: 'auto', height: '100%' }}
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            onMove={(position) => setLiveZoom(position.zoom)}
            onMoveEnd={(position) => setLiveZoom(position.zoom)}
            minZoom={DEFAULT_ZOOM}
            maxZoom={MAX_ZOOM}
          >
            <Geographies geography={geography}>
              {({ geographies }) =>
                geographies.map((geo, index) => {
                  const key = isDistrictMode
                    ? districtKey(geo)
                    : provinceKey(geo)
                  const stats = isDistrictMode
                    ? districtStats.get(key)
                    : provinceStats.get(key)
                  const displayName = isDistrictMode
                    ? districtDisplayName(geo)
                    : provinceDisplayName(geo)
                  const fill = 'var(--color-base-300)'
                  const hoverFill =
                    'color-mix(in oklch, var(--color-base-300) 70%, var(--color-base-content))'
                  const isSelected = isDistrictMode
                    ? view.level === 'district' && view.key === key
                    : view.level === 'province' && view.key === key
                  // หาร liveZoom ออกเพราะ ZoomableGroup ครอบทุกอย่างด้วย scale(k) โดยไม่หักลบให้เอง —
                  // ไม่งั้นเส้นขอบหนาขึ้นตาม zoom (เห็นชัดตอนซูมเข้าเขตเล็กๆ ที่ zoom สูงมาก)
                  const defaultStrokeWidth = (isSelected ? 1.5 : 0.5) / liveZoom
                  const hoverStrokeWidth = 1 / liveZoom
                  const defaultStyle = {
                    fill,
                    stroke: 'var(--color-base-100)',
                    strokeWidth: defaultStrokeWidth,
                    outline: 'none',
                    cursor: stats ? 'pointer' : 'default',
                  }
                  const hoverStyle = {
                    fill: stats ? hoverFill : fill,
                    stroke: 'var(--color-base-content)',
                    strokeWidth: hoverStrokeWidth,
                    outline: 'none',
                    cursor: stats ? 'pointer' : 'default',
                  }
                  return (
                    <Geography
                      key={(geo as { rsmKey?: string }).rsmKey ?? `${key}-${index}`}
                      geography={geo}
                      onClick={() =>
                        isDistrictMode
                          ? handleDistrictClick(geo)
                          : handleProvinceClick(key)
                      }
                      style={{
                        default: defaultStyle,
                        hover: hoverStyle,
                        // path มี tabIndex เลย focus ได้ (คลิก/keyboard) — ถ้าไม่ใส่ state นี้ browser
                        // จะโชว์ focus outline สีน้ำเงินค้างทับแผนที่ไว้แม้ซูมออกไปแล้ว
                        pressed: hoverStyle,
                        focused: defaultStyle,
                      }}
                    >
                      <title>
                        {displayName}
                        {stats
                          ? ` — ${stats.hospitalCount} รพ. · ออนไลน์ ${stats.online}/${stats.total}`
                          : ' — ไม่มีโรงพยาบาลที่ปักหมุด'}
                      </title>
                    </Geography>
                  )
                })
              }
            </Geographies>

            {hospitalsWithLocation.map(({ hospital, coordinates, province }) => {
              const stats = statsByHospitalId.get(hospital.id) ?? {
                online: 0,
                offline: 0,
                total: 0,
              }
              const fill = ratioColor(stats.online, stats.total)
              const isMetro = BANGKOK_METRO_KEYS.has(provinceKey(province))
              // ต่างจังหวัด (ไม่ใช่ กทม./ปริมณฑล) หมุดไม่แน่นเท่ากรุงเทพฯ — โชว์ชื่อ รพ. ตัวเล็กได้
              // แม้ตอน zoom out ทั้งประเทศ ส่วนกลุ่ม กทม./ปริมณฑลยังแน่นเกินกว่าจะอ่านออกจนกว่าจะซูมเข้า
              const showLabel = view.level !== 'country' || !isMetro
              return (
                <Marker
                  key={hospital.id}
                  coordinates={createCoordinates(
                    coordinates[0],
                    coordinates[1],
                  )}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  {/* Marker ของ library นี้แค่ translate ไม่หัก scale(k) ของ ZoomableGroup ให้ —
                      ต้องหาร liveZoom เองทุกค่าที่เป็นขนาด ไม่งั้นบวมตาม zoom (ยิ่งเข้าเขตเล็กๆ ที่
                      zoom สูงมากยิ่งเห็นชัด อย่างที่เคยพังตอนซูมเข้ากรุงเทพฯ) */}
                  <circle
                    r={(view.level !== 'country' ? 6 : 3.5) / liveZoom}
                    fill={fill}
                    stroke="var(--color-base-100)"
                    strokeWidth={1 / liveZoom}
                    style={{ cursor: 'pointer' }}
                  />
                  {showLabel && (
                    <text
                      textAnchor="middle"
                      y={-10 / liveZoom}
                      style={{
                        fontSize: (view.level !== 'country' ? 8 : 5) / liveZoom,
                        fill: 'var(--color-base-content)',
                        stroke: 'var(--color-base-100)',
                        strokeWidth: (view.level !== 'country' ? 3 : 2) / liveZoom,
                        paintOrder: 'stroke',
                        pointerEvents: 'none',
                      }}
                    >
                      {hospital.hosName}
                    </text>
                  )}
                  <title>
                    {hospital.hosName} — ออนไลน์ {stats.online}/{stats.total}
                  </title>
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <p className="text-xs text-base-content/50">
        แสดง {hospitalsWithLocation.length} จาก {hospitals.length}{' '}
        โรงพยาบาลบนแผนที่
        {skippedCount > 0 &&
          ` (ข้าม ${skippedCount} แห่งที่ยังไม่มีพิกัด หรือพิกัดไม่ตรงกับจังหวัดในระบบ)`}
      </p>

      {selectedAreaHospitals && (
        <div className="rounded-box border border-base-300 p-3">
          <h4 className="mb-2 font-semibold">โรงพยาบาลใน{selectedAreaName}</h4>
          {selectedAreaHospitals.length === 0 ? (
            <p className="text-sm text-base-content/60">
              ไม่มีโรงพยาบาลที่ปักหมุดใน{selectedDistrict ? 'เขต/อำเภอ' : 'จังหวัด'}นี้
            </p>
          ) : (
            <ul className="scrollbar-slim flex max-h-48 flex-col divide-y divide-base-300 overflow-y-auto">
              {selectedAreaHospitals.map(({ hospital }) => {
                const stats = statsByHospitalId.get(hospital.id) ?? {
                  online: 0,
                  offline: 0,
                  total: 0,
                }
                return (
                  <li
                    key={hospital.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <button
                      type="button"
                      className="link-hover link text-left text-sm font-medium"
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      {hospital.hosName}
                    </button>
                    <span className="text-xs text-base-content/60">
                      ออนไลน์ {stats.online}/{stats.total}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="modal"
        onClose={() => setSelectedHospital(null)}
      >
        <div className="modal-box">
          {selectedHospital && (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold">
                  {selectedHospital.hosName}
                </h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  aria-label="ปิด"
                  onClick={() => dialogRef.current?.close()}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-1 text-sm text-base-content/70">
                {HOS_TYPE_LABELS[selectedHospital.hosType]}
                {selectedHospital.hosAddress
                  ? ` · ${selectedHospital.hosAddress}`
                  : ''}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-box bg-base-200 p-2">
                  <div className="text-base-content/60">จำนวนวอร์ด</div>
                  <div className="font-semibold">
                    {selectedHospital.ward?.length ?? 0}
                  </div>
                </div>
                <div className="rounded-box bg-base-200 p-2">
                  <div className="text-base-content/60">อุปกรณ์ออนไลน์</div>
                  <div className="font-semibold">
                    {statsByHospitalId.get(selectedHospital.id)?.online ?? 0}/
                    {statsByHospitalId.get(selectedHospital.id)?.total ?? 0}
                  </div>
                </div>
              </div>
              {onEditHospital && (
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onEditHospital(selectedHospital)
                      dialogRef.current?.close()
                    }}
                  >
                    แก้ไขโรงพยาบาล
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}
