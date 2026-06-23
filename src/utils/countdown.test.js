// เทส countdown — pure logic นับถอยหลังสู่วันสอบ (โซนเวลาไทย +07)
// รัน: node --test src/utils/countdown.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { daysUntil, upcomingExams } from './countdown.js'

const CC = '2026-12-11T00:00:00+07:00'

test('daysUntil: คืนจำนวนวันตามปฏิทิน (โซนไทย +07)', () => {
  assert.equal(daysUntil(CC, new Date('2026-12-10T10:00:00+07:00').getTime()), 1)
  assert.equal(daysUntil(CC, new Date('2026-12-11T08:00:00+07:00').getTime()), 0)  // วันสอบ = วันนี้
  assert.equal(daysUntil(CC, new Date('2026-12-12T08:00:00+07:00').getTime()), -1) // ผ่านไปแล้ว
})

test('daysUntil: ข้ามเที่ยงคืนนับเพิ่มถูก (เย็นวันนี้ → พรุ่งนี้ = 1 วัน)', () => {
  assert.equal(daysUntil('2026-06-17T00:00:00+07:00', new Date('2026-06-16T23:00:00+07:00').getTime()), 1)
})

test('daysUntil: วันที่ผิดรูปแบบ → null', () => {
  assert.equal(daysUntil('ไม่ใช่วันที่'), null)
})

test('upcomingExams: เฉพาะที่ยังไม่ผ่าน (days>=0) เรียงใกล้สุดก่อน + แนบ days', () => {
  const now = new Date('2026-06-16T12:00:00+07:00').getTime()
  const exams = [
    { id: 'final', label: 'ไฟนอล', date: '2026-10-01T00:00:00+07:00' },
    { id: 'cc', label: 'CC', date: CC },
    { id: 'past', label: 'มิดเทอมที่ผ่านมา', date: '2026-03-01T00:00:00+07:00' },
  ]
  const r = upcomingExams(exams, now)
  assert.deepEqual(r.map(e => e.id), ['final', 'cc']) // past ตัดออก, เรียงใกล้สุดก่อน
  assert.ok(r[0].days > 0)
})

test('upcomingExams: สอบหลายวัน (dateEnd) ยังโชว์จนจบวันสุดท้าย + days นับถึงวันแรก', () => {
  const exams = [{ id: 'cc1', label: 'CC1', date: '2026-12-12T00:00:00+07:00', dateEnd: '2026-12-13T00:00:00+07:00' }]
  // วันที่ 13 (วันสุดท้าย): วันแรกผ่านไปแล้ว (days = -1) แต่ยังต้องโชว์อยู่
  const day2 = upcomingExams(exams, new Date('2026-12-13T08:00:00+07:00').getTime())
  assert.equal(day2.length, 1)
  assert.equal(day2[0].days, -1)
  // วันที่ 14 (หลังจบ): ตัดออก
  assert.deepEqual(upcomingExams(exams, new Date('2026-12-14T08:00:00+07:00').getTime()), [])
})

test('upcomingExams: ตัดวันที่พัง + รับ undefined ไม่ throw', () => {
  assert.deepEqual(upcomingExams(undefined), [])
  assert.deepEqual(upcomingExams([{ id: 'x', date: 'พัง' }], Date.now()), [])
})
