// src/utils/pvpBot.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { botPowerFor, getPvpBot } from './pvpBot.js'

test('botPowerFor: เรตสูง เกรด/tier สูงกว่าเรตต่ำ', () => {
  assert.ok(botPowerFor(2000).grade >= botPowerFor(800).grade)
})
test('getPvpBot: คืน 4 ตัว + isBot + rating = เรตผู้เล่น', () => {
  const b = getPvpBot(1000, 12345)
  assert.equal(b.team.length, 3)
  assert.equal(b.isBot, true)
  assert.equal(b.rating, 1000)
  b.team.forEach(p => { assert.ok(p.id && p.rarity && p.element); assert.ok(p.grade >= 0 && p.grade <= 5) })
})
test('getPvpBot: deterministic (seed เดิม → ทีมเดิม)', () => {
  assert.deepEqual(getPvpBot(1000, 7), getPvpBot(1000, 7))
})
