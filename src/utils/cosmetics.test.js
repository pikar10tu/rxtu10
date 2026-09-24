// รัน: node --test src/utils/cosmetics.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cosOf, canBuy, afterBuy, afterWear, rosterCos } from './cosmetics.js'
import { COSMETICS, getCosmetic } from '../data/cosmetics.js'

test('แคตตาล็อก: id ไม่ซ้ำ · ทุกชิ้นมีหมวด/ระดับ/ราคา > 0 · ราคาระดับสูงกว่าแพงกว่าระดับต่ำเสมอ', () => {
  const ids = COSMETICS.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const c of COSMETICS) {
    assert.ok(['n', 'f', 'b', 'g'].includes(c.kind), c.id)
    assert.ok(c.price > 0 && c.tier >= 1 && c.tier <= 4, c.id)
  }
  for (const k of ['n', 'f', 'b', 'g']) {
    for (let t = 1; t < 4; t++) {
      const hi = Math.max(...COSMETICS.filter(c => c.kind === k && c.tier === t).map(c => c.price))
      const lo = Math.min(...COSMETICS.filter(c => c.kind === k && c.tier === t + 1).map(c => c.price))
      assert.ok(hi < lo, `${k} ระดับ ${t} แพงกว่า ${t + 1}`)
    }
  }
})

test('ซื้อ: ของไม่รู้จัก/มีแล้ว/เงินไม่พอ ซื้อไม่ได้ · ซื้อแล้วใส่ให้ทันที', () => {
  const u = { coins: 10000, cosmetics: { owned: ['n-sky'] } }
  assert.equal(canBuy(u, 'zzz').reason, 'unknown')
  assert.equal(canBuy(u, 'n-sky').reason, 'owned')
  assert.equal(canBuy(u, 'n-g-heaven').reason, 'coins')
  assert.deepEqual(canBuy(u, 'n-mint'), { ok: true, reason: null, price: 5000 })
  const next = afterBuy(u, 'f-sky')
  assert.deepEqual(next.owned, ['n-sky', 'f-sky'])
  assert.equal(next.f, 'f-sky')
})

test('ใส่/ถอด + กันค่าเพี้ยน: ใส่ของที่ไม่มี = ไม่ใส่ · roster เอาเฉพาะชื่อ/กรอบ/ป้ายที่ใส่อยู่', () => {
  const u = { cosmetics: { owned: ['n-sky', 'g-pink', 'b-star'], n: 'n-sky', g: 'g-pink', f: 'f-heaven' } }
  assert.equal(cosOf(u).f, null, 'ใส่กรอบที่ไม่ได้ซื้อ = ไม่โชว์')
  assert.equal(afterWear(u, 'b', 'b-star').b, 'b-star')
  assert.equal(afterWear(u, 'b', 'b-crown').b, null)
  assert.equal(afterWear(u, 'n', null).n, null)
  assert.deepEqual(rosterCos(u), { n: 'n-sky' })
  assert.equal(rosterCos({}), null)
  assert.equal(getCosmetic('g-pink').kind, 'g')
})
