// แปลงชื่อเขต/อำเภอ (property `shapeName` ใน public/geo/bangkok-metro-districts.topojson
// ซึ่งเป็นชื่อภาษาอังกฤษ) เป็นชื่อไทย — key ต้อง lowercase ก่อน lookup เหมือน provinceNamesTh.ts
// เก็บเฉพาะชื่อเขต/อำเภอ ไม่รวมคำนำหน้า "เขต"/"อำเภอ" — ใช้ districtPrefix() ต่อคำนำหน้าตามจังหวัด
export const DISTRICT_NAME_TH: Record<string, string> = {
  // Bangkok Metropolis (เขต)
  'bang bon': 'บางบอน',
  'bang kapi': 'บางกะปิ',
  'bang khae': 'บางแค',
  'bang khen': 'บางเขน',
  'bang kho laem': 'บางคอแหลม',
  'bang khun thian': 'บางขุนเทียน',
  'bang na': 'บางนา',
  'bang phlat': 'บางพลัด',
  'bang rak': 'บางรัก',
  'bang sue': 'บางซื่อ',
  'bangkok noi': 'บางกอกน้อย',
  'bangkok yai': 'บางกอกใหญ่',
  'bueng kum': 'บึงกุ่ม',
  chatuchak: 'จตุจักร',
  'chom thong': 'จอมทอง',
  'din daeng': 'ดินแดง',
  'don mueang': 'ดอนเมือง',
  dusit: 'ดุสิต',
  'huai khwang': 'ห้วยขวาง',
  'khan na yao': 'คันนายาว',
  'khlong sam wa': 'คลองสามวา',
  'khlong san': 'คลองสาน',
  'khlong toei': 'คลองเตย',
  'lak si': 'หลักสี่',
  'lat krabang': 'ลาดกระบัง',
  'lat phrao': 'ลาดพร้าว',
  'min buri': 'มีนบุรี',
  'nong chok': 'หนองจอก',
  'nong khaem': 'หนองแขม',
  'pathum wan': 'ปทุมวัน',
  'phasi charoen': 'ภาษีเจริญ',
  'phaya thai': 'พญาไท',
  'phra khanong': 'พระโขนง',
  'phra nakhon': 'พระนคร',
  'pom prap sattru phai': 'ป้อมปราบศัตรูพ่าย',
  prawet: 'ประเวศ',
  'rat burana': 'ราษฎร์บูรณะ',
  ratchathewi: 'ราชเทวี',
  'sai mai': 'สายไหม',
  samphanthawong: 'สัมพันธวงศ์',
  'saphan sung': 'สะพานสูง',
  sathon: 'สาทร',
  'suan luang': 'สวนหลวง',
  'taling chan': 'ตลิ่งชัน',
  'thawi watthana': 'ทวีวัฒนา',
  'thon buri': 'ธนบุรี',
  'thung khru': 'ทุ่งครุ',
  vadhana: 'วัฒนา',
  'wang thonglang': 'วังทองหลาง',
  'yan nawa': 'ยานนาวา',

  // Nonthaburi (อำเภอ)
  'bang bua thong': 'บางบัวทอง',
  'bang kruai': 'บางกรวย',
  'bang yai': 'บางใหญ่',
  'mueang nonthaburi': 'เมืองนนทบุรี',
  'pak kret': 'ปากเกร็ด',
  'sai noi': 'ไทรน้อย',

  // Pathum Thani (อำเภอ)
  'khlong luang': 'คลองหลวง',
  'lam luk ka': 'ลำลูกกา',
  'lat lum kaeo': 'ลาดหลุมแก้ว',
  'mueang pathum thani': 'เมืองปทุมธานี',
  'nong suea': 'หนองเสือ',
  'sam khok': 'สามโคก',
  thanyaburi: 'ธัญบุรี',

  // Samut Prakan (อำเภอ)
  'bang bo': 'บางบ่อ',
  'bang phli': 'บางพลี',
  'bang sao thong': 'บางเสาธง',
  'mueang samut prakan': 'เมืองสมุทรปราการ',
  'phra pradaeng': 'พระประแดง',
  'phra samut chedi': 'พระสมุทรเจดีย์',
}

export function toDistrictNameTh(nameEn: string): string {
  const key = nameEn.trim().toLowerCase()
  return DISTRICT_NAME_TH[key] ?? nameEn
}

// กรุงเทพฯ ใช้คำนำหน้า "เขต" ส่วนจังหวัดอื่นในกลุ่มปริมณฑลใช้ "อำเภอ"
export function districtPrefix(provinceNameEn: string): string {
  return provinceNameEn.trim().toLowerCase() === 'bangkok metropolis'
    ? 'เขต'
    : 'อำเภอ'
}
