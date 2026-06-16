// เทส mailbox — pure logic ระบบจดหมาย (Mailbox track)
// รัน: node --test src/utils/mailbox.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rewardCoins, canClaim, needsAttention, attentionCount, buildReportRewardMail } from './mailbox.js'

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
