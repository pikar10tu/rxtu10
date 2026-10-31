// รัน: node --test src/utils/practiceStats.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PLE_GROUP_KEYS } from '../data/plecc.js'
import {
  RADAR_AXES, tallyGroups, buildGsPatch, axisStats, sortWeakFirst, suggestAxes, topWrongIds,
} from './practiceStats.js'

test('radar 21 ด้าน ครอบทุก pleGroup ครั้งเดียว', () => {
  assert.equal(RADAR_AXES.length, 21)
  const all = RADAR_AXES.flatMap(a => a.groups).sort()
  assert.deepEqual(all, PLE_GROUP_KEYS.slice().sort())
})

test('tallyGroups นับถูก/ทำ · ข้ามข้อไม่มีกลุ่ม/กลุ่มแปลก', () => {
  const t = tallyGroups([
    { pleGroup: 'cvs', correct: true }, { pleGroup: 'cvs', correct: false },
    { pleGroup: null, correct: true }, { pleGroup: 'xxx', correct: true },
  ])
  assert.deepEqual(t, { cvs: { c: 1, t: 2 } })
})

test('buildGsPatch: dot-notation + รวม optimistic', () => {
  const inc = (v) => ({ inc: v })
  const { server, optimisticGs } = buildGsPatch({
    gs: { cvs: { c: 3, t: 4 } }, tally: { cvs: { c: 1, t: 2 }, id: { c: 0, t: 1 } }, increment: inc,
  })
  assert.deepEqual(server, { 'study.gs.cvs.t': { inc: 2 }, 'study.gs.cvs.c': { inc: 1 }, 'study.gs.id.t': { inc: 1 } })
  assert.deepEqual(optimisticGs, { cvs: { c: 4, t: 6 }, id: { c: 0, t: 1 } })
})

test('axisStats: รวม other+sci_social · ไม่มีข้อมูล = 0', () => {
  const rows = axisStats({ other: { c: 1, t: 2 }, sci_social: { c: 2, t: 2 } })
  const soc = rows.find(r => r.key === 'social')
  assert.deepEqual([soc.c, soc.t, soc.pct], [3, 4, 75])
  assert.equal(rows.find(r => r.key === 'cvs').pct, 0)
  assert.equal(axisStats(null).length, 21)
})

test('sortWeakFirst: อ่อนก่อน ไม่ได้ฝึกท้าย', () => {
  const rows = sortWeakFirst(axisStats({ cvs: { c: 9, t: 10 }, id: { c: 1, t: 10 } }))
  assert.deepEqual(rows.slice(0, 2).map(r => r.key), ['id', 'cvs'])
  assert.equal(rows[2].t, 0)
})

test('suggestAxes: ต้องทำ ≥5 ข้อ · ไม่พอเติมด้านที่ยังไม่ฝึก', () => {
  const rows = axisStats({ cvs: { c: 4, t: 5 }, id: { c: 0, t: 2 } })
  const s = suggestAxes(rows)
  assert.equal(s[0].key, 'cvs')
  assert.equal(s.length, 3)
  assert.ok(!s.some(r => r.key === 'id'))
})

test('topWrongIds เรียงผิดบ่อยก่อน', () => {
  assert.deepEqual(topWrongIds({ a: { l: 1 }, b: { l: 3 }, c: { l: 0 } }), [{ id: 'b', lapses: 3 }, { id: 'a', lapses: 1 }])
  assert.deepEqual(topWrongIds(undefined), [])
})
