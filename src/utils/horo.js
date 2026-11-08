/**
 * ดวงประจำวัน — ตรรกะล้วน (spec: docs/superpowers/specs/2026-11-09-horoscope-design.md)
 * ราศีแบบไทย = นิรายนะ (Lahiri ayanamsa) · ตำแหน่งดาวจาก astronomy-engine
 * เทส: node --test src/utils/horo.test.js
 */
import * as Astro from 'astronomy-engine'
import { TAROT } from '../data/tarot.js'
import { HOUSES, LUCKY_COLORS, SIGNS, SIGN_ICONS } from '../data/horoHouses.js'

export { SIGNS, SIGN_ICONS }
export const HORO_V = 2                       // 2 = ลัคนาแบบไทย (อันโตนาที) · ค่าเก่าใน user doc จะถูกคำนวณใหม่ตอนเปิดดวง
export const DEFAULT_TIME = '06:00'            // ไม่รู้เวลาเกิด → ถือว่าเกิดตอนพระอาทิตย์ขึ้น (ตามที่โหรไทยนิยม)
const BKK = { lat: 13.7563, lon: 100.5018 }    // ใช้กรุงเทพฯ เป็นที่เกิดทุกคน
const BKK_MS = 7 * 3_600_000
const norm = (d) => ((d % 360) + 360) % 360
const rad = Math.PI / 180

/** Lahiri ayanamsa (องศา) โดยประมาณ — 23.853° ที่ J2000 + ~50.29″/ปี */
export function ayanamsa(date) {
  const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86_400_000)
  return 23.853 + years * (50.29 / 3600)
}
/** Date ของเวลาไทย y-m-d hh:mm */
export function bkkDate(y, m, d, time = '12:00') {
  const [hh, mm] = String(time).split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0) - BKK_MS)
}
export const siderealLon = (tropical, date) => norm(tropical - ayanamsa(date))
export const signOf = (lon) => Math.floor(norm(lon) / 30)

export function sunSign(date) {
  return signOf(siderealLon(Astro.SunPosition(date).elon, date))
}
export function moonSign(date) {
  return signOf(siderealLon(Astro.EclipticGeoMoon(date).lon, date))
}
/** ลัคนา (ราศีที่กำลังขึ้นทางตะวันออก) ที่กรุงเทพฯ */
export function ascendantLon(date, lat = BKK.lat, lon = BKK.lon) {
  const ramc = norm(Astro.SiderealTime(date) * 15 + lon) * rad
  const eps = 23.4393 * rad
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat * rad) * Math.sin(eps)))
  return norm(asc / rad)
}
export function ascendantSign(date) {
  return signOf(siderealLon(ascendantLon(date), date))
}

/**
 * ลัคนาแบบโหราศาสตร์ไทย "อันโตนาทีสามัญ อาทิตย์อุทัย 06:00" (แบบที่ myhora/หมอดูไทยใช้)
 * 06:00 ลัคนา = ตำแหน่งอาทิตย์ · จากนั้นเดินไปตามเวลาที่แต่ละราศีใช้ขึ้น (นาที, รวม 1440)
 * ต่างจากลัคนาดาราศาสตร์ได้ถึง ~1 ราศี — คนไทยคุ้นกับแบบนี้ (เทียบ myhora 9 พ.ย. 2026)
 */
export const ANTONATI = [120, 96, 72, 120, 144, 168, 168, 144, 120, 72, 96, 120]
export function thaiLagnaLon(sunLon, time) {
  const [hh, mm] = String(time).split(':').map(Number)
  let t = (((hh || 0) * 60 + (mm || 0) - 360) % 1440 + 1440) % 1440
  let sign = signOf(sunLon), deg = norm(sunLon) % 30
  let left = (30 - deg) / 30 * ANTONATI[sign]          // นาทีที่เหลือของราศีอาทิตย์
  while (t >= left) { t -= left; sign = (sign + 1) % 12; deg = 0; left = ANTONATI[sign] }
  return sign * 30 + deg + (t / ANTONATI[sign]) * 30
}

/** วันในสัปดาห์ที่เกิด 0–6 · พุธหลัง 18:00 = 7 (ราหู) — เฉพาะเมื่อกรอกเวลา */
export function birthDow(y, m, d, time) {
  const dow = new Date(Date.UTC(y || 2000, m - 1, d)).getUTCDay()
  if (dow === 3 && time && Number(time.split(':')[0]) >= 18) return 7
  return dow
}

/**
 * สรุปข้อมูลเกิด → ค่าที่เก็บใน user doc (ไม่ลับ)
 * ไม่รู้ปี → ใช้ปีปัจจุบันหาราศี (ราศีอาทิตย์คลาดไม่เกินวันเดียวตรงรอยต่อ) และไม่มีลัคนา
 */
export function birthProfile({ d, m, y, time }) {
  const yy = y || new Date().getFullYear()
  const t = time || '12:00'
  const date = bkkDate(yy, m, d, t)
  const sign = sunSign(date)
  const dow = y ? birthDow(y, m, d, time) : null
  let asc = null
  if (y) {
    const t2 = time || DEFAULT_TIME, at = bkkDate(y, m, d, t2)
    asc = signOf(thaiLagnaLon(siderealLon(Astro.SunPosition(at).elon, at), t2))
  }
  return { sign, dow, asc, ascApprox: !!y && !time, v: HORO_V }
}

// ── seed คงที่ทั้งวัน ──
export function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ไพ่ประจำวัน — uid+วัน เดิม = ใบเดิม · กลับหัว ~30% */
export function dailyCard(uid, day) {
  const r = rng(hashStr(`tarot|${uid}|${day}`))
  const card = TAROT[Math.floor(r() * TAROT.length)]
  return { card, reversed: r() < 0.3 }
}

/** วันที่ไทย 'YYYY-MM-DD' → เที่ยงวันไทย (ใช้หาตำแหน่งจันทร์ของวัน) */
export const noonOf = (day) => new Date(Date.parse(day + 'T12:00:00Z') - BKK_MS)

/** ดวงรายวัน: เรือนจันทร์จรนับจากราศีเกิด + ข้อความเลือกตาม seed */
export function dailyReading(sign, day, uid = '') {
  const moon = moonSign(noonOf(day))
  const house = HOUSES[norm((moon - sign) * 30) / 30]
  const r = rng(hashStr(`horo|${uid}|${day}`))
  const pick = (arr) => arr[Math.floor(r() * arr.length)]
  return {
    moon, house,
    work: pick(house.work), money: pick(house.money), love: pick(house.love),
    luckyNums: [1 + Math.floor(r() * 9), Math.floor(r() * 10)],
  }
}

export const colorsFor = (dow) => (dow == null ? null : LUCKY_COLORS[dow])
