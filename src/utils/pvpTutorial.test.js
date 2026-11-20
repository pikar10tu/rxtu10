import test from 'node:test'
import assert from 'node:assert/strict'
import { tutDone, inTutorial, tutorialClaim, TUT_FIGHTS, TUT_LEGENDS, guideOf } from './pvpTutorial.js'
import { PETS } from '../data/index.js'

test('ตำนานทั้ง 3 มีจริง เป็นตำนาน และธาตุไม่ซ้ำ', () => {
  const defs = TUT_LEGENDS.map(id => PETS.find(p => p.id === id))
  assert.ok(defs.every(d => d && d.rarity === 'legendary'))
  assert.equal(new Set(defs.map(d => d.element)).size, 3)
})

test('ใครต้องซ้อม: สู้ < 20 ตา หรือยังไม่มีตำนานขั้น V · มี pvpTut แล้วยึดตามนั้น', () => {
  const legV = [{ id: 'whale', rarity: 'legendary', grade: 5 }]
  assert.equal(inTutorial({ pvpFightsTotal: 0, pets: legV }), true)
  assert.equal(inTutorial({ pvpFightsTotal: 19, pets: legV }), true)
  assert.equal(inTutorial({ pvpFightsTotal: 20, pets: legV }), false, 'สู้เยอะ + มีตำนาน V = ไม่ต้องซ้อม')
  assert.equal(inTutorial({ pvpFightsTotal: 80, pets: [{ id: 'whale', rarity: 'legendary', grade: 4 }] }), true, 'ตำนานแค่ IV = ยังได้สิทธิ์')
  assert.equal(inTutorial({ pvpFightsTotal: 80, pets: [{ id: 'whale', grade: 5 }] }), false, 'pet แบบ slim (ไม่มี rarity) ก็ต้องรู้ว่าเป็นตำนาน')
  assert.equal(tutDone({ pvpFightsTotal: 50, pvpTut: 2 }), 2, 'เริ่มซ้อมแล้วไม่หลุดเกณฑ์')
  assert.equal(inTutorial({ pvpTut: TUT_FIGHTS }), false)
})

test('กดรับ: ได้ตำนาน + นับตา · ตัวซ้ำเป็นสำเนา · นอกช่วงซ้อม/ตัวนอกรายการ = null', () => {
  const u0 = { pvpFightsTotal: 3, pets: [] }
  const a = tutorialClaim(u0, 'whale')
  assert.equal(a.pvpTut, 1)
  assert.ok(a.pets.some(p => p.id === 'whale'))
  const b = tutorialClaim({ ...u0, pets: a.pets, pvpTut: 1 }, 'whale')
  assert.equal(b.pets.find(p => p.id === 'whale').copies, 1)
  assert.equal(tutorialClaim(u0, 'cat'), null)
  assert.equal(tutorialClaim({ pvpTut: 5 }, 'whale'), null)
})

test('ไกด์ไม่พูดถึงกลไกจับคู่ (ความลับ) และไม่อ้างว่าอัปบ้านได้ช่องทีม', () => {
  for (let i = 1; i <= TUT_FIGHTS; i++) assert.ok(!/สูสี|จับคู่|ท็อป|บ้าน/.test(guideOf(i)), guideOf(i))
})
