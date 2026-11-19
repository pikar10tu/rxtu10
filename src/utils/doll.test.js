// node --test src/utils/doll.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { dollOf, tryOn, cartFor, canBuyCart, afterBuyCart, afterEquip, sameEq, isFree } from './doll.js'
import { PART, PARTS, DEFAULT_EQ, FREE } from '../data/dollParts.js'

test('คนยังไม่เคยแต่ง = ชุดเริ่มต้นฟรี', () => {
  const d = dollOf({})
  assert.deepEqual(d.owned, [])
  assert.deepEqual(d.eq, DEFAULT_EQ)
  for (const id of Object.values(d.eq)) if (PART[id]) assert.ok(isFree(id), id)
})

test('ของฟรี: ลักษณะตัวละคร (ตา ปาก หนวด) ฟรีหมด · ทรงผมฟรีแค่ 3 · ชุดเริ่มต้น เสื้อ 2 ท่อนล่าง 2 รองเท้า 1', () => {
  const by = (s) => [...FREE].filter(id => PART[id]?.slot === s).length
  const all = (s) => PARTS.filter(p => p.slot === s).length
  assert.deepEqual([by('e'), by('m'), by('f'), by('j')], [all('e'), all('m'), all('f'), all('j')])
  assert.deepEqual([by('h'), by('t'), by('b'), by('k')], [3, 2, 2, 1])
  assert.ok(FREE.has('t5'), 'เชิ้ตนักศึกษาต้องฟรี')
})

test('ทุกชิ้นมีราคา · ชิ้นไม่ฟรีราคา > 0', () => {
  for (const p of PARTS) {
    assert.equal(typeof p.price, 'number', p.id)
    if (!FREE.has(p.id)) assert.ok(p.price > 0, p.id)
  }
})

test('dollOf ทิ้งของที่ไม่มี/ไม่รู้จัก/ใส่ผิดช่อง', () => {
  const d = dollOf({ doll: { owned: ['x1', 'zzz'], eq: { s: 'bad', c: 'c3', h: 'h6', x: 'x1', t: 'b1', i: 'i1' } } })
  assert.deepEqual(d.owned, ['x1'])
  assert.equal(d.eq.s, DEFAULT_EQ.s)      // สีผิวไม่รู้จัก → ค่าเริ่มต้น
  assert.equal(d.eq.c, 'c3')              // สีผมฟรีทุกสี
  assert.equal(d.eq.h, DEFAULT_EQ.h)      // h6 ไม่ได้ซื้อ → กลับเป็นผมเริ่มต้น
  assert.equal(d.eq.x, 'x1')              // ซื้อแล้ว ใส่ได้
  assert.equal(d.eq.t, DEFAULT_EQ.t)      // ใส่กางเกงในช่องเสื้อ → ไม่ได้
  assert.equal(d.eq.i, undefined)         // ช่องไม่บังคับ ไม่มีของ → ว่าง
})

test('ลองใส่: ถอดช่องบังคับไม่ได้ · ถอดหมวกได้', () => {
  const eq = { ...DEFAULT_EQ, x: 'x1' }
  assert.equal(tryOn(eq, 't', null).t, eq.t)
  assert.equal(tryOn(eq, 'x', null).x, undefined)
})

test('ลองท่อนล่างขณะใส่ชุดเต็มตัว → ถอดชุดกลับเสื้อเริ่มต้น', () => {
  const eq = { ...DEFAULT_EQ, t: 'f1' }
  const next = tryOn(eq, 'b', 'b8')
  assert.equal(next.t, DEFAULT_EQ.t); assert.equal(next.b, 'b8')
})

test('ตะกร้า: นับเฉพาะชิ้นที่ยังไม่มีและไม่ฟรี · ชุดเต็มตัวไม่คิดเงินท่อนล่างที่ถูกบัง', () => {
  const u = { coins: 0, doll: { owned: ['x1'], eq: DEFAULT_EQ } }
  const eq = { ...DEFAULT_EQ, x: 'x1', a: 'a1', t: 'f1', b: 'b8' }
  const { items, total } = cartFor(u, eq)
  assert.deepEqual(items.map(p => p.id).sort(), ['a1', 'f1'])
  assert.equal(total, PART.a1.price + PART.f1.price)
})

test('ซื้อทั้งชุด: เหรียญไม่พอ / ไม่มีอะไรต้องซื้อ / พอ', () => {
  const eq = { ...DEFAULT_EQ, x: 'x2' }
  assert.equal(canBuyCart({ coins: 0 }, eq).reason, 'coins')
  assert.equal(canBuyCart({ coins: 0 }, DEFAULT_EQ).reason, 'none')
  const ok = canBuyCart({ coins: 10_000_000 }, eq)
  assert.ok(ok.ok); assert.equal(ok.total, PART.x2.price)
})

test('หลังซื้อ: ได้ของ + ใส่ทันที · ไม่ซ้ำของเดิม', () => {
  const u = { coins: 1e9, doll: { owned: ['x1'], eq: DEFAULT_EQ } }
  const eq = { ...DEFAULT_EQ, x: 'x1', i: 'i1', w: 'w1' }
  const next = afterBuyCart(u, eq)
  assert.deepEqual(next.owned.sort(), ['i1', 'w1', 'x1'])
  assert.equal(next.eq.w, 'w1'); assert.equal(next.eq.i, 'i1')
})

test('ใส่ชุดได้เฉพาะเมื่อมีครบ', () => {
  const u = { doll: { owned: ['x1'], eq: DEFAULT_EQ } }
  assert.equal(afterEquip(u, { ...DEFAULT_EQ, x: 'x1' }).eq.x, 'x1')
  assert.equal(afterEquip(u, { ...DEFAULT_EQ, x: 'x2' }).eq.x, undefined)
})

test('sameEq', () => {
  assert.ok(sameEq(DEFAULT_EQ, { ...DEFAULT_EQ }))
  assert.ok(!sameEq(DEFAULT_EQ, { ...DEFAULT_EQ, x: 'x1' }))
})

test('ออร่า: ไม่มีของแพง = ว่าง · หลายชิ้นได้ครบทุกอัน แพงสุดก่อน', async () => {
  const { aurasOf } = await import('./doll.js')
  const { PART } = await import('../data/dollParts.js')
  assert.deepEqual(aurasOf({ s: 's2', c: 'c1', h: 'h1', t: 't1' }), [])
  const a = aurasOf({ s: 's2', c: 'c1', t: 'f3', w: 'w5' })
  assert.equal(a.length, 2)
  assert.deepEqual(a[0], PART.w5.aura)   // ปีกมังกรแพงกว่าชุดนางฟ้า
})

test('ลักษณะตัวละครกับแต่งตัวแยกกันครบทุกช่อง ไม่ซ้ำ', async () => {
  const { LOOK_SLOTS, WEAR_SLOTS, SLOTS } = await import('../data/dollParts.js')
  const all = [...LOOK_SLOTS, ...WEAR_SLOTS]
  assert.equal(new Set(all).size, all.length)
  for (const s of SLOTS) assert.ok(all.includes(s.k), `ช่อง ${s.k} ไม่อยู่หมวดไหนเลย`)
})

test('ของแพง (≥300k) ทุกชิ้นมีออร่า — กันออร่าหลุดเงียบ (เคยโดนคอมเมนต์กินบรรทัด 19 พ.ย.)', () => {
  const miss = PARTS.filter(p => p.price >= 300000 && !p.aura).map(p => p.id)
  assert.deepEqual(miss, [])
})

test('โบนัสครบเซ็ต: ชุดสัตว์+ฮู้ดคู่ ได้ออร่าเพิ่ม · ใส่ชิ้นเดียวไม่ได้', async () => {
  const { aurasOf, setsWorn } = await import('./doll.js')
  const { SETS } = await import('../data/dollParts.js')
  for (const set of SETS) {
    const eq = { s: 's2', c: 'c1' }
    for (const id of set.parts) eq[PART[id].slot] = id
    assert.ok(aurasOf(eq).includes(set.aura), set.id)
    assert.equal(setsWorn(eq)[0]?.id, set.id)
    const half = { ...eq }; delete half[PART[set.parts[1]].slot]
    assert.ok(!aurasOf(half).includes(set.aura), set.id + ' ครึ่งเซ็ต')
  }
})

test('ออร่าทุกชิ้นใช้แบบที่ตัววาดรู้จัก', async () => {
  const { AURA_TYPES } = await import('./dollAura.js')
  const { SETS } = await import('../data/dollParts.js')
  for (const a of [...PARTS.map(p => p.aura).filter(Boolean), ...SETS.map(s => s.aura)]) assert.ok(AURA_TYPES[a.type], a.type)
})
