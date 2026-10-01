import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readPresets, editPresetPatch, usePresetPatch } from './teamPresets.js'

test('ยังไม่เคยมีชุด → ชุด 1 = ทีมปัจจุบัน', () => {
  const s = readPresets({ activePets: ['a', 'b'] })
  assert.equal(s.idx, 0)
  assert.deepEqual(s.presets, [['a', 'b'], [], []])
})

test('ชุดที่ใช้อยู่ตาม activePets เสมอ · กรองตัวที่ไม่มีแล้ว', () => {
  const s = readPresets({ activePets: ['x'], teamPresetIdx: 1, teamPresets: { 0: ['a', 'gone'], 1: ['old'] } }, new Set(['a', 'x']))
  assert.deepEqual(s.presets, [['a'], ['x'], []])
})

test('แก้ชุดที่ไม่ได้ใช้ ไม่แตะ activePets · แก้ชุดที่ใช้ = activePets ตาม', () => {
  const s = readPresets({ activePets: ['a'] })
  assert.deepEqual(editPresetPatch(s, 2, ['c']), { teamPresets: { 0: ['a'], 1: [], 2: ['c'] } })
  assert.deepEqual(editPresetPatch(s, 0, ['b']).activePets, ['b'])
})

test('ใช้ทีมนี้ → activePets + idx', () => {
  const s = readPresets({ activePets: ['a'], teamPresets: { 1: ['b', 'c'] } })
  const p = usePresetPatch(s, 1)
  assert.deepEqual(p.activePets, ['b', 'c'])
  assert.equal(p.teamPresetIdx, 1)
  assert.deepEqual(p.teamPresets[0], ['a'])
})
