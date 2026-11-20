import test from 'node:test'
import assert from 'node:assert/strict'
import { ARCS, SHORTS, marketOf, arcIdOf, marketDayNo, EPOCH_DAY, boostPct, boosted, newsMsg, newsDocId } from './farmMarket.js'
import { CROPS, getCrop } from './crops.js'

const nameOf = (id) => getCrop(id)?.name || id
const IDS = new Set(CROPS.map(c => c.id))

test('ทุกช่องพืชในทุกเรื่องเป็นพืชที่มีจริง', () => {
  for (const a of ARCS) for (const [slot, list] of Object.entries(a.crops)) {
    assert.ok(list.length, `${a.id}.${slot} ว่าง`)
    for (const id of list) assert.ok(IDS.has(id), `${a.id}.${slot}: ${id} ไม่มีใน crops.js`)
  }
})

test('ใช้ {b} ได้เฉพาะเรื่องที่มีช่อง b', () => {
  for (const a of ARCS) for (const s of a.steps) {
    const usesB = [s.head, s.body, s.tease].some(t => t.includes('{b}')) || s.boost.some(([k]) => k === 'b')
    if (usesB) assert.ok(a.crops.b, `${a.id} ใช้ {b} แต่ไม่มีช่อง b`)
  }
})

test('ข่าวสั้นห้ามอ้างสรรพคุณ (ใช้กับพืชไหนก็ได้)', () => {
  for (const [, t] of SHORTS) assert.ok(!/บรรเทา|รักษา|แก้|ยา/.test(t), t)
})

test('คำใบ้วันนี้ = ข่าวพรุ่งนี้ · ทุกวันมีพืชขึ้นราคา · ข้อความไม่มี {', () => {
  for (let d = EPOCH_DAY; d < EPOCH_DAY + 400; d++) {
    const m = marketOf(d, nameOf)
    assert.ok(m.boosts.length >= 1, `วัน ${d} ไม่มีของขึ้นราคา`)
    for (const b of m.boosts) { assert.ok(IDS.has(b.id)); assert.ok(b.pct >= 20 && b.pct <= 100) }
    assert.ok(!/[{}]/.test(m.head + m.body + m.tease), `วัน ${d} มีช่องว่างค้าง`)
    assert.ok(newsMsg(m, nameOf).length <= 140)
    assert.equal(marketOf(d, nameOf).head, m.head, 'สุ่มซ้ำต้องได้เหมือนเดิม')
  }
})

test('พืชในข่าวกับพืชที่ขึ้นราคาตรงกัน (ชื่อในหัวข่าว/ข่าวสั้นต้องเป็นตัวที่ได้บูสต์)', () => {
  for (let d = EPOCH_DAY; d < EPOCH_DAY + 200; d++) {
    const m = marketOf(d, nameOf)
    const text = m.head + m.body + (m.short || '')
    for (const b of m.boosts) assert.ok(text.includes(nameOf(b.id)), `วัน ${d}: ${nameOf(b.id)} ขึ้นราคาแต่ข่าวไม่พูดถึง`)
  }
})

test('เรื่องเดียวกันไม่ซ้ำภายใน 10 เรื่องติดกัน', () => {
  const ids = []
  for (let d = EPOCH_DAY; d < EPOCH_DAY + 300; d++) if (marketOf(d, nameOf).part === 1) ids.push(arcIdOf(d))
  assert.ok(ids.length > 50)
  for (let i = 0; i < ids.length; i++) {
    const win = ids.slice(Math.max(0, i - 10), i)
    assert.ok(!win.includes(ids[i]), `เรื่อง ${ids[i]} ซ้ำเร็วเกินที่ลำดับ ${i}`)
  }
})

// ข่าวที่ออกไปแล้วห้ามเปลี่ยนตอนเพิ่มเรื่อง/พืช (ดู since ใน farmMarket.js) — เพิ่มบรรทัดวันใหม่ได้เรื่อยๆ
test('ไทม์ไลน์ที่ประกาศไปแล้วไม่เปลี่ยน', () => {
  const m21 = marketOf(20778, nameOf), m22 = marketOf(20779, nameOf)
  assert.equal(m21.head, 'พ่อค้าส่งออกต่างชาติบินมาเหมามะขามแขกถึงหน้าสวน')
  assert.deepEqual(m21.boosts, [{ id: 'melon', pct: 60 }])
  assert.equal(m21.tease, 'พยากรณ์บอกฝนหลงฤดูกำลังมา แหล่งปลูกกระเจี๊ยบแดงอยู่ในเส้นทางพอดี')
  assert.equal(m22.head, 'ฝนหลงฤดูถล่มแหล่งปลูกกระเจี๊ยบแดงและชุมเห็ดเทศ')
  assert.deepEqual(m22.boosts, [{ id: 'mushroom', pct: 50 }, { id: 'eggplant', pct: 40 }])
})

test('ราคา/วัน/ไอดีข่าว', () => {
  assert.equal(boosted(1000, 60), 1600)
  assert.equal(boostPct('x', { boosts: [{ id: 'x', pct: 40 }] }), 40)
  assert.equal(boostPct('y', { boosts: [{ id: 'x', pct: 40 }] }), 0)
  // 23:59 ไทย กับ 00:01 ไทยคนละวัน
  const before = Date.UTC(2026, 10, 21, 16, 59), after = Date.UTC(2026, 10, 21, 17, 1)
  assert.equal(marketDayNo(after) - marketDayNo(before), 1)
  assert.equal(newsDocId(after), 'farm-2026-11-22')
})
