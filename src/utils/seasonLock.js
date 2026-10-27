// src/utils/seasonLock.js — ล็อกอารีน่า+หอคอยช่วงเปลี่ยนซีซั่น (user 27 ต.ค. 2026) · pure
// เดือนก่อนแอดมินกดแจกช้า 10 นาที → อันดับอารีน่าเพี้ยน (คนสู้ข้ามเที่ยงคืนก่อนตัดผล)
// ⇒ ปิดตั้งแต่ 23:45 น. (เวลาไทย) วันสุดท้ายของเดือน ยาวไปจนแอดมินกด "แจกรางวัลซีซั่น" เสร็จ
//    (config/seasonPayouts.{YYYY-MM}.status === 'done') — กดช้าแค่ไหนก็ไม่มีใครสู้ข้ามซีซั่นได้
import { currentSeasonId, seasonEndMs } from './pvpSeason.js'
import { prevSeasonId } from '../data/towerMilestones.js'

export const SEASON_LOCK_MS = 15 * 60000
/** ซีซั่นแรกที่ใช้กติกาล็อก (ต.ค. 2026 จบ 31 ต.ค. 23:45) — ซีซั่นก่อนหน้าแจกไปแล้วแบบเดิม */
export const SEASON_LOCK_FROM = '2026-10'

/** เวลาปิด (ms) ของซีซั่นที่ now อยู่ = 23:45 น. วันสุดท้าย */
export const seasonCloseMs = (now = Date.now()) => seasonEndMs(now) - SEASON_LOCK_MS

/**
 * @param {number} now
 * @param {object|null|undefined} payouts  config/seasonPayouts · undefined = ยังโหลดไม่เสร็จ
 * @returns {{ locked: boolean, reason: null|'closing'|'tallying', season: string|null }}
 *   closing = 23:45–24:00 ของเดือนนี้ · tallying = ขึ้นเดือนใหม่แล้วแต่แอดมินยังไม่แจกของเดือนก่อน
 *   season = ซีซั่นที่กำลังสรุปผล
 */
export function seasonLockState(now, payouts) {
  const cur = currentSeasonId(new Date(now))
  if (cur >= SEASON_LOCK_FROM && now >= seasonCloseMs(now)) return { locked: true, reason: 'closing', season: cur }
  const prev = prevSeasonId(cur)
  // โหลดยังไม่เสร็จ (undefined) = ยังไม่ล็อก — กันจอกระพริบ "ปิด" ทุกครั้งที่เปิดหน้า · ตอนกดสู้เช็คสดอีกรอบ
  if (prev >= SEASON_LOCK_FROM && payouts !== undefined && payouts?.[prev]?.status !== 'done') {
    return { locked: true, reason: 'tallying', season: prev }
  }
  return { locked: false, reason: null, season: null }
}
