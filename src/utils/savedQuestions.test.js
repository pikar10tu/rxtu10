// รัน: node --test src/utils/savedQuestions.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSavedToggle, buildSavedRemove, savedIds, savedCount, isSaved, SAVED_MAX } from './savedQuestions.js'

const DEL = Symbol('del')

test('บันทึกใหม่ = เขียน dot-path ข้อเดียว ไม่แตะ qcards', () => {
  const study = { qcards: { x: 1 }, saved: {} }
  const r = buildSavedToggle({ study, qid: 'q1', now: 100, deleteSentinel: DEL })
  assert.equal(r.ok, true); assert.equal(r.saved, true)
  assert.deepEqual(r.server, { 'study.saved.q1': 100 })
  assert.deepEqual(r.optimisticStudy, { qcards: { x: 1 }, saved: { q1: 100 } })
})

test('กดซ้ำ = เอาออก ด้วย deleteSentinel', () => {
  const r = buildSavedToggle({ study: { saved: { q1: 5 } }, qid: 'q1', deleteSentinel: DEL })
  assert.equal(r.saved, false)
  assert.equal(r.server['study.saved.q1'], DEL)
  assert.deepEqual(r.optimisticStudy.saved, {})
})

test('เต็มเพดาน = บันทึกเพิ่มไม่ได้ แต่ยังเอาออกได้', () => {
  const saved = Object.fromEntries(Array.from({ length: SAVED_MAX }, (_, i) => [`q${i}`, i]))
  assert.equal(buildSavedToggle({ study: { saved }, qid: 'new' }).full, true)
  assert.equal(buildSavedToggle({ study: { saved }, qid: 'q3', deleteSentinel: DEL }).ok, true)
})

test('study ว่าง/เพี้ยน ไม่พัง', () => {
  assert.equal(buildSavedToggle({ study: undefined, qid: 'a', now: 1 }).ok, true)
  assert.equal(savedCount(null), 0)
  assert.equal(isSaved(undefined, 'a'), false)
})

test('savedIds ใหม่สุดก่อน + จำกัดจำนวน', () => {
  assert.deepEqual(savedIds({ a: 1, b: 3, c: 2 }), ['b', 'c', 'a'])
  assert.deepEqual(savedIds({ a: 1, b: 3, c: 2 }, 2), ['b', 'c'])
})

test('ลบข้อที่หาย เฉพาะที่มีอยู่จริง', () => {
  const r = buildSavedRemove({ study: { saved: { a: 1, b: 2 } }, ids: ['a', 'zz'], deleteSentinel: DEL })
  assert.deepEqual(r.server, { 'study.saved.a': DEL })
  assert.deepEqual(r.optimisticStudy.saved, { b: 2 })
})
