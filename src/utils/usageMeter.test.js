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

test('usageDocId: นับวันตามเวลาแปซิฟิก (รอบรีเซ็ตโควต้า)', () => {
  assert.equal(usageDocId(new Date('2026-11-27T07:59:00Z')), 'usage_2026-11-26')   // 14:59 ไทย = ยังวันก่อน
  assert.equal(usageDocId(new Date('2026-11-27T08:00:00Z')), 'usage_2026-11-27')   // 15:00 ไทย = รอบใหม่
  assert.equal(usageDocId(new Date('2026-06-15T12:00:00Z'), 'UTC'), 'usage_2026-06-15')
})

test('ประมาณค่าใช้จ่าย: ใต้โควต้าฟรี = 0 · เกิน = คิดเฉพาะส่วนเกิน', async () => {
  const { dayCost, monthEstimate, PRICE } = await import('./usageMeter.js')
  assert.equal(dayCost({ reads: 50000, writes: 20000 }), 0)
  assert.ok(Math.abs(dayCost({ reads: 150000, writes: 20000 }) - 0.0369) < 1e-9)
  const m = monthEstimate([{ reads: 150000, writes: 0 }, { reads: 0, writes: 0 }])
  assert.equal(m.days, 1)
  assert.ok(Math.abs(m.firestore - 0.0369 * 30) < 1e-9)
  assert.equal(m.total, m.firestore + PRICE.claudePro)
})

test('ปรับเทียบ: solveK หา k ที่ผลรวมตรงบิลจริง', async () => {
  const { solveK, dayCost } = await import('./usageMeter.js')
  const days = [{ reads: 60000, writes: 10000 }, { reads: 120000, writes: 25000 }]
  const k = solveK(days, 0.1)
  const sum = days.reduce((s, d) => s + dayCost(d, k), 0)
  assert.ok(Math.abs(sum - 0.1) < 0.002, String(sum))
  assert.equal(solveK(days, 0), null)
  assert.equal(solveK([{ reads: 10, writes: 1 }], 5), null)
})
