import { test } from 'node:test'
import assert from 'node:assert/strict'
import { legendaryChance, rollRarity, GACHA_RATES, SOFT_PITY, HARD_PITY } from './gacha.js'

// rng ปลอม: คืนค่าจาก list ตามลำดับการเรียก (ตัวสุดท้ายค้างไว้)
const seq = (vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)] }

test('legendaryChance base ก่อน soft pity', () => {
  assert.equal(legendaryChance(0), 1.5)
  assert.equal(legendaryChance(74), 1.5) // pull 75
})

test('legendaryChance ไต่ขึ้นที่ soft pity', () => {
  assert.equal(legendaryChance(75), 7.5)         // pull 76 = 1.5 + 6
  assert.ok(legendaryChance(90) > legendaryChance(80))
})

test('legendaryChance hard pity = 100', () => {
  assert.equal(legendaryChance(99), 100)  // pull 100
})

test('rollRarity = legendary เมื่อ rng ต่ำกว่า chance', () => {
  assert.equal(rollRarity(0, seq([0.0])), 'legendary')   // 0 < 1.5%
})

test('rollRarity hard pity บังคับ legendary', () => {
  assert.equal(rollRarity(99, seq([0.99])), 'legendary') // chance 100 → 99 < 100
})

test('rollRarity tier ล่างเมื่อไม่ออก legendary', () => {
  assert.equal(rollRarity(0, seq([0.99, 0.0])), 'epic')    // ไม่ legendary; r2 ต่ำ → epic
  assert.equal(rollRarity(0, seq([0.99, 0.99])), 'common') // r2 สูง → common
})
