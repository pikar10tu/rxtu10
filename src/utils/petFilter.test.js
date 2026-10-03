import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filterPets, sortPets, statOf, DEFAULT_FILTER } from './petFilter.js'
import { PETS } from '../data/index.js'

const pick = (pred) => PETS.find(pred)
const leg = pick(p => p.rarity === 'legendary')
const com = pick(p => p.rarity === 'common')
const fistPet = pick(p => p.element === 'fist')
const pets = [leg, com, fistPet].filter(Boolean).map((d, i) => ({ id: d.id, rarity: d.rarity, grade: i }))

test('ค่าเริ่ม = ไม่กรองอะไร', () => {
  assert.equal(filterPets(pets, DEFAULT_FILTER).length, pets.length)
})
test('กรองสายได้ และใช้คู่กับระดับได้', () => {
  const r = filterPets(pets, { ...DEFAULT_FILTER, el: 'fist' })
  assert.ok(r.length >= 1 && r.every(p => PETS.find(d => d.id === p.id).element === 'fist'))
  const both = filterPets(pets, { ...DEFAULT_FILTER, el: leg.element, rarity: 'legendary' })
  assert.ok(both.every(p => p.rarity === 'legendary'))
})
test('เฉพาะในทีม', () => {
  const r = filterPets(pets, { ...DEFAULT_FILTER, onlyTeam: true }, [com.id, null])
  assert.deepEqual(r.map(p => p.id), [com.id])
})
test('เรียงตาม ATK มากไปน้อย', () => {
  const r = sortPets(pets, 'atk').map(statOf)
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].atk >= r[i].atk)
})
test('เรียงตามระดับ: ตำนานมาก่อนธรรมดา', () => {
  const r = sortPets(pets, 'rarity')
  assert.ok(r.findIndex(p => p.id === leg.id) < r.findIndex(p => p.id === com.id))
})
test('ไม่แก้ array ต้นฉบับ', () => {
  const copy = pets.map(p => p.id).join()
  sortPets(pets, 'hp')
  assert.equal(pets.map(p => p.id).join(), copy)
})
