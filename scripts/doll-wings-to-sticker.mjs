// แปลงปีกแบบเดิม (back ops + off, สะท้อน) → สติกเกอร์ part.st แล้วเขียนลง src/data/dollEdits.js (19 พ.ย. 2026 · ใช้ครั้งเดียว)
// ตรวจว่าภาพหลังแปลงเหมือนเดิมทุกพิกเซลก่อนเขียน
import fs from 'node:fs'
import { W, H, PART, ANCH } from '../src/data/dollParts.js'
import { composeWide } from '../src/utils/dollRender.js'
import EDITS from '../src/data/dollEdits.js'

const IDS = ['w1', 'w2', 'w3', 'w4', 'w5']
const EQ = { s: 's2', c: 'c1', h: 'h9', e: 'e1', m: 'm1', t: 't1', b: 'b1', k: 'k1' }
const out = { ...EDITS }
for (const id of IDS) {
  const p = PART[id]
  const [ox, oy] = p.off || [0, 0]
  const g = Array.from({ length: H }, () => Array(W).fill(null))
  for (const op of p.back) {
    const cells = op[0] === 'r'
      ? Array.from({ length: op[3] * op[4] }, (_, i) => [op[1] + (i % op[3]), op[2] + Math.floor(i / op[3]), op[5]])
      : [...op[3]].map((ch, i) => [op[1] + i, op[2], ch])
    for (const [x, y, ch] of cells) if (ch !== '.') g[y + oy][x + ox] = ch
  }
  let x0 = W, y0 = H, x1 = -1, y1 = -1
  g.forEach((r, y) => r.forEach((v, x) => { if (v) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) } }))
  if (x1 >= W / 2) throw new Error(`${id} มีพิกเซลข้ามแกนกลาง`)
  const rows = []
  for (let y = y0; y <= y1; y++) rows.push(g[y].slice(x0, x1 + 1).map(v => v || '.').join(''))
  const [ax, ay] = ANCH.back
  const st = { at: 'back', ax: ax - x0, ay: ay - y0, w: x1 - x0 + 1, h: y1 - y0 + 1, mir: true, L: { back: rows } }

  const before = JSON.stringify(composeWide({ ...EQ, w: id }))
  const saved = { back: p.back, st: p.st }
  p.back = null; p.st = st
  const after = JSON.stringify(composeWide({ ...EQ, w: id }))
  if (before !== after) { Object.assign(p, saved); throw new Error(`${id} ภาพไม่ตรงหลังแปลง`) }
  out[id] = { ...(EDITS[id] || {}), back: null, st }
  console.log(id, 'ok', st.w + 'x' + st.h, 'anchor', st.ax, st.ay)
}
const lines = Object.keys(out).sort().map(id => `  ${JSON.stringify(id)}: ${JSON.stringify(out[id])},`)
fs.writeFileSync('src/data/dollEdits.js', [
  '// 🎨 ชิ้นตุ๊กตาที่แก้ใน editor (#/doll-editor · dev เท่านั้น) — ไฟล์นี้ editor เขียนเอง ห้ามแก้มือ',
  '// { [partId]: { m, o, back, ob, pal } } ทับของเดิมใน dollParts.js',
  'export default {', ...lines, '}', ''].join('\n'))
