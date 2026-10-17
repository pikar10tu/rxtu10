import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeTowerHall } from './towerHall.js'

test('เก็บเฉพาะเกิน 100 · เรียงชั้น · เสมอ = ซีซั่นก่อนอยู่บน', () => {
  const h = mergeTowerHall(null, [
    { uid: 'a', nickname: 'เอ', towerBest: 100 }, { uid: 'b', nickname: 'บี', towerBest: 130 }, { uid: 'c', nickname: 'ซี', towerBest: 112 },
  ], '2026-10')
  assert.deepEqual(h.map(e => e.uid), ['b', 'c'])
  const h2 = mergeTowerHall(h, [{ uid: 'd', nickname: 'ดี', towerBest: 130 }], '2026-11')
  assert.deepEqual(h2.map(e => e.uid), ['b', 'd', 'c'])
})

test('สถิติดีสุดของแต่ละคน ไม่ถูกทับด้วยซีซั่นที่แย่กว่า · ดีกว่า = อัปเดตซีซั่น', () => {
  const h = mergeTowerHall(null, [{ uid: 'b', nickname: 'บี', towerBest: 130 }], '2026-10')
  assert.deepEqual(mergeTowerHall(h, [{ uid: 'b', nickname: 'บี', towerBest: 0 }], '2026-11'), h)
  assert.deepEqual(mergeTowerHall(h, [{ uid: 'b', nickname: 'บี', towerBest: 141 }], '2026-11')[0], { uid: 'b', name: 'บี', floor: 141, season: '2026-11' })
})
