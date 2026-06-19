// เทส petGrade — ค่าอัพเกรด (copies + เหรียญ ตาม rarity/เกรดเป้า)
// รัน: node --test src/utils/petGrade.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_GRADE, gradeUpCost, canUpgrade } from './petGrade.js'

test('อัพไปเกรด N ใช้ N copies', () => {
  assert.equal(gradeUpCost({ rarity: 'common', grade: 0 }).copies, 1) // →I
  assert.equal(gradeUpCost({ rarity: 'common', grade: 3 }).copies, 4) // →IV
})

test('เหรียญ = base[rarity] × เกรดเป้า', () => {
  assert.equal(gradeUpCost({ rarity: 'common', grade: 0 }).coins, 200 * 1)
  assert.equal(gradeUpCost({ rarity: 'legendary', grade: 4 }).coins, 4000 * 5)
})

test('เกรดสูงสุด (≥5) → null', () => {
  assert.equal(gradeUpCost({ rarity: 'epic', grade: 5 }), null)
})

test('canUpgrade: copies + เหรียญ พอ', () => {
  const pet = { rarity: 'common', grade: 0, copies: 1 }
  assert.equal(canUpgrade(pet, 200), true)
  assert.equal(canUpgrade(pet, 199), false)              // เหรียญไม่พอ
  assert.equal(canUpgrade({ ...pet, copies: 0 }, 999), false) // copies ไม่พอ
})

test('canUpgrade: เกรดสูงสุด → false', () => {
  assert.equal(canUpgrade({ rarity: 'rare', grade: 5, copies: 9 }, 999999), false)
})
