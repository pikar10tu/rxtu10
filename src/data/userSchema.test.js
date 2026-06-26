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

// ── ทีมสู้หอคอย: activePets ยาว 4 ──
test('default activePets ยาว 4', () => {
  assert.equal(USER_DEFAULTS.activePets.length, 4)
})

test('normalize: activePets เดิม 3 ช่อง → pad เป็น 4', () => {
  const d = normalizeUserData({ activePets: ['cat', 'fox', 'owl'] })
  assert.deepEqual(d.activePets, ['cat', 'fox', 'owl', null])
})

test('normalize: activePets ยาวเกิน → ตัดเหลือ 4', () => {
  const d = normalizeUserData({ activePets: ['a', 'b', 'c', 'd', 'e'] })
  assert.equal(d.activePets.length, 4)
  assert.deepEqual(d.activePets, ['a', 'b', 'c', 'd'])
})

test('normalize: legacy activePet → slot 0 (ยาว 4)', () => {
  const d = normalizeUserData({ activePet: 'cat' })
  assert.deepEqual(d.activePets, ['cat', null, null, null])
})

// ── PvP (สนามประลอง) ──
test('normalizeUserData: pvp defaults ครบ', () => {
  const d = normalizeUserData({})
  assert.equal(d.pvp.rating, 1000)
  assert.equal(d.pvp.wins, 0)
  assert.equal(d.pvp.seasonId, null)
  assert.equal(d.pvpAttacksUsed, 0)
  assert.equal(d.pvpAttackDate, null)
})
test('normalizeUserData: pvp บางส่วน merge กับ default', () => {
  const d = normalizeUserData({ pvp: { rating: 1234 } })
  assert.equal(d.pvp.rating, 1234)
  assert.equal(d.pvp.wins, 0) // เติม default
})
