// node --test src/utils/dollRender.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { compose, render, renderThumb, hiddenSlots, ORDER, mix, OUTLINE_DARK, OUTLINE_MIX } from './dollRender.js'
import { HAIRC, W, H, PAD, XM, ANCH, PARTS, PART, OUTFITS, SLOTS } from '../data/dollParts.js'

const BASE_EQ = { s: 's2', c: 'c1', h: 'h1', e: 'e1', m: 'm1' }

test('ขนาดกรอบ: compose 40x44 · render กว้างขึ้นข้างละ XM', () => {
  const g = compose(BASE_EQ)
  assert.equal(g.length, H); assert.equal(g[0].length, W)
  const r = render(BASE_EQ)
  assert.equal(r.w, W + XM * 2 + PAD * 2); assert.equal(r.h, H + PAD * 2)
})

test('id ชิ้นไม่ซ้ำ และทุกชิ้นอยู่ในช่องที่มีจริง', () => {
  const ids = PARTS.map(p => p.id)
  assert.equal(new Set(ids).size, ids.length)
  const slots = new Set(SLOTS.map(s => s.k))
  for (const p of PARTS) assert.ok(slots.has(p.slot), `${p.id} ช่อง ${p.slot} ไม่มีใน SLOTS`)
})

test('ทุกชุดตัวอย่างอ้างชิ้นที่มีจริง', () => {
  for (const o of OUTFITS) for (const [k, id] of Object.entries(o.eq)) {
    if (k === 's' || k === 'c') continue
    assert.ok(PART[id], `${o.name}: ไม่มีชิ้น ${id}`)
  }
})

test('ตัวฐานสมมาตรซ้ายขวา', () => {
  const g = compose(BASE_EQ)
  for (let y = 16; y < H; y++) for (let x = 0; x < W; x++) {   // ข้ามหน้า/ผม (ตา ปาก ไฮไลต์ผมไม่สมมาตร)
    assert.equal(!!g[y][x], !!g[y][W - 1 - x], `ไม่สมมาตรที่ (${x},${y})`)
  }
})

test('ใส่ทีละชิ้นบนตัวฐานไม่พัง และไม่มีพิกเซลหลุดกรอบ', () => {
  for (const p of PARTS) {
    const g = compose({ ...BASE_EQ, [p.slot]: p.id })
    assert.equal(g.length, H, p.id)
    assert.ok(g.every(r => r.length === W), p.id)
  }
})

test('ชุดเต็มตัวกินช่องท่อนล่าง แต่ไม่ลบค่า eq.b', () => {
  const eq = { ...BASE_EQ, t: 'f1', b: 'b1' }
  assert.ok(hiddenSlots(eq).has('b'))
  const withB = compose(eq), withoutB = compose({ ...BASE_EQ, t: 'f1' })
  assert.deepEqual(withB, withoutB)
  assert.equal(eq.b, 'b1')
})

test('แบบ B: มือยาวลงถึงแถว 27 · กระโปรงวาดทับมือ (เลเยอร์)', () => {
  const g = compose(BASE_EQ)
  assert.ok(g[27][12] && g[27][13], 'มือควรอยู่ที่แถว 27')
  const skirt = compose({ ...BASE_EQ, b: 'b8' })    // กระโปรงยาว x=12..19 แถว 33+
  const longSkirt = PART.b8
  assert.ok(longSkirt)
  assert.ok(ORDER.indexOf('base') < ORDER.indexOf('b') && ORDER.indexOf('base') < ORDER.indexOf('t'))
  assert.ok(skirt[28][13], 'กระโปรงต้องปิดตรงที่แขนเคยว่าง')
})

test('ไหล่มน: มุมบนนอกสุดของไหล่ว่าง (เสื้อยืด)', () => {
  const g = compose({ ...BASE_EQ, t: 't1' })
  assert.equal(g[18][12], null); assert.equal(g[18][W - 13], null)
  assert.ok(g[19][12], 'ใต้มุมยังเป็นแขน')
})

test('มีของชิดไหล่ข้างนอก → ไม่ตัดมุมไหล่', () => {
  // ปีกสติกเกอร์ทดสอบ: แถบ 3x3 ชิดไหล่ซ้าย (x 9–11 · y 17–19) — ไม่พึ่งรูปทรงปีกจริงที่เปลี่ยนได้
  PART.__wt = { id: '__wt', slot: 'w', st: { at: 'back', ax: ANCH.back[0] - 9, ay: ANCH.back[1] - 17, w: 3, h: 3, mir: true, L: { back: ['GGG', 'GGG', 'GGG'] } } }
  try {
    const g = compose({ ...BASE_EQ, t: 't1', w: '__wt' })
    assert.ok(g[18][11], 'ของทดสอบต้องชิดไหล่')
    assert.ok(g[18][12], 'มีของอยู่ข้างนอก → ไม่ตัด')
  } finally { delete PART.__wt }
})

test('แยกแขนกับลำตัวเมื่อสีเดียวกัน', () => {
  const g = compose({ ...BASE_EQ, t: 't6' })    // ฮู้ดแขนยาว สีเดียวทั้งตัว
  for (let y = 19; y <= 24; y++) assert.notEqual(g[y][13], g[y][14], `แถว ${y} แขนกับลำตัวกลืนกัน`)
})

test('ไม่มีขอบ (user 19 พ.ย.): ขอบใสรอบตัวว่าง · ขนาดกรอบเท่าเดิม', () => {
  const r = render(BASE_EQ)
  for (let y = 0; y < PAD; y++) assert.ok(r.px[y].every(v => !v), 'แถวบนว่าง')
  assert.equal(r.px.flat().filter(Boolean).length, compose(BASE_EQ).flat().filter(Boolean).length, 'พิกเซลเท่าตัวจริง ไม่มีขอบงอก')
})

test('ผลซ้ำได้ (deterministic)', () => {
  for (const o of OUTFITS) assert.deepEqual(render(o.eq), render(o.eq))
})

test('รูปย่อ: ทุกชิ้นวาดได้ ไม่ว่าง และเล็กกว่าตัวเต็ม', () => {
  const full = render(BASE_EQ)
  for (const p of PARTS) {
    const t = renderThumb(p.id, BASE_EQ)
    assert.ok(t.px.flat().some(Boolean), `${p.id} รูปย่อว่าง`)
    assert.ok(t.w <= full.w && t.h <= full.h, `${p.id} รูปย่อใหญ่เกินตัว`)
  }
})
