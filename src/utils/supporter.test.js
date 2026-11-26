import test from 'node:test'
import assert from 'node:assert/strict'
import { focusBonus, parseBaht, BEK_GIFT_PARTS } from './supporter.js'
import { canBuyCart } from './doll.js'
import { buildBroadcastMail, canClaim, rewardDoll } from './mailbox.js'
import { PART } from '../data/dollParts.js'

const eq = (extra) => ({ s: 's2', c: 'c1', h: 'h1', e: 'e1', m: 'm1', k: 'k1', t: 't1', b: 'b2', ...extra })

test('ชุดเบคทุกชิ้นเป็นของลิมิเต็ด (ไม่ซ่อน ซื้อไม่ได้)', () => {
  for (const id of BEK_GIFT_PARTS) { assert.ok(PART[id], id); assert.equal(PART[id].limited, true, id); assert.ok(!PART[id].hidden, id) }
})

test('ลองใส่ของลิมิเต็ดที่ยังไม่มี → ซื้อไม่ได้ เหตุผล limited', () => {
  const r = canBuyCart({ coins: 1e9, doll: { owned: [] } }, eq({ t: 't20' }))
  assert.equal(r.ok, false); assert.equal(r.reason, 'limited')
})

test('บัฟโฟกัส +5 เฉพาะเสื้อ/ชุด/หมวกเบคที่มีจริงและใส่อยู่ · ไม่ซ้อน · ปีกไม่มีบัฟ', () => {
  assert.equal(focusBonus({ doll: { owned: ['t20'], eq: eq({ t: 't20' }) } }), 5)
  assert.equal(focusBonus({ doll: { owned: ['f64', 'x58'], eq: eq({ t: 'f64', x: 'x58' }) } }), 5)
  assert.equal(focusBonus({ doll: { owned: [], eq: eq({ t: 't20' }) } }), 0)   // ไม่มีของ = ใส่ไม่ได้จริง
  assert.equal(focusBonus({ doll: { owned: ['w28'], eq: eq({ w: 'w28' }) } }), 0)
})

test('ยอดที่กรอก: ทศนิยมไม่เกิน 2 ตำแหน่ง ไม่มีขั้นต่ำ แต่ต้องมากกว่า 0', () => {
  assert.equal(parseBaht('50.67'), '50.67')
  assert.equal(parseBaht('1,000.5'), '1000.50')
  assert.equal(parseBaht(' 20 บาท'), '20.00')
  assert.equal(parseBaht('0.01'), '0.01')
  assert.equal(parseBaht('0'), null)
  assert.equal(parseBaht('abc'), null)
  assert.equal(parseBaht('5.678'), null)
})

test('จดหมายแนบชิ้นอวาตาร์ → กดรับได้ · id ที่ไม่มีถูกตัดทิ้ง', () => {
  const m = buildBroadcastMail({ title: 't', doll: ['t20', 'nope'] }, 0)
  assert.deepEqual(rewardDoll(m), ['t20'])
  assert.equal(canClaim(m), true)
  assert.equal(canClaim(buildBroadcastMail({ title: 't', doll: [] }, 0)), false)
})
