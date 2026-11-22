// 🤖 บอทธรรมดา — เลือกจาก legalActions เสมอ (ไม่มีทางทำผิดกติกา)
// ใช้ทั้งที่นั่งบอทและคนหมดเวลา/หลุด · r = ตัวเลขสุ่ม 0–1 จากผู้เรียก (บอทไม่แตะ rng ของเกม)
import { legalActions } from './engine.js'
import { TILES, GAME } from '../../data/tycoon/board.js'
import { landPrice, houseCost, takeoverPrice, propertyValue } from './rules.js'

const KEEP = 0.3 * GAME.startCash   // เงินกันไว้หลังจ่าย

export function botAction(s, r = Math.random()) {
  const acts = legalActions(s)
  if (!acts.length) return null
  const p = s.players[s.turn], pd = s.pending
  const has = (t) => acts.find(a => a.type === t)
  if (s.phase === 'roll') {
    return has('useCard') && r < 0.5 ? has('useCard') : { type: 'roll', aim: 4 + Math.floor(r * 7) }
  }
  switch (pd.kind) {
    case 'buy': {
      const best = acts.filter(a => a.type === 'buy')
        .filter(a => p.cash - landPrice(pd.idx) - a.houses * houseCost(pd.idx) >= KEEP)
        .at(-1)
      return best || (p.cash - landPrice(pd.idx) >= KEEP / 2 ? { type: 'buy', houses: 0 } : { type: 'skip' })
    }
    case 'build': {
      const best = acts.filter(a => a.type === 'build').filter(a => p.cash - a.houses * houseCost(pd.idx) >= KEEP).at(-1)
      return best || { type: 'skip' }
    }
    case 'landmark': return p.cash - pd.cost >= KEEP / 2 ? { type: 'landmark' } : { type: 'skip' }
    case 'takeover': {
      const t = s.tiles[pd.idx]
      return p.cash - takeoverPrice(pd.idx, t.level) >= KEEP * 1.5 && r < 0.6 ? { type: 'takeover' } : { type: 'skip' }
    }
    case 'startPick': case 'festivalPick': case 'blueprintPick': {
      const picks = acts.filter(a => a.type === 'pickTile')
      return picks.sort((a, b) => propertyValue(b.idx, s.tiles[b.idx].level) - propertyValue(a.idx, s.tiles[a.idx].level))[0] || { type: 'skip' }
    }
    case 'cardTarget': {
      const picks = acts.filter(a => a.type === 'pickTile')
      return picks.sort((a, b) => s.tiles[b.idx].level - s.tiles[a.idx].level)[0] || { type: 'skip' }
    }
    case 'travelPick': {
      // บินไปที่ว่างแพงสุดที่มีเงินซื้อ ไม่มีก็จุดเริ่มต้น
      const free = TILES.filter(t => (t.type === 'city' || t.type === 'tour') && !s.tiles[t.idx] && landPrice(t.idx) <= p.cash - KEEP / 2)
      const pick = free.sort((a, b) => landPrice(b.idx) - landPrice(a.idx))[0]
      return { type: 'pickTile', idx: pick ? pick.idx : 0 }
    }
    case 'minigame': return { type: 'minigame', score: r }
    case 'sell': {
      const picks = acts.filter(a => a.type === 'sell')
      return picks.sort((a, b) => propertyValue(a.idx, s.tiles[a.idx].level) - propertyValue(b.idx, s.tiles[b.idx].level))[0]
    }
  }
  return acts[acts.length - 1]
}
