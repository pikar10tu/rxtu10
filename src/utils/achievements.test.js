// เทส achievements util — pure (computeProgress/checkMilestones/title/docId/news)
// รัน: node --test src/utils/achievements.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  computeProgress, resolveGte, checkMilestones,
  achievementTitle, achievementDocId, buildAchievementNews,
} from './achievements.js'

const M = [
  { id: 'pet_5',   trigger: { stat: 'petCount', gte: 5 } },
  { id: 'pet_10',  trigger: { stat: 'petCount', gte: 10 } },
  { id: 'pet_all', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' } },
  { id: 'home_max', trigger: { stat: 'residenceLevel', gte: 'MAX_RESIDENCE' } },
]
const CTX = { allSpecies: 3, maxResidence: 12 }

test('computeProgress: petCount + distinct species', () => {
  const p = computeProgress({ pets: [{ id: 'a' }, { id: 'a' }, { id: 'b' }] })
  assert.equal(p.petCount, 3)
  assert.equal(p.petSpeciesCount, 2)
})

test('computeProgress: counters + derived defaults', () => {
  const p = computeProgress({ quizDoneTotal: 12, totalSpent: 50, residence: { level: 6 } })
  assert.equal(p.quizDoneTotal, 12)
  assert.equal(p.totalSpent, 50)
  assert.equal(p.residenceLevel, 6)
  assert.equal(p.petCount, 0)       // pets missing → 0
  assert.equal(p.farmSalesTotal, 0)
})

test('resolveGte: sentinel + numeric', () => {
  assert.equal(resolveGte(5, CTX), 5)
  assert.equal(resolveGte('ALL_SPECIES', CTX), 3)
  assert.equal(resolveGte('MAX_RESIDENCE', CTX), 12)
})

test('checkMilestones: คืน id ที่ถึงเกณฑ์และยังไม่ได้', () => {
  const progress = computeProgress({ pets: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }] })
  // petCount 5, species 5 → pet_5 ✓, pet_10 ✗, pet_all (gte 3) ✓
  const got = checkMilestones(M, progress, new Set(), CTX)
  assert.deepEqual(got.sort(), ['pet_5', 'pet_all'])
})

test('checkMilestones: ข้ามที่ได้แล้ว (earnedIds)', () => {
  const progress = computeProgress({ pets: Array.from({ length: 5 }, (_, i) => ({ id: 'x' + i })) })
  const got = checkMilestones(M, progress, new Set(['pet_5']), CTX)
  assert.ok(!got.includes('pet_5'))
  assert.ok(got.includes('pet_all'))
})

test('checkMilestones: หลาย tier พร้อมกัน', () => {
  const progress = computeProgress({ pets: Array.from({ length: 10 }, (_, i) => ({ id: 'x' + i })) })
  const got = checkMilestones(M, progress, new Set(), CTX)
  assert.ok(got.includes('pet_5') && got.includes('pet_10'))
})

test('checkMilestones: residence sentinel', () => {
  const got = checkMilestones(M, computeProgress({ residence: { level: 12 } }), new Set(), CTX)
  assert.ok(got.includes('home_max'))
})

test('achievementTitle: dated ต่อท้ายวันที่', () => {
  assert.equal(achievementTitle({ title: 'ราชา' }, '2026-06-18'), 'ราชา 2026-06-18')
  assert.equal(achievementTitle({ title: 'นักช้อป' }, null), 'นักช้อป')
})

test('achievementDocId: dated → id__date', () => {
  assert.equal(achievementDocId('daily_king', '2026-06-18'), 'daily_king__2026-06-18')
  assert.equal(achievementDocId('pet_5', null), 'pet_5')
})

test('buildAchievementNews: msg ไม่มี emoji, icon แยก field', () => {
  const n = buildAchievementNews('โจ้', { title: 'นักธุรกิจ', icon: '💼' }, null)
  assert.equal(n.type, 'achievement')
  assert.equal(n.icon, '💼')
  assert.ok(!/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(n.msg))  // ไม่มี emoji ใน msg
  assert.ok(n.msg.includes('โจ้') && n.msg.includes('นักธุรกิจ'))
})
