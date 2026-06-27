// src/data/expeditions.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DURATIONS, MISSIONS, RARITY_WEIGHT, REWARD_TYPES, EXPEDITION_PARTY_SIZE,
} from './expeditions.js'

test('DURATIONS: 3 ระดับ ชั่วโมงเรียงเพิ่ม', () => {
  assert.equal(DURATIONS.length, 3)
  const hrs = DURATIONS.map(d => d.hours)
  assert.deepEqual(hrs, [...hrs].sort((a, b) => a - b))
  DURATIONS.forEach(d => { assert.ok(d.baseCoins > 0 && d.coinCap >= d.baseCoins && d.ticketChance >= 0) })
})
test('MISSIONS: ครอบทั้ง 3 ธาตุ + ฟิลด์ครบ', () => {
  const els = new Set(MISSIONS.map(m => m.element))
  assert.deepEqual([...els].sort(), ['fist', 'paper', 'scissors'])
  MISSIONS.forEach(m => { assert.ok(m.id && m.name && m.emoji) })
})
test('REWARD_TYPES: map ไป field จริงใน user doc', () => {
  assert.equal(REWARD_TYPES.coins.field, 'coins')
  assert.equal(REWARD_TYPES.gachaTicket.field, 'freeGachaTickets')
})
test('RARITY_WEIGHT: legendary > epic > rare > common', () => {
  assert.ok(RARITY_WEIGHT.legendary > RARITY_WEIGHT.epic)
  assert.ok(RARITY_WEIGHT.epic > RARITY_WEIGHT.rare)
  assert.ok(RARITY_WEIGHT.rare > RARITY_WEIGHT.common)
})
test('EXPEDITION_PARTY_SIZE = 3', () => { assert.equal(EXPEDITION_PARTY_SIZE, 3) })
