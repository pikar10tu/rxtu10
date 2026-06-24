import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCombatant, elementMult, BATTLE_CFG } from './battle.js'

test('BATTLE_CFG ตรงกับ sim ที่จูนแล้ว', () => {
  assert.equal(BATTLE_CFG.teamSize, 4)
  assert.equal(BATTLE_CFG.maxRounds, 30)
  assert.equal(BATTLE_CFG.elementAdv, 1.20)
  assert.equal(BATTLE_CFG.elementDis, 0.83)
})

test('buildCombatant: fist เกรด 0 legendary — bias atk↑ hp↓', () => {
  const c = buildCombatant({ id: 'trex', rarity: 'legendary', element: 'fist', grade: 0 })
  assert.equal(c.atk, 14 * 1.2)
  assert.equal(c.maxHp, 70 * 0.85)
  assert.equal(c.hp, c.maxHp)
  assert.equal(c.element, 'fist')
})

test('buildCombatant: clamp เกรดเกิน 5 → ใช้ index 5', () => {
  const c = buildCombatant({ id: 'x', rarity: 'common', element: 'scissors', grade: 99 })
  assert.equal(Math.round(c.atk), Math.round(10 * 1.34))
})

test('elementMult: ได้เปรียบ/เสียเปรียบ/เสมอ', () => {
  assert.equal(elementMult('fist', 'scissors'), 1.20)
  assert.equal(elementMult('scissors', 'fist'), 0.83)
  assert.equal(elementMult('fist', 'fist'), 1)
})
