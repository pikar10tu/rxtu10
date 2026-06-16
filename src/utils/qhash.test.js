// เทส qhash — pure: normalize โจทย์ + hash + ตรวจซ้ำ (import dedup + จัดกลุ่มคลัง)
// รัน: node --test src/utils/qhash.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normForHash, qhash, splitDuplicateRows, groupDuplicates } from './qhash.js'

// ── normForHash ──
test('normForHash: lowercase + ยุบช่องว่างซ้อน/ขึ้นบรรทัด + ตัดหัวท้าย', () => {
  assert.equal(normForHash('  Para  CETAMOL\n\t500 mg  '), 'para cetamol 500 mg')
})

test('normForHash: ค่าว่าง/null → string ว่าง', () => {
  assert.equal(normForHash(null), '')
  assert.equal(normForHash(undefined), '')
  assert.equal(normForHash('   '), '')
})

// ── qhash ──
test('qhash: คืน string ไม่ว่างและ deterministic (โจทย์เดิม → ค่าเดิม)', () => {
  const h = qhash('ยาใดเป็น first-line')
  assert.equal(typeof h, 'string')
  assert.ok(h.length > 0)
  assert.equal(h, qhash('ยาใดเป็น first-line'))
})

test('qhash: โจทย์ที่ normalize แล้วเท่ากัน → hash เท่ากัน (ต่างแค่ช่องว่าง/ตัวพิมพ์)', () => {
  assert.equal(qhash('Aspirin   ขนาด 81 MG'), qhash('aspirin ขนาด 81 mg'))
})

test('qhash: โจทย์ต่างกัน → hash ต่างกัน', () => {
  assert.notEqual(qhash('ยา A'), qhash('ยา B'))
})

// ── splitDuplicateRows: กันซ้ำตอน import ──
test('splitDuplicateRows: ไม่ซ้ำคลัง ไม่ซ้ำกันเอง → fresh ทั้งหมด', () => {
  const rows = [{ question: 'ข้อหนึ่ง' }, { question: 'ข้อสอง' }]
  const { fresh, duplicates } = splitDuplicateRows(rows, [])
  assert.equal(fresh.length, 2)
  assert.equal(duplicates.length, 0)
})

test('splitDuplicateRows: ชนข้อในคลัง → ไปอยู่ duplicates', () => {
  const existing = [qhash('ข้อที่มีอยู่แล้ว')]
  const rows = [{ question: 'ข้อที่มีอยู่แล้ว' }, { question: 'ข้อใหม่' }]
  const { fresh, duplicates } = splitDuplicateRows(rows, existing)
  assert.deepEqual(fresh.map(r => r.question), ['ข้อใหม่'])
  assert.deepEqual(duplicates.map(r => r.question), ['ข้อที่มีอยู่แล้ว'])
})

test('splitDuplicateRows: ซ้ำกันเองในก้อน → เก็บตัวแรก ที่เหลือเป็น duplicates', () => {
  const rows = [{ question: 'ซ้ำ' }, { question: 'ซ้ำ' }, { question: 'ไม่ซ้ำ' }]
  const { fresh, duplicates } = splitDuplicateRows(rows, [])
  assert.equal(fresh.length, 2)
  assert.equal(duplicates.length, 1)
})

// ── groupDuplicates: ตรวจซ้ำในคลัง ──
test('groupDuplicates: คืนเฉพาะกลุ่มที่ซ้ำ (>1) จัดกลุ่มตาม qhash', () => {
  const questions = [
    { id: 'a', question: 'พารา' },
    { id: 'b', question: 'พารา ' },   // normalize แล้วเท่า a
    { id: 'c', question: 'แอสไพริน' },
  ]
  const groups = groupDuplicates(questions)
  assert.equal(groups.length, 1)
  assert.deepEqual(groups[0].map(q => q.id).sort(), ['a', 'b'])
})

test('groupDuplicates: ใช้ qhash ที่มีอยู่ในเอกสารถ้ามี (ไม่ต้องคำนวณใหม่)', () => {
  const questions = [
    { id: 'a', question: 'x', qhash: 'SAME' },
    { id: 'b', question: 'y', qhash: 'SAME' },
  ]
  const groups = groupDuplicates(questions)
  assert.equal(groups.length, 1)
  assert.equal(groups[0].length, 2)
})

test('groupDuplicates: ข้ามข้อที่ไม่มีโจทย์', () => {
  const groups = groupDuplicates([{ id: 'a' }, { id: 'b', question: '' }, null])
  assert.equal(groups.length, 0)
})
