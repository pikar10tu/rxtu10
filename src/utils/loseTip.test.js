// เทส loseTip — รัน: node --test src/utils/loseTip.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLoseTip } from './loseTip.js'
import { PULL_COST } from './gacha.js'

const tos = (t) => t.actions.map(a => a.to)

test('มีตั๋วฟรี หรือเหรียญพอ → กาชาก่อน + อัพขั้นเสมอ', () => {
  assert.deepEqual(tos(buildLoseTip('tower', { freeGachaTickets: 1, coins: 0 })), ['/shop', '/play/pets'])
  assert.deepEqual(tos(buildLoseTip('arena', { coins: PULL_COST })), ['/shop', '/play/pets'])
})

test('สุ่มไม่ได้ → มีแค่อัพขั้น (ไม่ส่งไปหน้าที่กดอะไรไม่ได้)', () => {
  assert.deepEqual(tos(buildLoseTip('tower', { coins: PULL_COST - 1, freeGachaTickets: 0 })), ['/play/pets'])
  assert.deepEqual(tos(buildLoseTip('arena', {})), ['/play/pets'])
  assert.deepEqual(tos(buildLoseTip('arena', null)), ['/play/pets'])
})

test('มีเพ็ทพร้อมอัพ → อัพขั้นขึ้นก่อน + บอกจำนวน', () => {
  const t = buildLoseTip('arena', { coins: 5000, pets: [{ rarity: 'common', grade: 0, copies: 2 }, { rarity: 'common', grade: 0, copies: 0 }] })
  assert.deepEqual(tos(t), ['/play/pets', '/shop'])
  assert.match(t.actions[0].label, /1 ตัว/)
})

test('ข้อความต่างกันตามโหมด และไม่มีคำว่า "แพ้ก็นับ"', () => {
  const t = buildLoseTip('tower', {}).text
  const a = buildLoseTip('arena', {}).text
  assert.notEqual(t, a)
  assert.ok(t && a)
})

test('โหมดที่ไม่รู้จัก → null (ไม่วาดอะไร)', () => {
  assert.equal(buildLoseTip('mystery', {}), null)
})
