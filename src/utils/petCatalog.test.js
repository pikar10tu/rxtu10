// เทสด่านคลังเพ็ท — pure · รัน: node --test src/utils/petCatalog.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wave1Pets, releasedPets, obtainablePets, eventWave } from './petCatalog.js'
import { PETS } from '../data/index.js'

const idsOf = (list) => new Set(list.map(p => p.id))
const waveOf = (p) => p.wave || 1
const NOW = 1_000_000

test('eventWave: config ก.ย. (ไม่มี wave) = 2 · ไม่มี config = 1 (fail-closed)', () => {
  assert.equal(eventWave({ endsAt: NOW - 1 }), 2, 'config เดิมถือเป็น wave 2')
  assert.equal(eventWave(null), 1, 'ไม่มี config ปิดเสมอ')
  assert.equal(eventWave({}), 1, 'ไม่มี endsAt อ่านไม่ออก')
})

test('config ก.ย. เดิม (ไม่มี wave) = wave 2 · จบแล้ว ⇒ ตู้ปกติมี wave 2', () => {
  const ev = { endsAt: NOW - 1 }
  assert.equal(eventWave(ev), 2)
  const got = idsOf(releasedPets(ev, NOW))
  assert.ok(got.has('lion'), 'wave 2 เปล่อยให้ผู้เล่นได้เมื่ออีเวนต์จบ')
})

test('ตู้ wave 3 เปิดอยู่: releasedPets มี wave 2 (w-1=2) · obtainablePets มี wave 2', () => {
  // ทดสอบลอจิก w-1 vs w ด้วยตัวนี้เนื่องจากยังไม่มี wave 3 pets
  const ev = { wave: 3, endsAt: NOW + 1000 }
  assert.equal(eventWave(ev), 3)
  const released = releasedPets(ev, NOW)
  const obtainable = obtainablePets(ev, NOW)
  // releasedPets ปล่อยแค่ wave ≤ w-1 = 2 (wave 2 pets เช่น 'lion' ควรมี)
  assert.ok(idsOf(released).has('lion'), 'lion (wave 2) ที่ w=3 เปิด ควรมี ใน released (ดึง w-1=2)')
  assert.ok(obtainable.every(p => waveOf(p) <= 3), 'obtainable อ่านว่า wave ≤ 3')
  assert.ok(idsOf(obtainable).has('lion'), 'lion ใน obtainable ด้วย')
})

test('ตู้ wave 2 เปิดอยู่: releasedPets ไม่มี wave 2 · obtainablePets มี wave 2', () => {
  // ตู้อีเวนต์ wave 2 เปิด แต่ releasedPets (คลังปกติ) ยังไม่ปล่อย wave 2 (ยังคิด w-1=1)
  const ev = { wave: 2, endsAt: NOW + 1000 }
  assert.equal(eventWave(ev), 2)
  const released = releasedPets(ev, NOW)
  const obtainable = obtainablePets(ev, NOW)
  // releasedPets: max = w - 1 = 1 ⇒ wave 2 pets ห้ามมี
  assert.ok(!idsOf(released).has('lion'), 'lion (wave 2) ที่ w=2 เปิด ห้ามมี ใน released')
  // obtainablePets: event open ⇒ wave ≤ 2 ⇒ lion มี
  assert.ok(idsOf(obtainable).has('lion'), 'lion ใน obtainable เพราะอีเวนต์เปิด')
})

test('ตู้ wave 2 จบแล้ว ⇒ wave 2 ไหลเข้าตู้ปกติ', () => {
  // เมื่ออีเวนต์จบแล้ว max = w (ไม่ใช่ w-1) ⇒ wave 2 pets ถูกปล่อยให้ตู้ปกติ
  const ev = { wave: 2, endsAt: NOW - 1 }
  const released = releasedPets(ev, NOW)
  assert.ok(idsOf(released).has('lion'), 'lion ใน released เมื่อเหตุการณ์ w=2 จบแล้ว')
})

// หมายเหตุ: wave 3 pets ('sol', 'earth', 'luna') ยังไม่เข้า PETS (Task A 4) · เมื่อมี จะเทสเพ็ทตัวนั้นจริงๆ

test('ไม่มี config = wave 1 เท่านั้น (fail-closed)', () => {
  const got = idsOf(releasedPets(null, NOW))
  assert.ok(!got.has('lion'), 'wave 2 ห้ามหลุด')
})

test('wave1Pets ไม่มี wave 2 ขึ้นไป', () => {
  assert.ok(wave1Pets().every(p => !p.wave || p.wave === 1))
})

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
