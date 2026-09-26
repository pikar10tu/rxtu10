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
test('เอิร์ธบอกฤดูตามช่อง', () => {
  assert.match(find(teamSynergy(['bahamut', 'earth', 'phoenix']), 'earth').text, /🌧️/)
})
test('แฮมสเตอร์ช่อง 1 ok · ช่องอื่นแนะนำให้ย้าย', () => {
  assert.equal(find(teamSynergy(['hamster', 'sol', 'panda']), 'hamster').ok, true)
  assert.equal(find(teamSynergy(['sol', 'hamster', 'panda']), 'hamster').ok, false)
})
test('ดูโอ้ครบคู่ขึ้นชื่อคู่ · ทีมว่าง/ไม่มีเงื่อนไข → []', () => {
  assert.ok(teamSynergy(['whale', 'seal', null]).some(x => x.key.startsWith('duo')))
  assert.deepEqual(teamSynergy([null, null, null]), [])
  assert.deepEqual(teamSynergy(['bahamut', 'phoenix', 'mammoth']), [])
})
