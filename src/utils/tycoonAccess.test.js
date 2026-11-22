import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canPlayTycoon, roomCode } from './tycoonAccess.js'

test('แอดมินเข้าได้เสมอ · ผู้ทดสอบต้องอยู่ในลิสต์ · ลิสต์พัง = เข้าไม่ได้', () => {
  assert.equal(canPlayTycoon(null, 'x', true), true)
  assert.equal(canPlayTycoon({ tycoonTesters: ['a'] }, 'a'), true)
  assert.equal(canPlayTycoon({ tycoonTesters: ['a'] }, 'b'), false)
  assert.equal(canPlayTycoon({ tycoonTesters: 'a' }, 'a'), false)
  assert.equal(canPlayTycoon({}, ''), false)
})

test('รหัสห้อง 4 ตัว ไม่มี 0/O/1/I', () => {
  for (let i = 0; i < 50; i++) assert.match(roomCode(), /^[A-HJ-NP-Z2-9]{4}$/)
})
