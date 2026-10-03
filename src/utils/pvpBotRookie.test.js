import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rookieBotChance, rookieBot } from './pvpBot.js'

test('โอกาสเจอหุ่นซ้อมมือใหม่', () => {
  assert.equal(rookieBotChance({ rating: 1000, fights: 0 }), 1)
  assert.equal(rookieBotChance({ rating: 950, fights: 10 }), 0.7)
  assert.equal(rookieBotChance({ rating: 950, fights: 10, loseStreak: 2 }), 1)
  assert.equal(rookieBotChance({ rating: 1050, fights: 10, loseStreak: 1 }), 0)
  assert.equal(rookieBotChance({ rating: 1300, fights: 10, loseStreak: 3 }), 0.4)
  assert.equal(rookieBotChance({ rating: 1300, fights: 10, loseStreak: 2 }), 0)
  assert.equal(rookieBotChance({ rating: 1650, fights: 10, loseStreak: 3 }), 0.3)
  assert.equal(rookieBotChance({ rating: 1050, fights: 10, loseStreak: 2 }), 0.5)
  assert.equal(rookieBotChance({ rating: 1100, fights: 10, loseStreak: 5 }), 0.5)   // ช่วงชั้นใหม่ 3 ต.ค.: 1000–1199 แพ้ติด ≥2 = 50%
})

test('หุ่นมือใหม่: แรร์/ธรรมดาเท่าเดิม ขาดได้ไม่เกิน 1 ตัว', () => {
  const me = [{ rarity: 'rare', grade: 1 }, { rarity: 'common', grade: 0 }, { rarity: 'rare', grade: 1 }]
  for (let s = 1; s < 50; s++) {
    const b = rookieBot(me, 1000, s)
    assert.ok(b.isBot && b.team.length >= 2 && b.team.length <= 3)
    for (const u of b.team) assert.ok(me.some(m => m.rarity === u.rarity && m.grade === u.grade))
  }
})

test('หุ่นมือใหม่: อีปิค→แรร์ ตำนาน→อีปิค (คงตำนานได้ไม่เกิน 1) ไม่ขาดตัว', () => {
  const me = [{ rarity: 'legendary', grade: 3 }, { rarity: 'legendary', grade: 3 }, { rarity: 'epic', grade: 2 }]
  let kept = 0
  for (let s = 1; s < 200; s++) {
    const b = rookieBot(me, 1000, s)
    assert.equal(b.team.length, 3)
    const L = b.team.filter(u => u.rarity === 'legendary').length
    assert.ok(L <= 1); kept += L
    assert.equal(b.team[2].rarity, 'rare')
  }
  assert.ok(kept > 10 && kept < 80)
})
