import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gradeUpCost, canUpgrade, MAX_GRADE } from './petGrade.js'

test('gradeUpCost ใช้ 1 copy ทุกขั้น, เหรียญ scale ตามเกรดเป้า', () => {
  assert.deepEqual(gradeUpCost({ grade: 0, rarity: 'common' }), { copies: 1, coins: 200 })   // 200*1
  assert.deepEqual(gradeUpCost({ grade: 1, rarity: 'common' }), { copies: 1, coins: 400 })   // 200*2
  assert.deepEqual(gradeUpCost({ grade: 4, rarity: 'legendary' }), { copies: 1, coins: 20000 }) // 4000*5
})

test('gradeUpCost = null เมื่อ maxed', () => {
  assert.equal(gradeUpCost({ grade: MAX_GRADE, rarity: 'epic' }), null)
})

test('canUpgrade ต้องมี 1 copy + เหรียญพอ', () => {
  assert.equal(canUpgrade({ grade: 0, rarity: 'common', copies: 1 }, 200), true)
  assert.equal(canUpgrade({ grade: 0, rarity: 'common', copies: 0 }, 200), false) // copy ไม่พอ
  assert.equal(canUpgrade({ grade: 0, rarity: 'common', copies: 1 }, 199), false) // เหรียญไม่พอ
})
