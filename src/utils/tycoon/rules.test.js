import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TILES, SIDES, TOURS, GROUP_TILES, GROUPS } from '../../data/tycoon/board.js'
import { rngNext, baseToll, propertyValue, takeoverPrice, sellPrice, maxHouses, canTakeover, netWorth, specialWin } from './rules.js'

test('กระดาน 32 ช่อง มุมถูกที่ + จำนวนช่องแต่ละแบบตามสเปค', () => {
  assert.equal(TILES.length, 32)
  assert.deepEqual([0, 8, 16, 24].map(i => TILES[i].type), ['start', 'jail', 'festival', 'travel'])
  const n = (t) => TILES.filter(x => x.type === t).length
  assert.deepEqual([n('city'), n('tour'), n('chance'), n('minigame'), n('tax')], [18, 4, 4, 1, 1])
  assert.equal(GROUPS.length, 9)
  for (const g of GROUP_TILES) assert.equal(g.length, 2)
  assert.equal(SIDES.length, 4); for (const s of SIDES) assert.equal(s.length, 7)
  assert.equal(TOURS.length, 4)
})

test('rng เล่นซ้ำได้ + อยู่ใน [0,1)', () => {
  let s = 42; const a = []
  for (let i = 0; i < 5; i++) { const r = rngNext(s); s = r.s; a.push(r.v) }
  let s2 = 42; const b = []
  for (let i = 0; i < 5; i++) { const r = rngNext(s2); s2 = r.s; b.push(r.v) }
  assert.deepEqual(a, b); for (const v of a) assert.ok(v >= 0 && v < 1)
})

test('ค่าผ่านทางโตตามระดับ · แลนด์มาร์คแพงสุด', () => {
  const tolls = [0, 1, 2, 3, 4].map(l => baseToll(3, l, {}))
  for (let i = 1; i < 5; i++) assert.ok(tolls[i] > tolls[i - 1])
})

test('ท่องเที่ยว: ค่าผ่านทางคูณจำนวนที่เจ้าของมี', () => {
  const tiles = { 5: { owner: 0, level: 0 }, 9: { owner: 0, level: 0 } }
  assert.equal(baseToll(5, 0, tiles), 120)
})

test('ซื้อต่อ = 2 เท่ามูลค่า · ขายคืนครึ่ง · แลนด์มาร์ค/ท่องเที่ยวห้ามซื้อต่อ', () => {
  const v = propertyValue(3, 2)
  assert.equal(takeoverPrice(3, 2), v * 2)
  assert.equal(sellPrice(3, 2), Math.floor(v / 2))
  assert.equal(canTakeover(3, 3), true)
  assert.equal(canTakeover(3, 4), false)
  assert.equal(canTakeover(5, 0), false)
})

test('เพดานบ้าน: รอบแรก 2 · ผ่านจุดเริ่มต้นแล้ว 3', () => {
  assert.equal(maxHouses(0), 2); assert.equal(maxHouses(1), 3); assert.equal(maxHouses(5), 3)
})

test('ทรัพย์สิน = เงินสด + มูลค่าที่ดิน', () => {
  assert.equal(netWorth({ cash: 100 }, 0, { 3: { owner: 0, level: 1 }, 6: { owner: 1, level: 0 } }), 100 + propertyValue(3, 1))
})

test('ชนะพิเศษ: แถว · สามสี · ท่องเที่ยว', () => {
  const own = (idxs) => Object.fromEntries(idxs.map(i => [i, { owner: 0, level: 0 }]))
  const side0 = SIDES[0].filter(i => ['city', 'tour'].includes(TILES[i].type))
  assert.equal(specialWin(0, own(side0)), 'line')
  assert.equal(specialWin(0, own([...GROUP_TILES[2], ...GROUP_TILES[5], ...GROUP_TILES[8]])), 'triple')
  assert.equal(specialWin(0, own(TOURS)), 'tour')
  assert.equal(specialWin(0, own(GROUP_TILES[0])), null)
  assert.equal(specialWin(1, own(TOURS)), null)
})

import { tileGrid } from '../../data/tycoon/board.js'
test('ตำแหน่งตาราง: มุมทั้ง 4 + ไม่มีช่องซ้อนกัน', () => {
  assert.deepEqual([0, 8, 16, 24].map(tileGrid), [{ row: 9, col: 9 }, { row: 9, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 9 }])
  const keys = new Set(TILES.map(t => { const g = tileGrid(t.idx); return g.row + ',' + g.col }))
  assert.equal(keys.size, 32)
})
