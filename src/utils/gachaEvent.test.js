// เทสสถานะตู้อัญเชิญพิเศษ — pure · รัน: node --test src/utils/gachaEvent.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { eventState, eventLegendaryIds, timeLeftText, EVENT_FEATURED } from './gachaEvent.js'
import { releasedPets } from './petCatalog.js'
import { PETS } from '../data/index.js'

test('ไม่มีคอนฟิก = ไม่มีอีเวนต์', () => {
  assert.equal(eventState(null, 1000).active, false)
  assert.equal(eventState({}, 1000).active, false)
})

test('ยังไม่หมดเวลา = อีเวนต์เปิด และบอกเวลาที่เหลือ', () => {
  const st = eventState({ name: 'King of the Jungle', endsAt: 5000 }, 1000)
  assert.equal(st.active, true)
  assert.equal(st.name, 'King of the Jungle')
  assert.equal(st.msLeft, 4000)
})

test('หมดเวลาแล้ว = ปิด (เท่ากับ endsAt พอดี ยังถือว่าเปิด)', () => {
  assert.equal(eventState({ endsAt: 1000 }, 1000).active, true)
  assert.equal(eventState({ endsAt: 1000 }, 1001).active, false)
})

test('endsAt แบบ Firestore Timestamp อ่านได้ · รูปพัง = ไม่เปิด', () => {
  assert.equal(eventState({ endsAt: { seconds: 2 } }, 1000).active, true)
  assert.equal(eventState({ endsAt: 'พรุ่งนี้' }, 1000).active, false)
  assert.equal(eventState({ endsAt: null }, 1000).active, false)
})

test('ตัวเด่นดีฟอลต์มาจากโค้ด · คอนฟิกทับได้', () => {
  assert.deepEqual(eventState({ endsAt: 9e12 }, 0).featured, EVENT_FEATURED)
  assert.deepEqual(eventState({ endsAt: 9e12, featured: ['bahamut'] }, 0).featured, ['bahamut'])
})

test('legendary ในตู้อีเวนต์: ดันตัวเด่นที่ยังไม่มีก่อนเสมอ', () => {
  assert.deepEqual(eventLegendaryIds(EVENT_FEATURED, ['lion'], PETS), ['virus', 'gorilla'])
})

test('มีตัวเด่นครบแล้ว = ตกไปคลัง legendary ทั้งกอง', () => {
  const ids = eventLegendaryIds(EVENT_FEATURED, EVENT_FEATURED, PETS)
  assert.equal(ids.length, PETS.filter(p => p.rarity === 'legendary').length)
  assert.ok(ids.includes('bahamut'))
})

test('ตัวเด่นที่พิมพ์ผิด/ไม่มีในคลัง ต้องถูกกรองทิ้ง ไม่ใช่แจกของที่ไม่มีจริง', () => {
  assert.deepEqual(eventLegendaryIds(['lion', 'ไม่มีตัวนี้'], [], PETS), ['lion'])
})

test('ตัวเด่นตั้งต้นทั้งสามตัวเป็น legendary รุ่น 2 จริง (ไม่ใช่ id ที่พิมพ์ไว้ลอยๆ)', () => {
  for (const id of EVENT_FEATURED) {
    const def = PETS.find(p => p.id === id)
    assert.ok(def, `${id} ไม่มีในคลัง`)
    assert.equal(def.rarity, 'legendary')
    assert.equal(def.wave, 2)
  }
})

test('เส้นเวลาต่อกันสนิทกับคลังที่แจกได้ — ไม่มีช่วงที่ตู้ปิดแล้วแต่เพ็ทยังไม่ไหลเข้า', () => {
  const ev = { endsAt: 1000 }
  // ตู้เปิดอยู่ = ตู้ปกติยังเป็น 27 ตัว
  assert.equal(eventState(ev, 999).active, true)
  assert.equal(releasedPets(ev, 999).length, 27)
  // วินาทีที่ปิด = เพ็ทไหลเข้าคลังปกติทันที ไม่ต้องกดอะไร
  assert.equal(eventState(ev, 1001).active, false)
  assert.equal(releasedPets(ev, 1001).length, 33)
})

test('timeLeftText: อ่านง่ายและไม่ติดลบ', () => {
  assert.equal(timeLeftText(0), '00:00')
  assert.equal(timeLeftText(-5000), '00:00')
  assert.equal(timeLeftText(90 * 60 * 1000), '01:30')
  assert.equal(timeLeftText((2 * 86400 + 3 * 3600 + 4 * 60) * 1000), '2 วัน 03:04')
})
