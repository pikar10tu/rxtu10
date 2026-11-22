import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeSnapshot, compareSnapshot, SUSPECT_PER_DAY } from './coinWatch.js'

const DAY = 86_400_000

test('makeSnapshot เก็บเฉพาะคนที่มี uid + coins เป็นตัวเลข', () => {
  const s = makeSnapshot([{ uid: 'a', coins: 10 }, { uid: 'b' }, { coins: 5 }], 123)
  assert.deepEqual(s, { at: 123, coins: { a: 10 } })
})

test('compareSnapshot เรียงจากได้มากสุด + ติดสีตามต่อวัน', () => {
  const snap = { at: 0, coins: { a: 1000, b: 1000, c: 1000 } }
  const now = 2 * DAY
  const { rows, days } = compareSnapshot([
    { uid: 'a', nickname: 'A', coins: 1000 + 2 * SUSPECT_PER_DAY },
    { uid: 'b', nickname: 'B', coins: 1000 + 2_500_000 },
    { uid: 'c', nickname: 'C', coins: 500 },
  ], snap, now)
  assert.equal(days, 2)
  assert.deepEqual(rows.map(r => r.uid), ['a', 'b', 'c'])
  assert.deepEqual(rows.map(r => r.level), ['red', 'yellow', 'ok'])
  assert.equal(rows[2].gain, -500)
})

test('คนสมัครใหม่ (ไม่มีในจุดเทียบ) ถูกข้าม', () => {
  const { rows } = compareSnapshot([{ uid: 'new', coins: 9e6 }], { at: 0, coins: {} }, DAY)
  assert.equal(rows.length, 0)
})

test('เพิ่งบันทึกจุดเทียบ → หารขั้นต่ำครึ่งวัน ไม่แดงทั้งรุ่น', () => {
  const { rows, days } = compareSnapshot([{ uid: 'a', coins: 200_000 }], { at: 0, coins: { a: 0 } }, 60_000)
  assert.equal(days, 0.5)
  assert.equal(rows[0].level, 'ok')
})

test('ไม่มีจุดเทียบ → ว่าง', () => {
  assert.deepEqual(compareSnapshot([{ uid: 'a', coins: 1 }], null), { rows: [], days: 0 })
})
