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

import { pickLegendary } from './gacha.js'

const LEG = ['bahamut', 'kirin', 'trex', 'ouroboros']

test('pickLegendary: guaranteed → ได้เป้าแน่ ล้างธง', () => {
  const r = pickLegendary({ target: 'kirin', guaranteed: true, ownedLegendaryIds: [], legendaryIds: LEG, rng: () => 0.99 })
  assert.deepEqual(r, { id: 'kirin', won: true, newGuaranteed: false })
})

test('pickLegendary: win 50/50 → ได้เป้า', () => {
  const r = pickLegendary({ target: 'kirin', guaranteed: false, ownedLegendaryIds: [], legendaryIds: LEG, rng: () => 0.0 }) // <0.5
  assert.deepEqual(r, { id: 'kirin', won: true, newGuaranteed: false })
})

test('pickLegendary: lose 50/50 → ได้ตัวอื่น + ติดธง', () => {
  // rng#1 = 0.9 (>=0.5 → lose), rng#2 = 0 → เลือก others[0]
  const seqq = (() => { let i = 0; const v = [0.9, 0.0]; return () => v[Math.min(i++, v.length - 1)] })()
  const r = pickLegendary({ target: 'kirin', guaranteed: false, ownedLegendaryIds: [], legendaryIds: LEG, rng: seqq })
  assert.equal(r.won, false)
  assert.equal(r.newGuaranteed, true)
  assert.notEqual(r.id, 'kirin')
  assert.ok(LEG.includes(r.id))
})

test('pickLegendary: ไม่มีเป้า → new-first (สุ่มตัวที่ยังไม่มี)', () => {
  const r = pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: ['bahamut', 'kirin', 'trex'], legendaryIds: LEG, rng: () => 0.0 })
  assert.equal(r.id, 'ouroboros') // ตัวเดียวที่ยังไม่มี
  assert.equal(r.won, null)
  assert.equal(r.newGuaranteed, false)
})

test('pickLegendary: ไม่มีเป้า + มีครบแล้ว → สุ่มทั้งหมด', () => {
  const r = pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: LEG, legendaryIds: LEG, rng: () => 0.0 })
  assert.ok(LEG.includes(r.id))
  assert.equal(r.won, null)
})
