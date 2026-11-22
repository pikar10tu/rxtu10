import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newGame, step, legalActions } from './engine.js'
import { GAME } from '../../data/tycoon/board.js'
import { landPrice, houseCost, takeoverPrice, landmarkCost, baseToll } from './rules.js'

const two = () => newGame([{ uid: 'a', name: 'A' }, { uid: 'b', name: 'B' }], 7)
const go = (s, a) => { const r = step(s, a); assert.ok(!r.error, `illegal ${JSON.stringify(a)} in ${s.phase}/${s.pending?.kind}`); return r.state }
const roll = (s, a, b) => go(s, { type: 'roll', dice: [a, b] })

test('ตกที่ว่างรอบแรก: ซื้อที่ + บ้านได้สูงสุด 2 หลัง แล้วจบตา', () => {
  let s = roll(two(), 1, 2) // → 3 กรุงเทพฯ
  assert.equal(s.pending.kind, 'buy'); assert.equal(s.pending.max, 2)
  s = go(s, { type: 'buy', houses: 2 })
  assert.deepEqual(s.tiles[3], { owner: 0, level: 2 })
  assert.equal(s.players[0].cash, GAME.startCash - landPrice(3) - 2 * houseCost(3))
  assert.equal(s.turn, 1)
})

test('ผ่านจุดเริ่มต้นได้เงินเดือน และเพดานบ้านเป็น 3', () => {
  let s = two(); s.players[0].pos = 30
  s = roll(s, 1, 2) // 30 → 1 ผ่าน 0
  assert.equal(s.players[0].laps, 1)
  assert.equal(s.pending.kind, 'buy'); assert.equal(s.pending.max, 3)
  assert.equal(s.players[0].cash, GAME.startCash + GAME.salary)
})

test('เลขคู่ได้ทอยต่อ · คู่ 3 ครั้งติดเข้าห้องขัง', () => {
  let s = roll(two(), 2, 2) // → 4 การ์ด
  while (s.phase === 'decide') s = go(s, legalActions(s).at(-1))
  assert.equal(s.turn, 0)
  s = two(); s.players[0].doubles = 2
  s = roll(s, 3, 3)
  assert.equal(s.players[0].pos, 8); assert.equal(s.players[0].jail, GAME.jailTurns); assert.equal(s.turn, 1)
})

test('ห้องขัง: ทอยไม่คู่ติดต่อ · ทอยคู่ออกเดิน · จ่ายประกันออกได้', () => {
  let s = two(); s.players[0].pos = 8; s.players[0].jail = 2
  s = roll(s, 1, 2); assert.equal(s.players[0].jail, 1); assert.equal(s.players[0].pos, 8)
  s = two(); s.players[0].pos = 8; s.players[0].jail = 2
  s = roll(s, 1, 1); assert.equal(s.players[0].jail, 0); assert.equal(s.players[0].pos, 10)
  s = two(); s.players[0].pos = 8; s.players[0].jail = 2
  s = go(s, { type: 'payBail' }); assert.equal(s.players[0].jail, 0); assert.equal(s.players[0].cash, GAME.startCash - GAME.bail)
})

test('ค่าผ่านทาง + ซื้อต่อ ×2 หลังจ่าย · เทศกาล ×2', () => {
  let s = two(); s.tiles[3] = { owner: 1, level: 1 }; s.festival = 3
  s = roll(s, 1, 2)
  const toll = baseToll(3, 1, s.tiles) * 2
  assert.equal(s.players[1].cash, GAME.startCash + toll)
  assert.equal(s.pending.kind, 'takeover'); assert.equal(s.pending.price, takeoverPrice(3, 1))
  s = go(s, { type: 'takeover' })
  assert.equal(s.tiles[3].owner, 0)
  assert.equal(s.players[1].cash, GAME.startCash + toll + takeoverPrice(3, 1))
})

test('แลนด์มาร์คและท่องเที่ยวซื้อต่อไม่ได้', () => {
  let s = two(); s.tiles[3] = { owner: 1, level: 4 }
  s = roll(s, 1, 2); assert.notEqual(s.pending?.kind, 'takeover')
  s = two(); s.tiles[5] = { owner: 1, level: 0 }
  s = roll(s, 2, 3); assert.notEqual(s.pending?.kind, 'takeover')
})

test('ท่องเที่ยวซื้อได้อย่างเดียว ไม่มีบ้าน', () => {
  const s = roll(two(), 2, 3)
  assert.equal(s.pending.kind, 'buy'); assert.equal(s.pending.max, 0)
})

test('ตกเมืองตัวเองครบ 3 หลัง → อัปแลนด์มาร์ค', () => {
  let s = two(); s.tiles[3] = { owner: 0, level: 3 }
  s = roll(s, 1, 2)
  assert.equal(s.pending.kind, 'landmark')
  s = go(s, { type: 'landmark' })
  assert.equal(s.tiles[3].level, 4)
  assert.equal(s.players[0].cash, GAME.startCash - landmarkCost(3))
})

test('ตกจุดเริ่มต้น → เลือกเมืองตัวเองไปสร้าง', () => {
  let s = two(); s.players[0].pos = 29; s.players[0].laps = 1; s.tiles[3] = { owner: 0, level: 1 }
  s = roll(s, 1, 2) // 29 → 0
  assert.equal(s.pending.kind, 'startPick')
  s = go(s, { type: 'pickTile', idx: 3 })
  assert.equal(s.pending.kind, 'build'); assert.equal(s.pending.max, 2)
})

test('จ่ายไม่ไหว → ต้องขาย · ขายหมดยังไม่พอ = ล้มละลาย เหลือคนเดียวชนะ', () => {
  let s = two(); s.players[0].cash = 10; s.tiles[3] = { owner: 1, level: 4 }; s.tiles[6] = { owner: 0, level: 0 }
  s = roll(s, 1, 2)
  assert.equal(s.pending.kind, 'sell')
  s = go(s, { type: 'sell', idx: 6 })
  assert.equal(s.players[0].out, true)
  assert.equal(s.phase, 'over'); assert.deepEqual(s.winner, { seat: 1, reason: 'bankrupt' })
})

test('ครบรอบสุดท้าย → คนทรัพย์สินมากสุดชนะ', () => {
  let s = newGame([{ uid: 'a', name: 'A' }, { uid: 'b', name: 'B' }], 3, { maxRounds: 1 })
  s.players[1].cash = 99999
  s = roll(s, 3, 4) // 7 ไทเป
  while (s.phase === 'decide') s = go(s, { type: 'skip' })
  s = roll(s, 3, 4)
  while (s.phase === 'decide') s = go(s, { type: 'skip' })
  assert.equal(s.phase, 'over'); assert.deepEqual(s.winner, { seat: 1, reason: 'rounds' })
})

test('ชนะพิเศษ: ซื้อเมืองท่องเที่ยวใบที่ 4 แล้วชนะทันที', () => {
  let s = two(); for (const i of [9, 18, 25]) s.tiles[i] = { owner: 0, level: 0 }
  s = roll(s, 2, 3)
  s = go(s, { type: 'buy', houses: 0 })
  assert.deepEqual(s.winner, { seat: 0, reason: 'tour' })
})

test('นางฟ้าคุ้มครองใช้ให้อัตโนมัติ · คูปองลดครึ่ง', () => {
  let s = two(); s.tiles[3] = { owner: 1, level: 2 }; s.players[0].cards = ['angel']
  s = roll(s, 1, 2)
  assert.equal(s.players[1].cash, GAME.startCash); assert.deepEqual(s.players[0].cards, [])
  s = two(); s.tiles[3] = { owner: 1, level: 2 }; s.players[0].cards = ['coupon']
  s = roll(s, 1, 2)
  assert.equal(s.players[1].cash, GAME.startCash + Math.round(baseToll(3, 2, s.tiles) / 2))
})

test('เที่ยวรอบโลก: จ่ายค่าบิน ตาหน้าเลือกช่องไปเอง', () => {
  let s = two(); s.players[0].pos = 20
  s = roll(s, 2, 2) // 24 แต่เลขคู่ได้ทอยต่อ → ใช้ 1,3
  s = two(); s.players[0].pos = 21
  s = roll(s, 1, 2)
  assert.equal(s.players[0].travel, true); assert.equal(s.players[0].cash, GAME.startCash - GAME.travelFee)
  s = roll(s, 1, 2) // ผู้เล่น B
  while (s.phase === 'decide' && s.turn === 1) s = go(s, { type: 'skip' })
  assert.equal(s.pending.kind, 'travelPick')
  s = go(s, { type: 'pickTile', idx: 31 })
  assert.equal(s.players[0].pos, 31)
})

test('การกระทำผิดกติกาถูกปฏิเสธ state ไม่เปลี่ยน', () => {
  const s = two()
  const r = step(s, { type: 'buy', houses: 3 })
  assert.equal(r.error, 'illegal'); assert.equal(r.state, s)
})
