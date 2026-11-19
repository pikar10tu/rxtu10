// node --test src/utils/dollCode.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { encodeDoll, decodeDoll } from './dollCode.js'
import { DEFAULT_EQ, OUTFITS, SKINS, HAIRC, PARTS, REQUIRED } from '../data/dollParts.js'

test('id ทั้งระบบไม่ซ้ำ (สีผิว สีผม ชิ้นส่วน) — ถอดรหัสได้โดยไม่ต้องรู้ช่อง', () => {
  const ids = [...SKINS.map(s => s.id), ...HAIRC.map(c => c.id), ...PARTS.map(p => p.id)]
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.ok(!id.includes('.'), id)
})

test('เข้า-ออกรหัสได้ชุดเดิม (ชุดตัวอย่างทุกชุด)', () => {
  for (const o of OUTFITS) {
    const eq = { ...o.eq }
    const want = { ...eq }
    for (const k of REQUIRED) if (!want[k]) want[k] = DEFAULT_EQ[k]
    assert.deepEqual(decodeDoll(encodeDoll(eq)), want, o.name)
  }
})

test('รหัสสั้น · ว่าง/เพี้ยน = ชุดเริ่มต้น · id ที่ไม่มีแล้วถูกข้าม', () => {
  for (const o of OUTFITS) assert.ok(encodeDoll(o.eq).length <= 80, o.name)
  assert.deepEqual(decodeDoll(''), DEFAULT_EQ)
  assert.deepEqual(decodeDoll(null), DEFAULT_EQ)
  const req = Object.fromEntries(REQUIRED.map(k => [k, DEFAULT_EQ[k]]))
  assert.deepEqual(decodeDoll('zz9.h2'), { ...req, h: 'h2' })
  assert.equal(decodeDoll('s2.c1.h1.e1.m1.t1.b2').j, undefined)   // ถอดแก้มไว้ = ไม่เติมแก้มกลับ
  assert.equal(encodeDoll({ t: 'h1' }), '')   // id ผิดช่อง ไม่เข้ารหัส
})
