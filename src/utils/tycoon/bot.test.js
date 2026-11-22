import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newGame, step, legalActions } from './engine.js'
import { botAction } from './bot.js'
import { rngNext } from './rules.js'

function simulate(seed, n) {
  let s = newGame(Array.from({ length: n }, (_, i) => ({ uid: 'b' + i, name: 'บอท' + i, bot: true })), seed)
  let r = seed * 7 + 1, steps = 0
  while (s.phase !== 'over' && steps < 5000) {
    const x = rngNext(r); r = x.s
    const a = botAction(s, x.v)
    const res = step(s, a)
    if (res.error) throw new Error(`บอทเล่นผิดกติกา ${JSON.stringify(a)} @ ${s.phase}/${s.pending?.kind} legal=${JSON.stringify(legalActions(s))}`)
    s = res.state; steps++
    for (const p of s.players) if (p.cash < 0) throw new Error('เงินติดลบ ' + JSON.stringify(p))
  }
  return { s, steps }
}

test('บอทล้วน 200 เกม (2–4 คน): จบทุกเกม ไม่เล่นผิดกติกา เงินไม่ติดลบ', () => {
  const reasons = {}
  let maxSteps = 0
  for (let seed = 1; seed <= 200; seed++) {
    const { s, steps } = simulate(seed, 2 + (seed % 3))
    assert.equal(s.phase, 'over', `seed ${seed} ไม่จบ`)
    reasons[s.winner.reason] = (reasons[s.winner.reason] || 0) + 1
    maxSteps = Math.max(maxSteps, steps)
  }
  console.log('สาเหตุชนะ', reasons, 'steps สูงสุด', maxSteps)
})

test('บอทคืน action ที่อยู่ในลิสต์กติกาเสมอ', () => {
  const s = newGame([{ uid: 'a', name: 'A', bot: true }, { uid: 'b', name: 'B', bot: true }], 9)
  const a = botAction(s, 0.3)
  assert.ok(legalActions(s).some(x => x.type === a.type))
})
