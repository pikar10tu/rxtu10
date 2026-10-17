// ════════════════════════════════════════════════════════════
//  pokerEngine — Texas Hold'em ตรรกะล้วน (ไม่แตะ Firebase) ใช้โดย composables/usePoker.js
//  ชิปอยู่ในโต๊ะเท่านั้น ไม่ผูกเหรียญในแอป (user สั่ง 17 ต.ค.)
//  หัวห้อง = คนแจกไพ่: ถือ hand เต็ม { pub, deck, holes } ไว้เครื่องตัวเอง + dealer/{room}
//    pub   → state ที่ทุกคนเห็น (ไม่มีไพ่ในมือ/สำรับ)
//    holes → secrets/{room}/{uid} อ่านได้เฉพาะเจ้าของ
//  ไพ่ = 'As' 'Td' '9h' (rank + suit)
// ════════════════════════════════════════════════════════════

export const RANKS = '23456789TJQKA'
export const SUITS = 'shdc'
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const STREETS = ['preflop', 'flop', 'turn', 'river']

export const HAND_NAMES = ['ไพ่สูง', 'วันแพร์', 'ทูแพร์', 'ตอง', 'สเตรท', 'ฟลัช', 'ฟูลเฮาส์', 'โฟร์การ์ด', 'สเตรทฟลัช']

export function newDeck(rnd = Math.random) {
  const d = []
  for (const r of RANKS) for (const s of SUITS) d.push(r + s)
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[d[i], d[j]] = [d[j], d[i]] }
  return d
}

// ── ประเมินไพ่ ── คืน { score, cat, name, best } · score ยิ่งมากยิ่งชนะ
const rv = (c) => RANKS.indexOf(c[0]) + 2
function eval5(cards) {
  const vals = cards.map(rv).sort((a, b) => b - a)
  const flush = cards.every(c => c[1] === cards[0][1])
  const uniq = [...new Set(vals)]
  let straightHigh = 0
  if (uniq.length === 5) {
    if (vals[0] - vals[4] === 4) straightHigh = vals[0]
    else if (vals[0] === 14 && vals[1] === 5) straightHigh = 5   // A-2-3-4-5
  }
  const cnt = {}
  for (const v of vals) cnt[v] = (cnt[v] || 0) + 1
  // เรียงตามจำนวนซ้ำก่อน แล้วค่อยตามแต้ม
  const groups = Object.entries(cnt).map(([v, n]) => [n, +v]).sort((a, b) => b[0] - a[0] || b[1] - a[1])
  const shape = groups.map(g => g[0]).join('')
  const kick = groups.map(g => g[1])
  let cat, tb
  if (straightHigh && flush) { cat = 8; tb = [straightHigh] }
  else if (shape === '41') { cat = 7; tb = kick }
  else if (shape === '32') { cat = 6; tb = kick }
  else if (flush) { cat = 5; tb = vals }
  else if (straightHigh) { cat = 4; tb = [straightHigh] }
  else if (shape === '311') { cat = 3; tb = kick }
  else if (shape === '221') { cat = 2; tb = kick }
  else if (shape === '2111') { cat = 1; tb = kick }
  else { cat = 0; tb = vals }
  let score = cat
  for (let i = 0; i < 5; i++) score = score * 15 + (tb[i] || 0)
  return { score, cat }
}

export function evaluate(cards) {
  let best = null
  const n = cards.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++)
    for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) {
      const five = [cards[a], cards[b], cards[c], cards[d], cards[e]]
      const r = eval5(five)
      if (!best || r.score > best.score) best = { ...r, best: five }
    }
  return { ...best, name: HAND_NAMES[best.cat] }
}

// ── เริ่มมือ ──
// seats = [{ uid, stack }] เรียงตามที่นั่ง (เฉพาะคนที่มีชิป) · button = uid
// คืน hand = { pub, deck, holes }
export function startHand({ seats, button, sb, bb, handNo = 1, rnd = Math.random }) {
  if (seats.length < MIN_PLAYERS) throw new Error('ผู้เล่นไม่พอ')
  const order = seats.map(s => s.uid)
  const deck = newDeck(rnd)
  const bi = Math.max(0, order.indexOf(button))
  const btn = order[bi]
  const players = {}
  for (const s of seats) players[s.uid] = { stack: s.stack, bet: 0, total: 0, folded: false, allin: false, acted: false, capped: false }
  const holes = {}
  // แจกทีละใบวนสองรอบ เริ่มคนถัดจาก button
  for (let k = 0; k < 2; k++) for (let i = 1; i <= order.length; i++) {
    const u = order[(bi + i) % order.length]
    ;(holes[u] ||= []).push(deck.pop())
  }
  const headsUp = order.length === 2
  const sbUid = headsUp ? btn : order[(bi + 1) % order.length]
  const bbUid = headsUp ? order[(bi + 1) % order.length] : order[(bi + 2) % order.length]
  const pub = { handNo, phase: 'preflop', board: [], order, button: btn, sbUid, bbUid, sb, bb,
    players, curBet: 0, minRaise: bb, toAct: null, log: [] }
  post(pub, sbUid, sb)
  post(pub, bbUid, bb)
  pub.curBet = Math.max(players[sbUid].bet, players[bbUid].bet, bb)
  pub.toAct = nextToAct(pub, bbUid)
  const hand = { pub, deck, holes }
  if (!pub.toAct || roundDone(pub)) advance(hand)
  return hand
}

function post(pub, uid, amt) {
  const p = pub.players[uid]
  const x = Math.min(amt, p.stack)
  p.stack -= x; p.bet += x; p.total += x
  if (p.stack === 0) p.allin = true
}

const live = (pub) => pub.order.filter(u => !pub.players[u].folded)
const canAct = (p) => !p.folded && !p.allin

// คนถัดไปทางซ้ายของ from ที่ยังต้องตัดสินใจ
function nextToAct(pub, from) {
  const n = pub.order.length
  const i0 = pub.order.indexOf(from)
  for (let k = 1; k <= n; k++) {
    const u = pub.order[(i0 + k) % n]
    const p = pub.players[u]
    if (canAct(p) && (!p.acted || p.bet < pub.curBet)) return u
  }
  return null
}

function roundDone(pub) {
  return pub.order.every(u => { const p = pub.players[u]; return !canAct(p) || (p.acted && p.bet === pub.curBet) })
}

// ── สิ่งที่ทำได้ ── คืน { fold, check, call, callAmt, raise, minTo, maxTo } หรือ null ถ้าไม่ใช่ตา
export function legal(pub, uid) {
  if (pub.phase === 'showdown' || pub.toAct !== uid) return null
  const p = pub.players[uid]
  const callAmt = Math.min(pub.curBet - p.bet, p.stack)
  const maxTo = p.bet + p.stack
  const minTo = Math.min(pub.curBet + pub.minRaise, maxTo)
  const raise = !p.capped && maxTo > pub.curBet && pub.order.some(u => u !== uid && canAct(pub.players[u]))
  return { fold: true, check: callAmt === 0, call: callAmt > 0, callAmt, raise, minTo, maxTo }
}

// ── ลงมือ ── action = { type: 'fold'|'check'|'call'|'raise', to? } · แก้ hand ในที่ แล้วคืน hand
export function act(hand, uid, action) {
  const pub = hand.pub
  const L = legal(pub, uid)
  if (!L) throw new Error('ยังไม่ถึงตาคุณ')
  const p = pub.players[uid]
  const t = action.type
  if (t === 'fold') p.folded = true
  else if (t === 'check') { if (!L.check) throw new Error('เช็คไม่ได้ ต้องคอลหรือหมอบ') }
  else if (t === 'call') { if (!L.call) throw new Error('ไม่มีอะไรให้คอล'); post(pub, uid, L.callAmt) }
  else if (t === 'raise') {
    if (!L.raise) throw new Error('เกทับไม่ได้')
    const to = Math.floor(Number(action.to))
    if (!(to >= L.minTo && to <= L.maxTo)) throw new Error(`เกทับได้ ${L.minTo}–${L.maxTo}`)
    const size = to - pub.curBet
    post(pub, uid, to - p.bet)
    if (size >= pub.minRaise) {
      // เกทับเต็ม → เปิดให้ทุกคนตัดสินใจใหม่
      pub.minRaise = size
      for (const u of pub.order) if (u !== uid) { pub.players[u].acted = false; pub.players[u].capped = false }
    } else {
      // all-in ไม่ถึงขั้นต่ำ → คนที่ตัดสินใจไปแล้วได้แค่คอล/หมอบ
      for (const u of pub.order) if (u !== uid && pub.players[u].acted) pub.players[u].capped = true
    }
    pub.curBet = to
  } else throw new Error('ไม่รู้จักคำสั่ง')
  p.acted = true
  pub.log.push({ uid, type: t, to: t === 'raise' ? pub.curBet : undefined, amt: t === 'call' ? L.callAmt : undefined, phase: pub.phase })
  if (pub.log.length > 30) pub.log = pub.log.slice(-30)

  if (live(pub).length === 1) return finish(hand)
  if (roundDone(pub)) return advance(hand)
  pub.toAct = nextToAct(pub, uid)
  return hand
}

// ปิดรอบเดิมพัน → เปิดไพ่กลางถัดไป หรือไปโชว์ไพ่
function advance(hand) {
  const pub = hand.pub
  while (true) {
    if (live(pub).length === 1) return finish(hand)
    for (const u of pub.order) { const p = pub.players[u]; p.bet = 0; p.acted = false; p.capped = false }
    pub.curBet = 0; pub.minRaise = pub.bb
    const i = STREETS.indexOf(pub.phase)
    if (i === 3) return finish(hand)
    pub.phase = STREETS[i + 1]
    hand.deck.pop()   // เผาไพ่
    const n = pub.phase === 'flop' ? 3 : 1
    for (let k = 0; k < n; k++) pub.board.push(hand.deck.pop())
    // ถ้าเหลือคนตัดสินใจได้ไม่ถึง 2 คน → เปิดต่อจนจบโดยไม่ต้องเดิมพัน
    if (pub.order.filter(u => canAct(pub.players[u])).length < 2) continue
    pub.toAct = nextToAct(pub, pub.button)
    return hand
  }
}

// ── แบ่งกอง ── แยก side pot จากยอดลงรวม (คนหมอบลงเงินแต่ชิงไม่ได้)
export function buildPots(players) {
  const ids = Object.keys(players)
  const levels = [...new Set(ids.map(u => players[u].total).filter(x => x > 0))].sort((a, b) => a - b)
  const pots = []
  let prev = 0
  for (const lv of levels) {
    let amount = 0
    for (const u of ids) amount += Math.max(0, Math.min(players[u].total, lv) - prev)
    const eligible = ids.filter(u => !players[u].folded && players[u].total >= lv)
    if (amount > 0) {
      // กองที่ไม่มีใครชิงได้ (คนลงเกินถูกหมอบหมด) รวมเข้ากองก่อนหน้า
      if (!eligible.length && pots.length) pots[pots.length - 1].amount += amount
      else if (pots.length && sameSet(pots[pots.length - 1].eligible, eligible)) pots[pots.length - 1].amount += amount
      else pots.push({ amount, eligible })
    }
    prev = lv
  }
  return pots
}
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x))

export const potTotal = (pub) => pub.order.reduce((s, u) => s + pub.players[u].total, 0)

function finish(hand) {
  const pub = hand.pub
  const alive = live(pub)
  const showdown = alive.length > 1
  // โชว์ไพ่จริง → เปิดกลางให้ครบ 5 ใบ
  if (showdown) while (pub.board.length < 5) { hand.deck.pop(); pub.board.push(hand.deck.pop()) }
  const ranks = {}
  if (showdown) for (const u of alive) ranks[u] = evaluate([...hand.holes[u], ...pub.board])
  const pots = buildPots(pub.players)
  const won = {}
  const n = pub.order.length
  const bi = pub.order.indexOf(pub.button)
  const seatFromBtn = (u) => (pub.order.indexOf(u) - bi - 1 + n) % n
  const results = pots.map(pot => {
    let winners
    if (!showdown) winners = pot.eligible
    else {
      const top = Math.max(...pot.eligible.map(u => ranks[u].score))
      winners = pot.eligible.filter(u => ranks[u].score === top)
    }
    winners.sort((a, b) => seatFromBtn(a) - seatFromBtn(b))
    const share = Math.floor(pot.amount / winners.length)
    let odd = pot.amount - share * winners.length
    for (const w of winners) { won[w] = (won[w] || 0) + share + (odd > 0 ? 1 : 0); if (odd > 0) odd-- }
    return { amount: pot.amount, winners }
  })
  for (const [u, x] of Object.entries(won)) pub.players[u].stack += x
  pub.phase = 'showdown'
  pub.toAct = null
  pub.result = {
    showdown, pots: results, won,
    shown: showdown ? Object.fromEntries(alive.map(u => [u, { cards: hand.holes[u], name: ranks[u].name, best: ranks[u].best }])) : {},
  }
  return hand
}

// หมดเวลา → เช็คถ้าได้ ไม่งั้นหมอบ
export const timeoutAction = (pub, uid) => (legal(pub, uid)?.check ? { type: 'check' } : { type: 'fold' })

// button มือถัดไป = คนถัดไปทางซ้ายที่ยังมีชิป
export function nextButton(order, prevButton, hasChips) {
  if (!order.length) return null
  const i0 = order.indexOf(prevButton)
  for (let k = 1; k <= order.length; k++) {
    const u = order[(i0 + k + order.length) % order.length]
    if (hasChips(u)) return u
  }
  return null
}
