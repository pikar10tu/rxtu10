import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeBattleStats } from './battleStats.js'

const team = [{ id: 'wolf' }, { id: 'fox' }]
const log = [
  { t: 'round', n: 1 },
  { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 10, dead: false },
  { t: 'attack', side: 'B', attacker: 'B0', target: 'A1', dmg: 7,  dead: false },
  { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 12, dead: true },
  { t: 'attack', side: 'B', attacker: 'B1', target: 'A1', dmg: 99, dead: true },
  { t: 'end', winner: 'A' },
]

test('รวม dmgDealt/dmgTaken/kills/deaths/battles/wins ต่อ petId ฝั่งผู้เล่น', () => {
  const s = computeBattleStats(log, team, true)
  assert.deepEqual(s.wolf, { battles: 1, wins: 1, kills: 0, deaths: 0, dmgDealt: 10, dmgTaken: 0 })
  assert.deepEqual(s.fox,  { battles: 1, wins: 1, kills: 1, deaths: 1, dmgDealt: 12, dmgTaken: 106 })
})

test('won=false → wins 0', () => {
  const s = computeBattleStats(log, team, false)
  assert.equal(s.wolf.wins, 0)
})

test('ทีมซ้ำ species → รวมยอด (กัน index ชนกัน)', () => {
  const s = computeBattleStats(
    [{ t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 5, dead: false },
     { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 5, dead: false }],
    [{ id: 'cat' }, { id: 'cat' }], true)
  assert.equal(s.cat.dmgDealt, 10)
  assert.equal(s.cat.battles, 2) // ลงสนาม 2 ช่อง
})
