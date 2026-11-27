import test from 'node:test'
import assert from 'node:assert/strict'
import { simulate, powerOf, arrowAt, launch, step, STEP } from './ringKnock.js'
import { RING, CORNER } from './ringMatch.js'

const K = (s, seed) => ({ s, hold: 1200, spd: 0.9, zone: 0.14, seed })

test('แรง: ไม่กด = ล้มเฉยๆ · โซนแดง > .9 · ปกติไม่ถึงโซนแดง', () => {
  assert.equal(powerOf(null), -1)
  assert.equal(powerOf({ s: -1, seed: 1 }), -1)
  assert.ok(powerOf(K(0.9, 1)) > 0.9)
  assert.ok(powerOf(K(0.5, 1)) < 0.5)
  assert.equal(arrowAt(0.25), 0.25); assert.equal(arrowAt(1.5), 0.5)
})

test('seed เดียวกัน = กระเด็นทางเดียวกันเป๊ะ (รีเพลย์ตรงของจริง)', () => {
  for (const seed of [1, 7, 42, 999, 123456]) {
    const a = simulate(K(0.97, seed), ...CORNER.b, 1), b = simulate(K(0.97, seed), ...CORNER.b, 1)
    assert.deepEqual(a, b)
  }
})

test('บินชนขอบจอ: เด้ง 2–5 ที เด้งรวมไม่นาน แล้วลงพื้นนอกเวทีเสมอ', () => {
  for (let seed = 1; seed <= 300; seed++) {
    for (const [side, dir] of [['b', 1], ['r', -1]]) {
      const b = launch(K(0.95 + (seed % 5) / 100, seed), ...CORNER[side], dir)
      let t = 0, first = null
      while (!b.done && t < 6) { step(b); t += STEP; if (b.hits && first == null) first = t }
      assert.ok(b.done, `seed ${seed} ไม่จบ`)
      assert.ok(b.hits >= 1 && b.hits <= 5, `seed ${seed} เด้ง ${b.hits}`)
      assert.ok(!(b.x > RING.x0 - 4 && b.x < RING.x1 + 4), `seed ${seed} ตกในเวที x=${b.x}`)
      assert.ok(b.x >= 6 && b.x <= 154 && b.y > 90, `seed ${seed} จุดตก ${b.x},${b.y}`)
      assert.ok(t - first < 1.05, `seed ${seed} เด้งนาน ${(t - first).toFixed(2)} วิ`)
    }
  }
})

test('แรงปกติจบในเวลาสั้น', () => {
  for (const s of [0.1, 0.4, 0.8]) { const r = simulate(K(s, 3), ...CORNER.b, 1); assert.ok(r.t < 4) }
})
