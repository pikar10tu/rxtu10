import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { drugTerms, textHasTerm, drugsInText, searchAll } from './searchIndex.js'
import { DRUG_AKA } from '../data/drugAka.js'

const db = JSON.parse(fs.readFileSync('src/data/drugDb.json', 'utf8'))
const drugs = db.map(d => ({ id: d.id, n: d.name, cls: d.cls, g: d.group, terms: drugTerms(d, DRUG_AKA[d.id]) }))

test('กันลืม: ยาทุกตัวใน drugDb.json มีคำค้น และค้นด้วยชื่อหลักเจอ', () => {
  const index = { drugs, cases: [], sums: [] }
  for (const d of drugs) {
    assert.ok(d.terms.length, `${d.id} ไม่มีคำค้น`)
    const main = d.n.replace(/\(.*?\)/g, '').trim()
    assert.ok(searchAll(index, main).drugs.some(x => x.id === d.id), `ค้น "${main}" ไม่เจอ ${d.id}`)
  }
})

test('aka อ้าง id ที่มีอยู่จริง', () => {
  for (const id of Object.keys(DRUG_AKA)) assert.ok(db.some(d => d.id === id), `drugAka: ไม่มี ${id} ใน drugDb.json`)
})

test('ดัชนีที่ build แล้วมียาครบ (ถ้ามีไฟล์)', { skip: !fs.existsSync('public/search-index.json') }, () => {
  const idx = JSON.parse(fs.readFileSync('public/search-index.json', 'utf8'))
  const have = new Set(idx.drugs.map(d => d.id))
  for (const d of db) assert.ok(have.has(d.id), `${d.id} ไม่อยู่ในดัชนี — รัน npm run build ใหม่`)
})

test('drugTerms ดึงชื่อในวงเล็บแบบละติน ข้ามภาษาไทย/U-100', () => {
  assert.deepEqual(drugTerms({ name: 'Cephalexin (Cefalexin)' }), ['cephalexin', 'cefalexin'])
  assert.deepEqual(drugTerms({ name: 'Aspirin (ขนาดต่ำ)' }), ['aspirin'])
  assert.deepEqual(drugTerms({ name: 'Insulin glargine (U-100)' }), ['insulin glargine'])
})

test('textHasTerm ตรงทั้งคำ', () => {
  assert.ok(textHasTerm('ให้ Warfarin 3 mg', 'warfarin'))
  assert.ok(!textHasTerm('amoxicillinx', 'amoxicillin'))
  assert.ok(textHasTerm('Amoxicillin/clavulanate 1 g', 'amoxicillin/clavulanate'))
  assert.deepEqual(drugsInText('ได้รับ Amlodipine และ metformin', drugs.filter(d => ['amlodipine', 'metformin', 'warfarin'].includes(d.id))), ['amlodipine', 'metformin'])
})
