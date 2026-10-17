import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deal, tally, judgeGuess, allVoted } from './spyfallEngine.js'
import { LOCATIONS, DRUGS, DRUG_OPTIONS } from '../data/spyfall.js'

const roster = (n) => Array.from({ length: n }, (_, i) => 'u' + i)

test('แจกไพ่: สปาย 1 คน คนอื่นรู้คำเดียวกัน บทไม่ซ้ำ (≤ จำนวนบท)', () => {
  for (const mode of ['normal', 'drug']) for (let n = 3; n <= 8; n++) {
    const d = deal(roster(n), mode)
    const spies = Object.entries(d.secrets).filter(([, s]) => s.spy)
    assert.equal(spies.length, 1)
    assert.equal(spies[0][0], d.spyUid)
    const civ = Object.values(d.secrets).filter(s => !s.spy)
    assert.ok(civ.every(s => s.word === d.word))
    if (n - 1 <= 6) assert.equal(new Set(civ.map(s => s.role)).size, civ.length)
    assert.ok(d.options.includes(d.word))
    assert.ok(roster(n).includes(d.starterUid))
  }
})

test('โหมดปกติโชว์ทุกสถานที่ · โหมดยาโชว์ DRUG_OPTIONS ตัวไม่ซ้ำ', () => {
  assert.equal(deal(roster(4), 'normal').options.length, Object.keys(LOCATIONS).length)
  for (let k = 0; k < 50; k++) {
    const d = deal(roster(4), 'drug')
    assert.equal(d.options.length, DRUG_OPTIONS)
    assert.equal(new Set(d.options).size, DRUG_OPTIONS)
    assert.ok(d.options.every(o => o in DRUGS))
  }
})

test('นับโหวต: เกินครึ่ง + ถูกตัว = พลเมืองชนะ', () => {
  const v = ['a', 'b', 'c', 'd']
  assert.equal(tally({ a: 'd', b: 'd', c: 'd', d: 'a' }, v, 'd').winner, 'civ')
  assert.equal(tally({ a: 'c', b: 'c', c: 'a', d: 'c' }, v, 'd').reason, 'wrong')
  assert.equal(tally({ a: 'd', b: 'd', c: 'a', d: 'a' }, v, 'd').reason, 'split')   // 2/4 ไม่เกินครึ่ง
  assert.equal(tally({}, v, 'd').reason, 'split')
})

test('สปายเดาคำ', () => {
  assert.equal(judgeGuess('Warfarin', 'Warfarin').winner, 'spy')
  assert.equal(judgeGuess('Digoxin', 'Warfarin').winner, 'civ')
})

test('allVoted นับเฉพาะคนที่ยังอยู่', () => {
  assert.ok(allVoted({ a: 'b', b: 'a' }, ['a', 'b']))
  assert.ok(!allVoted({ a: 'b' }, ['a', 'b']))
  assert.ok(!allVoted({}, []))
})
