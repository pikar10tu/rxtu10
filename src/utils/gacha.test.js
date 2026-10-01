import { test } from 'node:test'
import assert from 'node:assert/strict'
import { legendaryChance, rollRarity, GACHA_RATES, HALF_PITY, HARD_PITY, PULL_COST, TEN_PULL_COST, TEN_PULL_N } from './gacha.js'

// rng ปลอม: คืนค่าจาก list ตามลำดับการเรียก (ตัวสุดท้ายค้างไว้)
const seq = (vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)] }

test('legendaryChance คงที่ 1% ไม่ไต่ (user เคาะ 1 ต.ค.)', () => {
  assert.equal(GACHA_RATES.legendary, 1)
  assert.equal(legendaryChance(0), 1)
  assert.equal(legendaryChance(48), 1)
  assert.equal(GACHA_RATES.common + GACHA_RATES.rare + GACHA_RATES.epic + GACHA_RATES.legendary, 100)
})

test('rollRarity = legendary เมื่อ rng ต่ำกว่า chance', () => {
  assert.equal(rollRarity(0, seq([0.0])), 'legendary')
})

test('rollRarity tier ล่างเมื่อไม่ออก legendary', () => {
  assert.equal(rollRarity(0, seq([0.99, 0.0])), 'epic')    // ไม่ legendary; r2 ต่ำ → epic
  assert.equal(rollRarity(0, seq([0.99, 0.99])), 'common') // r2 สูง → common
})

import { pickLegendary } from './gacha.js'

const LEG = ['bahamut', 'kirin', 'trex', 'ouroboros']

test('pickLegendary: guaranteed → ได้เป้าแน่ ล้างธง', () => {
  const r = pickLegendary({ target: 'kirin', guaranteed: true, ownedLegendaryIds: [], legendaryIds: LEG, rng: () => 0.99 })
  assert.deepEqual(r, { id: 'kirin', won: true, newGuaranteed: false })
})

test('pickLegendary: win 50/50 → ได้เป้า', () => {
  const r = pickLegendary({ target: 'kirin', guaranteed: false, ownedLegendaryIds: [], legendaryIds: LEG, rng: () => 0.0 }) // <0.5
  assert.deepEqual(r, { id: 'kirin', won: true, newGuaranteed: false })
})

test('pickLegendary: lose 50/50 → ได้ตัวอื่น + ติดธง', () => {
  // rng#1 = 0.9 (>=0.5 → lose), rng#2 = 0 → เลือก others[0]
  const seqq = (() => { let i = 0; const v = [0.9, 0.0]; return () => v[Math.min(i++, v.length - 1)] })()
  const r = pickLegendary({ target: 'kirin', guaranteed: false, ownedLegendaryIds: [], legendaryIds: LEG, rng: seqq })
  assert.equal(r.won, false)
  assert.equal(r.newGuaranteed, true)
  assert.notEqual(r.id, 'kirin')
  assert.ok(LEG.includes(r.id))
})

test('pickLegendary: ไม่มีเป้า → new-first (สุ่มตัวที่ยังไม่มี)', () => {
  const r = pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: ['bahamut', 'kirin', 'trex'], legendaryIds: LEG, rng: () => 0.0 })
  assert.equal(r.id, 'ouroboros') // ตัวเดียวที่ยังไม่มี
  assert.equal(r.won, null)
  assert.equal(r.newGuaranteed, false)
})

test('pickLegendary: ไม่มีเป้า + มีครบแล้ว → สุ่มทั้งหมด', () => {
  const r = pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: LEG, legendaryIds: LEG, rng: () => 0.0 })
  assert.ok(LEG.includes(r.id))
  assert.equal(r.won, null)
})

import { rollOne, rollMany, rarityPool } from './gacha.js'

// catalog ปลอม: 1 legendary, 1 epic, 1 rare, 1 common
const CAT = [
  { id: 'L1', rarity: 'legendary' }, { id: 'L2', rarity: 'legendary' },
  { id: 'E1', rarity: 'epic' }, { id: 'R1', rarity: 'rare' }, { id: 'C1', rarity: 'common' },
]

test('rarityPool คืน id ตาม rarity', () => {
  assert.deepEqual(rarityPool(CAT, 'legendary'), ['L1', 'L2'])
  assert.deepEqual(rarityPool(CAT, 'common'), ['C1'])
})

test('rollOne: ไม่ legendary → pity+1', () => {
  const r = rollOne({ pity: 3, target: null, guaranteed: false, ownedLegendaryIds: [] }, CAT, () => 0.99)
  assert.equal(r.nextPity, 4)
  assert.notEqual(r.rarity, 'legendary')
})

test('rollOne: legendary → pity reset 0 + เพิ่ม owned', () => {
  const r = rollOne({ pity: 10, target: null, guaranteed: false, ownedLegendaryIds: [] }, CAT, () => 0.0)
  assert.equal(r.rarity, 'legendary')
  assert.equal(r.nextPity, 0)
  assert.ok(r.nextOwned.includes(r.id))
})

test('rollMany: การันตี ≥1 epic ใน 10-pull (เคสได้ common ล้วน)', () => {
  const { results, nextState } = rollMany(11, { pity: 0, target: null, guaranteed: false, ownedLegendaryIds: [] }, CAT, () => 0.99)
  assert.equal(results.length, 11)
  assert.ok(results.some((r) => r.rarity === 'epic'))   // ตัวสุดท้ายถูกอัพ
  assert.equal(results[10].rarity, 'epic')
  assert.equal(nextState.pity, 11)                      // 11 common = pity ไต่ถึง 11
})

import { resolvePullPayment } from './gacha.js'

test('resolvePullPayment ×1: ตั๋ว≥1 จ่ายตั๋ว ไม่งั้นเหรียญ', () => {
  assert.deepEqual(resolvePullPayment(1, 5), { rolls: 1, pay: 'ticket', amount: 1 })
  assert.deepEqual(resolvePullPayment(1, 0), { rolls: 1, pay: 'coin', amount: PULL_COST })
})

test('resolvePullPayment ×10: ตั๋ว≥10 จ่าย 10 ตั๋ว (11 ตัว) ไม่งั้น 10000 เหรียญ', () => {
  assert.deepEqual(resolvePullPayment(10, 10), { rolls: TEN_PULL_N, pay: 'ticket', amount: 10 })
  assert.deepEqual(resolvePullPayment(10, 9),  { rolls: TEN_PULL_N, pay: 'coin', amount: TEN_PULL_COST })
})

// ── คลัง legendary เฉพาะกิจ (ตู้อีเวนต์ของ P5) ──
test('rollOne: ส่ง legendaryIds เฉพาะกิจ = legendary ออกจากกองนั้นเท่านั้น', () => {
  const state = { pity: HALF_PITY - 1, target: null, guaranteed: false, ownedLegendaryIds: [] }
  const r = rollOne(state, CAT, () => 0, { legendaryIds: ['L2'] })
  assert.equal(r.rarity, 'legendary')
  assert.equal(r.id, 'L2')
})

test('rollOne: ไม่ส่ง opts = พฤติกรรมเดิมเป๊ะ (อ่าน legendary จาก catalog)', () => {
  const state = { pity: HALF_PITY - 1, target: null, guaranteed: false, ownedLegendaryIds: [] }
  const r = rollOne(state, CAT, () => 0)
  assert.equal(r.rarity, 'legendary')
  assert.ok(['L1', 'L2'].includes(r.id))
})

test('rollMany: ส่ง legendaryIds ต่อทอดถึงทุกใบในชุด', () => {
  const state = { pity: HALF_PITY - 1, target: null, guaranteed: false, ownedLegendaryIds: [] }
  const { results } = rollMany(11, state, CAT, () => 0, { legendaryIds: ['L2'] })
  for (const r of results.filter(x => x.rarity === 'legendary')) assert.equal(r.id, 'L2')
})

test('rollOne: legendaryIds ว่าง = ตกกลับไปใช้คลังของ catalog (ไม่ใช่แจกของว่าง)', () => {
  const state = { pity: HALF_PITY - 1, target: null, guaranteed: false, ownedLegendaryIds: [] }
  const r = rollOne(state, CAT, () => 0, { legendaryIds: [] })
  assert.ok(['L1', 'L2'].includes(r.id))
})

// ── ตู้ธีม: ตัวเด่นน้ำหนัก ×3 + hard pity ได้เป้า (user เคาะ 26 ก.ย.) ──
import { pickThemeLegendary, THEME_FEATURED_WEIGHT } from './gacha.js'

const L = ['a', 'b', 'c', 'x', 'y']        // x, y = ตัวเด่น

test('ตู้ธีม: ตัวเด่นน้ำหนัก ×3', () => {
  assert.equal(THEME_FEATURED_WEIGHT, 3)
  // น้ำหนักรวม 3 + 6 = 9 · rng 0.5 → 4.5 → ตก x
  const r = pickThemeLegendary({ target: null, atHardPity: false, legendaryIds: L, featured: ['x', 'y'], rng: () => 0.5 })
  assert.equal(r.id, 'x')
  assert.equal(r.won, null)
})

test('ตู้ธีม: hard pity = ได้เป้าเสมอ', () => {
  const r = pickThemeLegendary({ target: 'y', atHardPity: true, legendaryIds: L, featured: ['x', 'y'], rng: () => 0 })
  assert.deepEqual(r, { id: 'y', won: true, newGuaranteed: false })
})

test('ตู้ธีม: ไม่ใช่ hard pity = ถ่วง ×3 ธรรมดา แม้มีเป้า (ไม่มี 50/50 ไม่มีธง)', () => {
  const r = pickThemeLegendary({ target: 'y', atHardPity: false, legendaryIds: L, featured: ['x', 'y'], rng: () => 0 })
  assert.equal(r.id, 'a')
  assert.equal(r.newGuaranteed, false)
})

test('ตู้ธีม: ถึงการันตีแต่ไม่ได้เลือกเป้า = ถ่วง ×3', () => {
  const r = pickThemeLegendary({ target: null, atHardPity: true, legendaryIds: L, featured: ['x', 'y'], rng: () => 0.5 })
  assert.equal(r.id, 'x')
})


test('ตู้ธีม: ตัวที่เลือก ×6 · เรตคงที่ไม่ไต่ soft pity', () => {
  // a,b,c=1 · x(เป้า)=6 · y=3 ⇒ รวม 12 · rng 0.4 → 4.8 → ตก x (3..9)
  const r = pickThemeLegendary({ target: 'x', atHardPity: false, legendaryIds: L, featured: ['x', 'y'], rng: () => 0.4 })
  assert.equal(r.id, 'x')
  assert.equal(legendaryChance(45), GACHA_RATES.legendary)
})

// ── การันตีแบบ 7k: แถบ 0/100 ครึ่งที่ 50 (user เคาะ 1 ต.ค.) ──
const C7 = [{ id: 'a', rarity: 'legendary' }, { id: 'x', rarity: 'legendary' }, { id: 'c1', rarity: 'common' }, { id: 'e1', rarity: 'epic' }]
const st = (pity, target = 'x', guaranteed = false) => ({ pity, target, guaranteed, ownedLegendaryIds: [] })

test('7k: ครั้งที่ 50 ชนะ 50/50 → ได้เป้า รีเซ็ต', () => {
  const r = rollOne(st(49), C7, () => 0.1)
  assert.deepEqual([r.rarity, r.id, r.nextPity], ['legendary', 'x', 0])
})
test('7k: ครั้งที่ 50 แพ้ → ได้ตำนานตัวอื่น นับต่อ', () => {
  const r = rollOne(st(49), C7, () => 0.9)
  assert.deepEqual([r.rarity, r.id, r.won, r.nextPity], ['legendary', 'a', false, 50])
})
test('7k: ครั้งที่ 100 ได้เป้าแน่นอน', () => {
  const r = rollOne(st(99), C7, () => 0.99)
  assert.deepEqual([r.id, r.nextPity], ['x', 0])
})
test('ครึ่งแรก: ตำนานออกก่อน 50 แพ้ 50/50 → ตัวนับกระโดดไป 50', () => {
  const r = rollOne(st(11), C7, seq([0, 0.9, 0]))     // L · แพ้ · ได้ a
  assert.deepEqual([r.id, r.won, r.nextPity], ['a', false, HALF_PITY])
})
test('ครึ่งแรก: ตำนานออกก่อน 50 ชนะ 50/50 → ได้เป้า รีเซ็ต', () => {
  const r = rollOne(st(11), C7, seq([0, 0.1]))
  assert.deepEqual([r.id, r.won, r.nextPity], ['x', true, 0])
})
test('ครึ่งหลัง: ตำนานตัวถัดไป = ได้เป้าแน่นอน รีเซ็ต', () => {
  const r = rollOne(st(60), C7, seq([0, 0.99, 0]))
  assert.deepEqual([r.id, r.won, r.nextPity], ['x', true, 0])
})
test('7k: ไม่เลือกเป้า ครั้งที่ 50 ได้ตำนานสุ่ม รีเซ็ต', () => {
  const r = rollOne(st(49, null), C7, () => 0.99)
  assert.deepEqual([r.rarity, r.nextPity], ['legendary', 0])
})
test('7k: ธงแพ้ 50/50 ของระบบเก่า = เริ่มครึ่งหลัง', () => {
  const r = rollOne(st(3, 'x', true), C7, () => 0.99)
  assert.equal(r.nextPity, 51)
})
test('7k ตู้ธีม: ครั้งที่ 50 ลุ้นเป้าด้วย', () => {
  const r = rollOne(st(49), C7, () => 0.1, { theme: { featured: ['x'] } })
  assert.equal(r.id, 'x')
})
