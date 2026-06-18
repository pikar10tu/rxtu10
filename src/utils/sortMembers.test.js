// เทส sortMembers — จัดเรียงสมาชิก + ปักหมุดตัวเอง + registered ก่อน
// รัน: node --test src/utils/sortMembers.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sortMembers } from './sortMembers.js'

const M = (uid, studentId, nickname, level = 1, registered = true) =>
  ({ uid, studentId, nickname, registered, residence: { level } })

test('default = เรียงตามรหัสน้อย→มาก', () => {
  const out = sortMembers([M('a', '6502', 'บี'), M('b', '6501', 'เอ')])
  assert.deepEqual(out.map(m => m.studentId), ['6501', '6502'])
})

test('ปักหมุดตัวเองช่องแรกเสมอ แม้รหัสไม่ใช่ตัวน้อยสุด', () => {
  const out = sortMembers([M('a', '6501', 'เอ'), M('me', '6599', 'ฉัน'), M('b', '6502', 'บี')], 'studentId', 'me')
  assert.equal(out[0].uid, 'me')
  assert.deepEqual(out.slice(1).map(m => m.studentId), ['6501', '6502'])
})

test('เรียงตามชื่อเล่น (ก-ฮ)', () => {
  const out = sortMembers([M('a', '1', 'แมว'), M('b', '2', 'กบ')], 'nickname')
  assert.deepEqual(out.map(m => m.nickname), ['กบ', 'แมว'])
})

test('เรียงตามเลเวล มาก→น้อย', () => {
  const out = sortMembers([M('a', '1', 'x', 3), M('b', '2', 'y', 9)], 'level')
  assert.deepEqual(out.map(m => m.uid), ['b', 'a'])
})

test('ยังไม่เข้าระบบไปท้ายเสมอ', () => {
  const out = sortMembers([M('a', '6501', 'เอ', 1, false), M('b', '6502', 'บี', 1, true)])
  assert.deepEqual(out.map(m => m.uid), ['b', 'a'])
})

test('pure: ไม่ mutate input', () => {
  const input = [M('a', '6502', 'บี'), M('b', '6501', 'เอ')]
  const snapshot = input.map(m => m.uid)
  sortMembers(input)
  assert.deepEqual(input.map(m => m.uid), snapshot)
})
