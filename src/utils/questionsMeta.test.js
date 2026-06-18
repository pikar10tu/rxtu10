// เทส buildMeta — สรุป { publishedTotal, categories, domains } จากรายการข้อสอบ (นับเฉพาะ isPublished)
// รัน: node --test src/utils/questionsMeta.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildMeta } from './questionsMeta.js'
import { DOMAIN_KEYS } from '../data/domains.js'

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

test('คลังว่าง → publishedTotal 0, categories [], domains ครบ 0', () => {
  assert.deepEqual(buildMeta([]), {
    publishedTotal: 0,
    categories: [],
    domains: Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0])),
  })
})

test('domains = นับข้อ published ต่อ domain (มีครบทุก key เป็น 0 ถ้าไม่มี)', () => {
  const m = buildMeta([
    { isPublished: true,  domain: 'care' },
    { isPublished: true,  domain: 'care' },
    { isPublished: true,  domain: 'sci'  },
    { isPublished: false, domain: 'law'  },   // ไม่นับ (ร่าง)
    { isPublished: true,  domain: 'xyz'  },   // ไม่นับ (ไม่ใช่ domain ที่รู้จัก)
    { isPublished: true },                      // ไม่มี domain → ไม่นับเข้า key ใด
  ])
  assert.deepEqual(m.domains, { care: 2, sci: 1, law: 0 })
})

test('domains มี key ครบตาม DOMAIN_KEYS เสมอ', () => {
  const m = buildMeta([])
  assert.deepEqual(Object.keys(m.domains).sort(), [...DOMAIN_KEYS].sort())
})
