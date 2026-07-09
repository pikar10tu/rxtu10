// src/utils/petTeam.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveBattleTeam } from './petTeam.js'

test('resolveBattleTeam: ใช้ rarity/grade จาก instance ก่อน def', () => {
  const r = resolveBattleTeam(['zzz'], [{ id: 'zzz', rarity: 'epic', grade: 3 }])
  assert.equal(r.length, 1)
  assert.equal(r[0].id, 'zzz')
  assert.equal(r[0].rarity, 'epic')
  assert.equal(r[0].grade, 3)
  assert.equal(r[0].element, 'scissors') // ไม่มี def จริง → default
})
test('resolveBattleTeam: ตัด id ว่าง (null) ทิ้ง', () => {
  assert.equal(resolveBattleTeam([null, 'zzz', null], []).length, 1)
})
test('resolveBattleTeam: id ไม่มี instance → grade 0 + common', () => {
  const r = resolveBattleTeam(['zzz'], [])
  assert.equal(r[0].grade, 0)
  assert.equal(r[0].rarity, 'common')
})
test('resolveBattleTeam: cap ที่ BATTLE_SLOTS (3) — ส่ง 4 id คืน 3', () => {
  const r = resolveBattleTeam(['a', 'b', 'c', 'd'], [])
  assert.equal(r.length, 3)
  assert.deepEqual(r.map(u => u.id), ['a', 'b', 'c'])
})
