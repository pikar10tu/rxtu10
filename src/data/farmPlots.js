// ════════════════════════════════════════════════════════════
//  ฟาร์ม — ระบบปลดแปลงด้วยเหรียญ (coin sink)
//  เริ่ม 1 แปลง → ซื้อปลดทีละแปลง (ราคาแพงขึ้นเรื่อยๆ ช่วงต้นถูก)
//  แต่ปลดได้ไม่เกินเพดานตามเลเวลบ้าน residencePlots(level) (Lv1=4 … Lv12=12)
//  ราคาทั้งหมด tunable ที่ตารางเดียวด้านล่าง
// ════════════════════════════════════════════════════════════

export const MAX_PLOTS = 12

// index = หมายเลขแปลง (1-based). [1]=0 เริ่มต้นฟรี, [2..12]=ราคาซื้อปลด
export const PLOT_UNLOCK_COST = [
  null,     // 0 — ไม่ใช้
  0,        // แปลง 1 — เริ่มต้นฟรี
  100,      // 2
  300,      // 3
  900,      // 4
  2500,     // 5
  6000,     // 6
  14000,    // 7
  32000,    // 8
  70000,    // 9
  150000,   // 10
  320000,   // 11
  700000,   // 12
]

/** ราคาซื้อ "แปลงลำดับที่ plotNumber" — null ถ้านอกช่วง 1..MAX_PLOTS */
export function plotUnlockCost(plotNumber) {
  const n = Math.floor(Number(plotNumber))
  if (!Number.isFinite(n) || n < 1 || n > MAX_PLOTS) return null
  return PLOT_UNLOCK_COST[n]
}

/**
 * ตัดสินสถานะการปลดแปลงถัดไป (pure — ให้ useFarm/FarmShop ใช้ร่วมกัน).
 *   plotsUnlocked = จำนวนแปลงที่ปลดแล้ว (≥1)
 *   ceiling       = เพดานตามเลเวลบ้าน residencePlots(level)
 *   coins         = เหรียญปัจจุบัน
 * reason: 'ok' ปลดได้ · 'notEnoughCoins' เงินไม่พอ · 'atCeiling' ชนเพดานบ้าน · 'maxed' ครบ 12
 */
export function nextPlotInfo({ plotsUnlocked, ceiling, coins }) {
  const owned = Math.max(1, Math.floor(Number(plotsUnlocked) || 1))
  if (owned >= MAX_PLOTS) {
    return { canUnlock: false, reason: 'maxed', nextPlot: null, cost: null }
  }
  const nextPlot = owned + 1
  const cost = plotUnlockCost(nextPlot)
  if (owned >= ceiling) {
    return { canUnlock: false, reason: 'atCeiling', nextPlot, cost }
  }
  if ((Number(coins) || 0) < cost) {
    return { canUnlock: false, reason: 'notEnoughCoins', nextPlot, cost }
  }
  return { canUnlock: true, reason: 'ok', nextPlot, cost }
}
