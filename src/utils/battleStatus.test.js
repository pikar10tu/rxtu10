import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyStatus, statusN, statusCount, consumeSkip, turnEndTicks, cleanseOne, cleanseAll, statusAtkMult, statusDmgTakenMult, canHeal } from './battleStatus.js'
import { bossImmune } from '../data/statuses.js'
import { simulateBattle } from './battleEngine.js'

const U = (o = {}) => ({ uid: 'A0', side: 'A', hp: 1000, maxHp: 1000, atk: 100, ...o })

test('แปะซ้ำ = เพิ่มก้อน นับเทิร์นแยก (เพดานก้อน) · ข้ามตา/single = ก้อนเดียวเลือกที่ยาวกว่า', () => {
  const u = U()
  applyStatus(u, 'burn', { n: 2 }); applyStatus(u, 'burn', { n: 1 })
  assert.equal(statusN(u, 'burn'), 2, 'ป้าย = เทิร์นของก้อนที่นานสุด')
  assert.equal(statusCount(u, 'burn'), 2)
  applyStatus(u, 'burn'); applyStatus(u, 'burn')
  assert.equal(statusCount(u, 'burn'), 3, 'เพดาน 3 ก้อน')
  applyStatus(u, 'freeze', { n: 1 }); applyStatus(u, 'freeze', { n: 2 }); applyStatus(u, 'freeze', { n: 1 })
  assert.equal(statusCount(u, 'freeze'), 1); assert.equal(statusN(u, 'freeze'), 2, 'แช่ไม่ซ้อน · เลือกที่ยาวกว่า')
})

test('ต้านทาน: บอสกันทุกอย่าง ยกเว้นที่เปิดไว้', () => {
  const boss = U({ immune: bossImmune(['burn']) })
  assert.equal(applyStatus(boss, 'freeze').immune, true)
  assert.equal(applyStatus(boss, 'burn').ok, true)
  assert.ok(boss.immune.includes('away'), 'บอสกัน 🛸 ดูดเสมอ')
})

test('ข้าม 1 ตา ลดสถานะข้ามตาทุกตัวตัวละ 1 · 😱 หักเลือดตาม val', () => {
  const u = U(), ghost = { uid: 'B0', side: 'B' }
  applyStatus(u, 'freeze', { n: 1 }); applyStatus(u, 'fear', { n: 2, val: 20, from: ghost })
  const r = consumeSkip(u)
  assert.equal(r.id, 'freeze')
  assert.deepEqual(r.left, { freeze: 0, fear: 1 })
  assert.equal(r.selfDmg, 20); assert.equal(r.dmgFrom, ghost)
  assert.equal(consumeSkip(u).left.fear, 0)
  assert.equal(consumeSkip(u), null)
})

test('ท้ายตา: ทุกก้อนทำงานแยก (ลุกไหม้ 5%/ก้อน) แล้วเทิร์นลด 1 · พิษใช้ค่าที่ล็อก', () => {
  const u = U()
  applyStatus(u, 'burn', { n: 2 }); applyStatus(u, 'burn', { n: 1 }); applyStatus(u, 'poison', { val: 30 })
  const t = turnEndTicks(u)
  assert.equal(t.filter(x => x.id === 'burn').reduce((a, x) => a + x.dmg, 0), 100, '2 ก้อน × 5%')
  assert.equal(t.find(x => x.id === 'poison').dmg, 30)
  assert.equal(statusN(u, 'burn'), 1); assert.equal(statusCount(u, 'burn'), 1, 'ก้อน 1 เทิร์นหมดไป')
  assert.equal(statusN(u, 'poison'), 2)
})

test('ตัวคูณ: อ่อนแรง −20% · เกราะแตก +15%/ก้อน · ห้ามฟื้น · สถานะติดตลอดช่วงหมดอายุท้ายตา', () => {
  const u = U()
  applyStatus(u, 'weaken'); applyStatus(u, 'armorBreak'); applyStatus(u, 'armorBreak'); applyStatus(u, 'healBlock')
  assert.equal(statusAtkMult(u), 0.8)
  assert.ok(Math.abs(statusDmgTakenMult(u) - 1.3) < 1e-9)
  assert.equal(canHeal(u), false)
  turnEndTicks(u); turnEndTicks(u)
  assert.equal(canHeal(u), true, 'ห้ามฟื้น 2 เทิร์นหมดแล้ว')
})

test('ล้าง: 🦄 ล้างชนิดละ 1 ก้อน · ป้ายนับ (เชื้อ) หายทั้งก้อน · มาสก์ล้างไม่ได้ · ☄️ ล้างหมด · สถานะดีไม่โดน', () => {
  const u = U()
  applyStatus(u, 'burn', { n: 2 }); applyStatus(u, 'burn', { n: 2 }); applyStatus(u, 'rally')
  u.ps.infect = { n: 3 }; u.ps.spark = 2
  const left = cleanseOne(u)
  assert.equal(left.burn, 2); assert.equal(statusCount(u, 'burn'), 1)
  assert.equal(left.infect, 0); assert.equal(u.ps.infect, undefined, 'เชื้อหายทั้งก้อน')
  assert.equal(u.ps.spark, 2, 'มาสก์ล้างไม่ได้')
  u.ps.infect = { n: 1 }
  assert.deepEqual(cleanseAll(u).sort(), ['burn', 'infect'])
  assert.equal(u.ps.spark, 2)
  assert.equal(statusN(u, 'rally'), 2)
})

test('เอนจิน: ลุกไหม้ทำงานท้ายตา (หลังตี) และตายจากไฟ = มีคนฆ่า', () => {
  const a = [{ id: 'blank', rarity: 'common', element: 'fist', grade: 1, startStatus: [{ id: 'burn', n: 3 }] }]
  const b = [{ id: 'blank', rarity: 'common', element: 'fist', grade: 1 }]
  const r = simulateBattle(a, b, 42)
  const i = r.log.findIndex(e => e.effect === 'statusTick' && e.statusId === 'burn')
  assert.ok(i > 0, 'ต้องมีไฟทำงาน')
  const prevAtk = r.log.slice(0, i).reverse().find(e => e.t === 'attack')
  assert.equal(prevAtk?.attacker, 'A0', 'ไฟลงหลังหมัดของตัวที่ติด')
})

test('เอนจิน: หวาดกลัว = ข้ามตา + เสียเลือด · ป้ายข้ามตาใช้ชื่อจากทะเบียน', () => {
  const a = [{ id: 'blank', rarity: 'common', element: 'fist', grade: 3, startStatus: [{ id: 'fear', n: 2, val: 5 }] }]
  const b = [{ id: 'blank', rarity: 'common', element: 'fist', grade: 3 }]
  const r = simulateBattle(a, b, 7)
  const skips = r.log.filter(e => e.fxKind === 'skip' && e.uid === 'A0')
  assert.equal(skips.length, 2)
  assert.equal(skips[0].name, 'หวาดกลัว')
  assert.equal(r.log.filter(e => e.effect === 'statusTick' && e.statusId === 'fear').length, 2)
})

test('☄️ ดาวหาง: พรตัวที่ติดสถานะร้ายหลายชนิดสุด ล้างหมด + ฟื้น + โล่พรลดหมัดแรก', async () => {
  const { runOnRound } = await import('./battlePassives.js')
  const mk = (id, uid, slot, hp) => ({ id, uid, slot, side: 'A', rarity: 'legendary', grade: 1, level: 1, hp, maxHp: 1000, atk: 100 })
  const comet = mk('comet', 'A0', 0, 1000), a = mk('blank', 'A1', 1, 900), b = mk('blank', 'A2', 2, 200)
  applyStatus(a, 'burn'); applyStatus(a, 'weaken')   // 2 ชนิด (เลือดเยอะกว่า b แต่ติดมากกว่า)
  applyStatus(b, 'burn')
  const out = runOnRound([comet, a, b]).find(e => e.effect === 'cometBless')
  assert.deepEqual(out.targets, ['A1'])
  assert.equal(statusN(a, 'burn') + statusN(a, 'weaken'), 0)
  assert.equal(a.hp, 1000, 'ฟื้น 12% (ตัน 1000)')
  const { consumeBlessShield } = await import('./battleStatus.js')
  assert.equal(consumeBlessShield(a, 100).dmg, 85)
  assert.equal(consumeBlessShield(a, 100).used, false, 'ใช้หมดแล้ว')
})
