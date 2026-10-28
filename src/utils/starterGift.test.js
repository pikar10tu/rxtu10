import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STARTER_LEGENDS, starterEligible, starterPatch } from './starterGift.js'

test('🎁 ตำนานที่เลือกได้ = ถึงรุ่นซอล (ไม่มีรุ่น พ.ย.)', () => {
  const ids = STARTER_LEGENDS.map(p => p.id)
  assert.ok(ids.includes('sol') && ids.includes('bahamut'))
  assert.ok(!ids.includes('ufo') && !ids.includes('comet'))
  assert.ok(STARTER_LEGENDS.every(p => p.rarity === 'legendary'))
})

test('🎁 ได้เฉพาะคนไม่มีเพ็ท/ไม่มีตำนาน · ครั้งเดียว', () => {
  assert.equal(starterEligible({ pets: [] }), true)
  assert.equal(starterEligible({ pets: [{ id: 'cat', rarity: 'common' }] }), true)
  assert.equal(starterEligible({ pets: [{ id: 'sol', rarity: 'legendary' }] }), false)
  assert.equal(starterEligible({ pets: [], starterLegendV1: true }), false)
})

test('🎁 patch ใส่ตำนานเข้าคลัง + ตั้ง flag · เลือกนอกรายการ = null', () => {
  const p = starterPatch({ pets: [{ id: 'cat', rarity: 'common' }] }, 'sol')
  assert.equal(p.starterLegendV1, true)
  assert.ok(p.pets.some(x => x.id === 'sol' && x.rarity === 'legendary'))
  assert.equal(starterPatch({ pets: [] }, 'ufo'), null)
  assert.equal(starterPatch({ pets: [], starterLegendV1: true }, 'sol'), null)
})
