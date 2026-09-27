// รัน: node --test src/utils/reviewBounty.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewBounty, othersSkipped } from './reviewBounty.js'
import { REVIEW_SKIP_BONUS } from '../data/index.js'

test('ไม่มีคนข้าม = ฐาน', () => { assert.equal(reviewBounty({}, 'me', 5000), 5000) })
test('คนอื่นข้าม 2 คน = ฐาน + โบนัส×2, ไม่นับตัวเอง', () => {
  const q = { reviewSkips: ['a', 'b', 'me'] }
  assert.equal(othersSkipped(q, 'me'), 2)
  assert.equal(reviewBounty(q, 'me', 10000), 10000 + 2 * REVIEW_SKIP_BONUS)
})
test('ข้อ null (ถูกลบ) = ฐาน', () => { assert.equal(reviewBounty(null, 'me', 5000), 5000) })
