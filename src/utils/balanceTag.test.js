import { test } from 'node:test'
import assert from 'node:assert/strict'
import { balanceTagOf } from './balanceTag.js'

const PATCH = {
  date: '2026-09-27', days: 14,
  tags: { lion: 'buff', bahamut: 'nerf', kirin: 'rework' },
}
const BKK = 7 * 60 * 60 * 1000
const START = Date.UTC(2026, 8, 27) - BKK   // เที่ยงคืนไทย 27 ก.ย.
const DAY = 24 * 60 * 60 * 1000

test('balanceTagOf — คืน null ถ้าเพ็ทไม่มีป้าย', () => {
  assert.equal(balanceTagOf('lion_notag', START, PATCH), null)
  assert.equal(balanceTagOf('unicorn', START, PATCH), null)
})

test('balanceTagOf — buff/nerf/rework คืนไอคอน+ป้ายถูกต้อง', () => {
  assert.deepEqual(balanceTagOf('lion', START, PATCH), { kind: 'buff', icon: '⬆️', label: 'บัฟ' })
  assert.deepEqual(balanceTagOf('bahamut', START, PATCH), { kind: 'nerf', icon: '⬇️', label: 'เนิร์ฟ' })
  assert.deepEqual(balanceTagOf('kirin', START, PATCH), { kind: 'rework', icon: '🔄', label: 'รีเวิร์ค' })
})

test('balanceTagOf — ก่อนวันเริ่ม = null', () => {
  assert.equal(balanceTagOf('lion', START - 1, PATCH), null)
})

test('balanceTagOf — ระหว่างช่วง (กลางวันที่ 13) ยังติดป้ายอยู่', () => {
  assert.notEqual(balanceTagOf('lion', START + 13 * DAY, PATCH), null)
})

test('balanceTagOf — พ้น days วันแล้ว = null (หายเอง)', () => {
  assert.equal(balanceTagOf('lion', START + 14 * DAY, PATCH), null)
  assert.equal(balanceTagOf('lion', START + 30 * DAY, PATCH), null)
})

test('balanceTagOf — petId/patch ว่าง = null ไม่พัง', () => {
  assert.equal(balanceTagOf('', START, PATCH), null)
  assert.equal(balanceTagOf('lion', START, null), null)
})

test('balanceTagOf — ใช้ BALANCE_PATCH จริงจาก petPassives.js เป็นดีฟอลต์ได้ (ไม่ throw)', () => {
  assert.doesNotThrow(() => balanceTagOf('lion'))
})
