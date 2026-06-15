// เทส usageMeter — pure logic ประเมินสถานะการใช้ Firestore (อ่าน/เขียน) เทียบลิมิตรายวัน
// รัน: node --test src/utils/usageMeter.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  usageStatus, usageDocId, addUsage,
  DAILY_READ_LIMIT, DAILY_WRITE_LIMIT, WARN_RATIO, DANGER_RATIO,
} from './usageMeter.js'

test('ยังว่าง (0,0) → ok', () => {
  assert.equal(usageStatus(0, 0), 'ok')
})

test('reads แตะ WARN_RATIO → warn, ต่ำกว่า 1 → ยัง ok', () => {
  assert.equal(usageStatus(DAILY_READ_LIMIT * WARN_RATIO, 0), 'warn')
  assert.equal(usageStatus(DAILY_READ_LIMIT * WARN_RATIO - 1, 0), 'ok')
})

test('reads แตะ DANGER_RATIO → danger', () => {
  assert.equal(usageStatus(DAILY_READ_LIMIT * DANGER_RATIO, 0), 'danger')
})

test('writes ก็ดันสถานะได้ (เอาตัวแย่สุดของ reads/writes)', () => {
  assert.equal(usageStatus(0, DAILY_WRITE_LIMIT * WARN_RATIO), 'warn')
  assert.equal(usageStatus(0, DAILY_WRITE_LIMIT * DANGER_RATIO), 'danger')
})

test('addUsage: รวม delta แบบ pure ไม่กลายพันธุ์ของเดิม', () => {
  const a = { reads: 10, writes: 2 }
  const b = addUsage(a, 5, 3)
  assert.deepEqual(b, { reads: 15, writes: 5 })
  assert.deepEqual(a, { reads: 10, writes: 2 }) // ของเดิมไม่ถูกแก้
})

test('addUsage: ค่า default และ acc ว่าง', () => {
  assert.deepEqual(addUsage(undefined, 3), { reads: 3, writes: 0 })
  assert.deepEqual(addUsage({ reads: 1, writes: 1 }), { reads: 1, writes: 1 })
})

test('usageDocId: usage_YYYY-MM-DD จากวันที่ท้องถิ่น', () => {
  assert.equal(usageDocId(new Date(2026, 5, 15)), 'usage_2026-06-15') // มิ.ย. = index 5
  assert.equal(usageDocId(new Date(2026, 11, 1)), 'usage_2026-12-01')
})
