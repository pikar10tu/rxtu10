import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RARITY_DAILY_BASE, petDailyCoins } from './petUtils.js'

test('RARITY_DAILY_BASE bumped x2.5', () => {
  assert.deepEqual(RARITY_DAILY_BASE, { common: 15, rare: 38, epic: 85, legendary: 175 })
})

test('petDailyCoins grade 0 = base', () => {
  assert.equal(petDailyCoins({ rarity: 'common', grade: 0 }), 15)
  assert.equal(petDailyCoins({ rarity: 'legendary', grade: 0 }), 175)
})

test('petDailyCoins grade V = base x12', () => {
  assert.equal(petDailyCoins({ rarity: 'legendary', grade: 5 }), 2100) // 175 * 12
})
