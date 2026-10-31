import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchupOf } from './matchup.js'

const foes = [{ element: 'scissors' }, { element: 'scissors' }, { element: 'paper' }]

test('matchupOf: นับชนะทาง/แพ้ทางตามสาย', () => {
  assert.deepEqual(matchupOf('fist', foes), { win: 2, lose: 1 })
  assert.deepEqual(matchupOf('paper', foes), { win: 0, lose: 2 })
  assert.deepEqual(matchupOf('scissors', foes), { win: 1, lose: 0 })
})

test('matchupOf: ไม่มีศัตรู/ข้อมูลไม่ครบ = 0', () => {
  assert.deepEqual(matchupOf('fist', []), { win: 0, lose: 0 })
  assert.deepEqual(matchupOf('fist', null), { win: 0, lose: 0 })
  assert.deepEqual(matchupOf(undefined, foes), { win: 0, lose: 0 })
})
