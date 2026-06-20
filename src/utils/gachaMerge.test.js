import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeRolls } from './gachaMerge.js'

const CAT = [
  { id: 'cat', name: 'แมว', emoji: '🐱', rarity: 'common', element: 'scissors' },
  { id: 'wolf', name: 'หมาป่า', emoji: '🐺', rarity: 'rare', element: 'fist' },
  { id: 'bahamut', name: 'บาฮามุท', emoji: '🐉', rarity: 'legendary', element: 'fist' },
]

test('ตัวใหม่ = unlock (copies 0, isNew true)', () => {
  const { pets, summary } = mergeRolls([], [{ rarity: 'common', id: 'cat' }], CAT)
  assert.equal(pets.length, 1)
  assert.equal(pets[0].id, 'cat')
  assert.equal(pets[0].copies, 0)
  assert.equal(pets[0].grade, 0)
  assert.equal(summary[0].isNew, true)
})

test('ตัวที่มีอยู่แล้ว = +1 copy, isNew false', () => {
  const { pets, summary } = mergeRolls([{ id: 'cat', rarity: 'common', copies: 2, grade: 1 }], [{ rarity: 'common', id: 'cat' }], CAT)
  assert.equal(pets[0].copies, 3)
  assert.equal(pets[0].grade, 1) // grade ไม่เปลี่ยน
  assert.equal(summary[0].isNew, false)
})

test('ได้ตัวเดียวกัน 3 ครั้งในชุด → unlock + 2 copies', () => {
  const r = [{ rarity: 'common', id: 'cat' }, { rarity: 'common', id: 'cat' }, { rarity: 'common', id: 'cat' }]
  const { pets, summary } = mergeRolls([], r, CAT)
  assert.equal(pets.length, 1)
  assert.equal(pets[0].copies, 2)
  assert.equal(summary.filter((s) => s.isNew).length, 1)
})

test('summary เรียง rarity สูง→ต่ำ', () => {
  const r = [{ rarity: 'common', id: 'cat' }, { rarity: 'legendary', id: 'bahamut' }, { rarity: 'rare', id: 'wolf' }]
  const { summary } = mergeRolls([], r, CAT)
  assert.deepEqual(summary.map((s) => s.rarity), ['legendary', 'rare', 'common'])
})
