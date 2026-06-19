// petMigration — pure: รวม/รีสกิล/คืนเหรียญ เพ็ทเดิม → โมเดล species-based ใหม่ (เกรด I-V)
const REFUND = { common: 500, rare: 2500, epic: 8000, legendary: 25000 }
const scaleGrade = (g) => Math.min(5, Math.max(0, Math.round((g || 0) * 5 / 12)))
const refundOf = (rarity, grade) => Math.round((REFUND[rarity] || 0) * (1 + (grade || 0) * 0.1))

export function migratePets(oldPets, oldActive, catalogIds, defOf) {
  const list = Array.isArray(oldPets) ? oldPets : []
  let refundCoins = 0
  const byId = new Map()                 // id → array ของ instance ที่อยู่ใน catalog
  const instToId = new Map()             // instId → species id (ตัวที่รอด)

  for (const p of list) {
    if (!p || !p.id) continue
    if (!catalogIds.has(p.id)) {         // ถูกตัด → refund (rarity เดิม)
      refundCoins += refundOf(p.rarity, p.grade)
      continue
    }
    const def = defOf(p.id)
    // rarity nerf → คืนส่วนต่าง (เทียบ rarity เดิม vs ใหม่)
    if (p.rarity && def && p.rarity !== def.rarity) {
      const diff = (REFUND[p.rarity] || 0) - (REFUND[def.rarity] || 0)
      if (diff > 0) refundCoins += Math.round(diff * (1 + (p.grade || 0) * 0.1))
    }
    if (!byId.has(p.id)) byId.set(p.id, [])
    byId.get(p.id).push(p)
    if (p.instId) instToId.set(p.instId, p.id)
  }

  const pets = []
  for (const [id, group] of byId) {
    const def = defOf(id)
    const maxGrade = scaleGrade(Math.max(...group.map(g => g.grade || 0)))
    const extraCopies = group.length - 1 + group.reduce((s, g) => s + (g.copies || 0), 0)
    const primary = group[0]
    pets.push({
      id,
      grade: maxGrade,
      copies: extraCopies,
      instId: primary.instId || `${id}_${Date.now()}`,
      bornAt: primary.bornAt || Date.now(),
      potential: Array.isArray(primary.potential) ? primary.potential : [],
      // refresh identity จาก catalog (reskin/rarity/element ใหม่มีผลทันที)
      emoji: def.emoji, name: def.name, rarity: def.rarity, element: def.element,
    })
  }

  // activePets: instId/id เดิม → species id ที่ยังมี
  const ownedIds = new Set(pets.map(p => p.id))
  const activePets = []
  for (const a of (oldActive || [])) {
    const ref = (typeof a === 'string') ? a : a?.instId
    const sid = instToId.get(ref) || (ownedIds.has(ref) ? ref : null)
    if (sid && ownedIds.has(sid) && !activePets.includes(sid)) activePets.push(sid)
  }

  return { pets, activePets, refundCoins }
}
