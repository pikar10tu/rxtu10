import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildFinishPatch, progressMap, weakCaseIds, cleanScore, dayInt } from './cc2Progress.js'

const NOW = Date.UTC(2026, 10, 11, 5)

test('buildFinishPatch เขียน dot-path เคสเดียว ไม่แตะ study ทั้งก้อน ไม่มีเหรียญ', () => {
  const u = { coins: 50, study: { cards: { a: 1 }, qcards: { q: 1 }, cc2: {} } }
  const p = buildFinishPatch({ userData: u, caseId: 'OS-0001', got: 7.5, tot: 10, now: NOW })
  assert.ok(p.ok)
  assert.deepEqual(Object.keys(p.server), ['study.cc2.OS-0001'])
  assert.deepEqual(p.server['study.cc2.OS-0001'], { g: 7.5, t: 10, d: 20261111, n: 1 })
  assert.deepEqual(p.optimistic.study.cards, { a: 1 })
  assert.deepEqual(p.optimistic.study.qcards, { q: 1 })
  assert.equal(p.optimistic.coins, undefined)
})

test('ทำซ้ำ: n เพิ่ม · เก็บผลล่าสุด', () => {
  const u = { study: { cc2: { 'OS-0001': { g: 3, t: 10, d: 20261101, n: 2 } } } }
  const p = buildFinishPatch({ userData: u, caseId: 'OS-0001', got: 10, tot: 10, now: NOW })
  assert.deepEqual(p.server['study.cc2.OS-0001'], { g: 10, t: 10, d: dayInt(NOW), n: 3 })
})

test('caseId ที่ทำ dot-path พังถูกปฏิเสธ', () => {
  for (const id of ['a.b', '', 'x y', '../z', null]) assert.equal(buildFinishPatch({ userData: {}, caseId: id, got: 1, tot: 1 }).ok, false)
})

test('cleanScore หนีบค่า', () => {
  assert.deepEqual(cleanScore(12, 10), { got: 10, tot: 10 })
  assert.deepEqual(cleanScore(-1, NaN), { got: 0, tot: 0 })
  assert.deepEqual(cleanScore(2.755, 1e9), { got: 2.76, tot: 999 })
})

test('progressMap + weakCaseIds', () => {
  const cc2 = {
    'OS-0001': { g: 10, t: 10, d: 20261110, n: 1 },
    'OS-0002': { g: 4, t: 10, d: 20261109, n: 1 },
    'OS-0003': { g: 9, t: 10, d: 20261111, n: 2 },
    junk: 5,
  }
  const p = progressMap(cc2)
  assert.deepEqual(p['OS-0003'], { got: 9, tot: 10, at: '2026-11-11', n: 2 })
  assert.equal(p.junk, undefined)
  assert.deepEqual(weakCaseIds(cc2), ['OS-0003', 'OS-0002'])
})
