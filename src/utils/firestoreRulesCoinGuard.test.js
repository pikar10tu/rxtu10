// 🪙 กันปั๊มเหรียญ: ราคาในบรรทัด sold('id', ราคา, o, n) ใน firestore.rules ต้องตรงกับ data/crops.js ทุกตัว
// ไม่ตรง = เพื่อนขายผลผลิตล็อตใหญ่ (>2 ล้าน) แล้ว permission denied
// แก้ราคา/เพิ่มพืช → แก้ทั้งสองที่ แล้ว `firebase deploy --only firestore:rules` ก่อน push
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CROPS } from '../data/crops.js'
import { GOLD_SELL_MULT } from '../data/farmMastery.js'

const rules = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8')
const inRules = Object.fromEntries([...rules.matchAll(/sold\('([\w-]+)', (\d+), o, n\)/g)].map(m => [m[1], Number(m[2])]))

test('ราคาใน rules ตรงกับ data/crops.js ครบทุกพืช', () => {
  const inCode = Object.fromEntries(CROPS.map(c => [c.id, c.sellPrice]))
  assert.ok(Object.keys(inRules).length > 0, 'หาบรรทัด sold( ใน firestore.rules ไม่เจอ')
  assert.deepEqual(inRules, inCode)
})

test('ตัวคูณใน rules ไม่ต่ำกว่าเกม (ตลาดสูงสุด ×2 · ทอง ×3)', () => {
  assert.equal(GOLD_SELL_MULT, 3, 'ทองเปลี่ยนตัวคูณ → แก้ 6 ใน farmSalePick() ด้วย')
  assert.match(rules, /og == ng \? 2 \* cropSum\(oi, ni\) : \(oi == ni \? 6 \* cropSum\(og, ng\) : 0\)/)
})
