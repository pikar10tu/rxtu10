import test from 'node:test'
import assert from 'node:assert/strict'
import { examQuotas, examMinutes, loadExamState, saveExamState, clearExamState, gradeExam } from './examSim.js'

test('เวลา 1.5 นาที/ข้อ', () => {
  assert.equal(examMinutes(20), 30)
  assert.equal(examMinutes(120), 180)
})

test('สัดส่วนรวมเท่า n · กฎหมาย ≥5% · สังคม+กฎหมาย 10% · ผู้ป่วยราว 50%', () => {
  for (const n of [20, 40, 60, 120]) for (let k = 0; k < 200; k++) {
    const q = examQuotas(n)
    assert.equal(q.care + q.sci + q.sap + q.law, n)
    assert.ok(q.law >= Math.ceil(n * 0.05), `law ${n}`)
    assert.equal(q.sap + q.law, Math.round(n * 0.1))
    assert.ok(Math.abs(q.care - n / 2) <= 1)
    assert.ok(q.sap >= 0 && q.sci > 0)
  }
})

test('20 ข้อ: กฎหมาย 1–2 ข้อ', () => {
  const seen = new Set()
  for (let k = 0; k < 300; k++) seen.add(examQuotas(20).law)
  assert.deepEqual([...seen].sort(), [1, 2])
})

test('บันทึก/โหลด/ล้างในเครื่อง', () => {
  const m = new Map()
  const st = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }
  assert.equal(loadExamState(st, 'u'), null)
  saveExamState(st, 'u', { qs: [{ id: 'a' }, { id: 'b' }], ans: [1, null], star: [false, true], i: 1, deadline: 5 })
  const s = loadExamState(st, 'u')
  assert.deepEqual(s.ans, [1, null]); assert.equal(s.i, 1)
  clearExamState(st, 'u')
  assert.equal(loadExamState(st, 'u'), null)
  m.set('rx-exam-sim:u', '{bad')
  assert.equal(loadExamState(st, 'u'), null)
})

test('ตรวจคะแนน: ข้อที่ไม่ตอบไม่เข้า answers แต่นับในทั้งหมด', () => {
  const qs = [{ id: 'a', answer: 0 }, { id: 'b', answer: 1 }, { id: 'c', answer: 2 }]
  const r = gradeExam(qs, [0, 0, null])
  assert.equal(r.correct, 1); assert.equal(r.answered, 2); assert.equal(r.total, 3)
  assert.deepEqual(r.answers.map(a => a.correct), [true, false])
})
