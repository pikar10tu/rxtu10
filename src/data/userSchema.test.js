import { test } from 'node:test'
import assert from 'node:assert/strict'
import { USER_DEFAULTS, normalizeUserData } from './userSchema.js'

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
