import test from 'node:test'
import assert from 'node:assert/strict'
import { shuffle, shuffleChoices, isPinnedChoice } from './quizShuffle.js'

test('shuffle ไม่แตะ array เดิม และคงสมาชิกครบ', () => {
  const src = [1, 2, 3, 4, 5]
  const out = shuffle(src)
  assert.deepEqual(src, [1, 2, 3, 4, 5], 'ต้นฉบับต้องไม่ถูกแก้')
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5])
})

test('shuffleChoices สลับตัวเลือกแล้ว answer ยังชี้ข้อความเดิม', () => {
  const q = { id: 'q1', question: 'อะไร', choices: ['ก', 'ข', 'ค', 'ง'], answer: 2 }
  for (let i = 0; i < 50; i++) {
    const s = shuffleChoices(q)
    assert.equal(s.choices[s.answer], 'ค', 'เฉลยต้องยังเป็นข้อความเดิมเสมอ')
    assert.equal(s.choices.length, 4)
    assert.deepEqual([...s.choices].sort(), ['ก', 'ข', 'ค', 'ง'])
    assert.equal(s.id, 'q1', 'ฟิลด์อื่นต้องติดไปด้วย')
    assert.deepEqual(q.choices, ['ก', 'ข', 'ค', 'ง'], 'ต้นฉบับต้องไม่ถูกแก้')
  }
})

test('shuffleChoices ตัวเลือกแบบ "ถูกทุกข้อ/ข้างต้น/ไม่มีข้อถูก" อยู่ที่เดิมเสมอ', () => {
  const q = { choices: ['ก', 'ข', 'ค', 'ไม่มีข้อถูก', 'ทุกข้อข้างต้น'], answer: 4 }
  for (let i = 0; i < 50; i++) {
    const s = shuffleChoices(q)
    assert.equal(s.choices[3], 'ไม่มีข้อถูก')
    assert.equal(s.choices[4], 'ทุกข้อข้างต้น')
    assert.equal(s.answer, 4)
    assert.deepEqual([...s.choices.slice(0, 3)].sort(), ['ก', 'ข', 'ค'])
  }
})

test('isPinnedChoice จับคำแบบรวมทุกตัวเลือก แต่ไม่จับตัวเลือกเนื้อหาปกติ', () => {
  for (const c of ['ถูกทุกข้อ', 'ทุกข้อข้างต้น', 'ไม่มีข้อใดถูก', 'ผิดทุกข้อ', 'ข้อ 1 และ 2', 'ไม่มีข้อถูก', 'ถูกเฉพาะข้อ ก และ ค', 'All of the above'])
    assert.ok(isPinnedChoice(c), c)
  for (const c of ['Clindamycin และ Erythromycin', 'A,C', 'วิตามิน A, D, E, K', 'ยาไม่มีข้อบ่งใช้', 'ถูกทุกข้อในผู้ใหญ่'.slice(0, 3)])
    assert.ok(!isPinnedChoice(c), c)
})
