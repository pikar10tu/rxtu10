// pvpGuide — pure: "ไกด์สนาม" หน้า PvP จัดอันดับเพ็ทจากสถิติจริงใน roster (ไม่ใช่ผลซิม · 0 read เพิ่ม)
// user เคาะ 30 ก.ย. 2026: โชว์ตัวเก่งเป็นไกด์ แต่ไม่โชว์ทีมปัจจุบันของใคร (กันก๊อปทีม)
//   ⇒ มีแค่อันดับรายตัว + ท็อป 3 "ซีซั่นที่แล้ว" (hof ที่แอดมินบันทึกตอนแจกรางวัล)

export const GUIDE_SIZE = 5
export const WIN_MIN_USERS = 3     // "ชนะบ่อย" ต้องมีคนใส่อย่างน้อยเท่านี้ ไม่งั้นตัวที่คนใช้คนเดียวแล้วชนะรวดขึ้นที่ 1
export const WIN_MIN_FIGHTS = 10

const speciesOf = (row) => [...new Set((row?.tm || []).map(s => s?.i).filter(Boolean))]
const fights = (row) => (row?.pw || 0) + (row?.pl || 0)

/**
 * @param {Record<string, {tm?:{i:string}[], r?:number, pw?:number, pl?:number}>} rows  roster rows
 * @returns {{ teams:number, use:{id,v}[], top:{id,v}[], win:{id,v,n}[] }}
 *   use = % ของทีมทั้งหมดที่ใส่ · top = จำนวนคนในท็อป 10 เรตที่ใส่ · win = % ชนะรวมของคนที่ใส่
 */
export function buildPvpGuide(rows) {
  const list = Object.values(rows || {}).filter(r => speciesOf(r).length)
  const teams = list.length
  const count = new Map(), topCount = new Map(), w = new Map()
  const bump = (m, k, v = 1) => m.set(k, (m.get(k) || 0) + v)

  // ท็อป 10 = คนที่ลงสนามซีซั่นนี้แล้วเท่านั้น (เรตเริ่มต้น 1000 ของคนไม่เล่นไม่นับ)
  const top10 = list.filter(r => fights(r) > 0).sort((a, b) => (b.r || 0) - (a.r || 0)).slice(0, 10)
  for (const r of list) {
    for (const id of speciesOf(r)) {
      bump(count, id)
      if (fights(r)) {
        const x = w.get(id) || { w: 0, f: 0, n: 0 }
        x.w += r.pw || 0; x.f += fights(r); x.n += 1
        w.set(id, x)
      }
    }
  }
  for (const r of top10) for (const id of speciesOf(r)) bump(topCount, id)

  const rank = (arr) => arr.sort((a, b) => b.v - a.v || a.id.localeCompare(b.id)).slice(0, GUIDE_SIZE)
  return {
    teams,
    use: rank([...count].map(([id, n]) => ({ id, v: Math.round(n / teams * 100) }))),
    top: rank([...topCount].map(([id, v]) => ({ id, v }))),
    win: rank([...w].filter(([, x]) => x.n >= WIN_MIN_USERS && x.f >= WIN_MIN_FIGHTS)
      .map(([id, x]) => ({ id, v: Math.round(x.w / x.f * 100), n: x.n }))),
  }
}

/**
 * ท็อป 3 ของซีซั่นที่เพิ่งจบ → เก็บลง roster/current.hof (แอดมินเขียนตอนกดแจกรางวัลซีซั่น)
 * @param {{uid:string, arena?:{rank:number, rating:number}}[]} rewardRows  ผล computeSeasonRewards
 * @param {Record<string, {n?:string, tm?:{i:string,g?:number}[]}>} rosterRows  ทีม ณ ตอนกดแจก
 */
export function buildHof(season, rewardRows, rosterRows) {
  const top = (rewardRows || []).filter(r => r.arena && r.arena.rank <= 3)
    .sort((a, b) => a.arena.rank - b.arena.rank).slice(0, 3)
    .map(r => ({
      rank: r.arena.rank, r: r.arena.rating,
      n: rosterRows?.[r.uid]?.n || r.nickname || '?',
      tm: (rosterRows?.[r.uid]?.tm || []).map(s => ({ i: s.i, g: s.g || 0 })),
    }))
  return top.length ? { season, top } : null
}
