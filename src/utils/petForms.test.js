import { test } from 'node:test'
import assert from 'node:assert/strict'
import { degreeFormActive, effectiveRarity, displayName, seasonOfSlot, SEASONS, duoPartnerOf, seasonText, SEASON_OF_EFFECT } from './petForms.js'

const P = (id, rarity) => ({ id, rarity })
const sol = P('sol', 'legendary'), earth = P('earth', 'legendary'), cat = P('cat', 'common'), lion = P('lion', 'legendary')

test('ร่างองศา: มี Sol + Earth + ไม่มี common เลย', () => {
  assert.equal(degreeFormActive([sol, earth, lion]), true)
  assert.equal(degreeFormActive([sol, earth, cat]), false, 'มี common แล้ว Earth ไม่ต้องแปลง')
  assert.equal(degreeFormActive([earth, lion]), false, 'ไม่มี Sol ไม่แปลง')
  assert.equal(degreeFormActive([sol, lion]), false, 'ไม่มี Earth')
})

test('effectiveRarity: Earth ในร่างองศานับเป็น common', () => {
  assert.equal(effectiveRarity(earth, [sol, earth, lion]), 'common')
  assert.equal(effectiveRarity(earth, [sol, earth, cat]), 'legendary')
  assert.equal(effectiveRarity(cat, [sol, earth, cat]), 'common')
})

test('displayName: ร่างองศา = ซัน/องศา · ปกติ = ชื่อเดิม', () => {
  const t = [sol, earth, lion]
  assert.equal(displayName('sol', 'ซอล', t), 'ซัน')
  assert.equal(displayName('earth', 'เอิร์ธ', t), 'องศา')
  assert.equal(displayName('lion', 'สิงโต', t), 'สิงโต')
  assert.equal(displayName('sol', 'ซอล', [sol, cat]), 'ซอล')
})

test('ฤดูตามช่อง: 0 ร้อน · 1 ฝน · 2 หนาว', () => {
  assert.deepEqual(SEASONS.map(s => s.key), ['hot', 'rain', 'cold'])
  assert.equal(seasonOfSlot(0).key, 'hot')
  assert.equal(seasonOfSlot(2).key, 'cold')
  assert.equal(seasonOfSlot(7).key, 'cold')
})

test('duoPartnerOf: ☀️🌍 เฉพาะร่างองศา · 🐳🦭 เมื่ออยู่ทีมเดียวกัน', () => {
  assert.equal(duoPartnerOf('sol', [sol, earth, lion]), 'earth')
  assert.equal(duoPartnerOf('earth', [sol, earth, lion]), 'sol')
  assert.equal(duoPartnerOf('sol', [sol, earth, cat]), null)
  assert.equal(duoPartnerOf('whale', [P('whale', 'legendary'), P('seal', 'rare')]), 'seal')
  assert.equal(duoPartnerOf('whale', [P('whale', 'legendary')]), null)
})

test('seasonText: เลขมาจากค่าที่ส่งเข้ามา', () => {
  const v = { hot: 20, rain: 25, cold: 30 }
  assert.match(seasonText('hot', v), /\+20%/)
  assert.match(seasonText('rain', v), /25%/)
  assert.match(seasonText('cold', v), /30%/)
  assert.equal(SEASON_OF_EFFECT.seasonCold, 'cold')
})
