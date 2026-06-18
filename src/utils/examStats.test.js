// เทส aggregateExamStats — สรุปประวัติข้อสอบ (latest/trend/byDomain), data-driven DOMAIN_KEYS
// รัน: node --test src/utils/examStats.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aggregateExamStats } from './examStats.js'
import { DOMAIN_KEYS } from '../data/domains.js'

test('ว่าง → count 0, latest null, trend [], byDomain ครบ key เป็น 0', () => {
  const r = aggregateExamStats([])
  assert.equal(r.count, 0)
  assert.equal(r.latest, null)
  assert.deepEqual(r.trend, [])
  assert.deepEqual(Object.keys(r.byDomain).sort(), [...DOMAIN_KEYS].sort())
  assert.deepEqual(r.byDomain.care, { c: 0, t: 0, pct: 0 })
})

test('latest = session ใหม่สุด (index 0)', () => {
  const r = aggregateExamStats([
    { correct: 9, total: 10, pct: 90 },
    { correct: 5, total: 10, pct: 50 },
  ])
  assert.deepEqual(r.latest, { correct: 9, total: 10, pct: 90 })
  assert.equal(r.count, 2)
})

test('trend เรียงเก่า→ใหม่ (กลับลำดับ input)', () => {
  const r = aggregateExamStats([
    { correct: 9, total: 10, pct: 90 },  // ใหม่สุด
    { correct: 5, total: 10, pct: 50 },  // เก่ากว่า
  ])
  assert.deepEqual(r.trend, [50, 90])
})

test('pct หาย → คำนวณจาก correct/total', () => {
  const r = aggregateExamStats([{ correct: 1, total: 4 }])
  assert.deepEqual(r.trend, [25])
  assert.equal(r.latest.pct, 25)
})

test('byDomain รวมทุก session + pct ต่อ domain', () => {
  const r = aggregateExamStats([
    { correct: 2, total: 4, domainStats: { care: { c: 2, t: 2 }, sci: { c: 0, t: 2 } } },
    { correct: 1, total: 2, domainStats: { care: { c: 1, t: 2 } } },
  ])
  assert.deepEqual(r.byDomain.care, { c: 3, t: 4, pct: 75 })
  assert.deepEqual(r.byDomain.sci,  { c: 0, t: 2, pct: 0 })
  assert.deepEqual(r.byDomain.law,  { c: 0, t: 0, pct: 0 })
})

test('ทน session เก่าที่ไม่มี domainStats / มี key แปลกปลอม (ไม่ throw, ไม่นับ key แปลก)', () => {
  const r = aggregateExamStats([
    { correct: 1, total: 2 },                                  // ไม่มี domainStats
    { correct: 0, total: 1, domainStats: { zzz: { c: 0, t: 1 }, none: { c: 0, t: 1 } } },
  ])
  assert.deepEqual(Object.keys(r.byDomain).sort(), [...DOMAIN_KEYS].sort())  // ไม่มี zzz/none
  assert.deepEqual(r.byDomain.care, { c: 0, t: 0, pct: 0 })
})
