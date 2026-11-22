// 🎲 เศรษฐีรอบโลก — engine แบบ pure: step(state, action) → { state, events }
// ไม่แตะ DOM/เครือข่าย · rng seed อยู่ใน state → host/ทุกเครื่องเล่นซ้ำได้ตรงกัน
// spec: docs/superpowers/specs/2026-11-22-world-tycoon-design.md
//
// phase: 'roll' (ผู้เล่นตา s.turn ทอย/ใช้การ์ด) · 'decide' (ตอบ s.pending) · 'over'
// pending.kind: buy | build | landmark | takeover | startPick | festivalPick | travelPick
//               | blueprintPick | cardTarget | minigame | sell
import { GAME, TILES, isOwnable } from '../../data/tycoon/board.js'
import { CARDS, CARD_IDS, SHARE_AMOUNT, BLACKOUT_TURNS, EMERGENCY_TAX, MAGNET_RANGE } from '../../data/tycoon/cards.js'
import {
  rngNext, landPrice, houseCost, landmarkCost, baseToll, takeoverPrice, sellPrice,
  maxHouses, canTakeover, netWorth, specialWin,
} from './rules.js'

export const SEAT_COLORS = ['#ff7a9c', '#5aa9ff', '#3fc98a', '#ffb020']
const N = TILES.length

/** players: [{ uid, name, bot }] (2–4 คน) */
export function newGame(players, seed = 1, opts = {}) {
  if (players.length < 2 || players.length > 4) throw new Error('ต้องมีผู้เล่น 2–4 คน')
  return {
    v: 1, seed: seed >>> 0, round: 1, maxRounds: opts.maxRounds ?? GAME.maxRounds, turn: 0, turnNo: 0,
    phase: 'roll', pending: null, extraRoll: false, winner: null, festival: null, blackout: {}, lastDice: null,
    players: players.map((p, i) => ({
      uid: p.uid, name: p.name, bot: !!p.bot, color: SEAT_COLORS[i],
      cash: GAME.startCash, pos: 0, laps: 0, jail: 0, doubles: 0, cards: [], out: false, travel: false,
    })),
    tiles: {},
  }
}

// ───────── helpers (ทำงานบน ctx = { s, ev }) ─────────
const rand = (c) => { const r = rngNext(c.s.seed); c.s.seed = r.s; return r.v }
const cur = (c) => c.s.players[c.s.turn]
const active = (s) => s.players.map((p, i) => i).filter(i => !s.players[i].out)
const owned = (s, seat) => Object.keys(s.tiles).map(Number).filter(i => s.tiles[i].owner === seat)
const tollOf = (s, idx) => {
  const t = s.tiles[idx]
  if (!t) return 0
  if ((s.blackout[idx] ?? 0) > s.turnNo && t.level < 4) return 0
  return baseToll(idx, t.level, s.tiles) * (s.festival === idx ? 2 : 1)
}

// fixed = [a,b] ใช้ในเทสต์เท่านั้น — ห้องออนไลน์ host ตัดฟิลด์ dice ทิ้งก่อนส่งเข้า step (useTycoonRoom)
function rollDice(c, aim, fixed) {
  if (Array.isArray(fixed) && fixed.length === 2) { const [a, b] = fixed; return { a, b, sum: a + b, double: a === b, controlled: false } }
  const pairs = []
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) pairs.push([a, b])
  let pool = pairs
  const controlled = Number.isFinite(aim) && rand(c) < GAME.controlChance
  if (controlled) pool = pairs.filter(([a, b]) => Math.abs(a + b - aim) <= GAME.controlSpread)
  const [a, b] = pool[Math.floor(rand(c) * pool.length)]
  return { a, b, sum: a + b, double: a === b, controlled }
}

function moveTo(c, seat, target, { forward = true } = {}) {
  const p = c.s.players[seat]
  const path = []
  let i = p.pos
  if (forward) {
    while (i !== target) {
      i = (i + 1) % N; path.push(i)
      if (i === 0) { p.laps++; p.cash += GAME.salary; c.ev.push({ t: 'salary', seat, amount: GAME.salary }) }
    }
  } else path.push(target)
  p.pos = target
  c.ev.push({ t: 'move', seat, path, warp: !forward })
}

function sendJail(c, seat) {
  const p = c.s.players[seat]
  const k = p.cards.indexOf('jailKey')
  if (k >= 0) { p.cards.splice(k, 1); c.ev.push({ t: 'card', seat, card: 'jailKey', used: true }); moveTo(c, seat, 8, { forward: false }); return }
  moveTo(c, seat, 8, { forward: false })
  p.jail = GAME.jailTurns; p.doubles = 0
  if (seat === c.s.turn) c.s.extraRoll = false
  c.ev.push({ t: 'jail', seat })
}

function transfer(c, from, to, amount) {
  c.s.players[from].cash -= amount
  if (to != null) c.s.players[to].cash += amount
  c.ev.push({ t: 'pay', from, to, amount })
}

function bankrupt(c, seat, creditor) {
  const p = c.s.players[seat]
  if (creditor != null && p.cash > 0) { c.s.players[creditor].cash += p.cash; c.ev.push({ t: 'pay', from: seat, to: creditor, amount: p.cash }) }
  p.cash = 0; p.out = true; p.cards = []
  for (const i of owned(c.s, seat)) { delete c.s.tiles[i]; if (c.s.festival === i) c.s.festival = null }
  c.ev.push({ t: 'bankrupt', seat })
  const left = active(c.s)
  if (left.length === 1) finish(c, left[0], 'bankrupt')
}

function autoSell(c, seat, need) {
  const list = owned(c.s, seat).sort((x, y) => sellPrice(x, c.s.tiles[x].level) - sellPrice(y, c.s.tiles[y].level))
  for (const i of list) {
    if (c.s.players[seat].cash >= need) break
    sellTile(c, seat, i)
  }
}

function sellTile(c, seat, idx) {
  const amount = sellPrice(idx, c.s.tiles[idx].level)
  c.s.players[seat].cash += amount
  delete c.s.tiles[idx]
  if (c.s.festival === idx) c.s.festival = null
  c.ev.push({ t: 'sell', seat, idx, amount })
}

/** จ่ายเงิน · ไม่พอ: คนที่ถึงตา → ให้เลือกขาย (pending sell) · คนอื่น → ขายถูกสุดก่อนอัตโนมัติ
 *  คืน true ถ้าจ่ายครบแล้ว (ต่อได้เลย) */
function pay(c, from, to, amount) {
  amount = Math.max(0, Math.round(amount))
  if (amount === 0) return true
  const p = c.s.players[from]
  if (p.cash >= amount) { transfer(c, from, to, amount); return true }
  if (from === c.s.turn && owned(c.s, from).length && c.s.phase !== 'over') {
    c.s.phase = 'decide'; c.s.pending = { kind: 'sell', amount, to }
    return false
  }
  autoSell(c, from, amount)
  if (p.cash >= amount) { transfer(c, from, to, amount); return true }
  bankrupt(c, from, to)
  return false
}

function finish(c, seat, reason) {
  c.s.phase = 'over'; c.s.pending = null
  c.s.winner = { seat, reason }
  c.ev.push({ t: 'win', seat, reason })
}

function checkWin(c, seat) {
  if (c.s.phase === 'over') return true
  const w = specialWin(seat, c.s.tiles)
  if (w) { finish(c, seat, w); return true }
  return false
}

// ───────── turn flow ─────────
function startTurn(c) {
  const p = cur(c)
  c.s.phase = 'roll'; c.s.pending = null; c.s.extraRoll = false
  if (p.travel) { c.s.phase = 'decide'; c.s.pending = { kind: 'travelPick' } }
}

function endTurn(c) {
  if (c.s.phase === 'over') return
  const p = cur(c)
  if (c.s.extraRoll && !p.out && p.jail === 0) {
    c.s.extraRoll = false; c.s.phase = 'roll'; c.s.pending = null
    c.ev.push({ t: 'again', seat: c.s.turn }); return
  }
  p.doubles = 0
  c.s.turnNo++
  const order = active(c.s)
  const prev = c.s.turn
  const next = order.find(i => i > prev) ?? order[0]
  if (next <= prev) {
    c.s.round++
    if (c.s.round > c.s.maxRounds) {
      const best = order.reduce((a, b) => (netWorth(c.s.players[b], b, c.s.tiles) > netWorth(c.s.players[a], a, c.s.tiles) ? b : a))
      finish(c, best, 'rounds'); return
    }
  }
  c.s.turn = next
  c.ev.push({ t: 'turn', seat: next, round: c.s.round })
  startTurn(c)
}

/** หลังจัดการช่องที่ตกเสร็จ (ไม่มี pending ค้าง) */
function afterLand(c) {
  if (c.s.phase === 'over') return
  if (checkWin(c, c.s.turn)) return
  if (cur(c).out) { endTurn(c); return }
  endTurn(c)
}

function offerOwnCity(c, idx, extra = {}) {
  const p = cur(c), t = c.s.tiles[idx]
  if (TILES[idx].type !== 'city') return false
  if (t.level < 3) {
    const room = Math.min(maxHouses(p.laps) - t.level, Math.floor(p.cash / houseCost(idx)))
    if (room > 0) { c.s.phase = 'decide'; c.s.pending = { kind: 'build', idx, max: room, ...extra }; return true }
  } else if (t.level === 3 && p.cash >= landmarkCost(idx)) {
    c.s.phase = 'decide'; c.s.pending = { kind: 'landmark', idx, cost: landmarkCost(idx), ...extra }; return true
  }
  return false
}

function land(c) {
  const seat = c.s.turn, p = cur(c), idx = p.pos, tile = TILES[idx]
  c.ev.push({ t: 'land', seat, idx })
  switch (tile.type) {
    case 'start': {
      const can = owned(c.s, seat).filter(i => TILES[i].type === 'city' && c.s.tiles[i].level < 4)
      if (can.length) { c.s.phase = 'decide'; c.s.pending = { kind: 'startPick', options: can }; return }
      return afterLand(c)
    }
    case 'city': case 'tour': {
      const t = c.s.tiles[idx]
      if (!t) {
        const base = landPrice(idx)
        if (p.cash < base) return afterLand(c)
        const max = tile.type === 'tour' ? 0 : Math.min(maxHouses(p.laps), Math.floor((p.cash - base) / houseCost(idx)))
        c.s.phase = 'decide'; c.s.pending = { kind: 'buy', idx, max }; return
      }
      if (t.owner === seat) { if (offerOwnCity(c, idx)) return; return afterLand(c) }
      const toll = tollOf(c.s, idx)
      let due = toll
      if (due > 0) {
        const ai = p.cards.indexOf('angel'), ci = p.cards.indexOf('coupon')
        if (ai >= 0) { p.cards.splice(ai, 1); due = 0; c.ev.push({ t: 'card', seat, card: 'angel', used: true }) }
        else if (ci >= 0) { p.cards.splice(ci, 1); due = Math.round(due / 2); c.ev.push({ t: 'card', seat, card: 'coupon', used: true }) }
      }
      c.ev.push({ t: 'toll', seat, idx, owner: t.owner, amount: due })
      if (!pay(c, seat, t.owner, due)) { if (c.s.phase !== 'decide') afterLand(c); return }
      if (canTakeover(idx, t.level) && p.cash >= takeoverPrice(idx, t.level)) {
        c.s.phase = 'decide'; c.s.pending = { kind: 'takeover', idx, price: takeoverPrice(idx, t.level) }; return
      }
      return afterLand(c)
    }
    case 'jail': sendJail(c, seat); return afterLand(c)
    case 'festival': {
      const mine = owned(c.s, seat)
      if (mine.length) { c.s.phase = 'decide'; c.s.pending = { kind: 'festivalPick', options: mine }; return }
      return afterLand(c)
    }
    case 'travel':
      if (p.cash >= GAME.travelFee) { transfer(c, seat, null, GAME.travelFee); p.travel = true; c.ev.push({ t: 'travelReady', seat }) }
      return afterLand(c)
    case 'tax': {
      const amt = Math.round(netWorth(p, seat, c.s.tiles) * GAME.taxPct)
      c.ev.push({ t: 'tax', seat, amount: amt })
      if (!pay(c, seat, null, amt) && c.s.phase === 'decide') return
      return afterLand(c)
    }
    case 'minigame': c.s.phase = 'decide'; c.s.pending = { kind: 'minigame' }; return
    case 'chance': return drawCard(c)
  }
  afterLand(c)
}

function drawCard(c) {
  const seat = c.s.turn, p = cur(c)
  const total = CARD_IDS.reduce((a, k) => a + CARDS[k].w, 0)
  let r = rand(c) * total, id = CARD_IDS[0]
  for (const k of CARD_IDS) { r -= CARDS[k].w; if (r < 0) { id = k; break } }
  c.ev.push({ t: 'card', seat, card: id })
  const card = CARDS[id]
  if (card.hold) {
    p.cards.push(id)
    if (p.cards.length > GAME.maxHeldCards) c.ev.push({ t: 'discard', seat, card: p.cards.shift() })
    return afterLand(c)
  }
  const opp = (pred) => Object.keys(c.s.tiles).map(Number).filter(i => c.s.tiles[i].owner !== seat && TILES[i].type === 'city' && pred(c.s.tiles[i]))
  switch (id) {
    case 'blackout': { const o = opp(t => t.level < 4); if (o.length) { c.s.phase = 'decide'; c.s.pending = { kind: 'cardTarget', card: id, options: o }; return } break }
    case 'storm': { const o = opp(t => t.level > 0 && t.level < 4); if (o.length) { c.s.phase = 'decide'; c.s.pending = { kind: 'cardTarget', card: id, options: o }; return } break }
    case 'festival': { const mine = owned(c.s, seat); if (mine.length) { c.s.phase = 'decide'; c.s.pending = { kind: 'festivalPick', options: mine }; return } break }
    case 'goHome': moveTo(c, seat, 0); return land(c)
    case 'goJail': sendJail(c, seat); break
    case 'share': {
      const order = active(c.s)
      const poor = order.reduce((a, b) => (c.s.players[b].cash < c.s.players[a].cash ? b : a))
      for (const i of order) if (i !== poor) transfer(c, i, poor, Math.min(SHARE_AMOUNT, c.s.players[i].cash))
      break
    }
    case 'tax': {
      const amt = Math.round(netWorth(p, seat, c.s.tiles) * EMERGENCY_TAX)
      c.ev.push({ t: 'tax', seat, amount: amt })
      if (!pay(c, seat, null, amt) && c.s.phase === 'decide') return
      break
    }
  }
  afterLand(c)
}

// ───────── legal actions ─────────
export function legalActions(s) {
  if (s.phase === 'over') return []
  const p = s.players[s.turn], seat = s.turn
  if (s.phase === 'roll') {
    const a = [{ type: 'roll' }]
    if (p.jail > 0 && p.cash >= GAME.bail) a.push({ type: 'payBail' })
    if (p.jail === 0) {
      if (p.cards.includes('travel')) a.push({ type: 'useCard', card: 'travel' })
      if (p.cards.includes('blueprint') && owned(s, seat).some(i => TILES[i].type === 'city' && s.tiles[i].level < 3)) a.push({ type: 'useCard', card: 'blueprint' })
      if (p.cards.includes('magnet') && s.tiles[p.pos]?.owner === seat && magnetTarget(s, seat) != null) a.push({ type: 'useCard', card: 'magnet' })
    }
    return a
  }
  const pd = s.pending
  const skip = { type: 'skip' }
  switch (pd.kind) {
    case 'buy': return [...Array.from({ length: pd.max + 1 }, (_, h) => ({ type: 'buy', houses: h })), skip]
    case 'build': return [...Array.from({ length: pd.max }, (_, h) => ({ type: 'build', houses: h + 1 })), skip]
    case 'landmark': return [{ type: 'landmark' }, skip]
    case 'takeover': return [{ type: 'takeover' }, skip]
    case 'startPick': case 'festivalPick': case 'cardTarget': return [...pd.options.map(idx => ({ type: 'pickTile', idx })), skip]
    case 'blueprintPick': return owned(s, seat).filter(i => TILES[i].type === 'city' && s.tiles[i].level < 3).map(idx => ({ type: 'pickTile', idx }))
    case 'travelPick': return TILES.filter(t => t.idx !== 24).map(t => ({ type: 'pickTile', idx: t.idx }))
    case 'minigame': return [{ type: 'minigame', score: 0 }]
    case 'sell': return owned(s, seat).map(idx => ({ type: 'sell', idx }))
  }
  return []
}

function magnetTarget(s, seat) {
  const me = s.players[seat]
  for (let d = 1; d <= MAGNET_RANGE; d++) {
    const at = (me.pos + d) % N
    const who = s.players.findIndex((q, i) => i !== seat && !q.out && q.pos === at)
    if (who >= 0) return who
  }
  return null
}

const ok = (s, action) => legalActions(s).some(a => a.type === action.type
  && (a.houses === undefined || a.houses === action.houses)
  && (a.idx === undefined || a.idx === action.idx)
  && (a.card === undefined || a.card === action.card))

// ───────── step ─────────
export function step(state, action) {
  const s = structuredClone(state)
  const c = { s, ev: [] }
  if (!ok(s, action)) return { state, events: [], error: 'illegal' }
  const seat = s.turn, p = s.players[seat], pd = s.pending
  switch (action.type) {
    case 'roll': {
      const d = rollDice(c, action.aim, action.dice)
      s.lastDice = d
      c.ev.push({ t: 'dice', seat, ...d })
      if (p.jail > 0) {
        if (d.double) { p.jail = 0; c.ev.push({ t: 'free', seat }); moveTo(c, seat, (p.pos + d.sum) % N); land(c) }
        else { p.jail--; c.ev.push({ t: 'stuck', seat, left: p.jail }); endTurn(c) }
        break
      }
      if (d.double) {
        p.doubles++
        if (p.doubles >= 3) { c.ev.push({ t: 'triple', seat }); sendJail(c, seat); endTurn(c); break }
        s.extraRoll = true
      }
      moveTo(c, seat, (p.pos + d.sum) % N)
      land(c)
      break
    }
    case 'payBail': transfer(c, seat, null, GAME.bail); p.jail = 0; c.ev.push({ t: 'free', seat }); break
    case 'useCard': {
      p.cards.splice(p.cards.indexOf(action.card), 1)
      c.ev.push({ t: 'card', seat, card: action.card, used: true })
      if (action.card === 'travel') { s.phase = 'decide'; s.pending = { kind: 'travelPick', viaCard: true } }
      else if (action.card === 'blueprint') { s.phase = 'decide'; s.pending = { kind: 'blueprintPick' } }
      else if (action.card === 'magnet') {
        const who = magnetTarget(s, seat)
        moveTo(c, who, p.pos, { forward: false })
        c.ev.push({ t: 'pull', seat, target: who })
        const toll = tollOf(s, p.pos)
        c.ev.push({ t: 'toll', seat: who, idx: p.pos, owner: seat, amount: toll })
        pay(c, who, seat, toll)
        checkWin(c, seat)
      }
      break
    }
    case 'buy': {
      const cost = landPrice(pd.idx) + action.houses * houseCost(pd.idx)
      transfer(c, seat, null, cost)
      s.tiles[pd.idx] = { owner: seat, level: action.houses }
      c.ev.push({ t: 'buy', seat, idx: pd.idx, level: action.houses })
      s.pending = null; afterLand(c); break
    }
    case 'build': {
      transfer(c, seat, null, action.houses * houseCost(pd.idx))
      s.tiles[pd.idx].level += action.houses
      c.ev.push({ t: 'build', seat, idx: pd.idx, level: s.tiles[pd.idx].level })
      s.pending = null; afterLand(c); break
    }
    case 'landmark': {
      transfer(c, seat, null, pd.cost)
      s.tiles[pd.idx].level = 4
      c.ev.push({ t: 'landmark', seat, idx: pd.idx })
      s.pending = null; afterLand(c); break
    }
    case 'takeover': {
      const from = s.tiles[pd.idx].owner
      transfer(c, seat, from, pd.price)
      s.tiles[pd.idx].owner = seat
      c.ev.push({ t: 'takeover', seat, from, idx: pd.idx })
      s.pending = null
      if (checkWin(c, seat)) break
      if (offerOwnCity(c, pd.idx)) break
      afterLand(c); break
    }
    case 'pickTile': {
      const idx = action.idx
      s.pending = null
      if (pd.kind === 'startPick') { if (!offerOwnCity(c, idx)) afterLand(c) }
      else if (pd.kind === 'festivalPick') { s.festival = idx; c.ev.push({ t: 'festival', seat, idx }); afterLand(c) }
      else if (pd.kind === 'cardTarget') {
        if (pd.card === 'blackout') { s.blackout[idx] = s.turnNo + BLACKOUT_TURNS * active(s).length; c.ev.push({ t: 'blackout', seat, idx }) }
        else { s.tiles[idx].level--; c.ev.push({ t: 'storm', seat, idx, level: s.tiles[idx].level }) }
        afterLand(c)
      } else if (pd.kind === 'blueprintPick') {
        s.tiles[idx].level++; c.ev.push({ t: 'build', seat, idx, level: s.tiles[idx].level, free: true })
        s.phase = 'roll'; checkWin(c, seat)
      } else if (pd.kind === 'travelPick') {
        p.travel = false; s.phase = 'roll'
        moveTo(c, seat, idx); land(c)
      }
      break
    }
    case 'skip': {
      s.pending = null
      if (pd.kind === 'travelPick') { p.travel = false; s.phase = 'roll'; break }
      afterLand(c); break
    }
    case 'minigame': {
      const got = Math.round(Math.max(0, Math.min(1, Number(action.score) || 0)) * GAME.minigameMax)
      p.cash += got; c.ev.push({ t: 'minigame', seat, amount: got })
      s.pending = null; afterLand(c); break
    }
    case 'sell': {
      sellTile(c, seat, action.idx)
      if (p.cash >= pd.amount) { transfer(c, seat, pd.to, pd.amount); s.pending = null; afterLand(c) }
      else if (!owned(s, seat).length) { s.pending = null; bankrupt(c, seat, pd.to); if (s.phase !== 'over') endTurn(c) }
      break
    }
  }
  return { state: s, events: c.ev }
}

export { netWorth }
