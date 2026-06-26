// src/utils/pvpMatch.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { eligibleOpponents, pickHumanOpponents } from './pvpMatch.js'

const C = [
  { uid: 'me',  activePets: ['a'], pvp: { rating: 1000 } },
  { uid: 'u1',  activePets: ['a'], pvp: { rating: 1010 } },
  { uid: 'u2',  activePets: [null, null], pvp: { rating: 1005 } }, // ไม่มีทีม
  { uid: 'u3',  activePets: ['b'], pvp: { rating: 1500 } },
  { uid: 'u4',  activePets: ['c'] },                                // ไม่มี pvp → ใช้ค่าเริ่ม 1000
]

test('eligibleOpponents: ตัดตัวเอง + คนไม่มีทีม', () => {
  const r = eligibleOpponents('me', C).map(c => c.uid)
  assert.deepEqual(r.sort(), ['u1', 'u3', 'u4'])
})
test('pickHumanOpponents: เรียงเรตใกล้สุด + จำกัดจำนวน', () => {
  const r = pickHumanOpponents('me', 1000, C, 2).map(c => c.uid)
  assert.deepEqual(r, ['u4', 'u1']) // u4 rating 1000 (ห่าง 0), u1 1010 (ห่าง 10), u3 1500 (ห่าง 500)
})
test('pickHumanOpponents: เติม rating จาก pvp หรือค่าเริ่ม', () => {
  const r = pickHumanOpponents('me', 1000, C, 5)
  assert.equal(r.find(c => c.uid === 'u4').rating, 1000)
  assert.equal(r.find(c => c.uid === 'u1').rating, 1010)
})
