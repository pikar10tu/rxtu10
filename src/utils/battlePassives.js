// src/utils/battlePassives.js
// ตรรกะ passive — pure ทั้งหมด ไม่แตะ store/DOM/Date · สุ่มทุกจุดต้องรับ rand จากเอนจิน (deterministic)
// data อยู่ที่ src/data/petPassives.js · สเปก: docs/superpowers/specs/2026-08-27-passive-v1-design.md
//
// 🔒 กฎเหล็ก: passive ไม่เพิ่มจำนวน beat — cleave/multiStrike อยู่ใน beat เดียวกับหมัดหลัก
//    (ยิงเป็น event `passive` ที่ battleBeats ให้ timing ZERO ⇒ ไม่กินเวลา)
//    👹 windup เป็นข้อยกเว้นเดียวที่เพิ่ม beat จริง (ตาง้าง + ฟาดน็อกตีต่อ 1 ครั้ง) — เพดานอยู่ในเอนจิน
import { PET_PASSIVES, passiveValueAt, partsAt, partAt, partWithEffect } from '../data/petPassives.js'
import { degreeFormActive, seasonOfSlot } from './petForms.js'

export const passiveFor = (unit) => PET_PASSIVES[unit?.id] || null

/** ค่าของ part นั้นตามขั้นที่เพ็ทอัพไว้ (ยังไม่มีระบบหิน ⇒ undefined = ขั้น 1)
 *  ⚠️ ห้ามอ่าน part.value ตรงๆ ในตรรกะ — ไม่งั้นพอระบบหินมา ค่าจะไม่ขยับตามขั้น */
const valOf = (part, unit) => passiveValueAt(part, unit?.passiveLv)
const alive = (t) => t.filter(u => u.hp > 0)
const pctOf = (v, pct) => v * (pct / 100)

/** "อัตราส่วนนี้เป็นกี่ขั้นละ 10%" — ปัดลง แต่ต้องไม่พลาดที่เส้นพอดี
 *  🔴 ห้ามเขียน Math.floor(ratio * 10) ตรงๆ: ratio มาจากการลบ float
 *     `1.2 - 1 = 0.19999999999999996` ⇒ ×10 = 1.9999999999999996 ⇒ floor ได้ 1 ทั้งที่ต้องได้ 2
 *     และเส้นพวกนี้เจอบ่อยของจริง เพราะ maxHp มาจากตารางตัวคูณ rarity/grade ที่ลงตัวสวยๆ
 *     (เลือดเหลือ 80%/90% เป๊ะ · เป้าใหญ่กว่า 1.2×/1.4× เป๊ะ) — 1e-9 เล็กกว่าความละเอียดที่เกมใช้จริงมาก */
const stepsOf10 = (ratio) => Math.floor(ratio * 10 + 1e-9)

/** state ของพาสสีฟระหว่างไฟต์ — สร้างตอนถูกอ่านครั้งแรก (ไม่ต้องแตะ buildCombatant)
 *  🔴 state ทุกกองต้องอยู่ในนี้ ห้ามแปะฟิลด์ลอยบนตัวละครอีก — ตัวละครมี atk/hp/uid/side/…
 *     อยู่แล้ว การเติมฟิลด์ปนเข้าไปคือบั๊กชื่อชนกันแบบเดียวกับ kind/fxKind (CLAUDE.md ข้อ 15)
 *  คีย์ที่ใช้: uses (กันตายไปแล้วกี่ครั้ง) · atkStacks (ชั้น stackAtk) · rage (ชั้น atkOnHit) */
export const psOf = (u) => (u.ps || (u.ps = {}))

/** ❄️ ฤดูหนาวแช่ได้กี่ตาต่อครั้ง — ตัวนับเป็นสแตค (st.skip) ลดทีละ 1 ตอนถึงตา */
export const FREEZE_TURNS = 1

/** snapshot สเตตัสที่ "UI เอาไปวาด" ของทั้งสองทีม — atk/maxHp เท่านั้น
 *  🔑 เอนจินเป็นแหล่งความจริงเดียว — ถ้าปล่อยให้ UI คำนวณ aura เอง
 *     วันที่สูตรเปลี่ยนจะมีสองแหล่งความจริงทันที แล้วเลขบนจอกับเลขที่ใช้สู้จะคลาดกันเงียบๆ
 *  ⚠️ ชื่อฟิลด์ปลายทางคือ `statsAfter` — ห้ามชนกับ `kind` ที่ buildBeats spread ทับ (CLAUDE.md ข้อ 15) */
export function statsSnapshot(...teams) {
  const out = {}
  for (const t of teams) for (const u of t) out[u.uid] = { atk: Math.round(u.atk), maxHp: Math.round(u.maxHp) }
  return out
}

/** effect ที่ขยับ atk/maxHp จริง — teamCrit/enemyVuln ไม่ต้องแบก snapshot ไปด้วย */
const STAT_EFFECTS = new Set(['teamHp', 'teamAtk', 'teamAtkElement', 'stackAtk', 'hunt', 'elementTrinity', 'rarityBoost'])

/** สร้าง event สำหรับ log — รูปเดียวกับที่ BattleReplay/battleBeats รับ
 *  🔴 ชนิดผลชื่อ `fxKind` ห้ามใช้ชื่อ `kind` เด็ดขาด — `kind` เป็นของ battleBeats (= เวลา)
 *     และมันสร้าง beat ด้วย { ...event, kind } ⇒ ชื่อซ้ำเมื่อไหร่ ชนิดผลหายทั้งระบบทันที
 *     (เกิดมาแล้ว 28 ส.ค. `f32b519`: ฮีลแล้วหลอดขึ้นแต่เลข +N ไม่ขึ้น เพราะ 'heal' ถูกทับด้วย 'skill')
 *
 *  📐 กติกาของ `targets` กับ `amount` — เขียนไว้ตรงนี้เพราะ P2c (ชั้นชิป) จะอ่านสองฟิลด์นี้
 *     แล้วถ้าแต่ละ effect ตีความคนละแบบ ชิปจะพิมพ์เลขมั่วโดยไม่มีเทสจับ:
 *       `targets` = การ์ดที่ "ผลไปลง" (คนที่โดน/คนที่ได้) ⇒ FX กับหลอดเลือดยิงที่ใบนั้น
 *       `amount`  = เลขที่ชิปต้องพิมพ์ในหน่วยของ effect นั้น
 *     - `fxKind: 'heal'|'revive'` → targets = คนที่ถูกฟื้น · amount = เลือดจริงที่ฟื้นได้ (+ ส่ง `hpPct` ด้วย)
 *     - `fxKind: 'damage'|'thorns'` → targets = คนที่กิน · amount = ดาเมจจริง
 *     - `fxKind: 'buff'` → **targets = ตัวที่ได้บัฟ (ไม่ใช่เป้าที่ไปตี)** ·
 *       amount = "เลขของบัฟนั้น": `stackAtk`/`atkOnHit` = จำนวนชั้นสะสม (battleBuffs.liveBuffs อ่านเป็นชั้น)
 *       ส่วนตัวที่ไม่ได้สะสมชั้น (`berserk`/`giantSlayer`) = **% ดาเมจที่เพิ่มได้จริงรอบนี้** (ปัดจำนวนเต็ม)
 *       ⚠️ `giantSlayer` ส่งเป็น % คงที่ของธรณีประตู (ไม่มีขั้น ไม่มีเพดานตั้งแต่ 10 ก.ย. 2026)
 *     - `fxKind: 'debuff'` (`infect` ทั้งตอนแปะชั้นและตอนย้ายเชื้อไปโฮสต์ใหม่) → targets = เป้าที่ติด ·
 *       amount = จำนวนชั้นสะสมของเป้านั้นหลังเหตุการณ์นี้ (`st.infect.n`) ไม่ใช่ดาเมจ
 *       ⚠️ 27 ก.ย. 2026: ตอนแปะชั้น (`infect`) ตี "ทีมเดียว" อาจมีหลายเป้าพร้อมกัน (event เดียวหลายเป้า) ·
 *       amount ตอนนั้น = ชั้นสูงสุดในก้อน (เก็บไว้เพื่อผู้อ่านเก่า) — ชั้นจริง "ต่อเป้า" อยู่ใน `stacks: {uid: n}`
 *       ผู้อ่านต้องเช็ค `stacks[uid]` ก่อนเสมอ ไม่งั้นเป้าที่ชั้นน้อยกว่าจะโชว์เลขผิด (ตอนย้ายเชื้อ/infectSpread
 *       ยังเป็นเป้าเดียวเสมอ ไม่มี `stacks` ก็ fallback amount ได้ตามปกติ)
 *     - `fxKind: 'guard'` (`guardian` ของบากุ) → targets = เพื่อนที่ถูกรับแทน · amount = ดาเมจที่ผู้พิทักษ์กินไปแทน
 *     - `fxKind: 'armor'` (`armorStack`) → targets = ตัวที่มีเกราะ · **amount = ดาเมจที่สะท้อนกลับไป**
 *       และ **สแตคที่เหลืออยู่ในฟิลด์แยก `armorLeft`** (0 ได้)
 *       🔴 ห้ามยุบกลับไปใช้ `fxKind: 'guard'` ร่วมกับบากุ — เคยเป็นแบบนั้นมาก่อนแล้วพัง: `amount` ของ
 *          'guard' คือ "ดาเมจที่รับแทน" ส่วนของเกราะคือ "จำนวนสแตค" ⇒ ชื่อ fxKind เดียวกันแต่หน่วยคนละอัน
 *          มินิชิปของ §6.2 ที่คีย์ด้วย fxKind แล้วพิมพ์ `amount` จะพิมพ์เลขมั่วโดยไม่มีเทสจับ
 *     ⚠️ หน่วยของ `amount` เปลี่ยนไปตาม fxKind เสมอ — เพิ่ม fxKind ใหม่เมื่อไหร่ ต้องมาเติมแถวที่นี่ด้วย
 *
 *  🔑 `effect` ปกติมาจาก `part.effect` ตรงๆ แต่ `extra` spread ทับทีหลังได้ (ดู `infectBurst` ใน runOnHit):
 *     ระเบิดเชื้อใช้ part เดียวกับตอนแปะ (`effect: 'infect'`) แต่ต้องส่ง event คนละชื่อ ('infectBurst')
 *     เพราะ `battleBeats.js` กรุ๊ป passive event ติดกันด้วยคีย์ `uid:effect:nth` โดยไม่ดู fxKind เลย —
 *     ถ้าทั้งแปะและระเบิดใช้ effect ชื่อ 'infect' เหมือนกัน หมัดที่ตีเป้าที่ติดเชื้ออยู่แล้ว (กรณีปกติ เพราะ
 *     มีแต่ไวรัสเท่านั้นที่ถือ part นี้) จะชนคีย์กัน ⇒ ป้ายระเบิดตัวแรกโดนกลืนเป็น `skillQuiet` เงียบๆ */
function ev(unit, p, part, extra = {}) {
  return { t: 'passive', uid: unit.uid, side: unit.side, petId: unit.id, name: p.name, icon: p.icon, effect: part.effect, ...extra }
}

/** ฟื้นเลือดให้ unit แล้วคืน { amount, hpPct } — amount = เลือดจริงที่ฟื้นได้ (ไม่ใช่ % ของ passive)
 *  ⚠️ ผู้เล่นต้องเห็นเลขจริง (+15) ไม่ใช่ % ของสูตร และหลอดเลือดต้องขยับตาม */
function healUnit(u, pct) {
  const before = u.hp
  u.hp = Math.min(u.maxHp, u.hp + pctOf(u.maxHp, pct))
  return { amount: Math.round(u.hp - before), hpPct: Math.round((u.hp / u.maxHp) * 100) }
}

/** เพื่อนร่วมทีมที่ยังไม่ตายและเลือดพร่องที่สุด (คืน null ถ้าไม่มีใครพร่อง) */
function lowestHpAlly(team, exclude) {
  let best = null
  for (const u of alive(team)) {
    if (u === exclude) continue
    if (!best || u.hp / u.maxHp < best.hp / best.maxHp) best = u
  }
  return best
}

// ══════════════════════════════════════════════════════════════
//  setup — ก่อน aura ทุกอย่าง (แก้ atk/maxHp ดิบได้)
// ══════════════════════════════════════════════════════════════
/** ผลที่ต้องเกิด "ก่อน" ออร่า เพราะมันเปลี่ยนตัวเลขที่ออร่าจะไปคูณต่อ
 *  🔴 ต้องรันก่อน applyAuras เสมอ — ไม่งั้น statsSnapshot ที่ส่งให้รีเพลย์เป็นเลขก่อนขโมย
 *     แล้วเลขบนการ์ดกับดาเมจจริงจะคลาดกันเงียบๆ */
export function runSetup(team, foes) {
  const out = []
  for (const u of alive(team)) {
    const p = passiveFor(u)
    for (const part of partsAt(p, 'setup')) {
      const v = valOf(part, u)
      if (part.effect !== 'stealStats') continue
      const targets = alive(foes)
      if (!targets.length) continue
      let gotAtk = 0, gotHp = 0
      for (const f of targets) {
        const dAtk = pctOf(f.atk, v.pct)
        const dHp = pctOf(f.maxHp, v.pct)
        f.atk -= dAtk
        f.maxHp -= dHp
        f.hp = Math.min(f.hp, f.maxHp)      // เลือดปัจจุบันห้ามล้นหลอดที่หดลง
        gotAtk += dAtk
        gotHp += dHp
      }
      u.atk += gotAtk
      u.maxHp += gotHp
      u.hp += gotHp                          // ได้เลือดมาเต็มก้อนที่ขโมยได้
      const e = ev(u, p, part, { targets: targets.map(t => t.uid), amount: Math.round(gotAtk), fxKind: 'buff' })
      e.statsAfter = statsSnapshot(team, foes)
      out.push(e)
    }
    // 🦖 ทีเร็กซ์ (hunt) ย้ายชั้นตั้งต้นไปที่ initHunt() ด้านล่าง — ต้องรันหลัง applyAuras
    //    (ซอล/สิงโต/วาฬ) ไม่ใช่ที่นี่ ไม่งั้นฐานของ hunt จะไม่นับ atk ที่ aura คูณทีหลัง
  }
  return out
}

// ══════════════════════════════════════════════════════════════
//  forms — ร่างพิเศษตามองค์ประกอบทีม (ก่อน setup/aura ทุกอย่าง)
// ══════════════════════════════════════════════════════════════
/** 🌍 ร่าง "องศา": ทีมมี Sol + Earth และไม่มี common ⇒ Earth นับเป็น common (ได้แสงนำทาง) แต่ไม่มีฤดู
 *  🔑 เงื่อนไขอยู่ที่ utils/petForms.js ที่เดียว — ป้าย/รีเพลย์/หน้าจัดทีมอ่านตัวเดียวกัน */
export function applyForms(team) {
  if (!degreeFormActive(team)) return
  for (const u of team) {
    if (u.id !== 'earth') continue
    u.countsAs = 'common'
    psOf(u).formed = true
  }
}

// ══════════════════════════════════════════════════════════════
//  aura — แก้ stat ก่อนไฟต์เริ่ม (ไม่มี event, ผู้เล่นเห็นผลผ่านตัวเลขบนการ์ด)
// ══════════════════════════════════════════════════════════════
/**
 * ใส่ aura ของทีมหนึ่งลงบนทีมตัวเอง + ผลข้ามฝั่ง (enemyVuln) ลงบนศัตรู
 * ⚠️ ต้องเรียกให้ครบทั้งสองฝั่ง "ก่อน" หมัดแรก และเรียกครั้งเดียวเท่านั้น
 */
export function applyAuras(team, foes) {
  const ids = new Set(alive(team).map(u => u.id))
  const out = []
  for (const u of team) {
    const p = passiveFor(u)
    for (const part of partsAt(p, 'aura')) {
      const v = valOf(part, u)
      // ⚠️ aura ต้องเด้งป้ายตอนเริ่มด้วย — เดิมสเปกเขียนว่า "ไม่มี event เพราะเห็นผลผ่านตัวเลข"
      //    แต่เทสจอจริงพบว่าทีมที่มี aura ล้วน (เช่น whale+seal) เงียบสนิท ผู้เล่นไม่รู้เลยว่ามี passive
      //    master plan §5.5 เขียนถูกแล้วว่า "proc ตอนเริ่มเกม → ป้ายขึ้นพร้อมกันตอนเริ่ม"
      const e = ev(u, p, part, { targets: [u.uid], fxKind: 'aura' })
      out.push(e)
      switch (part.effect) {
        case 'teamHp': {
          const add = pctOf(1, v.pct)
          for (const t of team) { t.maxHp *= (1 + add); t.hp = t.maxHp }
          break
        }
        case 'teamCrit':
          for (const t of team) t.critBonus = (t.critBonus || 0) + v.pct / 100
          break
        case 'teamAtk': {
          // คู่หู: ถ้ามีเพื่อนตามที่ระบุอยู่ในทีม บัฟแรงขึ้น + ทีมได้ regen
          const duo = v.duoWith && ids.has(v.duoWith)
          const pct = duo ? v.duoPct : v.pct
          for (const t of team) t.atk *= (1 + pct / 100)
          if (duo && v.duoRegen) for (const t of team) t.teamRegenPct = (t.teamRegenPct || 0) + v.duoRegen
          break
        }
        case 'teamAtkElement':
          // บัฟเฉพาะเพื่อนที่อยู่สายที่ระบุ — ตัวสายอื่นในทีมไม่ได้อะไร
          // (ของเดิม teamAtkPerElement บัฟ *ทั้งทีม* โดยคูณตามจำนวนเพื่อนสายนั้น ⇒ ยิ่งกองยิ่งบาน)
          for (const t of team) if (t.element === v.element) t.atk *= (1 + v.pct / 100)
          break
        case 'teamRegen':
          // ใช้ช่องเดียวกับ duo whale🔗seal — ถ้ามีทั้งคู่ก็บวกกัน (ตั้งใจ)
          for (const t of team) t.teamRegenPct = (t.teamRegenPct || 0) + v.pct
          break
        case 'enemyVuln':
          for (const f of foes) f.vuln = (f.vuln || 0) + v.pct / 100
          break
        case 'elementTrinity': {
          // ต้องครบทั้ง 3 สายในทีมที่ยังไม่ตาย — ขาดสายเดียวไม่ได้อะไรเลย (all-or-nothing โดยตั้งใจ)
          const els = new Set(alive(team).map(t => t.element))
          if (els.size < 3) break
          for (const t of team) {
            t.atk *= (1 + v.pct / 100)
            t.maxHp *= (1 + v.hpPct / 100)
            t.hp = t.maxHp
          }
          break
        }
        case 'teamLifesteal':
          // แปะ % ไว้บนตัวละคร — ใช้จริงตอนตีใน runOnHit (ที่นั่นเท่านั้นที่รู้ดาเมจจริง)
          for (const t of team) t.lifestealPct = (t.lifestealPct || 0) + v.pct
          break
        case 'teamDamageReduction':
          for (const t of team) t.teamDrPct = (t.teamDrPct || 0) + v.pct
          u.teamDrPct = (u.teamDrPct || 0) + v.pct      // เจ้าของได้อีกรอบ = 2 เท่า (user เคาะ 3 ก.ย.)
          break
        case 'rarityBoost':
          // ☀️ ขั้นบันไดตามระดับ (27 ก.ย. 2026) — ตัวที่ "นับเป็น" ระดับนั้น (เอิร์ธร่างองศา = common) · ซอลเองไม่ได้
          e.boosts = {}   // uid → % ที่ได้ (จอใช้วาดออร่าตามแรงบัฟ — แสดงผลล้วน)
          for (const t of team) {
            if (t === u) continue
            const pct = v[t.countsAs || t.rarity] || 0
            if (!pct) continue
            e.boosts[t.uid] = pct
            t.atk *= 1 + pct / 100
            t.maxHp *= 1 + pct / 100
            t.hp = t.maxHp
          }
          break
      }
      // ⚠️ ต้องเติม "หลัง" switch — event ถูก push ไปก่อนที่ stat จะเปลี่ยนจริง
      //    ถ้าเติมตอนสร้าง ev() จะได้ snapshot ของ "ก่อนออร่าทำงาน" = เลขไม่ขยับเลยบนจอ
      if (STAT_EFFECTS.has(part.effect)) e.statsAfter = statsSnapshot(team, foes)
    }
  }
  // 🌍 ประกาศฤดูตอนเปิดไฟต์ (29 ก.ย. 2026 user): แบนเนอร์ใหญ่บอกฤดูครั้งเดียว · จบรอบเหลือแถบเล็กบอกผล
  //    แสดงผลล้วน ไม่แตะสเตตัส ไม่ดึง rand · ร่างองศา (formed) ไม่มีฤดู = ไม่ประกาศ
  for (const u of alive(team)) {
    const p = passiveFor(u)
    const part = partsAt(p, 'onRoundEnd').find(x => x.effect === 'season')
    if (!part || psOf(u).formed) continue
    const s = seasonOfSlot(u.slot)
    out.push(ev(u, p, part, { effect: 'seasonAnnounce', name: s.label, icon: s.icon, season: s.key, targets: [u.uid], fxKind: 'aura' }))
  }
  return out
}

// ══════════════════════════════════════════════════════════════
//  hunt init — หลัง aura ทั้งหมด (🦖 ทีเร็กซ์)
// ══════════════════════════════════════════════════════════════
/** 🔴 ต้องเรียก "หลัง" applyAuras เสมอ — huntBase จับ atk ณ ตอนนี้แล้วใช้เป็นฐานตลอดไฟต์
 *     (ต่างจาก stealStats ที่ต้องจับ *ก่อน* aura) ไม่งั้นซอล/สิงโต/วาฬ/ขโมยของหนูที่คูณ atk ไปแล้ว
 *     จะไม่ถูกนับรวมในฐานของชั้นที่ทุกหมัดจะบวกเพิ่มทั้งไฟต์ ⇒ ทีมที่มีออร่าคูณ atk จะได้ hunt อ่อนกว่าที่ควร
 *  🔇 ไม่ยิง event โดยตั้งใจ (เหตุผลเดียวกับชั้นตั้งต้นเดิมของ stackAtk): เป็นสเตตัสตั้งต้นก่อนไฟต์เริ่ม
 *     ไม่ใช่โมเมนต์ระหว่างไฟต์ · statsSnapshot() ที่เอนจินเก็บ "หลัง" ฟังก์ชันนี้ (ไม่ใช่หลัง aura ตรงๆ)
 *     แบกค่านี้ไปให้การ์ดอยู่แล้ว ⇒ ยิง event ซ้ำจะได้ป้ายที่เลขบนจอไม่ขยับตาม */
export function initHunt(team) {
  for (const u of alive(team)) {
    const p = passiveFor(u)
    const part = partWithEffect(p, 'hunt')
    if (!part) continue
    const v = valOf(part, u)
    const st = psOf(u)
    st.huntBase = u.atk                      // ฐานหลัง aura — ทุกหมัดบวกเพิ่มจากตัวเลขนี้ตลอดไฟต์
    st.huntStacks = v.start || 0
    if (st.huntStacks > 0) u.atk += st.huntBase * v.pct / 100 * st.huntStacks
  }
}

// ══════════════════════════════════════════════════════════════
//  onStart — ก่อนหมัดแรก
// ══════════════════════════════════════════════════════════════
export function runOnStart(team, foes) {
  const out = []
  for (const u of alive(team)) {
    const p = passiveFor(u)
    for (const part of partsAt(p, 'onStart')) {
      const v = valOf(part, u)
      if (part.effect === 'aoeOpener') {
        const targets = alive(foes)
        if (!targets.length) continue
        const dmg = pctOf(u.atk, v.pct)
        for (const t of targets) t.hp -= dmg
        out.push(ev(u, p, part, { targets: targets.map(t => t.uid), amount: Math.round(dmg), fxKind: 'damage' }))
      } else if (part.effect === 'teamHealOpener') {
        const targets = alive(team)
        for (const t of targets) t.hp = Math.min(t.maxHp, t.hp + pctOf(t.maxHp, v.pct))
        out.push(ev(u, p, part, { targets: targets.map(t => t.uid), amount: v.pct, fxKind: 'heal' }))
      }
    }
  }
  return out
}

// ══════════════════════════════════════════════════════════════
//  onRound — ต้นรอบใหม่
// ══════════════════════════════════════════════════════════════
/** ⚠️ `taunt` ลงทะเบียนบน hook `onRound` แต่ **ไม่มีเคสในฟังก์ชันนี้โดยตั้งใจ** — ไม่ใช่ของตกหล่น
 *  hook บอกแค่ "ผลนี้มีอายุเท่ารอบหนึ่ง" (มุมผู้เล่น: ต้นรอบใหม่กอริลลาท้าชนอีกครั้ง) ส่วนคนอ่านค่าจริงคือ
 *  `tauntTargetOf()` ที่ตัวเลือกเป้าของเอนจินเรียกก่อนสุ่ม และ `runOnHit` ที่หักดาเมจเมื่อ forced = true
 *  🔴 ห้ามเติมเคส `taunt` ลงลูปข้างล่างเพื่อ "ให้ครบ" — มันจะกลายเป็น event ซ้ำที่ไม่มีผลอะไรทุกต้นรอบ */
export function runOnRound(team) {
  const out = []
  for (const u of alive(team)) {
    // ☀️ ฤดูร้อนจากจบรอบก่อน มีผลทั้งรอบนี้ แล้วหมดอายุ (จบรอบนี้ถ้า Earth ยังอยู่จะตั้งใหม่)
    { const st = psOf(u); st.hotActive = st.hotNext || 0; st.hotNext = 0 }
    const p = passiveFor(u)
    // regen จากคู่หู whale🔗seal ติดมากับ unit ไม่ได้มาจาก passive ของตัวเอง
    // คู่หู whale🔗seal — เดิมฟื้นเงียบไม่มี event เลย ผู้เล่นไม่เห็นว่าคู่หูทำงานอยู่
    if (u.teamRegenPct && u.hp < u.maxHp) {
      const h = healUnit(u, u.teamRegenPct)
      if (h.amount > 0) out.push({ t: 'passive', uid: u.uid, side: u.side, petId: u.id,
        name: 'รางวัลคนเก่ง', icon: '💧', effect: 'duoRegen', targets: [u.uid], ...h, fxKind: 'heal' })
    }
    for (const part of partsAt(p, 'onRound')) {
      const v = valOf(part, u)
      if (part.effect === 'regenSelf') {
        if (u.hp >= u.maxHp) continue                       // เลือดเต็มแล้วไม่ต้องเด้งป้าย
        const h = healUnit(u, v.pct)
        out.push(ev(u, p, part, { targets: [u.uid], ...h, fxKind: 'heal' }))
      } else if (part.effect === 'healLowestAlly') {
        const t = lowestHpAlly(team, u)
        if (!t || t.hp >= t.maxHp) continue
        const h = healUnit(t, v.pct)
        out.push(ev(u, p, part, { targets: [t.uid], ...h, fxKind: 'heal' }))
      } else if (part.effect === 'stackAtk') {
        // ไต่ชั้นทุกต้นรอบ (🐍) — เพดานและวิธีคิดเหมือน onKill/onAnyDeath ทุกประการ
        const st = psOf(u)
        const stacks = st.atkStacks || 0
        if (stacks < v.max) {
          st.atkStacks = stacks + 1
          u.atk *= 1 + v.pct / 100
          const e = ev(u, p, part, { targets: [u.uid], amount: st.atkStacks, fxKind: 'buff' })
          e.statsAfter = statsSnapshot(team)
          out.push(e)
        }
      }
    }
  }
  return out
}

// ══════════════════════════════════════════════════════════════
//  onRoundEnd — จบรอบ (ทุกตัวได้ตาครบแล้ว) · 🌍 ฤดูกาล (Task 5)
// ══════════════════════════════════════════════════════════════
/** 🌍 ฤดูกาลตามช่องของ Earth — ยิงเมื่อทุกตัวในไฟต์ได้ตาครบ 1 รอบ (ร่างองศาไม่มีฤดู)
 *  ช่อง 0 ☀️ ร้อน = รอบหน้าทีมแรง +hot% (ตั้ง hotNext ไว้ก่อน runOnRound ต้นรอบหน้าจะสลับเป็น hotActive)
 *  ช่อง 1 🌧️ ฝน = ฟื้น rain% ของเลือดที่หายไปให้ทุกตัว 1 event ต่อ 1 เป้าที่ได้ฟื้นจริง (> 0)
 *  ช่อง 2 ❄️ หนาว = ทอย rand ศัตรูที่ยังไม่ตายทีละตัวตามลำดับช่อง (deterministic) — โดน cold% ⇒ skip ตาถัดไป */
export function runOnRoundEnd(team, foes, rand) {
  const out = []
  for (const u of alive(team)) {
    const p = passiveFor(u)
    for (const part of partsAt(p, 'onRoundEnd')) {
      if (part.effect !== 'season' || psOf(u).formed) continue   // ร่างองศาไม่มีฤดู
      const v = valOf(part, u)
      // ชื่อ/ไอคอนบนจอเป็นของฤดู (☀️ ฤดูร้อน · 🌧️ ฤดูฝน · ❄️ ฤดูหนาว) ไม่ใช่ชื่อสกิลรวม — user ขอ 27 ก.ย.
      const s = seasonOfSlot(u.slot)
      if (s.key === 'hot') {
        for (const t of alive(team)) psOf(t).hotNext = v.hot
        out.push(ev(u, p, part, { effect: 'seasonHot', name: s.label, icon: s.icon, targets: alive(team).map(t => t.uid), amount: v.hot, fxKind: 'buff' }))
      } else if (s.key === 'rain') {
        for (const t of alive(team)) {
          const before = t.hp
          t.hp = Math.min(t.maxHp, t.hp + (t.maxHp - t.hp) * v.rain / 100)
          const amount = Math.round(t.hp - before)
          if (amount > 0) out.push(ev(u, p, part, { effect: 'seasonRain', name: s.label, icon: s.icon, targets: [t.uid], amount,
            hpPct: Math.round((t.hp / t.maxHp) * 100), fxKind: 'heal' }))
        }
      } else {
        // 🎲 ดึง rand ศัตรูละ 1 ครั้ง ตามลำดับช่อง (deterministic)
        const hit = alive(foes).filter(() => rand() * 100 < v.cold)
        // ❄️ แช่แข็ง = สแตคดีบัฟ (29 ก.ย. 2026 user): โดนซ้ำบวกเพิ่ม · ถึงตาตัวเองมีสแตค = ข้ามตาแล้วลด 1 (เอนจิน)
        //    รองรับกลไกแช่หลายตาในอนาคต (FREEZE_TURNS ต่อครั้ง) · stacks ส่งให้จอวาดเลขบนป้าย ❄️
        const stacks = {}
        for (const f of hit) { const st = psOf(f); st.skip = (st.skip || 0) + FREEZE_TURNS; st.skipName = 'แช่แข็ง'; st.skipIcon = '❄️'; stacks[f.uid] = st.skip }
        // ยิงทุกจบรอบแม้แช่ไม่โดนใคร (29 ก.ย. user: "ควรทำงานไง หิมะตกแล้ว แช่โดนหรือไม่โดนก็อีกเรื่อง") · amount 0 = พลาดหมด
        out.push(ev(u, p, part, { effect: 'seasonCold', name: s.label, icon: s.icon, targets: hit.map(f => f.uid), amount: hit.length, stacks, fxKind: 'freeze' }))
      }
    }
  }
  return out
}

/** ตัวที่ถูกบังคับให้เป็นเป้าในรอบนี้ (taunt) — คืน null ถ้าไม่มีใครบังคับ
 *  🔴 กอริลลา 2 ตัวในทีมเดียว = เอาช่องซ้ายสุดเสมอ · ต้อง deterministic ไม่งั้นรีเพลย์ไม่ตรงกับผลจริง
 *  🔴 ห้ามดึง rand ในฟังก์ชันนี้ — ลำดับการดึงสุ่มของเอนจินต้องไม่เปลี่ยน ไม่งั้นไฟต์เดิมทั้งเกมเพี้ยน */
export function tauntTargetOf(foes) {
  for (const u of alive(foes)) {
    const part = partsAt(passiveFor(u), 'onRound').find(x => x.effect === 'taunt')
    if (part) return u
  }
  return null
}

// ══════════════════════════════════════════════════════════════
//  onAttack — ก่อนคิดดาเมจ (คืนตัวปรับ ไม่แก้ state เอง)
// ══════════════════════════════════════════════════════════════
/** 👹 พาสสีฟง้าง/ฟาดของ unit นี้ (null = ไม่มี) — เอนจินใช้ตัดสินว่าตานี้ง้างหรือฟาด */
export function windupOf(unit) {
  const part = partWithEffect(passiveFor(unit), 'windup')
  return part ? { part, v: valOf(part, unit) } : null
}

/**
 * คืน { target, atkMult, extra[], strikes, events }
 *   target  = เป้าหลัก (อาจถูกเปลี่ยนโดย targetLowest)
 *   atkMult = ตัวคูณดาเมจของหมัดหลัก (execute / atkWhenFull)
 *   extra   = [{ unit, pct }] เป้ารองของ cleave — โดนใน beat เดียวกัน
 *   strikes = จำนวนหมัดบนเป้าหลักใน beat เดียวกัน (multiStrike)
 */
export function runOnAttack(att, target, foes, rand, attTeam = null) {
  const p = passiveFor(att)
  const res = { target, atkMult: 1, extra: [], strikes: 1, strikePct: 100, events: [] }
  for (const part of partsAt(p, 'onAttack')) {
    const v = valOf(part, att)
    switch (part.effect) {
      case 'targetLowest': {
        if (tauntTargetOf(foes)) break        // ถูกบังคับอยู่ — ลำดับในสเปก: taunt > targetLowest
        const low = alive(foes).reduce((b, f) => (!b || f.hp / f.maxHp < b.hp / b.maxHp ? f : b), null)
        if (low && low !== target) {
          res.target = low
          res.events.push(ev(att, p, part, { targets: [low.uid], fxKind: 'aim' }))
        }
        break
      }
      case 'cleave': {
        const pool = alive(foes)
        let others
        if (v.repeat) {
          // สุ่มซ้ำตัวเดิมได้ — ตัวเดียวอาจโดนหลายที (🐕 เซอร์เบอรัส)
          // 🎲 ดึง rand ตรงนี้ ⇒ ลำดับสุ่มของไฟต์ที่มีตัวนี้เลื่อนจากของเดิม เป็นเจตนา
          others = []
          for (let i = 0; i < Math.max(0, (v.count || 1) - 1); i++) {
            if (!pool.length) break
            others.push(pool[Math.floor(rand() * pool.length)])
          }
        } else {
          others = pool.filter(f => f !== res.target).slice(0, Math.max(0, (v.count || 1) - 1))
        }
        if (others.length) {
          res.extra = others.map(u => ({ unit: u, pct: v.pct }))
          res.events.push(ev(att, p, part, { targets: [res.target.uid, ...others.map(u => u.uid)], fxKind: 'cleave' }))
        }
        break
      }
      case 'execute':
        if (target && target.hp / target.maxHp < (v.below / 100)) {
          res.atkMult *= 1 + v.pct / 100
          res.events.push(ev(att, p, part, { targets: [target.uid], fxKind: 'buff' }))
        }
        break
      case 'atkWhenFull':
        if (att.hp >= att.maxHp) {
          res.atkMult *= 1 + v.pct / 100
          res.events.push(ev(att, p, part, { targets: [att.uid], fxKind: 'buff' }))
        }
        break
      case 'multiStrike':
        if (rand() * 100 < v.chance) {
          res.strikes = 2
          res.strikePct = v.pct
          res.events.push(ev(att, p, part, { targets: [target?.uid].filter(Boolean), fxKind: 'multi' }))
        }
        break
      case 'berserk': {
        // ขั้นละ 10% ของเลือดที่หายไป — ปัดลง (เลือด 40% = หาย 60% = 6 ขั้น)
        const steps = stepsOf10(1 - att.hp / att.maxHp)
        if (steps > 0) {
          const pct = steps * v.pct
          res.atkMult *= 1 + pct / 100
          res.events.push(ev(att, p, part, { targets: [att.uid], amount: Math.round(pct), fxKind: 'buff' }))
        }
        break
      }
      case 'giantSlayer': {
        // ธรณีประตูเดียว: เป้ามี maxHp มากกว่าเรา → +pct% คงที่ (user เคาะ 10 ก.ย. 2026)
        // 🔑 ของเดิมไต่ขั้นละ 10% + เพดาน `max` — เปลี่ยนเพราะอ่านบนการ์ดแล้วต้องเข้าใจทันที
        //    และตัดคำถาม "ใหญ่กว่ากี่ % ถึงนับ" ออกจากหัวผู้เล่น · คีย์ `max` ถูกลบทั้งสัญญา
        if (!target) break
        if (target.maxHp <= att.maxHp) break
        res.atkMult *= 1 + v.pct / 100
        res.events.push(ev(att, p, part, { targets: [att.uid], amount: Math.round(v.pct), fxKind: 'buff' }))
        break
      }
      case 'moonPhase': {
        // 🌙 วนตามหมัดของตัวเอง: ดับ → เสี้ยว → เต็มดวง · เต็มดวงได้แบนเนอร์ (fullMoon อยู่ใน CLUTCH_EFFECTS)
        const st = psOf(att)
        const i = st.moon || 0
        st.moon = (i + 1) % 3
        const pct = [v.dark, v.half, v.full][i]
        res.atkMult *= pct / 100
        const full = i === 2
        res.events.push(ev(att, p, part, { effect: full ? 'fullMoon' : 'moonPhase', targets: [att.uid],
          amount: pct, phase: i, fxKind: full ? 'fullMoon' : 'moon' }))
        break
      }
      case 'woundBonus': {
        // 🦅 กริฟฟิน: คิดจากเป้าปัจจุบันของ res (หลัง targetLowest เปลี่ยนไปแล้ว ถ้ามี) — ทำงานตั้งแต่หมัดแรก
        const tg = res.target
        if (!tg || !tg.maxHp) break
        const lost = Math.max(0, 1 - tg.hp / tg.maxHp)
        if (lost <= 0) break
        res.atkMult *= 1 + (v.pct / 100) * lost
        res.events.push(ev(att, p, part, { targets: [tg.uid], amount: Math.round(lost * v.pct), fxKind: 'aim' }))
        break
      }
      case 'windup':
        // 👹 โอนิ: เอนจินเป็นคนตัดสินว่าตานี้ง้างหรือฟาด (windupOf + psOf.smashing) — ที่นี่แค่คูณหมัดฟาด
        //    ทั้งหมัดฟาดปกติและหมัดตีต่อหลังฟาดน็อก (smashing ยังเป็น true ตลอดทั้งตา)
        if (psOf(att).smashing) {
          res.atkMult *= v.pct / 100
          res.events.push(ev(att, p, part, { targets: [res.target.uid], fxKind: 'smash' }))
        }
        break
      // 🔴 healOnAttack ก็ hook: 'onAttack' ในข้อมูล แต่คำนวณใน runOnDealt (ข้างล่างนี้) — ดูคอมเมนต์ที่นั่น
      case 'hunt': {
        // 🦖 ทุกหมัดที่ตี +pct% ของ atk ฐาน (หลัง aura, จับไว้ตอน initHunt) บวกเพิ่มเสมอ ไม่เซ็ตทับ
        // ⇒ ไม่ลบผลของขโมยสเตตัส/ฤดูร้อน/บัฟอื่นที่แตะ att.atk ไปก่อนหน้านี้แล้ว · ไม่มีเพดาน (บาลานซ์ 27 ก.ย. 2026)
        // ℹ️ หมัดแรกจริงได้ 2 ชั้น (ฐาน 1 + ชั้นนี้อีก 1) เพราะชั้นเพิ่มก่อนคิดดาเมจของหมัดนั้นเอง (ตั้งใจ)
        const st = psOf(att)
        st.huntStacks = (st.huntStacks || 0) + 1
        att.atk += (st.huntBase ?? att.atk) * v.pct / 100
        const e = ev(att, p, part, { targets: [att.uid], amount: st.huntStacks, fxKind: 'buff' })
        e.statsAfter = attTeam ? statsSnapshot(attTeam) : statsSnapshot([att])
        res.events.push(e)
        break
      }
    }
  }
  // 🌍 บัฟร้อนจากฤดูกาลจบรอบก่อน (ตั้งไว้ใน runOnRound ต้นรอบนี้) — คูณทบกับตัวคูณอื่นทั้งหมดข้างบน
  const hot = psOf(att).hotActive || 0
  if (hot > 0) res.atkMult *= 1 + hot / 100
  return res
}

/** ── ผลฝั่ง "ผู้ตี" ที่ต้องรู้ดาเมจจริงถึงจะคิดได้ ──
 *  เรียกทันทีหลัง runOnHit ของหมัดนั้น (เอนจิน push event ต่อจากกันเลย ⇒ ลำดับบนจอไม่เปลี่ยน)
 *  คืน { events }
 *
 *  🔴 hook ในข้อมูลของ effect พวกนี้คือ `onAttack` (มุมผู้เล่น: "เมื่อฉันตี") แต่คิดที่นี่
 *     เพราะ runOnAttack ยังไม่รู้ดาเมจจริง — ใครอ่าน runOnAttack แล้วหา healOnAttack/ดูดเลือดไม่เจอ ให้มาดูตรงนี้
 *  🔑 แยกออกจาก runOnHit เพราะ runOnHit เป็นมุมของ "ผู้รับ" ล้วน — เดิมรับทีมผู้ตีเป็นพารามิเตอร์
 *     ตัวที่ 6 (`attTeam = null`) ต่อท้ายพารามิเตอร์ชื่อ `team` ที่แปลว่าทีมผู้รับ ⇒ สลับกันได้ง่ายมาก
 *     และถ้าลืมส่ง ผลฝั่งผู้ตีจะเงียบหายโดยไม่มีใครรู้ · P2b ยังจะเติม taunt/infect เข้ามาอีก
 *  @param {object} attacker  ตัวที่ตี
 *  @param {Array}  attTeam   ทีมของผู้ตี (ต้องมี ไม่งั้นหาเพื่อนที่บอบช้ำสุดไม่ได้)
 *  @param {number} dealt     ดาเมจที่ลงจริงกับเป้าในหมัดนี้ (res.dmg + res.pierce)
 */
export function runOnDealt(attacker, attTeam, dealt) {
  const out = { events: [] }
  // 🔴 ผู้ตีอาจตายไปแล้วระหว่างบีตนี้ (โดนหนามสวนตอน sub-hit ก่อนหน้า) — เอนจินไม่ได้เช็คเลือด
  //    ผู้ตีระหว่าง cleave/multiStrike · ถ้าปล่อยให้ teamLifesteal ทำงานต่อ มันจะดูดเลือดตัวเอง
  //    กลับขึ้นมาเกิน 0 โดยไม่เคยผ่าน runOnDeath = ฟื้นคืนชีพโดยไม่เคยตายอย่างเป็นทางการ
  if (!attacker || attacker.hp <= 0 || !attTeam || dealt <= 0) return out

  const ap = passiveFor(attacker)
  for (const part of partsAt(ap, 'onAttack')) {
    if (part.effect !== 'healOnAttack') continue
    // 🔑 ยิงครั้งเดียวต่อ "หมัดลูก" หนึ่งใบ (cleave/multiStrike ยิงหลายรอบต่อ beat) — ตั้งใจ ✅ user เคาะ:
    //    สูตรเป็นเชิงเส้น (pct ของดาเมจ) ⇒ รวมทั้ง beat แล้วได้เท่ากับคิดทีเดียวจากดาเมจรวมเป๊ะ
    //    และการเลือกเป้าใหม่ทุกหมัดลูกทำให้ "ฟื้นให้คนที่บอบช้ำที่สุด ณ วินาทีนั้น" ซึ่งเป็นพฤติกรรมที่ดีกว่า
    //    (คิดทีเดียวตอนจบ beat = เทเลือดก้อนเดียวใส่คนเดียว อาจล้นหลอดทิ้งทั้งที่อีกคนกำลังจะตาย)
    const t = lowestHpAlly(attTeam, attacker)
    if (!t || t.hp >= t.maxHp) continue
    const before = t.hp
    t.hp = Math.min(t.maxHp, t.hp + pctOf(dealt, valOf(part, attacker).pct))
    const amount = Math.round(t.hp - before)
    if (amount > 0) {
      out.events.push(ev(attacker, ap, part, { targets: [t.uid], amount,
        hpPct: Math.round((t.hp / t.maxHp) * 100), fxKind: 'heal' }))
    }
  }

  // ดูดเลือดของทีม (teamLifesteal) — applyAuras แปะ % ไว้บนตัวละคร ที่นี่คือที่เดียวที่รู้ดาเมจจริง
  // 🔑 event ไม่ผ่าน ev() เพราะ "เจ้าของออร่า" อาจเป็นเพื่อนคนละตัวกับคนที่ได้ดูด — ชื่อ/ไอคอนของ
  //    พาสสีฟตัวเองจึงใช้ไม่ได้ · ใช้แพทเทิร์นเดียวกับ duoRegen ใน runOnRound (คำกลาง + ไอคอนของ *ผล*)
  if (attacker.lifestealPct > 0) {
    const before = attacker.hp
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + pctOf(dealt, attacker.lifestealPct))
    const amount = Math.round(attacker.hp - before)
    if (amount > 0) {
      out.events.push({
        t: 'passive', uid: attacker.uid, side: attacker.side, petId: attacker.id,
        name: 'ดูดเลือด', icon: '🩸', effect: 'teamLifesteal', targets: [attacker.uid],
        amount, hpPct: Math.round((attacker.hp / attacker.maxHp) * 100), fxKind: 'heal',
      })
    }
  }

  return out
}

// ══════════════════════════════════════════════════════════════
//  onHit — ก่อนหักเลือด (dodge / ลดดาเมจ / เปลี่ยนตัวรับ / หนาม)
// ══════════════════════════════════════════════════════════════
/**
 * คืน { dmg, dodged, thorns, events, pierce, reflect }
 *   thorns   = ดาเมจสะท้อนกลับไปที่ผู้ตี (เอนจินเป็นคนหัก)
 *   reflect  = ดาเมจดิบที่ต้องยิงใส่ศัตรูทุกตัวของผู้รับ ผ่าน strike() ปกติ (armorStack, สเปก §4.3)
 */
export function runOnHit(defender, dmg, attacker, team, rand, forced = false) {
  // pierce = ดาเมจที่ "ไม่ผ่านสายลด" — เอนจินหักหลัง res.dmg · วันนี้มีแค่ infect (P2b) ที่ใส่ค่า
  // 🔴 ห้ามเอาไปใช้กับกลไกอื่นโดยไม่แก้สเปก: การทะลุเกราะคือเหตุผลที่ไวรัสมีอยู่
  //    ถ้าแจกให้ตัวอื่นด้วย มันจะกลายเป็นแค่ "ดาเมจเพิ่ม" อีกตัวหนึ่ง
  // pierceHits = ก้อน pierce แตกเป็น "ชั้นละก้อน" สำหรับฝั่งจอเท่านั้น (ผลรวมเท่ากับ Math.round(pierce) เป๊ะ)
  // 🔴 ห้ามเอาไปคิดดาเมจจริง — เอนจินหักด้วย res.pierce ตัวเต็ม (ยังไม่ปัด) เหมือนเดิมทุกประการ
  const res = { dmg, dodged: false, thorns: 0, pierce: 0, reflect: 0, pierceHits: [], events: [] }

  // 1) guardian ของ "เพื่อนในทีมเดียวกัน" — ต้องเช็คก่อนของตัว defender เอง
  // 🔑 ส่วนที่ผู้พิทักษ์รับไปถูกหักออกจากดาเมจ "ก่อน" teamDrPct และก่อน damageReduction ทุกตัว
  //    ⇒ ก้อนนั้นไม่ผ่านสายลดเลยแม้แต่ชั้นเดียว (ผู้พิทักษ์กินเต็มๆ ตามสัดส่วนที่รับ)
  //    เป็นไปตามสเปก ตั้งใจให้เป็นแบบนี้: การ์ดของผู้พิทักษ์คือ "เอาตัวเข้าแลก" ไม่ใช่ "ลดดาเมจอีกชั้น"
  //    ถ้าย้ายไปหักทีหลัง เกราะของเป้าจะไปลดก้อนที่เพื่อนเป็นคนกินด้วย = ผู้พิทักษ์ได้ประโยชน์จากเกราะคนอื่น
  //    ⚠️ อย่าเพิ่งคิดว่าเป็นบั๊กแล้วสลับลำดับ — มีเทสของสายลดคุมตัวเลขนี้อยู่
  for (const g of alive(team)) {
    const gp = passiveFor(g)
    const gpart = partsAt(gp, 'onHit').find(x => x.effect === 'guardian')
    if (!gpart || g === defender) continue
    // 🔗 29 ก.ย. 2026 (user เลือกแบบ ก): ลิงก์ทั้งทีม — เพื่อนคนไหนโดนก็รับแทน (เดิมเฉพาะคนเลือด % น้อยสุด)
    const share = pctOf(res.dmg, valOf(gpart, g).pct)
    g.hp -= share
    res.dmg -= share
    // ⚠️ เลือดผู้พิทักษ์ลดโดยไม่มี attack event ⇒ ถ้าไม่ส่ง hpPct หลอดของเขาจะค้างเต็มทั้งที่เลือดหาย
    res.events.push(ev(g, gp, gpart, { targets: [defender.uid], amount: Math.round(share),
      guardUid: g.uid, guardHpPct: g.hp > 0 ? Math.max(1, Math.round((g.hp / g.maxHp) * 100)) : 0, fxKind: 'guard' }))
    // 🔴 สเปก §7.6: ผู้พิทักษ์ตายจากส่วนแบ่งนี้ได้จริง แต่มันไม่ได้ "สร้าง" ดาเมจ แค่ย้ายเข้าตัว
    //    ⇒ ต้องส่งอ้างอิงตัวเองกลับไปให้เอนจิน (battleEngine.js) เช็คตายหลัง log ของหมัดนี้แล้วเท่านั้น
    //    เอนจินเป็นคนตัดสินว่าใครคือ "ผู้ฆ่า" (คนที่สวนหมัดมา ไม่ใช่ผู้พิทักษ์) — ที่นี่แค่รายงานว่ามีใครรับแทนไป
    res.guard = g
    break                                              // ผู้พิทักษ์ตัวเดียวพอ
  }

  // ลดดาเมจของออร่าทีม — หักก่อน แล้ว damageReduction ของตัวเองหักต่อเป็นทอด
  // (ไม่ใช่บวก % กัน: 20% + 12% ≠ 32% แต่เป็น ×0.8×0.88 = ลดจริง 29.6%)
  if (defender.teamDrPct > 0) res.dmg -= pctOf(res.dmg, defender.teamDrPct)

  // taunt — ลดเฉพาะหมัดที่ถูกดึงมาหาเจ้าตัว ไม่ใช่ตลอดเวลา (สเปก §4.2)
  // flag มาจากเอนจินซึ่งเป็นคนรู้ว่าเป้าถูกบังคับหรือเลือกเอง — ห้ามให้ที่นี่เดาเอง
  const p0 = passiveFor(defender)
  if (forced) {
    const tp = partsAt(p0, 'onRound').find(x => x.effect === 'taunt')
    if (tp) res.dmg -= pctOf(res.dmg, valOf(tp, defender).pct)
  }

  const p = p0
  for (const part of partsAt(p, 'onHit')) {
    const v = valOf(part, defender)
    switch (part.effect) {
      case 'dodge':
        if (rand() * 100 < v.pct) {
          res.dodged = true
          res.dmg = 0
          res.events.push(ev(defender, p, part, { targets: [defender.uid], fxKind: 'dodge' }))
        }
        break
      case 'damageReduction': {
        const cut = pctOf(res.dmg, v.pct)
        if (cut > 0) {
          res.dmg -= cut
          res.events.push(ev(defender, p, part, { targets: [defender.uid], amount: Math.round(cut), fxKind: 'reduce' }))
        }
        break
      }
      case 'thorns':
        res.thorns = pctOf(res.dmg, v.pct)
        if (res.thorns > 0 && attacker) {
          res.events.push(ev(defender, p, part, { targets: [attacker.uid], amount: Math.round(res.thorns), fxKind: 'thorns' }))
        }
        break
      case 'armorStack': {
        // กันไว้เผื่อเพ็ทวันหน้ามี armorStack 2 part บนตัวเดียว (วันนี้ยังไม่มี, ทะเบียนล็อกอยู่):
        // ถ้าไม่กันตรงนี้ part ที่สองจะเห็น res.dmg = 0 จาก part แรกไปแล้ว แล้วคำนวณ
        // res.reflect = pctOf(0, pct) = 0 ทับค่าที่ถูกต้องของ part แรก ทั้งที่ยังกินสแตคไปฟรีอีก 1 ชั้น
        if (res.reflect > 0) break
        const st = psOf(defender)
        // เติมสแตคครั้งเดียวตอนโดนหมัดแรกของไฟต์ — ไม่มีการเติมซ้ำระหว่างไฟต์ (สเปก §4.3)
        // 🔑 ต้องอยู่ "เหนือ" การ์ด res.dmg ข้างล่าง — สัมผัสแรกของไฟต์อาจเป็นหมัดที่ถูกกันจนเหลือ 0
        //    ถ้าไป seed ทีหลัง สแตคจะยังไม่ถูกตั้งจนกว่าจะมีหมัดที่ดาเมจผ่านเข้ามาจริง
        if (st.armor === undefined) st.armor = v.count
        // 🔴 ไม่มีดาเมจเหลือให้กันแล้ว = ห้ามกินสแตค — นี่คือการถอด "ความขึ้นกับลำดับ part ในข้อมูล"
        //    ตัวเดียวกับที่ atkOnHit ถูกยกออกนอกลูปเพื่อกำจัดทิ้ง: เพ็ทที่เขียน [dodge, armorStack]
        //    จะเสียสแตคฟรีแล้วสะท้อน 0 ส่วน [armorStack, dodge] กันหมัดจริงและสะท้อนเต็ม
        //    ทั้งที่เป็นพาสสีฟชุดเดียวกันเป๊ะ · สแตคคือทรัพยากรทั้งหมดของกลไกนี้ และไม่มี event ไหน
        //    บอกผู้เล่นเลยว่ามันถูกใช้ไปกับหมัดที่ไม่มีอะไรให้กัน
        if (res.dmg <= 0) break
        if (st.armor <= 0) break
        st.armor -= 1
        res.reflect = pctOf(res.dmg, v.pct)
        res.dmg = 0                                  // กันทั้งหมัด ไม่ใช่โล่ที่มีค่าเลือด
        // fxKind แยกเป็น 'armor' ของตัวเอง ไม่ใช่ 'guard' ของบากุ — ดูเหตุผลในดอคบล็อกของ ev()
        // (หน่วยของ amount ต่างกันคนละเรื่อง) · สแตคที่เหลือไปอยู่ฟิลด์ของตัวเอง `armorLeft`
        res.events.push(ev(defender, p, part, { targets: [defender.uid],
          amount: Math.round(res.reflect), armorLeft: st.armor, fxKind: 'armor' }))
        break
      }
    }
  }

  // พื้นดาเมจ — หนีบครั้งเดียวหลังสายลดจบ
  // 🔴 teamDrPct เป็น "ลดแบบบวก %" ตัวเดียวในไฟล์นี้ และ**ไม่มีเพดาน** (ออร่าซ้อนกันหลายตัวได้)
  //    ถ้าเกิน 100% ขึ้นมา res.dmg จะติดลบ แล้วเอนจินทำ `tg.hp -= dmg` = หมัดนั้นกลายเป็นการฟื้นเลือดให้เป้า
  //    (ตัวลดอื่นหักเป็นทอด ×(1-p) จึงเข้าใกล้ 0 ได้แต่ไม่มีวันติดลบ)
  res.dmg = Math.max(0, res.dmg)

  // atkOnHit — ต้องรู้ผลสุดท้ายของสายลดก่อนถึงจะตอบได้ว่า "โดนตี" จริงไหม
  // 🔴 อยู่นอกลูปโดยตั้งใจ: ถ้าอยู่ในลูป ผลจะขึ้นกับ *ลำดับ part ในข้อมูล* — เพ็ทที่เขียน
  //    [damageReduction, dodge] จะสะสมชั้น ส่วน [dodge, damageReduction] จะไม่สะสม ทั้งที่หลบเหมือนกัน
  //    (สเปก §7.4 ข้อ 6 เตือนเรื่องลำดับ part ไว้แล้ว — ตรงนี้คือการถอดความขึ้นกับลำดับออกให้หมด)
  if (res.dmg > 0) {
    for (const part of partsAt(p, 'onHit')) {
      if (part.effect !== 'atkOnHit') continue
      const v = valOf(part, defender)
      const st = psOf(defender)
      st.rage = (st.rage || 0) + 1
      defender.atk *= 1 + v.pct / 100
      const e = ev(defender, p, part, { targets: [defender.uid], amount: st.rage, fxKind: 'buff' })
      e.statsAfter = statsSnapshot(team)
      res.events.push(e)
    }
  }

  // ── ผลของ "ผู้ตี" ที่ต้องเขียน state ของเป้า ──
  // 🔴 infect เป็น effect เดียวที่อ่านพาสสีฟของผู้ตีในฟังก์ชันนี้ เพราะมันต้อง (1) เขียน ps ของเป้า
  //    และ (2) ใส่ค่าลงช่อง pierce ซึ่งอยู่ในผลลัพธ์ของ runOnHit · runOnDealt ไม่รู้จักเป้า จึงทำที่นั่นไม่ได้
  // 🔑 วางไว้ท้ายฟังก์ชัน "หลัง" สายลดจบ (หลัง res.dmg = Math.max(0, res.dmg) และหลัง atkOnHit) โดยตั้งใจ:
  //    การแปะเชื้อไม่ขึ้นกับว่าหมัดทำดาเมจได้เท่าไร — โดนดอดจ์หรือเกราะกันเต็มหมัดก็ยังติดเชื้อ
  //    (เชื้อระบาดจากการสัมผัส ไม่ใช่จากดาเมจที่ทะลุเข้ามา)

  // ระเบิดเชื้อ — ใครก็ได้ในทีมไวรัสตี (รวมไวรัสเอง) · เชื้อไม่ลด · ไปทางช่อง pierce เท่านั้น
  // 🔴 ต้องเช็คก่อนแปะชั้นใหม่ของหมัดนี้ (บล็อกถัดไปข้างล่าง) — เป้าที่ติดเชื้ออยู่แล้วระเบิดจากค่าปัจจุบันก่อน
  //    ชั้นที่หมัดนี้เพิ่มค่อยขึ้นทีหลัง ไม่งั้นหมัดแรกที่แปะเชื้อจะระเบิดตัวเองทันที (ต้องไม่เกิดตามสเปก)
  // 🔑 เช็คทีมด้วย side ไม่ใช่ identity — attacker.side === inf.from.side ครอบทั้ง "ไวรัสเอง" และ "เพื่อนร่วมทีม"
  //    ในเงื่อนไขเดียว · from เป็น object เดิมของไวรัส (ไม่ใช่ uid) จึงยังอ่าน atk ได้แม้ไวรัสตายไปแล้ว
  const inf = psOf(defender).infect
  if (inf && inf.n > 0 && attacker && inf.from && attacker.side === inf.from.side) {
    const vp = passiveFor(inf.from)
    const vpart = partsAt(vp, 'onAttack').find(x => x.effect === 'infect')
    if (vpart) {
      const vv = valOf(vpart, inf.from)
      // 🔴 คำนวณ delta ของ "หมัดนี้" แยกไว้ก่อน แล้วค่อย += เข้า res.pierce — amount ที่ล็อกต้องเป็นส่วนที่
      //    บล็อกนี้ contribute เอง ไม่ใช่ res.pierce สะสมทั้งก้อน (วันนี้ infect เป็นตัวเดียวที่ใส่ค่า pierce
      //    เลยบังเอิญเท่ากัน แต่ถ้าวันหน้ามีกลไกอื่น += เข้ามาก่อนบล็อกนี้ในหมัดเดียวกัน amount จะโป้งทันที)
      const delta = pctOf(inf.from.atk, vv.pct) * inf.n
      res.pierce += delta
      // ── แตกเป็นชั้นๆ ให้จอเด้งเลขทีละก้อน (user สั่ง 11 ก.ย. "ให้เห็นว่าสกิลมันแสดงผลแน่") ──
      // ใช้ผลต่างของยอดสะสมที่ปัดแล้ว ⇒ ผลรวมของทุกชั้น = Math.round(delta) เป๊ะเสมอ ไม่ว่าจะกี่ชั้น
      // (ถ้าปัดชั้นละก้อนตรงๆ ผลรวมบนจอจะเพี้ยนจากเลือดที่หายจริงได้ถึง n/2)
      const each = delta / inf.n
      const hits = []
      for (let k = 1; k <= inf.n; k++) hits.push(Math.round(each * k) - Math.round(each * (k - 1)))
      res.pierceHits = res.pierceHits.concat(hits)
      // 🔑 effect ตั้งชื่อแยกจากตอนแปะ ('infectBurst' ไม่ใช่ 'infect') แม้จะมาจาก part เดียวกัน —
      //    ดูเหตุผลเต็มในดอคบล็อกของ ev() ด้านบน: battleBeats.js กรุ๊ป event ด้วย uid:effect:nth
      //    ถ้าใช้ชื่อเดียวกับตอนแปะ หมัดที่ตีเป้าติดเชื้ออยู่แล้ว (กรณีปกติ) จะชนคีย์กันแล้วป้ายระเบิดหาย
      res.events.push(ev(inf.from, vp, vpart, { targets: [defender.uid],
        amount: Math.round(delta), stacks: inf.n, hits, fxKind: 'damage', effect: 'infectBurst' }))
    }
  }

  const ap = passiveFor(attacker)
  for (const part of partsAt(ap, 'onAttack')) {
    if (part.effect !== 'infect') continue
    const v = valOf(part, attacker)
    // 🦠 แพร่ทั้งทีม (27 ก.ย. 2026 บาลานซ์รอบ 1): หมัดเดียว = ทั้งทีมของเป้าที่ยังไม่ชนเพดานได้ +1 ชั้น
    //    พร้อมกัน · รวมเป็น **event เดียวหลายเป้า** กันรีเพลย์รก (user อนุมัติแนวทางนี้ใน brief)
    //    ⚠️ เมื่อ team มีแค่ตัวเดียว (เช่นเทสเก่าที่ส่ง [defender]) พฤติกรรม/จำนวน event เท่าของเดิมเป๊ะ
    const hit = []
    const stacks = {}
    for (const d of (team ? alive(team) : [defender])) {
      const st = psOf(d)
      const cur = st.infect || { n: 0, from: attacker }
      if (v.max > 0 && cur.n >= v.max) { st.infect = cur; continue }   // max 0 = ไม่จำกัดชั้น (29 ก.ย. user: แอนตี้ทีมถึก)
      // 🔴 กฎ "ไวรัสตัวแรกเป็นเจ้าของสแตค": from ต้องมาจาก cur.from ไม่ใช่ attacker ตรงๆ
      //    ถ้าทีมมีไวรัส 2 ตัว (คนละเกรด/atk) แล้วให้ attacker ทับทุกครั้งที่ตี เจ้าของดาเมจตอนระเบิด
      //    (งานย่อย 6 อ่าน from.atk) และตอนย้ายเชื้อตอนตาย (งานย่อย 7) จะเปลี่ยนไปเงียบๆ ตามว่าใครตีล่าสุด
      //    ทั้งที่ไม่มี event บอกผู้เล่นเลย — cur.from เมื่อยังไม่เคยติดเชื้อ (st.infect ไม่มี) จะ fallback
      //    เป็น attacker ของหมัดนี้พอดี (ผู้ติดเชื้อคนแรก) แล้วค้างค่าเดิมไว้ทุกหมัดถัดไปจนกว่าเชื้อจะหาย
      st.infect = { n: cur.n + 1, from: cur.from }
      hit.push(d.uid)
      stacks[d.uid] = st.infect.n
    }
    // 🦠 แปะแล้วเลือดลดทันที (user เคาะ 3 ต.ค. 2026 · คำอธิบายไม่ต้องแก้): ทุกเป้าที่ได้ชั้นใหม่โดนดาเมจ
    //    เชื้อเต็มชั้นปัจจุบันทันที ทะลุทุกอย่างเหมือนตอนระเบิด · เป้าหลักของหมัดนี้ไม่โดนซ้ำ (มันโดนระเบิดด้านบนไปแล้ว)
    //    เป้าอื่นหักเลือดตรงนี้แล้วส่ง event 'infectSplash' พร้อม hpMap/amounts ให้รีเพลย์ · ตายแล้วเอนจินปิดผ่าน res.splash
    const amounts = {}, hpMap = {}, splashOn = []
    for (const uid of hit) {
      const d = (team ? alive(team) : [defender]).find(x => x.uid === uid)
      const st = psOf(d)
      const dmg = pctOf(st.infect.from.atk, valOf(part, st.infect.from).pct) * st.infect.n
      if (!(dmg > 0)) continue
      if (d === defender) continue
      d.hp -= dmg
      amounts[uid] = Math.round(dmg)
      hpMap[uid] = d.hp > 0 ? Math.max(1, Math.round((d.hp / d.maxHp) * 100)) : 0
      splashOn.push(d)
    }
    if (hit.length) {
      // amount = ชั้นสูงสุดในก้อนนี้ (คงไว้เพื่อผู้อ่านเก่าที่ยังไม่รองรับ stacks ต่อเป้า) ·
      // stacks = ชั้นจริงต่อเป้า — ผู้อ่านต้องเช็ค stacks[uid] ก่อนเสมอ (battleBuffs.js/BattleReplay.vue)
      res.events.push(ev(attacker, ap, part, { targets: hit,
        amount: Math.max(...hit.map(uid => stacks[uid])), stacks, fxKind: 'debuff' }))
    }
    if (splashOn.length) {
      res.events.push(ev(attacker, ap, part, { targets: splashOn.map(d => d.uid),
        amount: 0, amounts, hpMap, fxKind: 'damage', effect: 'infectSplash' }))
      res.splash = (res.splash || []).concat(splashOn)
    }
  }

  return res
}

// ══════════════════════════════════════════════════════════════
//  onDeath — ตอนกำลังจะตาย (คืน true = กันไว้ได้ ยังไม่ตาย)
// ══════════════════════════════════════════════════════════════
/** @param {object|null} attacker  ผู้สังหาร ถ้ารู้ (เอนจินส่งมาจาก strike()) — null ถ้าตายจากออร่า/หนาม/สถานะ
 *    ⚠️ ใช้เพื่อคำนวณหมัดสวนของฟีนิกซ์เท่านั้น (out.counter) — เอนจินเป็นคนยิงจริงผ่าน strike() แบบ sub
 *    ห้ามให้ผลอื่นในฟังก์ชันนี้ขึ้นกับ attacker เพราะ hook นี้ต้องทำงานได้แม้ไม่รู้ผู้สังหาร */
export function runOnDeath(unit, team, attacker = null) {
  const out = { prevented: false, events: [] }
  const p = passiveFor(unit)
  // onDeath มี part เดียวโดยธรรมชาติ: กันตายได้ครั้งเดียวต่อการตายหนึ่งครั้ง
  // ถ้าวันหนึ่งมีเพ็ทที่ revive + cheatDeath พร้อมกัน ต้องเปลี่ยนเป็น partsAt แล้วนิยามลำดับก่อน
  const part = partAt(p, 'onDeath')

  // 0) กินสถานะ "ทนต่อ" ก่อน — ยังไม่แตะโควตา cheatDeath (คนละก้อนกัน)
  // 🔴 สถานะหลายชั้นตัวแรกของเกม (P2c-1 Task 5, แมว): cheatDeath ให้ 1 ครั้ง + grit ให้ทนอีก v.grit ครั้ง
  //    ตอน grit หมดพอดี ต้องคืน atk ที่บวกไว้ตอนได้สถานะ ไม่งั้นบัฟค้างถาวรทั้งไฟต์ (ตัวเองคูณ กันคูณซ้ำ
  //    ด้วยการหารด้วย gritMult ตัวเดียวกับตอนคูณเข้าไปเป๊ะ แล้วเคลียร์ gritMult=0 กันหมัดถัดไปหารซ้ำ)
  const gst = unit.ps && unit.ps.grit
  if (gst > 0) {
    const st = psOf(unit)
    st.grit -= 1
    unit.hp = 1
    if (st.grit === 0 && st.gritMult) { unit.atk /= st.gritMult; st.gritMult = 0 }
    out.prevented = true
    // ยิงผ่าน ev() เหมือนพี่น้องทุกใบ แล้วทับชื่อ effect เป็น 'grit' ผ่าน extra (แพทเทิร์นเดียวกับ infectBurst)
    // 🔑 สถานะนี้เกิดได้ทางเดียวคือกิน cheatDeath มาก่อน ⇒ p/part มีจริงเสมอ จึงไม่มีค่าสำรองให้หลงว่ามีทาง
    const e = ev(unit, p, part, { effect: 'grit', targets: [unit.uid], amount: st.grit, hpPct: 1, fxKind: 'revive' })
    // 🔴 ใบที่สถานะหมดพอดีคืน atk จริง ⇒ ต้องแบกสเตตัสใหม่ไปให้การ์ด ไม่งั้นเลขบนจอค้างที่ค่าบัฟ
    //    (กฎเดียวกับทุกใบที่ขยับ atk: stealStats/aura/stackAtk/atkOnHit/onAnyDeath/onKill)
    e.statsAfter = statsSnapshot(team)
    out.events.push(e)
    return out
  }

  // 1) ของตัวเอง — revive / cheatDeath
  if (part && (psOf(unit).uses || 0) < (valOf(part, unit).times || 1)) {
    const v = valOf(part, unit)
    if (part.effect === 'revive') {
      psOf(unit).uses = (psOf(unit).uses || 0) + 1
      unit.hp = pctOf(unit.maxHp, v.pct)
      out.prevented = true
      // ตีสวนผู้สังหาร — เอนจินเป็นคนยิงผ่าน strike() ปกติ (โดนสายลดของฝั่งนั้น) แบบ sub
      // 🔒 sub ⇒ อยู่ beat เดิม ไม่เพิ่มจังหวะ · ถ้าไม่มีผู้สังหาร (ตายจากออร่า/หนาม) ก็ไม่มีหมัดสวน
      if (v.counterPct > 0 && attacker && attacker.hp > 0) {
        out.counter = { target: attacker, mult: pctOf(unit.atk, v.counterPct) }
      }
      out.events.push(ev(unit, p, part, { targets: [unit.uid], amount: Math.round(unit.hp),
        hpPct: Math.round((unit.hp / unit.maxHp) * 100), fxKind: 'revive' }))
      return out
    }
    if (part.effect === 'cheatDeath') {
      const st = psOf(unit)
      st.uses = (st.uses || 0) + 1
      unit.hp = 1
      // สถานะ "ทนต่อ" — หมัดถึงตายอีก v.grit ครั้งไม่ฆ่ามัน และระหว่างนั้นแรงขึ้น v.atkPct%
      // 🔴 ต้องคืน atk ตอนสถานะหมด ไม่งั้นบัฟค้างถาวรทั้งไฟต์ (สถานะหลายชั้นตัวแรกของเกม)
      if (v.grit > 0) {
        st.grit = v.grit
        st.gritMult = 1 + (v.atkPct || 0) / 100
        unit.atk *= st.gritMult
      }
      out.prevented = true
      // ใบนี้คูณ atk เข้าไปตรงๆ (บรรทัดบน) ⇒ ต้องแบกสเตตัสใหม่ไปด้วย เหมือนทุกใบที่ขยับ atk
      const e = ev(unit, p, part, { targets: [unit.uid], hpPct: 1, amount: st.grit || 0, fxKind: 'revive' })
      e.statsAfter = statsSnapshot(team)
      out.events.push(e)
      return out
    }
  }

  // 2) ของเพื่อน — genie กันเพื่อนตาย 1 ครั้ง
  for (const g of alive(team)) {
    if (g === unit) continue
    const gp = passiveFor(g)
    const gpart = partsAt(gp, 'onDeath').find(x => x.effect === 'saveAlly')
    if (!gpart) continue
    if ((psOf(g).uses || 0) >= (valOf(gpart, g).times || 1)) continue
    psOf(g).uses = (psOf(g).uses || 0) + 1
    unit.hp = 1
    out.prevented = true
    out.events.push(ev(g, gp, gpart, { targets: [unit.uid], hpPct: 1, fxKind: 'save' }))
    break
  }
  return out
}

/** ใครสักคนตายจริงแล้ว — ยิงให้ทีมของ "ฝั่งที่ได้ประโยชน์" (ฝั่งตรงข้ามคนที่ตาย)
 *  ต่างจาก onKill ตรงที่ไม่สนว่าใครเป็นคนล้ม ⇒ 🦖 ได้ชั้นแม้เพื่อนเป็นคนเก็บ (P2c) */
export function runOnAnyDeath(dead, killerTeam, foes, rand) {
  const out = []

  // ส่งต่อเชื้อ — ศพยังแพร่ต่อได้ 1 ทอด สุ่มไปเพื่อนของมันที่ยังไม่ตาย
  // 🎲 ใช้ rand ของเอนจินเท่านั้น (รีเพลย์ต้องตรงกับผลจริง) · ยึดเพดานเดิมของเชื้อ (รวมยอดของโฮสต์ใหม่ + ศพ)
  // 🔴 ต้องอยู่ใต้ `if (inf...)` เท่านั้น — ไฟต์ที่ไม่มีเชื้อห้ามดึง rand() เพิ่มแม้แต่ครั้งเดียว
  //    ไม่งั้นลำดับสุ่มทั้งไฟต์เลื่อน (ดู battle-differential.mjs)
  const inf = dead && dead.ps && dead.ps.infect
  if (inf && inf.n > 0 && typeof rand === 'function') {
    const others = alive(foes || []).filter(u => u !== dead)
    if (others.length) {
      const to = others[Math.floor(rand() * others.length)]
      const cur = psOf(to).infect
      // 🔴 กฎ "ไวรัสตัวแรกที่แปะเป็นเจ้าของสแตค" (สเปก §4.1) ใช้กับการย้ายเชื้อด้วย — โฮสต์ใหม่ที่ติดเชื้อ
      //    ของไวรัสตัวอื่นอยู่ก่อนแล้ว ต้อง "คงเจ้าของเดิมไว้" ชั้นจากศพไหลเข้ากองเดียวกันเฉยๆ
      //    ถ้าปล่อยให้ inf.from (เจ้าของเชื้อบนศพ) ทับ เจ้าของจะเปลี่ยนกลางไฟต์ ⇒ ดาเมจระเบิดซึ่งคิดจาก
      //    from.atk เปลี่ยนความแรงเงียบๆ โดยไม่มีสัญญาณอะไรถึงผู้เล่นเลย — เป็นเหตุผลเดียวกับที่ฝั่งแปะชั้น
      //    ใน runOnHit ยึด cur.from ไม่ใช่ attacker (ที่นี่เคยเป็นจุดเดียวในโค้ดที่แหกกฎข้อนี้)
      const owner = (cur && cur.from) ? cur.from : inf.from
      // เพดานอ่านจาก value.max ของพาสสีฟไวรัส "เจ้าของกองนี้" เสมอ (P4 เป็นเจ้าของตัวเลขนี้ ห้ามมีสำเนาที่สองในโค้ด)
      // 🔑 ต้องเป็นเจ้าของที่รอด ไม่ใช่ไวรัสที่กำลังไหลเข้ามา — ไม่งั้นกองของ A จะถูกตัดด้วยเพดานของ B
      // `inf.n` เป็นแค่พื้นกันพัง ถ้าไวรัสไม่มี part 'infect' จริงๆ (ซึ่งไม่ควรเกิด — st.infect ถูกสร้างจาก
      // part นี้เท่านั้น) ไม่ใช่ที่สำหรับใส่เพดานจริง
      const vp = passiveFor(owner)
      const vpart = partsAt(vp, 'onAttack').find(x => x.effect === 'infect')
      const cap = vpart ? valOf(vpart, owner).max : inf.n
      const sum = (cur ? cur.n : 0) + inf.n
      const n = cap > 0 ? Math.min(cap, sum) : sum   // cap 0 = ไม่จำกัดชั้น (ห้าม min กับ 0 = เชื้อหายทั้งกอง)
      psOf(to).infect = { n, from: owner }
      // 🔑 ทุกการสะสม state ในไฟล์นี้ยิง event เสมอ — การย้ายเชื้อเงียบๆ จะทำให้ป้ายชั้นเชื้อของ §6.4
      //    กระโดดจากศพไปโผล่บนตัวใหม่โดยไม่มีใครเล่าว่าเกิดอะไร · effect ตั้งชื่อแยกจากตอนแปะ
      //    ('infectSpread') ด้วยเหตุผลเดียวกับ 'infectBurst' — ดูดอคบล็อกของ ev() เรื่องคีย์ก้อนของ battleBeats
      //    🔒 ไม่กิน beat: passive event ได้ timing ZERO ยกเว้นใบสุดท้ายของก้อน · และบล็อกนี้ทำงาน
      //       เฉพาะไฟต์ที่มีเชื้ออยู่แล้วเท่านั้น
      if (vpart) out.push(ev(owner, vp, vpart, { targets: [to.uid], amount: n,
        fxKind: 'debuff', effect: 'infectSpread' }))
    }
    delete psOf(dead).infect
  }

  for (const u of alive(killerTeam)) {
    const p = passiveFor(u)
    for (const part of partsAt(p, 'onAnyDeath')) {
      const v = valOf(part, u)
      if (part.effect !== 'stackAtk') continue
      const st = psOf(u)
      const stacks = st.atkStacks || 0
      if (stacks >= v.max) continue
      st.atkStacks = stacks + 1
      u.atk *= 1 + v.pct / 100
      const e = ev(u, p, part, { targets: [u.uid], amount: st.atkStacks, fxKind: 'buff' })
      if (killerTeam && foes) e.statsAfter = statsSnapshot(killerTeam, foes)
      out.push(e)
    }
  }
  return out
}

// ══════════════════════════════════════════════════════════════
//  onKill — หลังศัตรูตายจริง (onDeath ต้องผ่านไปแล้ว)
// ══════════════════════════════════════════════════════════════
/** คืน { events } · ตีต่อตอนน็อก (killChain เดิม) ถูกแทนด้วย 👹 windup ในเอนจินแล้ว (27 ก.ย. 2026) */
export function runOnKill(killer, team, foes) {
  const out = { events: [] }
  const p = passiveFor(killer)
  for (const part of partsAt(p, 'onKill')) {
    const v = valOf(part, killer)
    if (part.effect === 'stackAtk') {
      const st = psOf(killer)
      const stacks = st.atkStacks || 0
      if (stacks < v.max) {
        st.atkStacks = stacks + 1
        killer.atk *= 1 + v.pct / 100
        const e = ev(killer, p, part, { targets: [killer.uid], amount: st.atkStacks, fxKind: 'buff' })
        if (team && foes) e.statsAfter = statsSnapshot(team, foes)
        out.events.push(e)
      }
    }
  }
  return out
}
