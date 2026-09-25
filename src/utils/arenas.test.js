import test from 'node:test'
import assert from 'node:assert/strict'
import { ARENAS, ARENA_TIERS, DEFAULT_ARENA, getArena, arenaPrice } from '../data/arenas.js'
import {
  arenaOf, onSale, shopList, canBuyArena, afterBuyArena, afterWearArena, rosterArena, parseArenaRef,
} from './arenas.js'

// เวลาไทย = UTC+7 · 2026-10-01 00:00 ไทย = 2026-09-30 17:00Z
const TH = (s) => Date.parse(s + '+07:00')

test('ทะเบียน: id ไม่ซ้ำ · tier รู้จัก · แชมป์มี season · ลิมิเต็ดมี sale · power เผื่อไว้เป็น null', () => {
  const ids = ARENAS.map(a => a.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const a of ARENAS) {
    assert.ok(ARENA_TIERS[a.tier], a.id)
    assert.ok(a.floor, a.id)
    assert.equal(a.power, null, a.id)
    if (a.src === 'champ') assert.match(a.season, /^\d{4}-\d{2}$/, a.id)
    if (a.src === 'limited') assert.ok(a.sale?.from && a.sale?.to, a.id)
    if (a.src === 'champ') assert.equal(a.id, 'ch-' + a.season)
  }
  assert.ok(getArena(DEFAULT_ARENA))
  assert.ok(getArena('ch-2026-09'))
})

test('ราคา: RARE 10k · EPIC 50k · LEGENDARY 100k (user เคาะ)', () => {
  assert.equal(arenaPrice(getArena('ar-lab')), 10000)
  assert.equal(arenaPrice(getArena('ar-sakura')), 50000)
  assert.equal(arenaPrice(getArena('ar-space')), 100000)
})

test('arenaOf: กรองของไม่รู้จัก · on ที่ไม่มี = สนามเริ่มต้น · ของฟรีมีเสมอ', () => {
  const a = arenaOf({ arenas: { owned: ['ar-lab', 'zz-gone'], on: 'ar-space', champ: { '2026-09': 3 } } })
  assert.deepEqual(a.owned, [DEFAULT_ARENA, 'ar-lab'])
  assert.equal(a.on, DEFAULT_ARENA)
  assert.deepEqual(a.champ, { '2026-09': 3 })
  assert.equal(arenaOf({ arenas: { owned: ['ar-lab'], on: 'ar-lab' } }).on, 'ar-lab')
  assert.deepEqual(arenaOf(null), { owned: [DEFAULT_ARENA], on: DEFAULT_ARENA, champ: {} })
})

test('onSale: ร้าน = ขายตลอด · แชมป์/ฟรี = ไม่ขาย · ลิมิเต็ดตามช่วงเวลาไทย', () => {
  const now = TH('2026-09-25T12:00:00')
  assert.equal(onSale(getArena('ar-lab'), now), true)
  assert.equal(onSale(getArena('ch-2026-09'), now), false)
  assert.equal(onSale(getArena(DEFAULT_ARENA), now), false)
  const exam = getArena('ar-exam')   // 2026-10-01 → 2026-12-10
  assert.equal(onSale(exam, TH('2026-09-30T23:59:00')), false)
  assert.equal(onSale(exam, TH('2026-10-01T00:00:00')), true)
  assert.equal(onSale(exam, TH('2026-12-10T23:59:00')), true)
  assert.equal(onSale(exam, TH('2026-12-11T00:00:00')), false)
})

test('shopList: ไม่มีแชมป์ ไม่มีของที่มีแล้ว ลิมิเต็ดขึ้นเฉพาะช่วงขาย', () => {
  const u = { arenas: { owned: ['ar-lab'] } }
  const ids = (now) => shopList(u, now).map(a => a.id)
  const sep = ids(TH('2026-09-25T12:00:00'))
  assert.ok(!sep.includes('ar-lab'))
  assert.ok(!sep.includes('ch-2026-09'))
  assert.ok(!sep.includes(DEFAULT_ARENA))
  assert.ok(!sep.includes('ar-exam'))
  assert.ok(sep.includes('ar-grass'))
  assert.ok(ids(TH('2026-10-05T12:00:00')).includes('ar-exam'))
  assert.ok(ids(TH('2026-11-05T12:00:00')).includes('ar-loy'))
})

test('canBuyArena ทุกเหตุผล', () => {
  const now = TH('2026-09-25T12:00:00')
  const rich = { coins: 1e6, arenas: { owned: ['ar-lab'] } }
  assert.deepEqual(canBuyArena(rich, 'nope', now), { ok: false, reason: 'unknown', price: 0 })
  assert.equal(canBuyArena(rich, 'ar-lab', now).reason, 'owned')
  assert.equal(canBuyArena(rich, 'ch-2026-09', now).reason, 'closed')
  assert.equal(canBuyArena(rich, 'ar-exam', now).reason, 'closed')
  assert.equal(canBuyArena({ coins: 9999 }, 'ar-grass', now).reason, 'coins')
  assert.deepEqual(canBuyArena({ coins: 10000 }, 'ar-grass', now), { ok: true, reason: null, price: 10000 })
})

test('afterBuyArena ใส่ทันที · afterWearArena ใส่ได้เฉพาะของที่มี', () => {
  const u = { arenas: { owned: ['ar-lab'], on: 'ar-lab', champ: { '2026-09': 1 } } }
  assert.deepEqual(afterBuyArena(u, 'ar-grass'),
    { owned: [DEFAULT_ARENA, 'ar-lab', 'ar-grass'], on: 'ar-grass', champ: { '2026-09': 1 } })
  assert.equal(afterWearArena(u, 'ar-space').on, 'ar-lab')
  assert.equal(afterWearArena(u, DEFAULT_ARENA).on, DEFAULT_ARENA)
})

test('rosterArena: ฟรี = null · ทั่วไป = id · แชมป์ = id#อันดับ', () => {
  assert.equal(rosterArena({}), null)
  assert.equal(rosterArena({ arenas: { owned: ['ar-lab'], on: 'ar-lab' } }), 'ar-lab')
  assert.equal(rosterArena({ arenas: { owned: ['ch-2026-09'], on: 'ch-2026-09', champ: { '2026-09': 3 } } }), 'ch-2026-09#3')
  // แชมป์ไม่มีอันดับบันทึก (ข้อมูลเพี้ยน) = ป้ายระดับท็อป 10
  assert.equal(rosterArena({ arenas: { owned: ['ch-2026-09'], on: 'ch-2026-09' } }), 'ch-2026-09#10')
})

test('parseArenaRef', () => {
  assert.deepEqual(parseArenaRef(null), { id: DEFAULT_ARENA, rank: null })
  assert.deepEqual(parseArenaRef('zz'), { id: DEFAULT_ARENA, rank: null })
  assert.deepEqual(parseArenaRef('tower'), { id: 'tower', rank: null })
  assert.deepEqual(parseArenaRef('ar-lab'), { id: 'ar-lab', rank: null })
  assert.deepEqual(parseArenaRef('ch-2026-09#2'), { id: 'ch-2026-09', rank: 2 })
  assert.deepEqual(parseArenaRef('ch-2026-09#7'), { id: 'ch-2026-09', rank: 10 })   // 4–10 ใช้ป้ายเดียวกัน
  assert.deepEqual(parseArenaRef('ch-2026-09'), { id: 'ch-2026-09', rank: 10 })
})
