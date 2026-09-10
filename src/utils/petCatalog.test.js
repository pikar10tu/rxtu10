// เทสด่านคลังเพ็ท — pure · รัน: node --test src/utils/petCatalog.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wave1Pets, releasedPets } from './petCatalog.js'
import { PETS } from '../data/index.js'

test('ไม่มีอีเวนต์ = แจกได้แค่ wave 1 (ดีฟอลต์ปลอดภัย)', () => {
  const ids = releasedPets(null).map(p => p.id)
  assert.deepEqual(ids, wave1Pets().map(p => p.id))
  assert.ok(ids.length > 0)
  assert.ok(PETS.every(p => p.wave === 2 || ids.includes(p.id)))
})

test('อีเวนต์ยังไม่หมดเวลา = ตู้ปกติยังเป็น wave 1', () => {
  const ev = { endsAt: 2_000 }
  assert.deepEqual(releasedPets(ev, 1_000).map(p => p.id), wave1Pets().map(p => p.id))
})

test('หมดเวลาแล้ว = ได้ครบทั้งคลังโดยไม่ต้องกดปุ่มแอดมิน', () => {
  const ev = { endsAt: 1_000 }
  assert.equal(releasedPets(ev, 2_000).length, PETS.length)
})

test('endsAt แบบ Firestore Timestamp ({seconds}) อ่านได้เหมือนกัน', () => {
  const ev = { endsAt: { seconds: 1 } }                 // = 1,000ms
  assert.equal(releasedPets(ev, 2_000).length, PETS.length)
  assert.deepEqual(releasedPets(ev, 500).map(p => p.id), wave1Pets().map(p => p.id))
})

test('อีเวนต์รูปพัง/ไม่มี endsAt = ถือว่ายังไม่เปิด (ห้าม fail-open)', () => {
  for (const ev of [{}, { endsAt: null }, { endsAt: 'พรุ่งนี้' }, 'ไม่ใช่ออบเจกต์']) {
    assert.deepEqual(releasedPets(ev, 9e12).map(p => p.id), wave1Pets().map(p => p.id))
  }
})

test('ลำดับในคลังไม่สลับ — ผลสุ่มของทุกระบบอ่านด้วยดัชนี', () => {
  const ids = releasedPets(null).map(p => p.id)
  assert.deepEqual(ids, PETS.filter(p => p.wave !== 2).map(p => p.id))
})
