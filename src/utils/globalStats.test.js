import test from 'node:test'
import assert from 'node:assert/strict'
import { sumGlobalStatsFromUsers, DEFAULT_GLOBAL_STATS } from './globalStats.js'

test('sumGlobalStatsFromUsers รวม 4 ฟิลด์จากทุก user เข้าด้วยกัน', () => {
  const users = [
    { quizDoneTotal: 100, farmSalesTotal: 5000, totalSpent: 2000, achievementCount: 3 },
    { quizDoneTotal: 250, farmSalesTotal: 0,    totalSpent: 500,  achievementCount: 7 },
  ]
  const sums = sumGlobalStatsFromUsers(users)
  assert.equal(sums.quizTotal, 350)
  assert.equal(sums.farmSalesTotal, 5000)
  assert.equal(sums.totalSpent, 2500)
  assert.equal(sums.achievementsUnlockedTotal, 10)
})

test('sumGlobalStatsFromUsers ทนต่อ user ที่ไม่มีฟิลด์เลย (undefined นับเป็น 0)', () => {
  const sums = sumGlobalStatsFromUsers([{}, { quizDoneTotal: 5 }])
  assert.equal(sums.quizTotal, 5)
  assert.equal(sums.farmSalesTotal, 0)
  assert.equal(sums.totalSpent, 0)
  assert.equal(sums.achievementsUnlockedTotal, 0)
})

test('sumGlobalStatsFromUsers array ว่าง คืนค่า 0 ทั้งหมด', () => {
  const sums = sumGlobalStatsFromUsers([])
  assert.deepEqual(sums, { quizTotal: 0, farmSalesTotal: 0, totalSpent: 0, achievementsUnlockedTotal: 0 })
})

test('DEFAULT_GLOBAL_STATS มีครบ 6 ฟิลด์เป็น 0', () => {
  assert.deepEqual(DEFAULT_GLOBAL_STATS, {
    quizTotal: 0, pvpTotal: 0, flashcardFlips: 0,
    farmSalesTotal: 0, totalSpent: 0, achievementsUnlockedTotal: 0,
  })
})
