// เทส petMigration — รวม instance ซ้ำ→copies, scale grade, refund ตัวตัด/nerf, activePets instId→id
// รัน: node --test src/utils/petMigration.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { migratePets } from './petMigration.js'

// catalog จำลอง: cat(common scissors), panda(epic paper), butterfly(common paper)
const DEFS = {
  cat:       { id:'cat', emoji:'🐱', name:'แมว', rarity:'common', element:'scissors' },
  panda:     { id:'panda', emoji:'🐼', name:'แพนด้า', rarity:'epic', element:'paper' },
  butterfly: { id:'butterfly', emoji:'🦋', name:'ผีเสื้อ', rarity:'common', element:'paper' },
}
const ids = new Set(Object.keys(DEFS))
const defOf = (id) => DEFS[id] || null

test('merge instance ซ้ำ → 1 entry, grade=max(scaled), copies=ตัวเกิน', () => {
  const old = [
    { id:'cat', grade:12, rarity:'common', instId:'a' },  // XII → V(5)
    { id:'cat', grade:0,  rarity:'common', instId:'b' },
    { id:'cat', grade:0,  rarity:'common', instId:'c' },
  ]
  const r = migratePets(old, [], ids, defOf)
  const cat = r.pets.find(p => p.id === 'cat')
  assert.equal(cat.grade, 5)        // round(12*5/12)=5
  assert.equal(cat.copies, 2)       // 2 ตัวเกิน
  assert.equal(cat.emoji, '🐱')     // refresh จาก catalog
})

test('ตัดตัวที่ไม่อยู่ใน catalog → refund (rarity เดิม × (1+เกรด×0.1))', () => {
  const old = [{ id:'frog', grade:0, rarity:'common', instId:'x' }]   // ไม่อยู่ใน catalog
  const r = migratePets(old, [], ids, defOf)
  assert.equal(r.pets.length, 0)
  assert.equal(r.refundCoins, 500)  // common 500 × 1.0
})

test('rarity nerf (butterfly rare→common) → คืนส่วนต่าง', () => {
  const old = [{ id:'butterfly', grade:0, rarity:'rare', instId:'x' }]  // เดิม rare, catalog common
  const r = migratePets(old, [], ids, defOf)
  assert.equal(r.refundCoins, 2500 - 500)  // rare - common
  assert.equal(r.pets.find(p => p.id === 'butterfly').rarity, 'common') // refresh
})

test('rarity buff (panda → epic) → ไม่คิดเงิน', () => {
  const old = [{ id:'panda', grade:0, rarity:'rare', instId:'x' }]  // เดิม rare, catalog epic
  const r = migratePets(old, [], ids, defOf)
  assert.equal(r.refundCoins, 0)
  assert.equal(r.pets.find(p => p.id === 'panda').rarity, 'epic')
})

test('activePets instId → species id, ตัด id ที่ถูก cut', () => {
  const old = [{ id:'cat', grade:0, rarity:'common', instId:'a' }, { id:'frog', grade:0, rarity:'common', instId:'x' }]
  const r = migratePets(old, ['a', 'x'], ids, defOf)
  assert.deepEqual(r.activePets, ['cat'])  // a→cat, x(frog ถูกตัด)→หาย
})

test('instance ที่มี copies เดิมอยู่แล้ว → รวมกับตัวเกินใหม่', () => {
  const old = [
    { id:'cat', grade:0, rarity:'common', instId:'a', copies:3 },
    { id:'cat', grade:0, rarity:'common', instId:'b' },
  ]
  const r = migratePets(old, [], ids, defOf)
  const cat = r.pets.find(p => p.id === 'cat')
  assert.equal(cat.copies, 4)  // 3 เดิม + 1 ตัวเกินจาก instance ที่สอง
})
