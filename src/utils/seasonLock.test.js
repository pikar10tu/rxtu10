import { test } from 'node:test'
import assert from 'node:assert/strict'
import { seasonLockState } from './seasonLock.js'

const T = (s) => Date.parse(s + '+07:00')

test('เปิดปกติกลางเดือน', () => {
  assert.equal(seasonLockState(T('2026-10-27T12:00:00'), {}).locked, false)
})
test('ปิดตั้งแต่ 23:45 วันสุดท้าย (closing)', () => {
  assert.equal(seasonLockState(T('2026-10-31T23:44:59'), {}).locked, false)
  const s = seasonLockState(T('2026-10-31T23:45:00'), {})
  assert.deepEqual(s, { locked: true, reason: 'closing', season: '2026-10' })
})
test('ขึ้นเดือนใหม่ ยังไม่แจก = ปิดต่อ (tallying) · แจกเสร็จ = เปิด', () => {
  const t = T('2026-11-01T09:00:00')
  assert.deepEqual(seasonLockState(t, null), { locked: true, reason: 'tallying', season: '2026-10' })
  assert.equal(seasonLockState(t, { '2026-10': { status: 'sending' } }).locked, true)
  assert.equal(seasonLockState(t, { '2026-10': { status: 'done' } }).locked, false)
})
test('ยังโหลด config ไม่เสร็จ (undefined) ไม่ล็อกช่วง tallying · ซีซั่น ก.ย. ไม่อยู่ใต้กติกา', () => {
  assert.equal(seasonLockState(T('2026-11-01T09:00:00'), undefined).locked, false)
  assert.equal(seasonLockState(T('2026-10-05T09:00:00'), null).locked, false)
})
