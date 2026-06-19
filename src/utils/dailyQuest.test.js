// เทส dailyQuest — pure (bump/reset/complete/claimable/mult)
// รัน: node --test src/utils/dailyQuest.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  QUEST_GOALS, BUFF_MS, bumpDailyQuest, questComplete, questClaimable, questIncomeMult,
} from './dailyQuest.js'

const T = '2026-06-19'

test('bump: doc ว่าง → เริ่มวันนี้ +1', () => {
  const dq = bumpDailyQuest(undefined, 'quiz', T)
  assert.deepEqual(dq, { date: T, quiz: 1, study: 0, gacha: 0, claimed: false })
})

test('bump: +n สะสมในวันเดียว', () => {
  let dq = bumpDailyQuest({ date: T, quiz: 2, study: 0, gacha: 0, claimed: false }, 'quiz', T, 3)
  assert.equal(dq.quiz, 5)
})

test('bump: ข้ามวัน → รีเซ็ตก่อนนับ (รวม claimed)', () => {
  const old = { date: '2026-06-18', quiz: 9, study: 9, gacha: 9, claimed: true }
  const dq = bumpDailyQuest(old, 'study', T)
  assert.deepEqual(dq, { date: T, quiz: 0, study: 1, gacha: 0, claimed: false })
})

test('questComplete: ครบทั้ง 3 + วันตรง', () => {
  assert.equal(questComplete({ date: T, quiz: 5, study: 5, gacha: 1, claimed: false }, T), true)
  assert.equal(questComplete({ date: T, quiz: 5, study: 4, gacha: 1, claimed: false }, T), false)
  assert.equal(questComplete({ date: '2026-06-18', quiz: 9, study: 9, gacha: 9 }, T), false) // คนละวัน
})

test('questClaimable: ครบและยังไม่รับ', () => {
  assert.equal(questClaimable({ date: T, quiz: 5, study: 5, gacha: 1, claimed: false }, T), true)
  assert.equal(questClaimable({ date: T, quiz: 5, study: 5, gacha: 1, claimed: true }, T), false)
})

test('questIncomeMult: buff active/หมดอายุ', () => {
  const now = 1_000_000
  assert.equal(questIncomeMult({ incomeBuffUntil: now + 1000 }, now), 1.5)
  assert.equal(questIncomeMult({ incomeBuffUntil: now - 1000 }, now), 1)
  assert.equal(questIncomeMult({}, now), 1)
  assert.equal(questIncomeMult(null, now), 1)
})

test('BUFF_MS = 24 ชม.', () => {
  assert.equal(BUFF_MS, 24 * 60 * 60 * 1000)
})
