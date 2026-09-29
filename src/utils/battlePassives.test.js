// เทส passive — pure ทั้งหมด · รัน: node --test src/utils/battlePassives.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  applyForms, runSetup, applyAuras, initHunt, runOnStart, runOnRound, runOnRoundEnd, runOnAttack, runOnHit, runOnDealt, runOnDeath, runOnAnyDeath, passiveFor, psOf, windupOf,
  tauntTargetOf,
} from './battlePassives.js'
import { PET_PASSIVES, passiveValueAt, passiveText, effectText, partsOf, PASSIVE_MAX_LEVEL, STATUS_ICON, STATUS_TEXT, TEAM_AURA_EFFECTS } from '../data/petPassives.js'
import { PETS } from '../data/index.js'
import { COMBAT_BASE, COMBAT_GRADE, ELEMENT_BIAS } from '../data/petPower.js'
import { simulateBattle } from './battleEngine.js'
import { buildBeats, beatDuration, totalDuration } from './battleBeats.js'

const u = (id, over = {}) => ({ id, uid: over.uid || 'A0', side: 'A', atk: 100, maxHp: 1000, hp: 1000, element: 'fist', ...over })
const seq = (...vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)] }

// ── psOf: state bag ──────────────────────────────────────────
test('psOf: สร้างก้อน state ตอนอ่านครั้งแรก และคืนก้อนเดิมทุกครั้งถัดไป', () => {
  const u_ = { uid: 'A0' }
  const a = psOf(u_)
  a.foo = 1
  assert.equal(psOf(u_).foo, 1)
  assert.equal(u_.ps, a)
})

test('ตัวนับกันตายย้ายไปอยู่ใน ps.uses แล้ว (ไม่ใช่ฟิลด์ลอยบนตัวละคร)', () => {
  const cat = { uid: 'A0', side: 'A', id: 'cat', hp: 0, maxHp: 100, atk: 10 }
  const out = runOnDeath(cat, [cat])
  assert.equal(out.prevented, true)
  assert.equal(psOf(cat).uses, 1)
  assert.equal(cat.passiveUses, undefined)
})

// ── data integrity ──────────────────────────────────────────
test('เพ็ททุกตัวในแค็ตตาล็อกมี passive ครบ ไม่มีตัวไหนตกหล่น', () => {
  const missing = PETS.filter(p => !PET_PASSIVES[p.id]).map(p => p.id)
  assert.deepEqual(missing, [], 'เพ็ทที่ยังไม่มี passive')
})

test('passive ทุกอันมีฟิลด์ครบและ hook ที่รู้จัก', () => {
  // 'setup' เข้ามาตอน P3a (🐭 หนูเป็นเพ็ทจริงตัวแรกที่ใช้ — เอนจินรองรับตั้งแต่ P2a แล้ว)
  // 'onRoundEnd' เข้ามา ต.ค. 2569 ฟากฟ้า (🌍 เอิร์ธ — runOnRoundEnd ยังเป็นโครงเปล่า Task 5 เป็นคนเติมตรรกะ)
  const HOOKS = ['setup', 'aura', 'onStart', 'onRound', 'onRoundEnd', 'onAttack', 'onHit', 'onKill', 'onDeath', 'onAnyDeath']
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    assert.ok(p.name && p.icon && p.desc, `${id} ฟิลด์ไม่ครบ`)
    const parts = partsOf(p)
    assert.ok(parts.length > 0, `${id} ไม่มี part เลย`)
    for (const part of parts) {
      assert.ok(part.effect, `${id} part ไม่มี effect`)
      assert.ok(HOOKS.includes(part.hook), `${id} hook ไม่รู้จัก: ${part.hook}`)
    }
  }
})

test('ชื่อ passive ไม่ซ้ำกัน (ผู้เล่นต้องแยกออกว่าใครเป็นใคร)', () => {
  const names = Object.values(PET_PASSIVES).map(p => p.name)
  assert.equal(new Set(names).size, names.length)
})

// ── setup ───────────────────────────────────────────────────
test('stealStats: ศัตรูเสียจริง และผู้ขโมยได้เพิ่มเท่ากับที่ขโมยมารวมกัน', () => {
  PET_PASSIVES.__thief = {
    name: 'ทดสอบขโมย', icon: '🧪',
    parts: [{ hook: 'setup', effect: 'stealStats', value: { pct: 10 }, step: { pct: 0 } }],
    desc: 'ขโมย {pct}%', short: 'ขโมย {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__thief', hp: 100, maxHp: 100, atk: 50 }
    const f1 = { uid: 'B0', side: 'B', id: 'blank', hp: 200, maxHp: 200, atk: 30 }
    const f2 = { uid: 'B1', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 20 }
    const out = runSetup([me], [f1, f2])
    assert.equal(f1.atk, 27)                       // เสีย 10%
    assert.equal(f2.atk, 18)
    assert.equal(me.atk, 50 + 3 + 2)               // ได้ที่ขโมยมารวมกัน
    assert.equal(f1.maxHp, 180)
    assert.equal(f1.hp, 180)                       // เลือดปัจจุบันลดตามสัดส่วน ไม่ล้นหลอด
    assert.equal(me.maxHp, 100 + 20 + 10)
    assert.equal(out.length, 1)
    assert.equal(out[0].fxKind, 'buff')
  } finally { delete PET_PASSIVES.__thief }
})

test('stealStats: ไม่มีศัตรู = ไม่มี event ไม่ throw', () => {
  PET_PASSIVES.__thief = {
    name: 'ทดสอบขโมย', icon: '🧪',
    parts: [{ hook: 'setup', effect: 'stealStats', value: { pct: 10 }, step: { pct: 0 } }],
    desc: 'ขโมย {pct}%', short: 'ขโมย {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__thief', hp: 100, maxHp: 100, atk: 50 }
    assert.deepEqual(runSetup([me], []), [])
    assert.equal(me.atk, 50)
  } finally { delete PET_PASSIVES.__thief }
})

// ── aura ────────────────────────────────────────────────────
test('teamHp (whale): เพิ่ม maxHp ทั้งทีม และเลือดเต็มตาม', () => {
  const team = [u('whale'), u('cat', { uid: 'A1' })]
  applyAuras(team, [])
  assert.equal(Math.round(team[1].maxHp), 1100)
  assert.equal(team[1].hp, team[1].maxHp)
})

test('teamAtk (seal): เดี่ยว +6% · เข้าคู่ whale เป็น +10% และได้ teamRegen', () => {
  const solo = [u('seal')]
  applyAuras(solo, [])
  assert.ok(Math.abs(solo[0].atk - 106) < 0.01)

  const duo = [u('seal'), u('whale', { uid: 'A1' })]
  applyAuras(duo, [])
  // whale teamHp ไม่แตะ atk — atk มาจาก seal อย่างเดียว
  assert.ok(Math.abs(duo[0].atk - 110) < 0.01, `ได้ ${duo[0].atk}`)
  assert.equal(duo[0].teamRegenPct, 10)
})

test('หมาป่า: บัฟเฉพาะเพื่อนสายจู่โจม ตัวสายอื่นไม่ได้อะไร', () => {
  const mk = (uid, id, el) => ({ uid, side: 'A', id, element: el, hp: 100, maxHp: 100, atk: 100 })
  const wolf = mk('A0', 'wolf', 'fist')
  const fistMate = mk('A1', '__blank__', 'fist')
  const paperMate = mk('A2', '__blank__', 'paper')
  applyAuras([wolf, fistMate, paperMate], [])
  assert.equal(Math.round(fistMate.atk), 104, 'เพื่อนสายจู่โจมได้ 4%')
  assert.equal(Math.round(wolf.atk), 104, 'ตัวหมาป่าเองก็สายจู่โจม จึงได้ด้วย')
  assert.equal(paperMate.atk, 100, 'สายอื่นต้องไม่ได้อะไร')
})

test('teamAtkPerElement ถูกลบออกจากระบบแล้ว (ค่าคงที่ที่ไม่มีใครอ่าน อันตรายกว่าค่าที่ผิด)', () => {
  assert.equal(STATUS_ICON.teamAtkPerElement, undefined)
  assert.equal(STATUS_TEXT.teamAtkPerElement, undefined)
  assert.equal(TEAM_AURA_EFFECTS.has('teamAtkPerElement'), false)
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    for (const part of partsOf(p)) {
      assert.notEqual(part.effect, 'teamAtkPerElement', `${id} ยังใช้ effect ที่ถูกลบแล้ว`)
    }
  }
})

test('enemyVuln (owl): ไปลงที่ศัตรู ไม่ใช่ทีมตัวเอง', () => {
  const team = [u('owl')], foes = [u('cat', { uid: 'B0', side: 'B' })]
  applyAuras(team, foes)
  assert.equal(foes[0].vuln, 0.06)
  assert.equal(team[0].vuln, undefined)
})

test('elementTrinity: ครบ 3 สายถึงจะติด ขาดสายเดียวไม่ได้อะไรเลย', () => {
  PET_PASSIVES.__lion = {
    name: 'ทดสอบสิงโต', icon: '🧪',
    parts: [{ hook: 'aura', effect: 'elementTrinity', value: { pct: 8, hpPct: 8 }, step: { pct: 0, hpPct: 0 } }],
    desc: 'ครบสาย +{pct}%', short: 'ครบสาย +{pct}%',
  }
  try {
    const mk = (uid, el) => ({ uid, side: 'A', id: uid === 'A0' ? '__lion' : 'blank', element: el, hp: 100, maxHp: 100, atk: 100 })
    const full = [mk('A0', 'fist'), mk('A1', 'scissors'), mk('A2', 'paper')]
    applyAuras(full, [])
    assert.equal(Math.round(full[1].atk), 108)
    assert.equal(Math.round(full[1].maxHp), 108)

    const partial = [mk('A0', 'fist'), mk('A1', 'fist'), mk('A2', 'paper')]
    applyAuras(partial, [])
    assert.equal(partial[1].atk, 100)
  } finally { delete PET_PASSIVES.__lion }
})

test('teamDamageReduction: ทีมได้ pct · เจ้าของได้สองเท่า', () => {
  PET_PASSIVES.__shell = {
    name: 'ทดสอบกระดอง', icon: '🧪',
    parts: [{ hook: 'aura', effect: 'teamDamageReduction', value: { pct: 10 }, step: { pct: 0 } }],
    desc: 'ทีมลด {pct}%', short: 'ทีมลด {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__shell', hp: 100, maxHp: 100, atk: 10 }
    const mate = { uid: 'A1', side: 'A', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    applyAuras([me, mate], [])
    assert.equal(mate.teamDrPct, 10)
    assert.equal(me.teamDrPct, 20)
  } finally { delete PET_PASSIVES.__shell }
})

test('teamLifesteal: แปะ % ให้ทุกคนในทีมรวมเจ้าของ', () => {
  PET_PASSIVES.__bat = {
    name: 'ทดสอบค้างคาว', icon: '🧪',
    parts: [{ hook: 'aura', effect: 'teamLifesteal', value: { pct: 8 }, step: { pct: 0 } }],
    desc: 'ทีมดูด {pct}%', short: 'ทีมดูด {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__bat', hp: 100, maxHp: 100, atk: 10 }
    const mate = { uid: 'A1', side: 'A', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    applyAuras([me, mate], [])
    assert.equal(me.lifestealPct, 8)
    assert.equal(mate.lifestealPct, 8)
  } finally { delete PET_PASSIVES.__bat }
})

// ── onStart / onRound ───────────────────────────────────────
test('aoeOpener (bahamut): ศัตรูทุกตัวโดน + มี event', () => {
  const foes = [u('cat', { uid: 'B0' }), u('mouse', { uid: 'B1' })]
  const evs = runOnStart([u('bahamut')], foes)
  assert.ok(foes[0].hp < 1000 && foes[1].hp < 1000)
  assert.equal(evs.length, 1)
  assert.equal(evs[0].t, 'passive')
  assert.deepEqual(evs[0].targets, ['B0', 'B1'])
})

test('บาฮามุท: เลขเปิดไฟต์เป็น 100% ของพลังโจมตี', () => {   // ลดจาก 150 ตามเมต้าซิม 27 ก.ย. 2026
  const v = partsOf(PET_PASSIVES.bahamut)[0].value
  assert.equal(v.pct, 100)
})

test('regenSelf: ฟื้นเมื่อเลือดพร่อง · เลือดเต็มแล้วไม่เด้ง event ซ้ำซาก', () => {
  const hurt = u('panda', { hp: 500 })
  assert.equal(runOnRound([hurt]).length, 1)
  assert.ok(hurt.hp > 500)
  assert.equal(runOnRound([u('panda')]).length, 0, 'เลือดเต็มไม่ควรมี event')
})

test('อูโรโบรอส: มี 2 part และลำดับ event ตรงกับลำดับใน parts', () => {
  assert.equal(partsOf(PET_PASSIVES.ouroboros).length, 2, 'ouroboros ต้องมี 2 part')
  const snake = u('ouroboros', { uid: 'A0', hp: 100 })       // เลือดพร่อง ⇒ regen ทำงาน
  const events = runOnRound([snake])
  assert.deepEqual(events.map(e => e.effect), ['regenSelf', 'stackAtk'])
})

test('อูโรโบรอส: เลือดเต็ม regen ข้าม แต่ stackAtk ยังทำงาน', () => {
  const snake = u('ouroboros', { uid: 'A0' })                // เลือดเต็ม
  const events = runOnRound([snake])
  assert.deepEqual(events.map(e => e.effect), ['stackAtk'])
})

test('บากุ: มี 2 part (รับแทน + ฟื้นเลือดตัวเองทุกต้นรอบ)', () => {
  assert.equal(partsOf(PET_PASSIVES.qilin).length, 2, 'qilin ต้องมี 2 part')
  const guard = u('qilin', { uid: 'A0', hp: 100 })            // เลือดพร่อง ⇒ regen ทำงาน
  const events = runOnRound([guard])
  assert.deepEqual(events.map(e => e.effect), ['regenSelf'])
  assert.ok(guard.hp > 100, 'ต้องฟื้นเลือดจริง')
})

test('healLowestAlly (butterfly): ฟื้นให้เพื่อนที่พร่องสุด ไม่ใช่ตัวเอง', () => {
  // 🔴 10 ก.ย. 2026: 🦄 ยูนิคอร์นย้ายไป healOnAttack แล้ว — ตัวที่ยังถือ healLowestAlly คือ 🦋 ผีเสื้อ
  const uni = u('butterfly', { hp: 100 })
  const hurt = u('cat', { uid: 'A1', hp: 200 })
  const ok = u('blank', { uid: 'A2' })
  const evs = runOnRound([uni, hurt, ok])
  assert.equal(evs[0].targets[0], 'A1')
  assert.ok(hurt.hp > 200)
  assert.equal(uni.hp, 100, 'ต้องไม่ฟื้นให้ตัวเอง')
})

// ── onAttack ────────────────────────────────────────────────
test('targetLowest (simurgh): เปลี่ยนเป้าไปตัวเลือดน้อยสุด', () => {
  const foes = [u('cat', { uid: 'B0', hp: 900 }), u('mouse', { uid: 'B1', hp: 100 })]
  const r = runOnAttack(u('simurgh'), foes[0], foes, () => 0.5)
  assert.equal(r.target.uid, 'B1')
})

test('กริฟฟิน woundBonus: เป้าเลือดหาย 40% → หมัด ×1.4 และเล็งตัวเลือดน้อยสุด', () => {
  const att = { id: 'simurgh', uid: 'A0', side: 'A', atk: 100, hp: 500, maxHp: 500 }
  const full = { uid: 'B0', side: 'B', hp: 1000, maxHp: 1000 }
  const hurt = { uid: 'B1', side: 'B', hp: 600, maxHp: 1000 }
  const r = runOnAttack(att, full, [full, hurt], () => 0.5)
  assert.equal(r.target, hurt)
  assert.ok(Math.abs(r.atkMult - 1.4) < 1e-9)
})

test('cleave (dragon): เป้ารอง 1 ตัว (รวมเป้าหลักเป็น 2 ตามทะเบียนมังกร) และไม่ซ้ำเป้าหลัก', () => {
  const foes = [u('cat', { uid: 'B0' }), u('mouse', { uid: 'B1' }), u('turtle', { uid: 'B2' })]
  const r = runOnAttack(u('dragon'), foes[0], foes, () => 0.5)
  assert.equal(r.extra.length, 1)
  assert.ok(!r.extra.some(x => x.unit.uid === 'B0'))
})

test('เซอร์เบอรัส: เขี้ยว 3 ที ⇒ ได้เป้ารอง 2 ตัวเสมอ (นับจำนวน ไม่สนว่า rand สุ่มโดนตัวไหน)', () => {
  const foes = [u('cat', { uid: 'B0' }), u('mouse', { uid: 'B1' }), u('turtle', { uid: 'B2' })]
  const r = runOnAttack(u('cerberus'), foes[0], foes, seq(0.1, 0.9))
  assert.equal(r.extra.length, 2, 'count 3 ⇒ เป้ารอง 2 ตัวเสมอ ไม่ว่าจะซ้ำหรือไม่ซ้ำเป้าหลัก')
})

test('cleave: ศัตรูเหลือตัวเดียว ไม่มีเป้ารอง ไม่เด้ง event หลอก', () => {
  const foes = [u('cat', { uid: 'B0' })]
  const r = runOnAttack(u('dragon'), foes[0], foes, () => 0.5)
  assert.equal(r.extra.length, 0)
  assert.equal(r.events.length, 0)
})

test('เซอร์เบอรัส: สุ่มเป้ารองซ้ำตัวเดิมได้ (repeat: true)', () => {
  const att = { uid: 'A0', side: 'A', id: 'cerberus', hp: 100, maxHp: 100, atk: 100 }
  const f1 = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
  const f2 = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
  const res = runOnAttack(att, f1, [f1, f2], () => 0)      // rand 0 = เลือกตัวแรกเสมอ
  assert.equal(res.extra.length, 2, 'count 3 ⇒ เป้ารอง 2 ตัว')
  assert.ok(res.extra.every(x => x.unit === f1), 'rand 0 ⇒ ซ้ำตัวเดิมได้')
})

test('มังกร: ยังเป็น cleave แบบไม่ซ้ำเหมือนเดิม (สเปกไม่ได้สั่งให้เปลี่ยน)', () => {
  const att = { uid: 'A0', side: 'A', id: 'dragon', hp: 100, maxHp: 100, atk: 100 }
  const f1 = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
  const f2 = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
  const res = runOnAttack(att, f1, [f1, f2], () => 0)
  assert.deepEqual(res.extra.map(x => x.unit), [f2], 'เป้ารองต้องเป็นตัวที่ไม่ใช่เป้าหลัก')
})

test('execute (shark): แรงขึ้นเฉพาะเป้าเลือดน้อย', () => {
  const low = u('cat', { uid: 'B0', hp: 100 })
  const high = u('cat', { uid: 'B0', hp: 900 })
  assert.ok(runOnAttack(u('shark'), low, [low], () => 0.5).atkMult > 1)
  assert.equal(runOnAttack(u('shark'), high, [high], () => 0.5).atkMult, 1)
})

test('atkWhenFull (hamster): แรงเฉพาะตอนเลือดเต็ม', () => {
  const foe = u('cat', { uid: 'B0' })
  assert.ok(runOnAttack(u('hamster'), foe, [foe], () => 0.5).atkMult > 1)
  assert.equal(runOnAttack(u('hamster', { hp: 999 }), foe, [foe], () => 0.5).atkMult, 1)
})

test('multiStrike (rabbit): ตี 2 ทีเมื่อสุ่มติด · อยู่ใน beat เดียว (strikes ไม่ใช่ beat ใหม่)', () => {
  const foe = u('cat', { uid: 'B0' })
  assert.equal(runOnAttack(u('rabbit'), foe, [foe], () => 0.1).strikes, 2)
  assert.equal(runOnAttack(u('rabbit'), foe, [foe], () => 0.9).strikes, 1)
})

test('berserk: ยิ่งเลือดหายยิ่งแรง นับเป็นขั้นละ 10%', () => {
  PET_PASSIVES.__boar = {
    name: 'ทดสอบหมูป่า', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'berserk', value: { pct: 6 }, step: { pct: 0 } }],
    desc: 'เลือดหายยิ่งแรง +{pct}%', short: 'เลือดหายยิ่งแรง +{pct}%',
  }
  try {
    const tg = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    const full = { uid: 'A0', side: 'A', id: '__boar', hp: 100, maxHp: 100, atk: 10 }
    assert.equal(runOnAttack(full, tg, [tg], () => 0.5).atkMult, 1)          // เลือดเต็ม = ไม่ได้อะไร
    const hurt = { uid: 'A0', side: 'A', id: '__boar', hp: 40, maxHp: 100, atk: 10 }
    const r = runOnAttack(hurt, tg, [tg], () => 0.5)
    assert.equal(Math.round(r.atkMult * 100) / 100, 1.36)                    // หาย 60% = 6 ขั้น × 6%
    assert.equal(r.events.length, 1)
  } finally { delete PET_PASSIVES.__boar }
})

test('berserk: เส้นพอดี 80%/90% ต้องไม่ตกขั้นเพราะ float (1-0.8 ไม่ใช่ 0.2 เป๊ะ)', () => {
  PET_PASSIVES.__boar = {
    name: 'ทดสอบหมูป่า', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'berserk', value: { pct: 6 }, step: { pct: 0 } }],
    desc: 'เลือดหายยิ่งแรง +{pct}%', short: 'เลือดหายยิ่งแรง +{pct}%',
  }
  try {
    const tg = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    const at = (hp) => {
      const me = { uid: 'A0', side: 'A', id: '__boar', hp, maxHp: 100, atk: 10 }
      return runOnAttack(me, tg, [tg], () => 0.5)
    }
    // เลือด 80% เป๊ะ = หายไป 20% = 2 ขั้น (ของเดิมได้ 1 ขั้น เพราะ (1-0.8)*10 = 1.9999999999999996)
    assert.equal(Math.round(at(80).atkMult * 100) / 100, 1.12)
    assert.equal(Math.round(at(90).atkMult * 100) / 100, 1.06)   // 90% เป๊ะ = 1 ขั้น
  } finally { delete PET_PASSIVES.__boar }
})

test('giantSlayer: เป้าใหญ่กว่าตัวเอง = +pct% คงที่ · ไม่ไต่ขั้น ไม่มีเพดาน', () => {
  PET_PASSIVES.__badger = {
    name: 'ทดสอบแบดเจอร์', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'giantSlayer', value: { pct: 25 }, step: { pct: 0 } }],
    desc: 'ล้มยักษ์ +{pct}%', short: 'ล้มยักษ์ +{pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__badger', hp: 100, maxHp: 100, atk: 10 }
    const foe = (maxHp) => ({ uid: 'B0', side: 'B', id: 'blank', hp: maxHp, maxHp, atk: 10 })
    const mult = (maxHp) => Math.round(runOnAttack(me, foe(maxHp), [foe(maxHp)], () => 0.5).atkMult * 100) / 100
    assert.equal(mult(80), 1)      // เล็กกว่า = ไม่ได้อะไร
    assert.equal(mult(100), 1)     // เท่ากันเป๊ะ = ไม่ได้อะไร (ธรณีประตูคือ "มากกว่า" เท่านั้น)
    assert.equal(mult(101), 1.25)  // ใหญ่กว่านิดเดียวก็ได้เต็ม
    assert.equal(mult(500), 1.25)  // ใหญ่กว่ามากก็ยังเท่าเดิม ไม่ไต่ขั้น
    // เป้าเล็กกว่า = ไม่มี event ให้จอเล่า
    assert.equal(runOnAttack(me, foe(80), [foe(80)], () => 0.5).events.length, 0)
  } finally { delete PET_PASSIVES.__badger }
})

test('berserk/giantSlayer: fxKind buff ใช้กติกาเดียวกัน — targets = ตัวที่ได้บัฟ · amount = % ที่เพิ่มจริง', () => {
  PET_PASSIVES.__boar = {
    name: 'ทดสอบหมูป่า', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'berserk', value: { pct: 6 }, step: { pct: 0 } }],
    desc: 'เลือดหายยิ่งแรง +{pct}%', short: 'เลือดหายยิ่งแรง +{pct}%',
  }
  PET_PASSIVES.__badger = {
    name: 'ทดสอบแบดเจอร์', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'giantSlayer', value: { pct: 25 }, step: { pct: 0 } }],
    desc: 'ล้มยักษ์ +{pct}%', short: 'ล้มยักษ์ +{pct}%',
  }
  try {
    const huge = { uid: 'B0', side: 'B', id: 'blank', hp: 500, maxHp: 500, atk: 10 }
    const boar = { uid: 'A0', side: 'A', id: '__boar', hp: 40, maxHp: 100, atk: 10 }
    const e1 = runOnAttack(boar, huge, [huge], () => 0.5).events[0]
    assert.deepEqual(e1.targets, ['A0'])            // ตัวที่ได้บัฟ ไม่ใช่เป้าที่ไปตี
    assert.equal(e1.amount, 36)                     // 6 ขั้น × 6% = +36% (ไม่ใช่ "6")

    const badger = { uid: 'A1', side: 'A', id: '__badger', hp: 100, maxHp: 100, atk: 10 }
    const e2 = runOnAttack(badger, huge, [huge], () => 0.5).events[0]
    assert.deepEqual(e2.targets, ['A1'])            // เดิมชี้ไปที่เหยื่อ = คนละกติกากับ berserk
    assert.equal(e2.amount, 25)                     // % คงที่ของธรณีประตู ไม่ใช่จำนวนขั้น
  } finally { delete PET_PASSIVES.__boar; delete PET_PASSIVES.__badger }
})

// ── onDealt (ผลฝั่งผู้ตี) ────────────────────────────────────
test('healOnAttack: ฟื้นเพื่อนที่บอบช้ำสุดตามดาเมจจริงที่ทำได้', () => {
  PET_PASSIVES.__uni = {
    name: 'ทดสอบยูนิคอร์น', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'healOnAttack', value: { pct: 12 }, step: { pct: 0 } }],
    desc: 'ตีแล้วฟื้นเพื่อน {pct}%', short: 'ตีแล้วฟื้นเพื่อน {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__uni', hp: 100, maxHp: 100, atk: 10 }
    const hurt = { uid: 'A1', side: 'A', id: 'blank', hp: 50, maxHp: 100, atk: 10 }
    const res = runOnDealt(me, [me, hurt], 100)
    assert.equal(hurt.hp, 62)                       // 12% ของดาเมจ 100
    assert.ok(res.events.some(e => e.effect === 'healOnAttack'))
  } finally { delete PET_PASSIVES.__uni }
})

test('runOnHit ไม่รับทีมผู้ตีอีกแล้ว — ผลฝั่งผู้ตีย้ายไป runOnDealt ทั้งหมด', () => {
  PET_PASSIVES.__uni = {
    name: 'ทดสอบยูนิคอร์น', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'healOnAttack', value: { pct: 12 }, step: { pct: 0 } }],
    desc: 'ตีแล้วฟื้นเพื่อน {pct}%', short: 'ตีแล้วฟื้นเพื่อน {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__uni', hp: 100, maxHp: 100, atk: 10 }
    const hurt = { uid: 'A1', side: 'A', id: 'blank', hp: 50, maxHp: 100, atk: 10 }
    const tg = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    // พารามิเตอร์ที่ 6 ของ runOnHit วันนี้คือ `forced` (บอกว่าหมัดนี้ถูก taunt บังคับมาหรือเลือกเอง — P2b)
    // ไม่ใช่ทีมผู้ตีอีกต่อไป (นั่นคือของ P2a ที่ถูกตัดออกแล้ว) — ส่ง false ตรงๆ เพราะเคสนี้ไม่ได้ทดสอบ taunt
    // สิ่งที่ยังต้องพิสูจน์จาก P2a คือ "runOnHit มองไม่เห็นทีมผู้ตี": ผลฝั่งผู้ตี (healOnAttack) ย้ายไป
    // runOnDealt ทั้งหมดแล้ว ⇒ เพื่อนของผู้ตีที่เลือดพร่อง (hurt) ต้องไม่ถูกฟื้นจากอะไรใน runOnHit เลย
    // แม้จะส่ง [tg] เป็นทีมผู้รับตามจริง ก็ไม่มีทางไปถึง hurt ได้ (เดิมเคยพิสูจน์ด้วย runOnHit.length === 5
    // แต่ arity ไม่ได้พิสูจน์อะไร — พารามิเตอร์ที่ 6 งอกกลับมาจริงในงานนี้ เพียงแค่มี default จึงไม่โผล่ใน .length)
    const res = runOnHit(tg, 100, me, [tg], () => 0.5, false)
    assert.equal(hurt.hp, 50, 'runOnHit มองไม่เห็นทีมผู้ตี — เพื่อนของผู้ตีต้องไม่ถูกฟื้นจากอะไรในนี้')
    assert.equal(res.events.length, 0, 'healOnAttack ไม่ได้ยิงจาก runOnHit เลย (ย้ายไป runOnDealt ทั้งหมด)')
  } finally { delete PET_PASSIVES.__uni }
})

test('teamLifesteal: ผู้ตีดูดเลือดจากดาเมจที่ทำได้จริง + ส่ง hpPct ให้หลอดเลือดตาม', () => {
  const me = { uid: 'A0', side: 'A', id: 'blank', hp: 50, maxHp: 100, atk: 10, lifestealPct: 8 }
  const out = runOnDealt(me, [me], 100)
  assert.equal(me.hp, 58)                           // 8% ของ 100
  assert.equal(out.events.length, 1)
  const e = out.events[0]
  assert.equal(e.effect, 'teamLifesteal')
  assert.equal(e.fxKind, 'heal')
  assert.deepEqual(e.targets, ['A0'])
  assert.equal(e.amount, 8)                         // เลือดจริงที่ฟื้นได้ ไม่ใช่ % ของสูตร
  assert.equal(e.hpPct, 58)
  assert.equal('kind' in e, false)                  // 🔴 ห้ามมีฟิลด์ชื่อ kind (CLAUDE.md ข้อ 15)
})

test('teamLifesteal: ไม่ล้นหลอด และเลือดเต็มอยู่แล้วต้องไม่มี event', () => {
  const full = { uid: 'A0', side: 'A', id: 'blank', hp: 100, maxHp: 100, atk: 10, lifestealPct: 8 }
  assert.deepEqual(runOnDealt(full, [full], 100).events, [])
  assert.equal(full.hp, 100)

  const nearly = { uid: 'A0', side: 'A', id: 'blank', hp: 97, maxHp: 100, atk: 10, lifestealPct: 50 }
  const out = runOnDealt(nearly, [nearly], 100)
  assert.equal(nearly.hp, 100)                      // ดูดได้ 50 แต่หลอดรับได้แค่ 3
  assert.equal(out.events[0].amount, 3)
})

test('runOnDealt: ไม่มีดาเมจ/ไม่มีทีมผู้ตี = เงียบ ไม่ throw', () => {
  const me = { uid: 'A0', side: 'A', id: 'blank', hp: 50, maxHp: 100, atk: 10, lifestealPct: 8 }
  assert.deepEqual(runOnDealt(me, [me], 0).events, [])
  assert.deepEqual(runOnDealt(me, null, 100).events, [])
  assert.deepEqual(runOnDealt(null, [me], 100).events, [])
  assert.equal(me.hp, 50)
})

test('runOnDealt: ผู้ตีที่ตายไปแล้ว (โดนหนามกลางบีต) ต้องไม่ดูดเลือดกลับมา', () => {
  const me = { uid: 'A0', side: 'A', id: '__blank__', hp: 0, maxHp: 100, atk: 10, lifestealPct: 50 }
  const mate = { uid: 'A1', side: 'A', id: '__blank__', hp: 50, maxHp: 100, atk: 10 }
  const out = runOnDealt(me, [me, mate], 100)
  assert.equal(me.hp, 0, 'ตัวที่ตายแล้วต้องไม่ฟื้นเอง')
  assert.deepEqual(out.events, [])
})

// ── onHit ───────────────────────────────────────────────────
test('damageReduction: ลดดาเมจที่ตัวเองรับ', () => {
  // 🔴 10 ก.ย. 2026: ตั้งแต่ P3a ไม่มีเพ็ทตัวไหนถือ `damageReduction` แล้ว (🦣 ไปเป็นเกราะสะท้อน ·
  //    🐢 ไปเป็นลดทั้งทีม) — เทสนี้จึงใช้เพ็ททดสอบเพื่อคุมสาขาในเอนจินไว้ ไม่ใช่ผูกกับเพ็ทตัวใดตัวหนึ่ง
  PET_PASSIVES.__dr = {
    name: 'ทดสอบลดดาเมจ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'damageReduction', value: { pct: 20 }, step: { pct: 0 } }],
    desc: 'ลดดาเมจ {pct}%', short: 'ลดดาเมจ {pct}%',
  }
  try {
    const me = u('__dr')
    assert.equal(runOnHit(me, 100, u('cat'), [me], () => 0.5).dmg, 80)
  } finally { delete PET_PASSIVES.__dr }
})

test('dodge (fox): หลบแล้วดาเมจเป็น 0', () => {
  const hit = runOnHit(u('fox'), 100, u('cat'), [u('fox')], () => 0.01)
  assert.equal(hit.dmg, 0)
  assert.equal(hit.dodged, true)
  assert.equal(runOnHit(u('fox'), 100, u('cat'), [u('fox')], () => 0.99).dmg, 100)
})

test('thorns (hedgehog): สะท้อนกลับผู้ตี', () => {
  const r = runOnHit(u('hedgehog'), 100, u('cat'), [u('hedgehog')], () => 0.5)
  assert.ok(r.thorns > 0)
  assert.equal(r.events[0].targets[0], 'A0')
})

test('guardian (qilin): รับแทนเพื่อน 25% · เลือดผู้พิทักษ์ลดจริง', () => {
  const guard = u('qilin', { uid: 'A0' })
  const weak = u('cat', { uid: 'A1', hp: 100 })
  const r = runOnHit(weak, 100, u('mouse'), [guard, weak], () => 0.5)
  assert.equal(r.dmg, 75)
  assert.equal(guard.hp, 975)
})

// 🔗 29 ก.ย. 2026 (user เลือกแบบ ก): ลิงก์ทั้งทีม — เดิมรับแทนเฉพาะเพื่อนที่เลือด % น้อยสุด
test('guardian: รับแทนเพื่อนทุกตัว ไม่ใช่แค่ตัวที่พร่องสุด · ไม่รับแทนตัวเอง', () => {
  const guard = u('qilin', { uid: 'A0' })
  const weak = u('cat', { uid: 'A1', hp: 50 })
  const mid = u('mouse', { uid: 'A2', hp: 800 })
  const r = runOnHit(mid, 100, u('cat'), [guard, weak, mid], () => 0.9)
  assert.equal(r.dmg, 75)
  assert.equal(guard.hp, 975)
  const self = runOnHit(guard, 100, u('cat'), [guard, weak, mid], () => 0.9)
  assert.ok(!self.events.some(e => e.fxKind === 'guard'))
})

test('atkOnHit: โดนตีทีนึง atk เพิ่มถาวร ไม่มีเพดาน (user ยืนยัน)', () => {
  PET_PASSIVES.__gori = {
    name: 'ทดสอบกอริลลา', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'atkOnHit', value: { pct: 3 }, step: { pct: 0 } }],
    desc: 'โดนตีแล้วแรงขึ้น {pct}%', short: 'โดนตีแล้วแรงขึ้น {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__gori', hp: 100, maxHp: 100, atk: 100 }
    const att = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    for (let i = 0; i < 3; i++) runOnHit(me, 10, att, [me], () => 0.5)
    assert.equal(psOf(me).rage, 3)
    // ทบต้น 100×1.03³ = 109.2727 ≠ บวกเชิงเส้น 100×(1+3×0.03) = 109.0 — ปัดสองตำแหน่งให้เห็นส่วนต่าง
    assert.equal(Math.round(me.atk * 100) / 100, 109.27)
  } finally { delete PET_PASSIVES.__gori }
})

test('atkOnHit: หมัดที่ถูกหลบทั้งหมัด ไม่นับเป็น "โดนตี" จึงไม่สะสมชั้น', () => {
  PET_PASSIVES.__rage = {
    name: 'ทดสอบเดือด', icon: '🧪',
    parts: [
      { hook: 'onHit', effect: 'dodge', value: { pct: 100 }, step: { pct: 0 } },
      { hook: 'onHit', effect: 'atkOnHit', value: { pct: 3 }, step: { pct: 0 } },
    ],
    desc: 'ทดสอบ {pct}%', short: 'ทดสอบ {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__rage', hp: 100, maxHp: 100, atk: 100 }
    const att = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const res = runOnHit(me, 100, att, [me], () => 0)     // rand 0 = หลบติดแน่นอน
    assert.equal(res.dmg, 0)
    assert.equal(psOf(me).rage, undefined, 'หลบได้แล้วยังสะสมชั้น = ผิดนิยาม "ทุกครั้งที่รับดาเมจ"')
    assert.equal(me.atk, 100)
  } finally { delete PET_PASSIVES.__rage }
})

test('atkOnHit: หมัดที่ดาเมจผ่านเข้ามาจริง ยังสะสมเหมือนเดิม', () => {
  const me = { uid: 'A0', side: 'A', id: '__rage2', hp: 100, maxHp: 100, atk: 100 }
  PET_PASSIVES.__rage2 = {
    name: 'ทดสอบเดือด2', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'atkOnHit', value: { pct: 3 }, step: { pct: 0 } }],
    desc: 'ทดสอบ {pct}%', short: 'ทดสอบ {pct}%',
  }
  try {
    const att = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    runOnHit(me, 50, att, [me], () => 0.99)
    assert.equal(psOf(me).rage, 1)
    assert.equal(Math.round(me.atk), 103)
  } finally { delete PET_PASSIVES.__rage2 }
})

test('teamDamageReduction: หักเป็นทอดกับ damageReduction ของตัวเอง ไม่ใช่บวก %', () => {
  // เพ็ทสังเคราะห์ที่ถือ damageReduction 12% ของตัวเอง + ได้ teamDrPct 20% จากเพื่อน
  // (ตั้งแต่ P3a ไม่มีเพ็ทจริงตัวไหนถือทั้งสองอย่างพร้อมกัน — กฎ "หักเป็นทอด" ยังต้องคุมไว้)
  PET_PASSIVES.__dr2 = {
    name: 'ทดสอบลดซ้อน', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'damageReduction', value: { pct: 12 }, step: { pct: 0 } }],
    desc: 'ลดดาเมจ {pct}%', short: 'ลดดาเมจ {pct}%',
  }
  try {
    const d = { uid: 'A0', side: 'A', id: '__dr2', hp: 100, maxHp: 100, atk: 10, teamDrPct: 20 }
    const att = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
    // 100 × 0.8 × 0.88 = 70.4 (ไม่ใช่ 100 × (1 − 0.32) = 68)
    const res = runOnHit(d, 100, att, [d], () => 0.5)
    assert.equal(Math.round(res.dmg * 10) / 10, 70.4)
  } finally { delete PET_PASSIVES.__dr2 }
})

// ── onDeath / onKill ────────────────────────────────────────
test('revive (phoenix): ฟื้นครั้งเดียวเท่านั้น', () => {
  const ph = u('phoenix', { hp: -5 })
  const first = runOnDeath(ph, [ph])
  assert.equal(first.prevented, true)
  assert.ok(ph.hp > 0)
  ph.hp = -5
  assert.equal(runOnDeath(ph, [ph]).prevented, false, 'ครั้งที่สองต้องตายจริง')
})

// 🔴 P2c-1 Task 6: ฟีนิกซ์คืนชีพแล้วต้องตีสวนผู้สังหารด้วย — runOnDeath รับพารามิเตอร์ที่สาม (attacker)
test('ฟีนิกซ์: คืนชีพแล้วคืนหมัดสวนใส่ผู้สังหาร', () => {
  const px = { uid: 'A0', side: 'A', id: 'phoenix', hp: 0, maxHp: 100, atk: 200 }
  const killer = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
  const out = runOnDeath(px, [px], killer)
  assert.equal(out.prevented, true)
  assert.ok(px.hp > 1, 'คืนชีพด้วยเลือดตามสูตรเดิม')
  assert.equal(out.counter.target, killer)
  assert.equal(out.counter.mult, 300, '150% ของ atk 200')
})

test('ฟีนิกซ์: ไม่มีผู้สังหาร (ตายจากออร่า/หนาม) ต้องไม่ throw และไม่มีหมัดสวน', () => {
  const px = { uid: 'A0', side: 'A', id: 'phoenix', hp: 0, maxHp: 100, atk: 200 }
  const out = runOnDeath(px, [px])
  assert.equal(out.prevented, true)
  assert.equal(out.counter, undefined)
})

// ══════════════════════════════════════════════════════════════
//  ฟีนิกซ์สองตัวตีกันตาย — ระดับ simulateBattle (ธง `reflecting` ไม่เคยถูกทดสอบกับหมัดสวนของฟีนิกซ์เลย
//  งานย่อยก่อนหน้าเทสแค่ armorStack) 🔴 นี่คือ RECURSION จริง: หมัดสวนของ B อาจฆ่า A ได้ ซึ่งจะยิง
//  runOnDeath(A) ซ้อนเข้ามาอีกชั้น ⇒ ถ้า A เป็นฟีนิกซ์ด้วย A ก็จะฟื้นแล้ว "อยากจะ" สวนกลับ B อีกที
//  ธง reflecting (ตัวเดียวกับก้อนสะท้อนเกราะ) ต้องกันไม่ให้หมัดสวนที่สองยิงจริง ไม่งั้นวนไม่รู้จบ
// ══════════════════════════════════════════════════════════════
test('ฟีนิกซ์สองตัวตีกันตาย: หมัดสวนของตัวหนึ่งฆ่าอีกตัวได้ แต่ไม่สวนซ้อนไม่รู้จบ (ธง reflecting กันไว้)', () => {
  // ใช้พาสสีฟสังเคราะห์หน้าตาเหมือนฟีนิกซ์เป๊ะ (pct 35 / counterPct 150) แทนของจริง — กันไม่ให้เทสนี้
  // ผูกกับเลขจูนสมดุลจริงของฟีนิกซ์ (ถ้าวันหน้ามีคนจูน pct/counterPct ของฟีนิกซ์ เทสนี้ต้องไม่แดงตาม)
  PET_PASSIVES.__phoenixSim = {
    name: 'ทดสอบฟีนิกซ์', icon: '🧪',
    parts: [{ hook: 'onDeath', effect: 'revive', value: { pct: 35, counterPct: 150 }, step: { pct: 0, counterPct: 0 } }],
    desc: 'ทดสอบ {pct}% {counterPct}%', short: 'ทดสอบ {pct}% {counterPct}%',
  }
  try {
    // ฟีนิกซ์เหมือนกันเป๊ะ 1v1 — ต่อยแลกกันไปสามสี่รอบตามธรรมชาติจนมีตัวหนึ่งเลือดต่ำมาก (สุ่มด้วย seed คงที่)
    // seed=1 ตรวจแล้วว่า: รอบ 4 ฝั่ง B โจมตี A จนตาย (A ฟื้น 35% + คำนวณหมัดสวนใส่ B) แล้วหมัดสวนนั้น
    // แรงพอฆ่า B ที่ตอนนั้นเหลือเลือดต่ำมากจากการแลกหมัดก่อนหน้า (B ฟื้น 35% ด้วยเช่นกัน) — ครบสูตรที่ต้องการ
    const A = [{ id: '__phoenixSim', rarity: 'legendary', element: 'fist', grade: 0 }]
    const B = [{ id: '__phoenixSim', rarity: 'legendary', element: 'fist', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    const revives = r.log.filter(e => e.t === 'passive' && e.effect === 'revive')
    assert.equal(revives.length, 2, 'ต้องฟื้นได้ฝั่งละ 1 ครั้งเท่านั้น (ทั้งคู่ใช้สิทธิ์ฟื้นของตัวเองไปคนละครั้ง)')
    assert.deepEqual(revives.map(e => e.uid), ['A0', 'B0'], 'A ตายก่อนแล้วฟื้น+สวน จากนั้นหมัดสวนนั้นฆ่า B ให้ฟื้นตาม')

    // 🔒 หัวใจของเทสนี้: ต้องมีหมัดสวนแค่ "ก้อนเดียว" (ของ A ที่ฆ่า B) — ถ้าธง reflecting ไม่กัน
    //    หมัดสวนที่สองของ B (ที่ควรจะยิงใส่ A กลับ เพราะ B ก็ฟื้นแล้วมี counter เหมือนกัน) จะโผล่มาด้วย
    const subAttacks = r.log.filter(e => e.t === 'attack' && e.sub)
    assert.equal(subAttacks.length, 1, 'ต้องมีหมัดสวนแค่ครั้งเดียว — สวนซ้อน (B สวนกลับ A) ต้องไม่เกิด')
    assert.equal(subAttacks[0].side, 'A', 'หมัดสวนที่ยิงจริงต้องเป็นของ A (ตัวที่ตายก่อนและสวนก่อน)')
    assert.equal(subAttacks[0].target, 'B0')

    // ── หมัดสวนต้องไม่กลายเป็น beat ใหม่ — ยืนยันที่ชั้น buildBeats ตรงๆ (กฎเหล็ก passive ห้ามเพิ่ม beat) ──
    const subIdx = r.log.findIndex(e => e.t === 'attack' && e.sub)
    const maxHpOf = Object.fromEntries(Object.entries(r.units).map(([uid, s]) => [uid, s.maxHp]))
    const beats = buildBeats(r.log, maxHpOf)
    assert.equal(beats[subIdx].kind, 'sub', 'หมัดสวนต้องถูกจัดเป็น kind sub เหมือนหมัดลูกอื่นๆ')
    assert.equal(beatDuration(beats[subIdx]), 0, '🔒 sub ต้องกินเวลา 0 — ไม่ใช่จังหวะหมัดใหม่')

    // ไฟต์ต้องจบจริง (ไม่วนไม่รู้จบ) — ยืนยันว่ามี event 'end' และจบด้วย turns ที่สมเหตุสมผล
    assert.equal(r.log.at(-1).t, 'end', 'ไฟต์ต้องจบเป็นปกติ ไม่ค้าง/วนไม่รู้จบ')
  } finally {
    delete PET_PASSIVES.__phoenixSim
  }
})

// ══════════════════════════════════════════════════════════════
//  🔴 รีวิวรอบ 1 (5 ก.ย.): บรีฟเดิมสั่งให้หมัดสวนใช้ธง `reflecting` ร่วมกับก้อนสะท้อนเกราะ — user เคาะแก้
//  เอง (override บรีฟ) เพราะถ้าหมัดสวนของฟีนิกซ์ลงบนตัวมีเกราะ (armorStack) เกราะจะกินสแตคไปแต่ไม่ได้
//  สะท้อนกลับเลย: `runOnHit` คิด res.reflect ให้แล้ว (กินสแตคจริง) แต่บล็อกเกราะเช็ค `!reflecting` ซึ่งบล็อก
//  หมัดสวนตั้งเป็น true ครอบไว้อยู่ ⇒ เกราะจ่ายสแตคฟรีทุกครั้งที่โดนหมัดสวน — วันนี้ไม่มีเพ็ทจริงตัวไหนมี
//  armorStack แต่กลไกเอนจินพร้อมแล้ว วันที่ P3 ลงทะเบียนเพ็ทเกราะตัวแรกจะพังทันทีถ้าอยู่บอร์ดเดียวกับฟีนิกซ์
//  ⇒ แยกธงเป็น `reflecting` (ก้อนสะท้อนเกราะกำลังบิน) กับ `countering` (หมัดสวนฟีนิกซ์กำลังบิน) คนละความหมาย
// ══════════════════════════════════════════════════════════════
test('ฟีนิกซ์สวนใส่ตัวมีเกราะ: เกราะต้องกินสแตคแล้ว "ได้สะท้อนกลับจริง" (ไม่ใช่กินฟรี)', () => {
  PET_PASSIVES.__phxArmorTest = {
    name: 'ทดสอบฟีนิกซ์', icon: '🧪',
    parts: [{ hook: 'onDeath', effect: 'revive', value: { pct: 35, counterPct: 150 }, step: { pct: 0, counterPct: 0 } }],
    desc: 'ทดสอบ {pct}% {counterPct}%', short: 'ทดสอบ {pct}% {counterPct}%',
  }
  PET_PASSIVES.__armorTest = {
    name: 'ทดสอบเกราะ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 3, pct: 50 }, step: { count: 0, pct: 0 } }],
    desc: 'ทดสอบ {count} ชั้น สะท้อน {pct}%', short: 'ทดสอบ {count} ชั้น',
  }
  try {
    // A: ฟีนิกซ์ตัวเดียว (อ่อน ตายง่าย) · B: ตัวมีเกราะ + เพื่อนกันตัวเติม ทำให้ทีม B ใหญ่กว่า
    // ⇒ B ได้ตีก่อนเสมอ (กติกา "ทีมใหญ่กว่าตีก่อน" ไม่ต้องพึ่งสุ่ม) แล้วชนสูตร legendary/grade5 vs
    // common/grade0 ทำให้ B0 มีโอกาสน็อก A0 ได้ตั้งแต่หมัดแรกของทั้งไฟต์ (ตรวจแล้วที่ seed=1)
    // ⇒ หมัดสวนของ A0 เป็น "หมัดแรก" ที่ B0 เคยโดนในไฟต์นี้เป๊ะ กันไม่ให้ปนกับสแตคที่อาจถูกกินจากหมัดอื่นก่อน
    const A = [{ id: '__phxArmorTest', rarity: 'common', element: 'fist', grade: 0 }]
    const B = [{ id: '__armorTest', rarity: 'legendary', element: 'fist', grade: 5 },
               { id: '__blank__', rarity: 'common', element: 'fist', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    // (a) เกราะต้องกินสแตคจากหมัดสวน — เห็นได้จาก event armorStack ใบแรก (armorLeft: 3-1=2)
    const armorEvents = r.log.filter(e => e.t === 'passive' && e.effect === 'armorStack')
    assert.equal(armorEvents.length, 1, 'เกราะต้องกินสแตคจากหมัดสวนของฟีนิกซ์ 1 ครั้ง')
    assert.equal(armorEvents[0].armorLeft, 2, 'เหลือ 2 จาก 3 ชั้น')
    assert.equal(armorEvents[0].uid, 'B0')

    // (b) เกราะต้อง "ได้สะท้อนกลับจริง" — ก้อนสะท้อนคือหมัด sub ที่ B0 (เจ้าของเกราะ) ยิงกลับใส่ A0
    //    🔴 ก่อนแก้ (ธงเดียว): บล็อกหมัดสวนตั้ง reflecting=true ครอบไว้ทั้งก้อน ⇒ บล็อกเกราะเช็ค !reflecting
    //    เจอ false ตลอด ⇒ ก้อนสะท้อนนี้ไม่เคยเกิดเลยแม้เกราะจะกินสแตคไปแล้ว (พิสูจน์ไว้ในหัวข้อ TDD ของรายงาน)
    const reflectStrikes = r.log.filter(e => e.t === 'attack' && e.sub && e.attacker === 'B0' && e.target === 'A0')
    assert.equal(reflectStrikes.length, 1, 'เกราะต้องยิงก้อนสะท้อนกลับใส่ A0 จริง ไม่ใช่กินสแตคฟรี')
    assert.equal(reflectStrikes[0].dmg, armorEvents[0].amount,
      'ดาเมจสะท้อนที่ลงจริงต้องตรงกับป้ายเกราะบอกไว้ (A0 ไม่มีสายลดใดๆ)')

    // หมัดสวนของฟีนิกซ์เองก็ต้องมีอยู่ด้วย (attacker A0 → B0) — ก้อนสะท้อนมาจากหมัดสวนอันนี้เป๊ะ
    const counterStrike = r.log.find(e => e.t === 'attack' && e.sub && e.attacker === 'A0' && e.target === 'B0')
    assert.ok(counterStrike, 'ต้องมีหมัดสวนของฟีนิกซ์ลงบน B0 ด้วย (ต้นเหตุที่ทำให้เกราะกินสแตค)')
    assert.equal(counterStrike.dmg, 0, 'เกราะกันหมัดสวนได้ทั้งดอก (ตามกติกา armorStack ปกติ)')

    // ไฟต์จบปกติ ไม่ค้าง
    assert.equal(r.log.at(-1).t, 'end')
  } finally {
    delete PET_PASSIVES.__phxArmorTest
    delete PET_PASSIVES.__armorTest
  }
})

test('cheatDeath (cat): รอดด้วยเลือด 1 ครั้งเดียว', () => {
  const c = u('cat', { hp: -20 })
  assert.equal(runOnDeath(c, [c]).prevented, true)
  assert.equal(c.hp, 1)
})

// 🔴 P2c-1 Task 5: สถานะหลายชั้นตัวแรกของเกม — รอดตายด้วย cheatDeath แล้วได้ "ทนต่อ" อีก 2 หมัด
//    พร้อม atk +50% ระหว่างมีสถานะ · ต้องคืน atk ให้ตรงตอนสถานะหมด ไม่งั้นบัฟค้างถาวรทั้งไฟต์
test('แมว: รอดตายครั้งแรกแล้วได้สถานะทน 2 หมัด + แรงขึ้น แล้วบัฟหายตอนหมดสถานะ', () => {
  const cat = { uid: 'A0', side: 'A', id: 'cat', hp: 0, maxHp: 100, atk: 100 }
  const team = [cat]

  const d1 = runOnDeath(cat, team)                       // ครั้งที่ 1 — cheatDeath
  assert.equal(d1.prevented, true)
  assert.equal(cat.hp, 1)
  assert.equal(psOf(cat).grit, 2, 'ได้สถานะทน 2 หมัด')
  assert.equal(Math.round(cat.atk), 180, 'atk +80% ระหว่างมีสถานะ')   // atkPct 80 (ขึ้นจาก 50 ตามเมต้าซิม 27 ก.ย. 2026)

  cat.hp = 0
  assert.equal(runOnDeath(cat, team).prevented, true)    // ครั้งที่ 2 — กินสถานะ
  assert.equal(psOf(cat).grit, 1)
  assert.equal(Math.round(cat.atk), 180, 'ยังมีสถานะ บัฟยังอยู่')

  cat.hp = 0
  assert.equal(runOnDeath(cat, team).prevented, true)    // ครั้งที่ 3 — สถานะหมดพอดี
  assert.equal(psOf(cat).grit, 0)
  assert.equal(Math.round(cat.atk), 100, 'สถานะหมด บัฟต้องหายไปด้วย ไม่ค้างถาวร')

  cat.hp = 0
  assert.equal(runOnDeath(cat, team).prevented, false, 'ครั้งที่ 4 ตายจริง')
})

test('saveAlly (genie): กันเพื่อนตาย 1 ครั้ง แล้วหมดสิทธิ์', () => {
  const g = u('genie', { uid: 'A0' })
  const a = u('mouse', { uid: 'A1', hp: -10 })
  assert.equal(runOnDeath(a, [g, a]).prevented, true)
  assert.equal(a.hp, 1)
  const b = u('turtle', { uid: 'A2', hp: -10 })
  assert.equal(runOnDeath(b, [g, b]).prevented, false, 'genie ใช้ได้ครั้งเดียว')
})

// 🔧 บาลานซ์รอบ 1 Task 5 (27 ก.ย. 2026): ทีเร็กซ์ย้ายจาก onAnyDeath+stackAtk ("ศัตรูล้ม 1 ตัวได้ 1 ชั้น
//    ไม่ว่าใครฆ่า") ไปเป็น onAttack+hunt ("ทุกหมัดที่ตัวเองตี +pct% ของ atk ฐาน ไม่มีเพดาน")
//    ⇒ ไม่ต้องพึ่งการฆ่าของทีมอีกต่อไป (เทสเดิม "เพื่อนเป็นคนล้มศัตรู ทีเร็กซ์ก็ได้ชั้น" ไม่มีความหมายแล้ว
//    เพราะ hunt ไม่ผูกกับ onAnyDeath เลย — ตัดทิ้ง แทนด้วยเทสที่วัดพฤติกรรมใหม่ตรงๆ)
test('hunt (trex): initHunt ใส่ชั้นตั้งต้นหลัง aura แล้วทุกหมัดบวกเพิ่มจากฐานเดิม ไม่ทบต้น', () => {
  const t = u('trex')                    // atk เริ่ม 100 — สมมุติเป็น "หลัง aura" แล้ว (เทสนี้ไม่มี aura จริง)
  initHunt([t])
  assert.equal(psOf(t).huntBase, 100, 'ฐานจับตอน initHunt (ในไฟต์จริงคือ atk หลัง aura)')
  assert.equal(psOf(t).huntStacks, 1, 'เข้าไฟต์พร้อม 1 ชั้นตามค่า start')
  assert.equal(t.atk, 120, 'atk = ฐาน × (1 + 1×20%)')

  const foe = { uid: 'B0', hp: 100, maxHp: 100 }
  runOnAttack(t, foe, [foe], () => 0.5)
  assert.equal(psOf(t).huntStacks, 2, 'หมัดแรกจริงได้ชั้นที่ 2 ทันที (ชั้นเพิ่มก่อนคิดดาเมจของหมัดนั้นเอง)')
  assert.equal(t.atk, 140, 'ชั้นที่ 2 = ฐาน × 1.4 (บวกจากฐาน ไม่ทบต้น)')

  for (let i = 0; i < 29; i++) runOnAttack(t, foe, [foe], () => 0.5)
  assert.equal(psOf(t).huntStacks, 31, '30 หมัด (1 + 29) รวมกับ 1 ชั้นตั้งต้น = 31 — ไม่มีเพดาน')
  assert.equal(t.atk, 100 + 100 * 0.2 * 31, 'บวกจากฐานทุกชั้น ไม่ทบต้น (ครั้งที่ 31 ≠ 1.2^31)')
})

test('hunt: event ทุกใบเป็น fxKind buff, amount = ชั้นหลังเพิ่ม, และมี statsAfter', () => {
  const t = u('trex')
  initHunt([t])
  const foe = { uid: 'B0', hp: 100, maxHp: 100 }
  const r = runOnAttack(t, foe, [foe], () => 0.5, [t])
  const e = r.events.find(x => x.effect === 'hunt')
  assert.ok(e, 'ต้องมี event hunt')
  assert.equal(e.fxKind, 'buff')
  assert.equal(e.amount, 2, 'amount = ชั้นสะสมหลังหมัดนี้ (1 ตั้งต้น + 1)')
  assert.ok(e.statsAfter, 'ต้องแบก statsAfter — hunt ขยับ att.atk จริง ไม่ใช่แค่ atkMult ชั่วคราว')
  assert.equal(e.statsAfter[t.uid].atk, 140)
})

test('ทีเร็กซ์: parts มีแค่ hunt hook onAttack เดียว ไม่เหลือ stackAtk', () => {
  const parts = partsOf(PET_PASSIVES.trex)
  assert.equal(parts.length, 1)
  assert.equal(parts[0].hook, 'onAttack')
  assert.equal(parts[0].effect, 'hunt')
  assert.equal(parts[0].value.pct, 20)
  assert.equal(parts[0].value.start, 1)
  assert.equal(parts[0].value.max, undefined, 'hunt ไม่มีเพดาน — ต้องไม่มีคีย์ max เลย')
})

test('👹 windup (kirin): runOnAttack คูณ {pct}% เฉพาะตอนฟาด (psOf.smashing) · ตอนอื่นไม่ยุ่ง', () => {
  const k = u('kirin')
  const tg = u('blank', { uid: 'B0', side: 'B' })
  assert.deepEqual(windupOf(k)?.v, { pct: 300 })
  assert.equal(windupOf(u('blank')), null)
  const idle = runOnAttack(k, tg, [tg], () => 0.5)
  assert.equal(idle.atkMult, 1)
  assert.equal(idle.events.length, 0)
  psOf(k).smashing = true
  const smash = runOnAttack(k, tg, [tg], () => 0.5)
  assert.equal(smash.atkMult, 3)
  assert.equal(smash.events.length, 1)
  assert.equal(smash.events[0].effect, 'windup')
  assert.equal(smash.events[0].fxKind, 'smash')
  assert.deepEqual(smash.events[0].targets, ['B0'])
})

test('onAnyDeath: ศัตรูล้มโดยใครก็ได้ ทุกตัวในทีมที่มี hook นี้ได้ชั้นเพิ่ม (ยึดเพดาน max)', () => {
  PET_PASSIVES.__scav = {
    name: 'ทดสอบซาก', icon: '🧪',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 10, max: 2 }, step: { pct: 0, max: 0 } }],
    desc: 'ล้ม 1 ตัว +{pct}%', short: 'ล้ม 1 ตัว +{pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__scav', hp: 100, maxHp: 100, atk: 100 }
    const dead = { uid: 'B0', side: 'B', id: 'blank', hp: 0, maxHp: 100, atk: 10 }
    const e1 = runOnAnyDeath(dead, [me], [dead])
    assert.equal(e1.length, 1)
    assert.equal(Math.round(me.atk), 110)
    assert.equal(psOf(me).atkStacks, 1)
    runOnAnyDeath(dead, [me], [dead])
    assert.equal(psOf(me).atkStacks, 2)
    const e3 = runOnAnyDeath(dead, [me], [dead])      // ชนเพดานแล้ว
    assert.equal(e3.length, 0)
    assert.equal(psOf(me).atkStacks, 2)
  } finally { delete PET_PASSIVES.__scav }
})

test('onAnyDeath: ตัวที่ตายแล้วไม่ได้ชั้น', () => {
  PET_PASSIVES.__scav = {
    name: 'ทดสอบซาก', icon: '🧪',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 10, max: 3 }, step: { pct: 0, max: 0 } }],
    desc: 'ล้ม 1 ตัว +{pct}%', short: 'ล้ม 1 ตัว +{pct}%',
  }
  try {
    const corpse = { uid: 'A0', side: 'A', id: '__scav', hp: 0, maxHp: 100, atk: 100 }
    const dead = { uid: 'B0', side: 'B', id: 'blank', hp: 0, maxHp: 100, atk: 10 }
    assert.deepEqual(runOnAnyDeath(dead, [corpse], [dead]), [])
    assert.equal(corpse.atk, 100)
  } finally { delete PET_PASSIVES.__scav }
})

// ── infect (ตอนที่ 3: ส่งต่อเชื้อตอนตัวติดเชื้อล้ม) ─────────────
// 🔑 ไวรัสในเทสต้องลงทะเบียนพาสสีฟจริง (id ชี้ไปที่ part ที่มี effect: 'infect') — ไม่ใช่ id ลอยๆ
//    ที่หาไม่เจอใน PET_PASSIVES เพราะ vpart ของ runOnAnyDeath ต้องเจอค่า max จริงเพื่อพิสูจน์ว่าเพดานที่ยึด
//    มาจาก value.max ของไวรัส ไม่ใช่ fallback (fallback มีไว้กันพังกรณีที่ไม่ควรเกิดจริงเท่านั้น)
test('infect: ตัวติดเชื้อล้ม เชื้อย้ายไปเพื่อนของมันแบบ deterministic และไม่เกินเพดาน', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const dead = { uid: 'B0', side: 'B', id: '__blank__', hp: 0, maxHp: 100, atk: 10 }
    const alive1 = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const alive2 = { uid: 'B2', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    psOf(dead).infect = { n: 4, from: virus }
    psOf(alive2).infect = { n: 3, from: virus }
    runOnAnyDeath(dead, [virus], [dead, alive1, alive2], () => 0.99)   // 0.99 = ตัวท้ายสุด
    assert.equal(psOf(alive2).infect.n, 5, 'รวมแล้วยึดเพดาน 5')
    assert.equal(psOf(dead).infect, undefined, 'ศพต้องไม่ถือเชื้อต่อ')
  } finally { delete PET_PASSIVES.__virus }
})

test('infect: ไม่มีศัตรูเหลือให้ย้าย ก็ไม่ throw', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const dead = { uid: 'B0', side: 'B', id: '__blank__', hp: 0, maxHp: 100, atk: 10 }
    psOf(dead).infect = { n: 2, from: virus }
    runOnAnyDeath(dead, [virus], [dead], () => 0.5)
    assert.equal(psOf(dead).infect, undefined)
  } finally { delete PET_PASSIVES.__virus }
})

// 🔴 กฎ "ไวรัสตัวแรกที่แปะเป็นเจ้าของกอง" (สเปก §4.1) ต้องใช้กับ *การย้ายเชื้อ* ด้วย ไม่ใช่แค่ตอนแปะ
//    ตอนแรกโค้ดย้ายเชื้อทับ from ด้วยเจ้าของเชื้อบนศพเสมอ ⇒ โฮสต์ที่ติดเชื้อ A อยู่แล้วเปลี่ยนเจ้าของเป็น B
//    กลางไฟต์ · ดาเมจระเบิดคิดจาก from.atk ⇒ ความแรงของเชื้อเปลี่ยนโดยไม่มีสัญญาณอะไรถึงผู้เล่นเลย
test('infect: เชื้อจากศพย้ายลงโฮสต์ที่ติดเชื้อไวรัสอื่นอยู่ก่อน ต้องไม่แย่งความเป็นเจ้าของ (และเพดานยึดของเจ้าของเดิม)', () => {
  PET_PASSIVES.__virusA = {
    name: 'ทดสอบเชื้อ A', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  PET_PASSIVES.__virusB = {
    // เพดานกับ atk ต่างจาก A ชัดเจน — ถ้าโค้ดหยิบผิดตัว ตัวเลขจะโป้งทันที
    name: 'ทดสอบเชื้อ B', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 9 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virusA = { uid: 'A0', side: 'A', id: '__virusA', hp: 100, maxHp: 100, atk: 100 }
    const virusB = { uid: 'A1', side: 'A', id: '__virusB', hp: 100, maxHp: 100, atk: 999 }
    const corpse = { uid: 'B0', side: 'B', id: '__blank__', hp: 0, maxHp: 100, atk: 10 }
    const host = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    psOf(host).infect = { n: 3, from: virusA }     // โฮสต์ติดเชื้อของ A อยู่ก่อน (A เป็นเจ้าของกองนี้)
    psOf(corpse).infect = { n: 4, from: virusB }   // ศพถือเชื้อของ B

    const out = runOnAnyDeath(corpse, [virusA, virusB], [corpse, host], () => 0.5)

    assert.equal(psOf(host).infect.from, virusA, 'เจ้าของเดิมของโฮสต์ต้องอยู่ ไม่ถูกเจ้าของเชื้อบนศพทับ')
    assert.equal(psOf(host).infect.n, 5,
      'เพดานต้องอ่านจากพาสสีฟของเจ้าของที่รอด (__virusA max 5) ไม่ใช่ของไวรัสที่ไหลเข้ามา (__virusB max 9)')
    assert.equal(psOf(corpse).infect, undefined, 'ศพต้องไม่ถือเชื้อต่อ')

    // การย้ายเชื้อต้องมี event เล่า ไม่งั้นป้ายชั้นเชื้อของสเปก §6.4 กระโดดจากศพไปโผล่บนตัวใหม่เงียบๆ
    const spread = out.filter(e => e.effect === 'infectSpread')
    assert.equal(spread.length, 1, 'ต้องมี event ย้ายเชื้อพอดี 1 ใบ')
    assert.equal(spread[0].fxKind, 'debuff')
    assert.deepEqual(spread[0].targets, ['B1'], 'ป้ายต้องลงบนโฮสต์ใหม่')
    assert.equal(spread[0].amount, 5, 'amount = จำนวนชั้นของโฮสต์หลังย้าย (หน่วยเดียวกับตอนแปะ)')
    assert.equal(spread[0].uid, 'A0', 'event เป็นของไวรัสเจ้าของกอง (A) ไม่ใช่ B')
    assert.equal(spread[0].kind, undefined, '🔴 ห้ามมีฟิลด์ชื่อ kind ใน event (CLAUDE.md ข้อ 15)')
  } finally { delete PET_PASSIVES.__virusA; delete PET_PASSIVES.__virusB }
})

test('infect: ย้ายลงโฮสต์ที่ยังสะอาด เจ้าของคือไวรัสของศพตามเดิม + มี event เล่า', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const corpse = { uid: 'B0', side: 'B', id: '__blank__', hp: 0, maxHp: 100, atk: 10 }
    const clean = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    psOf(corpse).infect = { n: 2, from: virus }
    const out = runOnAnyDeath(corpse, [virus], [corpse, clean], () => 0.5)
    assert.equal(psOf(clean).infect.from, virus)
    assert.equal(psOf(clean).infect.n, 2)
    const spread = out.filter(e => e.effect === 'infectSpread')
    assert.equal(spread.length, 1)
    assert.equal(spread[0].amount, 2)
  } finally { delete PET_PASSIVES.__virus }
})

// ── integration: กฎเหล็ก + determinism ──────────────────────
const team = (ids, rarity, grade) => ids.map((id, i) => {
  const d = PETS.find(p => p.id === id)
  return { id, rarity: d?.rarity || rarity, element: d?.element || 'fist', grade }
})

test('deterministic: seed เดิม + ทีมเดิม = log เดิมเป๊ะ (ทั้งเกมพึ่งข้อนี้)', () => {
  const A = team(['cerberus', 'rabbit', 'fox'], 'epic', 4)
  const B = team(['phoenix', 'qilin', 'hedgehog'], 'legendary', 4)
  assert.deepEqual(simulateBattle(A, B, 777).log, simulateBattle(A, B, 777).log)
})

test('🔒 กฎเหล็ก: cleave/multiStrike ไม่เพิ่มจำนวน beat', () => {
  // cerberus โดน 3 ตัว — จำนวน attack event เพิ่ม แต่ beat (ที่มี timing) ต้องไม่เพิ่ม
  const A = team(['cerberus', 'cerberus', 'cerberus'], 'epic', 4)
  const B = team(['turtle', 'mouse', 'hamster'], 'common', 4)
  const { log } = simulateBattle(A, B, 42)
  const beats = buildBeats(log, {})
  const subs = log.filter(e => e.t === 'attack' && e.sub)
  assert.ok(subs.length > 0, 'ต้องมีหมัดลูกเกิดขึ้นจริงถึงจะเทสได้')
  // 🔴 10 ก.ย. 2026: หมัดลูกที่ "ปิดไฟต์" ได้ kind 'finish' โดยตั้งใจ (กติกาที่ user เคาะไว้ตอน P2c —
  //    คนดูต้องเห็นหมัดที่ปิดเกมจริง ไม่ใช่หมัดหลักที่ถูกกันจนดาเมจเป็น 0) · เดิมเทสนี้ไม่เคยเจอเคสนั้น
  //    เพราะ seed 42 ไม่เคยจบด้วยหมัดลูก — พอ 🐢 เต่าเปลี่ยนเป็นลดดาเมจทั้งทีม ไฟต์เดียวกันก็จบด้วยหมัดลูก
  //    กฎเหล็กคือ "จำนวน beat ไม่เพิ่ม" ไม่ใช่ "หมัดลูกห้ามกินเวลาเสมอ" ⇒ ยกเว้นได้ **ใบเดียว** เท่านั้น
  let finishSubs = 0
  for (const [i, e] of log.entries()) {
    if (e.t === 'attack' && e.sub) {
      if (beats[i].kind === 'finish') { finishSubs++; continue }
      // 28 ส.ค.: ฟิลด์เปลี่ยนจาก tier → kind (กฎเหล็กเหมือนเดิม) — และ kind ต้องมีค่าเสมอ
      // ไม่ใช่ null/undefined เพราะ renderer switch(kind) จะได้ไม่มีอะไรตกลง default โดยบังเอิญ
      assert.equal(beats[i].kind, 'sub', 'หมัดลูกต้องเป็น kind sub')
      assert.equal(beats[i].timing.motion, 0, 'หมัดลูกต้องไม่กินเวลา')
      assert.equal(beatDuration(beats[i]), 0, 'หมัดลูกต้องไม่กินเวลาทั้ง beat')
    }
  }
  assert.ok(finishSubs <= 1, `มีหมัดลูกที่ถือเวลาปิดเกม ${finishSubs} ใบ — ต้องมีได้ไม่เกิน 1`)
})

test('ไฟต์จบเสมอ ไม่ค้างลูปแม้ทีมฟื้นเลือดชนกันเอง', () => {
  const A = team(['ouroboros', 'panda', 'unicorn'], 'legendary', 5)
  const B = team(['ouroboros', 'panda', 'unicorn'], 'legendary', 5)
  for (let s = 1; s <= 20; s++) {
    const r = simulateBattle(A, B, s)
    assert.ok(r.winner === 'A' || r.winner === 'B')
    assert.ok(r.log.at(-1).t === 'end')
  }
})

test('event passive ไปโผล่ใน log จริงตอนสู้', () => {
  const A = team(['bahamut', 'unicorn', 'wolf'], 'legendary', 5)
  const B = team(['cat', 'mouse', 'turtle'], 'common', 3)
  const kinds = new Set(simulateBattle(A, B, 9).log.filter(e => e.t === 'passive').map(e => e.effect))
  assert.ok(kinds.has('aoeOpener'), 'bahamut ต้อง proc ตอนเริ่ม')
  assert.ok(kinds.has('cheatDeath') || kinds.has('healLowestAlly') || kinds.has('dodge'),
    'ต้องมี passive ระหว่างสู้ proc อย่างน้อย 1 อย่าง')
})

test('aura ต้องเด้ง event ป้ายด้วย — ไม่งั้นทีมที่มี aura ล้วนจะเงียบสนิท', () => {
  // เจอจากเทสจอจริง 27 ส.ค.: ทีม phoenix/whale/seal มี aura 2 ตัว → ไม่มีป้ายขึ้นเลย
  const evs = applyAuras([u('whale'), u('seal', { uid: 'A1' })], [])
  assert.equal(evs.length, 2)
  assert.ok(evs.every(e => e.t === 'passive' && e.fxKind === 'aura' && e.name))
})

test('ทุกทีมต้องมีป้าย passive ขึ้นอย่างน้อย 1 อันเสมอ (ไม่มีไฟต์ที่เงียบสนิท)', () => {
  const A = team(['phoenix', 'whale', 'seal'], 'legendary', 3)
  const B = team(['kirin', 'simurgh', 'bahamut'], 'legendary', 3)
  for (let s = 1; s <= 20; s++) {
    const mine = simulateBattle(A, B, s).log.filter(e => e.t === 'passive' && e.side === 'A')
    assert.ok(mine.length > 0, `seed ${s} ไม่มีป้าย passive ฝั่งเราเลย`)
  }
})

// ── ตัวเลขในคำอธิบาย + เผื่อระบบหินอัพพลัง 3 ขั้น ──

test('passiveText: ไม่มี {placeholder} หลุดออกจอสักตัว ทุกขั้น', () => {
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    for (let lv = 1; lv <= PASSIVE_MAX_LEVEL; lv++) {
      const txt = passiveText(p, lv)
      assert.ok(!/[{}]/.test(txt), `${id} ขั้น ${lv} ยังมี placeholder: ${txt}`)
    }
  }
})

test('passiveText: ตัวเลขที่โชว์ต้องตรงกับค่าจริงของขั้นนั้น (ไม่ใช่เลขที่พิมพ์ไว้)', () => {
  const p = PET_PASSIVES.bahamut
  const part = partsOf(p)[0]
  assert.ok(passiveText(p, 1).includes(String(passiveValueAt(part, 1).pct)))
  assert.ok(passiveText(p, 3).includes(String(passiveValueAt(part, 3).pct)))
  assert.notEqual(passiveText(p, 1), passiveText(p, 3), 'ขั้นต่างกันข้อความต้องต่างกัน')
})

test('passiveValueAt: ขั้นนอกช่วงถูก clamp · ขั้น 1 = ค่าตั้งต้นเป๊ะ', () => {
  const part = partsOf(PET_PASSIVES.fox)[0]
  assert.deepEqual(passiveValueAt(part, 1), part.value)
  assert.deepEqual(passiveValueAt(part, 0), passiveValueAt(part, 1))
  assert.deepEqual(passiveValueAt(part, 99), passiveValueAt(part, PASSIVE_MAX_LEVEL))
})

test('🪨 ขั้น 3 ต้องไม่หลุดเพดานความสมเหตุสมผล (เผื่อดันเจี้ยนหิน)', () => {
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    for (const part of partsOf(p)) {
      const v = passiveValueAt(part, PASSIVE_MAX_LEVEL)
      if (part.effect === 'dodge') assert.ok(v.pct <= 25, `${id} หลบ ${v.pct}% สูงเกินจนไฟต์ยืด`)
      if (part.effect === 'damageReduction') assert.ok(v.pct <= 35, `${id} ลดดาเมจ ${v.pct}% สูงเกิน`)
      if (part.effect === 'guardian') assert.ok(v.pct <= 100, `${id} รับแทน ${v.pct}% เกิน 100% เป็นไปไม่ได้`)
      if (part.effect === 'revive') assert.ok(v.pct <= 70, `${id} ฟื้น ${v.pct}% สูงเกิน`)
      if (part.effect === 'multiStrike') assert.ok(v.chance <= 60, `${id} โอกาสตีซ้ำ ${v.chance}% สูงเกิน`)
    }
  }
})

test('🪨 windup/cheatDeath/saveAlly ต้องอัพขั้นแล้วค่าไม่ขยับ (โตแล้วพัง)', () => {
  for (const id of ['kirin', 'cat', 'genie']) {
    const part = partsOf(PET_PASSIVES[id])[0]
    assert.deepEqual(passiveValueAt(part, PASSIVE_MAX_LEVEL), passiveValueAt(part, 1), `${id} ไม่ควรอัพได้`)
  }
})

test('ขั้น 3 ต้องแรงกว่าขั้น 1 จริงสำหรับตัวที่อัพได้ (ไม่งั้นหินไร้ความหมาย)', () => {
  const upgradable = new Set()
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    for (const part of partsOf(p)) {
      const lo = passiveValueAt(part, 1)
      const hi = passiveValueAt(part, PASSIVE_MAX_LEVEL)
      // นับเฉพาะตัวที่ "อัพขั้นแล้วเลขขยับจริง" — มี step เป็นบวกอย่างเดียวไม่พอ
      // (step ที่คำนวณแล้วไม่ขยับ = หินอัพขั้นไม่ให้อะไรเลย ซึ่งเป็นบั๊กที่เทสนี้มีไว้จับ)
      if (Object.keys(hi).some(k => typeof hi[k] === 'number' && hi[k] > lo[k])) upgradable.add(id)
    }
  }
  assert.ok(upgradable.size >= 20, `เพ็ทที่อัพขั้นแล้วเลขขยับมีแค่ ${upgradable.size} ตัว`)
})

// user เทสจอจริง 29 ส.ค.: ทีม seal+whale เลือดขึ้นแต่ "เลขไม่ขึ้น"
// เหตุ: buildBeats ใส่ kind (= เวลา) ทับ kind (= ชนิดผล) ที่ passive ส่งมา
// → renderer มองไม่เห็น 'heal' อีกเลย · ชนิดผลจึงต้องอยู่คนละฟิลด์กับเวลา
test('🔑 ชนิดผลของ passive ต้องรอด buildBeats — ไม่ถูก kind (เวลา) ทับ', () => {
  const A = team(['whale', 'seal', 'turtle'], 'legendary', 5)
  const B = team(['kirin', 'simurgh', 'bahamut'], 'legendary', 5)
  let checked = 0
  for (let s = 1; s <= 20; s++) {
    const { log } = simulateBattle(A, B, s)
    const beats = buildBeats(log, {})
    for (const [i, e] of log.entries()) {
      if (e.t !== 'passive' || e.effect !== 'duoRegen') continue
      checked++
      assert.equal(beats[i].fxKind, 'heal', `seed ${s} beat ${i}: ชนิดผลหาย`)
      assert.ok(beats[i].amount > 0, 'ต้องมีเลือดที่ฟื้นจริงติดมาด้วย (เลข +N)')
    }
  }
  assert.ok(checked > 0, 'ต้องมี duoRegen โปรกจริงถึงจะเทสได้')
})

// ── ข้อความผลของ passive (short / effectText) ────────────────
// เดิมรายการบัฟอ่านจาก STATUS_TEXT ที่คีย์ด้วย effect — พาสสีฟคนละตัวที่ใช้ effect เดียวกัน
// จึงได้ข้อความเหมือนกันเป๊ะทั้งที่ให้ผลคนละอย่าง (ฟีนิกซ์ฟื้น 35% vs แมวเหลือเลือด 1)
test('PET_PASSIVES: ทุกตัวมี short และเติมเลขครบ ไม่เหลือ {placeholder}', () => {
  for (const [id, p] of Object.entries(PET_PASSIVES)) {
    assert.ok(typeof p.short === 'string' && p.short.length > 0, `${id} ไม่มี short`)
    const filled = effectText(p, 1)
    assert.ok(!/\{\w+\}/.test(filled), `${id} เหลือ placeholder: ${filled}`)
  }
})

test('effectText: ขั้นสูงขึ้นแล้วเลขต้องขยับ (ตัวที่ step ไม่เป็น 0)', () => {
  assert.notEqual(effectText(PET_PASSIVES.whale, 1), effectText(PET_PASSIVES.whale, 3))
  assert.match(effectText(PET_PASSIVES.whale, 3), /16/)
})

test('effectText: ฟีนิกซ์กับแมวต้องอ่านต่างกัน (เดิมชนกันที่ "กันตายได้ 1 ครั้ง")', () => {
  assert.notEqual(effectText(PET_PASSIVES.phoenix, 1), effectText(PET_PASSIVES.cat, 1))
})

test('หมาป่า: desc/short ต้องไม่มีคำว่า "สายพลัง" (ชื่อสายจริงคือ จู่โจม)', () => {
  assert.ok(!PET_PASSIVES.wolf.desc.includes('สายพลัง'), PET_PASSIVES.wolf.desc)
  assert.ok(!PET_PASSIVES.wolf.short.includes('สายพลัง'), PET_PASSIVES.wolf.short)
  assert.ok(PET_PASSIVES.wolf.desc.includes('จู่โจม'))
})

test('STATUS_ICON/STATUS_TEXT: มี duoRegen แล้ว (คู่หู 🐳🦭 เดิมไม่มีป้ายเลย)', () => {
  assert.equal(STATUS_ICON.duoRegen, '💧')
  assert.ok(STATUS_TEXT.duoRegen)
})

test('effectText: aura ที่ลงฝั่งตรงข้ามมีข้อความมุมผู้รับแยก (onTarget)', () => {
  const owl = PET_PASSIVES.owl
  assert.equal(effectText(owl, 1), 'ศัตรูทุกตัวได้รับดาเมจ +6%')
  assert.equal(effectText(owl, 1, { onTarget: true }), 'รับดาเมจเพิ่ม 6%')
  // ตัวที่ไม่มี shortOn ต้องตกกลับไป short เหมือนเดิม ไม่ใช่ค่าว่าง
  assert.equal(effectText(PET_PASSIVES.whale, 1, { onTarget: true }), effectText(PET_PASSIVES.whale, 1))
})

// ── หลายผลในตัวเดียว (โครง parts[]) ─────────────────────────────
// ลงทะเบียนพาสสีฟสมมติชั่วคราวในทะเบียน แล้วลบทิ้งท้ายเทส
// (แพทเทิร์นเดียวกับ id '__blank__' ที่ sim ใช้ — ทะเบียนเป็น object ธรรมดา)
test('onRound: พาสสีฟที่มี 2 part ใน hook เดียวกัน ต้องทำงานครบทั้งคู่', () => {
  PET_PASSIVES.__two = {
    name: 'ทดสอบสองผล', icon: '🧪',
    parts: [
      { hook: 'onRound', effect: 'regenSelf', value: { pct: 10 }, step: { pct: 0 } },
      { hook: 'onRound', effect: 'healLowestAlly', value: { pct: 20 }, step: { pct: 0 } },
    ],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const me = u('__two', { uid: 'A0', hp: 500 })      // maxHp 1000 ⇒ พร่องอยู่
    const mate = u('__blank__', { uid: 'A1', hp: 200 })
    const events = runOnRound([me, mate])
    const effects = events.map(e => e.effect)
    // ลำดับใน parts[] = ลำดับที่ event โผล่บนจอ — เป็นสัญญาในสเปก §2.4 ต้องมีเทสกัน
    assert.deepEqual(effects, ['regenSelf', 'healLowestAlly'])
    assert.equal(me.hp, 600)                            // +10% ของ 1000
    assert.equal(mate.hp, 400)                          // +20% ของ 1000
  } finally {
    delete PET_PASSIVES.__two
  }
})

test('onHit: part ของ hook อื่นต้องไม่ถูกเรียกผิดจังหวะ', () => {
  PET_PASSIVES.__mix = {
    name: 'ทดสอบข้ามฮุก', icon: '🧪',
    parts: [
      { hook: 'onHit', effect: 'damageReduction', value: { pct: 50 }, step: { pct: 0 } },
      { hook: 'onKill', effect: 'stackAtk', value: { pct: 10, max: 3 }, step: { pct: 0, max: 0 } },
    ],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const d = u('__mix', { uid: 'A0' })
    const res = runOnHit(d, 100, u('__blank__', { uid: 'B0', side: 'B' }), [d], () => 0.99)
    assert.equal(res.dmg, 50)                                   // ลดครึ่ง
    assert.equal(res.events.filter(e => e.effect === 'stackAtk').length, 0)
  } finally {
    delete PET_PASSIVES.__mix
  }
})

test('guardian: ต้องหาจาก hook onHit ไม่ใช่ effect-first (กันเจอ part ผิดตอนเพ็ทมีหลาย part)', () => {
  // เพ็ทสังเคราะห์: guardian อยู่บน hook อื่นมาก่อน แล้วค่อยมีตัวจริงบน onHit
  const fake = {
    name: 'ทดสอบ', icon: '🧪',
    parts: [
      { hook: 'onRound', effect: 'guardian', value: { pct: 99 } },
      { hook: 'onHit', effect: 'guardian', value: { pct: 50 } },
    ],
  }
  const g = { uid: 'A0', side: 'A', id: '__fake', hp: 100, maxHp: 100, atk: 10 }
  const d = { uid: 'A1', side: 'A', id: 'blank', hp: 40, maxHp: 100, atk: 10 }
  const att = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
  PET_PASSIVES.__fake = fake
  try {
    const res = runOnHit(d, 100, att, [g, d], () => 0.99)
    // ต้องได้ 50% (ตัวจริงบน onHit) ไม่ใช่ 99% ของ part แรกที่ effect ตรง
    assert.equal(Math.round(res.dmg), 50)
  } finally { delete PET_PASSIVES.__fake }
})

test('runOnHit ไม่คืนฟิลด์ absorber อีกแล้ว (เอนจินไม่เคยอ่าน = โค้ดตาย)', () => {
  const d = { uid: 'A0', side: 'A', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
  const att = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
  const res = runOnHit(d, 100, att, [d], () => 0.5)
  assert.equal('absorber' in res, false)
})

// การพิสูจน์ว่า pierce "ทะลุ" จริง ต้องรอ P2b ที่มี infect เป็นตัวผลิตค่า
// (วันนี้ไม่มีโค้ดจริงสายไหนใส่ค่าให้ pierce ⇒ เทสที่เขียนตอนนี้จะได้แค่ทดสอบตัวเอง)
test('pierce: ค่าเริ่มต้นเป็น 0 เสมอ', () => {
  const d = { uid: 'A0', side: 'A', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
  const att = { uid: 'B0', side: 'B', id: 'blank', hp: 100, maxHp: 100, atk: 10 }
  assert.equal(runOnHit(d, 100, att, [d], () => 0.5).pierce, 0)
})

test('armorStack: กินสแตคแล้วกันทั้งหมัด + คืนก้อนสะท้อนให้เอนจิน', () => {
  PET_PASSIVES.__armor = {
    name: 'ทดสอบเกราะ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 2, pct: 80 }, step: { count: 0, pct: 0 } }],
    desc: 'เกราะ {count} ชั้น สะท้อน {pct}%', short: 'เกราะ {count} ชั้น',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__armor', hp: 100, maxHp: 100, atk: 10 }
    const att = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const r1 = runOnHit(me, 100, att, [me], () => 0.5)
    assert.equal(r1.dmg, 0, 'สแตคแรกต้องกันหมัดทั้งหมด')
    assert.equal(r1.reflect, 80)
    assert.equal(psOf(me).armor, 1)

    const r2 = runOnHit(me, 50, att, [me], () => 0.5)
    assert.equal(r2.dmg, 0)
    assert.equal(r2.reflect, 40)
    assert.equal(psOf(me).armor, 0)

    const r3 = runOnHit(me, 50, att, [me], () => 0.5)
    assert.equal(r3.dmg, 50, 'หมดสแตคแล้วต้องรับเต็ม')
    assert.equal(r3.reflect, 0)
  } finally { delete PET_PASSIVES.__armor }
})

// 🔴 fxKind ของเกราะต้องแยกจาก 'guard' ของบากุ — สอง effect เคยใช้ชื่อเดียวกันแต่ `amount` คนละหน่วย
//    (บากุ = ดาเมจที่รับแทน · เกราะ = จำนวนสแตคที่เหลือ ซึ่งเป็น 0 ได้) ⇒ มินิชิปของสเปก §6.2 ที่คีย์ด้วย
//    fxKind แล้วพิมพ์ amount จะพิมพ์เลขผิดหน่วยโดยไม่มีเทสจับ · ตอนนี้เกราะเป็น 'armor' และ amount =
//    ดาเมจสะท้อน (ค่าที่เดิมไม่ได้ถูกบันทึกไว้ที่ไหนเลย — P2c จะต้องไปขุดจาก attack event ตัวถัดไปเอง)
test('armorStack: event เป็น fxKind ของตัวเอง · amount = ดาเมจสะท้อน · สแตคที่เหลืออยู่ใน armorLeft', () => {
  PET_PASSIVES.__armorEv = {
    name: 'ทดสอบเกราะป้าย', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 2, pct: 80 }, step: { count: 0, pct: 0 } }],
    desc: 'เกราะ {count} ชั้น สะท้อน {pct}%', short: 'เกราะ {count} ชั้น',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__armorEv', hp: 100, maxHp: 100, atk: 10 }
    const att = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const e = runOnHit(me, 100, att, [me], () => 0.5).events.find(x => x.effect === 'armorStack')
    assert.ok(e, 'ต้องมี event ของเกราะ')
    assert.equal(e.fxKind, 'armor', "ห้ามใช้ 'guard' ร่วมกับบากุ — หน่วยของ amount คนละอย่างกัน")
    assert.equal(e.amount, 80, 'amount = ดาเมจที่สะท้อนกลับไปจริง (80% ของ 100)')
    assert.equal(e.armorLeft, 1, 'สแตคที่เหลือย้ายไปอยู่ฟิลด์ของตัวเอง')
    assert.equal(e.kind, undefined, '🔴 ห้ามมีฟิลด์ชื่อ kind ใน event (CLAUDE.md ข้อ 15)')
  } finally { delete PET_PASSIVES.__armorEv }
})

// 🔴 หนี้ของงานย่อย 1: atkOnHit ถูกยกออกนอกลูปเพื่อเลิกขึ้นกับ "ลำดับ part ในข้อมูล" — แล้ว armorStack
//    เดินกลับเข้าไปใหม่เพราะไม่มีการ์ด res.dmg · เทสนี้คือหลักฐานว่าการ์ดที่เพิ่มเข้าไปกัดจริง
test('armorStack: หมัดที่ถูกหลบไปแล้ว (dmg = 0) ต้องไม่กินสแตคและไม่เด้งป้าย', () => {
  PET_PASSIVES.__armorDodge = {
    name: 'ทดสอบเกราะ+หลบ', icon: '🧪',
    parts: [
      // ลำดับนี้แหละคือปัญหา: dodge ล้างดาเมจก่อน แล้ว armorStack ที่อยู่ถัดไปเห็น res.dmg = 0
      // แล้วเดิมยังกินสแตคไปหนึ่งชั้นพร้อมสะท้อน 0 — ทรัพยากรทั้งหมดของกลไกหายไปเงียบๆ
      // pct 50 (ไม่ใช่ 100) เพื่อให้เทสสั่งได้ทั้ง "หลบติด" และ "หลบไม่ติด" ด้วย rand คนละค่า
      { hook: 'onHit', effect: 'dodge', value: { pct: 50 }, step: { pct: 0 } },
      { hook: 'onHit', effect: 'armorStack', value: { count: 2, pct: 80 }, step: { count: 0, pct: 0 } },
    ],
    desc: 'หลบ {pct}%', short: 'หลบ {pct}%',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__armorDodge', hp: 100, maxHp: 100, atk: 10 }
    const att = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const res = runOnHit(me, 100, att, [me], () => 0)     // rand 0 → 0 < 50 = หลบติด
    assert.equal(res.dodged, true, 'ต้องหลบจริงในเทสนี้')
    assert.equal(res.dmg, 0)
    assert.equal(res.reflect, 0, 'ไม่มีดาเมจเหลือให้กัน ⇒ ไม่มีอะไรให้สะท้อน')
    assert.equal(psOf(me).armor, 2, 'สแตคถูก seed ตอนสัมผัสแรก แต่ห้ามถูกใช้กับหมัดที่ไม่มีอะไรให้กัน')
    assert.equal(res.events.filter(e => e.effect === 'armorStack').length, 0,
      'ไม่ได้กินสแตค = ต้องไม่มีป้ายเกราะเด้ง (ไม่งั้นผู้เล่นเห็นเกราะทำงานทั้งที่หลบไปแล้ว)')

    // หมัดถัดไปที่ดาเมจผ่านจริง สแตคยังครบ 2 พร้อมใช้ — พิสูจน์ว่าการ์ดไม่ได้ปิดกลไกทิ้ง
    const hit = runOnHit(me, 100, att, [me], () => 0.99)  // rand 0.99 → 99 < 50 เป็นเท็จ = หลบไม่ติด
    assert.equal(hit.dodged, false)
    assert.equal(hit.dmg, 0, 'เกราะกันทั้งหมัด')
    assert.equal(hit.reflect, 80)
    assert.equal(psOf(me).armor, 1, 'เพิ่งเสียสแตคแรกที่หมัดนี้ ไม่ใช่ที่หมัดที่หลบไปก่อนหน้า')
  } finally { delete PET_PASSIVES.__armorDodge }
})

test('armorStack: กันหมัดหลักได้ แต่กันดาเมจเชื้อไม่ได้ (pierce ทะลุเกราะ)', () => {
  PET_PASSIVES.__armor2 = {
    name: 'ทดสอบเกราะ2', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 1, pct: 0 }, step: { count: 0, pct: 0 } }],
    desc: 'เกราะ {count} ชั้น', short: 'เกราะ {count} ชั้น',
  }
  try {
    const me = { uid: 'A0', side: 'A', id: '__armor2', hp: 100, maxHp: 100, atk: 10 }
    const att = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const res = runOnHit(me, 100, att, [me], () => 0.5)
    res.pierce = 30                      // จำลองว่างานย่อย 6 ใส่ค่าให้ (เทสจริงอยู่ที่งานย่อย 6)
    assert.equal(res.dmg, 0)
    assert.equal(res.pierce, 30, 'เกราะต้องไม่แตะช่อง pierce')
  } finally { delete PET_PASSIVES.__armor2 }
})

// ══════════════════════════════════════════════════════════════
//  armorStack ระดับ simulateBattle — ทางสะท้อนในเอนจินไม่เคยถูกเทสที่ชั้นไหนเลย
// ══════════════════════════════════════════════════════════════
// 🔴 บล็อกสะท้อนใน battleEngine.js ทำให้ strike() **เรียกซ้อนตัวเอง** เป็นครั้งแรกในโค้ดเบสนี้ แต่ของเดิม
//    มีแค่ assert ว่า runOnHit คืน res.reflect เป็นตัวเลข ⇒ การรีเคอร์ซิฟ, flag `reflecting`, `sub: true`,
//    รายชื่อเป้า และพารามิเตอร์ "ทีมของเป้า" ไม่มีใครทดสอบสักตัว (แผน P2b งานย่อย 2 สั่งแค่เทสหน่วยย่อย)
//
// 🔒 ครึ่งสำคัญที่สุดของเทสนี้คือ **ความยาวรีเพลย์ต้องไม่ขยับ** — กฎเหล็ก "passive ห้ามเพิ่ม beat"
//    ทำงานที่ชั้น buildBeats ไม่ใช่ชั้น log ⇒ ต้องวัดที่นั่น · รันคุมกลุ่มใช้ pct: 0 ซึ่งยัง "กินสแตค
//    และกันหมัดเต็มใบ" เหมือนเดิมทุกอย่าง (res.dmg = 0 ไม่ขึ้นกับ pct) ต่างกันแค่ก้อนสะท้อนที่เป็น 0
//    ⇒ ลำดับหมัด/การตาย/การดึง rand เหมือนกันเป๊ะ (เป้าที่โดนสะท้อนไม่มีพาสสีฟที่ดึง rand และ HP ที่หาย
//    ไม่พอทำให้ใครตายเร็วขึ้นในไฟต์นี้ — ยืนยันด้วยจำนวน attack event ที่ไม่ใช่ sub เท่ากันทั้งสองรัน)
test('armorStack: ก้อนสะท้อนยิงจริงผ่าน simulateBattle เป็น sub และไม่ยืดความยาวรีเพลย์แม้แต่มิลลิวินาทีเดียว', () => {
  // A: เกราะตัวเดียว (common/1 = อ่อน ตายในไม่กี่รอบ) · B: ศัตรูสองตัว legendary/5 เลือดหนา
  // ⇒ ก้อนสะท้อน (2 สแตค × 2 เป้า = 4 หมัด) ไม่พอฆ่าใคร ⇒ โครงไฟต์ของสองรันเหมือนกันเป๊ะ
  const A = [{ id: '__armorSim', rarity: 'common', element: 'fist', grade: 1 }]
  const B = [{ id: '__foeSim', rarity: 'legendary', element: 'fist', grade: 5 },
             { id: '__foeSim', rarity: 'legendary', element: 'fist', grade: 5 }]
  const runWith = (pct) => {
    PET_PASSIVES.__armorSim = {
      name: 'ทดสอบเกราะสนาม', icon: '🧪',
      parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 2, pct }, step: { count: 0, pct: 0 } }],
      desc: 'เกราะ {count} ชั้น สะท้อน {pct}%', short: 'เกราะ {count} ชั้น',
    }
    try { return simulateBattle(A, B, 42) } finally { delete PET_PASSIVES.__armorSim }
  }
  const real = runWith(80)
  const ctrl = runWith(0)
  // __foeSim ไม่ได้ลงทะเบียนพาสสีฟโดยตั้งใจ — ศัตรูต้องไม่มีอะไรดึง rand() หรือกันดาเมจ
  assert.equal(PET_PASSIVES.__foeSim, undefined)

  // ── ก้อนสะท้อนมีจริง และเป็นหมัดลูกของ beat เดิม ──
  const reflects = real.log.filter(e => e.t === 'attack' && e.attacker === 'A0' && e.sub)
  assert.equal(reflects.length, 4, 'เกราะ 2 สแตค × ศัตรู 2 ตัว = สะท้อน 4 หมัด')
  assert.ok(reflects.every(e => e.sub === true), '🔒 ทุกหมัดสะท้อนต้องเป็น sub (อยู่ beat เดิม)')
  assert.ok(reflects.every(e => e.side === 'A'), 'ฝั่งของหมัดสะท้อน = ฝั่งของคนที่มีเกราะ ไม่ใช่ผู้ตี')
  assert.deepEqual(reflects.map(e => e.target), ['B0', 'B1', 'B0', 'B1'],
    'แต่ละก้อนต้องลงศัตรูที่ยังไม่ตาย "ทุกตัว" ตามลำดับในทีม (พารามิเตอร์ทีมของเป้าส่งถูก)')
  assert.ok(reflects.every(e => e.dmg > 0), 'ดาเมจสะท้อนต้องลงจริง ไม่ใช่ event เปล่า')

  // ป้ายเกราะบอกดาเมจสะท้อนตรงกับที่ลงจริง (ศัตรูไม่มีสายลด ⇒ ต้องเท่ากันเป๊ะ)
  const armorEvents = real.log.filter(e => e.t === 'passive' && e.effect === 'armorStack')
  assert.equal(armorEvents.length, 2, 'กินสแตคได้ 2 ครั้งเท่านั้น แล้วรับหมัดปกติ')
  assert.deepEqual(armorEvents.map(e => e.armorLeft), [1, 0])
  assert.equal(reflects[0].dmg, armorEvents[0].amount)
  assert.equal(reflects[1].dmg, armorEvents[0].amount)

  // ── รันคุมกลุ่ม: เกราะยังกินสแตคและกันหมัดเต็มใบเหมือนเดิม ต่างกันแค่ไม่มีก้อนสะท้อน ──
  assert.equal(ctrl.log.filter(e => e.t === 'passive' && e.effect === 'armorStack').length, 2,
    'pct: 0 ต้องยัง "กินสแตคและกันหมัด" เหมือนกันทุกอย่าง ไม่งั้นสองรันเทียบกันไม่ได้')
  assert.equal(ctrl.log.filter(e => e.t === 'attack' && e.sub).length, 0, 'คุมกลุ่มต้องไม่มีหมัดสะท้อนเลย')
  const mainHits = (r) => r.log.filter(e => e.t === 'attack' && !e.sub).length
  assert.equal(mainHits(real), mainHits(ctrl), 'จำนวนหมัดหลักต้องเท่ากัน = โครงไฟต์ไม่เปลี่ยน')
  assert.equal(real.winner, ctrl.winner)
  assert.equal(real.rounds, ctrl.rounds)

  // ── 🔒 กฎเหล็ก วัดที่ชั้นที่มันทำงานจริง: ความยาวรีเพลย์รวมต้องเท่ากันเป๊ะ ──
  const maxHpOf = (r) => Object.fromEntries(Object.entries(r.units).map(([uid, s]) => [uid, s.maxHp]))
  const durReal = totalDuration(buildBeats(real.log, maxHpOf(real)))
  const durCtrl = totalDuration(buildBeats(ctrl.log, maxHpOf(ctrl)))
  assert.equal(durReal, durCtrl,
    '🔒 ก้อนสะท้อนเพิ่ม event เข้า log แต่ต้องได้ kind "sub" (timing ZERO) ⇒ เวลารวมห้ามขยับ')
  const kinds = buildBeats(real.log, maxHpOf(real)).filter((_, i) => real.log[i].sub).map(b => b.kind)
  assert.deepEqual(kinds, ['sub', 'sub', 'sub', 'sub'], 'ทุกหมัดสะท้อนต้องถูกจัดเป็น kind sub')
})

// ── tauntTargetOf ────────────────────────────────────────────
test('tauntTargetOf: ไม่มีใครมี taunt คืน null (ไฟต์ปกติต้องไม่เปลี่ยนพฤติกรรม)', () => {
  const a = { uid: 'B0', side: 'B', id: 'turtle', hp: 100, maxHp: 100, atk: 10 }
  const b = { uid: 'B1', side: 'B', id: 'fox', hp: 100, maxHp: 100, atk: 10 }
  assert.equal(tauntTargetOf([a, b]), null)
})

test('tauntTargetOf: มีสองตัวเอาช่องซ้ายสุด และข้ามตัวที่ตายแล้ว', () => {
  PET_PASSIVES.__taunt = {
    name: 'ทดสอบท้าชน', icon: '🧪',
    parts: [{ hook: 'onRound', effect: 'taunt', value: { pct: 25 }, step: { pct: 0 } }],
    desc: 'ท้าชน ลด {pct}%', short: 'ท้าชน ลด {pct}%',
  }
  try {
    const dead = { uid: 'B0', side: 'B', id: '__taunt', hp: 0, maxHp: 100, atk: 10 }
    const left = { uid: 'B1', side: 'B', id: '__taunt', hp: 100, maxHp: 100, atk: 10 }
    const right = { uid: 'B2', side: 'B', id: '__taunt', hp: 100, maxHp: 100, atk: 10 }
    assert.equal(tauntTargetOf([dead, left, right]), left)
  } finally { delete PET_PASSIVES.__taunt }
})

test('taunt: ลดดาเมจเฉพาะหมัดที่ถูกบังคับมา ไม่ใช่ทุกหมัด', () => {
  PET_PASSIVES.__taunt2 = {
    name: 'ทดสอบท้าชน2', icon: '🧪',
    parts: [{ hook: 'onRound', effect: 'taunt', value: { pct: 25 }, step: { pct: 0 } }],
    desc: 'ท้าชน ลด {pct}%', short: 'ท้าชน ลด {pct}%',
  }
  try {
    const me = { uid: 'B0', side: 'B', id: '__taunt2', hp: 100, maxHp: 100, atk: 10 }
    const att = { uid: 'A0', side: 'A', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    assert.equal(runOnHit(me, 100, att, [me], () => 0.5, true).dmg, 75, 'หมัดที่ถูกดึงมาต้องลด 25%')
    assert.equal(runOnHit(me, 100, att, [me], () => 0.5, false).dmg, 100, 'หมัดที่เลือกเองต้องไม่ลด')
  } finally { delete PET_PASSIVES.__taunt2 }
})

test('runOnAttack: targetLowest ต้องไม่แย่งเป้าที่ถูก taunt บังคับไว้', () => {
  PET_PASSIVES.__taunt3 = {
    name: 'ทดสอบท้าชน3', icon: '🧪',
    parts: [{ hook: 'onRound', effect: 'taunt', value: { pct: 25 }, step: { pct: 0 } }],
    desc: 'ท้าชน ลด {pct}%', short: 'ท้าชน ลด {pct}%',
  }
  try {
    const gorilla = { uid: 'B0', side: 'B', id: '__taunt3', hp: 100, maxHp: 100, atk: 10 }
    const weak = { uid: 'B1', side: 'B', id: '__blank__', hp: 5, maxHp: 100, atk: 10 }
    const eagle = { uid: 'A0', side: 'A', id: 'simurgh', hp: 100, maxHp: 100, atk: 10 }
    const mod = runOnAttack(eagle, gorilla, [gorilla, weak], () => 0.5)
    assert.equal(mod.target, gorilla, 'taunt ต้องชนะ targetLowest ตามลำดับในสเปก')
  } finally { delete PET_PASSIVES.__taunt3 }
})

// ── infect (ตอนที่ 1: แปะเชื้อ + เพดาน — ยังไม่ระเบิด) ────────
test('infect: ไวรัสตีแล้วเป้าได้ชั้นเชื้อ ชนเพดานแล้วไม่เกิน', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const tgt = { uid: 'B0', side: 'B', id: '__blank__', hp: 500, maxHp: 500, atk: 10 }
    // 🔴 P2b (งานย่อย 6) ทำให้หมัดที่ 2 เป็นต้นไปของลูปนี้ "ระเบิด" ด้วย (virus ตีเป้าที่ตัวเองแปะเชื้อไว้แล้ว
    //    ก็ถือว่าอยู่ทีมเดียวกับ from) — แต่ event ระเบิดใช้ชื่อ effect แยกเป็น 'infectBurst' แล้ว (fix round 1
    //    ข้อ 2: กันชนคีย์ dedupe ของ battleBeats.js) ⇒ filter effect === 'infect' เฉยๆ ก็ได้เฉพาะการแปะชั้น
    //    ตรงกับที่เทสนี้ตั้งใจวัดอยู่แล้ว ไม่ต้องพึ่ง fxKind (เพดานของการ "แปะ" ไม่ใช่จำนวนครั้งที่ "ระเบิด"
    //    ซึ่งไม่มีเพดานและถูกเทสแยกไว้ต่างหากแล้ว)
    let tagEvents = 0
    for (let i = 0; i < 7; i++) {
      const r = runOnHit(tgt, 10, virus, [tgt], () => 0.5)
      tagEvents += r.events.filter(e => e.effect === 'infect').length
    }
    assert.equal(psOf(tgt).infect.n, 5, 'เพดาน 5 ชั้น')
    assert.equal(psOf(tgt).infect.from, virus)
    assert.equal(tagEvents, 5, 'ชนเพดานแล้วต้องเงียบ — 7 หมัดต้องได้ event แปะชั้นแค่ 5 อัน ไม่ใช่ 7')
  } finally { delete PET_PASSIVES.__virus }
})

// 🦠 บาลานซ์รอบ 27 ก.ย. 2026 — ไวรัสตีทีไร ศัตรูทุกตัวที่ยังอยู่ในทีมเป้าติด/ขึ้นชั้น +1 พร้อมกัน
//    (ทั้ง event เดียวหลายเป้า กันรีเพลย์รก — ดู task-4-brief.md)
test('infect: ตีเป้าเดียว แต่ทั้งทีมเป้าติดเชื้อ +1 ชั้นพร้อมกัน เป็น event เดียว', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const b0 = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const b1 = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const b2 = { uid: 'B2', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const team = [b0, b1, b2]

    const r1 = runOnHit(b0, 10, virus, team, () => 0.5)
    const tagged1 = r1.events.filter(e => e.effect === 'infect')
    assert.equal(tagged1.length, 1, 'ต้องเป็น event เดียว ไม่ใช่ 1 ต่อเป้า')
    assert.equal(psOf(b0).infect.n, 1)
    assert.equal(psOf(b1).infect.n, 1)
    assert.equal(psOf(b2).infect.n, 1)
    assert.deepEqual(new Set(tagged1[0].targets), new Set(['B0', 'B1', 'B2']))
    assert.equal(tagged1[0].fxKind, 'debuff')
    assert.equal(psOf(b0).infect.from, virus, 'เจ้าของสแตคคือไวรัสตัวแรก')
    assert.equal(psOf(b1).infect.from, virus)
    assert.equal(psOf(b2).infect.from, virus)

    const r2 = runOnHit(b1, 10, virus, team, () => 0.5)
    const tagged2 = r2.events.filter(e => e.effect === 'infect')
    assert.equal(tagged2.length, 1)
    assert.equal(psOf(b0).infect.n, 2)
    assert.equal(psOf(b1).infect.n, 2)
    assert.equal(psOf(b2).infect.n, 2)

    // ตัวตายไม่ติด
    b2.hp = 0
    const r3 = runOnHit(b0, 10, virus, team, () => 0.5)
    assert.equal(psOf(b0).infect.n, 3)
    assert.equal(psOf(b1).infect.n, 3)
    assert.equal(psOf(b2).infect.n, 2, 'ตัวตายไม่ได้รับชั้นเพิ่ม')
    const tagged3 = r3.events.filter(e => e.effect === 'infect')
    assert.deepEqual(new Set(tagged3[0].targets), new Set(['B0', 'B1']))

    // เพดาน max=5: เลี้ยงจนถึงเพดานแล้วต้องไม่เกิน และ target ที่ชนเพดานหลุดออกจาก event ต่อไป
    // ก่อนหน้านี้ b0/b1 = n3, b2 = n2 (พลาดตอนตาย) — เลี้ยง b0/b1 ไปชนเพดาน 5 ก่อน b2
    b2.hp = 100
    runOnHit(b0, 10, virus, team, () => 0.5) // n=4/4/3
    const r5 = runOnHit(b0, 10, virus, team, () => 0.5) // n=5/5/4 — b0,b1 ชนเพดานแล้ว
    assert.equal(psOf(b0).infect.n, 5)
    assert.equal(psOf(b1).infect.n, 5)
    assert.equal(psOf(b2).infect.n, 4)
    assert.deepEqual(new Set(r5.events.filter(e => e.effect === 'infect')[0].targets), new Set(['B0', 'B1', 'B2']))
    const r5b = runOnHit(b0, 10, virus, team, () => 0.5) // n=5/5/5 — เฉพาะ b2 ยังขึ้นชั้นได้
    assert.equal(psOf(b2).infect.n, 5)
    assert.deepEqual(r5b.events.filter(e => e.effect === 'infect')[0].targets, ['B2'],
      'b0/b1 ชนเพดานแล้วต้องหลุดจาก event นี้ เหลือแค่ b2 ที่ยังขึ้นชั้นได้')
    const r6 = runOnHit(b0, 10, virus, team, () => 0.5) // ทุกตัวชนเพดานแล้ว → ไม่มี event
    assert.equal(r6.events.filter(e => e.effect === 'infect').length, 0, 'ทุกตัวชนเพดานแล้วต้องเงียบ')
  } finally { delete PET_PASSIVES.__virus }
})

test('infect: เพ็ทที่ไม่ใช่ไวรัสตี ไม่แปะเชื้อ', () => {
  const att = { uid: 'A0', side: 'A', id: 'turtle', hp: 100, maxHp: 100, atk: 100 }
  const tgt = { uid: 'B0', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
  runOnHit(tgt, 10, att, [tgt], () => 0.5)
  assert.equal(psOf(tgt).infect, undefined)
})

test('infect: ไวรัสตัวแรกเป็นเจ้าของสแตคเสมอ — ไวรัสตัวที่สองตีต่อไม่แย่งความเป็นเจ้าของ', () => {
  PET_PASSIVES.__virusA = {
    name: 'ทดสอบเชื้อ A', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  PET_PASSIVES.__virusB = {
    name: 'ทดสอบเชื้อ B', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virusA = { uid: 'A0', side: 'A', id: '__virusA', hp: 100, maxHp: 100, atk: 100 }
    const virusB = { uid: 'A1', side: 'A', id: '__virusB', hp: 100, maxHp: 100, atk: 999 } // atk ต่างกันชัดเจน
    const tgt = { uid: 'B0', side: 'B', id: '__blank__', hp: 500, maxHp: 500, atk: 10 }
    runOnHit(tgt, 10, virusA, [tgt], () => 0.5)
    runOnHit(tgt, 10, virusA, [tgt], () => 0.5)
    assert.equal(psOf(tgt).infect.n, 2)
    assert.equal(psOf(tgt).infect.from, virusA, 'ก่อนไวรัส B ตี เจ้าของต้องเป็น A')

    runOnHit(tgt, 10, virusB, [tgt], () => 0.5)     // ไวรัส B ตีต่อ ยังไม่ชนเพดาน (n=2 < max=5)
    assert.equal(psOf(tgt).infect.n, 3, 'สแตคยังต้องเพิ่มจากไวรัส B')
    assert.equal(psOf(tgt).infect.from, virusA, 'ไวรัสตัวแรก (A) ยังต้องเป็นเจ้าของสแตค ไม่ใช่ B ที่ตีล่าสุด')
  } finally { delete PET_PASSIVES.__virusA; delete PET_PASSIVES.__virusB }
})

test('infect: ดอดจ์เต็มหมัด (dmg=0) ก็ยังติดเชื้อ — การแปะไม่ขึ้นกับดาเมจที่ทะลุเข้ามา', () => {
  PET_PASSIVES.__virusDmg = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  PET_PASSIVES.__dodger = {
    name: 'ทดสอบหลบ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'dodge', value: { pct: 100 }, step: { pct: 0 } }],
    desc: 'หลบ {pct}%', short: 'หลบ {pct}%',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virusDmg', hp: 100, maxHp: 100, atk: 100 }
    const tgt = { uid: 'B0', side: 'B', id: '__dodger', hp: 100, maxHp: 100, atk: 10 }
    const res = runOnHit(tgt, 10, virus, [tgt], () => 0)   // rand 0 = หลบติดแน่นอน (dodge 100%)
    assert.equal(res.dodged, true, 'ต้องหลบจริงในเทสนี้')
    assert.equal(res.dmg, 0, 'ดาเมจต้องเป็น 0 หลังหลบ')
    assert.equal(psOf(tgt).infect.n, 1, 'หลบเต็มหมัดก็ยังต้องติดเชื้อ 1 ชั้น')
    assert.equal(psOf(tgt).infect.from, virus)
  } finally { delete PET_PASSIVES.__virusDmg; delete PET_PASSIVES.__dodger }
})

// ── infect (ตอนที่ 2: ระเบิดผ่าน pierce) ───────────────────────
// ⚠️ pct ของสามเทสนี้อ่านจากพาสสีฟของไวรัสตอนระเบิด (Step 4: passiveFor(inf.from) → หา part effect infect)
//    ⇒ ต้องลงทะเบียน __virus แบบงานย่อย 5 แล้วให้ from ชี้ยูนิตที่ id: '__virus' จริง — id '__blank__' หา
//    part ไม่เจอ (ไม่มีพาสสีฟ) จะได้ pierce = 0 เสมอโดยไม่เกี่ยวกับตรรกะที่กำลังเทส
test('infect: เพื่อนร่วมทีมไวรัสตี ก็ระเบิดเชื้อ และเชื้อไม่ลดลง', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const mate = { uid: 'A1', side: 'A', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const tgt = { uid: 'B0', side: 'B', id: '__blank__', hp: 500, maxHp: 500, atk: 10 }
    psOf(tgt).infect = { n: 3, from: virus }
    const res = runOnHit(tgt, 10, mate, [tgt], () => 0.5)
    assert.equal(res.pierce, 45, '15% ของ atk 100 × 3 ชั้น')
    assert.equal(psOf(tgt).infect.n, 3, 'เชื้อต้องไม่ลดตอนระเบิด')
  } finally { delete PET_PASSIVES.__virus }
})

test('infect: ศัตรูของไวรัสตีกันเอง ไม่ระเบิด', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const virus = { uid: 'A0', side: 'A', id: '__virus', hp: 100, maxHp: 100, atk: 100 }
    const foe = { uid: 'B1', side: 'B', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const tgt = { uid: 'B0', side: 'B', id: '__blank__', hp: 500, maxHp: 500, atk: 10 }
    psOf(tgt).infect = { n: 3, from: virus }
    assert.equal(runOnHit(tgt, 10, foe, [tgt], () => 0.5).pierce, 0)
  } finally { delete PET_PASSIVES.__virus }
})

test('infect: ไวรัสตายแล้วเชื้อยังระเบิดได้ (อ่าน atk จากตัวที่ตายแล้ว)', () => {
  PET_PASSIVES.__virus = {
    name: 'ทดสอบเชื้อ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'infect', value: { pct: 15, max: 5 }, step: { pct: 0, max: 0 } }],
    desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
  }
  try {
    const deadVirus = { uid: 'A0', side: 'A', id: '__virus', hp: 0, maxHp: 100, atk: 100 }
    const mate = { uid: 'A1', side: 'A', id: '__blank__', hp: 100, maxHp: 100, atk: 10 }
    const tgt = { uid: 'B0', side: 'B', id: '__blank__', hp: 500, maxHp: 500, atk: 10 }
    psOf(tgt).infect = { n: 2, from: deadVirus }
    assert.equal(runOnHit(tgt, 10, mate, [tgt], () => 0.5).pierce, 30)
  } finally { delete PET_PASSIVES.__virus }
})

// หนี้จากสเปก §7.4 ข้อ 1 (P2a Task 3 เคยเขียนเทสที่ตั้งค่า res.pierce เองแล้วเช็คค่าที่เพิ่งตั้ง —
// พิสูจน์แค่ว่า JS assignment ทำงาน ไม่ได้พิสูจน์ว่า pierce ทะลุเกราะจริง จึงถูกลบทิ้งใน P2a)
// เทสนี้ยิงผ่าน simulateBattle เต็มใบ ให้ engine เป็นคนคำนวณทั้งสายลดและ pierce เอง แล้วตรวจทุก event
// ระเบิดเชื้อในไฟต์เทียบกับสูตร infect เป๊ะๆ ไม่ใช่แค่ "มากกว่า 0" — ถ้า turtle มีสิทธิ์หักดาเมจนี้ได้แม้แต่นิดเดียว
// (damageReduction 12% ของมันเอง) ตัวเลขที่ได้จริงจะไม่ตรงสูตรทันที
//
// 🔴 fix round 1: เช็คแค่ event.amount (ตัวเลขที่ battlePassives.js เขียนอธิบายตัวเองในหมัดเดียวกัน) ไม่พอ —
//    บล็อกระเบิดไม่เคยอ่าน res.dmg เลย ต่อให้ battleEngine.js หัก hitRes.pierce ผิด (เช่นหักครึ่งเดียว)
//    event.amount ก็ยังพิมพ์ค่าที่ "ควรจะเป็น" เหมือนเดิม เทสแบบเดิมจะยังผ่านทั้งที่ปลายทาง (ฝั่งใช้ค่า) พัง
//    ต้องพิสูจน์ที่ hp ของเป้าที่หายไปจริง (ฝั่ง battleEngine.js: `tg.hp -= hitRes.pierce`) จึงรัน simulateBattle
//    ซ้ำสองครั้งด้วย seed เดิมเป๊ะ ครั้งหนึ่ง pct=15 (ของจริง) อีกครั้ง pct=0 (คุมกลุ่ม) — โค้ดของ infect
//    ไม่เรียก rand() เลยสักจุด (ทั้งตอนแปะและตอนระเบิด) และ pct ไม่มีผลต่อ elementMult/crit/variance/การเลือก
//    เป้าของ battleEngine.js ⇒ ลำดับการดึง rand() ทั้งไฟต์เหมือนกันเป๊ะระหว่างสองรัน จนกว่าฝั่งใดฝั่งหนึ่งจะตาย
//    ก่อน (การตายเกิดจาก hp ต่างกัน ซึ่งมาทีหลังหมัดที่กำลังเทส) ⇒ ดาเมจ "หมัดหลักหลังหักลด" ของหมัดที่ N
//    เหมือนกันทั้งสองรันเป๊ะ ส่วนต่างของ attack.dmg ระหว่างสองรันที่หมัดเดียวกัน = pierce ล้วนๆ ที่ถูกหักจริง
//    จาก hp ของเป้า — ไม่ใช่ค่าที่ battlePassives.js "รายงาน" — นี่คือครึ่งที่หนี้ P2a ต้องการ
test('infect ทะลุทุกเกราะจริง — ยิงผ่าน simulateBattle ไม่ใช่แค่ระดับฟังก์ชัน', () => {
  // ทีม A: ไวรัสล้วน (1 ตัว) · ทีม B: เต่า (damageReduction) — ทีมละตัวเดียว ⇒ A0 ตี B0 ทุกหมัดแน่นอน
  // ถ้าเชื้อถูกหักโดยสายลด ดาเมจที่ B เสียแต่ละหมัดจะน้อยกว่าที่คำนวณไว้อย่างเห็นได้ชัด
  const A = [{ id: '__virus', rarity: 'legendary', element: 'fist', grade: 3 }]
  const B = [{ id: '__wall', rarity: 'common', element: 'paper', grade: 3 }]
  // 🔴 10 ก.ย. 2026: เดิมฝั่งรับใช้ 🐢 เต่าจริง (damageReduction 12%) — พอ P3a ย้ายเต่าไปเป็นลดทั้งทีม
  //    ความยาวไฟต์เปลี่ยน ตัวเลขที่บันทึกไว้ท้ายเทสจึงเพี้ยนทันที · เทสนี้ต้องการ "กำแพงลดดาเมจ" เฉยๆ
  //    ไม่ได้ต้องการเต่า ⇒ ใช้เพ็ทสังเคราะห์ค่าเท่าเต่าเดิม แล้วเทสจะนิ่งต่อการจูนเพ็ทจริงตลอดไป
  const runWith = (pct) => {
    PET_PASSIVES.__virus = {
      name: 'ทดสอบเชื้อ', icon: '🧪',
      parts: [{ hook: 'onAttack', effect: 'infect', value: { pct, max: 5 }, step: { pct: 0, max: 0 } }],
      desc: 'เชื้อ {pct}% ต่อชั้น สูงสุด {max}', short: 'เชื้อ {pct}% ต่อชั้น',
    }
    PET_PASSIVES.__wall = {
      name: 'ทดสอบกำแพง', icon: '🧪',
      parts: [{ hook: 'onHit', effect: 'damageReduction', value: { pct: 12 }, step: { pct: 0 } }],
      desc: 'ลดดาเมจ {pct}%', short: 'ลดดาเมจ {pct}%',
    }
    try { return simulateBattle(A, B, 12345) } finally { delete PET_PASSIVES.__virus; delete PET_PASSIVES.__wall }
  }
  const real = runWith(15)                     // ของจริง — pierce มีค่า
  const ctrl = runWith(0)                       // คุมกลุ่ม — โครงสร้างพาสสีฟเหมือนกันทุกจุด (แปะชั้นยังทำงาน,
                                                 // เดิน code path เดียวกัน, ไม่เรียก rand() เพิ่ม/น้อยลง)
                                                 // ต่างกันแค่ pierce ที่ผลิตออกมาเป็น 0 เท่านั้น

  // effect ของ "แปะชั้น" กับ "ระเบิด" แยกชื่อกันแล้ว (infect vs infectBurst — ดู docblock ของ ev() ในซอร์ส
  // สำหรับเหตุผลเรื่องคีย์ dedupe ของ battleBeats.js) กรองได้ตรงๆ ไม่ต้องพึ่ง fxKind อีกต่อไป
  const tagEvents = real.log.filter(e => e.t === 'passive' && e.effect === 'infect')
  const burstEvents = real.log.filter(e => e.t === 'passive' && e.effect === 'infectBurst')
  assert.ok(tagEvents.length > 0 && burstEvents.length > 0, 'ต้องมีทั้งเหตุการณ์แปะเชื้อและระเบิดเชื้อ')

  // ── ที่มาของ virusAtk: buildCombatant (src/data/petPower.js combatStats), ไม่เดา ──
  //   rarity legendary → COMBAT_BASE.legendary.atk = 14
  //   grade 3          → COMBAT_GRADE[3] = 1.52
  //   element fist      → ELEMENT_BIAS.fist.atk = 1.2
  //   atk = 14 × 1.52 × 1.2 = 25.536 (คูณตามลำดับเดียวกับ combatStats() เป๊ะ กันพลาดจุดทศนิยม)
  //   __virus ไม่มี aura/setup ใดๆ ที่แตะ atk ⇒ ค่านี้คงที่ตลอดทั้งไฟต์ ไม่ต้องคำนึงถึง atkOnHit/stackAtk
  const virusAtk = COMBAT_BASE.legendary.atk * COMBAT_GRADE[3] * ELEMENT_BIAS.fist.atk
  assert.equal(virusAtk, 25.536)

  // ── ครึ่งที่ 1 (ตัวรายงานตัวเอง — ยังเก็บไว้เป็นเช็คชั้นแรก): event.amount ของบล็อกระเบิดต้องตรงสูตร
  //    amount = Math.round(virusAtk × 0.15 × nก่อนหน้า) (delta ของหมัดนี้ ไม่ใช่สะสม — fix round 1 ข้อ 3) ──
  let stackSoFar = 0, boomChecked = 0
  for (const e of real.log) {
    if (e.t !== 'passive' || (e.effect !== 'infect' && e.effect !== 'infectBurst')) continue
    if (e.effect === 'infectBurst') {
      const undiminished = Math.round(virusAtk * 0.15 * stackSoFar)
      assert.equal(e.amount, undiminished, `pierce หมัดที่ n=${stackSoFar} ต้องเท่ากับ ${undiminished}`)
      boomChecked++
    } else {
      stackSoFar = e.amount   // st.infect.n หลังแปะของหมัดนี้ — ใช้เป็น n "ก่อนหน้า" ของหมัดถัดไป
    }
  }
  assert.ok(boomChecked > 0, 'ต้องมีหมัดที่ทำให้เชื้อระเบิดจริงอย่างน้อย 1 ครั้งถึงจะพิสูจน์อะไรได้')

  // ── ครึ่งที่ 2 (ของจริงที่หนี้ต้องการ — พิสูจน์ผ่าน hp ที่หายจริง ไม่ใช่ event ที่รายงานตัวเอง) ──
  // เทียบ attack event ฝั่ง A (A0 ตี B0) ทีละหมัดระหว่างรันจริงกับรันคุมกลุ่ม: ส่วนต่างของ dmg ที่บันทึกจริง
  // (ซึ่งมาจาก `tg.hp -= hitRes.dmg` แล้ว `tg.hp -= hitRes.pierce` ใน battleEngine.js — คนละจุดกับที่
  // battlePassives.js เขียน event) ต้องเท่ากับ pierce ที่สูตรทำนายไว้ (คำนวณไว้ในครึ่งที่ 1 แล้ว: 4, 8, 11)
  const realHits = real.log.filter(e => e.t === 'attack' && e.side === 'A')
  const ctrlHits = ctrl.log.filter(e => e.t === 'attack' && e.side === 'A')
  const pierceByHit = [0, 4, 8, 11]   // n=0,1,2,3 ก่อนหมัดที่ 1,2,3,4 ตามลำดับ (จาก round(3.8304×n) ด้านบน)
  // หมัดที่ 1 (n=0 ยังไม่มีสแตค) ไม่มี pierce เลยทั้งสองรัน ⇒ diff ต้องเป็น 0 พอดี ไม่มีปัญหาการปัดเศษ
  assert.equal(realHits[0].dmg - ctrlHits[0].dmg, pierceByHit[0])
  // หมัดที่ 2 และ 3: ยืนยันด้วย diff แบบเป๊ะ (ตรวจแล้วว่า seed 12345 ไม่ชนขอบการปัดเศษที่หมัดเหล่านี้ —
  // main-หลังลดของหมัดนั้นบวก pierce ไม่ข้ามเส้น .5 พอดี) ทั้งสองหมัดนี้มีทั้งไวรัสมีชีวิตในทั้งสองรันแน่นอน
  // (turtle ยังไม่ตายในรันไหนเลยตอนนี้ ⇒ ลำดับ rand() ยังซิงก์กันอยู่ 100%)
  assert.equal(realHits[1].dmg - ctrlHits[1].dmg, pierceByHit[1],
    'หมัดที่ 2: ส่วนต่างดาเมจจริงระหว่างมี/ไม่มี pierce ต้องเท่ากับ pierce เป๊ะ (ไม่ถูกหักที่ปลายทาง)')
  assert.equal(realHits[2].dmg - ctrlHits[2].dmg, pierceByHit[2],
    'หมัดที่ 3: เหมือนกัน — พิสูจน์ผ่าน hp ที่หายจริง ไม่ใช่ event ที่ battlePassives.js รายงานเอง')
  // หมัดที่ 4: main-หลังลดของหมัดนี้บังเอิญอยู่ชิดขอบ .5 (ยืนยันด้วยสคริปต์สำรวจ: real=30, ctrl=18, diff=12
  // ไม่ใช่ 11) — เป็นผลจากการปัดเศษสองรอบอิสระกัน (round(M+p) กับ round(M) ต่างกันได้ไม่เกิน 1 จาก round(p)
  // เสมอ เป็นสมบัติทางคณิตศาสตร์ของ Math.round ไม่ใช่บั๊ก) จึงเช็คแบบคลาดได้ไม่เกิน 1 แทนการเช็คเป๊ะที่หมัดนี้
  assert.ok(Math.abs((realHits[3].dmg - ctrlHits[3].dmg) - pierceByHit[3]) <= 1,
    'หมัดที่ 4: ส่วนต่างต้องใกล้เคียง pierce ในช่วงคลาดเคลื่อนจากการปัดเศษ (≤1) เท่านั้น')

  // ── ค่าที่วัดได้จริงตอนเขียนเทสนี้ (seed 12345, เพื่อบันทึกไว้เป็นหลักฐาน ไม่ใช่ที่มาของสูตร) ──
  //   debuff n=1 → burst 4 (round(3.8304×1)) → debuff n=2 → burst 8 (round(3.8304×2))
  //   → debuff n=3 → burst 11 (round(3.8304×3)) → debuff n=4 (ไฟต์จบก่อนหมัดถัดไป ชนะฝั่ง A รอบที่ 4)
  // ยืนยันจำนวน event ให้ตรงกับที่สังเกตได้จริง กันไม่ให้สูตรข้างบน "ผ่านโดยบังเอิญ" เพราะไม่มีอะไรให้เช็คเลย
  assert.equal(tagEvents.length, 4)
  assert.equal(boomChecked, 3)
  assert.equal(realHits.length, 4)
})

// ── runOnKill: ต้องยิงครั้งเดียวต่อการฆ่าหนึ่งครั้ง (บั๊กเดิม: เรียกซ้ำเมื่อศัตรูยังเหลือ) ──
// 🔧 P2c-1 Task 4: ทีเร็กซ์ย้าย hook ไป onAnyDeath แล้ว (ยิงจาก strike() ก่อนบรรทัด log 'attack' จะถูกันซะอีก
//    ไม่ใช่จากลูป runOnKill ใต้ hit() อีกต่อไป) และไม่มีเพ็ทจริงตัวไหนเหลือ onKill+stackAtk ให้ยืมร่างแล้ว
//    (27 ก.ย. 2026: kirin ย้ายไป windup แล้ว ไม่มีเพ็ทจริงถือ onKill เลย) — 3 เทสนี้จึงเปลี่ยนมาใช้ __slayer สังเคราะห์
//    (ค่าค่าเดิมของทีเร็กซ์ทุกประการ) เพื่อให้ยังยิงผ่าน onKill จริง ไม่งั้นเทสจับบั๊กของ Task 1 จะเงียบไปเฉยๆ
// ⚠️ เทสนี้ (ของบรีฟฉบับแรก) ไม่ discriminate บั๊ก: เพดาน __slayer.stackAtk.max=3 บังเอิญเท่ากับจำนวน
//    ศัตรู (3 ตัว) พอดี ⇒ ต่อให้ยิงซ้ำจริง ค่าที่ push ออกมาก็ยังไล่ 1,2,3 ไม่ซ้ำกันเอง (assert แรกผ่าน
//    เสมอ) และเพดานเองก็กันไม่ให้จำนวน event เกิน deaths อยู่แล้ว (assert สองผ่านเสมอ) — วัดจริงแล้ว:
//    ทั้งก่อนและหลังแก้บั๊ก ได้ amounts=[1,2,3] เหมือนกันเป๊ะ เทสนี้จึงพิสูจน์ได้แค่ "ค่าที่บันทึกไว้ไม่ลดลง/
//    ไม่ซ้ำกันเอง" เท่านั้น ไม่ได้พิสูจน์ว่า runOnKill ถูกเรียกกี่ครั้งต่อการตาย — เก็บไว้เป็นสมอกันเลขเพี้ยน
//    แบบอื่น แต่ตัวที่จับบั๊กจริงคือเทสถัดไป
test('runOnKill: ล้มศัตรู 1 ตัว = ได้ชั้นเดียว ไม่ใช่สองชั้น', () => {
  PET_PASSIVES.__slayer = {
    name: 'ทดสอบนักล่า', icon: '🧪',
    parts: [{ hook: 'onKill', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 4, max: 0 } }],
    desc: 'ล้ม 1 ตัว +{pct}% (สะสม {max})', short: 'ล้ม 1 ตัว +{pct}% (สะสม {max})',
  }
  try {
    const strong = { id: '__slayer', rarity: 'legendary', element: 'fist', grade: 5 }
    const weak = { id: '__blank__', rarity: 'common', element: 'scissors', grade: 0 }
    const r = simulateBattle([strong], [weak, weak, weak], 999)
    const stacks = r.log.filter(e => e.t === 'passive' && e.effect === 'stackAtk')
    const amounts = stacks.map(e => e.amount)
    // ชั้นต้องไต่ทีละ 1 ต่อการตายหนึ่งครั้ง ห้ามมี 1,2 ติดกันจากศพเดียว
    assert.deepEqual(amounts, [...new Set(amounts)], `ชั้นซ้ำ = ยิงซ้ำ: ${amounts}`)
    const deaths = r.log.filter(e => e.t === 'attack' && e.dead).length
    assert.ok(stacks.length <= deaths, `${stacks.length} ชั้น จากการตาย ${deaths} ครั้ง`)
  } finally { delete PET_PASSIVES.__slayer }
})

// ── ตัวที่จับบั๊กจริง: เดินไล่ log ทีละ event นับ stackAtk ที่โผล่ "หลัง attack ที่ dead:true"
//    ก่อนถึง attack ครั้งถัดไป — ต้องไม่เกิน 1 เสมอ ไม่ว่าเพดานจะซ้อนกับจำนวนศัตรูพอดีหรือไม่ ──
test('runOnKill: การตายหนึ่งครั้งต้องได้ชั้นไม่เกินหนึ่ง (ของเดิมยิงซ้ำ 2 ครั้งต่อศพ)', () => {
  PET_PASSIVES.__slayer = {
    name: 'ทดสอบนักล่า', icon: '🧪',
    parts: [{ hook: 'onKill', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 4, max: 0 } }],
    desc: 'ล้ม 1 ตัว +{pct}% (สะสม {max})', short: 'ล้ม 1 ตัว +{pct}% (สะสม {max})',
  }
  try {
    const strong = { id: '__slayer', rarity: 'legendary', element: 'fist', grade: 5 }
    const weak = { id: '__blank__', rarity: 'common', element: 'scissors', grade: 0 }
    const r = simulateBattle([strong], [weak, weak, weak], 999)
    let sinceDeath = -1, worst = 0
    for (const e of r.log) {
      if (e.t === 'attack') { if (sinceDeath >= 0) worst = Math.max(worst, sinceDeath); sinceDeath = e.dead ? 0 : -1 }
      else if (sinceDeath >= 0 && e.t === 'passive' && e.effect === 'stackAtk') sinceDeath += 1
    }
    worst = Math.max(worst, Math.max(0, sinceDeath))
    assert.equal(worst, 1, 'ศพเดียวต้องให้ชั้นเดียว — ได้มากกว่านั้นแปลว่า runOnKill ยิงซ้ำ')
  } finally { delete PET_PASSIVES.__slayer }
})

test('runOnKill: หมัดที่ปิดไฟต์ก็ต้องได้ชั้น (บรรทัดใต้ลูปเป็นตัวเดียวที่ยิงให้มัน)', () => {
  PET_PASSIVES.__slayer = {
    name: 'ทดสอบนักล่า', icon: '🧪',
    parts: [{ hook: 'onKill', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 4, max: 0 } }],
    desc: 'ล้ม 1 ตัว +{pct}% (สะสม {max})', short: 'ล้ม 1 ตัว +{pct}% (สะสม {max})',
  }
  try {
    const strong = { id: '__slayer', rarity: 'legendary', element: 'fist', grade: 5 }
    const weak = { id: '__blank__', rarity: 'common', element: 'scissors', grade: 0 }
    const r = simulateBattle([strong], [weak], 4242)          // ศัตรูตัวเดียว = ตายทีเดียวจบ
    assert.equal(r.winner, 'A')
    const stacks = r.log.filter(e => e.t === 'passive' && e.effect === 'stackAtk')
    assert.equal(stacks.length, 1, 'หมัดปิดเกมต้องได้ชั้น 1 ชั้น')
  } finally { delete PET_PASSIVES.__slayer }
})

// ── บาลานซ์รอบ 1 Task 5 (27 ก.ย. 2026): 🦖 ทีเร็กซ์ย้ายจาก onAnyDeath+stackAtk (เพดาน 3, start 1)
//    ไปเป็น onAttack+hunt (ไม่มีเพดาน, start 1) — initHunt() แทนที่บล็อกชั้นตั้งต้นเดิมใน runSetup
//    เพราะต้องรันหลัง aura ทั้งหมด (ดูคอมเมนต์ยาวใน battlePassives.js initHunt())
test('ทีเร็กซ์เข้าไฟต์ด้วย 2 ชั้นและแรงขึ้นทันที (initHunt หลัง aura)', () => {
  const t = u('trex')
  const base = t.atk
  initHunt([t])
  assert.equal(psOf(t).huntStacks, 1, 'ต้องได้ 1 ชั้นฟรีตอนเข้าไฟต์')
  assert.ok(Math.abs(t.atk / base - 1.2) < 1e-9, `atk ต้อง × 1.2 พอดี (ได้ ${t.atk / base})`)
})

test('ทีเร็กซ์ไม่มีเพดานอีกต่อไป — สะสมได้เรื่อยๆ ทุกหมัดของตัวเอง', () => {
  const t = u('trex')
  const base = t.atk
  const foe = u('mouse', { uid: 'B0', side: 'B' })
  initHunt([t])
  for (let i = 0; i < 10; i++) runOnAttack(t, foe, [foe], () => 0.5)
  assert.equal(psOf(t).huntStacks, 11, '1 ชั้นตั้งต้น + 10 หมัด = 11 ชั้น ไม่มีเพดานมาหยุด')
  assert.ok(Math.abs(t.atk / base - (1 + 11 * 0.2)) < 1e-9,
    `บวกจากฐานทุกชั้น ไม่ทบต้น (ได้ ${(t.atk / base - 1) * 100}% ควรได้ ${11 * 20}%)`)
})

test('initHunt ไม่ยิง event ให้ชั้นแถม — เป็นสเตตัสตั้งต้น ไม่ใช่โมเมนต์', () => {
  assert.equal(initHunt([u('trex')]), undefined,
    'ถ้ายิง event จะได้ป้ายที่เลขบนจอไม่ขยับตาม (statsSnapshot หลัง initHunt แบกค่านี้ไปแล้ว)')
})

test('initHunt: เพ็ทที่ไม่มี hunt part ไม่ได้อะไร (ยามกันเผลอแจกทั้งเกม)', () => {
  const o = u('ouroboros')
  const base = o.atk
  initHunt([o])
  assert.equal(psOf(o).huntBase, undefined)
  assert.equal(o.atk, base)
})

// ── P2c-2 หนี้ §7.6 ข้อ 8: ช่องว่างเทสที่รู้ตัว ─────────────────────────────
test('อูโรโบรอสตันที่ 4 ชั้น ไม่ไต่ต่อไม่รู้จบ (หนี้ §7.6 ข้อ 8)', () => {
  const o = u('ouroboros')
  const base = o.atk
  for (let i = 0; i < 10; i++) runOnRound([o])
  assert.equal(psOf(o).atkStacks, 4, 'เพดาน 4 ชั้นตาม value.max ของ part rage')
  assert.ok(Math.abs(o.atk / base - 1.10 ** 4) < 1e-9,
    `atk ขึ้นแค่ 4 ชั้น (ได้ ${o.atk / base} ต้องได้ ${1.10 ** 4})`)
})

test('เพ็ทสอง part นับเป็นจังหวะเดียว — part แรกต้องเงียบ (หนี้ §7.6 ข้อ 8)', () => {
  // 🐍 อูโรโบรอสเป็นเพ็ทหลาย part ตัวแรกของเกม (regenSelf + stackAtk ทุกต้นรอบ)
  // เดิมกฎนี้ตรวจด้วยสคริปต์ inline ตอนพัฒนา — ย้ายมาเป็นเทสถาวรตามหนี้ที่บันทึกไว้
  const r = simulateBattle([{ id: 'ouroboros', rarity: 'legendary', element: 'fist', grade: 3 }],
                           [{ id: 'mouse', rarity: 'common', element: 'fist', grade: 0 }], 3)
  const mh = Object.fromEntries(Object.entries(r.units).map(([uid, s]) => [uid, Math.round(s.maxHp) || 1]))
  const bs = buildBeats(r.log, mh)

  let checked = 0
  for (let i = 0; i < bs.length - 1; i++) {
    const a = bs[i], b = bs[i + 1]
    if (a.t !== 'passive' || b.t !== 'passive') continue
    if (a.uid !== b.uid || a.effect === b.effect) continue   // ใบซ้ำของ effect เดียวกันคนละเรื่อง
    checked++
    assert.equal(beatDuration(a), 0,
      `part แรกของเพ็ทตัวเดียวต้องเงียบ ไม่งั้นได้ ${beatDuration(a)}ms × จำนวน part (ใบสุดท้ายถือเวลาหยุด)`)
  }
  assert.ok(checked > 0, 'ไม่เจอเพ็ทสอง part ยิงติดกันในไฟต์นี้เลย — เทสไม่ได้ทดสอบอะไร (เปลี่ยนซีด)')
})

test('🦁 สิงโต: ครบ 3 สายได้บัฟทั้งทีม · ขาดสายเดียวไม่ได้อะไรเลย', () => {
  const mk = () => [
    u('lion',  { uid: 'A0', element: 'fist',     atk: 100, maxHp: 1000, hp: 1000 }),
    u('fox',   { uid: 'A1', element: 'scissors', atk: 100, maxHp: 1000, hp: 1000 }),
    u('panda', { uid: 'A2', element: 'paper',    atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  const full = mk()
  applyAuras(full, [])
  assert.equal(Math.round(full[0].atk), 112)    // 12% (ขึ้นจาก 10% ตามเมต้าซิม 27 ก.ย. 2026)
  assert.equal(Math.round(full[1].maxHp), 1120)
  assert.equal(full[1].hp, full[1].maxHp)          // เลือดเต็มหลอดใหม่

  const missing = [mk()[0], mk()[1], u('hedgehog', { uid: 'A2', element: 'fist', atk: 100, maxHp: 1000, hp: 1000 })]
  applyAuras(missing, [])
  assert.equal(missing[0].atk, 100)
  assert.equal(missing[2].maxHp, 1000)
})

test('🦁 สิงโต: บัฟไม่หายเมื่อเพื่อนต่างสายตายกลางไฟต์ (aura คิดครั้งเดียวตอนเริ่ม)', () => {
  const team = [
    u('lion',  { uid: 'A0', element: 'fist',     atk: 100, maxHp: 1000, hp: 1000 }),
    u('fox',   { uid: 'A1', element: 'scissors', atk: 100, maxHp: 1000, hp: 1000 }),
    u('panda', { uid: 'A2', element: 'paper',    atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  applyAuras(team, [])
  const atkAfterAura = team[0].atk
  team[2].hp = 0                                    // เพื่อนสายพิทักษ์ตาย
  assert.equal(team[0].atk, atkAfterAura)           // ตั้งใจ — เหมือน aura ตัวอื่นทั้งหมด
})

test('👾 ไวรัส: ชั้นขึ้นจากหมัดไวรัสเท่านั้น · ไม่มีเพดาน · เพื่อนตีก็ระเบิด · ทะลุทุกสายลด', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const mate  = u('blank', { uid: 'A1', atk: 100 })
  const foe   = u('panda', { uid: 'B0', side: 'B', element: 'paper', atk: 10, maxHp: 1000, hp: 1000 })

  // เพื่อนตีก่อน: ยังไม่มีเชื้อ ⇒ ไม่มีชั้น ไม่มีระเบิด
  const first = runOnHit(foe, 50, mate, [foe], () => 0.99)
  assert.equal(first.pierce, 0)
  assert.equal(psOf(foe).infect, undefined)

  for (let i = 0; i < 7; i++) runOnHit(foe, 50, virus, [foe], () => 0.99)
  assert.equal(psOf(foe).infect.n, 7)               // ไม่จำกัดชั้นแล้ว (29 ก.ย. 2026 แอนตี้ทีมถึก)

  const res = runOnHit(foe, 50, mate, [foe], () => 0.99)
  assert.equal(Math.round(res.pierce), 70)          // 7 ชั้น × 10% ของ atk ไวรัส (100)
  assert.equal(psOf(foe).infect.n, 7)               // เชื้อไม่หายตอนระเบิด
  const burst = res.events.find(e => e.effect === 'infectBurst')
  assert.ok(burst, 'ต้องมี event ระเบิดให้จอเล่า')
  assert.deepEqual(burst.targets, ['B0'])
})

test('👾 ไวรัส: ดาเมจเชื้อไม่ถูกหักด้วยสายลดของเป้า (pierce แยกช่องจาก dmg)', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const foe   = u('panda', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000, teamDrPct: 90 })
  runOnHit(foe, 100, virus, [foe], () => 0.99)      // ชั้นที่ 1
  const res = runOnHit(foe, 100, virus, [foe], () => 0.99)
  assert.ok(res.dmg < 100, 'หมัดหลักต้องถูกลดตามปกติ')
  assert.equal(Math.round(res.pierce), 10)          // 1 ชั้น × 10% — ไม่โดนลด 90% ด้วย
})

test('🦍 กอริลลา: ท้าชนดึงเป้ามาที่ตัวเอง และมาก่อน targetLowest ของกริฟฟิน', () => {
  const gori = u('gorilla', { uid: 'B0', side: 'B', hp: 900, maxHp: 1000 })
  const weak = u('blank',   { uid: 'B1', side: 'B', hp: 10,  maxHp: 1000 })
  assert.equal(tauntTargetOf([gori, weak])?.uid, 'B0')

  // ลำดับ taunt > targetLowest: กริฟฟินต้อง "ไม่เปลี่ยนเป้า" เมื่อมีตัวท้าชนอยู่
  // (เอนจินเลือกเป้าด้วย tauntTargetOf ก่อนเรียก runOnAttack — ถ้ากริฟฟินยัง override
  //  มันจะลากเป้ากลับไปที่ตัวเลือดน้อย แล้วกฎลำดับในสเปกจะไม่มีผลจริง)
  // ลำดับ taunt > targetLowest: เอนจินเลือกเป้าด้วย tauntTargetOf ก่อนเรียก runOnAttack
  // กริฟฟินต้อง "ไม่ลากเป้ากลับ" ไปที่ตัวเลือดน้อย ไม่งั้นกฎลำดับในสเปกจะไม่มีผลจริง
  const griffin = u('simurgh', { uid: 'A0' })
  const taunted = runOnAttack(griffin, gori, [gori, weak], () => 0.5)
  assert.equal(taunted.target.uid, 'B0', 'ถูกท้าชนอยู่ ห้ามลากไปเล็งตัวเลือดน้อย')
  // targetLowest ห้ามยิง event เล็งเป้าตอนถูกท้าชน — แต่ woundBonus (Task 3) ยังทำงานกับเป้าที่ถูกบังคับได้ตามปกติ
  // (gori เลือดหาย 10% ⇒ ยังได้ event โบนัสดาเมจ 1 อัน แค่ไม่มี event "เปลี่ยนเป้า")
  assert.equal(taunted.events.length, 1, 'ต้องมีแค่ event ของ woundBonus ไม่มี event เล็งเป้า')
  assert.equal(taunted.events[0].effect, 'woundBonus')

  // ไม่มีตัวท้าชนแล้ว กริฟฟินถึงจะลากไปที่ตัวเลือดน้อยตามปกติ
  const plump = u('blank', { uid: 'B2', side: 'B', hp: 900, maxHp: 1000 })
  const freeAim = runOnAttack(griffin, plump, [plump, weak], () => 0.5)
  assert.equal(freeAim.target.uid, 'B1')
})

test('🦍 กอริลลา: กอริลลาสองตัวในทีมเดียว ตัวช่องซ้ายสุดชนะเสมอ (replay ต้องตรง)', () => {
  const g0 = u('gorilla', { uid: 'B0', side: 'B' })
  const g1 = u('gorilla', { uid: 'B1', side: 'B' })
  assert.equal(tauntTargetOf([g0, g1]).uid, 'B0')
  assert.equal(tauntTargetOf([g1, g0]).uid, 'B1')   // ลำดับในทีมคือคำตอบ ไม่ใช่การสุ่ม
})

test('🦍 กอริลลา: หมัดที่ถูกดึงมาเจ็บน้อยลง · โดนตีแล้วสะสมพลังไม่มีเพดาน', () => {
  const gori = u('gorilla', { uid: 'B0', side: 'B', atk: 100, hp: 1000, maxHp: 1000 })
  const att  = u('blank',   { uid: 'A0', atk: 100 })

  const forced = runOnHit(gori, 100, att, [gori], () => 0.99, true)
  assert.equal(Math.round(forced.dmg), 75)          // ลด 25% เฉพาะหมัดที่ถูกบังคับ
  assert.equal(psOf(gori).rage, 1)
  assert.equal(Math.round(gori.atk), 103)           // +3% ต่อครั้งที่โดน

  const free = runOnHit(gori, 100, att, [gori], () => 0.99, false)
  assert.equal(Math.round(free.dmg), 100)           // ไม่ได้ถูกดึงมา = ไม่ลด
  assert.equal(psOf(gori).rage, 2)

  for (let i = 0; i < 20; i++) runOnHit(gori, 100, att, [gori], () => 0.99, false)
  assert.equal(psOf(gori).rage, 22)                 // ไม่มีเพดาน (user ยืนยัน)
})

test('🐗 หมูป่า: ดาเมจบวกตาม % เลือดที่หายไปแบบ 1:1', () => {
  const foe = u('blank', { uid: 'B0', side: 'B', maxHp: 1000, hp: 1000 })
  const mult = (hp) => {
    const boar = u('boar', { uid: 'A0', hp, maxHp: 100, atk: 10 })
    return Math.round(runOnAttack(boar, foe, [foe], () => 0.5).atkMult * 100) / 100
  }
  assert.equal(mult(100), 1)      // เลือดเต็ม = ไม่ได้อะไร
  assert.equal(mult(40), 1.6)     // หาย 60% = +60%
  assert.equal(mult(10), 1.9)     // หาย 90% = +90%
})

test('🐗 หมูป่า: เลือดเต็ม = ไม่มี event ให้จอเล่า', () => {
  const boar = u('boar', { uid: 'A0', hp: 100, maxHp: 100, atk: 10 })
  const foe  = u('blank', { uid: 'B0', side: 'B', maxHp: 1000, hp: 1000 })
  assert.equal(runOnAttack(boar, foe, [foe], () => 0.5).events.length, 0)
})

test('🦡 แบดเจอร์: เป้าเลือดสูงสุดมากกว่าเรา = แรงขึ้นเท่ากันเสมอ', () => {
  const badger = u('badger', { uid: 'A0', maxHp: 500, hp: 500, atk: 10 })
  const foe = (maxHp) => u('blank', { uid: 'B0', side: 'B', maxHp, hp: maxHp })
  const mult = (maxHp) => Math.round(runOnAttack(badger, foe(maxHp), [foe(maxHp)], () => 0.5).atkMult * 100) / 100
  assert.equal(mult(499), 1)
  assert.equal(mult(500), 1)
  assert.equal(mult(501), 1.3)
  assert.equal(mult(5000), 1.3)
})

test('🦡 แบดเจอร์: ทะเบียนต้องไม่มีคีย์ max หลงเหลือ (สัญญาเปลี่ยนแล้วตั้งแต่ 10 ก.ย.)', () => {
  const part = partsOf(PET_PASSIVES.badger)[0]
  assert.equal(part.value.max, undefined)
  assert.equal(part.step.max, undefined)
})

test('🦇 ค้างคาว: ทั้งทีมดูดเลือดตามดาเมจที่ตัวเองทำได้ (รวมค้างคาวเอง)', () => {
  const team = [
    u('bat',   { uid: 'A0', maxHp: 1000, hp: 500 }),
    u('blank', { uid: 'A1', maxHp: 1000, hp: 500 }),
  ]
  applyAuras(team, [])
  assert.equal(team[0].lifestealPct, 10)
  assert.equal(team[1].lifestealPct, 10)

  const out = runOnDealt(team[1], team, 100)
  assert.equal(team[1].hp, 510)                     // 10% ของดาเมจ 100
  const e = out.events.find(x => x.effect === 'teamLifesteal')
  assert.ok(e && e.fxKind === 'heal')
  assert.deepEqual(e.targets, ['A1'])
})

test('🦇 ค้างคาว: เลือดเต็มแล้วไม่ล้นหลอด และไม่มี event หลอกตา', () => {
  const team = [u('bat', { uid: 'A0', maxHp: 1000, hp: 1000 })]
  applyAuras(team, [])
  const out = runOnDealt(team[0], team, 100)
  assert.equal(team[0].hp, 1000)
  assert.equal(out.events.filter(e => e.effect === 'teamLifesteal').length, 0)
})

test('🦣 แมมมอธ: เกราะกันหมัดทั้งดอกแล้วสะท้อน · หมดสแตคแล้วรับปกติ', () => {
  const mam = u('mammoth', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000 })
  const att = u('blank',   { uid: 'A0', atk: 100 })

  const a = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(a.dmg, 0)                            // กันทั้งหมัด ไม่ใช่โล่ที่มีค่าเลือด
  assert.equal(Math.round(a.reflect), 25)           // สะท้อน 25% ของหมัดนั้น (ลดจาก 50% ตามเมต้าซิม 27 ก.ย. 2026)
  assert.equal(a.events.find(e => e.effect === 'armorStack').armorLeft, 1)

  const b = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(b.dmg, 0)
  assert.equal(b.events.find(e => e.effect === 'armorStack').armorLeft, 0)

  const c = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(c.dmg, 100)                          // สแตคหมด = รับเต็ม ไม่มีการเติมกลางไฟต์
  assert.equal(c.reflect, 0)
})

test('🦣 แมมมอธ: หมัดที่ดาเมจเหลือ 0 อยู่แล้ว ห้ามกินสแตคเกราะฟรี', () => {
  const mam = u('mammoth', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000 })
  const att = u('blank',   { uid: 'A0', atk: 100 })
  runOnHit(mam, 0, att, [mam], () => 0.99)
  const after = runOnHit(mam, 100, att, [mam], () => 0.99)
  assert.equal(after.events.find(e => e.effect === 'armorStack').armorLeft, 1)  // ยังเหลือ 1 = ใบแรกไม่ได้กิน
})

test('🦣 แมมมอธ: เกราะที่โดนหมัดสวนของฟีนิกซ์ยังสะท้อนได้จริงในไฟต์จริง (ธง countering ไม่บล็อก)', () => {
  // เกรดต่างกันมากโดยตั้งใจ — ต้องให้แมมมอธ "ฆ่าฟีนิกซ์ได้ตั้งแต่ยังไม่เสียสแตคเกราะ"
  // ถ้าเกรดเท่ากัน ฟีนิกซ์จะทุบเกราะหมดสองชั้นก่อนตาย แล้วหมัดสวนจะไม่มีเกราะให้ชน = เทสไม่พิสูจน์อะไร
  const phoenix = [{ id: 'phoenix', rarity: 'legendary', element: 'scissors', grade: 0 }]
  const mammoth = [{ id: 'mammoth', rarity: 'legendary', element: 'paper', grade: 5 }]
  let found = false
  for (let seed = 1; seed <= 300 && !found; seed++) {
    const log = simulateBattle(phoenix, mammoth, seed).log
    const revive = log.findIndex(e => e?.t === 'passive' && e.effect === 'revive')
    if (revive < 0) continue
    found = log.slice(revive).some(e => e?.t === 'passive' && e.effect === 'armorStack' && e.amount > 0)
  }
  assert.ok(found, 'ไม่เจอไฟต์ที่เกราะสะท้อนหลังหมัดสวนเลย — ธง countering อาจบล็อกอยู่')
})

test('🐢 เต่า: ทั้งทีมลดดาเมจ · ตัวเต่าเองได้สองเท่า', () => {
  const team = [
    u('turtle', { uid: 'A0', element: 'paper' }),
    u('blank',  { uid: 'A1' }),
  ]
  applyAuras(team, [])
  // 15% (ขึ้นจาก 10% ตามเมต้าซิม 27 ก.ย. 2026)
  assert.equal(team[0].teamDrPct, 30)                // เจ้าของ 2 เท่า
  assert.equal(team[1].teamDrPct, 15)

  const att = u('blank', { uid: 'B0', side: 'B', atk: 100 })
  assert.equal(Math.round(runOnHit(team[0], 100, att, team, () => 0.99).dmg), 70)
  assert.equal(Math.round(runOnHit(team[1], 100, att, team, () => 0.99).dmg), 85)
})

test('🐭 หนู: ขโมยพลังและเลือดจากศัตรูทุกตัวตอนเริ่มไฟต์ · ศัตรูเสียจริง', () => {
  const me   = [u('mouse', { uid: 'A0', atk: 100, maxHp: 1000, hp: 1000 })]
  const foes = [
    u('blank', { uid: 'B0', side: 'B', atk: 200, maxHp: 2000, hp: 2000 }),
    u('blank', { uid: 'B1', side: 'B', atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  runSetup(me, foes)
  // 5% (ขึ้นจาก 3% ตามเมต้าซิม 27 ก.ย. 2026)
  assert.equal(Math.round(foes[0].atk), 190)        // เสียไป 5%
  assert.equal(Math.round(foes[1].maxHp), 950)
  assert.equal(Math.round(me[0].atk), 115)          // ได้ 10 + 5
  assert.equal(Math.round(me[0].maxHp), 1150)
  assert.equal(me[0].hp, me[0].maxHp)               // ได้เลือดมาเต็มก้อนที่ขโมยได้
})

test('🐭 หนู: เลือดปัจจุบันของศัตรูห้ามล้นหลอดที่หดลง', () => {
  const me   = [u('mouse', { uid: 'A0', atk: 100, maxHp: 1000, hp: 1000 })]
  const foes = [u('blank', { uid: 'B0', side: 'B', atk: 100, maxHp: 1000, hp: 1000 })]
  runSetup(me, foes)
  assert.ok(foes[0].hp <= foes[0].maxHp)
})

test('🐭 หนู: ขโมยก่อนออร่าเสมอ — สิงโตคูณจากเลขหลังถูกขโมยแล้ว', () => {
  // element ของยูนิตในเทสตั้งได้อิสระ (applyAuras อ่านจากตัวละคร ไม่ได้อ่านจากคลัง)
  const A = [
    u('mouse', { uid: 'A0', element: 'fist',     atk: 100, maxHp: 1000, hp: 1000 }),
    u('fox',   { uid: 'A1', element: 'scissors', atk: 100, maxHp: 1000, hp: 1000 }),
    u('lion',  { uid: 'A2', element: 'paper',    atk: 100, maxHp: 1000, hp: 1000 }),
  ]
  const B = [u('blank', { uid: 'B0', side: 'B', atk: 100, maxHp: 1000, hp: 1000 })]
  runSetup(A, B)
  applyAuras(A, B)
  assert.equal(Math.round(A[0].atk), 118)           // (100 + 5) × 1.12 (mouse 5% ↑ / lion 12% ↑ ตามเมต้าซิม 27 ก.ย. 2026)
})

test('🦄 ยูนิคอร์น: ตีแล้วฟื้นเพื่อนที่บอบช้ำสุดตามดาเมจจริง (ไม่ใช่ต้นรอบอีกแล้ว)', () => {
  const uni  = u('unicorn', { uid: 'A0', maxHp: 1000, hp: 1000 })
  const hurt = u('blank',   { uid: 'A1', maxHp: 1000, hp: 300 })
  const ok   = u('blank',   { uid: 'A2', maxHp: 1000, hp: 900 })
  const out = runOnDealt(uni, [uni, hurt, ok], 100)
  assert.equal(hurt.hp, 320)                        // 20% ของดาเมจ 100
  assert.equal(ok.hp, 900)
  const e = out.events.find(x => x.effect === 'healOnAttack')
  assert.ok(e && e.fxKind === 'heal')
  assert.deepEqual(e.targets, ['A1'])

  // ไม่ทำงานที่ต้นรอบอีกแล้ว
  assert.equal(runOnRound([uni, hurt, ok]).filter(x => x.effect === 'healLowestAlly').length, 0)
})

test('🦄 + 🦇 ในทีมเดียวกัน: สองผลนี้ต้องได้ event ของตัวเองครบ ไม่มีใบไหนถูกกลืน', () => {
  // สเปก §9 ข้อ 8 — หนี้ P2 §7.4 ข้อ 7 เตือนว่าถ้าสองผลนี้ยิงบน uid เดียวกันติดกัน กฎจังหวะจะปิดเสียงใบแรก
  // วันนี้เป็นคนละเพ็ท (uid ต่างกัน) จึงยังไม่ชน — เทสนี้คือตัวที่จะแดงทันทีถ้าวันหน้ามีเพ็ทถือทั้งคู่
  // ยูนิคอร์นต้องเลือดพร่องด้วย ไม่งั้นก้อนดูดเลือดของตัวเองฟื้นไม่ได้ = ไม่มี event (ถูกแล้ว ไม่ใช่บั๊ก)
  const uni  = u('unicorn', { uid: 'A0', maxHp: 1000, hp: 800 })
  const bat  = u('bat',     { uid: 'A1', maxHp: 1000, hp: 500 })
  const hurt = u('blank',   { uid: 'A2', maxHp: 1000, hp: 300 })
  const team = [uni, bat, hurt]
  applyAuras(team, [])
  const out = runOnDealt(uni, team, 100)
  const kinds = out.events.map(e => e.effect)
  assert.ok(kinds.includes('healOnAttack'), 'ผลของยูนิคอร์นหาย')
  assert.ok(kinds.includes('teamLifesteal'), 'ผลดูดเลือดของค้างคาวหาย')
  assert.equal(new Set(out.events.map(e => `${e.uid}:${e.effect}`)).size, out.events.length)
})

// ── เลขดาเมจเชื้อแยกชั้น (ของฝั่งจอ — user สั่ง 11 ก.ย. 2026) ─────────────
test('👾 ไวรัส: pierceHits แตกชั้นละก้อน · จำนวนก้อน = จำนวนชั้น · ผลรวม = amount เป๊ะ', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const foe   = u('panda', { uid: 'B0', side: 'B', element: 'paper', atk: 10, maxHp: 4000, hp: 4000 })
  for (let i = 0; i < 3; i++) runOnHit(foe, 50, virus, [foe], () => 0.99)
  assert.equal(psOf(foe).infect.n, 3)

  const res = runOnHit(foe, 50, virus, [foe], () => 0.99)
  const burst = res.events.find(e => e.effect === 'infectBurst')
  assert.equal(burst.stacks, 3)
  assert.equal(burst.hits.length, 3, '3 ชั้น = 3 ก้อนบนจอ')
  assert.deepEqual(res.pierceHits, burst.hits, 'เอนจินหยิบจาก res ไปแปะบนใบ attack — ต้องเป็นชุดเดียวกัน')
  assert.equal(burst.hits.reduce((s, n) => s + n, 0), burst.amount,
    'ผลรวมบนจอต้องเท่ากับดาเมจเชื้อจริง ไม่งั้นเลขหลัก+เลขย่อยจะไม่ตรงกับเลือดที่หาย')
  assert.equal(burst.amount, Math.round(res.pierce))
})

test('👾 ไวรัส: ปัดเศษแบบสะสม — ทุกชั้นต้องรวมได้เท่ายอดเดิมแม้หารไม่ลงตัว', () => {
  const virus = u('virus', { uid: 'A0', atk: 33, hp: 1000 })     // 10% ของ 33 = 3.3 ต่อชั้น
  const foe   = u('panda', { uid: 'B0', side: 'B', element: 'paper', atk: 10, maxHp: 9000, hp: 9000 })
  for (let i = 0; i < 5; i++) runOnHit(foe, 10, virus, [foe], () => 0.99)
  const res = runOnHit(foe, 10, virus, [foe], () => 0.99)
  const burst = res.events.find(e => e.effect === 'infectBurst')
  assert.equal(burst.hits.length, 5)
  assert.equal(burst.hits.reduce((s, n) => s + n, 0), burst.amount)
  assert.equal(burst.amount, Math.round(33 * 0.1 * 5))            // 16.5 → 17
})

test('👾 ไวรัส: ยังไม่ติดเชื้อ = ไม่มี pierceHits ให้ใบ attack แบก (จอไม่ต้องเด้งอะไรเลย)', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const foe   = u('panda', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000 })
  const first = runOnHit(foe, 50, virus, [foe], () => 0.99)       // หมัดที่แปะชั้นแรก ยังไม่ระเบิด
  assert.deepEqual(first.pierceHits, [])
})

test('👾 ไวรัส: หลบได้ก็ยังติดเชื้อและระเบิด — ใบ attack แบก pierceHits ไปให้จอเด้งเลขย่อย', () => {
  const virus = u('virus', { uid: 'A0', atk: 100 })
  const foe   = u('fox', { uid: 'B0', side: 'B', element: 'paper', maxHp: 1000, hp: 1000 })
  runOnHit(foe, 50, virus, [foe], () => 0.99)                     // ชั้นที่ 1 (rand สูง = ไม่หลบ)
  const res = runOnHit(foe, 50, virus, [foe], () => 0)            // rand 0 = หลบแน่นอน
  assert.equal(res.dodged, true)
  assert.equal(res.dmg, 0, 'หมัดหลักไม่เข้า')
  assert.equal(res.pierceHits.length, 1, 'แต่เชื้อยังระเบิด — จอต้องมีเลขย่อยให้เห็น')
})

test('👾 ไวรัส: log ของไฟต์จริงต้องมี pierceHits บนใบ attack และรวมแล้วไม่เกินดาเมจของหมัดนั้น', () => {
  const A = [{ id: 'virus', rarity: 'legendary', element: 'fist', grade: 3 },
             { id: 'wolf',  rarity: 'epic',      element: 'fist', grade: 2 }]
  const B = [{ id: 'turtle', rarity: 'epic', element: 'paper', grade: 2 },
             { id: 'panda',  rarity: 'epic', element: 'paper', grade: 2 }]
  const { log } = simulateBattle(A, B, 4242)
  const withHits = log.filter(e => e.t === 'attack' && Array.isArray(e.pierceHits))
  assert.ok(withHits.length > 0, 'ไฟต์ที่มีไวรัสต้องมีหมัดที่แบกเลขเชื้อมาด้วย')
  for (const e of withHits) {
    assert.ok(e.pierceHits.length >= 1)
    const sum = e.pierceHits.reduce((s, n) => s + n, 0)
    assert.ok(sum <= e.dmg + 1, `เลขย่อยรวม ${sum} ต้องไม่เกินดาเมจของหมัดนั้น (${e.dmg})`)
  }
})

// ── ต.ค. 2569 ฟากฟ้า: applyForms + ☀️ rarityBoost ─────────────────────────
const U = (id, rarity, slot, side = 'A') => ({ id, rarity, slot, uid: side + slot, side, element: 'fist', atk: 10, maxHp: 100, hp: 100 })

test('rarityBoost: ☀️ ขั้นบันไดตามระดับ common +50 · rare +40 · epic +30 · ตำนาน 0 · ซอลเองไม่ได้', () => {
  const team = [U('sol', 'legendary', 0), U('cat', 'common', 1), U('lion', 'legendary', 2),
                U('__r', 'rare', 3), U('__e', 'epic', 4)]
  applyForms(team)
  applyAuras(team, [])
  assert.equal(Math.round(team[1].atk), 15)
  assert.equal(Math.round(team[1].maxHp), 150)
  assert.equal(team[1].hp, team[1].maxHp)
  assert.equal(Math.round(team[2].atk), 10, 'ตำนานไม่ได้')
  assert.equal(Math.round(team[3].atk), 14, 'rare +40%')
  assert.equal(Math.round(team[4].atk), 13, 'epic +30%')
  assert.equal(Math.round(team[0].atk), 10, 'Sol เองไม่ได้')
})

test('ร่างองศา: Earth นับเป็น common ได้บัฟ +50 + ถูกปิดฤดู', () => {
  const team = [U('sol', 'legendary', 0), U('earth', 'legendary', 1), U('lion', 'legendary', 2)]
  applyForms(team)
  applyAuras(team, [])
  assert.equal(team[1].countsAs, 'common')
  assert.equal(psOf(team[1]).formed, true)
  assert.equal(Math.round(team[1].atk), 15)
})

test('มี common ในทีม ⇒ Earth ไม่แปลงร่าง ไม่ได้บัฟ', () => {
  const team = [U('sol', 'legendary', 0), U('earth', 'legendary', 1), U('cat', 'common', 2)]
  applyForms(team)
  applyAuras(team, [])
  assert.equal(team[1].countsAs, undefined)
  assert.equal(Math.round(team[1].atk), 10)
})

test('ลูน่า: หมัดวน 75 → 200 → 325 → 75', () => {   // เดิม 75/125/175 ตามเมต้าซิม 27 ก.ย. 2026
  const luna = U('luna', 'legendary', 0)
  const foe = U('x', 'common', 0, 'B')
  const got = [0, 1, 2, 3].map(() => runOnAttack(luna, foe, [foe], () => 0.99))
  assert.deepEqual(got.map(r => Math.round(r.atkMult * 100)), [75, 200, 325, 75])
  assert.equal(got[2].events[0].effect, 'fullMoon')
  assert.equal(got[0].events[0].effect, 'moonPhase')
})

// ── ต.ค. 2569 ฟากฟ้า: 🌍 ฤดูกาลตอนจบรอบ (Task 5) ─────────────────────────
test('ฤดูร้อน (ช่อง 0): จบรอบ → รอบหน้าหมัดแรง +20%', () => {
  const team = [U('earth', 'legendary', 0), U('cat', 'common', 1)]
  const out = runOnRoundEnd(team, [], () => 0)
  assert.equal(out[0].effect, 'seasonHot')
  runOnRound(team)                                  // ต้นรอบถัดไป: hotNext → hotActive
  const r = runOnAttack(team[1], U('x', 'common', 0, 'B'), [U('x', 'common', 0, 'B')], () => 0.99)
  assert.equal(Math.round(r.atkMult * 100), 120)
})

test('ฤดูฝน (ช่อง 1): ฟื้น 12% ของเลือดที่หาย · event ต่อเป้า', () => {   // ลดจาก 25% ตามเมต้าซิม 27 ก.ย. 2026
  const team = [U('cat', 'common', 0), U('earth', 'legendary', 1)]
  team[0].hp = 60                                   // หาย 40 → ฟื้น 4.8
  const out = runOnRoundEnd(team, [], () => 0)
  const e = out.find(x => x.targets[0] === 'A0')
  assert.equal(e.effect, 'seasonRain')
  assert.equal(team[0].hp, 64.8)
  assert.equal(e.hpPct, 65)          // hpPct ปัดเศษเป็น % แสดงผล ต่างจาก hp ดิบที่ไม่ปัด
})

test('ฤดูหนาว (ช่อง 2): rand < 30% → ศัตรูได้ skip 1', () => {
  const team = [U('cat', 'common', 0), U('lion', 'legendary', 1), U('earth', 'legendary', 2)]
  const foes = [U('a', 'common', 0, 'B'), U('b', 'common', 1, 'B')]
  const rolls = [0.1, 0.9]
  const out = runOnRoundEnd(team, foes, () => rolls.shift())
  assert.equal(foes[0].ps.skip, 1)
  assert.ok(!foes[1].ps?.skip)
  assert.deepEqual(out[0].targets, ['B0'])
})

test('ร่างองศา: ไม่มีฤดู', () => {
  const team = [U('sol', 'legendary', 0), U('earth', 'legendary', 1)]
  applyForms([...team, U('lion', 'legendary', 2)])
  assert.deepEqual(runOnRoundEnd(team, [], () => 0), [])
})
