import { test } from 'node:test'
import assert from 'node:assert/strict'
import { teamSynergy } from './teamSynergy.js'

const find = (r, key) => r.find(x => x.key === key)

test('สิงโตครบ 3 สาย → ok พร้อมเลข · ไม่ครบ → บอกสายที่ขาด', () => {
  const ok = find(teamSynergy(['lion', 'gorilla', 'luna']), 'lion')     // fist · paper · scissors
  assert.equal(ok.ok, true); assert.match(ok.text, /12%/)
  const no = find(teamSynergy(['lion', 'bahamut', 'gorilla']), 'lion')   // ขาด scissors
  assert.equal(no.ok, false); assert.match(no.text, /✂️|กรรไกร|scissors/)
})
test('ซอล: มีตัวต่ำกว่าตำนาน → ok บอกจำนวน · ตำนานล้วน → เตือน', () => {
  assert.equal(find(teamSynergy(['sol', 'cat', 'panda']), 'sol').ok, true)
  assert.equal(find(teamSynergy(['sol', 'bahamut', 'phoenix']), 'sol').ok, false)
})
test('เอิร์ธบอกฤดูตามช่อง (ไอคอนอยู่ที่ icon ไม่ใช่ text — ห้ามฝังอีโมจิใน text เพราะ TeamPicker render ดิบ)', () => {
  const e = find(teamSynergy(['bahamut', 'earth', 'phoenix']), 'earth')
  assert.equal(e.icon, '🌧️')
  assert.match(e.text, /ฝน|ฟื้น/)
})

test('ร่างองศา: ไอคอน 🌗 อยู่ที่ icon ไม่ใช่ฝังใน text', () => {
  const e = find(teamSynergy(['sol', 'earth', 'panda']), 'earth')
  assert.equal(e.icon, '🌗')
  assert.match(e.text, /องศา/)
})

const PICTOGRAPHIC = /\p{Extended_Pictographic}/u
test('ทุกชิป: text ห้ามมีอีโมจิฝังอยู่ (TeamPicker.vue render {{ text }} ดิบ ไม่ผ่าน <Emoji>) — ไอคอนต้องอยู่ที่ icon เท่านั้น', () => {
  const teams = [
    ['lion', 'gorilla', 'luna'], ['lion', 'bahamut', 'gorilla'],
    ['sol', 'cat', 'panda'], ['sol', 'bahamut', 'phoenix'],
    ['bahamut', 'earth', 'phoenix'], ['sol', 'earth', 'panda'],
    ['hamster', 'sol', 'panda'], ['sol', 'hamster', 'panda'],
  ]
  for (const t of teams) {
    for (const chip of teamSynergy(t)) {
      assert.ok(!PICTOGRAPHIC.test(chip.text), `chip ${chip.key} text มีอีโมจิฝังอยู่: ${chip.text}`)
    }
  }
})
test('แฮมสเตอร์ช่อง 1 ok · ช่องอื่นแนะนำให้ย้าย', () => {
  assert.equal(find(teamSynergy(['hamster', 'sol', 'panda']), 'hamster').ok, true)
  assert.equal(find(teamSynergy(['sol', 'hamster', 'panda']), 'hamster').ok, false)
})
test('ดูโอ้ไม่ขึ้นป้าย (กิมมิคให้ค้นเอง) · ทีมว่าง/ไม่มีเงื่อนไข → []', () => {
  assert.deepEqual(teamSynergy(['whale', 'seal', null]), [])
  assert.deepEqual(teamSynergy([null, null, null]), [])
  assert.deepEqual(teamSynergy(['bahamut', 'phoenix', 'mammoth']), [])
})
