// ════════════════════════════════════════════════════════════
//  Battle engine — pure + deterministic (seeded) · พอร์ตจาก
//  scripts/battle-sim.mjs (resolve) + บันทึก log ทุก action ให้ UI replay
//  ไม่มี side effect — ไม่อ่าน store/Firestore/Date.now
// ════════════════════════════════════════════════════════════
import { BATTLE_CFG, buildCombatant } from '../data/battle.js'
import { elementBeats } from '../data/index.js'
import { weeklyRules, statMult } from '../data/pvpWeekly.js'
import {
  applyForms, runSetup, applyAuras, initHunt, runOnStart, runOnRound, runOnRoundEnd, runOnAttack, runOnHit, runOnDealt, runOnDeath, runOnKill, runOnAnyDeath, runOnDied, statsSnapshot,
  tauntTargetOf, psOf, windupOf, targetableFoes, storedPowerMult,
} from './battlePassives.js'
import { PET_PASSIVES, partWithEffect, passiveValueAt } from '../data/petPassives.js'
import { STATUSES } from '../data/statuses.js'
import { applyStatus, isImmune, consumeSkip, consumeBlessShield, turnEndTicks, statusAtkMult, statusDmgTakenMult, canHeal, clearOnDeath } from './battleStatus.js'

// mulberry32 — RNG เดียวกับ sim
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 🛸 "บนสนาม" = ยังไม่ตาย และไม่ถูกยูเอฟโอดูดอยู่ (ps.away) — ตัดสินแพ้ชนะยังดูเลือดจริงผ่าน releaseStranded()
const alive = (t) => t.filter(f => f.hp > 0 && !f.ps?.away)

/** teamA/teamB = array ของ {id,rarity,element,grade} (≤4) · seed = int */
export function simulateBattle(teamA, teamB, seed, opts = {}) {
  const rand = rng(seed)
  // 🗓️ เอฟเฟกต์ประจำสัปดาห์ (data/pvpWeekly.js) — useArena ส่ง opts.weekly มาเฉพาะ PvP · ไม่ส่ง = ไฟต์ปกติเป๊ะ
  const W = weeklyRules(opts.weekly) || {}
  const build = (p, i, side) => {
    const u = { ...buildCombatant(p), id: p?.id, rarity: p?.rarity || 'common', slot: i, uid: `${side}${i}`, side }
    const m = statMult(W, u, i)
    if (m.atk !== 1) u.atk *= m.atk
    if (m.hp !== 1) { u.maxHp *= m.hp; u.hp = u.maxHp }
    // 🏯 หอคอยเกิน 100 (Endless) — บอทคูณ atk/hp ตามชั้น (towerFloors.endlessBoost) · ไม่มี boost = ไฟต์ปกติเป๊ะ
    //    ดันเจี้ยนใช้ boost < 1 ด้วย (มอนอ่อนกว่าค่าฐาน) — หอคอยส่งแค่ > 1 จึงเหมือนเดิมเป๊ะ
    if (p?.boost > 0 && p.boost !== 1) { u.atk *= p.boost; u.maxHp *= p.boost; u.hp = u.maxHp }
    // 🤖 โรบอท: เริ่มการต่อสู้ เลือดสูงสุด +hp% (สเปก §8.2) — ใส่ก่อน base = เลขบนการ์ดเป็นค่าที่บวกแล้ว
    { const rp = partWithEffect(PET_PASSIVES[u.id], 'adaptArmor')
      if (rp) { const v = passiveValueAt(rp, u.passiveLv); u.maxHp *= 1 + v.hp / 100; u.hp = u.maxHp; u.atk *= 1 - (v.weak || 0) / 100 } }
    // 🐲 บอสต้านทานสถานะ (data/statuses.js bossImmune) · startStatus = สถานะติดตัวตั้งแต่เริ่ม (กลไกบอส/เทส)
    if (p?.immune) u.immune = [...p.immune]
    if (p?.startStatus) for (const x of p.startStatus) applyStatus(u, x.id, { n: x.n, val: x.val })
    return u
  }
  const A = (teamA || []).map((p, i) => build(p, i, 'A'))
  const B = (teamB || []).map((p, i) => build(p, i, 'B'))
  // เลขตั้งต้นบนการ์ด = หลังตัวคูณประจำสัปดาห์ แต่ก่อนสกิลทุกตัว — UI บวกส่วนต่างของ statsAfter ต่อจากนี้
  // (เดิม UI คำนวณเองจาก buildCombatant ⇒ PvP สัปดาห์ที่คูณ atk/hp เลขบนการ์ดผิดทั้งไฟต์)
  const base = statsSnapshot(A, B)
  const critRate = BATTLE_CFG.critRate + (W.critAdd || 0)
  const critMult = W.critMult || BATTLE_CFG.critMult
  const variance = W.variance ?? BATTLE_CFG.variance
  const adv = W.elementAdv || BATTLE_CFG.elementAdv
  const elementMult = (a, d) => {
    const [x, y] = W.invertElements ? [d, a] : [a, d]
    if (elementBeats(x, y)) return adv
    if (elementBeats(y, x)) return BATTLE_CFG.elementDis
    return 1
  }
  const log = []

  // ── ลำดับ hook ที่ห้ามสลับ (สเปก §B): forms → setup → aura → onStart → [onRound] → onAttack → onHit → onDeath → onKill ──
  applyForms(A); applyForms(B)   // ร่างพิเศษตามองค์ประกอบทีม (🌍 องศา) — ต้องก่อน setup/aura
  // setup ต้องมาก่อน aura — stealStats เปลี่ยนเลขดิบที่ออร่าจะไปคูณต่อ
  for (const e of [...runSetup(A, B), ...runSetup(B, A)]) log.push(e)
  const auraEvents = [...applyAuras(A, B), ...applyAuras(B, A)]
  for (const e of auraEvents) log.push(e)
  // 🦖 hunt (ทีเร็กซ์) ต้องจับฐาน atk "หลัง" aura ทั้งหมด — ไม่งั้นซอล/สิงโต/วาฬที่คูณ atk ทีหลัง
  //    จะไม่ถูกนับรวมในฐานของชั้นที่สะสมทั้งไฟต์ (ดู initHunt ใน battlePassives.js)
  initHunt(A); initHunt(B)
  // สเตตัสหลัง aura ก่อนหมัดแรก = "ตัวหารจริง" ของหลอดเลือดฝั่ง UI
  // (targetHpAfter ใน log อยู่บนสเกลนี้ ไม่ใช่ค่าดิบ — ใช้ค่าดิบแล้วทีมที่มีคุณวาฬหลอดจะเกิน 100%)
  const units = statsSnapshot(A, B)

  // ═══════════════════════════════════════════════════════════════════════
  // 🔴 สเปก §7.6 (6 ก.ย. 2026): "การตายทุกทางต้องนับเป็นการตาย · ใครสร้างดาเมจ คนนั้นคือผู้ฆ่า"
  //    หนาม (thorns) · เกราะสะท้อน (armorStack) เกิด "ข้างใน" strike() ที่ยังไม่จบ — ต้องยกธง/strike()/
  //    resolveSilentDeath ขึ้นมาไว้ "ก่อน" onStart แล้ว เพราะ aoeOpener (บาฮามุท, ยิงก่อนรอบ 1) ก็ฆ่าได้
  //    เงียบๆ เหมือนกัน และต้องใช้ strike()/resolveSilentDeath ตัวเดียวกันกับที่ strike() เรียกตอนจบตัวเอง
  //    (ย้ายมาจากตำแหน่งเดิมหลัง onStart — ของเดิมไม่เคยต้องใช้ strike() ก่อน onStart เพราะยังไม่มีใครฆ่าใคร
  //    แบบเงียบตอนนั้น)
  // ═══════════════════════════════════════════════════════════════════════

  // กันเกราะสะท้อนชนกันไปมา: ระหว่างยิงก้อนสะท้อน ห้ามมีก้อนสะท้อนใหม่เกิดขึ้นอีกชั้น
  let reflecting = false
  // 🔴 P2c-1 Task 6 (รีวิวรอบ 1): แยกจาก `reflecting` เพราะความหมายคนละเรื่อง — ถ้าใช้ธงเดียวกัน
  //    หมัดสวนของฟีนิกซ์ที่ลงบนตัวมีเกราะ (armorStack) จะกินสแตคเกราะไปฟรีๆ (runOnHit คิด res.reflect
  //    ให้แล้ว) แต่เอนจินไม่ยิงก้อนสะท้อนนั้นเลย เพราะบล็อกเกราะเช็ค `!reflecting` ซึ่งบล็อกหมัดสวนตั้งเป็น
  //    true ไปแล้วครอบไว้ทั้งก้อน ⇒ เกราะจ่ายสแตคแต่ไม่ได้อะไรกลับ ทุกครั้งที่ฟีนิกซ์สวนใส่ตัวมีเกราะ
  //    (บรีฟเดิมสั่งให้ใช้ธงเดียวกับ armorStack ตรงๆ — user เคาะแก้เอง 5 ก.ย. ไม่ใช่การตีความของ agent)
  //    `countering` = หมัดสวนของฟีนิกซ์กำลังบิน · `reflecting` ยังคงความหมายเดิมเป๊ะ (ก้อนสะท้อนเกราะกำลังบิน)
  //    บล็อกเกราะยังเช็คแค่ `!reflecting` เหมือนเดิม (กันเกราะสะท้อนชนกันเอง) — เกราะที่โดนหมัดสวนจึง
  //    สะท้อนกลับได้ตามปกติ (นั่นคือเป้าหมายของการแก้) ส่วนบล็อกหมัดสวนเช็คทั้งสองธง (`!reflecting &&
  //    !countering`) กันสามทาง: ฟีนิกซ์สองตัวสวนกันไม่รู้จบ (countering กันเอง) และหมัดสวนไม่เกิดซ้อนใน
  //    ก้อนสะท้อนเกราะของตัวเอง (reflecting กัน) — แต่ปล่อยให้เกราะที่โดนหมัดสวนสะท้อนกลับได้จริง
  let countering = false
  // 👽 หมัดควบคุมจิตใจกำลังบิน — คนฆ่าของหมัดนี้ = เอเลี่ยน ไม่ใช่ตัวที่ถูกควบคุม (สเปก §2.3)
  let controlBy = null
  let lastDodged = false

  /** หักเลือด 1 ครั้ง + บันทึก log · คืน true ถ้าเป้าตายจริง (ผ่าน onDeath แล้ว)
   *  forced = หมัดนี้ลงบนเป้าที่ถูก taunt บังคับมา (ไม่ใช่เป้าที่เลือกเอง) — ส่งต่อให้ runOnHit ตัดสินใจลดดาเมจ
   *  🔴 เป้ารองของ cleave และดาเมจสะท้อนของ armorStack ไม่ใช่หมัดที่ถูกบังคับ ⇒ เรียก strike() โดยไม่ส่ง forced (= false) */
  const strike = (att, tg, foes, mult, tier, sub, forced = false) => {
    const before = tg.hp
    // onHit: guardian (เพื่อนรับแทน) → dodge → ลดดาเมจ → หนาม  (มุมของ "ผู้รับ" ล้วน)
    const attTeam = att.side === 'A' ? A : B
    const hitRes = runOnHit(tg, Math.max(0, mult), att, foes, rand, forced)
    for (const e of hitRes.events) log.push(e)
    // 🤖 โรบอท: ลดดาเมจจากสายของคนตี ตามชั้นที่สะสมของสายนั้น · หมัดที่โดนจริง (dmg > 0) ค่อยสะสมเพิ่ม
    //    (หมัดแรกจากสายใหม่ยังเต็ม · หลบ/เกราะกัน = ไม่นับ · หมัดลูกนับทุกครั้ง) · ไม่ยิง event (เลี่ยงจังหวะช้า)
    { const rp = partWithEffect(PET_PASSIVES[tg.id], 'adaptArmor')
      if (rp && hitRes.dmg > 0 && att.element) {
        const v = passiveValueAt(rp, tg.passiveLv), st = psOf(tg)
        const ad = st.adapt || (st.adapt = {})
        const cur = ad[att.element] || 0
        hitRes.dmg *= 1 - cur / 100
        ad[att.element] = Math.min(v.max, cur + v.pct)
      } }
    // ☄️ โล่พร: หมัดแรกที่โดนจริง (หลังหลบ/เกราะ/ลดดาเมจ) เบาลง · ไม่ลดหนาม/สะท้อน/ดาเมจทะลุ
    { const bs = consumeBlessShield(tg, hitRes.dmg)
      if (bs.used) {
        hitRes.dmg = bs.dmg
        log.push({ t: 'passive', uid: tg.uid, side: tg.side, petId: tg.id, name: STATUSES.blessShield.name, icon: STATUSES.blessShield.icon,
          effect: 'statusTick', statusId: 'blessShield', left: 0, targets: [tg.uid], fxKind: 'guard', amount: 0 })
      } }
    // onDealt: ผลฝั่ง "ผู้ตี" ที่ต้องรู้ดาเมจจริง (healOnAttack / teamLifesteal)
    // 🔒 ต้อง push ต่อท้าย hitRes.events ทันที — ลำดับ event ใน log คือสิ่งที่รีเพลย์เล่าตามตรงๆ
    if (att.side !== tg.side) for (const e of runOnDealt(att, attTeam, hitRes.dmg + hitRes.pierce).events) log.push(e)   // 👽 ตีเพื่อน = ไม่ดูดเลือด/ไม่ฟื้น
    tg.hp -= hitRes.dmg
    // ดาเมจทะลุ (infect) — หักหลังสายลดจบแล้ว จึงไม่โดน guardian/dodge/DR/เกราะ
    // ยังอยู่ใน beat เดิม และ attack event คิด dmg จาก before-after อยู่แล้ว หลอดเลือดจึงตรงเอง
    if (hitRes.pierce > 0) tg.hp -= hitRes.pierce
    if (hitRes.thorns > 0) att.hp -= hitRes.thorns
    // เกราะสะท้อน — ใส่ศัตรูทุกตัวของผู้รับ ผ่าน strike() ปกติ (โดนสายลดของฝั่งนั้นตามสเปก)
    // 🔒 sub: true ⇒ อยู่ beat เดิม ไม่เพิ่มจังหวะ · reflecting กันไม่ให้เกราะฝั่งตรงข้ามสะท้อนกลับมาวนไม่รู้จบ
    // ⚠️ ต้อง finally: ถ้าอะไรใน strike/runOnHit/runOnDeath/runOnAnyDeath ที่ซ้อนอยู่ throw ขึ้นมา
    //    แล้วไม่มี finally, reflecting จะค้าง true ไปตลอดไฟต์ที่เหลือ ⇒ เกราะทุกตัวหลังจากนั้นเงียบสนิทไม่มีใครรู้
    // 🔑 ตั้งใจให้อยู่ "ก่อน" การเช็คตายของตัวที่มีเกราะ (let dead = ... ข้างล่าง) — เกราะโปรกในหมัดที่
    //    ฆ่าเจ้าของมันเอง (เช่นโดนเชื้อระเบิดผ่าน pierce ในหมัดเดียวกัน) ก็ยังต้องสะท้อนครบทั้งชุด
    //    เพราะมันโปรกไปแล้วตอนรับหมัดนั้น ⇒ **ไม่ใช่บั๊ก อย่า "แก้" ด้วยการเลื่อนลงไปใต้ if (dead)**
    if (hitRes.reflect > 0 && !reflecting) {
      reflecting = true
      try {
        const victims = alive(att.side === 'A' ? A : B)
        for (const v of victims) {
          // 🔴 victims เป็น snapshot ตั้งแต่ก่อนเข้าลูป แต่เป้าตายกลางลูปได้จริง (เช่นไปรับแทนเพื่อน
          //    ตามกฎ guardian ในก้อนสะท้อนใบก่อนหน้า) — ตีศพซ้ำ = runOnDeath รอบสอง อาจกินสิทธิ์
          //    revive ทิ้งฟรี · ลูป cleave ของ hit() กันด้วยเช็คเดียวกันนี้อยู่แล้ว
          if (v.hp <= 0) continue
          strike(tg, v, att.side === 'A' ? A : B, hitRes.reflect, { crit: false, eff: 'neutral' }, true)
        }
      } finally {
        reflecting = false
      }
    }

    // 🔴 รีวิวรอบ 2 (6 ก.ย.): ตายหนึ่งครั้งต้องรันฮุคครั้งเดียว — ทางเดินซ้อน (X ตี Y ที่มีเกราะสะท้อน ⇒
    //    Y ยิงสะท้อนใส่ v ผ่าน strike() ชั้นใน ⇒ Y โดนหนามของ v สวนตายกลางชั้นใน ⇒ resolveSilentDeath
    //    รันฮุคของ Y ไปแล้วรอบหนึ่งด้วยผู้ฆ่า=v) ทำให้ tg ของ strike() ชั้นนอกนี้ (=Y ตัวเดียวกัน) ตายอยู่แล้ว
    //    ตอนมาถึงบรรทัดนี้ ⇒ ต้องเรียก resolveSilentDeath ตัวเดียวกัน (ไม่ใช่ลอจิกซ้ำ) เพื่อให้ธงกันซ้ำ
    //    (_deathDone ใน resolveSilentDeath) ทำงาน ไม่งั้นทีเร็กซ์ได้ 2 ชั้นจากศพเดียว (บั๊กเดิมของ P2c-1
    //    ที่เพิ่งแก้ไปแล้วครั้งหนึ่ง — คนละจุดแต่รูปแบบเดียวกัน)
    // 🔴 26 ก.ย. (user เห็นในรีเพลย์): ใบหมัดต้อง push "ก่อน" resolveSilentDeath — เดิม push หลัง ⇒
    //    ฟื้นชีพ/หมัดสวนของฟีนิกซ์ · กันตายของแมว/ภูต · ชั้นทีเร็กซ์ ไปนั่ง "ก่อน" หมัดที่ฆ่าใน log (ผลก่อนเหตุ)
    //    และ dmg = before − เลือดหลังฟื้น ติดลบ (ฟีนิกซ์ -19 บนจอเป็น "-0" + หลอดขึ้น)
    //    เลือดที่บันทึกคือ "ตอนโดน" (hpAtHit) · dead ใส่ทีหลังเพราะต้องรู้ผลของ runOnDeath ก่อน
    const hpAtHit = tg.hp
    const entry = {
      t: 'attack', side: att.side, attacker: att.uid, target: tg.uid,
      ...(forced ? { forced: true } : {}),   // 🦍 ถูกยั่วยุมาตี (จอขึ้นป้าย "ยั่วยุ!") — แสดงผลล้วน
      dmg: Math.round(before - hpAtHit), crit: !!tier?.crit, eff: tier?.eff || 'neutral',
      dodged: hitRes.dodged,
      // 🔒 sub = หมัดลูกใน beat เดียวกัน (cleave/multiStrike) — battleBeats ให้ timing ZERO
      //    ถ้าไม่ตั้ง flag นี้ ทุกเป้ารองจะกลายเป็น "จังหวะหมัด" ใหม่ = ไฟต์ยืดทันที (กฎเหล็กพัง)
      ...(sub ? { sub: true } : {}),
      ...(controlBy ? { mind: true, credit: controlBy.uid } : {}),
      // 🤍 echo = หมัดตีซ้ำของมาสก์กระต่าย — รีเพลย์รวบทุกหมัดซ้ำให้ยาวรวมเท่าหมัดปกติ 1 หมัด (user 18 ต.ค. 2026) · แสดงผลล้วน
      ...(tier?.echo ? { echo: true } : {}),
      // ดาเมจเชื้อที่ทะลุมาในหมัดนี้ แตกเป็นชั้นละก้อน — **ของฝั่งจอล้วน** (BattleReplay เด้งเลขย่อย
      // แล้วหักออกจากเลขหลัก เพื่อให้ผลรวมบนจอ = เลือดที่หายจริง) · ไม่มีใครเอาไปคิดดาเมจต่อ
      ...(hitRes.pierceHits?.length ? { pierceHits: hitRes.pierceHits } : {}),
      // 🔴 ยังไม่ตาย (0 < hp < 0.5) ห้ามปัดเป็น 0 — จอใส่การ์ดเทา "ตาย" จาก hp 0 แล้วตัวนั้นตีต่อได้อีก (เจอ 26 ก.ย.)
      targetHpAfter: hpAtHit > 0 ? Math.max(1, Math.round(hpAtHit)) : 0, dead: false,
    }
    log.push(entry)
    if (!sub) lastDodged = !!hitRes.dodged   // หมัดหลักเท่านั้น — หมัดลูก/หมัดสวนไม่ทับ (รีวิว 28 ต.ค.)
    const killerOf = controlBy || att   // 👽 หมัดควบคุม = เอเลี่ยนเป็นคนฆ่า
    // announced: true — ใบ 'attack' ข้างบนแบก dead ของเป้าหลักเองอยู่แล้ว
    // ไม่ต้องมีใบการตายเงียบซ้อนอีกใบ (สเปก §4.1) · อีก 3 จุดที่เรียกใช้ค่าเริ่มต้น false ถูกต้องแล้ว
    let dead = hpAtHit <= 0
    if (dead) dead = resolveSilentDeath(tg, killerOf, { announced: true })
    entry.dead = dead
    // 🔴 สเปก §7.6: ตายเงียบ 2 ทางที่เหลือของ strike() นี้ — หนาม (att โดนสวนตอนบรรทัด 81) และ guardian
    //    (ผู้พิทักษ์ hitRes.guard โดนหักตอนอยู่ใน runOnHit) ต้องแก้ "หลัง" log เหตุการณ์ของหมัดนี้ (ก้อน
    //    'attack' ข้างบน) เท่านั้น — เหตุต้องมาก่อนผลเสมอ (battleBeats.js อนุมานใครปิดไฟต์จาก log ล้วน)
    //    และห้ามเช็คตอน strike() ยังไม่จบ (ตระกูลบั๊กเดียวกับธง reflecting/countering ด้านบน)
    //    ผู้ฆ่าตามสเปก: หนาม → เจ้าของหนาม (tg, ผู้รับหมัดที่สะท้อนกลับ) · guardian → คนสวนหมัดมา (att เดิม
    //    ของ strike() นี้เอง ไม่ใช่ผู้พิทักษ์ — บากุไม่ได้สร้างดาเมจ แค่ย้ายเข้าตัว)
    resolveSilentDeath(att, tg)
    resolveSilentDeath(hitRes.guard, att)
    // 🦠 เป้ารองที่โดนดาเมจเชื้อตอนแปะ (infectSplash) — ตายเงียบหลังใบหมัด (เหตุมาก่อนผล)
    for (const u of hitRes.splash || []) resolveSilentDeath(u, killerOf)
    return dead
  }

  /** จุดเดียวที่ตัดสินว่า "ตัวนี้ตายจริงไหม" ไม่ว่าจะมาจากทางไหน (ตี tg ปกติ, หนาม/guardian หลัง strike()
   *  ของตัวเอง, หรือ aoeOpener ก่อนรอบ 1) — ตามลำดับเดียวกับ if(dead) เดิม: runOnDeath → หมัดสวนของฟีนิกซ์
   *  (ถ้ามี) → runOnAnyDeath · คืน true ถ้าตายจริง (ไม่ถูกกันไว้)
   *  @param unit    ตัวที่อาจตาย (เช็ค hp เองในนี้ — เรียกได้เสมอแม้ไม่ตาย/ไม่มีตัว)
   *  @param killer  ผู้สร้างดาเมจจริงตามสเปก §7.6 (ไม่ใช่คนที่ดาเมจไปตกใส่)
   *
   *  🔴 รีวิวรอบ 2 (6 ก.ย.): "หนึ่งการตาย = รันฮุคหนึ่งครั้ง" ต้องเป็นคุณสมบัติของฟังก์ชันนี้เอง ไม่ใช่ให้
   *     ทุกจุดที่เรียกจำเอง — เพราะ unit ตัวเดียวกันเข้าถึงจุดนี้ได้จากคนละเส้นทางในหมัดเดียวกัน (เช่น Y เป็น
   *     tg ของ strike() ชั้นนอก และเป็น att ของ strike() ชั้นในตอนเกราะสะท้อนของ Y เองยิงออกไป แล้วโดนหนาม
   *     ของเป้าสวนตายกลางชั้นใน) ใช้ธง `ps._deathDone` กันรันฮุคซ้ำของ "การตายเดียวกัน" — ตั้งเฉพาะตอนตายจริง
   *     (ไม่ถูก prevent) และเคลียร์ทันทีที่เจอ unit.hp > 0 (ฟื้นจาก revive/cheatDeath/saveAlly) เพื่อให้การตาย
   *     "ครั้งใหม่" ของตัวเดียวกันทีหลังในไฟต์เดียวกันรันฮุคได้เต็มรอบอีกครั้ง ไม่ใช่ธงถาวรตลอดไฟต์ */
  const resolveSilentDeath = (unit, killer, { announced = false } = {}) => {
    if (!unit) return false
    if (unit.hp > 0) { psOf(unit)._deathDone = false; return false }
    const st = psOf(unit)
    // 🔴 P2c-2 (สเปก §4.3): คืน false ไม่ใช่ true — ค่าที่คืนแปลว่า "การเรียกครั้งนี้เป็นคนประกาศ
    //    การตายหรือเปล่า" ไม่ใช่ "ตายหรือเปล่า" · เส้นทางอื่นประกาศไปแล้วพร้อมใบใน log ⇒ ใบของ
    //    ผู้เรียกคนนี้ต้องไม่อ้างการฆ่าซ้ำ ไม่งั้น battleSummary แจกเครดิต kills ให้สองคนจากศพใบเดียว
    //    และ hit() จะให้ตีต่อ (👹 ฟาดน็อก) กับคนที่ไม่ได้ฆ่า
    //    (ตอนยังไม่มีใบการตายเงียบ การคืน true ถูกต้อง เพราะใบของชั้นนอกเป็นบันทึกเดียวที่มี)
    if (st._deathDone) return false
    const unitTeam = unit.side === 'A' ? A : B
    const killerTeam = killer.side === 'A' ? A : B
    const d = runOnDeath(unit, unitTeam, killer)
    for (const e of d.events) log.push(e)
    // 🔑 ห้าม return ตอน prevented เฉยๆ — หมัดสวนของฟีนิกซ์ต้องยิงแม้ prevented=true (revive คือกรณีนั้นเป๊ะ)
    //    ตรงกับโค้ดเดิมใน strike(): `if (d.prevented) dead=false` แล้วเช็ค d.counter แยกเป็นคนละ if
    if (d.counter && !reflecting && !countering) {
      countering = true
      try {
        if (d.counter.target.hp > 0) strike(unit, d.counter.target, killerTeam, d.counter.mult, { crit: false, eff: 'neutral' }, true)
      } finally { countering = false }
    }
    if (d.prevented) return false
    st._deathDone = true
    clearOnDeath(unit)   // ตาย = ล้างทุกสถานะในทะเบียน (🦠 ย้ายตามกติกาเดิมใน onAnyDeath)
    if (unit.ps?.ufo) ufoRelease(unit, false)   // 🛸 ยูเอฟโอตาย = ปล่อยทันที ไม่มีตกกระแทก
    // 💀 ใบบันทึกการตาย (P2c-2, สเปก §3–§4) — ยิงเฉพาะทางที่ไม่มีใบ attack ของตัวเองแบก dead อยู่แล้ว
    //    ใช้รูปแบบเดียวกับหมัดปกติโดยตั้งใจ: ผู้อ่าน log ที่มีอยู่ (battleSummary/battleBeats) เข้าใจทันที
    //    โดยไม่ต้องแก้ทีละที่ — "ผู้อ่านที่ลืมอัปเดต = พังเงียบ" คือตระกูลบั๊กที่กัดโปรเจกต์นี้มาหลายรอบ
    //    🔒 dmg ต้องเป็น 0 เสมอ: battleSummary บวก e.dmg เข้า dmgDealt/dmgTaken ตรงๆ โดยไม่เช็ค silent
    //       ⇒ ใส่ดาเมจจริงลงไปวันไหน เลขในหน้าสรุปจะขยับเงียบๆ ผิดจากที่ผู้ใช้เคาะ (มีเทสตรึงไว้)
    //    🔒 sub: true ⇒ อยู่ในบีตเดียวกับหมัดที่ทำให้ตาย ไม่เพิ่มเวลาให้ไฟต์ (กฎเหล็ก)
    //       ยกเว้นใบที่ปิดไฟต์ ซึ่ง battleBeats ยกเป็น 'finish' ให้เอง — ตั้งใจ ไม่ใช่เวลาที่งอกเพิ่ม
    //    ต้องอยู่ "หลัง" runOnDeath (กันตายได้ = ไม่มีใบเลย) และ "ก่อน" runOnAnyDeath (เหตุมาก่อนผล)
    if (!announced) {
      log.push({
        t: 'attack', side: killer.side, attacker: killer.uid, target: unit.uid,
        dmg: 0, crit: false, eff: 'neutral', dodged: false,
        sub: true, silent: true, targetHpAfter: 0, dead: true,
      })
    }
    for (const e of runOnAnyDeath(unit, killerTeam, unitTeam, rand)) log.push(e)
    for (const e of runOnDied(unit, killerTeam, killer, unitTeam)) log.push(e)   // 👻 แบร่ (หลังตายจริง)
    // 🤍 กระต่ายตายจริง (ฟีนิกซ์ชุบ = ไม่มาถึงตรงนี้) ⇒ มาสก์ที่แปะไว้บนศัตรูหายหมด (user 28 ต.ค. กติกา 9)
    if (partWithEffect(PET_PASSIVES[unit.id], 'sparkMark')) {
      const foes = unit.side === 'A' ? B : A
      const had = foes.filter(f => f.ps?.spark > 0)
      if (had.length) {
        for (const f of had) f.ps.spark = 0
        const p = PET_PASSIVES[unit.id]
        log.push({ t: 'passive', uid: unit.uid, side: unit.side, petId: unit.id, name: p.name, icon: p.icon,
          effect: 'sparkClear', targets: had.map(f => f.uid), fxKind: 'debuff', sub: true })
      }
    }
    return true
  }

  // เลือกเป้า: ถูกบังคับ (taunt) มาก่อนเสมอ · ไม่งั้นสุ่มตามเดิม
  // 🔴 ต้องเช็ค taunt ก่อนเรียก rand() — ถ้าเรียก rand() แล้วค่อยทิ้งผล ลำดับสุ่มจะเลื่อนทั้งไฟต์
  const pick = (foes, att = null) => {
    const forced = tauntTargetOf(foes)
    if (forced) return forced
    // 👤 ล้างแค้น: หมัดถัดไปพุ่งใส่คนฆ่าเพื่อน (ยั่วยุ 🦍 ยังชนะ · ตายแล้ว = ตีปกติ) · ไม่ดึง rand
    const rv = att?.ps?.revengeOn
    if (rv) { att.ps.revengeOn = null; const t = foes.find(u => u.uid === rv && u.hp > 0 && !u.ps?.away); if (t) return t }
    const al = alive(foes)
    return al.length ? al[Math.floor(rand() * al.length)] : null
  }

  // onStart (ก่อนหมัดแรก) — ต้องเรียกทีละ event แล้ว resolve aoeOpener "ทันทีหลัง" event ของมันเอง
  // (สเปก §7.6: บาฮามุทฆ่าเพ็ทฝั่งตรงข้ามได้ก่อนรอบ 1 · เอนจินยืนยันแล้วว่าตั้งใจให้เกิดได้)
  // 🔑 ใช้ resolveSilentDeath ตัวเดียวกับที่ strike() ใช้ — ฟีนิกซ์ที่ตายจาก aoeOpener ก็ต้องฟื้น+สวนได้
  //    เหมือนตายทางอื่นทุกทาง ไม่ใช่กรณีพิเศษ
  for (const e of [...runOnStart(A, B), ...runOnStart(B, A)]) {
    log.push(e)
    if (e.t === 'passive' && e.effect === 'aoeOpener') {
      const killer = (e.side === 'A' ? A : B).find(u => u.uid === e.uid)
      const victims = e.side === 'A' ? B : A
      for (const uid of e.targets || []) resolveSilentDeath(victims.find(u => u.uid === uid), killer)
    }
  }

  /** 1 หมัด = 1 beat · cleave/multiStrike อยู่ในหมัดเดียวกัน (กฎเหล็ก: ห้ามเพิ่ม beat)
   *  🔴 forced ต้องจำไว้ "ก่อน" pick() คืนเป้า — pick() เองก็เรียก tauntTargetOf ซ้ำ แต่ไม่ดึง rand()
   *     ก่อนเช็ค taunt ⇒ เรียกซ้ำได้โดยไม่ทำให้ลำดับสุ่มของไฟต์เลื่อน (ดู comment บน pick ด้านบน) */
  const hit = (att, foes) => {
    const forced = !!tauntTargetOf(foes)
    const tf = targetableFoes(foes)   // 👤 เนเมซิสซ่อนตัว = เลือกเป็นเป้า/เป้าลามไม่ได้
    let tg = pick(tf, att)
    if (!tg) return false
    const attTeam = att.side === 'A' ? A : B
    const mod = runOnAttack(att, tg, tf, rand, attTeam)
    for (const e of mod.events) log.push(e)
    tg = mod.target || tg
    // 🛸 เล็งดูดตัว ATK สูงสุดที่ดูดได้ (ยั่วยุยังชนะ · ซิม 28 ต.ค. ถ้า user เคาะ) — value.smart = 1
    if (ufoPart(att) && !att.ps?.ufo && ufoVal(att).smart && !tauntTargetOf(tf)) {
      const best = tf.filter(u => u.hp > 0 && !isImmune(u, 'away')).sort((x, y) => y.atk - x.atk)[0]
      if (best) tg = best
    }
    // 🛸 ยังไม่ได้ดูดใคร = หมัดนี้คือการดูดเป้า (หลบไม่ได้ · เกราะกันไม่ได้ · ไม่มีดาเมจ) · บอสกัน = ตีปกติ
    if (ufoPart(att) && !att.ps?.ufo && !att.ps?.ufoUsed && !isImmune(tg, 'away')) {   // ดูดได้ครั้งเดียวต่อไฟต์ (user 28 ต.ค.)
      if (tg.ps?.ufo) ufoRelease(tg, false)   // ดูดยูเอฟโออีกฝั่งที่กักใครอยู่ = ตัวนั้นถูกปล่อย (ไม่มีตกกระแทก)
      psOf(tg).away = true
      psOf(att).ufo = { uid: tg.uid, hits: 0, round }
      psOf(att).ufoUsed = true
      const p = PET_PASSIVES[att.id]
      log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id, name: p.name, icon: p.icon,
        effect: 'abduct', targets: [tg.uid], left: ufoVal(att).turns, fxKind: 'debuff' })
      return false
    }
    const ufoWeak = att.ps?.ufo ? (ufoVal(att).pct ?? 100) / 100 : 1   // ระหว่างกักตัว ยูเอฟโอตีเบาลง

    let m = elementMult(att.element, tg.element)
    const eff = m > 1 ? 'super' : (m < 1 ? 'weak' : 'neutral')  // ธาตุล้วน ก่อนคูณ crit/variance
    const crit = rand() < (critRate + (att.critBonus || 0))
    if (crit) m *= critMult
    m *= 1 + (rand() * 2 - 1) * variance
    m *= mod.atkMult * (1 + (tg.vuln || 0))
    m *= statusAtkMult(att) * statusDmgTakenMult(tg)   // 🥀 💪 💔 (ทะเบียนสถานะ)
    m *= ufoWeak
    const base = att.atk * m

    // หมัดหลัก (multiStrike = ตีซ้ำเป้าเดิมใน beat เดียว ทีละ strikePct)
    // 🔴 สเปก §7.6 ข้อ 6 (รีวิวรอบ 2, 6 ก.ย.): เช็ค att.hp > 0 ด้วย — เข้าถึงได้จริงวันนี้แล้ว ไม่ใช่สมมุติ
    //    (🐰 กระต่ายถือ multiStrike) หนามของเป้าตัวแรกสวนผู้ตีตายกลางหมัดได้ ⇒ ต้องหยุด ไม่ตีซ้ำทั้งที่ตายแล้ว
    const perHit = mod.strikes > 1 ? base * (mod.strikePct / 100) : base
    let killed = false
    for (let i = 0; i < mod.strikes; i++) {
      if (tg.hp <= 0 || att.hp <= 0) break
      if (strike(att, tg, foes, perHit, { crit, eff }, i > 0, forced)) killed = true
    }
    // 🤍 หมัดซ้ำของมาสก์ประกายแสง (กระต่าย) — เป้าเดิม beat เดิม · ไม่คริต (แบบเดียวกับ cleave)
    for (let i = 0; i < (mod.bonusHits || 0); i++) {
      if (tg.hp <= 0 || att.hp <= 0) break
      if (strike(att, tg, foes, base * (mod.bonusPct / 100), { crit: false, eff, echo: true }, true, forced)) killed = true
    }
    // เป้ารองของ cleave — ดาเมจลดตาม pct · ยังอยู่ beat เดียวกัน
    // ⚠️ ไม่ใช่หมัดที่ถูกบังคับ แม้เป้าหลักจะถูก taunt ดึงมาก็ตาม — ส่ง false เสมอ (สเปกงานย่อยนี้)
    // 🔴 สเปก §7.6 ข้อ 6: เช็ค att.hp > 0 เหมือนกัน — เข้าถึงได้จริงวันนี้ (🐕 เซอร์เบอรัสถือ cleave) หมัดหลัก
    //    ข้างบนอาจฆ่าผู้ตีไปแล้ว (โดนหนามของเป้าหลักสวนตาย) ก่อนจะมาถึงเป้ารอง ⇒ ต้องหยุดตีเป้ารองด้วย
    for (const x of mod.extra) {
      if (att.hp <= 0) break
      if (x.unit.hp <= 0) continue
      if (strike(att, x.unit, foes, base * (x.pct / 100), { crit: false, eff: 'neutral' }, true, false)) killed = true
    }
    // 👽 ควบคุมจิตใจ (สเปก §2.3): หมัดหลักโดนจริง + เป้ายังไม่ตาย ⇒ เป้าตีพวกเดียวกัน 1 ตัว (สุ่ม รวมตัวเอง)
    //    แรง = pct% ของ ATK เป้า × พลังสะสม (🌙 👹) · 1 ตา = 1 ครั้ง · อยู่ใน beat เดิม (sub)
    const mc = partWithEffect(PET_PASSIVES[att.id], 'mindControl')
    if (mc && att.hp > 0 && tg.hp > 0 && !lastDodged && !tg.ps?.away) {
      const tgTeam = tg.side === 'A' ? A : B
      const pool = targetableFoes(tgTeam)   // 👤 เนเมซิสที่ซ่อนอยู่ถูกหมัดควบคุมเลือกไม่ได้
      const victim = pool[Math.floor(rand() * pool.length)]
      const v = passiveValueAt(mc, att.passiveLv)
      const ap = PET_PASSIVES[att.id]
      log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id, name: ap.name, icon: ap.icon,
        effect: 'mindControl', targets: [tg.uid], victim: victim.uid, fxKind: 'debuff' })
      controlBy = att
      try {
        if (strike(tg, victim, tgTeam, tg.atk * v.pct / 100 * storedPowerMult(tg), { crit: false, eff: 'neutral' }, true)) killed = true
      } finally { controlBy = null }
    }
    return killed
  }

  // 🧾 ดาเมจจากสถานะ (🔥 ☠️ 😱) — คนแปะเป็นคนฆ่า (user 27 ต.ค.) · ไม่มีคนแปะ/คนแปะเป็นพวกเดียวกัน
  //    = ศัตรู ATK สูงสุดที่ยังอยู่ (resolveSilentDeath ต้องมี killer ฝั่งตรงข้าม)
  const statusHurt = (u, dmg, id, from, left, inst) => {
    if (!(dmg > 0) || u.hp <= 0) return
    const before = u.hp
    u.hp -= dmg
    const d = STATUSES[id]
    log.push({ t: 'passive', uid: u.uid, side: u.side, petId: u.id, name: d.name, icon: d.icon,
      effect: 'statusTick', statusId: id, left, inst, targets: [u.uid], fxKind: 'damage', amount: Math.round(before - Math.max(0, u.hp)),
      hpPct: Math.max(0, Math.round((Math.max(0, u.hp) / u.maxHp) * 100)) })
    if (u.hp > 0) return
    const foesOf = u.side === 'A' ? B : A
    let killer = from && from.side !== u.side ? from : null
    if (!killer) killer = alive(foesOf).sort((a, b) => b.atk - a.atk)[0] || foesOf[0]
    resolveSilentDeath(u, killer)
  }
  const runTurnEnd = (u) => {
    for (const r of turnEndTicks(u)) {
      if (u.hp <= 0) break
      if (r.dmg) statusHurt(u, r.dmg, r.id, r.from, r.left, r.inst)
      if (r.heal && canHeal(u)) {
        const before = u.hp
        u.hp = Math.min(u.maxHp, u.hp + r.heal)
        const d = STATUSES[r.id]
        log.push({ t: 'passive', uid: u.uid, side: u.side, petId: u.id, name: d.name, icon: d.icon,
          effect: 'statusTick', statusId: r.id, left: r.left, targets: [u.uid], fxKind: 'heal', amount: Math.round(u.hp - before),
          hpPct: Math.round((u.hp / u.maxHp) * 100) })
      }
    }
  }

  // ══ 🛸 ยูเอฟโอ (สเปก §2.1 + §8.7–8.8) ══════════════════════════════════════════
  //  ps.ufo = { uid: ตัวที่ถูกดูด, hits: จำนวนครั้งที่ยูเอฟโอโดนตีแล้ว, round: รอบที่ดูด } บนตัวยูเอฟโอ
  //  ตัวที่ถูกดูด ps.away = true → ไม่อยู่บนสนาม (alive() ไม่นับ · ไม่ได้ตา · สกิลหยุด · สถานะค้าง)
  const ufoPart = (u) => partWithEffect(PET_PASSIVES[u?.id], 'abduct')
  const ufoVal = (u) => passiveValueAt(ufoPart(u), u.passiveLv)
  const unitByUid = (uid) => [...A, ...B].find(x => x.uid === uid)
  /** ปล่อยตัวที่ยูเอฟโอ u ดูดไว้ · drop = ตกกระแทก % เลือดสูงสุด (ไม่ใช่หมัด · ไม่ผ่านการลด · ฆ่าได้ · คนฆ่า = ยูเอฟโอ) */
  const ufoRelease = (u, drop) => {
    const h = u.ps?.ufo; if (!h) return
    u.ps.ufo = null
    const v = unitByUid(h.uid); if (!v) return
    v.ps.away = false
    const p = PET_PASSIVES[u.id]
    log.push({ t: 'passive', uid: u.uid, side: u.side, petId: u.id, name: p.name, icon: p.icon,
      effect: 'ufoRelease', targets: [v.uid], fxKind: 'debuff' })
    if (drop && v.hp > 0 && ufoVal(u).drop > 0) {   // ไม่มีค่าตก (กติกา 28 ต.ค.) = ปล่อยเฉยๆ
      const before = v.hp
      v.hp -= v.maxHp * ufoVal(u).drop / 100
      log.push({ t: 'passive', uid: u.uid, side: u.side, petId: u.id, name: p.name, icon: p.icon,
        effect: 'ufoDrop', targets: [v.uid], fxKind: 'damage', amount: Math.round(before - Math.max(0, v.hp)),
        hpPct: Math.max(0, Math.round((Math.max(0, v.hp) / v.maxHp) * 100)) })
      if (v.hp <= 0) resolveSilentDeath(v, u)
    }
  }
  /** ฝั่งไหนบนสนามตายหมด แต่ยังมีตัวถูกดูดค้าง = ปล่อยกลับมาสู้ต่อ (ตกกระแทก) — กันไฟต์ค้าง/ชนะผิด */
  const releaseStranded = () => {
    for (const side of [A, B]) {
      if (alive(side).length) continue
      for (const u of [...A, ...B]) if (u.ps?.ufo && side.some(x => x.uid === u.ps.ufo.uid)) ufoRelease(u, true)
    }
  }

  const countAlive = (t) => t.reduce((n, f) => n + (f.hp > 0 ? 1 : 0), 0)
  // หาตัวออกตี: ไล่จาก cursor ไปขวา วนกลับมาซ้าย เจอตัวแรกที่ยังไม่ตาย (-1 = ไม่มี)
  const nextAttacker = (team, cursor) => {
    const n = team.length
    for (let k = 0; k < n; k++) { const i = (cursor + k) % n; if (team[i].hp > 0) return i }
    return -1
  }

  // ใครก่อน: ฝั่งตัวเยอะกว่าตีก่อน · เท่ากัน → สุ่ม (ดึงจาก rand เดิม คง deterministic)
  // 🐹 แฮมสเตอร์ช่อง 1 = ทีมได้ตีก่อนเสมอ (27 ก.ย. 2026)
  //    มีทั้งสองฝั่ง = ฝั่ง A (คนกดหาห้อง/เจ้าของแมตช์) ตีก่อน (user เคาะ 3 ต.ค. 2026 · คำอธิบายพาสสีฟไม่ต้องแก้)
  // ⚠️ ห้ามดึง rand() เพิ่มในเส้นทางนี้ — ลำดับสุ่มของไฟต์ต้องเหมือนเดิมเมื่อไม่มีแฮมสเตอร์
  const ca = countAlive(A), cb = countAlive(B)
  const leadA = A[0]?.id === 'hamster', leadB = B[0]?.id === 'hamster'
  const first = leadA ? 'A' : leadB ? 'B'
    : ca > cb ? 'A' : cb > ca ? 'B' : (rand() < 0.5 ? 'A' : 'B')
  const cursor = { A: 0, B: 0 }
  let cur = first, round = 0, turns = 0
  // 🔑 "รอบ" (user เคาะ 26 ก.ย. 2026) = ทุกตัวที่ยังมีชีวิตทั้งสองฝั่งได้ตาครบคนละ 1 ครั้ง
  //    เดิม round++ ทุกครั้งที่วนกลับมาฝั่งที่ตีก่อน = ฝั่งละ 1 หมัด ⇒ 3v3 ต้อง 3 round กว่าทุกตัวจะตีครบ
  //    pending = uid ที่ยังไม่ได้ตาในรอบนี้ · null = ต้องเปิดรอบใหม่ก่อนตาถัดไป
  //    ตัวที่ตายกลางรอบไม่ต้องรอ · ตาที่ถูกข้าม (แช่แข็ง) นับเป็นตาแล้ว · ตีต่อของโอนิไม่ใช่ตาใหม่
  let pending = null
  const startRound = () => {
    round++; log.push({ t: 'round', n: round })
    // 🛸 ครบ {hits} รอบนับจากตอนดูด = ปล่อย + ตกกระแทก
    for (const e of [...runOnRound(A), ...runOnRound(B)]) log.push(e)
    pending = new Set([...A, ...B].filter(u => u.hp > 0).map(u => u.uid))
  }
  const endRoundIfDone = () => {
    for (const uid of [...pending]) {
      const u = (uid[0] === 'A' ? A : B).find(x => x.uid === uid)
      if (!u || u.hp <= 0) pending.delete(uid)
    }
    if (pending.size) return
    for (const e of [...runOnRoundEnd(A, B, rand), ...runOnRoundEnd(B, A, rand)]) log.push(e)
    // 🗓️ ไฟไหม้/น้ำพุจบรอบ — event เดียวต่อรอบ ครอบทุกตัวบนสนาม (hpMap/amounts ต่อ uid ให้รีเพลย์)
    //    ไหม้คิดจากเลือดปัจจุบัน จึงไม่มีทางฆ่าใคร (เหลือ ≥1) · ไม่ดึง rand() ⇒ ลำดับสุ่มของไฟต์ไม่เลื่อน
    const re = W.roundEnd
    if (re) {
      const on = [...alive(A), ...alive(B)]
      if (on.length) {
        const amounts = {}, hpMap = {}
        for (const u of on) {
          const before = u.hp
          if (re.burnPct) u.hp = Math.max(1, u.hp - u.hp * re.burnPct / 100)
          if (re.healPct && canHeal(u)) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * re.healPct / 100)
          amounts[u.uid] = Math.round(Math.abs(u.hp - before))
          hpMap[u.uid] = Math.max(1, Math.round((u.hp / u.maxHp) * 100))
        }
        const burn = !!re.burnPct
        log.push({ t: 'passive', uid: on[0].uid, side: on[0].side, petId: null,
          name: burn ? 'สมรภูมิมอดไหม้' : 'น้ำพุชีวิต', icon: burn ? '🔥' : '💚',
          effect: burn ? 'weeklyBurn' : 'weeklyHeal', fxKind: burn ? 'damage' : 'heal',
          targets: on.map(u => u.uid), amount: 0, amounts, hpMap })
      }
    }
    pending = null
  }

  while (turns < BATTLE_CFG.maxTurns && (releaseStranded(), alive(A).length && alive(B).length)) {
    if (!pending) startRound()
    const team = cur === 'A' ? A : B
    const foes = cur === 'A' ? B : A
    const ai = nextAttacker(team, cursor[cur])
    if (ai !== -1) {
      const att = team[ai]
      const st = psOf(att)
      // 🛸 ถูกดูดอยู่ = ครองตาไว้แต่ข้าม (user 28 ต.ค.: ฝั่งที่โดนดูดเสียหมัดจริง) · ทุกตาที่ข้ามเสียเลือด {drain}%
      //    ครบ {turns} ตา = ปล่อยกลับลงสนาม · ตายในยาน = คนฆ่าคือยูเอฟโอ
      const holder = att.ps?.away ? [...A, ...B].find(x => x.ps?.ufo?.uid === att.uid) : null
      if (att.ps?.away && holder) {
        const hv = ufoVal(holder), h = holder.ps.ufo
        h.turns = (h.turns || 0) + 1
        const p = PET_PASSIVES[holder.id]
        const before = att.hp
        if (hv.drain) att.hp -= att.maxHp * hv.drain / 100
        log.push({ t: 'passive', uid: holder.uid, side: holder.side, petId: holder.id, name: p.name, icon: p.icon,
          effect: 'ufoDrain', targets: [att.uid], fxKind: 'damage', amount: Math.round(before - Math.max(0, att.hp)),
          left: Math.max(0, hv.turns - h.turns), hpPct: Math.max(0, Math.round((Math.max(0, att.hp) / att.maxHp) * 100)) })
        if (att.hp <= 0) { holder.ps.ufo = null; att.ps.away = false; resolveSilentDeath(att, holder) }
        else {
          // ⏳ สถานะของตัวที่อยู่ในยานเดินต่อ (user 28 ต.ค. กติกา 7): ข้ามตาลด · 😱 หัก · ท้ายตาทำงาน
          const sk = consumeSkip(att)
          if (sk?.selfDmg > 0) statusHurt(att, sk.selfDmg, 'fear', sk.dmgFrom, sk.left.fear)
          if (att.hp > 0) runTurnEnd(att)
          if (att.hp <= 0) { if (holder.ps.ufo) { holder.ps.ufo = null; att.ps.away = false } }
          else if (h.turns >= hv.turns) ufoRelease(holder, false)
        }
        pending.delete(att.uid)
        cursor[cur] = (ai + 1) % team.length
        turns++
        cur = cur === 'A' ? 'B' : 'A'
        if (alive(A).length && alive(B).length) endRoundIfDone()
        continue
      }
      const sk = consumeSkip(att)
      if (sk) {
        // ⏸️ ข้ามตา (❄️ แช่แข็ง · 💫 มึน · 😱 หวาดกลัว) — ตานี้หายไปทั้งตา แต่นับว่าได้ตาในรอบนี้แล้ว
        //    1 ตาที่ถูกข้าม ลดสถานะข้ามตาทุกตัวตัวละ 1 (user 27 ต.ค.) · ป้ายหลัก = ตัวแรกตามทะเบียน
        const d = STATUSES[sk.id]
        log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id,
          name: d.name, icon: d.icon, effect: 'frozen', statusId: sk.id, targets: [att.uid], fxKind: 'skip',
          left: sk.left[sk.id], lefts: sk.left })   // left = สแตคที่เหลือของป้ายหลัก (รีเพลย์เดิมอ่านช่องนี้)
        // 😱 กลัวจนเจ็บตัวเอง — คนแปะ (ผีน้อย) นับเป็นคนฆ่า
        if (sk.selfDmg > 0) statusHurt(att, sk.selfDmg, 'fear', sk.dmgFrom, sk.left.fear)
      } else if (windupOf(att) && !st.wound) {
        // 👹 ง้าง (27 ก.ย. 2026) — ไม่ตี แต่นับว่าได้ตาในรอบแล้ว (เหมือนตาที่ถูกข้าม)
        // 🔑 ตาแรกของไฟต์เป็นตาง้างเสมอ · ลำดับ if ต้องให้ skip มาก่อน ⇒ โดนแช่แข็งตอนง้างค้าง = wound ค้างไว้ ตาถัดไปฟาด
        st.wound = true
        const p = PET_PASSIVES[att.id]
        log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id, name: p.name, icon: p.icon,
          effect: 'windup', targets: [att.uid], fxKind: 'windup' })
      } else {
        const wu = windupOf(att)
        if (wu) { st.wound = false; st.smashing = true }   // runOnAttack อ่าน smashing แล้วคูณ pct%
        let killed = hit(att, foes)
        const onKill = () => { for (const e of runOnKill(att, team, foes).events) log.push(e) }
        if (killed) onKill()
        // 👹 ฟาดน็อก ⇒ ฟาดต่อ 1 ครั้ง (ไม่ใช่ตาใหม่ · สูงสุด 1 ครั้ง) — เพิ่ม beat จริงจึงนับ turns
        // 🔴 เช็ค att.hp > 0 (โดนหนามสวนตายกลางหมัดได้ — ตายแล้วห้ามตีต่อ)
        if (wu && killed && att.hp > 0 && alive(foes).length && turns < BATTLE_CFG.maxTurns) {
          const p = PET_PASSIVES[att.id]
          log.push({ t: 'passive', uid: att.uid, side: att.side, petId: att.id, name: p.name, icon: p.icon,
            effect: 'windup', targets: [att.uid], fxKind: 'chain' })
          turns++
          killed = hit(att, foes)
          if (killed) onKill()
        }
        if (wu) st.smashing = false
      }
      // 🔥 ท้ายตา: ดาเมจต่อเนื่องหลังตี (user 27 ต.ค.: "ได้ดิ้นรนก่อนแล้วค่อยตุย") · ตาที่ถูกข้ามก็ทำงาน
      if (att.hp > 0) runTurnEnd(att)
      pending.delete(att.uid)
      cursor[cur] = (ai + 1) % team.length
    }
    turns++
    cur = cur === 'A' ? 'B' : 'A'   // สลับฝั่งเสมอ
    if (alive(A).length && alive(B).length) endRoundIfDone()
  }

  const pct = (t) => { const max = t.reduce((s, f) => s + f.maxHp, 0); return max ? t.reduce((s, f) => s + Math.max(0, f.hp), 0) / max : 0 }
  releaseStranded()   // 🛸 หมดเวลาตอนอีกฝั่งเหลือแต่ตัวที่ถูกดูด = ปล่อยกลับก่อนตัดสิน (รีวิว 28 ต.ค.)
  const aAlive = alive(A).length > 0, bAlive = alive(B).length > 0
  const hpPctA = pct(A), hpPctB = pct(B)
  let winner
  if (aAlive && !bAlive) winner = 'A'
  else if (bAlive && !aAlive) winner = 'B'
  else winner = hpPctA >= hpPctB ? 'A' : 'B'

  log.push({ t: 'end', winner, rounds: round, hpPctA, hpPctB })
  return { winner, rounds: round, log, units, base }
}
