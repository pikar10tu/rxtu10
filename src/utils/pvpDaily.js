// src/utils/pvpDaily.js
// รางวัลตีครบ 5 ครั้ง/วัน กดรับ (user สั่ง 28 ก.ย. 2026) — pure
//  user doc: pvpDaily = { date: 'YYYY-MM-DD' (UTC เหมือนรายวันอื่น), n: จำนวนไฟต์วันนี้, claimed }
//  นับทั้งชนะและแพ้ (เป้าคือให้คนเข้ามาสู้)
export const PVP_DAILY_GOAL = 5
export const PVP_DAILY_REWARD = 20000

export function dailyView(pd, today) {
  const cur = pd?.date === today ? pd : { date: today, n: 0, claimed: false }
  return { date: today, n: cur.n || 0, claimed: !!cur.claimed }
}
export const bumpDaily = (pd, today) => { const v = dailyView(pd, today); return { ...v, n: v.n + 1 } }
export const canClaimDaily = (pd, today) => { const v = dailyView(pd, today); return v.n >= PVP_DAILY_GOAL && !v.claimed }
