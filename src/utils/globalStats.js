// ตรรกะล้วน ไม่แตะ Firestore/Vue — เทส node --test src/utils/globalStats.test.js
// ดู docs/superpowers/specs/2026-09-14-global-fun-facts-design.md

export const DEFAULT_GLOBAL_STATS = {
  quizTotal: 0,
  pvpTotal: 0,
  flashcardFlips: 0,
  farmSalesTotal: 0,
  totalSpent: 0,
  achievementsUnlockedTotal: 0,
}

// รวม 4 ฟิลด์สะสมที่มีประวัติอยู่แล้วในทุก user doc (backfill ครั้งแรกเท่านั้น)
// pvpTotal/flashcardFlips ไม่รวมที่นี่ — ไม่มีประวัติเก่า ต้องเริ่มนับจาก bumpGlobalStat() เท่านั้น
export function sumGlobalStatsFromUsers(usersData) {
  const sums = { quizTotal: 0, farmSalesTotal: 0, totalSpent: 0, achievementsUnlockedTotal: 0 }
  for (const u of usersData) {
    sums.quizTotal += u?.quizDoneTotal || 0
    sums.farmSalesTotal += u?.farmSalesTotal || 0
    sums.totalSpent += u?.totalSpent || 0
    sums.achievementsUnlockedTotal += u?.achievementCount || 0
  }
  return sums
}
