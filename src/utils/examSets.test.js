// src/utils/examSets.test.js
// รัน: node --test src/utils/examSets.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeExamYear, upsertExamSet, keepKnownSets, examSetLabel } from './examSets.js'

test('normalizeExamYear: พ.ศ. ในช่วง → คงเดิม', () => {
  assert.equal(normalizeExamYear(2566), 2566)
})
test('normalizeExamYear: ค.ศ. → +543', () => {
  assert.equal(normalizeExamYear(2023), 2566)
})
test('normalizeExamYear: string "2566" → 2566', () => {
  assert.equal(normalizeExamYear('2566'), 2566)
})
test('normalizeExamYear: ตกช่วง/ไม่ใช่ตัวเลข → null', () => {
  assert.equal(normalizeExamYear(1200), null)
  assert.equal(normalizeExamYear(9999), null)
  assert.equal(normalizeExamYear('abc'), null)
  assert.equal(normalizeExamYear(null), null)
})

test('upsertExamSet: เพิ่มชุดใหม่', () => {
  const r = upsertExamSet([], 'PLE-CC1 ชุด 1', 2566)
  assert.deepEqual(r.list, [{ name: 'PLE-CC1 ชุด 1', year: 2566 }])
  assert.deepEqual(r.entry, { name: 'PLE-CC1 ชุด 1', year: 2566 })
})
test('upsertExamSet: ชื่อซ้ำ → อัปเดตปี ไม่เพิ่ม entry', () => {
  const r = upsertExamSet([{ name: 'A', year: 2565 }], 'A', 2566)
  assert.equal(r.list.length, 1)
  assert.equal(r.list[0].year, 2566)
})
test('upsertExamSet: ชื่อว่าง → null', () => {
  assert.equal(upsertExamSet([], '   ', 2566), null)
})
test('upsertExamSet: ปีไม่ valid → เก็บ year:null ได้ (ชุดไม่ระบุปี)', () => {
  const r = upsertExamSet([], 'B', 99999)
  assert.equal(r.list[0].year, null)
})

test('keepKnownSets: คัดเฉพาะชื่อที่รู้จัก + unique', () => {
  assert.deepEqual(keepKnownSets(['A', 'X', 'A', ''], ['A', 'B']), ['A'])
})
test('keepKnownSets: input ไม่ใช่ array → []', () => {
  assert.deepEqual(keepKnownSets(null, ['A']), [])
})

test('examSetLabel: มีปี → "name · ปี"', () => {
  assert.equal(examSetLabel({ name: 'A', year: 2566 }), 'A · 2566')
})
test('examSetLabel: ไม่มีปี → name', () => {
  assert.equal(examSetLabel({ name: 'A', year: null }), 'A')
})
