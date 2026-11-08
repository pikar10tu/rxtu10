import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cardRefs, resolveLine, resolveIndRow, resolvePkRow } from './drugCard.js'

const v2 = { name: 'Warfarin', refs: [
  { id: 'fda', title: 'FDA', url: 'https://a' },
  { id: 'nlem', title: 'NLEM', url: 'https://b' },
] }

test('บรรทัด string ไม่มีอ้างอิง', () => {
  assert.deepEqual(resolveLine('x', cardRefs(v2)), { t: 'x', refs: [] })
})

test('โทเค็นมีหัวข้อ → [n §sec] และลำดับตาม refs', () => {
  const r = resolveLine({ t: 'y', r: ['nlem', 'fda:5.2'] }, cardRefs(v2)).refs
  assert.deepEqual(r.map(x => x.label), ['2', '1 §5.2'])
  assert.equal(r[1].url, 'https://a')
})

test('โทเค็นที่ไม่มีใน refs ถูกทิ้ง', () => {
  assert.equal(resolveLine({ t: 'z', r: ['nope:1'] }, cardRefs(v2)).refs.length, 0)
})

test('การ์ด v1 ได้ ref fda จาก src.set', () => {
  const refs = cardRefs({ name: 'Amlodipine', src: { set: 'abc', lab: 'Pfizer', date: '2024' } })
  assert.equal(refs[0].id, 'fda')
  assert.match(refs[0].url, /setid=abc$/)
})

test('แถวตาราง v1 กับ v2', () => {
  const refs = cardRefs(v2)
  assert.deepEqual(resolveIndRow(['a', 'b'], refs), { i: 'a', d: 'b', refs: [] })
  assert.equal(resolveIndRow({ i: 'a', d: 'b', r: ['fda:2'] }, refs).refs[0].label, '1 §2')
  assert.equal(resolvePkRow(['t½', '40 ชม.', ['fda:12.3']], refs).refs[0].label, '1 §12.3')
})
