// เทส questionDraft — แปลง doc ↔ draft ↔ payload (pure ทั้งไฟล์)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { draftFrom, draftPayload, draftValid } from './questionDraft.js'

// ── draftFrom ──
test('draftFrom(null) = ข้อใหม่ ได้ช่องว่าง 4 ตัวเลือกและ key ครบทุกตัวที่ draftPayload ต้องใช้', () => {
  const d = draftFrom(null)
  assert.equal(d.id, null)
  assert.equal(d.question, '')
  assert.deepEqual(d.choices, ['', '', '', ''])
  assert.equal(d.answer, 0)
  assert.deepEqual(d.ple, { group: null, sub: null })
  assert.equal(d.explanation, '')
  assert.equal(d.reviewNote, '')
  assert.equal(d.isPublished, false)
  assert.equal(d.domain, null)
  assert.deepEqual(d.examSets, [])
})

test('draftFrom(doc) ก๊อป choices/examSets เป็น array ใหม่ — แก้ draft แล้วต้องไม่กระทบ doc เดิม', () => {
  const doc = { id: 'q1', question: 'Q', choices: ['a', 'b'], answer: 1, examSets: ['s1'] }
  const d = draftFrom(doc)
  d.choices.push('c')
  d.examSets.push('s2')
  assert.deepEqual(doc.choices, ['a', 'b'])
  assert.deepEqual(doc.examSets, ['s1'])
  assert.equal(d.answer, 1)
})

test('draftFrom ก๊อปช่องที่ฟอร์มย่อซ่อนไว้มาด้วย — ไม่งั้นบันทึกจากหน้าตรวจแล้วค่าหาย', () => {
  const doc = { id: 'q1', question: 'Q', choices: ['a', 'b'], answer: 0, pleGroup: 'cvs', domain: 'pharm', isPublished: true, examSets: ['s1'] }
  const d = draftFrom(doc)
  assert.equal(d.domain, 'pharm')
  assert.equal(d.isPublished, true)
  assert.deepEqual(d.examSets, ['s1'])
  assert.equal(d.ple.group, 'cvs')
})

// ── draftPayload ──
test('draftPayload ตัดตัวเลือกว่างท้ายทิ้ง แล้ว clamp answer เป็น 0 เมื่อเฉลยชี้ตัวที่ถูกตัด', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b', '', ''], answer: 3, ple: { group: null, sub: null } })
  assert.deepEqual(p.choices, ['a', 'b'])
  assert.equal(p.answer, 0)
})

test('draftPayload เก็บ answer ไว้เมื่อยังชี้ตัวเลือกที่มีจริง', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b', 'c'], answer: 2, ple: { group: null, sub: null } })
  assert.equal(p.answer, 2)
})

test('draftPayload: explanation/reviewNote ว่าง → null ไม่ใช่ string ว่าง', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b'], answer: 0, explanation: '   ', reviewNote: '', ple: { group: null, sub: null } })
  assert.equal(p.explanation, null)
  assert.equal(p.reviewNote, null)
})

test('draftPayload คำนวณ qhash จากโจทย์ที่ cleanText แล้ว — โจทย์เท่ากันได้ hash เท่ากัน', () => {
  const a = draftPayload({ question: '  ยาลดความดัน  ', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  const b = draftPayload({ question: 'ยาลดความดัน', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  assert.equal(a.qhash, b.qhash)
  assert.equal(typeof a.qhash, 'string')
})

test('draftPayload ไม่ใส่ updatedAt — ผู้เรียกเติม serverTimestamp() เอง (pure ห้ามแตะ Firestore)', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  assert.equal('updatedAt' in p, false)
})

test('draftPayload: กลุ่มโรคไม่ถูกต้อง → ไม่เขียน pleGroup/categories เลย (plePatch คืน null)', () => {
  const p = draftPayload({ question: 'Q', choices: ['a', 'b'], answer: 0, ple: { group: null, sub: null } })
  assert.equal('pleGroup' in p, false)
  assert.equal('categories' in p, false)
})

// ── draftValid ──
test('draftValid: ตัวเลือกไม่ถึง 2 ตัว → ไม่ผ่าน', () => {
  assert.equal(draftValid({ question: 'Q', choices: ['a', '', '', ''], answer: 0 }), false)
})

test('draftValid: โจทย์ว่าง → ไม่ผ่าน', () => {
  assert.equal(draftValid({ question: '   ', choices: ['a', 'b'], answer: 0 }), false)
})

test('draftValid: เฉลยชี้ช่องว่าง → ไม่ผ่าน', () => {
  assert.equal(draftValid({ question: 'Q', choices: ['a', 'b', ''], answer: 2 }), false)
})

test('draftValid: ครบเงื่อนไข → ผ่าน (ไม่สนกลุ่มโรค — หน้าคลังบังคับเอง)', () => {
  assert.equal(draftValid({ question: 'Q', choices: ['a', 'b'], answer: 1 }), true)
})
