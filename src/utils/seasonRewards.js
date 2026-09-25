// ════════════════════════════════════════════════════════════
//  seasonRewards — pure: คำนวณรางวัลสิ้นซีซั่น (หอคอย + อารีน่า) จาก user doc ดิบ
//  แอดมินกดแจกเองใน AdminView → จดหมายเข้า mailbox (กดรับเอง) · ไม่ import Firestore
//  อันดับเท่ากันที่เส้นตัด = ได้ทุกคน (user สั่ง 24 ก.ย. 2026: เกินจำนวนได้)
// ════════════════════════════════════════════════════════════
import { pvpOfSeason } from './pvpSeason.js'
import { getArena } from '../data/arenas.js'

export const SEASON_REWARDS = {
  tower: { topN: 10, topCoins: 50000, ticketFloor: 50, tickets: 50, joinCoins: 10000, ach: 'tower_champ' },
  // topN = ได้สนามแชมป์ (user ขอ 25 ก.ย. 2026: ท็อป 10 ใช้พื้นเดียวกัน ป้ายต่างกันตามอันดับ) · achTopN = achievement เดิม
  arena: { topN: 10, achTopN: 3, joinCoins: 20000, ach: 'arena_champ' },
}

// คะแนนของคนที่ n (เรียงมาก→น้อย) = เส้นตัด · คนที่ >= เส้นนี้ติดท็อปทั้งหมด (เท่ากันได้ทุกคน)
function cutoff(scores, n) {
  if (!n || !scores.length) return Infinity
  const s = [...scores].sort((a, b) => b - a)
  return s[Math.min(n, s.length) - 1]
}

/**
 * users: [{ uid, nickname, towerBest, pvp }] (อ่านจาก users collection ตรงๆ ไม่ใช่ roster
 *        เพราะแถว roster ถูกรีซีซั่นทับตั้งแต่มีคนเปิดเว็บวันที่ 1)
 * คืน [{ uid, nickname, tower?: {best, top, coins, tickets}, arena?: {rating, wins, losses, top, coins} }]
 * เฉพาะคนที่ได้อะไรสักอย่าง
 */
export function computeSeasonRewards(users, season, R = SEASON_REWARDS) {
  const list = (users || []).filter(u => u?.uid)
  const towerIn = list.filter(u => (u.towerBest || 0) > 0)
  const arenaIn = list
    .map(u => ({ u, p: pvpOfSeason(u.pvp, season) }))
    .filter(x => x.p && ((x.p.wins || 0) + (x.p.losses || 0)) > 0)
  const tCut = cutoff(towerIn.map(u => u.towerBest), R.tower.topN)
  const aScores = arenaIn.map(x => x.p.rating || 0)
  const aCut = cutoff(aScores, R.arena.topN)
  const achCut = cutoff(aScores, R.arena.achTopN ?? R.arena.topN)

  const out = new Map()
  const row = (u) => {
    if (!out.has(u.uid)) out.set(u.uid, { uid: u.uid, nickname: u.nickname || '?' })
    return out.get(u.uid)
  }
  for (const u of towerIn) {
    const top = u.towerBest >= tCut
    row(u).tower = {
      best: u.towerBest, top,
      coins: R.tower.joinCoins + (top ? R.tower.topCoins : 0),
      tickets: u.towerBest >= R.tower.ticketFloor ? R.tower.tickets : 0,
    }
  }
  for (const { u, p } of arenaIn) {
    const rating = p.rating || 0
    row(u).arena = {
      rating, wins: p.wins || 0, losses: p.losses || 0,
      rank: 1 + aScores.filter(s => s > rating).length,   // เท่ากัน = อันดับเดียวกัน
      top: rating >= aCut, ach: rating >= achCut, coins: R.arena.joinCoins,
    }
  }
  return [...out.values()]
}

/** จดหมาย (input ของ buildBroadcastMail) ของคนหนึ่ง — หอคอยกับอารีน่าแยกใบ เพราะ 1 ใบแนบ achievement ได้อันเดียว
 *  ⚠️ title ห้ามมีอีโมจิ (render เป็น text → tofu) */
export function seasonRewardMails(r, season, monthLabel, R = SEASON_REWARDS) {
  const mails = []
  if (r.tower) {
    const t = r.tower
    mails.push({
      title: `รางวัลหอคอย ซีซั่น ${monthLabel}`,
      body: t.top
        ? `ขึ้นไปถึงชั้น ${t.best} ติดท็อป ${R.tower.topN} ของรุ่น ได้ achievement "ผู้ครอบครองหอคอย ซีซั่น ${monthLabel}" ไปเลย`
        : `ซีซั่นนี้ขึ้นไปถึงชั้น ${t.best} ขอบคุณที่มาไต่ด้วยกัน`,
      coins: t.coins, tickets: t.tickets,
      achievement: t.top ? { id: R.tower.ach, date: season } : undefined,
    })
  }
  if (r.arena) {
    const a = r.arena
    // สนามแชมป์ของซีซั่นต้องอยู่ในทะเบียนก่อน ไม่งั้นไม่แนบ (ยังได้เหรียญ/achievement ตามปกติ)
    const champ = a.top && getArena('ch-' + season) ? { id: 'ch-' + season, rank: a.rank } : undefined
    mails.push({
      title: `รางวัลอารีน่า ซีซั่น ${monthLabel}`,
      body: a.ach
        ? `จบซีซั่นที่อันดับ ${a.rank} (${a.rating.toLocaleString()} แต้ม) ได้ achievement "ผู้ครอบครองอารีน่า ซีซั่น ${monthLabel}"${champ ? ' และสนามแชมป์ประจำซีซั่น' : ''}`
        : a.top
          ? `จบซีซั่นที่อันดับ ${a.rank} (${a.rating.toLocaleString()} แต้ม) ติดท็อป ${R.arena.topN}${champ ? ' ได้สนามแชมป์ประจำซีซั่น' : ''}`
          : `ซีซั่นนี้ลงสนามไป ${a.wins + a.losses} ไฟต์ ขอบคุณที่มาประลองด้วยกัน`,
      coins: a.coins,
      achievement: a.ach ? { id: R.arena.ach, date: season } : undefined,
      arena: champ,
    })
  }
  return mails
}
