// PvP season — pure: ซีซั่น = เดือนปฏิทิน "เวลาไทย" (+07) · รีแบบ soft (บีบเข้ากลาง ไม่รีเป็น 0 = ไม่ลงโทษ)
// หอคอยใช้ซีซั่นเดียวกัน (แอดมินกดแจกรางวัล + รีเซ็ตหอคอยทีเดียว · ดู utils/seasonRewards.js)
import { PVP_RATING_START } from './pvpRating.js'

export const SEASON_SOFT_KEEP = 0.5   // คงระยะห่างจากฐานครึ่งเดียวเมื่อขึ้นซีซั่นใหม่
const TZ = 7 * 3600000                // ตัดเดือนตามเวลาไทย ไม่งั้นเครื่องต่างโซนขึ้นซีซั่นไม่พร้อมกัน

export const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                         'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

/** 'YYYY-MM' ตามเวลาไทย */
export function currentSeasonId(date = new Date()) {
  const th = new Date(date.getTime() + TZ)
  const y = th.getUTCFullYear()
  const m = String(th.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** 'YYYY-MM' → 'ก.ย.' · withYear → 'ก.ย. 69' (ชื่อ achievement ต้องมีปี ไม่งั้นปีหน้าชนกัน) */
export function seasonMonthLabel(seasonId, withYear = false) {
  const id = String(seasonId)
  const m = TH_MONTH[Number(id.slice(5, 7)) - 1]
  if (!m) return id
  return withYear ? `${m} ${String(Number(id.slice(0, 4)) + 543).slice(2)}` : m
}

/** ms (epoch) ของ 00:00 น. เวลาไทย วันที่ 1 เดือนถัดไป = เวลาจบซีซั่นปัจจุบัน */
export function seasonEndMs(now = Date.now()) {
  const th = new Date(now + TZ)
  return Date.UTC(th.getUTCFullYear(), th.getUTCMonth() + 1, 1) - TZ
}

/** ถ้าข้ามซีซั่น → soft-reset (บีบเข้ากลาง, รี wins/losses, stamp) + เก็บผลซีซั่นก่อนไว้ใน `last`
 *  (แอดมินอ่าน `last` ตอนแจกรางวัล — ไม่งั้นคนที่บุกวันที่ 1 จะลบหลักฐานของเดือนก่อนทิ้ง)
 *  ไม่งั้นคืน pvp เดิม */
export function applySeasonReset(pvp, season) {
  const cur = pvp || {}
  if (cur.seasonId === season) return cur
  const rating = typeof cur.rating === 'number' ? cur.rating : PVP_RATING_START
  const compressed = Math.round(PVP_RATING_START + (rating - PVP_RATING_START) * SEASON_SOFT_KEEP)
  const next = { rating: compressed, wins: 0, losses: 0, seasonId: season }
  if (cur.seasonId) next.last = { seasonId: cur.seasonId, rating, wins: cur.wins || 0, losses: cur.losses || 0 }
  return next
}

/** ผลอารีน่าของซีซั่น `season` จาก pvp ดิบใน user doc (ซีซั่นนั้นยังเป็นปัจจุบัน หรือถูกเก็บลง last แล้ว) · null = ไม่มี */
export function pvpOfSeason(pvp, season) {
  if (pvp?.seasonId === season) return pvp
  if (pvp?.last?.seasonId === season) return pvp.last
  return null
}
