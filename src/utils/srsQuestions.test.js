import test from 'node:test'
import assert from 'node:assert/strict'
import {
  packCard, unpackCard, dueCount, dueQuestionIds,
  applyQuizResults, buildQcardsPatch, GRADUATE_REPS, DAY_MS,
} from './srsQuestions.js'

const NOW = 1_755_648_000_000   // เวลาอ้างอิงคงที่ ให้เทส deterministic

test('ตอบผิดข้อใหม่ในควิซปกติ → การ์ดใหม่ due ทันที', () => {
  const { set, remove } = applyQuizResults({
    qcards: {}, answers: [{ id: 'q1', correct: false }], variant: 'normal', now: NOW,
  })
  assert.deepEqual(remove, [])
  assert.equal(set.q1.d, NOW, 'ต้อง due ทันที ไม่ใช่พรุ่งนี้')
  assert.equal(set.q1.r, 0)
  assert.equal(set.q1.l, 1)
  assert.equal(set.q1.t, 1)
})

test('ตอบผิดซ้ำในควิซปกติ → lapses เพิ่ม repetitions รีเซ็ต due ทันที', () => {
  const qcards = { q1: { e: 2.2, i: 6, r: 2, l: 1, t: 3, d: NOW - DAY_MS } }
  const { set } = applyQuizResults({
    qcards, answers: [{ id: 'q1', correct: false }], variant: 'normal', now: NOW,
  })
  assert.equal(set.q1.l, 2)
  assert.equal(set.q1.r, 0)
  assert.equal(set.q1.i, 1)
  assert.equal(set.q1.t, 4)
  assert.equal(set.q1.d, NOW)
})

// 21 พ.ย. 2026 กฎใหม่ (ทุกโหมด): ถูกติดกันครบ GRADUATE_REPS = ออกจากกอง · ผิด = นับใหม่ · ไม่เลื่อนวัน
test('ตอบถูกข้อที่ไม่อยู่ในกอง → ไม่แตะกอง', () => {
  const { set, remove } = applyQuizResults({ qcards: {}, answers: [{ id: 'q2', correct: true }], now: NOW })
  assert.deepEqual(set, {}); assert.deepEqual(remove, [])
})

test(`ถูกครั้งที่ 1–2 → ยังอยู่ในกอง นับเพิ่ม และยังทวนได้ทันที (ตัวเลขไม่หาย)`, () => {
  const r1 = applyQuizResults({ qcards: { q1: { r: 0, l: 1, t: 1, d: NOW } }, answers: [{ id: 'q1', correct: true }], variant: 'redo', now: NOW })
  assert.deepEqual(r1.remove, []); assert.equal(r1.set.q1.r, 1); assert.equal(r1.set.q1.d, NOW)
  const r2 = applyQuizResults({ qcards: { q1: r1.set.q1 }, answers: [{ id: 'q1', correct: true }], variant: 'normal', now: NOW })
  assert.deepEqual(r2.remove, []); assert.equal(r2.set.q1.r, 2)
  assert.equal(dueCount({ q1: r2.set.q1 }, NOW), 1)
})

test(`ถูกติดกันครบ ${GRADUATE_REPS} ครั้ง → ออกจากกอง`, () => {
  const { set, remove } = applyQuizResults({ qcards: { q1: { r: GRADUATE_REPS - 1, l: 1, t: 3, d: NOW } }, answers: [{ id: 'q1', correct: true }], now: NOW })
  assert.deepEqual(remove, ['q1']); assert.equal(set.q1, undefined, 'ออกจากกองแล้วห้ามเขียนค่ากลับ')
})

test('redo ตอบผิดซ้ำ → ยังอยู่ในกอง และต้องทวนทันที (ไม่เลื่อนไปพรุ่งนี้)', () => {
  const qcards = { q1: { e: 2.5, i: 6, r: 2, l: 1, t: 3, d: NOW } }
  const { set, remove } = applyQuizResults({
    qcards, answers: [{ id: 'q1', correct: false }], variant: 'redo', now: NOW,
  })
  assert.deepEqual(remove, [])
  assert.equal(set.q1.l, 2)
  assert.equal(set.q1.r, 0, 'ผิดแล้วนับถูกใหม่จาก 0')
  assert.equal(set.q1.d, NOW)
  assert.equal(dueCount({ q1: set.q1 }, NOW), 1, 'ตัวเลขต้องยังนับข้อนี้')
})

test('ข้อเดียวกันโผล่ซ้ำในรอบ → ไล่ตามลำดับ', () => {
  const qcards = { q1: { r: 2, d: NOW } }
  const a = applyQuizResults({ qcards, answers: [{ id: 'q1', correct: false }, { id: 'q1', correct: true }], now: NOW })
  assert.deepEqual(a.remove, []); assert.equal(a.set.q1.r, 1, 'ผิด (0) แล้วถูก (1)')
  const b = applyQuizResults({ qcards, answers: [{ id: 'q1', correct: true }, { id: 'q1', correct: false }], now: NOW })
  assert.deepEqual(b.remove, [], 'ครบ 3 แล้วผิดซ้ำในรอบเดียวกัน = กลับเข้ากอง'); assert.equal(b.set.q1.r, 0)
})

test('packCard/unpackCard ครบรอบได้ค่าเดิม', () => {
  const full = { easeFactor: 2.36, interval: 6, repetitions: 2, lapses: 3, totalReviews: 9, dueAt: NOW }
  assert.deepEqual(unpackCard(packCard(full)), full)
})

test('unpackCard ทน entry เสีย/ว่าง → คืนค่าตั้งต้น', () => {
  const d = unpackCard(undefined)
  assert.equal(d.easeFactor, 2.5)
  assert.equal(d.repetitions, 0)
  assert.equal(d.dueAt, 0)
})

test('dueQuestionIds: ทุกข้อในกองนับหมด (รวม due อนาคตจากระบบเก่า) · เรียงค้างนานสุดก่อน + ตัดที่ limit', () => {
  const qcards = {
    a: { d: NOW - 3 * DAY_MS },
    b: { d: NOW - 1 * DAY_MS },
    c: { d: NOW + 5 * DAY_MS },   // ระบบเก่าเลื่อนไว้ → ต้องกลับมานับ
    e: { d: NOW - 2 * DAY_MS },
  }
  assert.deepEqual(dueQuestionIds(qcards, NOW, 10), ['a', 'e', 'b', 'c'])
  assert.deepEqual(dueQuestionIds(qcards, NOW, 2), ['a', 'e'])
  assert.equal(dueCount(qcards, NOW), 4)
  assert.deepEqual(dueQuestionIds(undefined, NOW, 10), [])
  assert.equal(dueCount(undefined, NOW), 0)
})

test('ข้อที่หายจากคลัง → เข้ารายการลบทิ้ง', () => {
  const qcards = { q1: { e: 2.5, i: 1, r: 0, l: 1, t: 1, d: NOW }, gone: { d: NOW } }
  const { set, remove } = applyQuizResults({
    qcards, answers: [], variant: 'redo', now: NOW, missingIds: ['gone', 'neverExisted'],
  })
  assert.deepEqual(set, {})
  assert.deepEqual(remove, ['gone'], 'id ที่ไม่เคยอยู่ในกองไม่ต้องสั่งลบ')
})

test('buildQcardsPatch: optimistic เป็น object ซ้อน · server เป็น dot-notation · ไม่แตะ study.cards', () => {
  const study = { cards: { Amoxicillin: { interval: 6 } }, qcards: { old: { d: 1 } }, lastStudied: 123 }
  const DEL = Symbol('deleteField')
  const { optimisticStudy, server } = buildQcardsPatch({
    study, set: { q1: { e: 2.5, i: 1, r: 0, l: 1, t: 1, d: 999 } }, remove: ['old'], deleteSentinel: DEL,
  })
  assert.deepEqual(optimisticStudy.cards, { Amoxicillin: { interval: 6 } }, 'ห้ามแตะแฟลชการ์ดตัวยา')
  assert.equal(optimisticStudy.lastStudied, 123)
  assert.equal(optimisticStudy.qcards.old, undefined)
  assert.equal(optimisticStudy.qcards.q1.d, 999)
  assert.deepEqual(Object.keys(server).sort(), ['study.qcards.old', 'study.qcards.q1'])
  assert.equal(server['study.qcards.old'], DEL)
  assert.equal(server['study.qcards.q1'].d, 999)
  assert.equal(study.qcards.old.d, 1, 'ห้ามแก้ study ต้นฉบับ')
})
