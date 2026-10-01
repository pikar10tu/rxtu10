// รวมผลสุ่มกาชาเข้า pets[] (species-based: ตัวใหม่ unlock, ซ้ำ +copies) — pure
// ซ้ำเกินเพดาน (utils/stardust.js copyCap) ⇒ กลายเป็นประกายดาวระดับนั้นแทน (summary.toDust) · คืน dust ที่ได้
import { copyCap, emptyDust } from './stardust.js'
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

export function mergeRolls(pets, results, catalog) {
  const newPets = (pets || []).map((p) => ({ ...p }))
  const byId = new Map(newPets.map((p) => [p.id, p]))
  const summary = []
  const dust = emptyDust()
  for (const r of results) {
    const def = catalog.find((p) => p.id === r.id)
    if (!def) continue
    let isNew = false, toDust = false
    if (byId.has(def.id)) {
      const p = byId.get(def.id)
      if ((p.copies || 0) >= copyCap(p) && dust[def.rarity] != null) { dust[def.rarity]++; toDust = true }
      else p.copies = (p.copies || 0) + 1
    } else {
      const inst = {
        id: def.id, name: def.name, emoji: def.emoji, rarity: def.rarity, element: def.element,
        grade: 0, copies: 0, potential: [],
        instId: `${def.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, bornAt: Date.now(),
      }
      newPets.push(inst)
      byId.set(inst.id, inst)
      isNew = true
    }
    summary.push({ id: def.id, name: def.name, rarity: def.rarity, emoji: def.emoji, isNew, toDust })
  }
  summary.sort((a, b) => RANK[b.rarity] - RANK[a.rarity])
  return { pets: newPets, summary, dust }
}
