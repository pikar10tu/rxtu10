import test from 'node:test'
import assert from 'node:assert/strict'
import { judge, deriveMatch, isDecider, scoreText, resultText, ringRanking, randomHand, HANDS } from './ringMatch.js'

test('judge: ค้อนชนะกรรไกร กรรไกรชนะกระดาษ กระดาษชนะค้อน', () => {
  assert.equal(judge('rock', 'scissors'), 'r')
  assert.equal(judge('scissors', 'rock'), 'b')
  assert.equal(judge('paper', 'rock'), 'r')
  assert.equal(judge('paper', 'paper'), 'tie')
  assert.equal(judge('x', 'rock'), null)
})

test('Bo3: ชนะ 2 ยกก่อนชนะ · เสมอไม่นับ', () => {
  const m = deriveMatch({ r: { 0: 'rock', 1: 'rock', 2: 'paper' }, b: { 0: 'rock', 1: 'scissors', 2: 'rock' } })
  assert.deepEqual(m.score, { r: 2, b: 0 })
  assert.equal(m.winner, 'r')
  assert.equal(m.throws[0].res, 'tie')
})

test('รอออกมือ: ฝั่งเดียวออก = ยังไม่ตัดสิน next ชี้ยกที่รอ', () => {
  const m = deriveMatch({ r: { 0: 'rock', 1: 'paper' }, b: { 0: 'scissors' } })
  assert.deepEqual(m.score, { r: 1, b: 0 })
  assert.equal(m.next, 1)
  assert.equal(m.winner, null)
})

test('ชนะแล้วไม่นับมือที่ออกเกินมา', () => {
  const m = deriveMatch({ r: { 0: 'rock', 1: 'rock', 2: 'rock' }, b: { 0: 'scissors', 1: 'scissors', 2: 'paper' } })
  assert.equal(m.winner, 'r'); assert.equal(m.throws.length, 2)
})

test('ยกตัดสิน + ข้อความผล', () => {
  assert.equal(isDecider({ r: 1, b: 1 }), true)
  assert.equal(scoreText({ r: 1, b: 2 }, 'b'), '2–1')
  assert.equal(resultText({ wName: 'ภูมิ', lName: 'มายด์', score: { r: 2, b: 1 }, winner: 'r' }), '🥊 ภูมิ ชนะ มายด์ 2–1')
  assert.match(resultText({ wName: 'ภูมิ', lName: 'มายด์', forfeit: true }), /ออกจากเวที/)
})

test('อันดับชนะ + สุ่มมือ', () => {
  assert.deepEqual(ringRanking([{ w: 'ก' }, { w: 'ข' }, { w: 'ข' }]), [{ name: 'ข', wins: 2 }, { name: 'ก', wins: 1 }])
  assert.ok(HANDS.includes(randomHand()))
  assert.equal(randomHand(() => 0.999999), 'scissors')
})
