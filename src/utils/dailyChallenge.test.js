// รัน: node --test src/utils/dailyChallenge.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dayKey, addDays, questionScore, rankRows, prizeFor, pendingClaimDay, pickDaily } from './dailyChallenge.js'

test('dayKey ตามเวลาไทย', () => {
  assert.equal(dayKey(Date.parse('2026-10-31T16:59:59Z')), '2026-10-31')
  assert.equal(dayKey(Date.parse('2026-10-31T17:00:00Z')), '2026-11-01')
  assert.equal(addDays('2026-11-01', -1), '2026-10-31')
})

test('questionScore 500–1000 ตามเวลา · ผิด 0', () => {
  assert.equal(questionScore(true, 0), 1000)
  assert.equal(questionScore(true, 30000), 500)
  assert.equal(questionScore(true, 99999), 500)
  assert.equal(questionScore(true, 15000), 750)
  assert.equal(questionScore(false, 100), 0)
})

test('rankRows: เสมอได้อันดับเดียวกัน แล้วข้าม', () => {
  const r = rankRows([
    { uid: 'a', score: 3000, ms: 50 }, { uid: 'b', score: 4000, ms: 90 },
    { uid: 'c', score: 3000, ms: 50 }, { uid: 'd', score: 3000, ms: 70 },
  ])
  assert.deepEqual(r.map(x => [x.uid, x.rank]), [['b', 1], ['a', 2], ['c', 2], ['d', 4]])
})

test('prizeFor', () => {
  assert.equal(prizeFor(1), 10000)
  assert.equal(prizeFor(10), 2000)
  assert.equal(prizeFor(11), 0)
  assert.equal(prizeFor(0), 0)
})

test('pendingClaimDay', () => {
  const t = '2026-11-05'
  assert.equal(pendingClaimDay({ last: '2026-11-04' }, t), '2026-11-04')
  assert.equal(pendingClaimDay({ last: '2026-11-05' }, t), null)
  assert.equal(pendingClaimDay({ last: '2026-11-04', claimed: '2026-11-04' }, t), null)
  assert.equal(pendingClaimDay({ last: '2026-10-20' }, t), null)
  assert.equal(pendingClaimDay(undefined, t), null)
})

test('pickDaily: ไม่ซ้ำ ตัดข้อไม่มีตัวเลือก ครบ n', () => {
  const q = (id, ch = ['a', 'b']) => ({ id, question: 'Q' + id, choices: ch, answer: 0 })
  const out = pickDaily([q(1), q(2, ['a'])], [q(1), q(3), q(4), q(5), q(6), q(7)], 5)
  assert.deepEqual(out.map(x => x.id), [1, 3, 4, 5, 6])
})
