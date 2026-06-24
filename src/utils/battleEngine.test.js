import { test } from 'node:test'
import assert from 'node:assert/strict'
import { simulateBattle } from './battleEngine.js'

const mono = (rarity, element, grade, n = 4) =>
  Array.from({ length: n }, (_, i) => ({ id: `${element}${i}`, rarity, element, grade }))

test('deterministic: seed เดิม → ผลเหมือนเป๊ะ', () => {
  const a = mono('rare', 'fist', 3), b = mono('rare', 'scissors', 3)
  const r1 = simulateBattle(a, b, 12345)
  const r2 = simulateBattle(a, b, 12345)
  assert.deepEqual(r1, r2)
})

test('log จบด้วย end event ที่ winner ตรงกับผล', () => {
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const end = r.log[r.log.length - 1]
  assert.equal(end.t, 'end')
  assert.equal(end.winner, r.winner)
  assert.ok(r.rounds >= 1)
})

test('ธาตุได้เปรียบชนะเกินครึ่ง (fist vs scissors, เกรดเท่ากัน)', () => {
  let wins = 0, N = 300
  for (let s = 1; s <= N; s++)
    if (simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), s * 99991).winner === 'A') wins++
  assert.ok(wins / N > 0.6, `winrate ${wins / N}`)
})

test('เกรดสูงกว่าชนะเกินครึ่ง (ธาตุเดียวกัน)', () => {
  let wins = 0, N = 300
  for (let s = 1; s <= N; s++)
    if (simulateBattle(mono('rare', 'scissors', 5), mono('rare', 'scissors', 2), s * 1237).winner === 'A') wins++
  assert.ok(wins / N > 0.6, `winrate ${wins / N}`)
})

test('ทีมว่างฝั่งหนึ่ง → อีกฝั่งชนะ', () => {
  assert.equal(simulateBattle(mono('common', 'fist', 0), [], 1).winner, 'A')
  assert.equal(simulateBattle([], mono('common', 'fist', 0), 1).winner, 'B')
})

test('attack event มี eff ตรงกับ matchup ธาตุ', () => {
  // fist ชนะ scissors → ผู้ตีฝั่ง A (fist) ควรมี eff:'super', ฝั่ง B (scissors→fist) eff:'weak'
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const atkA = r.log.filter(e => e.t === 'attack' && e.side === 'A')
  const atkB = r.log.filter(e => e.t === 'attack' && e.side === 'B')
  assert.ok(atkA.length && atkA.every(e => e.eff === 'super'), 'A (fist) ตี scissors = super ทุกครั้ง')
  assert.ok(atkB.length && atkB.every(e => e.eff === 'weak'), 'B (scissors) ตี fist = weak ทุกครั้ง')
  assert.ok(['super', 'weak', 'neutral'].includes(atkA[0].eff))
})

test('log มี round marker ต้นแต่ละรอบ ตามจำนวน rounds', () => {
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const rounds = r.log.filter(e => e.t === 'round')
  assert.equal(rounds.length, r.rounds)
  assert.equal(rounds[0].n, 1)
})
