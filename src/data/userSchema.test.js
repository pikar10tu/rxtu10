import { test } from 'node:test'
import assert from 'node:assert/strict'
import { USER_DEFAULTS, normalizeUserData, WELCOME_GIFT_COINS, WELCOME_GIFT_TICKETS } from './userSchema.js'

test('USER_DEFAULTS has gacha fields', () => {
  assert.equal(USER_DEFAULTS.gachaPity, 0)
  assert.equal(USER_DEFAULTS.gachaTarget, null)
  assert.equal(USER_DEFAULTS.gachaGuaranteed, false)
})

test('normalizeUserData fills gacha defaults on a sparse doc', () => {
  const d = normalizeUserData({ coins: 5 })
  assert.equal(d.gachaPity, 0)
  assert.equal(d.gachaTarget, null)
  assert.equal(d.gachaGuaranteed, false)
})

test('normalizeUserData keeps existing gacha values', () => {
  const d = normalizeUserData({ gachaPity: 42, gachaTarget: 'bahamut', gachaGuaranteed: true })
  assert.equal(d.gachaPity, 42)
  assert.equal(d.gachaTarget, 'bahamut')
  assert.equal(d.gachaGuaranteed, true)
})

test('USER_DEFAULTS มี welcome gift flags = false', () => {
  assert.equal(USER_DEFAULTS.welcomeGiftV1, false)
  assert.equal(USER_DEFAULTS.welcomeBoxSeen, false)
})

test('ค่าคงที่ของขวัญต้อนรับ = 15000 / 50', () => {
  assert.equal(WELCOME_GIFT_COINS, 15000)
  assert.equal(WELCOME_GIFT_TICKETS, 50)
})

test('normalizeUserData เติม welcome flags บน doc บางตา', () => {
  const d = normalizeUserData({ coins: 5 })
  assert.equal(d.welcomeGiftV1, false)
  assert.equal(d.welcomeBoxSeen, false)
})

test('normalizeUserData คงค่า welcome flags เดิม', () => {
  const d = normalizeUserData({ welcomeGiftV1: true, welcomeBoxSeen: true })
  assert.equal(d.welcomeGiftV1, true)
  assert.equal(d.welcomeBoxSeen, true)
})
