import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stationPct, overallPct, classPct, weakestStation } from './mockScore.js'

const ST = [{ name: 'A', max: 10, mean: 8 }, { name: 'B', max: 11, mean: 9 }]

test('stationPct คิดจากคะแนนเต็มของฐาน', () => {
  assert.equal(stationPct(9, 11), 9 / 11)
  assert.equal(stationPct(null, 10), 0)
  assert.equal(stationPct(12, 10), 1)
})

test('overallPct = เฉลี่ย % รายฐาน (ตรงกับไฟล์ที่แปลงเป็นเต็ม 10 แล้วรวม)', () => {
  // ไฟล์: 10 + 9/11*10 = 18.18/20
  assert.ok(Math.abs(overallPct(ST, [10, 9]) - (10 + 9 / 11 * 10) / 20) < 1e-9)
})

test('classPct ใช้ค่าเฉลี่ยรายฐาน', () => {
  assert.ok(Math.abs(classPct(ST) - (0.8 + 9 / 11) / 2) < 1e-9)
})

test('weakestStation เลือกฐานที่ไม่ผ่านก่อน', () => {
  assert.equal(weakestStation(ST, [7, 11], 0.8), 0)
  assert.equal(weakestStation(ST, [10, 8], 0.8), 1)
})
