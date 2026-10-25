import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeEvent, evtOf, quizPts, grantPatch, canRedeem, evtAfterRedeem, exchangePatch } from './event.js'

const EV = { id: 'x1', start: 100, end: 200, perAnswer: 2, perCorrect: 1, misc: [{ id: 'm', price: 10, max: 2 }] }
const inc = (n) => ({ inc: n })

test('activeEvent เฉพาะในช่วง', () => {
  assert.equal(activeEvent(50, [EV]), null)
  assert.equal(activeEvent(150, [EV]), EV)
  assert.equal(activeEvent(201, [EV]), null)
})

test('evtOf อีเวนต์เก่าไม่นับ', () => {
  assert.deepEqual(evtOf({ evt: { id: 'old', pts: 99, buy: { a: 1 } } }, EV), { id: 'x1', pts: 0, buy: {} })
  assert.equal(evtOf({ evt: { id: 'x1', pts: 7 } }, EV).pts, 7)
})

test('quizPts = ตอบ×2 + ถูก×1', () => {
  assert.equal(quizPts(EV, 10, 7), 27)
  assert.equal(quizPts(null, 10, 7), 0)
})

test('grantPatch: อีเวนต์เดิม increment · อีเวนต์ใหม่เขียนทั้งก้อน', () => {
  const a = grantPatch({ evt: { id: 'x1', pts: 5, buy: { m: 1 } } }, EV, 4, inc)
  assert.deepEqual(a.server, { 'evt.pts': { inc: 4 }, 'evt.got': { inc: 4 } })
  assert.equal(a.local.evt.pts, 9)
  assert.deepEqual(a.local.evt.buy, { m: 1 })
  const b = grantPatch({ evt: { id: 'old', pts: 50 } }, EV, 4, inc)
  assert.deepEqual(b.server, { evt: { id: 'x1', pts: 4, got: 4, buy: {} } })
  assert.equal(grantPatch({}, EV, 0, inc), null)
})

test('canRedeem: แต้มไม่พอ / ครบลิมิต / ได้', () => {
  const item = { ...EV.misc[0], type: 'misc' }
  assert.equal(canRedeem({ evt: { id: 'x1', pts: 5 } }, EV, item).reason, 'pts')
  assert.equal(canRedeem({ evt: { id: 'x1', pts: 50, buy: { m: 2 } } }, EV, item).reason, 'max')
  assert.equal(canRedeem({ evt: { id: 'x1', pts: 50 } }, EV, item).ok, true)
})

test('evtAfterRedeem หักแต้ม + นับจำนวน', () => {
  const item = { ...EV.misc[0], type: 'misc' }
  assert.deepEqual(evtAfterRedeem({ evt: { id: 'x1', pts: 25, buy: { m: 1 } } }, EV, item), { id: 'x1', pts: 15, buy: { m: 2 } })
})

test('แลกของแล้วตาชนะดันวันนี้ไม่หาย', () => {
  const item = { ...EV.misc[0], type: 'misc' }
  const dun = { d: '2026-10-25', n: 2 }
  assert.deepEqual(evtAfterRedeem({ evt: { id: 'x1', pts: 25, dun } }, EV, item).dun, dun)
})

test('แลกเหรียญ: เกินแต้ม/ศูนย์ ไม่ได้ · ได้แล้วพก dun/buy ไว้', () => {
  const E = { ...EV, coinRate: 100 }
  const u = { evt: { id: 'x1', pts: 12, buy: { m: 1 }, dun: { d: 'd', n: 2 } } }
  assert.equal(exchangePatch(u, E, 13).ok, false)
  assert.equal(exchangePatch(u, E, 0).ok, false)
  const r = exchangePatch(u, E, 10)
  assert.equal(r.coins, 1000)
  assert.deepEqual(r.evt, { id: 'x1', pts: 2, buy: { m: 1 }, dun: { d: 'd', n: 2 } })
})
