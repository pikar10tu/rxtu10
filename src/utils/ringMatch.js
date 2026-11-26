// 🥊 สนามมวยเป่ายิงฉุบ (27 พ.ย. 2026 · Co-working ห้องที่ 4) — ตรรกะล้วน ไม่แตะ Firebase · เทส: ringMatch.test.js
// Bo3: ชนะ 2 ยกก่อนชนะ · ออกเหมือนกัน = ชกยกนั้นใหม่ (ไม่นับ) · ทุกเครื่อง (คู่ชก+คนดู) คำนวณผลเองจาก h ชุดเดียวกัน ไม่มีกรรมการ
//   h = { r: { 0: 'rock', 1: 'paper', … }, b: { … } }   (key = ลำดับการออกมือ รวมรอบที่เสมอ)

export const HANDS = ['rock', 'paper', 'scissors']
export const HAND_EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' }
export const HAND_LABEL = { rock: 'ค้อน', paper: 'กระดาษ', scissors: 'กรรไกร' }
export const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
export const WIN_ROUNDS = 2
export const PICK_MS = 5000

// ตำแหน่งในฉาก (พิกเซล 160×100 · จุดเท้า) — ต้องตรงกับ bg_ring.png (pixel-art/ring/build.py)
export const RING = { x0: 38, x1: 121, y0: 56, y1: 88 }
export const CORNER = { r: [60, 80], b: [100, 80] }
export const RING_BTN = [RING.x0 + 1, RING.y0 - 8]   // ปุ่ม 🥊 ลอยเหนือเสามุมแดง
export const SPECTATE = [[16, 70], [26, 96], [144, 70], [134, 96], [10, 88], [150, 88], [52, 97], [108, 97]]

/** ผลยกเดียว: 'r' | 'b' | 'tie' */
export function judge(r, b) {
  if (!HANDS.includes(r) || !HANDS.includes(b)) return null
  if (r === b) return 'tie'
  return BEATS[r] === b ? 'r' : 'b'
}

/** ไล่ทุกการออกมือที่ครบทั้งคู่ → { throws: [{ i, r, b, res }], score: { r, b }, next: i ที่รอออกมือ, winner } */
export function deriveMatch(h = {}) {
  const hr = h?.r || {}, hb = h?.b || {}
  const throws = []
  const score = { r: 0, b: 0 }
  let i = 0, winner = null
  while (!winner && hr[i] != null && hb[i] != null) {
    const res = judge(hr[i], hb[i])
    if (!res) break
    throws.push({ i, r: hr[i], b: hb[i], res })
    if (res !== 'tie') { score[res]++; if (score[res] >= WIN_ROUNDS) winner = res }
    i++
  }
  return { throws, score, next: i, winner }
}

/** ยกที่เท่าไหร่ (นับเฉพาะยกที่มีผล +1) — ไว้โชว์ "ยกที่ n" */
export const roundNo = (score) => score.r + score.b + 1
/** ยกตัดสิน = ต่างฝ่ายชนะคนละ WIN_ROUNDS-1 */
export const isDecider = (score) => score.r === WIN_ROUNDS - 1 && score.b === WIN_ROUNDS - 1
/** สกอร์แบบอ่าน (ผู้ชนะก่อน) เช่น "2–1" */
export const scoreText = (score, winner) => (winner === 'b' ? `${score.b}–${score.r}` : `${score.r}–${score.b}`)
export const randomHand = (rnd = Math.random) => HANDS[Math.floor(rnd() * 3) % 3]

/** ข้อความประกาศในแชต */
export function resultText({ wName, lName, score, winner, forfeit }) {
  return forfeit ? `🥊 ${wName} ชนะ ${lName} (คู่ชกออกจากเวที)` : `🥊 ${wName} ชนะ ${lName} ${scoreText(score, winner)}`
}

/** อันดับชนะจากกระดาน (รายการ { w, l }) → [{ name, wins }] เรียงมากไปน้อย */
export function ringRanking(rows = [], top = 5) {
  const m = new Map()
  for (const r of rows) if (r?.w) m.set(r.w, (m.get(r.w) || 0) + 1)
  return [...m].map(([name, wins]) => ({ name, wins })).sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name, 'th')).slice(0, top)
}
