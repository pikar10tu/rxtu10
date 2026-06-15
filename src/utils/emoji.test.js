// เทส emoji helper — verify อัลกอริทึม codepoint ตรงกับชื่อไฟล์ของ Twemoji
// (jdecked/twemoji: hex พิมพ์เล็ก คั่นด้วย '-' ตัด VS16 ออกถ้าไม่ใช่ ZWJ sequence)
// รัน: node --test src/utils/emoji.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emojiCodepoint, twemojiUrl } from './emoji.js'

test('emoji ธรรมดา (surrogate pair) → hex ตัวเดียว', () => {
  assert.equal(emojiCodepoint('🐱'), '1f431') // cat face U+1F431
  assert.equal(emojiCodepoint('😀'), '1f600')
  assert.equal(emojiCodepoint('👍'), '1f44d')
})

test('VS16 (FE0F) ถูกตัดออกเมื่อไม่ใช่ ZWJ sequence', () => {
  assert.equal(emojiCodepoint('✌️'), '270c')  // victory hand + FE0F → 270c
  assert.equal(emojiCodepoint('🛠️'), '1f6e0') // hammer and wrench + FE0F
  assert.equal(emojiCodepoint('❤️'), '2764')  // red heart + FE0F
})

test('ZWJ sequence เก็บทุก codepoint รวม 200d (ไม่ตัด VS16)', () => {
  // family: man + ZWJ + woman + ZWJ + girl
  assert.equal(emojiCodepoint('👨‍👩‍👧'), '1f468-200d-1f469-200d-1f467')
})

test('ค่าว่าง → ""', () => {
  assert.equal(emojiCodepoint(''), '')
  assert.equal(emojiCodepoint(undefined), '')
})

test('twemojiUrl: ต่อ CDN + codepoint + .svg, ว่าง → ""', () => {
  assert.match(twemojiUrl('🐱'), /\/1f431\.svg$/)
  assert.equal(twemojiUrl(''), '')
})
