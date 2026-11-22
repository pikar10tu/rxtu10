// 🕵️ จับเหรียญพุ่งผิดปกติ (22 พ.ย. 2026) — แอดมินบันทึก "จุดเทียบ" (เหรียญทุกคน ณ เวลานั้น)
// แล้วเทียบกับตอนนี้ · pure ล้วน เทสได้ · ใช้ใน components/admin/AdminCoinWatch.vue
// ⚠️ เป็นแค่ตัวช่วยชี้ ไม่ใช่หลักฐาน — ขายพืชสะสม/รางวัลซีซั่นก็ทำให้พุ่งได้ ต้องดูประกอบก่อนยึด

export const SUSPECT_PER_DAY = 3_000_000   // ได้เกินวันละเท่านี้ = แดง (รายได้บ้านสูงสุด ~190k/วัน · ขายพืชก้อนใหญ่ยังพอเข้าใจ)
export const WATCH_PER_DAY = 1_000_000     // เกินนี้ = เหลือง น่าดู
export const SNAP_MAX_AGE_DAYS = 7         // จุดเทียบเก่ากว่านี้ → เตือนให้บันทึกใหม่

/** ทำจุดเทียบจากรายชื่อสมาชิก → { at, coins: { uid: n } } */
export function makeSnapshot(members, now = Date.now()) {
  const coins = {}
  for (const m of members || []) {
    if (m?.uid && typeof m.coins === 'number') coins[m.uid] = m.coins
  }
  return { at: now, coins }
}

/**
 * เทียบสมาชิกตอนนี้กับจุดเทียบ → แถวเรียงจากได้มากสุด
 * คนที่ไม่มีในจุดเทียบ (สมัครใหม่) เทียบกับ 0 ไม่ได้ (เหรียญเริ่มต้น) → ข้าม
 * @returns {{ rows: Array<{uid,nickname,coins,before,gain,perDay,level}>, days: number }}
 */
export function compareSnapshot(members, snap, now = Date.now()) {
  if (!snap?.coins || typeof snap.at !== 'number') return { rows: [], days: 0 }
  // ขั้นต่ำครึ่งวัน กันหารด้วยเลขจิ๋วจนทุกคนแดงหลังเพิ่งบันทึก
  const days = Math.max(0.5, (now - snap.at) / 86_400_000)
  const rows = []
  for (const m of members || []) {
    const before = snap.coins[m?.uid]
    if (typeof before !== 'number' || typeof m.coins !== 'number') continue
    const gain = m.coins - before
    const perDay = gain / days
    rows.push({
      uid: m.uid, nickname: m.nickname, coins: m.coins, before, gain, perDay,
      level: perDay >= SUSPECT_PER_DAY ? 'red' : perDay >= WATCH_PER_DAY ? 'yellow' : 'ok',
    })
  }
  rows.sort((a, b) => b.gain - a.gain)
  return { rows, days }
}
