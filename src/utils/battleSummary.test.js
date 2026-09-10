import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeBattleSummary } from './battleSummary.js'

const teamA = [{ id: 'x' }, { id: 'y' }]
const teamB = [{ id: 'z' }]
const log = [
  { t: 'round', n: 1 },
  { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 30, dead: false },
  { t: 'attack', side: 'B', attacker: 'B0', target: 'A1', dmg: 50, dead: false },
  { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 20, dead: true },
  { t: 'end', winner: 'A' },
]

test('รวมดาเมจทำ/รับ ต่อตัว ทั้งสองฝั่ง', () => {
  const s = computeBattleSummary(log, teamA, teamB)
  const a0 = s.teamA.find(u => u.uid === 'A0')
  const a1 = s.teamA.find(u => u.uid === 'A1')
  const b0 = s.teamB.find(u => u.uid === 'B0')
  assert.equal(a0.dmgDealt, 30); assert.equal(a0.dmgTaken, 0)
  assert.equal(a1.dmgDealt, 20); assert.equal(a1.dmgTaken, 50); assert.equal(a1.kills, 1)
  assert.equal(b0.dmgDealt, 50); assert.equal(b0.dmgTaken, 50); assert.equal(b0.dead, true)
})

test('MVP ต่อทีม = score สูงสุด (dealt + 0.5*taken)', () => {
  const s = computeBattleSummary(log, teamA, teamB)
  // A0 score=30, A1 score=20+25=45 → MVP ทีม A = A1 · ทีม B มีตัวเดียว = B0
  assert.equal(s.mvp.A, 'A1')
  assert.equal(s.mvp.B, 'B0')
})

test('เสมอ → ตัว index น้อยกว่า (ซ้าย) เป็น MVP', () => {
  const tie = [
    { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 10, dead: false },
    { t: 'attack', side: 'A', attacker: 'A1', target: 'B0', dmg: 10, dead: false },
  ]
  const s = computeBattleSummary(tie, teamA, teamB)
  assert.equal(s.mvp.A, 'A0')
})

test('ทีมว่าง → mvp null', () => {
  const s = computeBattleSummary([], [], teamB)
  assert.equal(s.mvp.A, null)
  assert.equal(s.teamA.length, 0)
})

// ── P2c-2 (10 ก.ย. 2026): ใบการตายเงียบจาก battleEngine.resolveSilentDeath ──
// สเปก: docs/superpowers/specs/2026-09-10-silent-death-logging-design.md §5
// เทสตรึงพฤติกรรม (ไม่ใช่เทสขับการเปลี่ยนแปลง) — ไฟล์นี้ไม่ต้องแก้ตรรกะเลย
// แต่ถ้าวันไหนมีคนใส่ดาเมจจริงลงใบ silent เลขในหน้าสรุปจะขยับเงียบๆ เทสนี้คือตัวจับ

test('ใบการตายเงียบ: ขึ้น 💀 + ให้เครดิตการฆ่า แต่ไม่ขยับเลขดาเมจ', () => {
  const lg = [
    { t: 'attack', side: 'A', attacker: 'A0', target: 'B0', dmg: 100, dead: false, targetHpAfter: 50 },
    // B0 สวนหนามฆ่า A0 — เอนจินยิงใบนี้ให้ โดยผู้ฆ่าคือเจ้าของหนาม
    { t: 'attack', side: 'B', attacker: 'B0', target: 'A0', dmg: 0, dead: true, silent: true, sub: true, targetHpAfter: 0 },
  ]
  const s = computeBattleSummary(lg, [{ id: 'x' }], [{ id: 'z' }])
  const a0 = s.teamA[0], b0 = s.teamB[0]
  assert.equal(a0.dead, true, 'ตัวที่ตายเงียบต้องขึ้น 💀 ไม่ใช่ยืนสว่างอยู่')
  assert.equal(b0.kills, 1, 'ผู้ฆ่าต้องได้เครดิตการฆ่า')
  assert.equal(b0.dmgDealt, 0, 'ใบ silent ห้ามบวกดาเมจให้ผู้ฆ่า (ผู้ใช้เคาะ: เลขดาเมจคงเดิม)')
  assert.equal(a0.dmgDealt, 100, 'ดาเมจของหมัดปกติต้องยังนับตามเดิม')
  assert.equal(a0.dmgTaken, 0, 'ดาเมจหนามที่ฆ่า A0 ต้องไม่ถูกนับเป็นดาเมจที่ A0 รับ')
  assert.equal(b0.dmgTaken, 100, 'เป้าของหมัดปกติยังนับดาเมจที่รับตามเดิม')
})
