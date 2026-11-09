// src/utils/questionImages.test.js
// รัน: node --test src/utils/questionImages.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { questionImages } from './questionImages.js'

test('รับเฉพาะ path /qimg/ ภายในเว็บ ไม่ซ้ำ', () => {
  assert.deepEqual(
    questionImages({ images: ['/qimg/a_1.webp', 'https://x.com/a.png', '/other/b.webp', 3, '/qimg/a_1.webp'] }),
    ['/qimg/a_1.webp'],
  )
})

test('ไม่มีฟิลด์ = ว่าง', () => {
  assert.deepEqual(questionImages({}), [])
  assert.deepEqual(questionImages(null), [])
})
