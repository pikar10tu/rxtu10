import { test } from 'node:test'
import assert from 'node:assert/strict'
import { simulateBattle } from './battleEngine.js'
import { releasedPets, obtainablePets } from './petCatalog.js'
import { PETS } from '../data/index.js'
import { eventState } from './gachaEvent.js'

const NEW_WAVE = ['ghost', 'comet', 'nemesis', 'robot', 'alien', 'ufo']   // พ.ย. 2026 — เติมตัวใหม่ที่นี่ทุกตัว

test('🙈⏰ เพ็ท พ.ย. ซ่อนจนถึง 1 พ.ย. 00:00 (เวลาไทย) แล้วเข้าตู้ธีมเอง · สิ้นเดือนไหลเข้าตู้ปกติ', () => {
  for (const id of NEW_WAVE) assert.equal(PETS.find(p => p.id === id)?.wave, 4, `${id} ต้อง wave 4`)
  const octEvent = { wave: 3, endsAt: Date.parse('2026-10-20T00:00:00+07:00') }
  const has = (list, id) => list.some(p => p.id === id)
  for (const cfg of [null, {}, octEvent]) {
    const before = Date.parse('2026-10-31T23:59:59+07:00')
    for (const id of NEW_WAVE) {
      assert.ok(!has(obtainablePets(cfg, before), id) && !has(releasedPets(cfg, before), id), `${id} หลุดก่อนเวลา`)
    }
    const nov = Date.parse('2026-11-01T00:00:00+07:00')
    for (const id of NEW_WAVE) {
      assert.ok(has(obtainablePets(cfg, nov), id), `${id} ต้องอยู่ตู้ธีมตอนเปิด`)
      assert.ok(!has(releasedPets(cfg, nov), id), `${id} ห้ามอยู่ตู้ปกติระหว่างอีเวนต์`)
    }
    const dec = Date.parse('2026-12-01T00:00:01+07:00')
    for (const id of NEW_WAVE) assert.ok(has(releasedPets(cfg, dec), id), `${id} ต้องไหลเข้าตู้ปกติหลังจบ`)
  }
  assert.equal(eventState(octEvent, Date.parse('2026-11-01T00:00:00+07:00')).active, true)
  assert.equal(eventState(octEvent, Date.parse('2026-11-01T00:00:00+07:00')).name, 'Unknown Visitors')
})

test('👻 ตายแล้วแบร่ใส่คนฆ่า → หวาดกลัว 2 ขั้น · เป้าข้ามตา + เสียเลือด', () => {
  let found = 0
  for (let seed = 1; seed <= 40 && !found; seed++) {
    const a = [{ id: 'ghost', rarity: 'legendary', element: 'scissors', grade: 1 }]
    const b = [{ id: 'blank', rarity: 'legendary', element: 'fist', grade: 5 }, { id: 'blank', rarity: 'common', element: 'fist', grade: 1 }]
    const r = simulateBattle(a, b, seed)
    const i = r.log.findIndex(e => e.boo)
    if (i < 0) continue
    found++
    const boo = r.log[i]
    const kill = r.log.slice(0, i).reverse().find(e => e.t === 'attack' && e.target === 'A0' && e.dead)
    assert.equal(boo.targets[0], kill.attacker, 'แบร่ใส่ตัวที่ฆ่า')
    assert.equal(boo.stacks[kill.attacker], 2)
  }
  assert.ok(found, 'ต้องเจอไฟต์ที่ผีตาย')
})

test('👤 เนเมซิส: ซ่อนขณะเพื่อนครบ · เพื่อนตาย = แค้น + ไล่คนฆ่า', async () => {
  const { nemesisHidden, targetableFoes, runOnDied } = await import('./battlePassives.js')
  const mk = (id, uid, slot, side = 'B') => ({ id, uid, slot, side, rarity: 'legendary', grade: 1, level: 1, hp: 500, maxHp: 500, atk: 100 })
  const nem = mk('nemesis', 'B0', 0), f1 = mk('blank', 'B1', 1), f2 = mk('blank', 'B2', 2)
  const team = [nem, f1, f2]
  assert.ok(nemesisHidden(nem, team))
  assert.deepEqual(targetableFoes(team).map(u => u.uid), ['B1', 'B2'])
  const killer = mk('blank', 'A0', 0, 'A')
  f1.hp = 0
  const ev = runOnDied(f1, [killer], killer, team).find(e => e.effect === 'revenge')
  assert.equal(ev.amount, 1)
  assert.equal(Math.round(nem.atk), 130)
  assert.equal(nem.ps.revengeOn, 'A0')
  assert.ok(!nemesisHidden(nem, team), 'เพื่อนไม่ครบ = โผล่')
  f2.hp = 0; runOnDied(f2, [killer], killer, team)
  assert.equal(Math.round(nem.atk), 160, 'ชั้น 2 = +60% ของฐาน (ไม่ทบต้น)')
  // เหลือตัวเดียวก็เลือกได้
  assert.deepEqual(targetableFoes([nem]).map(u => u.uid), ['B0'])
})

test('🤖 โรบอท: เลือด +20% · ATK −15% · หมัดสายเดิมเบาลงสะสม', () => {
  const robo = [{ id: 'robot', rarity: 'legendary', element: 'paper', grade: 3 }]
  const plain = [{ id: 'blank', rarity: 'legendary', element: 'paper', grade: 3 }]
  const foe = [{ id: 'blank', rarity: 'legendary', element: 'paper', grade: 3 }]
  const r1 = simulateBattle(robo, foe, 5), r0 = simulateBattle(plain, foe, 5)
  assert.ok(Math.abs(r1.base.A0.maxHp / r0.base.A0.maxHp - 1.2) < 0.02, 'เลือดสูงสุด +20% (เลขบนการ์ดปัดเป็นจำนวนเต็ม)')
  assert.ok(r1.base.A0.atk < r0.base.A0.atk, 'ATK ลด')
  // หมัดของศัตรูใส่โรบอท: เทียบกับไฟต์ปกติ seed เดียวกัน หมัดที่ 2 ต้องเบากว่าหมัดที่ 1 ราว 10% (variance คนละหมัด) — เช็คแนวโน้มรวม
  const hitsOn = (r) => r.log.filter(e => e.t === 'attack' && e.target === 'A0' && !e.sub).map(e => e.dmg)
  const a = hitsOn(r1), b = hitsOn(r0)
  const n = Math.min(a.length, b.length, 6)
  assert.ok(n >= 3)
  assert.ok(a[0] === b[0], 'หมัดแรกเต็มเท่ากัน')
  for (let i = 1; i < n; i++) assert.ok(a[i] < b[i], `หมัดที่ ${i + 1} ต้องเบากว่า`)
})

test('👽 เอเลี่ยน: ตีโดนแล้วเป้าตีพวกเดียวกัน (mind) · คนฆ่าเป็นเอเลี่ยน · ไม่มีหนามสวนเพื่อน', () => {
  let seen = 0
  for (let seed = 1; seed <= 30; seed++) {
    const a = [{ id: 'alien', rarity: 'legendary', element: 'scissors', grade: 5 }]
    const b = [{ id: 'hedgehog', rarity: 'common', element: 'paper', grade: 1 }, { id: 'blank', rarity: 'common', element: 'paper', grade: 1 }]
    const r = simulateBattle(a, b, seed)
    r.log.forEach((e, i) => {
      if (e.t !== 'attack' || !e.mind) return
      seen++
      assert.equal(e.side, 'B', 'ตัวที่ถูกควบคุมฝั่ง B เป็นคนตี')
      assert.ok(e.target.startsWith('B'), 'ตีพวกเดียวกัน')
      assert.ok(!r.log.slice(i + 1, i + 3).some(x => x.fxKind === 'thorns' && x.targets?.[0]?.startsWith('B')), 'หนามไม่สวนเพื่อน')
    })
  }
  assert.ok(seen > 0, 'ต้องเจอหมัดควบคุม')
})

test('🛸 ยูเอฟโอ: ดูดเป้า → ตัวที่ถูกดูดไม่ได้ตา/ไม่โดนตี → ปล่อย + ตกกระแทก · ไฟต์ไม่ค้าง', () => {
  let abducts = 0, drops = 0
  for (let seed = 1; seed <= 40; seed++) {
    const a = [{ id: 'ufo', rarity: 'legendary', element: 'fist', grade: 3 }, { id: 'blank', rarity: 'rare', element: 'fist', grade: 3 }]
    const b = [{ id: 'blank', rarity: 'rare', element: 'paper', grade: 3 }, { id: 'blank', rarity: 'rare', element: 'paper', grade: 3 }, { id: 'blank', rarity: 'rare', element: 'paper', grade: 3 }]
    const r = simulateBattle(a, b, seed)
    const end = r.log[r.log.length - 1]
    assert.equal(end.t, 'end')
    let away = null
    for (const e of r.log) {
      if (e.effect === 'abduct') { abducts++; away = e.targets[0] }
      else if (e.effect === 'ufoRelease') away = null
      else if (e.effect === 'ufoDrop') drops++
      else if (away && e.t === 'attack' && !e.silent) {
        assert.notEqual(e.attacker, away, 'ตัวที่ถูกดูดต้องไม่ได้ตี')
        assert.notEqual(e.target, away, 'ตัวที่ถูกดูดต้องไม่โดนตี')
      }
    }
  }
  assert.ok(abducts > 0 && drops > 0)
})

test('🛸 บอสกันการดูด (immune away) = ตีปกติ', () => {
  const r = simulateBattle([{ id: 'ufo', rarity: 'legendary', element: 'fist', grade: 3 }],
    [{ id: 'blank', rarity: 'legendary', element: 'fist', grade: 5, immune: ['away'] }], 3)
  assert.ok(!r.log.some(e => e.effect === 'abduct'))
  assert.ok(r.log.some(e => e.t === 'attack' && e.attacker === 'A0'))
})

test('👽 เครดิตดาเมจ/การฆ่าของหมัดควบคุมเป็นของเอเลี่ยน (หน้าสรุป/MVP)', async () => {
  let seen = 0
  for (let seed = 1; seed <= 30; seed++) {
    const r = simulateBattle([{ id: 'alien', rarity: 'legendary', element: 'scissors', grade: 5 }],
      [{ id: 'blank', rarity: 'common', element: 'paper', grade: 1 }, { id: 'blank', rarity: 'common', element: 'paper', grade: 1 }], seed)
    for (const e of r.log) if (e.t === 'attack' && e.mind) { seen++; assert.equal(e.credit, 'A0') }
  }
  assert.ok(seen > 0)
})
