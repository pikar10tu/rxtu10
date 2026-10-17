// towerHall — จารึกหอคอย (user สั่ง 17 ต.ค. 2026): คนที่เคยไต่เกินชั้น 100 + ซีซั่นที่ทำได้ · ไม่หายตอนรีเซตซีซั่น
// แอดมินเขียนตอนกดแจกรางวัลซีซั่น (AdminView.paySeason) ลง roster/current.towerHall · 1 คน = 1 แถว (สถิติดีสุดของคนนั้น)
// เทส: node --test src/utils/towerHall.test.js
import { TOWER_MAX } from '../data/towerFloors.js'

export const HALL_MAX = 30   // กัน roster/current โตไม่จำกัด

/**
 * @param {Array<{uid,name,floor,season}>|null} prev  จารึกเดิม
 * @param {Array<{uid,nickname,towerBest}>} users     ค่า ณ ตอนปิดซีซั่น (ก่อนรีเซต)
 * @param {string} season 'YYYY-MM' ซีซั่นที่เพิ่งจบ
 * @returns {Array<{uid,name,floor,season}>} เรียงชั้นมาก→น้อย · เสมอ = ทำได้ก่อนอยู่บน
 */
export function mergeTowerHall(prev, users, season) {
  const by = new Map((prev || []).filter(e => e?.uid).map(e => [e.uid, e]))
  for (const u of users || []) {
    const floor = u?.towerBest || 0
    if (floor <= TOWER_MAX) continue
    const old = by.get(u.uid)
    if (!old || floor > old.floor) by.set(u.uid, { uid: u.uid, name: u.nickname || '?', floor, season })
    else if (u.nickname && old.name !== u.nickname) by.set(u.uid, { ...old, name: u.nickname })   // ชื่อเล่นเปลี่ยน → ตามชื่อใหม่ สถิติเดิม
  }
  return [...by.values()]
    .sort((a, b) => (b.floor - a.floor) || String(a.season).localeCompare(String(b.season)))
    .slice(0, HALL_MAX)
}
