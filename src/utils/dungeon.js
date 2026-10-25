// ดันเจี้ยน — ตรรกะล้วน · เทส: node --test src/utils/dungeon.test.js
import { DUNGEON_BONUS_RUNS, DUNGEON_BONUS_MULT } from '../data/dungeons.js'
import { evtOf } from './event.js'

/** จำนวนตาที่ชนะวันนี้ (เก็บใน evt.dun = { d: 'YYYY-MM-DD', n }) — วันเก่า = 0 */
export function dunWinsToday(u, ev, today) {
  const d = u?.evt?.id === ev?.id ? u?.evt?.dun : null
  return d && d.d === today ? Math.max(0, d.n | 0) : 0
}

/** รางวัลของตาที่ชนะ ตาที่ n+1 ของวัน */
export function dunReward(tier, winsBefore) {
  return tier.reward * (winsBefore < DUNGEON_BONUS_RUNS ? DUNGEON_BONUS_MULT : 1)
}

/** ตาโบนัสเหลือวันนี้ */
export const bonusLeft = (winsToday) => Math.max(0, DUNGEON_BONUS_RUNS - winsToday)

/** patch หลังชนะ 1 ตา → { local, server, pts }
 *  อีเวนต์เดียวกัน = increment แต้ม (ไม่ทับ buy) · อีเวนต์ใหม่/ยังไม่มี = เขียนทั้งก้อน */
export function dunWinPatch(u, ev, tier, today, inc) {
  const wins = dunWinsToday(u, ev, today)
  const pts = dunReward(tier, wins)
  const dun = { d: today, n: wins + 1 }
  const cur = evtOf(u, ev)
  const dc = Math.max(cur.dc || 0, tier.t)   // ผ่านขั้นนี้แล้ว = ปลดขั้นถัดไป
  const local = { evt: { ...cur, id: ev.id, pts: cur.pts + pts, got: (cur.got || 0) + pts, dun, dc } }
  const same = u?.evt?.id === ev.id
  const server = same
    ? { 'evt.pts': inc(pts), 'evt.got': inc(pts), 'evt.dun': dun, 'evt.dc': dc }
    : { evt: { id: ev.id, pts, got: pts, buy: {}, dun, dc } }
  return { local, server, pts }
}

/** ขั้นนี้เล่นได้หรือยัง — ต้องผ่านขั้นก่อนหน้าก่อน (ง่าย → กลาง → ยาก · user 25 ต.ค. 2026) */
export function tierUnlocked(u, ev, tier) {
  return tier.t <= 1 || (evtOf(u, ev).dc || 0) >= tier.t - 1
}
