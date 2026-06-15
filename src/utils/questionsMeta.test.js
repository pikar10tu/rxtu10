// เทส buildMeta — สรุป { publishedTotal, categories } จากรายการข้อสอบ (นับเฉพาะ isPublished)
// รัน: node --test src/utils/questionsMeta.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildMeta } from './questionsMeta.js'

test('นับเฉพาะข้อที่ isPublished', () => {
  const m = buildMeta([
    { isPublished: true, category: 'ยา' },
    { isPublished: false, category: 'ยา' },
    { isPublished: true, category: 'หัวใจ' },
  ])
  assert.equal(m.publishedTotal, 2)
})

test('categories = หมวดไม่ซ้ำของข้อที่เผยแพร่ เรียง ก-ฮ ตัดค่าว่าง', () => {
  const m = buildMeta([
    { isPublished: true, category: 'หัวใจ' },
    { isPublished: true, category: 'ยา' },
    { isPublished: true, category: 'ยา' },
    { isPublished: true, category: '' },
    { isPublished: true },
    { isPublished: false, category: 'ไต' },
  ])
  assert.deepEqual(m.categories, ['ยา', 'หัวใจ'])
})

test('คลังว่าง → publishedTotal 0, categories []', () => {
  assert.deepEqual(buildMeta([]), { publishedTotal: 0, categories: [] })
})
