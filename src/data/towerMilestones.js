// รางวัลขั้นหอคอย — ทุก 10 ชั้น (user เคาะ 30 ก.ย. 2026 เดโม pvp-tower-rework)
// 🔑 หอคอยรีเซตเป็นชั้น 1 ทุกซีซั่นตอนแอดมินกดแจกรางวัล ⇒ `towerClaims` ถูกล้างพร้อมกัน = รับใหม่ได้ทุกเดือน
// ตั๋ว ×10 ทุกขั้นที่มีตั๋ว (user สั่ง "ปกติเราแจกเยอะอยู่") · ชั้น 100 มี achievement tower_100 (ฉายา) อยู่แล้ว
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

/** ขั้นที่ไปถึงแล้วแต่ยังไม่รับ */
export const claimableMilestones = (best, claims) =>
  TOWER_MILESTONES.filter(m => (best || 0) >= m.f && !(claims || []).includes(m.f))

/** ขั้นถัดไปที่ยังไปไม่ถึง (null = ครบแล้ว) */
export const nextMilestone = (best) => TOWER_MILESTONES.find(m => (best || 0) < m.f) || null

/** รวมรางวัลหลายขั้น → { coins, tickets, antiLoss } */
export function sumRewards(list) {
  return list.reduce((s, m) => ({
    coins: s.coins + (m.coins || 0), tickets: s.tickets + (m.tickets || 0), antiLoss: s.antiLoss + (m.antiLoss || 0),
  }), { coins: 0, tickets: 0, antiLoss: 0 })
}
