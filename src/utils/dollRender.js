// 🧍 RxTU10 doll — ตัวเรนเดอร์ (pure, ไม่แตะ DOM) ยกจาก docs/doll-prototype/doll.js 18 พ.ย. 2026
// compose(eq) → กริดสี 40x44 · outline(grid) → +ขอบเข้ม 1px + ขอบขาว 2px (กรอบ 48x52) · render(eq) = ทั้งสองขั้น
// ปรับจากต้นแบบ (user เลือกแบบ B 18 พ.ย.): ไหล่มน + เส้นแยกแขน/ลำตัวเมื่อสีเดียวกัน · แขนยาวอยู่ใน BASE (data/dollParts.js)
import { W, H, PAD, XM, ANCH, INK, SKINS, HAIRC, BASE, PART } from '../data/dollParts.js'
const FW = W + XM * 2   // กรอบรวม (ตัว + ที่ว่างข้างให้สติกเกอร์)

// ลำดับซ้อนจากหลังไปหน้า — ตัวฐาน (base) อยู่ก่อนเสื้อผ้าเสมอ ชุด/กระโปรงจึงทับมือที่ยาวขึ้นได้เอง
// 19 พ.ย.: รองเท้า k ย้ายไปหลังชุด/เสื้อคลุม — เดิมขาชุดเต็มตัวทับบูทจนเหลือแค่พื้นรองเท้า
export const ORDER = ['w', 'hb', 'base', 'b', 't', 'n', 'k', 'j', 'e', 'm', 'f', 'h', 'x', 'a', 'i']

const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
export const mix = (a, b, t) =>
  '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase()

function apply(g, ops, pal, mirror, onlyEmpty, off) {
  const [ox, oy] = off || [0, 0]
  const put = (x0, y0, ch, mir) => {
    const x = x0 + (mir ? -ox : ox) + XM, y = y0 + oy     // ฝั่งสะท้อนเลื่อน x กลับด้าน (ปีกซ้าย-ขวาเท่ากัน) · +XM = ลงกรอบรวม
    if (ch === '.' || x < 0 || x >= FW || y < 0 || y >= H) return
    if (onlyEmpty && g[y][x]) return
    g[y][x] = pal[ch] || ch
  }
  const one = (op, mir) => {
    if (op[0] === 'r') {
      const [, x, y, w, h, c] = op
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(mir ? W - 1 - (x + i) : x + i, y + j, c, mir)
    } else {
      const [, x, y, s] = op
      for (let i = 0; i < s.length; i++) put(mir ? W - 1 - (x + i) : x + i, y, s[i], mir)
    }
  }
  for (const op of ops || []) { one(op, false); if (mirror) one(op, true) }
}

// ช่องที่ถูกชิ้นอื่นกินอยู่ (ชุดเต็มตัว full → กิน b · ชิ้นใดก็ประกาศ covers ได้)
export function hiddenSlots(eq) {
  const hidden = new Set()
  for (const k of ORDER) {
    const p = PART[eq[k]]
    if (!p) continue
    if (p.full) hidden.add('b')
    for (const c of p.covers || []) hidden.add(c)
  }
  return hidden
}

// ไหล่มน: ตัดมุมบนนอกสุดของไหล่ (แถว 18) ถ้าเหนือและข้างนอกว่าง = เป็นมุมจริง ไม่ใช่ปีก/ผม/ผ้าคลุม
function roundShoulders(g) {
  for (const [x0, o0] of [[12, 11], [W - 13, W - 12]]) {
    const x = x0 + XM, out = o0 + XM
    if (g[18][x] && !g[17][x] && !g[18][out]) g[18][x] = null
  }
}
// แยกแขนกับลำตัว: แขน (x=13) กับขอบลำตัว (x=14) สีเดียวกัน → ลงเงาบางที่ขอบลำตัว (เสื้อยืดขาว กาวน์ ฮู้ด)
function armSeam(g) {
  for (let y = 19; y <= 27; y++) {
    for (const [a0, b0] of [[13, 14], [W - 14, W - 15]]) {
      const a = a0 + XM, b = b0 + XM
      if (g[y][a] && g[y][a] === g[y][b]) g[y][b] = mix(g[y][b], INK, 0.28)
    }
  }
}

// สติกเกอร์: พิกเซล (sx,sy) ในภาพ → ตัว (A.x - ax + sx, A.y - ay + sy) · mir = วางซ้ำฝั่งตรงข้าม (x' = W-1-x)
function applySticker(g, st, layer, pal) {
  const rows = st?.L?.[layer]; if (!rows) return
  const [axb, ayb] = ANCH[st.at] || [0, 0]
  const put = (bx, by, ch) => {
    const x = bx + XM
    if (ch === '.' || x < 0 || x >= FW || by < 0 || by >= H) return
    g[by][x] = pal[ch] || ch
  }
  rows.forEach((row, sy) => {
    for (let sx = 0; sx < row.length; sx++) {
      const bx = axb - st.ax + sx, by = ayb - st.ay + sy
      put(bx, by, row[sx])
      if (st.mir) put(W - 1 - bx, by, row[sx])
    }
  })
}

// กรอบรวม FW x H (มีที่ว่างข้างละ XM) — ใช้ใน render · compose() ตัดเหลือแค่ช่วงตัว 40x44 ให้โค้ด/เทสต์เดิม
const HAND = [[26, 26], [27, 26], [26, 27], [27, 27]]   // มือขวา (พิกัดตัว)

export function composeWide(eq, { bare = false } = {}) {
  const g = Array.from({ length: H }, () => Array(FW).fill(null))
  const skin = SKINS.find(s => s.id === eq.s) || SKINS[1]
  const hair = HAIRC.find(c => c.id === eq.c) || HAIRC[0]
  const glob = { S: skin.S, s: skin.s, H: hair.H, h: hair.h, L: hair.L, K: INK, W: '#FFFFFF', C: '#FFB3A7', M: '#D9665F' }
  const hidden = hiddenSlots(eq)
  const stickers = ORDER.filter(k => k !== 'base' && k !== 'hb' && !hidden.has(k)).map(k => PART[eq[k]]).filter(p => p?.st)
  const palOf = p => ({ ...glob, ...p.pal })
  let handBefore = null
  for (const k of ORDER) {
    if (k === 'w') for (const p of stickers) applySticker(g, p.st, 'back', palOf(p))
    if (k === 'e') for (const p of stickers) applySticker(g, p.st, 'front', palOf(p))   // หลังเสื้อคลุม ก่อนหน้า/ผม
    if (k === 'base') { if (!bare) apply(g, BASE.m, glob, true); continue }
    if (k === 'hb') {
      const p = PART[eq.h]
      if (p) { const pal = { ...glob, ...p.pal }; apply(g, p.back, pal, true); apply(g, p.ob, pal, false) }
      continue
    }
    if (k === 'i') handBefore = HAND.map(([x, y]) => g[y][x + XM])
    if (hidden.has(k)) continue
    const p = PART[eq[k]]
    if (!p) continue
    const pal = { ...glob, ...p.pal }
    if (k === 'w') { apply(g, p.back, pal, true, false, p.off); continue }
    apply(g, p.m, pal, true, false, p.off)
    apply(g, p.o, pal, false, false, p.off)
  }
  // ✋ มือขวาถือของ: วาดนิ้วทับด้ามอีกรอบ (เดิมของบังมือมิด ดูลอยข้างตัว) — เฉพาะช่องที่ก่อนวาดของเป็นสีผิวจริง (ชุดมาสคอตที่คลุมมือไม่วาด)
  if (bare) return g
  if (handBefore && eq.i && PART[eq.i]) {
    HAND.forEach(([x, y], n) => { const v = handBefore[n]; if (v === skin.S || v === skin.s) g[y][x + XM] = v })
  }
  roundShoulders(g)
  armSeam(g)
  return g
}
export const compose = eq => composeWide(eq).map(r => r.slice(XM, XM + W))

// ขอบ: ช่องว่างที่ห่างจากพิกเซลตัวละคร ≤1.5 = ขอบเข้ม · ≤3.2 = ขอบขาว (ระยะแบบ euclidean)
// ขอบตามสี (19 พ.ย. 2026 · user เลือกแบบ 4 จากรูปเทียบ): ขอบเข้มแต่ละจุด = สีของพิกเซลตัวละครที่ใกล้ที่สุด ผสมเข้มลง 55%
// (เดิมเป็นหมึกดำ #3A2E2A ทุกจุด — ตัวเล็กแล้วดูทึบ) · ขอบขาวรอบนอกแบบสติกเกอร์คงเดิม
export const OUTLINE_DARK = '#2A2230', OUTLINE_MIX = 0.55
const edgeCache = new Map()
const edgeOf = (c) => { let v = edgeCache.get(c); if (!v) { v = mix(c, OUTLINE_DARK, OUTLINE_MIX); edgeCache.set(c, v) } return v }
export function outline(g) {
  const w = g[0].length + PAD * 2, h = g.length + PAD * 2
  const src = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => g[y - PAD]?.[x - PAD] || null))
  const out = src.map(r => r.slice())
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (src[y][x]) continue
    let m = 99, near = null
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const yy = y + dy, xx = x + dx
      if (yy < 0 || xx < 0 || yy >= h || xx >= w || !src[yy][xx]) continue
      const d = Math.hypot(dx, dy); if (d < m) { m = d; near = src[yy][xx] }   // ระยะเท่ากัน = ตัวแรกตามลำดับสแกน (ผลซ้ำได้)
    }
    if (m <= 1.5) out[y][x] = edgeOf(near); else if (m <= 3.2) out[y][x] = '#FFFFFF'
  }
  return { w, h, px: out }
}

// 19 พ.ย. 2026 (user เลือกแบบ 3 จากรูปเทียบ docs/doll-prototype/outline-compare4.png): ไม่มีขอบเลย — น่ารักกว่า ผมไม่พอง
// (ขอบสร้างความหนาเพิ่ม 1 px รอบตัว ทรงผมเลยดูพอง) · ของที่มีออร่า (เรือง/ประกาย) มีขอบแสงในตัวอยู่แล้ว
// เว้นขอบใส (PAD) ไว้เท่าเดิม ขนาดกรอบทุกหน้าไม่เปลี่ยน · outline() เก็บไว้เผื่อใช้ทำสติกเกอร์
export const pad = (g) => ({ w: g[0].length + PAD * 2, h: g.length + PAD * 2, px: Array.from({ length: g.length + PAD * 2 }, (_, y) => Array.from({ length: g[0].length + PAD * 2 }, (_, x) => g[y - PAD]?.[x - PAD] || null)) })
export const render = eq => pad(composeWide(eq))

// 🧺 รูปย่อในห้องแต่งตัว (19 พ.ย. 2026 · user: ในช่องเลือกของให้เห็นแค่ของ ไม่ต้องมีคนทั้งตัว)
// ชิ้นทั่วไป = วาดชิ้นเดียวบนกริดว่าง (ไม่มีตัว) แล้วตัดขอบให้พอดีชิ้น
// ตา/ปาก/หนวด/แก้ม = ชิ้นเล็กเกินจะดูรู้เรื่อง → ครอปหัวตุ๊กตาที่ใส่ชิ้นนั้นแทน
export const FACE_THUMB = ['e', 'm', 'f', 'j']
function crop(g, pad = 0) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1
  g.forEach((r, y) => r.forEach((v, x) => { if (v) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) } }))
  if (x1 < 0) return [[null]]
  return g.slice(Math.max(0, y0 - pad), y1 + 1 + pad).map(r => r.slice(Math.max(0, x0 - pad), x1 + 1 + pad))
}
// ไม่มีขอบสติกเกอร์ (user 19 พ.ย.: ใส่ขอบแล้วของไม่สวย) — คืน { w, h, px } แบบเดียวกับ render
const bare = g => ({ w: g[0].length, h: g.length, px: g })
export function renderThumb(id, eq = {}) {
  const p = PART[id]
  if (!p) return bare([[null]])
  if (FACE_THUMB.includes(p.slot)) {
    const g = composeWide({ s: eq.s, c: eq.c, h: eq.h || 'h1', e: eq.e || 'e1', m: eq.m || 'm1', j: eq.j, [p.slot]: id })
    return bare(crop(g.slice(0, 17).map(r => r.slice(XM + 11, XM + 29))))
  }
  const one = { s: eq.s, c: eq.c, [p.slot]: id }
  return bare(crop(composeWide(one, { bare: true })))
}
