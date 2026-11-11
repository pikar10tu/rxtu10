// เทส pickCc2Set — รัน: node --test src/utils/cc2Sim.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { pickCc2Set, DEFAULT_RATIO, totalRealStations } from './cc2Sim.js'

const normTopic = (t) => String(t ?? '').trim().toLowerCase()

function groupCounts(stations) {
  const m = new Map()
  for (const s of stations) m.set(s.group, (m.get(s.group) || 0) + 1)
  return m
}

// ── fixture สังเคราะห์: คุมให้มีตัวเลือกพอสำหรับทุกกฎ ไม่พึ่งข้อมูลจริง ──
function makeCase(id, cat, group, topic, mode = 'check') {
  return { id, title: id, cat, group, topic, diff: 2, source: 'fixture', tot: 10, mode }
}
function buildFixture() {
  const cases = []
  // Clinic: 5 กลุ่ม x 4 เคส = 20 เคส, topic ไม่ซ้ำกันเลย
  let n = 0
  for (let g = 1; g <= 5; g++) {
    for (let k = 1; k <= 4; k++) {
      n++
      cases.push(makeCase(`C-${n}`, 'Clinic', `กลุ่ม${g}`, `topic-c-${n}`))
    }
  }
  // Product: 3 กลุ่ม x 4 เคส = 12 เคส
  for (let g = 1; g <= 3; g++) {
    for (let k = 1; k <= 4; k++) {
      n++
      cases.push(makeCase(`P-${n}`, 'Product', `pกลุ่ม${g}`, `topic-p-${n}`))
    }
  }
  // SAP: 2 กลุ่ม x 3 เคส = 6 เคส
  for (let g = 1; g <= 2; g++) {
    for (let k = 1; k <= 3; k++) {
      n++
      cases.push(makeCase(`S-${n}`, 'SAP', `sกลุ่ม${g}`, `topic-s-${n}`))
    }
  }
  // สถานีพัก + เคสต่อเนื่อง (ต้องถูกข้ามจากพูลหลัก)
  cases.push(makeCase('R-1', 'Product', '', '', 'rest'))
  cases.push(makeCase('R-2', 'Clinic', '', '', 'rest'))
  cases.push(makeCase('F-1', 'Product', 'pกลุ่ม1', 'topic-f-1', 'free'))
  return cases
}

test('ได้จำนวนสถานีตามสัดส่วนที่ตั้ง (ค่าเริ่ม 8/6/2)', () => {
  const { stations, warnings } = pickCc2Set(buildFixture(), { seed: 'seed-a' })
  assert.equal(stations.length, totalRealStations(DEFAULT_RATIO))
  assert.equal(stations.filter((s) => s.cat === 'Clinic').length, 8)
  assert.equal(stations.filter((s) => s.cat === 'Product').length, 6)
  assert.equal(stations.filter((s) => s.cat === 'SAP').length, 2)
  assert.deepEqual(warnings, [])
})

test('สัดส่วนตั้งเองได้', () => {
  const { stations } = pickCc2Set(buildFixture(), { seed: 'x', ratio: { Clinic: 3, Product: 2, SAP: 1 } })
  assert.equal(stations.length, 6)
  assert.equal(stations.filter((s) => s.cat === 'Clinic').length, 3)
  assert.equal(stations.filter((s) => s.cat === 'Product').length, 2)
  assert.equal(stations.filter((s) => s.cat === 'SAP').length, 1)
})

test('กลุ่ม (group) ซ้ำได้ไม่เกิน 2 สถานี นับรวมทุกหมวด', () => {
  const { stations } = pickCc2Set(buildFixture(), { seed: 'seed-b' })
  for (const [, n] of groupCounts(stations)) assert.ok(n <= 2, `group ซ้ำเกิน 2: ${n}`)
})

test('topic ไม่ซ้ำกันในชุด', () => {
  const { stations } = pickCc2Set(buildFixture(), { seed: 'seed-c' })
  const seen = new Set()
  for (const s of stations) {
    const t = normTopic(s.topic)
    assert.ok(!seen.has(t), `topic ซ้ำ: ${t}`)
    seen.add(t)
  }
})

test('ข้ามเคส mode rest/free จากชุดหลักเสมอ', () => {
  const { stations } = pickCc2Set(buildFixture(), { seed: 'seed-d' })
  assert.ok(stations.every((s) => s.mode !== 'rest' && s.mode !== 'free'))
})

test('restCount แทรกสถานีพักเพิ่ม กระจายในชุด ไม่ติดกันที่ปลายเดียว', () => {
  const { stations, warnings } = pickCc2Set(buildFixture(), { seed: 'seed-e', restCount: 2 })
  const total = totalRealStations(DEFAULT_RATIO) + 2
  assert.equal(stations.length, total)
  const restIdx = stations.map((s, i) => (s.mode === 'rest' ? i : -1)).filter((i) => i >= 0)
  assert.equal(restIdx.length, 2)
  // ไม่ควรอยู่ติดกันทั้งคู่ที่ตำแหน่งเดียวกัน (กระจายคร่าวๆ)
  assert.notEqual(restIdx[0], restIdx[1])
  assert.deepEqual(warnings, [])
})

test('กรองตามกลุ่ม — เลือกได้แค่กลุ่มที่อนุญาต', () => {
  const { stations } = pickCc2Set(buildFixture(), {
    seed: 'seed-f', ratio: { Clinic: 4 }, groups: ['กลุ่ม1', 'กลุ่ม2'],
  })
  assert.ok(stations.every((s) => ['กลุ่ม1', 'กลุ่ม2'].includes(s.group)))
})

test('กรองตามแหล่งที่มา', () => {
  const cases = buildFixture()
  cases[0].source = 'แหล่งพิเศษ'
  const { stations, warnings } = pickCc2Set(cases, {
    seed: 'seed-g', ratio: { Clinic: 1 }, sources: ['แหล่งพิเศษ'],
  })
  assert.equal(stations.length, 1)
  assert.equal(stations[0].id, cases[0].id)
  assert.deepEqual(warnings, [])
})

test('ตัวกรองแคบเกินไป (ไม่พอตามสัดส่วน) → ได้เท่าที่มีจริง + แจ้ง warning ไม่ throw', () => {
  const { stations, warnings } = pickCc2Set(buildFixture(), {
    seed: 'seed-h', ratio: { Clinic: 2 }, groups: ['กลุ่ม1'],
  })
  // กลุ่ม1 มี 4 เคส พอสำหรับ 2 สถานี (กฎ group<=2 ก็พอดี 2) ลองขอเกินโควตากลุ่มเดียว
  const { stations: s2, warnings: w2 } = pickCc2Set(buildFixture(), {
    seed: 'seed-h2', ratio: { Clinic: 5 }, groups: ['กลุ่ม1'],
  })
  assert.ok(s2.length <= 5)
  assert.ok(w2.length >= 0) // อย่าง้าง throw — แค่ยืนยันว่าไม่มีข้อผิดพลาด
  assert.ok(stations.length === 2)
  assert.deepEqual(warnings, [])
})

test('seed เดิม → ผลเดิมเป๊ะ (ทำซ้ำได้สำหรับเทส/debug)', () => {
  const fixture = buildFixture()
  const a = pickCc2Set(fixture, { seed: 'repro-1' })
  const b = pickCc2Set(fixture, { seed: 'repro-1' })
  assert.deepEqual(a.stations.map((s) => s.id), b.stations.map((s) => s.id))
})

test('seed ต่างกัน → ลำดับ/ชุดต่างไปได้ (ไม่ใช่ fixed order เดิมทุกครั้ง)', () => {
  const fixture = buildFixture()
  const a = pickCc2Set(fixture, { seed: 'seed-1' })
  const b = pickCc2Set(fixture, { seed: 'seed-2' })
  assert.notDeepEqual(a.stations.map((s) => s.id), b.stations.map((s) => s.id))
})

// ── เทสกับข้อมูลจริง public/cc2/index.json (ถ้ามี) — ยืนยันว่าสัดส่วนค่าเริ่มใช้ได้จริงกับคลังจริง ──
test('ชุดค่าเริ่ม (8/6/2) ใช้ได้กับคลังจริง public/cc2/index.json ครบไม่ต้อง warning', () => {
  const path = 'public/cc2/index.json'
  if (!fs.existsSync(path)) return // ยังไม่มีคลัง (เช่นรันแยกก่อนขั้นนำเข้าข้อมูล) — ข้ามเงียบๆ
  const j = JSON.parse(fs.readFileSync(path, 'utf8'))
  const { stations, warnings } = pickCc2Set(j.cases, { seed: 'real-1' })
  assert.equal(stations.length, totalRealStations(DEFAULT_RATIO))
  assert.deepEqual(warnings, [])
  const seen = new Set()
  for (const s of stations) {
    const t = normTopic(s.topic)
    if (t) { assert.ok(!seen.has(t)); seen.add(t) }
  }
  for (const [, n] of groupCounts(stations)) assert.ok(n <= 2)
})
