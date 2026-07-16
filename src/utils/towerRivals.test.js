// รัน: node --test src/utils/towerRivals.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { towerRanking } from './towerRivals.js'

const me = { uid: 'me', nickname: 'ฉัน', towerBest: 12 }

test('จัดอันดับ desc + top 3 + isMe + อันดับ/รวม', () => {
  const others = [
    { uid: 'a', nickname: 'เอ', towerBest: 30 },
    { uid: 'b', nickname: 'บี', towerBest: 20 },
    { uid: 'c', nickname: 'ซี', towerBest: 5 },
  ]
  const r = towerRanking(others, me)
  assert.equal(r.total, 4)
  assert.equal(r.myRank, 3)                          // 30,20,[12],5
  assert.deepEqual(r.top.map(t => t.nickname), ['เอ', 'บี', 'ฉัน'])
  assert.equal(r.top[2].isMe, true)
  assert.equal(r.top[2].floor, 12)
})

test('chase = คนอันดับเหนือเราติดกัน + ระยะห่าง', () => {
  const others = [{ uid: 'a', nickname: 'เอ', towerBest: 15 }, { uid: 'b', nickname: 'บี', towerBest: 40 }]
  const r = towerRanking(others, me)   // 40(บี), 15(เอ), 12(ฉัน)
  assert.equal(r.myRank, 3)
  assert.equal(r.chaseName, 'เอ')
  assert.equal(r.chaseGap, 3)          // 15 - 12
})

test('me เป็นที่ 1 → ไม่มี chase', () => {
  const r = towerRanking([{ uid: 'a', nickname: 'เอ', towerBest: 4 }], me)
  assert.equal(r.myRank, 1)
  assert.equal(r.chaseName, null)
  assert.equal(r.chaseGap, 0)
})

test('me ใช้ค่าสด ทับ others ที่ uid ซ้ำ', () => {
  const others = [{ uid: 'me', nickname: 'ฉันเก่า', towerBest: 1 }, { uid: 'a', nickname: 'เอ', towerBest: 8 }]
  const r = towerRanking(others, me)   // me=12 (สด) > เอ=8
  assert.equal(r.total, 2)
  assert.equal(r.myRank, 1)
  assert.equal(r.top[0].nickname, 'ฉัน')
})

test('คนที่ยังไม่ไต่ (best<1) ไม่ถูกนับ', () => {
  const others = [{ uid: 'a', nickname: 'เอ', towerBest: 0 }, { uid: 'b', nickname: 'บี', towerBest: 3 }]
  const r = towerRanking(others, me)
  assert.equal(r.total, 2)             // me(12) + บี(3) — เอ ไม่นับ
})
