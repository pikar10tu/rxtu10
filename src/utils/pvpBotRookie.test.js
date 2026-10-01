import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rookieBotChance, rookieBot } from './pvpBot.js'

test('โอกาสเจอหุ่นซ้อมมือใหม่', () => {
  assert.equal(rookieBotChance({ rating: 1000, fights: 0 }), 1)
  assert.equal(rookieBotChance({ rating: 950, fights: 10 }), 0.7)
  assert.equal(rookieBotChance({ rating: 950, fights: 10, loseStreak: 2 }), 1)
  assert.equal(rookieBotChance({ rating: 1050, fights: 10, loseStreak: 1 }), 0)
  assert.equal(rookieBotChance({ rating: 1050, fights: 10, loseStreak: 2 }), 0.5)
  assert.equal(rookieBotChance({ rating: 1100, fights: 10, loseStreak: 5 }), 0)
})

test('หุ่นมือใหม่เลียนระดับ+เกรดทีมเรา ขาดได้ไม่เกิน 1 ตัว', () => {
  const me = [{ rarity: 'epic', grade: 2 }, { rarity: 'common', grade: 0 }, { rarity: 'rare', grade: 1 }]
  for (let s = 1; s < 50; s++) {
    const b = rookieBot(me, 1000, s)
    assert.ok(b.isBot && b.team.length >= 2 && b.team.length <= 3)
    for (const u of b.team) assert.ok(me.some(m => m.rarity === u.rarity && m.grade === u.grade))
  }
})
