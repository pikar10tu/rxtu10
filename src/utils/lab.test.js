import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FUSION_COST, REDEEM_COIN, nextRarity, rarityCopyTotal,
  allocationTotal, applyCopySpend, fuseRoll, redeemValue,
} from './lab.js'

const seq = (vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)] }
const CAT = [
  { id: 'cat', rarity: 'common' }, { id: 'mouse', rarity: 'common' },
  { id: 'wolf', rarity: 'rare' }, { id: 'dragon', rarity: 'epic' },
  { id: 'bahamut', rarity: 'legendary' }, { id: 'whale', rarity: 'legendary' },
]

test('draft pins ตรงสเปก', () => {
  assert.deepEqual(FUSION_COST, { common: 15, rare: 12, epic: 10 })
  assert.deepEqual(REDEEM_COIN, { common: 50, rare: 200, epic: 800, legendary: 3000 })
})

test('nextRarity ไต่ระดับ, legendary → null', () => {
  assert.equal(nextRarity('common'), 'rare')
  assert.equal(nextRarity('rare'), 'epic')
  assert.equal(nextRarity('epic'), 'legendary')
  assert.equal(nextRarity('legendary'), null)
  assert.equal(nextRarity('???'), null)
})

test('rarityCopyTotal รวม copies เฉพาะ rarity นั้น', () => {
  const pets = [
    { id: 'cat', rarity: 'common', copies: 3 },
    { id: 'mouse', rarity: 'common', copies: 2 },
    { id: 'wolf', rarity: 'rare', copies: 5 },
  ]
  assert.equal(rarityCopyTotal(pets, 'common'), 5)
  assert.equal(rarityCopyTotal(pets, 'rare'), 5)
  assert.equal(rarityCopyTotal(pets, 'epic'), 0)
})

test('allocationTotal รวม n', () => {
  assert.equal(allocationTotal([{ id: 'cat', n: 3 }, { id: 'mouse', n: 2 }]), 5)
  assert.equal(allocationTotal([]), 0)
})

test('applyCopySpend หักถูก + ไม่ mutate ต้นฉบับ', () => {
  const pets = [{ id: 'cat', rarity: 'common', copies: 3 }, { id: 'mouse', rarity: 'common', copies: 2 }]
  const out = applyCopySpend(pets, [{ id: 'cat', n: 2 }, { id: 'mouse', n: 2 }])
  assert.equal(out.find(p => p.id === 'cat').copies, 1)
  assert.equal(out.find(p => p.id === 'mouse').copies, 0)
  assert.equal(pets[0].copies, 3) // ต้นฉบับไม่เปลี่ยน
})

test('applyCopySpend invalid → throw', () => {
  const pets = [{ id: 'cat', rarity: 'common', copies: 1 }]
  assert.throws(() => applyCopySpend(pets, [{ id: 'cat', n: 2 }]), /invalid copy spend/)   // n > copies
  assert.throws(() => applyCopySpend(pets, [{ id: 'ghost', n: 1 }]), /invalid copy spend/)  // ไม่มีตัว
  assert.throws(() => applyCopySpend(pets, [{ id: 'cat', n: 0 }]), /invalid copy spend/)     // n < 1
})

test('fuseRoll สุ่มในระดับถัดไป (uniform), legendary → null', () => {
  assert.equal(fuseRoll('epic', CAT, seq([0.0])), 'bahamut')  // epic→legendary, pool[0]
  assert.equal(fuseRoll('epic', CAT, seq([0.99])), 'whale')   // pool[last]
  assert.equal(fuseRoll('common', CAT, seq([0.0])), 'wolf')   // common→rare, pool[0]
  assert.equal(fuseRoll('legendary', CAT, seq([0.0])), null)  // หลอมต่อไม่ได้
})

test('fuseRoll pool ว่าง (ระดับถัดไปไม่มีตัวในแคตตาล็อก) → null ไม่ throw', () => {
  const catalogNoLegendary = [
    { id: 'cat', rarity: 'common' }, { id: 'mouse', rarity: 'common' },
    { id: 'wolf', rarity: 'rare' }, { id: 'dragon', rarity: 'epic' },
  ]
  assert.equal(fuseRoll('epic', catalogNoLegendary, () => 0), null)
})

test('redeemValue = Σn × rate', () => {
  assert.equal(redeemValue([{ id: 'bahamut', n: 2 }], 'legendary'), 6000) // 2 × 3000
  assert.equal(redeemValue([{ id: 'cat', n: 3 }], 'common'), 150)         // 3 × 50
})

import { LEGEND_SWAP_COST, legendSwapRoll } from './lab.js'
const LEG = [
  { id: 'a', rarity: 'legendary' }, { id: 'b', rarity: 'legendary' },
  { id: 'c', rarity: 'legendary' }, { id: 'd', rarity: 'legendary' }, { id: 'x', rarity: 'epic' },
]

test('หลอมตำนาน: ใช้ 3 ชิ้น', () => { assert.equal(LEGEND_SWAP_COST, 3) })

test('หลอมตำนาน: ไม่มีทางได้ตัวที่เอามาหลอม ไม่ว่าสุ่มได้ค่าไหน', () => {
  for (let r = 0; r < 1; r += 0.01) {
    const id = legendSwapRoll(LEG, ['a', 'c'], () => r)
    assert.ok(id === 'b' || id === 'd', `r=${r} ได้ ${id}`)
  }
})

test('หลอมตำนาน: จ่ายจากตัวเดียว = ตัดตัวเดียว · ไม่ออก epic', () => {
  const got = new Set()
  for (let r = 0; r < 1; r += 0.05) got.add(legendSwapRoll(LEG, ['a'], () => r))
  assert.deepEqual([...got].sort(), ['b', 'c', 'd'])
})

test('หลอมตำนาน: ตัดจนคลังว่าง = null', () => {
  assert.equal(legendSwapRoll(LEG, ['a', 'b', 'c', 'd']), null)
  assert.equal(legendSwapRoll([], []), null)
})
