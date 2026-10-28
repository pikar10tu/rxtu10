  // ═══════════ BOSS MODE (sim · ประกอบจากเอนจินจริงด้วย build-engine.mjs) ═══════════
  if (opts.boss) {
  const cfg = opts.boss
  const boss = B[0]
  const bst = psOf(boss)
  boss.maxHp *= cfg.hpMul; boss.hp = boss.maxHp; boss.atk *= cfg.atkMul
  boss.immune = bossImmune(cfg.allow || [])
  for (const m of B.slice(1)) { m.maxHp *= cfg.hpMul * 0.08; m.hp = m.maxHp; m.atk *= cfg.atkMul * 0.4 }
  const T = cfg.tier
  const night = T === 3
  const actions = cfg.actions ?? (night ? 2 : 1)
  let enrage = 1
  const stats = { smash: 0, doomKill: 0, cleanse: 0, breaks: 0, dmg: {} }
  const doomOf = (u) => u.ps?.doomT || 0
  const frozenBoss = () => ((boss.ps?.status?.freeze || []).length > 0)

  bossHook = (att, tg, r) => {
    if (tg !== boss) return
    if (cfg.kind === 'shield' && bst.shield > 0) {
      r.dmg = 0; r.pierce = 0; r.pierceHits = []
      if (!r.dodged) {
        bst.shield -= 1
        boss.atk *= 1 + (cfg.grow ?? [0, 0.02, 0.03, 0.04][T])
        if (bst.shield === 0) { stats.breaks++; bst.skip = (bst.skip || 0) + 1; bst.brokeAt = round }
      }
      return
    }
    let m = 1
    if (cfg.kind === 'hammer' && frozenBoss()) m *= cfg.freezeMult ?? 1.5
    if (cfg.kind === 'doom' && bst.weakUntil >= round) m *= cfg.weakMult ?? 1.3
    r.dmg *= m
    stats.dmg[att.id] = (stats.dmg[att.id] || 0) + r.dmg
  }

  if (cfg.kind === 'shield') bst.shield = cfg.shield ?? [0, 6, 10, 15][T]
  const lockPick = () => alive(A).reduce((b, u) => (!b || u.maxHp > b.maxHp ? u : b), null)
  if (cfg.kind === 'hammer') bst.lock = lockPick()

  const bossHit = (target, mult) => {
    let m = elementMult(boss.element, target.element)
    m *= 1 + (rand() * 2 - 1) * variance
    m *= (1 + (target.vuln || 0))
    return strike(boss, target, A, boss.atk * enrage * mult * m, { crit: false, eff: 'neutral' }, false, false)
  }
  const bossAction = () => {
    if (boss.hp <= 0 || !alive(A).length) return
    if (bst.skip > 0) { bst.skip -= 1; if (cfg.kind === 'hammer') bst.count = 0; return }
    const sk = consumeSkip(boss)
    if (sk) { if (cfg.kind === 'hammer') bst.count = 0; return }
    if (cfg.kind === 'hammer') {
      if (!bst.lock || bst.lock.hp <= 0 || bst.lock.ps?.away) {
        bst.lock = lockPick()
        if (T >= 2) enrage *= cfg.lockRage ?? 1.3
      }
      if (!bst.lock) return
      bst.count = (bst.count || 0) + 1
      const every = night && boss.hp < boss.maxHp / 2 ? (cfg.everyLow ?? 2) : (cfg.every ?? [0, 4, 3, 3][T])
      if (bst.count >= every) {
        bst.count = 0; stats.smash++
        const tg = bst.lock, slot = A.indexOf(tg)
        // ทุบรัว: smashHits ครั้ง ครั้งละ smashPer (🤖 เก็บสแตคระหว่างทุบ · ☄️ โล่พรกันได้แค่ครั้งแรก)
        for (let h = 0; h < (cfg.smashHits ?? 1); h++) { if (tg.hp <= 0 || tg.ps?.away) break; bossHit(tg, cfg.smashPer ?? cfg.smashMult) }
        if (night && cfg.splash !== false) for (const j of [slot - 1, slot + 1]) { const n = A[j]; if (n && n.hp > 0 && !n.ps?.away) bossHit(n, (cfg.smashPer ?? cfg.smashMult) * (cfg.smashHits ?? 1) * 0.3) }
      } else bossHit(bst.lock, 1)
      return
    }
    // 2 แอคชั่น/รอบ = ตีไม่ซ้ำเป้า (user 28 ต.ค.) · เหลือตัวเดียว = ตัวเดิม
    const pool = targetableFoes(A)
    const rest = pool.filter(u => u !== bst.lastTg)
    const tg = pick(rest.length ? rest : pool)
    bst.lastTg = tg
    if (!tg) return
    bossHit(tg, cfg.kind === 'doom' && doomOf(tg) > 0 ? 1.5 : 1)
  }
  const doomKill = (u) => {
    stats.doomKill++
    if (cfg.doomPct) { u.hp -= u.maxHp * cfg.doomPct / 100; if (u.hp <= 0) resolveSilentDeath(u, boss); return }
    // ตายแน่นอน: 🐱 🧞 กันไม่ได้ · 🐦‍🔥 ฟื้นได้
    const st = psOf(u); const saved = { g: st.grit }
    st.grit = 0
    const genies = A.filter(g => g.id === 'genie'); const gu = genies.map(g => psOf(g).uses)
    genies.forEach(g => { psOf(g).uses = 99 })
    u.hp = 0
    resolveSilentDeath(u, boss)
    genies.forEach((g, i) => { psOf(g).uses = gu[i] })
    if (u.hp > 0) st.grit = saved.g
  }
  // โรคร้าย = สถานะ 'doom' n=1 (🦄 cleanseOne / ☄️ cleanseAll ล้างได้) + ตัวจับเวลา ps.doomT
  const checkCleansed = () => {
    for (const u of A) if (u.ps?.doomT > 0 && !((u.ps.status?.doom || []).length > 0)) { u.ps.doomT = 0; if (u.hp > 0) { stats.cleanse++; bst.weakUntil = round + 1 } }
  }
  const bossRoundEnd = () => {
    for (const e of [...runOnRoundEnd(A, B, rand), ...runOnRoundEnd(B, A, rand)]) log.push(e)
    checkCleansed()
    if (cfg.kind === 'doom') {
      for (const u of alive(A)) if (u.ps.doomT > 0) { u.ps.doomT -= 1; if (u.ps.doomT === 0) { delete u.ps.status.doom; doomKill(u) } }
      const every = cfg.doomEvery ?? (T === 1 ? 2 : 1)
      if (round % every === 0) {
        const n = cfg.doomN ?? (night ? 2 : 1)
        let dur = cfg.doomDur ?? [0, 3, 2, 2][T]
        if (night && boss.hp < boss.maxHp / 2) dur = Math.max(1, dur - 1)
        const cand = alive(A).filter(u => !(doomOf(u) > 0)).sort((a, b) => b.atk - a.atk).slice(0, n)
        for (const u of cand) { applyStatus(u, 'doom', { n: 99, from: boss }); u.ps.doomT = dur }
      }
    }
    if (cfg.kind === 'shield' && cfg.regen && bst.shield === 0 && T >= 2 && round - bst.brokeAt >= (cfg.regen ?? (T === 2 ? 3 : 2))) bst.shield = cfg.shield ?? [0, 6, 10, 15][T]
    if (cfg.kind === 'shield' && bst.shield > 0 && cfg.growRound) boss.atk *= 1 + cfg.growRound   // โล่ยังอยู่ = บอสโตทุกรอบ (ตีช้า = โดนหนัก)
    const ra = cfg.rageAt ?? 10
    if (round >= ra && (round - ra) % 3 === 0) enrage *= cfg.rage ?? 1.2
  }

  const maxR = cfg.maxRounds ?? 30
  while (alive(A).length && boss.hp > 0 && round < maxR) {
    round++; log.push({ t: 'round', n: round })
    for (const u of [...A, ...B]) { const h = u.ps?.ufo; if (h && u.hp > 0 && round - h.round >= ufoVal(u).hits) ufoRelease(u, true) }
    for (const e of [...runOnRound(A), ...runOnRound(B)]) log.push(e)
    checkCleansed()
    for (const att of A) {
      if (att.hp <= 0 || att.ps?.away || boss.hp <= 0) continue
      const st = psOf(att)
      const sk = consumeSkip(att)
      if (sk) { if (sk.selfDmg > 0) statusHurt(att, sk.selfDmg, 'fear', sk.dmgFrom, sk.left.fear) }
      else if (windupOf(att) && !st.wound) st.wound = true
      else {
        const wu = windupOf(att)
        if (wu) { st.wound = false; st.smashing = true }
        let killed = hit(att, B)
        if (killed) for (const e of runOnKill(att, A, B).events) log.push(e)
        if (wu && killed && att.hp > 0 && alive(B).length) { killed = hit(att, B); if (killed) for (const e of runOnKill(att, A, B).events) log.push(e) }
        if (wu) st.smashing = false
      }
      if (att.hp > 0) runTurnEnd(att)
      checkCleansed()
      if (cfg.kind === 'shield') for (const m of B.slice(1)) if (m.hp <= 0 && !psOf(m)._counted) { psOf(m)._counted = true; bst.shield += cfg.minionShield ?? 3 }
    }
    bst.lastTg = null
    for (let k = 0; k < actions; k++) bossAction()
    if (boss.hp > 0) runTurnEnd(boss)
    for (const m of B.slice(1)) if (m.hp > 0 && !m.ps?.away && alive(A).length) {
      if (consumeSkip(m)) continue
      hit(m, A)
      if (m.hp > 0) runTurnEnd(m)
    }
    releaseStranded()
    if (alive(A).length && boss.hp > 0) bossRoundEnd()
  }
  const win = boss.hp <= 0 && alive(A).length > 0
  return { win, rounds: round, stats, bossHpPct: Math.max(0, boss.hp / boss.maxHp) }
  }

