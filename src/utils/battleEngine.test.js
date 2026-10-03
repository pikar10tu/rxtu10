import { test } from 'node:test'
import assert from 'node:assert/strict'
import { simulateBattle } from './battleEngine.js'
import { buildCombatant, BATTLE_CFG } from '../data/battle.js'
import { PET_PASSIVES } from '../data/petPassives.js'

// 🔑 ตัวประกอบในเทสไฟต์จริงใช้ `id: 'blank'` (เพ็ทที่ไม่มีพาสสีฟ) โดยตั้งใจ — เดิมใช้ 🐭 หนู
//    ซึ่ง P3a เปลี่ยนให้ขโมยสเตตัสตอนเริ่มไฟต์ ⇒ "ตัวประกอบ" กลายเป็นตัวแปรของไฟต์ทันที
//    เพ็ทจริงทุกตัวมีพาสสีฟหมดแล้ว ⇒ ถ้าต้องการตัวที่ไม่ยุ่งกับอะไรเลย ต้องใช้ 'blank' เท่านั้น

const mono = (rarity, element, grade, n = 4) =>
  Array.from({ length: n }, (_, i) => ({ id: `${element}${i}`, rarity, element, grade }))

test('deterministic: seed เดิม → ผลเหมือนเป๊ะ', () => {
  const a = mono('rare', 'fist', 3), b = mono('rare', 'scissors', 3)
  const r1 = simulateBattle(a, b, 12345)
  const r2 = simulateBattle(a, b, 12345)
  assert.deepEqual(r1, r2)
})

test('log จบด้วย end event ที่ winner ตรงกับผล', () => {
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const end = r.log[r.log.length - 1]
  assert.equal(end.t, 'end')
  assert.equal(end.winner, r.winner)
  assert.ok(r.rounds >= 1)
})

test('ธาตุได้เปรียบชนะเกินครึ่ง (fist vs scissors, เกรดเท่ากัน)', () => {
  let wins = 0, N = 300
  for (let s = 1; s <= N; s++)
    if (simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), s * 99991).winner === 'A') wins++
  assert.ok(wins / N > 0.6, `winrate ${wins / N}`)
})

test('เกรดสูงกว่าชนะเกินครึ่ง (ธาตุเดียวกัน)', () => {
  let wins = 0, N = 300
  for (let s = 1; s <= N; s++)
    if (simulateBattle(mono('rare', 'scissors', 5), mono('rare', 'scissors', 2), s * 1237).winner === 'A') wins++
  assert.ok(wins / N > 0.6, `winrate ${wins / N}`)
})

test('ทีมว่างฝั่งหนึ่ง → อีกฝั่งชนะ', () => {
  assert.equal(simulateBattle(mono('common', 'fist', 0), [], 1).winner, 'A')
  assert.equal(simulateBattle([], mono('common', 'fist', 0), 1).winner, 'B')
})

test('attack event มี eff ตรงกับ matchup ธาตุ', () => {
  // fist ชนะ scissors → ผู้ตีฝั่ง A (fist) ควรมี eff:'super', ฝั่ง B (scissors→fist) eff:'weak'
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const atkA = r.log.filter(e => e.t === 'attack' && e.side === 'A')
  const atkB = r.log.filter(e => e.t === 'attack' && e.side === 'B')
  assert.ok(atkA.length && atkA.every(e => e.eff === 'super'), 'A (fist) ตี scissors = super ทุกครั้ง')
  assert.ok(atkB.length && atkB.every(e => e.eff === 'weak'), 'B (scissors) ตี fist = weak ทุกครั้ง')
  assert.ok(['super', 'weak', 'neutral'].includes(atkA[0].eff))
})

test('log มี round marker ต้นแต่ละรอบ ตามจำนวน rounds', () => {
  const r = simulateBattle(mono('rare', 'fist', 3), mono('rare', 'scissors', 3), 7)
  const rounds = r.log.filter(e => e.t === 'round')
  assert.equal(rounds.length, r.rounds)
  assert.equal(rounds[0].n, 1)
})

test('ฝั่งตัวเยอะกว่าได้ตีก่อน', () => {
  const a = mono('rare', 'scissors', 3, 1)  // 1 ตัว
  const b = mono('rare', 'scissors', 3, 3)  // 3 ตัว
  const first = simulateBattle(a, b, 42).log.find(e => e.t === 'attack')
  assert.equal(first.side, 'B')
})

test('ฝั่งตีสลับกันเสมอ (ไม่ว่าเหลือกี่ตัว)', () => {
  const r = simulateBattle(mono('rare', 'fist', 3, 1), mono('rare', 'scissors', 3, 4), 99)
  const sides = r.log.filter(e => e.t === 'attack').map(e => e.side)
  assert.ok(sides.length > 2)
  for (let i = 1; i < sides.length; i++) assert.notEqual(sides[i], sides[i - 1], `ตำแหน่ง ${i} ไม่สลับ`)
})

test('ฝั่งเหลือ 1 ตัว ตัวนั้นได้ตีทุกตาของฝั่งตน', () => {
  const r = simulateBattle(mono('rare', 'fist', 3, 1), mono('rare', 'scissors', 3, 4), 99)
  const aAtks = r.log.filter(e => e.t === 'attack' && e.side === 'A')
  assert.ok(aAtks.length > 1)
  assert.ok(aAtks.every(e => e.attacker === 'A0'), 'ตัวเดียวของ A ต้องเป็น A0 เสมอ')
})

test('เลือกตัวออกตีจากซ้ายไปขวา (ก่อนมีตัวตาย)', () => {
  // paper mono = อึด (hp bias 1.2) → ตัวแรกตายช้า มีพื้นที่เช็คลำดับ
  const r = simulateBattle(mono('rare', 'paper', 3, 4), mono('rare', 'paper', 3, 4), 7)
  const seq = []
  for (const e of r.log) {
    if (e.t === 'attack' && e.dead) break
    if (e.t === 'attack' && e.side === 'A') seq.push(e.attacker)
  }
  assert.deepEqual(seq.slice(0, 4), ['A0', 'A1', 'A2', 'A3'])
})

// ── สเตตัสที่ UI เอาไปวาด (units / statsAfter) ────────────────
// เดิม BattleReplay คำนวณ ATK/HP จาก buildCombatant ล้วน ไม่ผ่าน aura
// แต่ log ส่ง targetHpAfter มาบนสเกลหลัง aura ⇒ ทีมที่มีคุณวาฬหลอดเลือดเริ่มเกิน 100%
const teamOf = (...ids) => ids.map(id => ({ id, rarity: 'legendary', element: 'fist', grade: 0 }))

test('result.units: มีครบทุก uid ของทั้งสองทีม พร้อม atk/maxHp', () => {
  const r = simulateBattle(teamOf('turtle', 'turtle'), teamOf('turtle'), 7)
  assert.deepEqual(Object.keys(r.units).sort(), ['A0', 'A1', 'B0'])
  for (const u of Object.values(r.units)) {
    assert.equal(typeof u.atk, 'number')
    assert.ok(u.maxHp > 0)
  }
})

test('result.units: ทีมมีคุณวาฬ → maxHp ทั้งทีม = ค่าดิบ x 1.10 (teamHp 10%)', () => {
  const withWhale = simulateBattle(teamOf('whale', 'turtle'), teamOf('turtle'), 7)
  const without   = simulateBattle(teamOf('turtle', 'turtle'), teamOf('turtle'), 7)
  // ⚠️ เทียบค่าตรงๆ อย่าเทียบเป็นอัตราส่วนของเลขที่ปัดแล้ว — ฐานจริง 59.5 ปัดเป็น 60
  //    ทำให้ 65/60 = 1.083 ทั้งที่คณิตข้างในถูก (59.5 x 1.1 = 65.45)
  const raw = buildCombatant({ rarity: 'legendary', element: 'fist', grade: 0 }).maxHp
  assert.equal(withWhale.units.A1.maxHp, Math.round(raw * 1.1))
  assert.equal(without.units.A1.maxHp, Math.round(raw))
  assert.equal(withWhale.units.B0.maxHp, without.units.B0.maxHp, 'aura ต้องไม่ข้ามไปทีมศัตรู')
})

test('statsAfter: ติดมากับ aura ที่เปลี่ยนค่าจริง ไม่ติดกับ aura ที่ไม่แตะ atk/maxHp', () => {
  const r = simulateBattle(teamOf('whale', 'fairy'), teamOf('turtle'), 7)
  const auras = r.log.filter(e => e.t === 'passive' && e.fxKind === 'aura')
  const hp   = auras.find(e => e.effect === 'teamHp')
  const crit = auras.find(e => e.effect === 'teamCrit')
  assert.ok(hp.statsAfter, 'teamHp ต้องมี statsAfter')
  assert.equal(crit.statsAfter, undefined, 'teamCrit ไม่แตะ atk/maxHp จึงไม่ต้องมี')
  assert.equal(hp.statsAfter.A0.maxHp, r.units.A0.maxHp)
})

test('statsAfter: hunt (trex) ส่ง atk ใหม่มาทุกหมัดที่สะสมชั้น', () => {
  const weak = Array.from({ length: 3 }, () => ({ id: 'blank', rarity: 'common', element: 'scissors', grade: 0 }))
  const r = simulateBattle(teamOf('trex'), weak, 3)
  const stacks = r.log.filter(e => e.t === 'passive' && e.effect === 'hunt')
  assert.ok(stacks.length >= 1, 'ควรมี hunt อย่างน้อย 1 ครั้ง (ทีเร็กซ์ตีทุกหมัดของตัวเอง)')
  for (const s of stacks) assert.ok(s.statsAfter.A0.atk > 0)
  if (stacks.length >= 2) assert.ok(stacks[1].statsAfter.A0.atk > stacks[0].statsAfter.A0.atk)
})

// 🔴 แมวเป็นตัวเดียวที่ขยับ atk ผ่าน hook onDeath (สถานะ "ทนต่อ" +50% แล้วคืนตอนหมด)
//    ถ้า event ของมันไม่แบก statsAfter การ์ดในรีเพลย์จะค้างเลขเก่าทั้งที่ตัวจริงตีด้วยเลขใหม่ —
//    เทสนี้จึงยิงไฟต์จริงแล้วบังคับกฎเดียวกับที่ stealStats/aura/stackAtk/atkOnHit ถือกันอยู่
test('statsAfter: ทุก event ของแมวที่ขยับ atk ต้องแบกสเตตัสใหม่มาด้วย (ไฟต์จริง)', () => {
  // แมวเกรด 0 ธาตุเสียเปรียบ เจอหนูเกรด 4 → โดนหมัดถึงตาย 3 ครั้งก่อนตายจริงในยกที่ 5
  const r = simulateBattle([{ id: 'cat', rarity: 'common', element: 'fist', grade: 0 }],
                           [{ id: 'blank', rarity: 'legendary', element: 'paper', grade: 4 }], 1)
  const evs = r.log.filter(e => e.t === 'passive' && (e.effect === 'cheatDeath' || e.effect === 'grit'))
  assert.deepEqual(evs.map(e => e.effect), ['cheatDeath', 'grit', 'grit'], 'ต้องรอดหมัดถึงตาย 3 ครั้งในไฟต์จริง')
  for (const e of evs) assert.ok(e.statsAfter, `${e.effect} ไม่มี statsAfter`)

  const base = r.units.A0.atk                    // ตัวเลขที่การ์ดตั้งต้น (หลังออร่า)
  const buffed = evs[0].statsAfter.A0.atk
  assert.ok(buffed > base, `ตอนได้สถานะ การ์ดต้องขึ้นเป็นเลขที่ใช้สู้จริง (${buffed} ควรมากกว่า ${base})`)
  // atkPct 80 (ขึ้นจาก 50 ตามเมต้าซิม 27 ก.ย. 2026)
  assert.ok(Math.abs(buffed - base * 1.8) <= 1, `+80% ตามพาสสีฟ (ได้ ${buffed} จากฐาน ${base})`)
  assert.equal(evs[1].statsAfter.A0.atk, buffed, 'ระหว่างยังมีสถานะ เลขต้องค้างที่ค่าบัฟ')
  assert.equal(evs[2].statsAfter.A0.atk, base, 'ใบที่สถานะหมดพอดี ต้องคืนเลขเดิม ไม่ค้างบัฟ')
})

// ── ตายเงียบ (สเปก §7.6, 6 ก.ย. 2026) ─────────────────────────────────────
// หนาม/guardian/aoeOpener หักเลือดตรงๆ โดยไม่ผ่าน onDeath/onAnyDeath มาก่อน ⇒ ฟีนิกซ์ไม่ฟื้น
// แมวไม่ได้ cheatDeath ทีเร็กซ์ไม่ได้ชั้น · กติกาผู้ฆ่า: ใครสร้างดาเมจคือผู้ฆ่า ไม่ใช่คนที่ดาเมจไปตกใส่

test('หนาม: ฟีนิกซ์ที่ตายจากหนามกลางหมัดของตัวเองต้องฟื้น แล้วสวนใส่ "เจ้าของหนาม" (สเปก §7.6)', () => {
  // ยิงจริงผ่าน simulateBattle() (ไม่ใช่ log เขียนมือ) — ลำดับ event ที่กติกานี้อ่านมาจากเอนจินจริงเท่านั้น
  // 🔴 RED ที่พิสูจน์แล้วก่อนแก้ (ดูรายงาน): seed นี้ทำให้ A0 (ฟีนิกซ์) เลือดติดลบเงียบๆ ตอนบรรทัด
  //    `att.hp -= hitRes.thorns` กลางหมัดที่ 3 ของฟีนิกซ์เอง — ของเดิมจบไฟต์ตรงนั้นเลยไม่มี revive event
  //    เลยสักใบ ทั้งที่ฟีนิกซ์มี revive เหลือเต็ม (ยังไม่เคยตายมาก่อนในไฟต์นี้)
  const A = [{ id: 'phoenix', rarity: 'legendary', element: 'fist', grade: 5 }]
  const B = [{ id: 'hedgehog', rarity: 'legendary', element: 'scissors', grade: 5 }]
  const r = simulateBattle(A, B, 40)

  const revive = r.log.find(e => e.t === 'passive' && e.effect === 'revive' && e.uid === 'A0')
  assert.ok(revive, 'ฟีนิกซ์ต้องฟื้นแม้ตายจากหนาม ไม่ใช่ตายเงียบ')

  // เหตุ (attack ที่ทำให้ตาย) ต้องมาก่อนผล (revive) เสมอ — battleBeats.js อ่านลำดับนี้
  // หา 'attack' ก้อนสุดท้าย "ก่อน" revive (ไม่ใช่ทั้ง log เพราะหลัง revive มีหมัดสวนของฟีนิกซ์เองอีกก้อน
  // ที่ attacker เป็น A0 เหมือนกัน ต้องไม่หยิบผิดก้อน)
  const idxRevive = r.log.indexOf(revive)
  const lethalAttack = [...r.log.slice(0, idxRevive)].reverse().find(e => e.t === 'attack' && e.attacker === 'A0')
  assert.ok(lethalAttack, 'ต้องมีหมัดของฟีนิกซ์เองอยู่ก่อน revive (หมัดที่โดนหนามสวนตายกลางหมัด)')

  // หมัดสวนต้องลงที่ "เจ้าของหนาม" (B0/หนาม) ไม่ใช่คนอื่น — เช็คจากหมัดสวน (sub:true) ถัดจาก revive
  const counter = r.log.slice(idxRevive + 1).find(e => e.t === 'attack' && e.sub)
  assert.ok(counter, 'ต้องมีหมัดสวนหลัง revive')
  assert.equal(counter.attacker, 'A0')
  assert.equal(counter.target, 'B0', 'หมัดสวนต้องลงที่เจ้าของหนาม (ผู้สร้างดาเมจจริง) ไม่ใช่ใครอื่น')
})

test('guardian: ผู้พิทักษ์ที่ตายจากส่วนแบ่งที่รับแทนเพื่อนต้องกิน cheatDeath โดยผู้ฆ่าคือ "คนที่สวนหมัดมา" (สเปก §7.6)', () => {
  // เพ็ทสังเคราะห์: ผู้พิทักษ์ถือทั้ง guardian (onHit) และ cheatDeath (onDeath) พร้อมกัน — ของจริงในเกม
  // วันนี้ guardian มีแค่บากุ (ไม่มี onDeath) แต่กติกาที่ทดสอบอยู่เป็นกลไกเอนจินล้วน ไม่ขึ้นกับว่าใครถือ
  PET_PASSIVES.__catGuardian = {
    name: 'แมวผู้พิทักษ์ทดสอบ', icon: '🧪',
    parts: [
      { hook: 'onHit', effect: 'guardian', value: { pct: 100 }, step: { pct: 0 } },
      { hook: 'onDeath', effect: 'cheatDeath', value: { times: 1, grit: 0, atkPct: 0 }, step: { times: 0, grit: 0, atkPct: 0 } },
    ],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  // ล่อเป้าทดสอบ: บังคับให้ศัตรูตี A1 เสมอ (ไม่งั้นสุ่มเป้า ทำให้ผู้พิทักษ์ไม่ได้รับแทนทุกหมัด)
  PET_PASSIVES.__weakTaunt = {
    name: 'ล่อเป้าทดสอบ', icon: '🧪',
    parts: [{ hook: 'onRound', effect: 'taunt', value: { pct: 0 }, step: { pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  // 🔧 บาลานซ์รอบ 1 Task 5 (27 ก.ย. 2026): ทีเร็กซ์ย้ายออกจาก onAnyDeath+stackAtk แล้ว (ตอนนี้เป็น
  //    onAttack+hunt ที่ไม่ผูกกับการฆ่าเลย) ⇒ ใช้พยานสังเคราะห์แทนเพื่อคงเจตนาเดิมของเทสนี้: พิสูจน์ว่า
  //    "ฝั่งผู้โจมตี" (ไม่ใช่ผู้พิทักษ์เอง) เป็นคนได้เครดิตการฆ่าตอนผู้พิทักษ์ตายจริงในรอบถัดมา
  PET_PASSIVES.__anyDeathWitness = {
    name: 'พยานฆ่าทดสอบ', icon: '🧪',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 0, max: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [
      { id: '__catGuardian', rarity: 'common', element: 'fist', grade: 0 },
      { id: '__weakTaunt', rarity: 'common', element: 'scissors', grade: 0 },
    ]
    const B = [{ id: '__anyDeathWitness', rarity: 'legendary', element: 'fist', grade: 5 }]
    const r = simulateBattle(A, B, 1)

    const guardEvents = r.log.filter(e => e.t === 'passive' && e.effect === 'guardian' && e.uid === 'A0')
    const lethalGuard = guardEvents.find(e => e.guardHpPct <= 0)
    assert.ok(lethalGuard, 'ต้องมีก้อนที่ผู้พิทักษ์รับแทนจนเลือดหมด')

    const cheat = r.log.find(e => e.t === 'passive' && e.effect === 'cheatDeath' && e.uid === 'A0')
    assert.ok(cheat, 'ผู้พิทักษ์ต้องกิน cheatDeath ไม่ใช่ตายเงียบ')
    assert.ok(r.log.indexOf(cheat) > r.log.indexOf(lethalGuard), 'cheatDeath ต้องมาหลัง log ที่ทำให้ตาย (เหตุมาก่อนผล)')

    // cheatDeath ใช้ได้ครั้งเดียว — ก้อนรับแทนที่ทำให้ตายรอบถัดมาต้องตายจริง แล้ว "ฝั่งผู้โจมตี" (พยาน)
    // ต้องได้ประโยชน์ (stackAtk) ไม่ใช่ทีมของผู้พิทักษ์เอง — พิสูจน์ว่าผู้ฆ่าคือคนที่สวนหมัดมา ไม่ใช่ผู้พิทักษ์
    const stack = r.log.find(e => e.t === 'passive' && e.effect === 'stackAtk' && e.uid === 'B0')
    assert.ok(stack, 'พยาน (ฝั่งผู้โจมตี) ต้องได้ชั้นตอนผู้พิทักษ์ตายจริงในรอบถัดมา — ยืนยันว่าผู้ฆ่าคือผู้โจมตี ไม่ใช่ผู้พิทักษ์เอง')
  } finally {
    delete PET_PASSIVES.__catGuardian
    delete PET_PASSIVES.__weakTaunt
    delete PET_PASSIVES.__anyDeathWitness
  }
})

test('aoeOpener: บาฮามุทฆ่าศัตรูก่อนรอบ 1 ได้ · เพื่อนร่วมทีมที่ถือ onAnyDeath ต้องได้ชั้น stackAtk (สเปก §7.6)', () => {
  // 🔴 บาลานซ์ 27 ก.ย. 2026: บาฮามุทลดจาก 150% → 100% ⇒ ตัวเดียวไม่พอฆ่า B0 (hp 43) ก่อนรอบ 1 อีกต่อไป
  //    (34 dmg เหลือ hp 9) ใช้ 2 ตัวรวมแรงแทน เพื่อคงเจตนาเดิมของเทส (ฆ่าก่อนรอบ 1 + เพื่อนร่วมทีมได้ชั้น)
  // 🔧 บาลานซ์รอบ 1 Task 5: ทีเร็กซ์ย้ายออกจาก onAnyDeath+stackAtk แล้ว (ตอนนี้เป็น onAttack+hunt
  //    ที่ไม่ผูกกับการฆ่าเลย) ⇒ ใช้พยานสังเคราะห์แทนเพื่อยังคงพิสูจน์ว่า "การตายเงียบก่อนรอบ 1" ก็ยิง
  //    onAnyDeath ให้เพื่อนร่วมทีมเหมือนการตายทางอื่นทุกทาง (เจตนาเดิมของเทสนี้ไม่เกี่ยวกับทีเร็กซ์เจาะจง)
  PET_PASSIVES.__anyDeathWitness = {
    name: 'พยานฆ่าทดสอบ', icon: '🧪',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 0, max: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [
      { id: 'bahamut', rarity: 'legendary', element: 'fist', grade: 5 },
      { id: 'bahamut', rarity: 'legendary', element: 'fist', grade: 5 },
      { id: '__anyDeathWitness', rarity: 'legendary', element: 'fist', grade: 5 },
    ]
    const B = [{ id: 'blank', rarity: 'common', element: 'fist', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    const opener = r.log.find(e => e.t === 'passive' && e.effect === 'aoeOpener')
    assert.ok(opener, 'ต้องมี aoeOpener event')
    assert.ok(opener.targets.includes('B0'), 'บาฮามุทต้องยิงโดน B0')

    const stack = r.log.find(e => e.t === 'passive' && e.effect === 'stackAtk' && e.uid === 'A2')
    assert.ok(stack, 'พยานต้องได้ชั้น stackAtk จากศัตรูที่ตายด้วย aoeOpener ก่อนรอบ 1')
    assert.ok(r.log.indexOf(stack) > r.log.indexOf(opener), 'ต้องยิงหลัง event ของ aoeOpener เอง (เหตุมาก่อนผล)')

    assert.equal(r.rounds, 0, 'B0 ตายหมดตั้งแต่ก่อนรอบ 1 — ไม่มีรอบไหนเกิดขึ้นจริง (สเปก: ล้มเพ็ทก่อนรอบ 1 ได้')
    assert.equal(r.winner, 'A')
  } finally {
    delete PET_PASSIVES.__anyDeathWitness
  }
})

test('👹 ฟาดน็อกแต่ผู้ตีตายจากหนามกลางหมัด ⇒ ต้องไม่ฟาดต่อ (สเปก §7.6 ข้อ 6 · เจตนาเดิมของเทส killChain)', () => {
  // เพ็ทสังเคราะห์หนาม 500% — บังคับให้ "ฟาดศัตรูตัวแรกน็อก" กับ "หนามสวนกลับจนตัวเองตาย" เกิดในหมัดเดียวกัน
  PET_PASSIVES.__spikeTest = {
    name: 'หนามทดสอบ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'thorns', value: { pct: 500 }, step: { pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [{ id: 'kirin', rarity: 'legendary', element: 'fist', grade: 5 }]
    const B = [
      { id: '__spikeTest', rarity: 'common', element: 'fist', grade: 0 },
      { id: '__spikeTest', rarity: 'common', element: 'fist', grade: 0 },        // ตัวที่ 2 = เป้าที่ไม่ควรถูกตีถ้าแก้ถูก
    ]
    const r = simulateBattle(A, B, 43)

    const atkA0 = r.log.filter(e => e.t === 'attack' && e.attacker === 'A0' && !e.sub)
    assert.equal(atkA0.length, 1, 'โอนิตายจากหนามกลางหมัดฟาดแรก ต้องไม่มีหมัดฟาดต่อ')
    assert.equal(atkA0[0].dead, true, 'หมัดฟาดต้องน็อก B0 จริง (เข้าเงื่อนไขฟาดต่อ)')
    const chain = r.log.filter(e => e.t === 'passive' && e.effect === 'windup' && e.fxKind === 'chain')
    assert.equal(chain.length, 0, 'ต้องไม่มี event ฟาดต่อ เพราะโอนิตายไปแล้ว')
    assert.equal(r.winner, 'B', 'โอนิตายจริง เหลือ B1 รอด ทีม B ต้องชนะ')
  } finally {
    delete PET_PASSIVES.__spikeTest
  }
})

// ── 👹 โอนิ "ง้างตะบองฟาด!" (27 ก.ย. 2026) ─────────────────────────────
const oniActs = (log, uid = 'A0') => log.filter(e =>
  (e.t === 'attack' && e.attacker === uid && !e.sub) ||
  (e.t === 'passive' && e.uid === uid && (e.fxKind === 'windup' || e.fxKind === 'skip' || e.fxKind === 'chain')))
  .map(e => e.t === 'attack' ? 'hit' : e.fxKind)

test('👹 ตาแรกง้าง (ไม่มีหมัด) → ตาถัดไปฟาด ~300% → วนง้างใหม่', () => {
  const L = () => ({ id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 })
  const A = [{ id: 'kirin', rarity: 'legendary', element: 'fist', grade: 5 }, L(), L()]
  const r = simulateBattle(A, [L(), L(), L()], 2)
  const acts = oniActs(r.log)
  assert.deepEqual(acts.slice(0, 4), ['windup', 'hit', 'windup', 'hit'], `ลำดับตาของโอนิ: ${acts.join(',')}`)
  const firstWind = r.log.findIndex(e => e.fxKind === 'windup' && e.uid === 'A0')
  assert.ok(!r.log.slice(0, firstWind).some(e => e.t === 'attack' && e.attacker === 'A0'), 'ตาแรกต้องไม่มีหมัด')
  // ฟาด = 3× หมัดปกติ ⇒ dmg/atk อยู่ในช่วง 3 × [1 - var, critMult × (1 + var)]
  // (เอนจินไม่มีค่าป้องกัน · blank ไม่มีลดดาเมจ · เลือกเฉพาะหมัดที่ไม่น็อก = ดาเมจไม่ถูกตัดที่เลือดเป้า)
  // หมัดปกติสูงสุด = critMult × (1 + var) ≈ 1.95× < ขอบล่างของฟาด 2.34× ⇒ แยกกันขาด
  const atk = r.units.A0.atk
  const { variance, critMult } = BATTLE_CFG
  const smashes = r.log.filter(e => e.t === 'attack' && e.attacker === 'A0' && !e.sub && !e.dead)
  assert.ok(smashes.length >= 1, 'ต้องมีหมัดฟาดที่ไม่น็อกให้วัด (เปลี่ยนซีด)')
  for (const e of smashes) {
    const ratio = e.dmg / atk
    assert.ok(ratio >= 3 * (1 - variance) - 0.02 && ratio <= 3 * critMult * (1 + variance) + 0.02, `ฟาดต้อง ≈3× (ได้ ${ratio.toFixed(2)}×)`)
  }
  assert.equal(r.log.filter(e => e.effect === 'windup' && e.fxKind === 'smash').length,
    r.log.filter(e => e.t === 'attack' && e.attacker === 'A0' && !e.sub).length, 'ทุกหมัดฟาดมี event smash นำหน้า')
})

test('👹 ฟาดน็อก ⇒ ฟาดต่อทันที 1 ครั้ง (×3 เช่นกัน) แล้วไม่ต่อครั้งที่ 3 แม้น็อกอีก', () => {
  const A = [{ id: 'kirin', rarity: 'legendary', element: 'fist', grade: 5 }]
  const B = Array.from({ length: 3 }, () => ({ id: 'blank', rarity: 'common', element: 'fist', grade: 0 }))
  const r = simulateBattle(A, B, 3)
  const acts = oniActs(r.log)
  assert.deepEqual(acts.slice(0, 5), ['windup', 'hit', 'chain', 'hit', 'windup'], `ลำดับ: ${acts.join(',')}`)
  const hits = r.log.filter(e => e.t === 'attack' && e.attacker === 'A0' && !e.sub)
  assert.equal(hits[0].dead, true, 'หมัดฟาดแรกน็อก')
  assert.equal(hits[1].dead, true, 'หมัดฟาดต่อก็น็อก — แต่ต้องไม่มีฟาดต่อครั้งที่ 3')
  // หมัดฟาดต่อต้องตามหลัง event chain ทันที (ไม่มีหมัดฝั่ง B คั่น) และแบก smash ×3 ด้วย
  const ci = r.log.findIndex(e => e.fxKind === 'chain' && e.uid === 'A0')
  const next = r.log.slice(ci + 1).find(e => e.t === 'attack')
  assert.equal(next.attacker, 'A0')
  assert.ok(r.log.slice(ci + 1, r.log.indexOf(next)).some(e => e.fxKind === 'smash'), 'ฟาดต่อต้องแรง ×3 ด้วย')
  assert.equal(r.log.filter(e => e.fxKind === 'chain').length, 1, 'ฟาดต่อได้สูงสุด 1 ครั้งต่อการฟาด')
})

test('👹 โดนแช่แข็งตอนง้างค้าง ⇒ ตานั้นหาย · ง้างยังค้าง · ตาถัดไปที่ได้เล่นคือฟาด (ไม่ง้างซ้ำ)', () => {
  PET_PASSIVES.__freezer = {
    name: 'ทดสอบหนาว', icon: '🧪',
    parts: [{ hook: 'onRoundEnd', effect: 'season', value: { hot: 0, rain: 0, cold: 50 }, step: { hot: 0, rain: 0, cold: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    let sawSkipAfterWindup = 0
    for (let seed = 1; seed <= 40; seed++) {
      const A = [{ id: 'kirin', rarity: 'legendary', element: 'fist', grade: 5 },
        { id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 },
        { id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 }]
      const B = [
        { id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 },
        { id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 },
        { id: '__freezer', rarity: 'legendary', element: 'fist', grade: 5 },   // ช่อง 3 = ฤดูหนาว
      ]
      const acts = oniActs(simulateBattle(A, B, seed).log)
      let pendingWind = false
      for (let i = 0; i < acts.length; i++) {
        if (acts[i] === 'windup') { assert.equal(pendingWind, false, `ซีด ${seed}: ง้างซ้ำทั้งที่ง้างค้าง ${acts.join(',')}`); pendingWind = true }
        else if (acts[i] === 'skip') { if (pendingWind) sawSkipAfterWindup++ }
        else if (acts[i] === 'hit') { assert.equal(pendingWind, true, `ซีด ${seed}: ฟาดโดยไม่ได้ง้าง ${acts.join(',')}`); pendingWind = false }
        else if (acts[i] === 'chain') { i++ }   // ข้ามหมัดฟาดต่อ
      }
    }
    assert.ok(sawSkipAfterWindup > 0, 'ไม่เจอเคสแช่แข็งตอนง้างค้างเลย — เทสไม่ได้ทดสอบอะไร')
  } finally {
    delete PET_PASSIVES.__freezer
  }
})

test('👹 ตาง้างนับเป็นการได้ตาในรอบ — รอบ 1 จบได้ ไฟต์ไม่ค้าง', () => {
  const A = [{ id: 'kirin', rarity: 'legendary', element: 'fist', grade: 5 }]
  const B = [{ id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 }]
  const r = simulateBattle(A, B, 11)
  const r2 = r.log.findIndex(e => e.t === 'round' && e.n === 2)
  assert.ok(r2 > 0, 'ต้องมีรอบ 2 (รอบ 1 จบได้แม้โอนิแค่ง้าง)')
  assert.equal(r.log.slice(0, r2).filter(e => e.fxKind === 'windup').length, 1, 'รอบ 1 = ง้าง 1 ครั้ง')
  assert.equal(r.log.slice(0, r2).filter(e => e.t === 'attack' && e.attacker === 'B0').length, 1, 'รอบ 1 = B ตี 1 ครั้ง')
  assert.equal(r.log[r.log.length - 1].t, 'end')
  assert.ok(r.winner === 'A' || r.winner === 'B', 'ไฟต์ต้องจบด้วยการล้มทีม ไม่ใช่หมดตา')
})

// ── รีวิวรอบ 2 (6 ก.ย. 2026): บั๊กตระกูลเดียวกับ killChain ที่หลุดไว้ ──────────
// ผู้ตีตายกลางหมัดตัวเองแล้วยังตีต่อ เกิดได้ในอีก 2 ลูปของ hit() ด้วย ไม่ใช่แค่ killChain
// (🐰 กระต่ายถือ multiStrike จริง · 🐕 เซอร์เบอรัสถือ cleave จริง — เข้าถึงได้วันนี้ ไม่ใช่สมมุติ)

test('multiStrike: ผู้ตีที่ตายจากหนามหลังหมัดแรกต้องไม่ตีหมัดที่สองต่อในหมัดเดียวกัน (สเปก §7.6 ข้อ 6)', () => {
  PET_PASSIVES.__spikeTest2 = {
    name: 'หนามทดสอบ 2', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'thorns', value: { pct: 500 }, step: { pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  PET_PASSIVES.__multiStrikeTest = {
    name: 'มัลติสไตรค์ทดสอบ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'multiStrike', value: { chance: 100, pct: 100 }, step: { chance: 0, pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [{ id: '__multiStrikeTest', rarity: 'legendary', element: 'fist', grade: 5 }]
    const B = [{ id: '__spikeTest2', rarity: 'common', element: 'fist', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    // ผู้ตีตายจากหนามตั้งแต่หมัดแรกของ multiStrike (sub:false) — หมัดที่สอง (sub:true) ต้องไม่เกิดเลย
    const atkA0 = r.log.filter(e => e.t === 'attack' && e.attacker === 'A0')
    assert.equal(atkA0.length, 1, 'ผู้ตีตายจากหนามกลางหมัดแรกของ multiStrike ต้องไม่มีหมัดที่สอง (sub) ตามมา')
  } finally {
    delete PET_PASSIVES.__spikeTest2
    delete PET_PASSIVES.__multiStrikeTest
  }
})

test('cleave: ผู้ตีที่ตายจากหนามที่เป้าหลักต้องไม่ตีเป้ารองต่อในหมัดเดียวกัน (สเปก §7.6 ข้อ 6)', () => {
  PET_PASSIVES.__spikeTest3 = {
    name: 'หนามทดสอบ 3', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'thorns', value: { pct: 500 }, step: { pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  PET_PASSIVES.__cleaveTest = {
    name: 'คลีฟทดสอบ', icon: '🧪',
    parts: [{ hook: 'onAttack', effect: 'cleave', value: { count: 2, pct: 100 }, step: { count: 0, pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [{ id: '__cleaveTest', rarity: 'legendary', element: 'fist', grade: 5 }]
    const B = [
      { id: '__spikeTest3', rarity: 'common', element: 'fist', grade: 0 },   // เป้าหลัก — หนามฆ่าผู้ตี
      { id: '__spikeTest3', rarity: 'common', element: 'fist', grade: 0 },   // เป้ารองของ cleave — ไม่ควรถูกตี
    ]
    const r = simulateBattle(A, B, 1)

    const atkA0 = r.log.filter(e => e.t === 'attack' && e.attacker === 'A0')
    assert.equal(atkA0.length, 1, 'ผู้ตีตายจากหนามของเป้าหลักต้องไม่ตีเป้ารองของ cleave ต่อ')
  } finally {
    delete PET_PASSIVES.__spikeTest3
    delete PET_PASSIVES.__cleaveTest
  }
})

test('หนึ่งการตาย = รันฮุคหนึ่งครั้ง: ตัวที่ตายกลางก้อนสะท้อนของตัวเอง ต้องไม่ยิง onAnyDeath ซ้ำสอง (สเปก §7.6)', () => {
  // เพ็ทสังเคราะห์: T ถือหนาม (onHit) + stackAtk (onAnyDeath) พร้อมกัน · Y ถือเกราะสะท้อน (armorStack)
  // เส้นทางซ้อน: T ตี Y (strike ชั้นนอก) → เกราะของ Y โปรก สะท้อนกลับใส่ทีมของ T (มีแค่ T) ผ่าน strike
  // ชั้นใน (Y เป็นผู้ตีคราวนี้) → หนามของ T (ผู้รับก้อนสะท้อน) สวน Y จนตายกลางชั้นใน → ชั้นในเรียก
  // resolveSilentDeath(Y, T) ไปแล้วหนึ่งรอบ (T ได้ stackAtk 1 ชั้น) → พอกลับมาชั้นนอก `tg` (=Y) ก็ยัง
  // hp<=0 อยู่ ⇒ ถ้าไม่มีตัวกันซ้ำ ชั้นนอกจะรันฮุคของ Y อีกรอบ ⇒ T ได้ stackAtk ชั้นที่ 2 ฟรี (บั๊กเดิม
  // ของทีเร็กซ์ได้ 2 ชั้นต่อศพ ที่เฟสก่อนเพิ่งแก้ไปจุดหนึ่ง — นี่คือจุดที่สอง)
  PET_PASSIVES.__thornsWitness = {
    name: 'หนามพยานทดสอบ', icon: '🧪',
    parts: [
      { hook: 'onHit', effect: 'thorns', value: { pct: 500 }, step: { pct: 0 } },
      { hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 0, max: 0 } },
    ],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  PET_PASSIVES.__armorTest = {
    name: 'เกราะทดสอบ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 1, pct: 100 }, step: { count: 0, pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    // A มี 2 ตัว (ca=2 > cb=1) เพื่อบังคับให้ A ออกตีก่อนแบบไม่พึ่ง rand() — T (index 0) ต้องเป็นผู้ตีก่อนเสมอ
    const A = [
      { id: '__thornsWitness', rarity: 'legendary', element: 'scissors', grade: 5 },
      { id: 'blank', rarity: 'common', element: 'scissors', grade: 0 },
    ]
    const B = [{ id: '__armorTest', rarity: 'common', element: 'scissors', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    const stacks = r.log.filter(e => e.t === 'passive' && e.effect === 'stackAtk' && e.uid === 'A0')
    assert.equal(stacks.length, 1, 'ศพเดียว (Y) ต้องยิง onAnyDeath ให้ T แค่ครั้งเดียว ไม่ใช่สองครั้ง')
  } finally {
    delete PET_PASSIVES.__thornsWitness
    delete PET_PASSIVES.__armorTest
  }
})

// ══════════════════════════════════════════════════════════════════════════
//  P2c-2 (10 ก.ย. 2026) — การตายเงียบต้องมี "ใบบันทึก" ใน log ไม่ใช่แค่รันฮุคได้
//  สเปก: docs/superpowers/specs/2026-09-10-silent-death-logging-design.md
//  เดิมฮุครันครบแล้ว (P2c-1) แต่ไม่มี event ⇒ battleSummary โชว์เพ็ทที่ตายแล้วว่ายังยืนอยู่
//  · battleBeats ไม่เล่นอนิเมชันน็อก · ผู้ฆ่าไม่ได้เครดิต kills
// ══════════════════════════════════════════════════════════════════════════

/** ใบการตายเงียบต้องหน้าตาแบบนี้เป๊ะทุกใบ — dmg 0 คือค่าคงที่ที่หน้าสรุปพึ่งอยู่ */
const assertSilentShape = (e, msg) => {
  assert.equal(e.t, 'attack', `${msg}: ต้องเป็นชนิด attack (ผู้อ่าน log ทุกตัวรู้จักรูปนี้อยู่แล้ว)`)
  assert.equal(e.dmg, 0, `${msg}: dmg ต้องเป็น 0 ไม่งั้นหน้าสรุปนับดาเมจพาสสีฟเข้าไปเงียบๆ`)
  assert.equal(e.sub, true, `${msg}: ต้องเป็นหมัดลูก ไม่งั้นไฟต์ยาวขึ้น (กฎเหล็ก: ห้ามเพิ่ม beat)`)
  assert.equal(e.dead, true, `${msg}: ต้องแบก dead ไม่งั้นไม่มีใครรู้ว่าตาย`)
  assert.equal(e.targetHpAfter, 0, `${msg}: หลอดเลือดต้องลงถึง 0`)
}

test('ตายด้วยหนาม: มีใบบันทึกการตาย โดยผู้ฆ่าคือเจ้าของหนาม (สเปก §4)', () => {
  PET_PASSIVES.__spikeTest = {
    name: 'หนามทดสอบ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'thorns', value: { pct: 500 }, step: { pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    // ชุดเดียวกับเทสฟาดต่อ/หนามด้านบนเป๊ะ (ซีด 43) — โอนิฟาด B0 สำเร็จแล้วโดนหนามสวนตายในหมัดเดียวกัน
    const A = [{ id: 'kirin', rarity: 'legendary', element: 'fist', grade: 5 }]
    const B = [
      { id: '__spikeTest', rarity: 'common', element: 'fist', grade: 0 },
      { id: '__spikeTest', rarity: 'common', element: 'fist', grade: 0 },
    ]
    const r = simulateBattle(A, B, 43)

    const silent = r.log.filter(e => e.silent)
    assert.equal(silent.length, 1, 'การตายของกีรินต้องมีใบบันทึกใบเดียว')
    assertSilentShape(silent[0], 'ใบตายจากหนาม')
    assert.equal(silent[0].target, 'A0', 'ผู้ตายคือกีริน')
    assert.equal(silent[0].attacker, 'B0', 'ผู้ฆ่าคือเจ้าของหนามที่กีรินไปตี (สเปก §7.6: ใครสร้างดาเมจ คนนั้นคือผู้ฆ่า)')
    assert.equal(silent[0].side, 'B', 'side ต้องเป็นฝั่งของผู้ฆ่า')

    // ใบการตายต้องอยู่หลังใบ attack ของหมัดที่ทำให้ตาย (เหตุมาก่อนผล) และอยู่ในบีตเดียวกัน
    const parent = r.log.findIndex(e => e.t === 'attack' && e.attacker === 'A0')
    assert.ok(r.log.indexOf(silent[0]) > parent, 'ใบการตายต้องมาหลังหมัดแม่')
  } finally {
    delete PET_PASSIVES.__spikeTest
  }
})

test('ตายด้วย aoeOpener: มีใบบันทึกการตาย โดยผู้ฆ่าคือบาฮามุท (สเปก §4)', () => {
  // 🔴 บาลานซ์ 27 ก.ย. 2026: บาฮามุทลดจาก 150% → 100% ⇒ ตัวเดียวไม่พอฆ่า B0 ก่อนรอบ 1 อีกต่อไป
  //    ใช้ 2 ตัวรวมแรงแทน (เหมือนเทส "aoeOpener: บาฮามุทฆ่าศัตรูก่อนรอบ 1 ได้" ด้านบน)
  // 🔧 บาลานซ์รอบ 1 Task 5: ทีเร็กซ์ย้ายออกจาก onAnyDeath+stackAtk แล้ว — ใช้พยานสังเคราะห์แทน
  //    (เจตนาเดิม: พิสูจน์ลำดับ log ของ "ผลต่อเนื่องจากการตายเงียบ" ไม่เกี่ยวกับทีเร็กซ์เจาะจง)
  PET_PASSIVES.__anyDeathWitness = {
    name: 'พยานฆ่าทดสอบ', icon: '🧪',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 0, max: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [
      { id: 'bahamut', rarity: 'legendary', element: 'fist', grade: 5 },
      { id: 'bahamut', rarity: 'legendary', element: 'fist', grade: 5 },
      { id: '__anyDeathWitness', rarity: 'legendary', element: 'fist', grade: 5 },
    ]
    const B = [{ id: 'blank', rarity: 'common', element: 'fist', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    const silent = r.log.filter(e => e.silent)
    assert.equal(silent.length, 1, 'หนูที่ตายก่อนรอบ 1 ต้องมีใบบันทึก')
    assertSilentShape(silent[0], 'ใบตายจาก aoeOpener')
    assert.equal(silent[0].target, 'B0')
    assert.equal(silent[0].attacker, 'A0', 'ผู้ฆ่าคือบาฮามุท')

    // เหตุ (หมัดเปิด) → ผล (ตาย) → ผลต่อเนื่อง (พยานได้ชั้น) ต้องเรียงตามนี้ใน log
    const opener = r.log.findIndex(e => e.t === 'passive' && e.effect === 'aoeOpener')
    const stack = r.log.findIndex(e => e.t === 'passive' && e.effect === 'stackAtk' && e.uid === 'A2')
    const death = r.log.indexOf(silent[0])
    assert.ok(opener < death && death < stack,
      `ลำดับต้องเป็น aoeOpener(${opener}) → ตาย(${death}) → พยานได้ชั้น(${stack})`)
  } finally {
    delete PET_PASSIVES.__anyDeathWitness
  }
})

test('ตายด้วย guardian: ผู้พิทักษ์ที่ตายจริงมีใบบันทึก โดยผู้ฆ่าคือคนที่สวนหมัดมา (สเปก §4)', () => {
  PET_PASSIVES.__catGuardian = {
    name: 'แมวผู้พิทักษ์ทดสอบ', icon: '🧪',
    parts: [
      { hook: 'onHit', effect: 'guardian', value: { pct: 100 }, step: { pct: 0 } },
      { hook: 'onDeath', effect: 'cheatDeath', value: { times: 1, grit: 0, atkPct: 0 }, step: { times: 0, grit: 0, atkPct: 0 } },
    ],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  PET_PASSIVES.__weakTaunt = {
    name: 'ล่อเป้าทดสอบ', icon: '🧪',
    parts: [{ hook: 'onRound', effect: 'taunt', value: { pct: 0 }, step: { pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  // 🔧 บาลานซ์รอบ 1 Task 5: ทีเร็กซ์ย้ายออกจาก onAnyDeath+stackAtk แล้ว — ใช้พยานสังเคราะห์แทน
  PET_PASSIVES.__anyDeathWitness = {
    name: 'พยานฆ่าทดสอบ', icon: '🧪',
    parts: [{ hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 0, max: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [
      { id: '__catGuardian', rarity: 'common', element: 'fist', grade: 0 },
      { id: '__weakTaunt', rarity: 'common', element: 'scissors', grade: 0 },
    ]
    const B = [{ id: '__anyDeathWitness', rarity: 'legendary', element: 'fist', grade: 5 }]
    const r = simulateBattle(A, B, 1)

    const guardDeath = r.log.find(e => e.silent && e.target === 'A0')
    assert.ok(guardDeath, 'ผู้พิทักษ์ที่ตายจริง (หลัง cheatDeath หมดโควตา) ต้องมีใบบันทึก')
    assertSilentShape(guardDeath, 'ใบตายจาก guardian')
    assert.equal(guardDeath.attacker, 'B0', 'ผู้ฆ่าคือคนที่สวนหมัดมา ไม่ใช่ผู้พิทักษ์เอง (บากุไม่ได้สร้างดาเมจ แค่ย้ายเข้าตัว)')

    const stack = r.log.findIndex(e => e.t === 'passive' && e.effect === 'stackAtk' && e.uid === 'B0')
    assert.ok(r.log.indexOf(guardDeath) < stack, 'ตายก่อน พยานถึงได้ชั้น (เหตุมาก่อนผล)')
  } finally {
    delete PET_PASSIVES.__catGuardian
    delete PET_PASSIVES.__weakTaunt
    delete PET_PASSIVES.__anyDeathWitness
  }
})

test('ศพหนึ่งใบมีบันทึกการตายใบเดียว — เส้นทางซ้อนต้องไม่แจกเครดิตการฆ่าสองคน (สเปก §4.3)', () => {
  // เส้นทางเดียวกับเทส "หนึ่งการตาย = รันฮุคหนึ่งครั้ง" ด้านบนเป๊ะ:
  // T ตี Y → เกราะ Y สะท้อนใส่ T (strike ชั้นใน) → หนามของ T สวน Y ตายกลางชั้นใน
  // ⇒ ชั้นในประกาศการตายไปแล้ว (ผู้ฆ่า = T ผ่านหนาม) · ใบ attack ของ T ที่ชั้นนอกต้อง **ไม่** อ้าง dead ซ้ำ
  PET_PASSIVES.__thornsWitness = {
    name: 'หนามพยานทดสอบ', icon: '🧪',
    parts: [
      { hook: 'onHit', effect: 'thorns', value: { pct: 500 }, step: { pct: 0 } },
      { hook: 'onAnyDeath', effect: 'stackAtk', value: { pct: 12, max: 3 }, step: { pct: 0, max: 0 } },
    ],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  PET_PASSIVES.__armorTest = {
    name: 'เกราะทดสอบ', icon: '🧪',
    parts: [{ hook: 'onHit', effect: 'armorStack', value: { count: 1, pct: 100 }, step: { count: 0, pct: 0 } }],
    desc: 'ทดสอบ', short: 'ทดสอบ',
  }
  try {
    const A = [
      { id: '__thornsWitness', rarity: 'legendary', element: 'scissors', grade: 5 },
      { id: 'blank', rarity: 'common', element: 'scissors', grade: 0 },
    ]
    const B = [{ id: '__armorTest', rarity: 'common', element: 'scissors', grade: 0 }]
    const r = simulateBattle(A, B, 1)

    const marks = r.log.filter(e => e.t === 'attack' && e.dead && e.target === 'B0')
    assert.equal(marks.length, 1,
      `ศพของ B0 ต้องมีใบบันทึกใบเดียว ไม่ใช่ ${marks.length} — สองใบ = battleSummary แจกเครดิต kills สองคนจากศพเดียว`)
    assert.equal(marks[0].silent, true, 'ใบที่ประกาศต้องเป็นใบการตายเงียบของชั้นใน (หนามคือคนฆ่าจริง)')
  } finally {
    delete PET_PASSIVES.__thornsWitness
    delete PET_PASSIVES.__armorTest
  }
})

// ── นิยามรอบใหม่ (26 ก.ย. 2026): "รอบ" = ทุกตัวที่ยังมีชีวิตได้ตาครบคนละ 1 ครั้ง ──
const blank = (n, rarity = 'legendary', element = 'fist') =>
  Array.from({ length: n }, () => ({ id: '__blank__', rarity, element, grade: 0 }))

test('รอบ: 3v3 รอบแรก (ยังไม่มีใครตาย) มีหมัดหลัก 6 หมัดพอดี', () => {
  const r = simulateBattle(blank(3), blank(3), 11)
  const r1 = r.log.findIndex(e => e.t === 'round' && e.n === 1)
  const r2 = r.log.findIndex(e => e.t === 'round' && e.n === 2)
  assert.ok(r1 >= 0 && r2 > r1, 'ต้องมีรอบ 1 และรอบ 2')
  const deaths = r.log.slice(r1, r2).filter(e => e.t === 'attack' && e.dead).length
  assert.equal(deaths, 0, 'seed นี้รอบแรกต้องไม่มีใครตาย (ถ้าล้ม ให้เปลี่ยน seed)')
  const mains = r.log.slice(r1, r2).filter(e => e.t === 'attack' && !e.sub)
  assert.equal(mains.length, 6)
  assert.equal(new Set(mains.map(e => e.attacker)).size, 6, 'ทุกตัวได้ตาคนละครั้ง')
})

test('รอบ: 3v1 ฝั่งตัวเดียวตีได้หลายตาในรอบเดียว แต่รอบจบเมื่อทุกตัวได้ตาครบ', () => {
  const r = simulateBattle(blank(3), blank(1), 5)
  const r1 = r.log.findIndex(e => e.t === 'round' && e.n === 1)
  const r2 = r.log.findIndex(e => e.t === 'round' && e.n === 2)
  const mains = r.log.slice(r1, r2).filter(e => e.t === 'attack' && !e.sub)
  const a = new Set(mains.filter(e => e.side === 'A').map(e => e.attacker))
  assert.equal(a.size, 3, 'ฝั่ง A ครบ 3 ตัว')
  assert.ok(mains.filter(e => e.side === 'B').length >= 2, 'ฝั่ง B ตัวเดียวได้มากกว่า 1 ตา')
})

test('end.rounds = จำนวน round event', () => {
  const r = simulateBattle(blank(3), blank(3), 3)
  const n = r.log.filter(e => e.t === 'round').length
  assert.equal(r.log.at(-1).rounds, n)
  assert.equal(r.rounds, n)
})

// ── ต.ค. 2569 ฟากฟ้า: 🌍 ฤดูหนาว (ช่อง 2) → แช่แข็ง (Task 5) ─────────────────
test('แช่แข็ง: เป้าที่โดน ตาถัดไปของมันคือ frozen ไม่ใช่หมัด', () => {
  const A = [{ id: 'cat', rarity: 'common', element: 'fist', grade: 3 }, { id: 'lion', rarity: 'legendary', element: 'fist', grade: 3 },
             { id: 'earth', rarity: 'legendary', element: 'paper', grade: 3 }]
  const B = blank(3)
  let checked = 0
  for (let seed = 1; seed < 60 && checked < 3; seed++) {
    const log = simulateBattle(A, B, seed).log
    const ci = log.findIndex(e => e.effect === 'seasonCold')
    if (ci < 0) continue
    for (const uid of log[ci].targets) {
      const next = log.slice(ci + 1).find(e => (e.t === 'attack' && e.attacker === uid && !e.sub) || (e.effect === 'frozen' && e.uid === uid))
      if (!next) continue                            // ไฟต์จบก่อนถึงตา
      assert.equal(next.effect, 'frozen', `seed ${seed}: ${uid} ต้องข้ามตา`)
      checked++
    }
  }
  assert.ok(checked > 0, 'ต้องเจอเคสแช่แข็งอย่างน้อย 1')
})

// ── ต.ค. 2569: 🐹 แฮมสเตอร์ช่อง 1 ⇒ ทีมได้ตีก่อนเสมอ ─────────────────────
const withHamster = (slot) =>
  Array.from({ length: 3 }, (_, i) =>
    i === slot ? { id: 'hamster', rarity: 'common', element: 'fist', grade: 0 }
               : { id: '__blank__', rarity: 'common', element: 'fist', grade: 0 })

test('แฮมสเตอร์ช่อง 1: 3v3 เท่ากัน A ตีก่อนทุก seed', () => {
  const A = withHamster(0)
  const B = blank(3, 'common', 'fist')
  for (let seed = 1; seed <= 50; seed++) {
    const first = simulateBattle(A, B, seed).log.find(e => e.t === 'attack')
    assert.equal(first.side, 'A', `seed ${seed}`)
  }
})

test('แฮมสเตอร์ช่อง 2 (ไม่ใช่ช่อง 1): ไม่บังคับ ต้องมี seed ที่ B ตีก่อนบ้าง', () => {
  const A = withHamster(1)
  const B = blank(3, 'common', 'fist')
  let bFirst = 0
  for (let seed = 1; seed <= 50; seed++) {
    const first = simulateBattle(A, B, seed).log.find(e => e.t === 'attack')
    if (first.side === 'B') bFirst++
  }
  assert.ok(bFirst > 0, 'ต้องมีบาง seed ที่ B ตีก่อน (แฮมสเตอร์ไม่ได้อยู่ช่อง 1)')
})

test('แฮมสเตอร์ช่อง 1 ทั้งสองฝั่ง: ฝั่ง A (คนหาห้อง) ตีก่อนเสมอ (user เคาะ 3 ต.ค. 2026)', () => {
  const A = withHamster(0)
  const B = withHamster(0)
  for (let seed = 1; seed <= 50; seed++) {
    const first = simulateBattle(A, B, seed).log.find(e => e.t === 'attack')
    assert.equal(first.side, 'A', `seed ${seed}`)
  }
})

test('A 2 ตัว (มีแฮมสเตอร์ช่อง 1) vs B 3 ตัว: A ตีก่อน (แฮมสเตอร์ชนะกติกาจำนวนตัว)', () => {
  const A = withHamster(0).slice(0, 2)
  const B = blank(3, 'common', 'fist')
  const first = simulateBattle(A, B, 42).log.find(e => e.t === 'attack')
  assert.equal(first.side, 'A')
})

test('simulateBattle ส่ง base = เลขตั้งต้นของทุก uid (ก่อนสกิล) ให้การ์ด', async () => {
  const { simulateBattle } = await import('./battleEngine.js')
  const t = [{ id: 'cat', rarity: 'common', element: 'fist', grade: 0 }]
  const r = simulateBattle(t, t, 1)
  assert.ok(r.base.A0.atk > 0 && r.base.B0.maxHp > 0)
})
