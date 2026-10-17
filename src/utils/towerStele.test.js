import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildStele } from './towerStele.js'

test('ซีซั่นใหม่บนสุด · ในซีซั่นเรียงชั้น · ✦ = ยอดสูงสุดตลอดกาลของคนนั้น · ≤100 ไม่จารึก', () => {
  const rows = {
    a: { n: 'แพรวา', th: { '2026-10': 140, '2026-11': 132 } },
    b: { n: 'ปิ๊ก', th: { '2026-11': 150 } },
    c: { n: 'ทิว', th: { '2026-11': 100 } },
    d: { n: 'ไม่มี' },
  }
  const s = buildStele(rows, 'a')
  assert.deepEqual(s.map(x => x.season), ['2026-11', '2026-10'])
  assert.deepEqual(s[0].entries.map(e => [e.name, e.floor, e.isPeak, e.isMe]), [['ปิ๊ก', 150, true, false], ['แพรวา', 132, false, true]])
  assert.deepEqual(s[1].entries.map(e => [e.name, e.isPeak]), [['แพรวา', true]])
})
