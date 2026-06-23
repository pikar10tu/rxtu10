// เทส mailbox — pure logic ระบบจดหมาย (Mailbox track)
// รัน: node --test src/utils/mailbox.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rewardCoins, rewardTickets, canClaim, needsAttention, attentionCount, buildReportRewardMail, buildBroadcastMail, buildWelcomeGiftMail } from './mailbox.js'

test('rewardCoins: คืนจำนวนเหรียญถ้า reward.coins เป็นบวก, ไม่งั้น 0', () => {
  assert.equal(rewardCoins({ reward: { coins: 50 } }), 50)
  assert.equal(rewardCoins({ reward: { coins: 0 } }), 0)
  assert.equal(rewardCoins({ type: 'notice' }), 0)
  assert.equal(rewardCoins(undefined), 0)
})

test('canClaim: true เฉพาะมีรางวัล > 0 และยังไม่ claim', () => {
  assert.equal(canClaim({ reward: { coins: 50 }, claimed: false }), true)
  assert.equal(canClaim({ reward: { coins: 50 }, claimed: true }), false)
  assert.equal(canClaim({ type: 'notice', claimed: false }), false)  // ไม่มีรางวัล
  assert.equal(canClaim(null), false)
})

test('needsAttention: ยังไม่อ่าน หรือ ยังกดรับได้', () => {
  assert.equal(needsAttention({ read: false, type: 'notice' }), true)        // unread
  assert.equal(needsAttention({ read: true, reward: { coins: 50 }, claimed: false }), true) // อ่านแล้วแต่ยังไม่รับ
  assert.equal(needsAttention({ read: true, type: 'notice' }), false)
  assert.equal(needsAttention({ read: true, reward: { coins: 50 }, claimed: true }), false)
})

test('attentionCount: นับ mail ที่ต้องสนใจ', () => {
  const mails = [
    { read: false, type: 'notice' },                                  // +1 unread
    { read: true, reward: { coins: 50 }, claimed: false },            // +1 claimable
    { read: true, type: 'notice' },                                   // 0
    { read: true, reward: { coins: 50 }, claimed: true },             // 0
  ]
  assert.equal(attentionCount(mails), 2)
  assert.equal(attentionCount([]), 0)
  assert.equal(attentionCount(undefined), 0)
})

test('buildReportRewardMail: type reward, title ไม่มี emoji (กัน tofu), reward.coins ถูก, read/claimed=false', () => {
  const report = { questionSnapshot: { question: 'ยาใดเป็น first-line ของ CAP' }, reportedByName: 'มายด์' }
  const mail = buildReportRewardMail(report, 50, 1234)
  assert.equal(mail.type, 'reward')
  assert.equal(mail.reward.coins, 50)
  assert.equal(mail.from, 'system')
  assert.equal(mail.read, false)
  assert.equal(mail.claimed, false)
  assert.equal(mail.createdAt, 1234)
  assert.ok(!/\p{Extended_Pictographic}/u.test(mail.title), 'title ต้องไม่มี emoji')
  assert.ok(mail.body.includes('CAP'), 'body อ้างถึงโจทย์')
})

test('buildReportRewardMail: ไม่มี snapshot → body ทั่วไป ไม่ throw', () => {
  const mail = buildReportRewardMail({}, 50, 1)
  assert.equal(mail.reward.coins, 50)
  assert.ok(mail.body.length > 0)
})

test('buildBroadcastMail: มีเหรียญ → type reward + reward.coins, from default admin', () => {
  const mail = buildBroadcastMail({ title: 'ยินดีต้อนรับ', body: 'รับเลย', coins: 100 }, 1234)
  assert.equal(mail.type, 'reward')
  assert.equal(mail.reward.coins, 100)
  assert.equal(mail.from, 'admin')
  assert.equal(mail.read, false)
  assert.equal(mail.claimed, false)
  assert.equal(mail.createdAt, 1234)
})

test('buildBroadcastMail: ไม่มีเหรียญ (0/undefined) → type notice + ไม่มี key reward', () => {
  const a = buildBroadcastMail({ title: 'ประกาศ', coins: 0 }, 1)
  assert.equal(a.type, 'notice')
  assert.equal('reward' in a, false)
  assert.equal(a.body, '')
  const b = buildBroadcastMail({ title: 'x' }, 1)
  assert.equal(b.type, 'notice')
  assert.equal('reward' in b, false)
})

test('buildBroadcastMail: ระบุ from เองได้ (เช่น uid เพื่อน)', () => {
  const mail = buildBroadcastMail({ title: 'ของขวัญ', coins: 10, from: 'uid123' }, 1)
  assert.equal(mail.from, 'uid123')
})

test('buildBroadcastMail: แนบ achievement → reward.achievement', () => {
  const m = buildBroadcastMail({ title: 'ยินดีด้วย', body: 'เก่งมาก', achievement: { id: 'daily_king', date: '2026-06-18' } }, 'TS')
  assert.deepEqual(m.reward.achievement, { id: 'daily_king', date: '2026-06-18' })
  assert.equal(m.type, 'reward')
})

test('buildBroadcastMail: ไม่มี coins/achievement → notice', () => {
  const m = buildBroadcastMail({ title: 'ประกาศ', body: 'ข่าว' }, 'TS')
  assert.equal(m.type, 'notice')
  assert.equal(m.reward, undefined)
})

test('canClaim: achievement อย่างเดียว (coins 0) ก็รับได้', () => {
  assert.equal(canClaim({ claimed: false, reward: { achievement: { id: 'x' } } }), true)
})

test('rewardTickets: คืนจำนวนตั๋วถ้า reward.tickets เป็นบวก, ไม่งั้น 0', () => {
  assert.equal(rewardTickets({ reward: { tickets: 50 } }), 50)
  assert.equal(rewardTickets({ reward: { tickets: 0 } }), 0)
  assert.equal(rewardTickets({ reward: { coins: 50 } }), 0)
  assert.equal(rewardTickets(undefined), 0)
})

test('canClaim: true เมื่อมีตั๋วอย่างเดียวและยังไม่ claim', () => {
  assert.equal(canClaim({ reward: { tickets: 50 }, claimed: false }), true)
  assert.equal(canClaim({ reward: { tickets: 50 }, claimed: true }), false)
})

test('buildBroadcastMail: ใส่ reward.tickets เมื่อ tickets > 0', () => {
  const m = buildBroadcastMail({ title: 'x', tickets: 10 }, 123)
  assert.equal(m.type, 'reward')
  assert.equal(m.reward.tickets, 10)
  const n = buildBroadcastMail({ title: 'x' }, 123)
  assert.equal(n.type, 'notice')
  assert.equal(n.reward, undefined)
})

test('buildWelcomeGiftMail: แม่แบบเป๊ะ from welcome, reward 15000/50, claimable', () => {
  const m = buildWelcomeGiftMail(123)
  assert.equal(m.type, 'reward')
  assert.equal(m.from, 'welcome')
  assert.equal(m.claimed, false)
  assert.equal(m.read, false)
  assert.deepEqual(Object.keys(m.reward).sort(), ['coins', 'tickets'])
  assert.equal(m.reward.coins, 15000)
  assert.equal(m.reward.tickets, 50)
  assert.equal(m.createdAt, 123)
  assert.equal(canClaim(m), true)
})
