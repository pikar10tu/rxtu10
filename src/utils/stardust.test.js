import { test } from 'node:test'
import assert from 'node:assert/strict'
import { copyCap, excessOf, migrationPreview, applyMigration, dustOf, canAfford } from './stardust.js'

test('เพดาน = 5 − เกรด', () => {
  assert.equal(copyCap({ grade: 0 }), 5)
  assert.equal(copyCap({ grade: 3 }), 2)
  assert.equal(copyCap({ grade: 5 }), 0)
  assert.equal(excessOf({ grade: 0, copies: 14 }), 9)
  assert.equal(excessOf({ grade: 2, copies: 2 }), 0)
})

test('แปลงของเก่า: ตัดเหลือเพดาน ได้ผงตามระดับ', () => {
  const pets = [
    { id: 'a', rarity: 'common', grade: 0, copies: 14 },
    { id: 'b', rarity: 'rare', grade: 2, copies: 6 },
    { id: 'c', rarity: 'legendary', grade: 5, copies: 4 },
    { id: 'd', rarity: 'epic', grade: 0, copies: 3 },
  ]
  const pv = migrationPreview(pets)
  assert.equal(pv.rows.length, 3)
  const { pets: next, gain } = applyMigration(pets)
  assert.deepEqual(gain, { common: 9, rare: 3, epic: 0, legendary: 4 })
  assert.deepEqual(next.map(p => p.copies), [5, 3, 0, 3])
  assert.equal(migrationPreview(next).rows.length, 0)
})

test('dustOf กันค่าแปลก · canAfford', () => {
  assert.deepEqual(dustOf({ stardust: { common: 3.7, rare: -1 } }), { common: 3, rare: 0, epic: 0, legendary: 0 })
  assert.equal(canAfford({ legendary: 7 }, ['legendary', 7]), true)
  assert.equal(canAfford({}, ['common', 1]), false)
})
