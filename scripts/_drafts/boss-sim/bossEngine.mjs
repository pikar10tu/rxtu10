// ════════════════════════════════════════════════════════════
//  Battle engine — pure + deterministic (seeded) · พอร์ตจาก
//  scripts/battle-sim.mjs (resolve) + บันทึก log ทุก action ให้ UI replay
//  ไม่มี side effect — ไม่อ่าน store/Firestore/Date.now
// ════════════════════════════════════════════════════════════
import { BATTLE_CFG, buildCombatant } from 'file:///D:/RXTU/rxtu10-v2/src/data/battle.js'
import { elementBeats } from 'file:///D:/RXTU/rxtu10-v2/src/data/index.js'
import { weeklyRules, statMult } from 'file:///D:/RXTU/rxtu10-v2/src/data/pvpWeekly.js'
import {
  applyForms, runSetup, applyAuras, initHunt, runOnStart, runOnRound, runOnRoundEnd, runOnAttack, runOnHit, runOnDealt, runOnDeath, runOnKill, runOnAnyDeath, statsSnapshot,
  tauntTargetOf, psOf, windupOf,
} from 'file:///D:/RXTU/rxtu10-v2/src/utils/battlePassives.js'
import { PET_PASSIVES } from 'file:///D:/RXTU/rxtu10-v2/src/data/petPassives.js'

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

const alive = (t) => t.filter(f => f.hp > 0)

/** teamA/teamB = array ของ {id,rarity,element,grade} (≤4) · seed = int */
export function simulateBoss(teamA, teamB, seed, opts = {}) {
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

  /** หักเลือด 1 ครั้ง + บันทึก log · คืน true ถ้าเป้าตายจริง (ผ่าน onDeath แล้ว)
   *  forced = หมัดนี้ลงบนเป้าที่ถูก taunt บังคับมา (ไม่ใช่เป้าที่เลือกเอง) — ส่งต่อให้ runOnHit ตัดสินใจลดดาเมจ
   *  🔴 เป้ารองของ cleave และดาเมจสะท้อนของ armorStack ไม่ใช่หมัดที่ถูกบังคับ ⇒ เรียก strike() โดยไม่ส่ง forced (= false) */
  const strike = (att, tg, foes, mult, tier, sub, forced = false) => {
    const before = tg.hp
    // onHit: guardian (เพื่อนรับแทน) → dodge → ลดดาเมจ → หนาม  (มุมของ "ผู้รับ" ล้วน)
    const attTeam = att.side === 'A' ? A : B
    const hitRes = runOnHit(tg, Math.max(0, mult), att, foes, rand, forced)
    if (opts.onHitHook) opts.onHitHook(att, tg, hitRes, sub)
    for (const e of hitRes.events) log.push(e)
    // onDealt: ผลฝั่ง "ผู้ตี" ที่ต้องรู้ดาเมจจริง (healOnAttack / teamLifesteal)
    // 🔒 ต้อง push ต่อท้าย hitRes.events ทันที — ลำดับ event ใน log คือสิ่งที่รีเพลย์เล่าตามตรงๆ
    for (const e of runOnDealt(att, attTeam, hitRes.dmg + hitRes.pierce).events) log.push(e)
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
      // 🤍 echo = หมัดตีซ้ำของมาสก์กระต่าย — รีเพลย์รวบทุกหมัดซ้ำให้ยาวรวมเท่าหมัดปกติ 1 หมัด (user 18 ต.ค. 2026) · แสดงผลล้วน
      ...(tier?.echo ? { echo: true } : {}),
      // ดาเมจเชื้อที่ทะลุมาในหมัดนี้ แตกเป็นชั้นละก้อน — **ของฝั่งจอล้วน** (BattleReplay เด้งเลขย่อย
      // แล้วหักออกจากเลขหลัก เพื่อให้ผลรวมบนจอ = เลือดที่หายจริง) · ไม่มีใครเอาไปคิดดาเมจต่อ
      ...(hitRes.pierceHits?.length ? { pierceHits: hitRes.pierceHits } : {}),
      // 🔴 ยังไม่ตาย (0 < hp < 0.5) ห้ามปัดเป็น 0 — จอใส่การ์ดเทา "ตาย" จาก hp 0 แล้วตัวนั้นตีต่อได้อีก (เจอ 26 ก.ย.)
      targetHpAfter: hpAtHit > 0 ? Math.max(1, Math.round(hpAtHit)) : 0, dead: false,
    }
    log.push(entry)
    // announced: true — ใบ 'attack' ข้างบนแบก dead ของเป้าหลักเองอยู่แล้ว
    // ไม่ต้องมีใบการตายเงียบซ้อนอีกใบ (สเปก §4.1) · อีก 3 จุดที่เรียกใช้ค่าเริ่มต้น false ถูกต้องแล้ว
    let dead = hpAtHit <= 0
    if (dead) dead = resolveSilentDeath(tg, att, { announced: true })
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
    for (const u of hitRes.splash || []) resolveSilentDeath(u, att)
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
    return true
  }

  // เลือกเป้า: ถูกบังคับ (taunt) มาก่อนเสมอ · ไม่งั้นสุ่มตามเดิม
  // 🔴 ต้องเช็ค taunt ก่อนเรียก rand() — ถ้าเรียก rand() แล้วค่อยทิ้งผล ลำดับสุ่มจะเลื่อนทั้งไฟต์
  const pick = (foes) => {
    const forced = tauntTargetOf(foes)
    if (forced) return forced
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
    let tg = pick(foes)
    if (!tg) return false
    const attTeam = att.side === 'A' ? A : B
    const mod = runOnAttack(att, tg, foes, rand, attTeam)
    for (const e of mod.events) log.push(e)
    tg = mod.target || tg

    let m = elementMult(att.element, tg.element)
    const eff = m > 1 ? 'super' : (m < 1 ? 'weak' : 'neutral')  // ธาตุล้วน ก่อนคูณ crit/variance
    const crit = rand() < (critRate + (att.critBonus || 0))
    if (crit) m *= critMult
    m *= 1 + (rand() * 2 - 1) * variance
    m *= mod.atkMult * (1 + (tg.vuln || 0))
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
    return killed
  }

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
    if (tg !== boss) { const ts = psOf(tg); if (ts.bless && !r.dodged && r.dmg > 0) { r.dmg *= 0.7; ts.bless = false } return }
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
    if (cfg.kind === 'hammer' && bst.skip > 0) m *= 1.5
    if (cfg.kind === 'doom' && bst.weakUntil >= round) m *= 1.3
    r.dmg *= m
  }

  // --- ตั้งต้นบอส ---
  if (cfg.kind === 'shield') bst.shield = cfg.shield ?? [0, 6, 10, 15][T]
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
      if (cfg.bflyCleanse && e.t === 'passive' && e.effect === 'healLowestAlly') { const v = alive(A).find(x => psOf(x).doom > 0); if (v) { psOf(v).doom = 0; stats.cleanse++; bst.weakUntil = round + 1 } }
      if (e.t === 'passive' && e.effect === 'healOnAttack') for (const uid of e.targets || []) {
        const u = A.find(x => x.uid === uid)
        const v = cfg.uniSmart ? alive(A).find(x => psOf(x).doom > 0) : u
        if (v && psOf(v).doom > 0) { psOf(v).doom = 0; stats.cleanse++; bst.weakUntil = round + 1 }
      }
    }
    scanFrom = log.length
  }

  const bless = (c) => {
    const al = alive(A)
    const bad = al.filter(u => psOf(u).doom > 0 || psOf(u).skip > 0 || psOf(u).spark > 0)
    const tg = (bad.length ? bad : al).reduce((b, u) => (!b || u.hp / u.maxHp < b.hp / b.maxHp ? u : b), null)
    if (!tg) return
    const st = psOf(tg)
    if (st.doom > 0) { st.doom = 0; stats.cleanse++; bst.weakUntil = round + 1 }
    st.skip = 0; st.spark = 0; delete st.infect
    tg.hp = Math.min(tg.maxHp, tg.hp + tg.maxHp * (cfg.cometHeal ?? 20) / 100)
    st.bless = true
  }
  const doomKill = (u) => {
    if (cfg.doomPct) { u.hp -= u.maxHp * cfg.doomPct / 100; stats.doomKill++; resolveSilentDeath(u, boss); return }
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
      const every = cfg.doomEvery ?? (T === 1 ? 2 : 1)
      if (round % every === 0) {
        const n = cfg.doomN ?? (night ? 2 : 1)
        let dur = cfg.doomDur ?? [0, 3, 2, 2][T]
        if (night && boss.hp < boss.maxHp / 2) dur = Math.max(1, dur - 1)
        const cand = alive(A).filter(u => !(psOf(u).doom > 0)).sort((a, b) => b.atk - a.atk).slice(0, n)
        for (const u of cand) psOf(u).doom = dur
      }
    }
    if (cfg.kind === 'shield' && bst.shield === 0 && T >= 2 && round - bst.brokeAt >= (cfg.regen ?? (T === 2 ? 3 : 2))) bst.shield = cfg.shield ?? [0, 6, 10, 15][T]
    if (round >= 10 && (round - 10) % 3 === 0) enrage *= 1.2
  }

  while (alive(A).length && boss.hp > 0 && round < 40) {
    round++; log.push({ t: 'round', n: round })
    for (const e of [...runOnRound(A), ...runOnRound(B)]) log.push(e)
    for (const att of A) {
      if (att.hp <= 0 || boss.hp <= 0) continue
      const st = psOf(att)
      if (st.skip > 0) { st.skip -= 1; continue }
      if (att.id === 'comet') bless(att)
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
