// รัน: node --test src/utils/slotEdit.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tapSlot, tapItem, removeAt, compact } from './slotEdit.js'

test('แตะช่อง: เลือก → แตะซ้ำยกเลิก → แตะอีกช่องสลับแล้วเลิกเลือก', () => {
  let s = { slots: ['a', 'b', null], sel: null }
  s = tapSlot(s, 0); assert.equal(s.sel, 0)
  assert.equal(tapSlot(s, 0).sel, null)
  s = tapSlot(s, 1)
  assert.deepEqual(s.slots, ['b', 'a', null]); assert.equal(s.sel, null); assert.equal(s.event, 'swap')
})

test('แตะของ: ไม่มีช่องเลือก → ลงช่องว่างแรก · เต็ม → full ไม่แทนเงียบๆ', () => {
  let s = tapItem({ slots: ['a', null, null], sel: null }, 'b')
  assert.deepEqual(s.slots, ['a', 'b', null]); assert.equal(s.event, 'place')
  s = tapItem({ slots: ['a', 'b', 'c'], sel: null }, 'd')
  assert.equal(s.event, 'full'); assert.deepEqual(s.slots, ['a', 'b', 'c'])
})

test('แตะของ: มีช่องเลือก → แทนตัวในช่องนั้น แล้วเลิกเลือก (ไม่กระโดดไปช่องอื่น)', () => {
  const s = tapItem({ slots: ['a', 'b', 'c'], sel: 1 }, 'd')
  assert.deepEqual(s.slots, ['a', 'd', 'c']); assert.equal(s.event, 'replace'); assert.equal(s.sel, null)
})

test('แตะของที่อยู่ในช่องแล้ว: ไม่มีเลือก = เลือกช่องมัน · มีเลือก = สลับ', () => {
  assert.equal(tapItem({ slots: ['a', 'b', 'c'], sel: null }, 'c').sel, 2)
  assert.deepEqual(tapItem({ slots: ['a', 'b', 'c'], sel: 0 }, 'c').slots, ['c', 'b', 'a'])
})

test('✕ เอาออก: ช่องว่างค้างตรงนั้น ตัวอื่นไม่เลื่อน · compact สำหรับบันทึก', () => {
  const s = removeAt({ slots: ['a', 'b', 'c'], sel: 0 }, 1)
  assert.deepEqual(s.slots, ['a', null, 'c']); assert.equal(s.sel, 0)
  assert.deepEqual(compact(s.slots), ['a', 'c'])
})
