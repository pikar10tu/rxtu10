// src/utils/petPower.test.js — รัน: node --test src/utils/petPower.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { combatStats, petDailyCoins, expWeight, clampGrade, MAX_GRADE } from '../data/petPower.js'

test('MAX_GRADE = 5', () => { assert.equal(MAX_GRADE, 5) })
test('clampGrade: คลุม 0..5', () => {
  assert.equal(clampGrade(-2), 0); assert.equal(clampGrade(9), 5); assert.equal(clampGrade(3), 3)
})

test('combatStats: legendary/fist g5 = 14×2.0×1.2 atk, 70×2.0×0.85 hp', () => {
  const c = combatStats({ id: 'x', rarity: 'legendary', element: 'fist', grade: 5 })
  assert.ok(Math.abs(c.atk - 33.6) < 1e-9)      // 14×2.0×1.2
  assert.ok(Math.abs(c.maxHp - 119) < 1e-9)     // 70×2.0×0.85
  assert.equal(c.hp, c.maxHp)
})
test('combatStats: common/scissors g0 = ฐานเป๊ะ', () => {
  const c = combatStats({ rarity: 'common', element: 'scissors', grade: 0 })
  assert.equal(c.atk, 10); assert.equal(c.maxHp, 50)
})
test('combatStats: rarity ผิด → base common; element ผิด → bias default (scissors) แต่ field element passthrough', () => {
  const c = combatStats({ rarity: 'xxx', element: 'yyy', grade: 0 })
  assert.equal(c.atk, 10); assert.equal(c.maxHp, 50)   // common base × scissors bias (default)
  assert.equal(c.element, 'yyy')                        // field = raw input (= buildCombatant เดิม)
})

test('petDailyCoins: legendary g5 = 175×12 = 2100', () => {
  assert.equal(petDailyCoins({ rarity: 'legendary', grade: 5 }), 2100)
})
test('petDailyCoins: common g0 = 15', () => {
  assert.equal(petDailyCoins({ rarity: 'common', grade: 0 }), 15)
})
test('petDailyCoins: null → 0', () => { assert.equal(petDailyCoins(null), 0) })

test('expWeight: legendary g5 = 7×(1+0.15×5) = 12.25 (ไม่ clamp)', () => {
  assert.ok(Math.abs(expWeight({ rarity: 'legendary', grade: 5 }) - 12.25) < 1e-9)
})
test('expWeight: common g0 = 1', () => { assert.equal(expWeight({ rarity: 'common', grade: 0 }), 1) })
