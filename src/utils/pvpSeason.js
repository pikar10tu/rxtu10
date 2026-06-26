// PvP season — pure: ซีซั่น = เดือนปฏิทิน · รีแบบ soft (บีบเข้ากลาง ไม่รีเป็น 0 = ไม่ลงโทษ)
import { PVP_RATING_START } from './pvpRating.js'

export const SEASON_SOFT_KEEP = 0.5   // คงระยะห่างจากฐานครึ่งเดียวเมื่อขึ้นซีซั่นใหม่

/** 'YYYY-MM' ตามเวลาเครื่อง */
export function currentSeasonId(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** ถ้าข้ามซีซั่น → soft-reset (บีบเข้ากลาง, รี wins/losses, stamp); ไม่งั้นคืน pvp เดิม */
export function applySeasonReset(pvp, season) {
  const cur = pvp || {}
  if (cur.seasonId === season) return cur
  const rating = typeof cur.rating === 'number' ? cur.rating : PVP_RATING_START
  const compressed = Math.round(PVP_RATING_START + (rating - PVP_RATING_START) * SEASON_SOFT_KEEP)
  return { rating: compressed, wins: 0, losses: 0, seasonId: season }
}
