// ════════════════════════════════════════════════════════════
//  seasonRewards — pure: คำนวณรางวัลสิ้นซีซั่น (หอคอย + อารีน่า) จาก user doc ดิบ
//  แอดมินกดแจกใน AdminView → จดหมาย kind:'season' (กดรับในหน้าหอคอย/อารีน่า ไม่โชว์ในกล่องจดหมาย)
//  user เคาะ 28 ก.ย. 2026: หอคอยแจกตามชั้น (ไม่ดูอันดับ) · อารีน่าทุกคนได้ตั๋ว คงขั้นอันดับ 1/2/3
//  อันดับเท่ากัน = อันดับเดียวกัน · ไม่ import Firestore
// ════════════════════════════════════════════════════════════
import { pvpOfSeason } from './pvpSeason.js'
import { getArena } from '../data/arenas.js'

export const TOWER_TIERS = [
  { min: 1,   coins: 10000, tickets: 5,  lv: 1, name: 'ชั้น 1–19' },
  { min: 20,  coins: 15000, tickets: 10, lv: 1, name: 'ชั้น 20–39' },
  { min: 40,  coins: 20000, tickets: 15, lv: 2, name: 'ชั้น 40–59' },
  { min: 60,  coins: 25000, tickets: 20, lv: 2, name: 'ชั้น 60–79' },
  { min: 80,  coins: 30000, tickets: 25, lv: 3, name: 'ชั้น 80–99' },
  { min: 100, coins: 35000, tickets: 30, lv: 4, name: 'พิชิตชั้น 100', ach: 'tower_champ' },
]
export const ARENA_TIERS = [
  { maxRank: 1,        coins: 45000, tickets: 35, lv: 4, name: 'แชมป์ซีซั่น', champ: true, ach: true },
  { maxRank: 2,        coins: 40000, tickets: 30, lv: 3, name: 'อันดับ 2',    champ: true, ach: true },
  { maxRank: 3,        coins: 35000, tickets: 25, lv: 3, name: 'อันดับ 3',    champ: true, ach: true },
  { maxRank: 10,       coins: 25000, tickets: 20, lv: 2, name: 'ท็อป 10',     champ: true, ach: false },
  { maxRank: Infinity, coins: 20000, tickets: 15, lv: 1, name: 'นักประลอง',   champ: false, ach: false },
]

export function towerTier(best) {
  if (!(best > 0)) return null
  return [...TOWER_TIERS].reverse().find(t => best >= t.min)
}
export function arenaTier(rank) {
  return ARENA_TIERS.find(t => rank <= t.maxRank)
}

/**
 * users: [{ uid, nickname, towerBest, pvp }] (อ่านจาก users collection ตรงๆ ไม่ใช่ roster
 *        เพราะแถว roster ถูกรีซีซั่นทับตั้งแต่มีคนเปิดเว็บวันที่ 1)
 * คืนเฉพาะคนที่ได้อะไรสักอย่าง
 */
export function computeSeasonRewards(users, season) {
  const list = (users || []).filter(u => u?.uid)
  const arenaIn = list
    .map(u => ({ u, p: pvpOfSeason(u.pvp, season) }))
    .filter(x => x.p && ((x.p.wins || 0) + (x.p.losses || 0)) > 0)
  const aScores = arenaIn.map(x => x.p.rating || 0)

  const out = new Map()
  const row = (u) => {
    if (!out.has(u.uid)) out.set(u.uid, { uid: u.uid, nickname: u.nickname || '?' })
    return out.get(u.uid)
  }
  for (const u of list) {
    const tier = towerTier(u.towerBest || 0)
    if (tier) row(u).tower = { best: u.towerBest, tier }
  }
  for (const { u, p } of arenaIn) {
    const rating = p.rating || 0
    const rank = 1 + aScores.filter(s => s > rating).length   // เท่ากัน = อันดับเดียวกัน
    row(u).arena = { rating, wins: p.wins || 0, losses: p.losses || 0, rank, tier: arenaTier(rank) }
  }
  return [...out.values()]
}

/** จดหมาย (input ของ buildBroadcastMail) ของคนหนึ่ง — หอคอยกับอารีน่าแยกใบ
 *  ⚠️ title ห้ามมีอีโมจิ (render เป็น text → tofu) */
export function seasonRewardMails(r, season, monthLabel) {
  const mails = []
  if (r.tower) {
    const { best, tier } = r.tower
    mails.push({
      kind: 'season', mode: 'tower', season,
      tier: { lv: tier.lv, name: tier.name, best },
      title: `รางวัลหอคอย ซีซั่น ${monthLabel}`,
      body: tier.ach
        ? `พิชิตชั้น 100 ได้ achievement "ผู้ครอบครองหอคอย ซีซั่น ${monthLabel}"`
        : `ซีซั่นนี้ขึ้นไปถึงชั้น ${best} ขอบคุณที่มาไต่ด้วยกัน`,
      coins: tier.coins, tickets: tier.tickets,
      achievement: tier.ach ? { id: tier.ach, date: season } : undefined,
    })
  }
  if (r.arena) {
    const { rating, wins, losses, rank, tier } = r.arena
    // สนามแชมป์ของซีซั่นต้องอยู่ในทะเบียนก่อน ไม่งั้นไม่แนบ (ยังได้เหรียญ/achievement ตามปกติ)
    const champ = tier.champ && getArena('ch-' + season) ? { id: 'ch-' + season, rank } : undefined
    mails.push({
      kind: 'season', mode: 'arena', season,
      tier: { lv: tier.lv, name: tier.name, rank, rating },
      title: `รางวัลอารีน่า ซีซั่น ${monthLabel}`,
      body: tier.champ
        ? `จบซีซั่นที่อันดับ ${rank} (${rating.toLocaleString()} แต้ม)${champ ? ' ได้สนามแชมป์ประจำซีซั่น' : ''}`
        : `ซีซั่นนี้ลงสนามไป ${wins + losses} ไฟต์ ขอบคุณที่มาประลองด้วยกัน`,
      coins: tier.coins, tickets: tier.tickets,
      achievement: tier.ach ? { id: 'arena_champ', date: season } : undefined,
      arena: champ,
    })
  }
  return mails
}
