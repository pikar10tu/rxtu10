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
  // เพ็ท wave 1 ทุกตัวต้องหลุดออกมา — wave 2/3 (รวมฟากฟ้า Task A 4) ยังไม่ปล่อยจนกว่าอีเวนต์จะจบ
  assert.ok(PETS.every(p => waveOf(p) !== 1 || ids.includes(p.id)))
})

test('อีเวนต์ยังไม่หมดเวลา = ตู้ปกติยังเป็น wave 1', () => {
  const ev = { endsAt: 2_000 }
  assert.deepEqual(releasedPets(ev, 1_000).map(p => p.id), wave1Pets().map(p => p.id))
})

test('หมดเวลาแล้ว (config เดิม ไม่มี wave = ถือเป็น wave 2) = ได้ wave 1+2 ครบ · wave 3 (ฟากฟ้า) ยังไม่ปล่อย', () => {
  const ev = { endsAt: 1_000 }
  assert.equal(releasedPets(ev, 2_000).length, 33)
})

test('endsAt แบบ Firestore Timestamp ({seconds}) อ่านได้เหมือนกัน', () => {
  const ev = { endsAt: { seconds: 1 } }                 // = 1,000ms
  assert.equal(releasedPets(ev, 2_000).length, 33)
  assert.deepEqual(releasedPets(ev, 500).map(p => p.id), wave1Pets().map(p => p.id))
})

test('อีเวนต์รูปพัง/ไม่มี endsAt = ถือว่ายังไม่เปิด (ห้าม fail-open)', () => {
  for (const ev of [{}, { endsAt: null }, { endsAt: 'พรุ่งนี้' }, 'ไม่ใช่ออบเจกต์']) {
    assert.deepEqual(releasedPets(ev, 9e12).map(p => p.id), wave1Pets().map(p => p.id))
  }
})

test('ลำดับในคลังไม่สลับ — ผลสุ่มของทุกระบบอ่านด้วยดัชนี', () => {
  const ids = releasedPets(null).map(p => p.id)
  assert.deepEqual(ids, PETS.filter(p => waveOf(p) === 1).map(p => p.id))
})

const WAVE2 = ['lion', 'virus', 'gorilla', 'boar', 'badger', 'bat']
const WAVE3 = ['sol', 'earth', 'luna']

test('เพ็ทรุ่น 2 อยู่ในคลัง แต่แจกไม่ได้จนกว่าอีเวนต์จะหมดเวลา · รุ่น 3 (ฟากฟ้า) เข้าคลังแล้วด้วย (Task A 4)', () => {
  assert.equal(PETS.length, 36)
  const live = new Set(releasedPets(null).map(p => p.id))
  for (const id of [...WAVE2, ...WAVE3]) {
    assert.ok(PETS.some(p => p.id === id), `${id} ไม่อยู่ในคลัง`)
    assert.equal(live.has(id), false, `${id} หลุดออกมาแจกได้`)
  }
  assert.equal(releasedPets(null).length, 27)
})

test('สัดส่วนชั้น/สายของคลังเต็มตรงสเปก (12/12/12 · 15 legend · 9 epic) — รวมฟากฟ้า wave 3', () => {
  const by = (k, v) => PETS.filter(p => p[k] === v).length
  assert.equal(by('element', 'fist'), 12)
  assert.equal(by('element', 'scissors'), 12)
  assert.equal(by('element', 'paper'), 12)
  assert.equal(by('rarity', 'legendary'), 15)
  assert.equal(by('rarity', 'epic'), 9)
  assert.equal(by('rarity', 'rare'), 6)
  assert.equal(by('rarity', 'common'), 6)
})

// ── wave 3 leak tests (Task A 4) — sol/earth/luna ต้องไม่หลุดออกจากตู้ก่อนเวลา ──────
test('wave 3: config ไม่มี wave และหมดเวลาแล้ว ⇒ releasedPets ยังไม่มี sol (fallback wave 2)', () => {
  const ev = { endsAt: NOW - 1 }
  assert.ok(!idsOf(releasedPets(ev, NOW)).has('sol'))
})

test('wave 3: อีเวนต์ wave 3 เปิดอยู่ ⇒ releasedPets ไม่มี sol · obtainablePets มี sol', () => {
  const ev = { wave: 3, endsAt: NOW + 1000 }
  assert.ok(!idsOf(releasedPets(ev, NOW)).has('sol'), 'ตู้ปกติยังไม่ปล่อย wave 3 ระหว่างอีเวนต์เปิด')
  assert.ok(idsOf(obtainablePets(ev, NOW)).has('sol'), 'ตู้พิเศษของอีเวนต์แจก sol ได้')
})

test('wave 3: อีเวนต์ wave 3 จบแล้ว ⇒ sol ไหลเข้าตู้ปกติ (releasedPets มี sol)', () => {
  const ev = { wave: 3, endsAt: NOW - 1 }
  assert.ok(idsOf(releasedPets(ev, NOW)).has('sol'))
})

test('wave 3: wave1Pets() ไม่มี sol', () => {
  assert.ok(!idsOf(wave1Pets()).has('sol'))
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
