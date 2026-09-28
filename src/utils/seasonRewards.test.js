// เทส seasonRewards — pure · รัน: node --test src/utils/seasonRewards.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeSeasonRewards, seasonRewardMails, towerTier, arenaTier } from './seasonRewards.js'

const S = '2026-09'
const tw = (uid, towerBest) => ({ uid, towerBest })
const pv = (uid, rating) => ({ uid, pvp: { seasonId: S, rating, wins: 1, losses: 0 } })

test('หอคอย: ขอบขั้น', () => {
  assert.equal(towerTier(0), null)
  assert.deepEqual([1, 19, 20, 39, 40, 59, 60, 79, 80, 99, 100].map(b => towerTier(b).coins),
    [10000, 10000, 15000, 15000, 20000, 20000, 25000, 25000, 30000, 30000, 35000])
  assert.deepEqual([19, 20, 100].map(b => towerTier(b).tickets), [5, 10, 30])
  assert.deepEqual([19, 59, 79, 99, 100].map(b => towerTier(b).lv), [1, 2, 2, 3, 4])
})

test('หอคอย: ไม่ดูอันดับ · achievement เฉพาะชั้น 100', () => {
  const r = computeSeasonRewards([tw('a', 0), tw('b', 100), tw('c', 100), tw('d', 99)], S)
  assert.equal(r.find(x => x.uid === 'a'), undefined)
  const mail = (uid) => seasonRewardMails(r.find(x => x.uid === uid), S, 'ก.ย.')[0]
  assert.deepEqual(mail('b').achievement, { id: 'tower_champ', date: S })
  assert.deepEqual(mail('c').achievement, { id: 'tower_champ', date: S })
  assert.equal(mail('d').achievement, undefined)
  assert.equal(mail('d').coins, 30000)
  assert.equal(mail('d').tickets, 25)
})

test('อารีน่า: ขั้นตามอันดับ', () => {
  assert.deepEqual([1, 2, 3, 4, 10, 11, 40].map(k => arenaTier(k).coins),
    [45000, 40000, 35000, 25000, 25000, 20000, 20000])
  assert.deepEqual([1, 2, 3, 4, 11].map(k => arenaTier(k).tickets), [35, 30, 25, 20, 15])
  assert.deepEqual([1, 3, 4, 10, 11].map(k => arenaTier(k).champ), [true, true, true, true, false])
  assert.deepEqual([3, 4].map(k => arenaTier(k).ach), [true, false])
})

test('อารีน่า: ใช้ผลจาก last · ไม่เคยบุก/คนละซีซั่น = ไม่ได้', () => {
  const users = [
    { uid: 'now', pvp: { seasonId: S, rating: 1200, wins: 2, losses: 1 } },
    { uid: 'moved', pvp: { seasonId: '2026-10', rating: 1050, wins: 1, losses: 0, last: { seasonId: S, rating: 1300, wins: 5, losses: 0 } } },
    { uid: 'idle', pvp: { seasonId: S, rating: 1000, wins: 0, losses: 0 } },
    { uid: 'old', pvp: { seasonId: '2026-08', rating: 1500, wins: 9, losses: 0 } },
  ]
  const r = computeSeasonRewards(users, S)
  assert.deepEqual(r.map(x => x.uid).sort(), ['moved', 'now'])
  assert.equal(r.find(x => x.uid === 'moved').arena.rank, 1)
})

test('อารีน่า: เสมอที่อันดับ 3 ได้ขั้น 3 ทั้งคู่ · เสมอที่ 10 ได้สนามทั้งคู่', () => {
  const users = [...Array(12)].map((_, i) => pv('u' + i, 2000 - i * 10))
  users.push(pv('t3', 1980), pv('t10', 1910))
  const r = computeSeasonRewards(users, S)
  const rk = (uid) => r.find(x => x.uid === uid).arena
  assert.equal(rk('t3').rank, 3); assert.equal(rk('t3').tier.coins, 35000)
  assert.equal(rk('t10').rank, 11)   // มี t3 แทรก → u9 กับ t10 = อันดับ 11
})

test('จดหมาย: ติด kind/mode/season/tier · สนามแชมป์ต้องอยู่ในทะเบียน', () => {
  const [t] = seasonRewardMails({ tower: { best: 45, tier: towerTier(45) } }, S, 'ก.ย.')
  assert.equal(t.kind, 'season'); assert.equal(t.mode, 'tower'); assert.equal(t.season, S)
  assert.deepEqual(t.tier, { lv: 2, name: towerTier(45).name, best: 45 })
  const [a] = seasonRewardMails({ arena: { rating: 2000, wins: 5, losses: 0, rank: 1, tier: arenaTier(1) } }, S, 'ก.ย.')
  assert.equal(a.mode, 'arena'); assert.equal(a.coins, 45000); assert.equal(a.tickets, 35)
  assert.deepEqual(a.achievement, { id: 'arena_champ', date: S })
  assert.deepEqual(a.arena, { id: 'ch-2026-09', rank: 1 })
  const [z] = seasonRewardMails({ arena: { rating: 2000, wins: 5, losses: 0, rank: 1, tier: arenaTier(1) } }, '2020-01', 'ม.ค.')
  assert.equal(z.arena, undefined)
  for (const m of [t, a]) assert.ok(!/\p{Extended_Pictographic}/u.test(m.title))
})
