// เทส seasonRewards — pure · รัน: node --test src/utils/seasonRewards.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeSeasonRewards, seasonRewardMails } from './seasonRewards.js'

const S = '2026-09'
const tw = (uid, towerBest) => ({ uid, towerBest })

test('หอคอย: ไม่เคยไต่ = ไม่ได้อะไร · ไต่แล้วได้ 10k · ถึงชั้น 50 ได้ตั๋ว 50', () => {
  const r = computeSeasonRewards([tw('a', 0), tw('b', 3), tw('c', 50)], S, {
    tower: { topN: 0, topCoins: 50000, ticketFloor: 50, tickets: 50, joinCoins: 10000, ach: 'x' },
    arena: { topN: 3, joinCoins: 1 },
  })
  assert.equal(r.find(x => x.uid === 'a'), undefined)
  assert.equal(r.find(x => x.uid === 'b').tower.tickets, 0)
  assert.equal(r.find(x => x.uid === 'b').tower.coins, 10000)
  assert.equal(r.find(x => x.uid === 'c').tower.tickets, 50)
})

test('หอคอย: ท็อป 10 ชั้นเท่ากันที่เส้นตัดได้ทุกคน + 50k ซ้อนกับ 10k', () => {
  const users = [...Array(12)].map((_, i) => tw('u' + i, i < 9 ? 100 - i : 40)) // คนที่ 10–12 ชั้น 40 เท่ากัน
  users.push(tw('low', 5))
  const r = computeSeasonRewards(users, S)
  const tops = r.filter(x => x.tower.top).map(x => x.uid)
  assert.equal(tops.length, 12)
  assert.ok(!tops.includes('low'))
  assert.equal(r.find(x => x.uid === 'u0').tower.coins, 60000)
  assert.equal(r.find(x => x.uid === 'low').tower.coins, 10000)
})

test('อารีน่า: ใช้ผลจาก last ถ้าเจ้าตัวบุกเดือนใหม่แล้ว · ไม่เคยบุก/คนละซีซั่น = ไม่ได้', () => {
  const users = [
    { uid: 'now', pvp: { seasonId: S, rating: 1200, wins: 2, losses: 1 } },
    { uid: 'moved', pvp: { seasonId: '2026-10', rating: 1050, wins: 1, losses: 0, last: { seasonId: S, rating: 1300, wins: 5, losses: 0 } } },
    { uid: 'idle', pvp: { seasonId: S, rating: 1000, wins: 0, losses: 0 } },
    { uid: 'old', pvp: { seasonId: '2026-08', rating: 1500, wins: 9, losses: 0 } },
  ]
  const r = computeSeasonRewards(users, S)
  assert.deepEqual(r.map(x => x.uid).sort(), ['moved', 'now'])
  assert.equal(r.find(x => x.uid === 'moved').arena.rating, 1300)
  assert.ok(r.every(x => x.arena.top))   // มีแค่ 2 คน < ท็อป 3
  assert.equal(r[0].arena.coins, 20000)
})

test('อารีน่า: ท็อป 3 เท่ากันที่เส้นตัดได้ทุกคน', () => {
  const p = (uid, rating) => ({ uid, pvp: { seasonId: S, rating, wins: 1, losses: 0 } })
  const r = computeSeasonRewards([p('a', 1400), p('b', 1300), p('c', 1200), p('d', 1200), p('e', 1100)], S)
  assert.deepEqual(r.filter(x => x.arena.top).map(x => x.uid), ['a', 'b', 'c', 'd'])
})

test('จดหมาย: หอคอย+อารีน่าแยกใบ · achievement ติดวันที่ซีซั่น · ไม่ติดท็อปไม่มี achievement', () => {
  const [t, a] = seasonRewardMails({
    tower: { best: 60, top: true, coins: 60000, tickets: 50 },
    arena: { rating: 1100, wins: 1, losses: 2, top: false, coins: 20000 },
  }, S, 'ก.ย.')
  assert.deepEqual(t.achievement, { id: 'tower_champ', date: S })
  assert.equal(t.tickets, 50)
  assert.equal(a.achievement, undefined)
  assert.equal(a.coins, 20000)
})
