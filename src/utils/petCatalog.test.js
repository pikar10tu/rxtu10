// เทสด่านคลังเพ็ท — pure · รัน: node --test src/utils/petCatalog.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wave1Pets, releasedPets, obtainablePets } from './petCatalog.js'
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

const WAVE2 = ['lion', 'virus', 'gorilla', 'boar', 'badger', 'bat']

test('เพ็ทรุ่น 2 อยู่ในคลัง 33 ตัว แต่แจกไม่ได้จนกว่าอีเวนต์จะหมดเวลา', () => {
  assert.equal(PETS.length, 33)
  const live = new Set(releasedPets(null).map(p => p.id))
  for (const id of WAVE2) {
    assert.ok(PETS.some(p => p.id === id), `${id} ไม่อยู่ในคลัง`)
    assert.equal(live.has(id), false, `${id} หลุดออกมาแจกได้`)
  }
  assert.equal(releasedPets(null).length, 27)
})

test('สัดส่วนชั้น/สายของคลังเต็มตรงสเปก (11/11/11 · 12 legend · 9 epic)', () => {
  const by = (k, v) => PETS.filter(p => p[k] === v).length
  assert.equal(by('element', 'fist'), 11)
  assert.equal(by('element', 'scissors'), 11)
  assert.equal(by('element', 'paper'), 11)
  assert.equal(by('rarity', 'legendary'), 12)
  assert.equal(by('rarity', 'epic'), 9)
  assert.equal(by('rarity', 'rare'), 6)
  assert.equal(by('rarity', 'common'), 6)
})

test('เพ็ทรุ่น 2 ห้ามมี atkStyle/projectile (ทุกตัวเป็น melee หมดแล้ว)', () => {
  for (const p of PETS.filter(p => p.wave === 2)) {
    assert.equal(p.atkStyle, undefined, `${p.id} มี atkStyle`)
    assert.equal(p.projectile, undefined, `${p.id} มี projectile`)
  }
})

test('obtainablePets: ระหว่างอีเวนต์เปิด = หาได้ครบ 33 (ตู้พิเศษแจกเพ็ทรุ่น 2 อยู่)', () => {
  const ev = { endsAt: 2000 }
  assert.equal(obtainablePets(ev, 1000).length, 33)
  assert.equal(releasedPets(ev, 1000).length, 27, 'ตู้ปกติยังเป็น 27 ตามเดิม')
})

test('obtainablePets: ไม่มีอีเวนต์ = เท่ากับคลังปกติ · หมดเวลาแล้ว = 33 เหมือนกัน', () => {
  assert.equal(obtainablePets(null, 1000).length, 27)
  assert.equal(obtainablePets({ endsAt: 1000 }, 5000).length, 33)
})
