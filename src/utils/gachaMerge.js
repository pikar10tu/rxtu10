// รวมผลสุ่มกาชาเข้า pets[] (species-based: ตัวใหม่ unlock, ซ้ำ +copies) — pure
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

export function mergeRolls(pets, results, catalog) {
  const newPets = (pets || []).map((p) => ({ ...p }))
  const byId = new Map(newPets.map((p) => [p.id, p]))
  const summary = []
  for (const r of results) {
    const def = catalog.find((p) => p.id === r.id)
    if (!def) continue
    let isNew = false
    if (byId.has(def.id)) {
      const p = byId.get(def.id)
      p.copies = (p.copies || 0) + 1
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
    summary.push({ id: def.id, name: def.name, rarity: def.rarity, emoji: def.emoji, isNew })
  }
  summary.sort((a, b) => RANK[b.rarity] - RANK[a.rarity])
  return { pets: newPets, summary }
}
