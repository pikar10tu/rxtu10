// src/utils/importTagging.test.js
// รัน: node --test src/utils/importTagging.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planImportWrites, stampFileSets } from './importTagging.js'
import { qhash } from './qhash.js'

const row = (question, examSets = []) => ({ question, choices: ['a', 'b'], answer: 0, examSets })

test('ข้อไม่ซ้ำ → เข้า fresh, ไม่มี tagUpdate', () => {
  const r = planImportWrites([row('ใหม่')], [])
  assert.equal(r.fresh.length, 1)
  assert.equal(r.tagUpdates.length, 0)
})

test('ข้อซ้ำคลัง + มี examSets → tagUpdate เข้า doc เดิม ไม่เข้า fresh', () => {
  const existing = [{ id: 'D1', qhash: qhash('ซ้ำ') }]
  const r = planImportWrites([row('ซ้ำ', ['ชุด A'])], existing)
  assert.equal(r.fresh.length, 0)
  assert.deepEqual(r.tagUpdates, [{ id: 'D1', addSets: ['ชุด A'] }])
})

test('ข้อซ้ำคลัง + ไม่มี examSets → ข้ามเงียบ (ไม่ fresh ไม่ tag)', () => {
  const existing = [{ id: 'D1', qhash: qhash('ซ้ำ') }]
  const r = planImportWrites([row('ซ้ำ', [])], existing)
  assert.equal(r.fresh.length, 0)
  assert.equal(r.tagUpdates.length, 0)
})

test('ข้อซ้ำกันเองในไฟล์ → รวม examSets เข้าตัวแรก (fresh เดียว)', () => {
  const r = planImportWrites([row('ก', ['A']), row('ก', ['B'])], [])
  assert.equal(r.fresh.length, 1)
  assert.deepEqual(r.fresh[0].examSets, ['A', 'B'])
})

test('stampFileSets: ข้อ examSets ว่าง → ใช้ fileSets; ข้อมีอยู่แล้ว → คงเดิม', () => {
  const out = stampFileSets([row('x', []), row('y', ['เดิม'])], ['ไฟล์'])
  assert.deepEqual(out[0].examSets, ['ไฟล์'])
  assert.deepEqual(out[1].examSets, ['เดิม'])
})
