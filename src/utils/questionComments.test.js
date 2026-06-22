import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildComment, sortComments } from './questionComments.js'

test('buildComment trims + เก็บ field ครบ ไม่มี createdAt', () => {
  const c = buildComment({ text: '  hi  ', uid: 'u1', name: 'A', role: 'instructor' })
  assert.equal(c.text, 'hi')
  assert.equal(c.authorUid, 'u1')
  assert.equal(c.authorName, 'A')
  assert.equal(c.authorRole, 'instructor')
  assert.equal('createdAt' in c, false)
})

test('buildComment คืน null ถ้า text ว่างหลัง clean', () => {
  assert.equal(buildComment({ text: '   ', uid: 'u1' }), null)
  assert.equal(buildComment({ text: '', uid: 'u1' }), null)
})

test('buildComment cap ที่ LIMITS.comment (1000)', () => {
  const c = buildComment({ text: 'x'.repeat(2000), uid: 'u1' })
  assert.equal(c.text.length, 1000)
})

test('buildComment default field ที่ขาด', () => {
  const c = buildComment({ text: 'hi' })
  assert.equal(c.authorUid, '')
  assert.equal(c.authorName, 'ไม่ระบุ')
  assert.equal(c.authorRole, 'student')
})

test('sortComments เรียงเก่า→ใหม่ pending ท้ายสุด', () => {
  const list = [
    { text: 'c', createdAt: { seconds: 300 } },   // 300000ms
    { text: 'a', createdAt: { seconds: 100 } },   // 100000ms
    { text: 'pending', createdAt: null },          // Infinity
    { text: 'b', createdAt: 200000 },              // 200000ms (number=ms)
  ]
  assert.deepEqual(sortComments(list).map(c => c.text), ['a', 'b', 'c', 'pending'])
})

test('sortComments ทน non-array', () => {
  assert.deepEqual(sortComments(null), [])
})
