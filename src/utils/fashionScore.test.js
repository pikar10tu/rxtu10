// node --test src/utils/fashionScore.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { fashionScore } from './fashionScore.js'
import { sortMembers } from './sortMembers.js'

const u = (owned = [], cos = [], lv = 1) => ({ doll: { owned, eq: {} }, cosmetics: { owned: cos }, residence: { level: lv } })

test('นับทุกชิ้นที่มี (ตุ๊กตา + ร้านตกแต่ง) ไม่ใช่แค่ที่ใส่ · ของฟรีไม่นับ', () => {
  const base = fashionScore(u())
  assert.ok(fashionScore(u(['t2'])) > base)              // เสื้อที่ซื้อ
  assert.ok(fashionScore(u([], ['f-sky'])) > base)       // กรอบรูป
  assert.ok(fashionScore(u([], ['n-sky'])) > base)       // สีชื่อ
  assert.equal(fashionScore(u(['t1'])), base)            // ของฟรี
})

test('คนขยันแต่งตัว บ้านเลเวลต่ำ แซงคนบ้านเลเวลสูงได้', () => {
  const fashionista = u(['f19', 'f20', 'w1', 'x39', 't6', 'b9', 'k9', 'h21'], ['n-g-gold', 'f-gold'], 3)
  const homebody = u([], [], 15)
  assert.ok(fashionScore(fashionista) > fashionScore(homebody))
})

test('เรียงรายชื่อแบบเฉิดฉาย: คะแนนมากก่อน · เท่ากันดูเลเวลบ้าน', () => {
  const list = [
    { uid: 'a', studentId: '1', registered: true, fashion: 10, residence: { level: 9 } },
    { uid: 'b', studentId: '2', registered: true, fashion: 40, residence: { level: 1 } },
    { uid: 'c', studentId: '3', registered: true, fashion: 10, residence: { level: 12 } },
  ]
  assert.deepEqual(sortMembers(list, 'fashion').map(m => m.uid), ['b', 'c', 'a'])
})
