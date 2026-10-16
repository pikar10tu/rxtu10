import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newGame, applyAction, tick, eventDone, eventTaps, removePlayer, normalizeState, timeoutDamage, LEVELS, levelConfig, TEAM_EVENTS, CODE_RED_TAPS_PER_PLAYER } from './pharmateamEngine.js'

// บังคับให้สุ่มได้เหตุการณ์ที่ต้องการ
const rndFor = (kind) => { const i = TEAM_EVENTS.findIndex(e => e.kind === kind); return () => (i + 0.5) / TEAM_EVENTS.length }

const roster = (n) => Array.from({ length: n }, (_, i) => ({ uid: 'u' + i, name: 'p' + i }))
const allControls = (s) => Object.values(s.players).flatMap(p => p.controls)
const ownerOf = (s, cid) => Object.keys(s.players).find(u => s.players[u].controls.some(c => c.id === cid))

test('อุปกรณ์ไม่ซ้ำข้ามคน และคำสั่งไม่ชนกัน (2–7 คน)', () => {
  for (let n = 2; n <= 7; n++) {
    const s = newGame(roster(n), 0)
    const ids = allControls(s).map(c => c.id)
    assert.equal(new Set(ids).size, ids.length)
    if (n <= 7) assert.equal(new Set(allControls(s).map(c => c.base)).size, ids.length, `labels n=${n}`)
    const targets = Object.values(s.players).map(p => p.inst.controlId)
    assert.equal(new Set(targets).size, targets.length)
  }
})

test('ทำคำสั่งถูก → progress +1 และได้คำสั่งใหม่', () => {
  const s = newGame(roster(3), 0)
  const [spUid, sp] = Object.entries(s.players).find(([, p]) => !['hold', 'spam'].includes(
    s.players[p.inst.targetUid].controls.find(c => c.id === p.inst.controlId).type))
  const { targetUid, controlId, target, id } = sp.inst
  assert.ok(applyAction(s, targetUid, controlId, target, 100))
  assert.equal(s.progress, 1)
  assert.notEqual(s.players[spUid].inst.id, id)
})

test('กดค้างโกงไม่ได้ ต้องค้างจริง', () => {
  const s = newGame(roster(2), 0)
  const p = s.players.u0
  p.controls[0] = { id: 'autoclave_0', base: 'autoclave', type: 'hold', label: 'x', holdDuration: 2000 }
  s.players.u1.inst = { id: 'i', prompt: 'x', targetUid: 'u0', controlId: 'autoclave_0', target: true, duration: 9e9, deadline: 9e9 }
  applyAction(s, 'u0', 'autoclave_0', true, 100)
  assert.equal(s.progress, 0)
  applyAction(s, 'u0', 'autoclave_0', 'start', 200)
  applyAction(s, 'u0', 'autoclave_0', true, 2000)
  assert.equal(s.progress, 1)
})

test('กดปุ่มอันตรายมั่ว: ครั้งแรกโดนเอง ครั้งสองลามเพื่อน', () => {
  const s = newGame(roster(3), 0)
  for (const p of Object.values(s.players)) p.inst = null
  s.players.u0.controls[0] = { id: 'diazepam_0', base: 'diazepam', type: 'button', label: 'Dz', hazard: 'sleepy' }
  applyAction(s, 'u0', 'diazepam_0', true, 100)
  assert.equal(s.players.u0.effect.type, 'sleepy')
  assert.ok(!s.players.u1.effect && !s.players.u2.effect)
  applyAction(s, 'u0', 'diazepam_0', true, 200)
  assert.equal([s.players.u1, s.players.u2].filter(p => p.effect?.type === 'sleepy').length, 1)
})

test('คำสั่งหมดเวลา → เลือดลด + คนต้องกดโดนยาหก', () => {
  const s = newGame(roster(2), 0)
  s.eventTimes = []
  const target = s.players.u0.inst.targetUid
  tick(s, LEVELS[0].duration + 1)
  assert.ok(s.health < 100)
  assert.equal(s.players[target].effect.type, 'spill')
})

test('เหตุการณ์ทีม: หยุดเวลาคำสั่ง · ทำครบได้ +จำนวนคน · เวลาคำสั่งเดินต่อจากที่เหลือ', () => {
  const s = newGame(roster(2), 0)
  s.eventTimes = [1000]
  tick(s, 1000, rndFor('shake'))
  assert.ok(s.event)
  const remaining = s.players.u0.inst.remaining
  tick(s, 50000) // เกิน deadline เดิม แต่ไม่ควรหมดเวลาระหว่างเหตุการณ์ — แต่เหตุการณ์เองหมดเวลาแทน
  assert.equal(s.event, null) // ไม่ทัน
  assert.equal(s.health, 100 - Math.round(LEVELS[0].damage * 1.5))
  assert.equal(s.players.u0.inst.deadline, 50000 + remaining)

  s.eventTimes = [60000]
  tick(s, 60000, rndFor('flip'))
  const id = s.event.id, before = s.progress
  eventDone(s, 'u0', id, 60100)
  assert.ok(s.event)
  eventDone(s, 'u1', id, 60200)
  assert.equal(s.event, null)
  assert.equal(s.progress, before + 2)
})

test('ผู้เล่นออก: คำสั่งที่ชี้หาเขาถูกสุ่มใหม่', () => {
  const s = newGame(roster(3), 0)
  removePlayer(s, 'u2', 10)
  for (const p of Object.values(s.players)) if (p.inst) assert.notEqual(p.inst.targetUid, 'u2')
})

test('normalizeState เติม array ที่ RTDB ทิ้ง', () => {
  const s = normalizeState({ players: { a: { name: 'a' } } })
  assert.deepEqual(s.players.a.controls, [])
  assert.deepEqual(s.eventTimes, [])
})

test('เล่นจนผ่านด่าน → levelClear → ด่านถัดไป', () => {
  const s = newGame(roster(2), 0)
  s.eventTimes = []
  let now = 0, guard = 0
  while (s.status === 'playing' && guard++ < 500) {
    now += 10
    for (const sp of Object.values(s.players)) {
      const inst = sp.inst; if (!inst) continue
      const c = s.players[inst.targetUid].controls.find(c => c.id === inst.controlId)
      if (c.type === 'hold') { applyAction(s, inst.targetUid, c.id, 'start', now); applyAction(s, inst.targetUid, c.id, true, now + 2000) }
      else if (c.type === 'spam') for (let i = 0; i < inst.target; i++) applyAction(s, inst.targetUid, c.id, true, now)
      else applyAction(s, inst.targetUid, c.id, inst.target, now)
      if (s.status !== 'playing') break
    }
  }
  assert.equal(s.status, 'levelClear')
  tick(s, s.clearAt)
  assert.equal(s.status, 'playing')
  assert.equal(s.level, 2)
})

test('ดาเมจคำสั่งหมดเวลาหารตามจำนวนคน', () => {
  const d = (n) => timeoutDamage(newGame(roster(n), 0))
  assert.equal(d(1), LEVELS[0].damage)
  assert.equal(d(2), LEVELS[0].damage)
  assert.equal(d(4), Math.round(LEVELS[0].damage / 2))
  assert.ok(d(6) < d(4))
})

test('Code Red: เป้า = ${CODE_RED_TAPS_PER_PLAYER}×คน · แตะรวมถึงเป้าผ่าน · eventDone ใช้ไม่ได้', () => {
  const s = newGame(roster(3), 0)
  s.eventTimes = [10]
  tick(s, 10, rndFor('codered'))
  assert.equal(s.event.kind, 'codered')
  assert.equal(s.event.target, CODE_RED_TAPS_PER_PLAYER * 3)
  const id = s.event.id, before = s.progress
  assert.equal(eventDone(s, 'u0', id, 20), false)
  eventTaps(s, 'u0', id, 999, 20) // โดน clamp เหลือ 20
  assert.equal(s.event.total, 20)
  eventTaps(s, 'u1', id, 10, 30)
  eventTaps(s, 'u2', id, 6, 40)
  assert.equal(s.event, null)
  assert.equal(s.progress, before + 3)
})

test('Code Red ไม่ถึงเป้า: คนแตะน้อยโดนยาหก', () => {
  const s = newGame(roster(2), 0)
  s.eventTimes = [10]
  tick(s, 10, rndFor('codered'))
  eventTaps(s, 'u0', s.event.id, 12, 20)
  tick(s, 10 + 7000)
  assert.equal(s.event, null)
  assert.ok(!s.players.u0.effect)
  assert.equal(s.players.u1.effect.type, 'spill')
})

test('Endless: ไม่มีชนะ ด่าน 6+ ต่อได้เรื่อยๆ และยากขึ้น', () => {
  assert.equal(levelConfig(1).perPlayer, 16)
  assert.equal(levelConfig(5).perPlayer, 24)
  assert.ok(levelConfig(8).duration < levelConfig(6).duration)
  assert.equal(levelConfig(100).duration, 4000)
  assert.equal(levelConfig(100).damage, 30)
  assert.match(levelConfig(7).name, /^Lv.7 /)
  const s = newGame(roster(2), 0)
  s.level = 5; s.progress = s.maxProgress - 1; s.eventTimes = []
  const sp = Object.values(s.players).find(p => { const c = s.players[p.inst.targetUid].controls.find(c => c.id === p.inst.controlId); return !['hold','spam'].includes(c.type) })
  applyAction(s, sp.inst.targetUid, sp.inst.controlId, sp.inst.target, 10)
  assert.equal(s.status, 'levelClear')
  tick(s, s.clearAt)
  assert.equal(s.level, 6)
})
