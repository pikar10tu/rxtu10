// รัน: node --test src/utils/gags.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeStreak, noteProfileView, resetProfileStreak, isOwlHour } from './gags.js'

test('กดรัว: ห่างไม่เกินช่วงนับต่อ · ห่างเกิน = เริ่ม 1 ใหม่', () => {
  const s = makeStreak(700)
  assert.equal(s.hit(0), 1)
  assert.equal(s.hit(500), 2)
  assert.equal(s.hit(1100), 3)
  assert.equal(s.hit(2000), 1)
})

test('ส่องโปรไฟล์: นับคนไม่ซ้ำ · reset แล้วเริ่มใหม่', () => {
  resetProfileStreak()
  noteProfileView('a'); noteProfileView('a')
  assert.equal(noteProfileView('b'), 2)
  resetProfileStreak()
  assert.equal(noteProfileView('c'), 1)
})

test('นกฮูก: ตี 1–ตี 4 เวลาไทย', () => {
  assert.equal(isOwlHour(Date.parse('2026-09-25T18:30:00Z')), true)    // 01:30 ไทย
  assert.equal(isOwlHour(Date.parse('2026-09-25T22:00:00Z')), false)   // 05:00 ไทย
  assert.equal(isOwlHour(Date.parse('2026-09-25T17:59:00Z')), false)   // 00:59 ไทย
})
