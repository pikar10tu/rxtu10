// รางวัลขั้นหอคอย — ทุก 10 ชั้น (user เคาะ 30 ก.ย. 2026 เดโม pvp-tower-rework)
// 🔑 หอคอยรีเซตเป็นชั้น 1 ทุกซีซั่นตอนแอดมินกดแจกรางวัล ⇒ `towerClaims` ถูกล้างพร้อมกัน = รับใหม่ได้ทุกเดือน
// ตั๋ว ×10 ทุกขั้นที่มีตั๋ว (user สั่ง "ปกติเราแจกเยอะอยู่") · ชั้น 100 มี achievement tower_100 (ฉายา) อยู่แล้ว
// เริ่มซีซั่น ต.ค. 2026 (user สั่ง 30 ก.ย. "ซีซั่นนี้ไม่อยากแจกอะไรเพิ่ม")
export const MILESTONE_START = '2026-10'

/** '2026-10' → '2026-09' */
export function prevSeasonId(season) {
  const [y, m] = season.split('-').map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
}

/**
 * เปิดรับรางวัลขั้นได้ไหม — ต้องถึงซีซั่นเริ่ม และแอดมินแจก+รีเซตหอคอยของซีซั่นก่อนเสร็จแล้ว
 * (ช่วงหลังเที่ยงคืนก่อนกดแจก towerBest ยังเป็นของเดือนเก่า ห้ามให้รับ)
 * @param {object|null} payouts  config/seasonPayouts
 */
export function milestonesOpen(season, payouts) {
  if (season < MILESTONE_START) return false
  return payouts?.[prevSeasonId(season)]?.status === 'done'
}

export const TOWER_MILESTONES = [
  { f: 10,  coins: 3000 },
  { f: 20,  coins: 5000,  antiLoss: 1 },
  { f: 30,  tickets: 10 },
  { f: 40,  coins: 10000 },
  { f: 50,  tickets: 10, antiLoss: 2, big: true },
  { f: 60,  coins: 20000 },
  { f: 70,  tickets: 10 },
  { f: 80,  coins: 20000, antiLoss: 3 },
  { f: 90,  tickets: 10 },
  { f: 100, coins: 50000, tickets: 10, big: true },
]

// 🏯 Endless (ชั้น 101+, user เคาะ 17 ต.ค. 2026 "เล็กๆน้อยๆ ต่อ 10 ชั้น") — สร้างจากสูตร ไม่จำกัดขั้น
//    สิบคี่ (110/130…) = ⚡ตั๋วพลังงาน · สิบคู่ (120/140…) = 💊ยาแก้แพ้ · ทุก 50 = ก้อนใหญ่ขึ้น
export function endlessMilestone(f) {
  if (f % 50 === 0) return { f, coins: 10000, energy: 2, antiLoss: 1, big: true }
  return (f / 10) % 2 === 1 ? { f, coins: 5000, energy: 1 } : { f, coins: 5000, antiLoss: 1 }
}

/** ทุกขั้นตั้งแต่ชั้น 10 ถึงชั้น upTo (รวม Endless) */
export function milestonesUpTo(upTo) {
  const list = TOWER_MILESTONES.filter(m => m.f <= upTo)
  for (let f = 110; f <= upTo; f += 10) list.push(endlessMilestone(f))
  return list
}

/** ขั้นที่ไปถึงแล้วแต่ยังไม่รับ */
export const claimableMilestones = (best, claims) =>
  milestonesUpTo(best || 0).filter(m => !(claims || []).includes(m.f))

/** ขั้นถัดไปที่ยังไปไม่ถึง (Endless ⇒ มีเสมอ) */
export function nextMilestone(best) {
  const b = best || 0
  return TOWER_MILESTONES.find(m => b < m.f) || endlessMilestone(Math.floor(b / 10) * 10 + 10)
}

/** รวมรางวัลหลายขั้น → { coins, tickets, antiLoss, energy } */
export function sumRewards(list) {
  return list.reduce((s, m) => ({
    coins: s.coins + (m.coins || 0), tickets: s.tickets + (m.tickets || 0),
    antiLoss: s.antiLoss + (m.antiLoss || 0), energy: s.energy + (m.energy || 0),
  }), { coins: 0, tickets: 0, antiLoss: 0, energy: 0 })
}
