import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, startHand, act, legal, buildPots, potTotal, newDeck, nextButton, timeoutAction } from './pokerEngine.js'

const E = (s) => evaluate(s.split(' '))

test('จัดอันดับไพ่ครบทุกแบบ', () => {
  const order = ['2c 7d 9h Js Kd 3s 4h', 'Ah Ad 2c 7d 9h Js 3s', 'Ah Ad 7c 7d 9h Js 3s', 'Ah Ad Ac 7d 9h Js 3s',
    'Ah 2d 3c 4d 5h Js Ks', '2h 7h 9h Jh Kh 3s 4c', 'Ah Ad Ac 7d 7h Js 3s', 'Ah Ad Ac As 7h Js 3s', '9h Th Jh Qh Kh 2c 3d']
  order.forEach((h, i) => assert.equal(E(h).cat, i, h))
  for (let i = 1; i < order.length; i++) assert.ok(E(order[i]).score > E(order[i - 1]).score)
})

test('เทียบไพ่: kicker · wheel แพ้ 6-high · ฟลัชเทียบทีละใบ', () => {
  assert.ok(E('Ah Ad Kc 7d 9h 2s 3s').score > E('Ah Ad Qc 7d 9h 2s 3s').score)
  assert.ok(E('6h 2d 3c 4d 5h Js Ks').score > E('Ah 2d 3c 4d 5h Js Ks').score)
  assert.ok(E('Ah 9h 7h 4h 3h Kc Qd').score > E('Ah 9h 7h 4h 2h Kc Qd').score)
  assert.equal(E('Ah Kh Qh Jh Th 2c 2d').score, E('As Ks Qs Js Ts 3c 3d').score)
})

test('ชื่อไพ่บอกเลข', () => {
  assert.equal(E('7s 7h 7d Kc 2s 3d 9h').detail, 'ตอง 7')
  assert.equal(E('Js Jd 4c 4h As 2d 8c').detail, 'ทูแพร์ J กับ 4')
  assert.equal(E('Th Tc 9s 6d 3h 2c 4s').detail, 'คู่ 10')
  assert.equal(E('3s 3h 8s 8h 8d Kc 2d').detail, 'ฟูลเฮาส์ ตอง 8 คู่ 3')
  assert.equal(E('Ah 2d 3c 4d 5h Js Ks').detail, 'สเตรท A–5')
  assert.equal(E('5c 6h 7d 8s 9c Kd 2h').detail, 'สเตรท 5–9')
  assert.equal(E('Ad Jd 8d 5d 2d Ks Kh').detail, 'ฟลัช ♦ A สูงสุด')
  assert.equal(E('Ah Kh Qh Jh Th 2c 2d').detail, 'รอยัลฟลัช ♥')
  assert.equal(E('Ac Qd 9h 6s 3c 2d 4h').detail, 'ไพ่สูง A')
})

test('สำรับ 52 ใบไม่ซ้ำ', () => assert.equal(new Set(newDeck()).size, 52))

const seats = (...stacks) => stacks.map((s, i) => ({ uid: 'p' + i, stack: s }))

test('blinds + ลำดับตา 3 คน และ heads-up', () => {
  const h = startHand({ seats: seats(1000, 1000, 1000), button: 'p0', sb: 10, bb: 20 })
  assert.equal(h.pub.sbUid, 'p1'); assert.equal(h.pub.bbUid, 'p2'); assert.equal(h.pub.toAct, 'p0')
  assert.equal(potTotal(h.pub), 30)
  for (const u of ['p0', 'p1', 'p2']) assert.equal(h.holes[u].length, 2)
  const hu = startHand({ seats: seats(1000, 1000), button: 'p0', sb: 10, bb: 20 })
  assert.equal(hu.pub.sbUid, 'p0'); assert.equal(hu.pub.toAct, 'p0')
  act(hu, 'p0', { type: 'call' })
  assert.equal(hu.pub.toAct, 'p1')                  // BB ได้ option
  act(hu, 'p1', { type: 'check' })
  assert.equal(hu.pub.phase, 'flop'); assert.equal(hu.pub.board.length, 3)
  assert.equal(hu.pub.toAct, 'p1')                  // หลัง flop BB เริ่มก่อน
})

test('ทุกคนหมอบ → คนสุดท้ายได้กอง ไม่โชว์ไพ่', () => {
  const h = startHand({ seats: seats(1000, 1000, 1000), button: 'p0', sb: 10, bb: 20 })
  act(h, 'p0', { type: 'fold' }); act(h, 'p1', { type: 'fold' })
  assert.equal(h.pub.phase, 'showdown'); assert.equal(h.pub.result.showdown, false)
  assert.equal(h.pub.players.p2.stack, 1010)
})

test('เกทับ: ขั้นต่ำ · เปิดให้ตัดสินใจใหม่ · ผิดกติกาโยน error', () => {
  const h = startHand({ seats: seats(1000, 1000, 1000), button: 'p0', sb: 10, bb: 20 })
  assert.throws(() => act(h, 'p0', { type: 'raise', to: 30 }))
  assert.throws(() => act(h, 'p1', { type: 'call' }))
  act(h, 'p0', { type: 'raise', to: 60 })
  assert.equal(legal(h.pub, 'p1').minTo, 100)
  act(h, 'p1', { type: 'call' }); act(h, 'p2', { type: 'call' })
  assert.equal(h.pub.phase, 'flop'); assert.equal(potTotal(h.pub), 180)
})

test('side pot: short stack all-in ชิงได้แค่กองหลัก', () => {
  const pots = buildPots({
    a: { total: 100, folded: false }, b: { total: 300, folded: false }, c: { total: 300, folded: false }, d: { total: 50, folded: true },
  })
  assert.deepEqual(pots, [{ amount: 350, eligible: ['a', 'b', 'c'] }, { amount: 400, eligible: ['b', 'c'] }])
})

test('all-in ทั้งโต๊ะ → เปิดไพ่จนครบ ชิปรวมคงที่', () => {
  for (let k = 0; k < 300; k++) {
    const h = startHand({ seats: seats(100, 300, 500, 40), button: 'p0', sb: 5, bb: 10 })
    while (h.pub.phase !== 'showdown') {
      const u = h.pub.toAct, L = legal(h.pub, u)
      act(h, u, L.raise ? { type: 'raise', to: L.maxTo } : { type: L.call ? 'call' : 'check' })
    }
    assert.equal(h.pub.board.length, 5)
    assert.equal(Object.values(h.pub.players).reduce((s, p) => s + p.stack, 0), 940)
    assert.equal(new Set([...h.pub.board, ...Object.values(h.holes).flat()]).size, 13)
  }
})

test('สุ่มเล่นมั่ว 2000 มือ: ชิปรวมคงที่ ไม่ค้าง', () => {
  for (let k = 0; k < 2000; k++) {
    const n = 2 + (k % 5)
    const st = Array.from({ length: n }, () => 20 + Math.floor(Math.random() * 500))
    const h = startHand({ seats: seats(...st), button: 'p' + (k % n), sb: 5, bb: 10 })
    let guard = 0
    while (h.pub.phase !== 'showdown') {
      assert.ok(guard++ < 200)
      const u = h.pub.toAct, L = legal(h.pub, u), r = Math.random()
      const a = r < .15 ? { type: 'fold' } : r < .35 && L.raise ? { type: 'raise', to: L.minTo + Math.floor(Math.random() * (L.maxTo - L.minTo + 1)) }
        : { type: L.call ? 'call' : 'check' }
      act(h, u, a)
    }
    assert.equal(Object.values(h.pub.players).reduce((s, p) => s + p.stack, 0), st.reduce((a, b) => a + b, 0))
  }
})

test('หมดเวลา: เช็คได้เช็ค ไม่งั้นหมอบ · button ข้ามคนหมดชิป', () => {
  const h = startHand({ seats: seats(1000, 1000, 1000), button: 'p0', sb: 10, bb: 20 })
  assert.equal(timeoutAction(h.pub, 'p0').type, 'fold')
  assert.equal(nextButton(['a', 'b', 'c'], 'a', u => u !== 'b'), 'c')
  assert.equal(nextButton(['a', 'b', 'c'], 'gone', () => true), 'a')
})
