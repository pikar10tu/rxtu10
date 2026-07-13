import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MINIGAMES, getMinigame } from '../data/minigames.js'
import { normalizeUserData, USER_DEFAULTS } from '../data/userSchema.js'

test('registry: capsuleRush live + fields ครบ', () => {
  const g = getMinigame('capsuleRush')
  assert.ok(g, 'ต้องมี capsuleRush')
  assert.equal(g.status, 'live')
  assert.equal(g.coinPerPoint, 5)
  assert.ok(g.maxPlausibleScore > 0)
  assert.ok(g.route.startsWith('/play/games/'))
})

test('registry: ทุกเกมมี key/name/status', () => {
  for (const g of MINIGAMES) {
    assert.ok(g.key && g.name && g.status, `${g.key} ต้องครบ`)
  }
})

test('schema: minigames default เป็น object', () => {
  assert.deepEqual(USER_DEFAULTS.minigames, {})
})

test('normalize: doc เก่าไม่มี minigames → object ว่าง (ไม่ crash)', () => {
  const d = normalizeUserData({ coins: 10 })
  assert.deepEqual(d.minigames, {})
})

test('normalize: minigames ที่มีอยู่ถูกคงไว้', () => {
  const d = normalizeUserData({ minigames: { capsuleRush: { best: 42, plays: 3 } } })
  assert.equal(d.minigames.capsuleRush.best, 42)
})

test('normalize: minigames ผิดชนิด (array) → object ว่าง', () => {
  const d = normalizeUserData({ minigames: [1, 2] })
  assert.deepEqual(d.minigames, {})
})
