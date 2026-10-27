  // ═══════════ BOSS MODE (sim prototype) ═══════════
  // B[0] = บอส · B[1..] = ลูกน้อง · cfg = opts.boss
  const cfg = opts.boss
  const boss = B[0]
  const bst = psOf(boss)
  boss.maxHp *= cfg.hpMul; boss.hp = boss.maxHp; boss.atk *= cfg.atkMul
  for (const m of B.slice(1)) { m.maxHp *= cfg.hpMul * 0.08; m.hp = m.maxHp; m.atk *= cfg.atkMul * 0.4 }
  const T = cfg.tier
  const night = T === 3
  const actions = night ? 2 : 1
  let round = 0
  let enrage = 1
  const stats = { smash: 0, doomKill: 0, cleanse: 0, breaks: 0 }

  // --- hook ตอนโดนตี (โล่ · แช่แข็ง ×1.5 · อ่อนแรง) ---
  opts.onHitHook = (att, tg, r) => {
    if (tg !== boss) return
    if (cfg.kind === 'shield' && bst.shield > 0) {
      r.dmg = 0; r.pierce = 0; r.pierceHits = []
      if (!r.dodged) {
        bst.shield -= 1
        boss.atk *= 1 + [0, 0.02, 0.03, 0.04][T]
        if (bst.shield === 0) { stats.breaks++; bst.skip = (bst.skip || 0) + 1; bst.brokeAt = round }
      }
      return
    }
    let m = 1
    if (cfg.kind === 'hammer' && bst.skip > 0) m *= 1.5
    if (cfg.kind === 'doom' && bst.weakUntil >= round) m *= 1.3
    r.dmg *= m
  }

  // --- ตั้งต้นบอส ---
  if (cfg.kind === 'shield') bst.shield = [0, 6, 10, 15][T]
  const maxHpOf = (u) => u.maxHp
  if (cfg.kind === 'hammer') bst.lock = alive(A).reduce((b, u) => (!b || maxHpOf(u) > maxHpOf(b) ? u : b), null)

  const bossHit = (target, mult) => {
    let m = elementMult(boss.element, target.element)
    m *= 1 + (rand() * 2 - 1) * variance
    m *= (1 + (target.vuln || 0))
    return strike(boss, target, A, boss.atk * enrage * mult * m, { crit: false, eff: 'neutral' }, false, false)
  }

  const bossAction = () => {
    if (boss.hp <= 0 || !alive(A).length) return
    if (bst.skip > 0) { bst.skip -= 1; if (cfg.kind === 'hammer') bst.count = 0; return }
    if (cfg.kind === 'hammer') {
      if (!bst.lock || bst.lock.hp <= 0) {
        bst.lock = alive(A).reduce((b, u) => (!b || u.maxHp > b.maxHp ? u : b), null)
        if (T >= 2) enrage *= 1.3
      }
      bst.count = (bst.count || 0) + 1
      const every = night && boss.hp < boss.maxHp / 2 ? 2 : [0, 4, 3, 3][T]
      if (bst.count >= every) {
        bst.count = 0; stats.smash++
        const tg = bst.lock
        const slot = A.indexOf(tg)
        bossHit(tg, cfg.smashMult)
        if (night) for (const j of [slot - 1, slot + 1]) { const n = A[j]; if (n && n.hp > 0) bossHit(n, cfg.smashMult * 0.3) }
      } else bossHit(bst.lock, 1)
      return
    }
    const tg = pick(A)
    if (!tg) return
    const doomed = cfg.kind === 'doom' && psOf(tg).doom > 0
    bossHit(tg, doomed ? 1.5 : 1)
  }

  // --- เช็คล้างโรค: ยูนิคอร์นฟื้นตัวที่ติดโรค = ล้าง (กติกาใหม่: ล้างสถานะร้ายอย่างละ 1 รวมโรค) ---
  let scanFrom = log.length
  const scanCleanse = () => {
    for (let k = scanFrom; k < log.length; k++) {
      const e = log[k]
      if (e.t === 'passive' && e.effect === 'healOnAttack') for (const uid of e.targets || []) {
        const u = A.find(x => x.uid === uid)
        if (u && psOf(u).doom > 0) { psOf(u).doom = 0; stats.cleanse++; bst.weakUntil = round + 1 }
      }
    }
    scanFrom = log.length
  }

  const doomKill = (u) => {
    // โรคร้าย: 🐱 🧞 กันไม่ได้ (ปิดสิทธิ์ชั่วคราว) · ฟีนิกซ์ก็ถูกปิดไปด้วยในซิมนี้ (ประมาณ)
    const st = psOf(u); const saved = { g: st.grit, uses: st.uses }
    st.grit = 0; st.uses = 99
    const genies = A.filter(g => g.id === 'genie'); const gu = genies.map(g => psOf(g).uses)
    genies.forEach(g => { psOf(g).uses = 99 })
    u.hp = 0
    resolveSilentDeath(u, boss)
    genies.forEach((g, i) => { psOf(g).uses = gu[i] })
    if (u.hp > 0) { st.grit = saved.g; st.uses = saved.uses }
    stats.doomKill++
  }

  const roundEnd = () => {
    for (const e of [...runOnRoundEnd(A, B, rand), ...runOnRoundEnd(B, A, rand)]) log.push(e)
    if (cfg.kind === 'doom') {
      for (const u of alive(A)) { const st = psOf(u); if (st.doom > 0) { st.doom -= 1; if (st.doom === 0) doomKill(u) } }
      const every = T === 1 ? 2 : 1
      if (round % every === 0) {
        const n = night ? 2 : 1
        let dur = [0, 3, 2, 2][T]
        if (night && boss.hp < boss.maxHp / 2) dur = 1
        const cand = alive(A).filter(u => !(psOf(u).doom > 0)).sort((a, b) => b.atk - a.atk).slice(0, n)
        for (const u of cand) psOf(u).doom = dur
      }
    }
    if (cfg.kind === 'shield' && bst.shield === 0 && T >= 2 && round - bst.brokeAt >= (T === 2 ? 3 : 2)) bst.shield = [0, 6, 10, 15][T]
    if (round >= 10 && (round - 10) % 3 === 0) enrage *= 1.2
  }

  while (alive(A).length && boss.hp > 0 && round < 40) {
    round++; log.push({ t: 'round', n: round })
    for (const e of [...runOnRound(A), ...runOnRound(B)]) log.push(e)
    for (const att of A) {
      if (att.hp <= 0 || boss.hp <= 0) continue
      const st = psOf(att)
      if (st.skip > 0) { st.skip -= 1; continue }
      if (windupOf(att) && !st.wound) { st.wound = true; continue }
      const wu = windupOf(att)
      if (wu) { st.wound = false; st.smashing = true }
      let killed = hit(att, B)
      if (killed) for (const e of runOnKill(att, A, B).events) log.push(e)
      if (wu && killed && att.hp > 0 && alive(B).length) { killed = hit(att, B) }
      if (wu) st.smashing = false
      scanCleanse()
      // ลูกน้องตาย = โล่ +3
      if (cfg.kind === 'shield') for (const m of B.slice(1)) if (m.hp <= 0 && !psOf(m)._counted) { psOf(m)._counted = true; bst.shield += 3 }
    }
    for (let k = 0; k < actions; k++) bossAction()
    for (const m of B.slice(1)) if (m.hp > 0 && alive(A).length) {
      const tg = pick(A); if (tg) strike(m, tg, A, m.atk * enrage * elementMult(m.element, tg.element), { crit: false, eff: 'neutral' }, false, false)
    }
    if (alive(A).length && boss.hp > 0) roundEnd()
  }
  const win = boss.hp <= 0 && alive(A).length > 0
  return { win, rounds: round, stats, bossHpPct: Math.max(0, boss.hp / boss.maxHp) }
}
