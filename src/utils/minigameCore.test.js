import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MINIGAMES, getMinigame } from '../data/minigames.js'
import { normalizeUserData, USER_DEFAULTS } from '../data/userSchema.js'
import {
  applyJump, stepBird, stepPipes, collides, scorePassed, grantCoins, buildMinigameBoard,
} from './minigameCore.js'

test('registry: capsuleRush live + fields ครบ', () => {
  const g = getMinigame('capsuleRush')
  assert.ok(g, 'ต้องมี capsuleRush')
  assert.equal(g.status, 'live')
  assert.equal(g.coinPerPoint, 5)
  assert.ok(g.maxPlausibleScore > 0)
  assert.ok(g.route.startsWith('/play/games/'))
})

test('registry: ทุกเกมมี key/name/status', () => {
  for (const g of MINIGAMES) {
    assert.ok(g.key && g.name && g.status, `${g.key} ต้องครบ`)
  }
})

test('schema: minigames default เป็น object', () => {
  assert.deepEqual(USER_DEFAULTS.minigames, {})
})

test('normalize: doc เก่าไม่มี minigames → object ว่าง (ไม่ crash)', () => {
  const d = normalizeUserData({ coins: 10 })
  assert.deepEqual(d.minigames, {})
})

test('normalize: minigames ที่มีอยู่ถูกคงไว้', () => {
  const d = normalizeUserData({ minigames: { capsuleRush: { best: 42, plays: 3 } } })
  assert.equal(d.minigames.capsuleRush.best, 42)
})

test('normalize: minigames ผิดชนิด (array) → object ว่าง', () => {
  const d = normalizeUserData({ minigames: [1, 2] })
  assert.deepEqual(d.minigames, {})
})

const CFG = { gravity: 1600, jump: -520, birdX: 80, birdR: 18, pipeW: 70, worldH: 600 }

test('applyJump: ตั้ง vy = jump', () => {
  assert.equal(applyJump({ y: 300, vy: 100 }, CFG).vy, -520)
})

test('stepBird: gravity เพิ่ม vy, y ขยับตาม vy', () => {
  const b = stepBird({ y: 300, vy: 0 }, 0.5, CFG)
  assert.equal(b.vy, 800)          // 0 + 1600*0.5
  assert.equal(b.y, 300)           // 300 + 0*0.5 (ใช้ vy เดิมก่อน integrate)
})

test('stepPipes: เลื่อนซ้าย (ยังไม่หลุด) — x ลดลง', () => {
  const out = stepPipes([{ x: 200, gapY: 200, gapH: 160, scored: false }], 0.1, 300)
  assert.equal(out.length, 1)
  assert.equal(out[0].x, 170)      // 200 - 300*0.1
})

test('stepPipes: ตัดท่อที่หลุดจอซ้าย (x + 70 <= 0)', () => {
  // x=5, speed=300, dt=0.3 → 5 - 90 = -85 ; -85 + 70 = -15 <= 0 → ถูกตัด
  const out = stepPipes([{ x: 5, gapY: 200, gapH: 160, scored: false }], 0.3, 300)
  assert.equal(out.length, 0)
})

test('collides: ตกพื้นล่าง = true', () => {
  assert.equal(collides({ y: 620, vy: 0 }, [], CFG), true)
})

test('collides: ทะลุเพดาน = true', () => {
  assert.equal(collides({ y: -5, vy: 0 }, [], CFG), true)
})

test('collides: กลางจอ ไม่มีท่อ = false', () => {
  assert.equal(collides({ y: 300, vy: 0 }, [], CFG), false)
})

test('collides: ชนท่อ (นกอยู่ในคอลัมน์ท่อ นอกช่อง) = true', () => {
  const pipe = { x: 70, gapY: 100, gapH: 120, scored: false } // ช่อง 100..220
  assert.equal(collides({ y: 400, vy: 0 }, [pipe], CFG), true)
})

test('collides: อยู่ในช่องท่อ = false', () => {
  const pipe = { x: 70, gapY: 100, gapH: 120, scored: false }
  assert.equal(collides({ y: 160, vy: 0 }, [pipe], CFG), false)
})

test('scorePassed: ท่อผ่าน birdX ครั้งแรก → +1 + mark scored', () => {
  const pipe = { x: 5, gapY: 100, gapH: 120, scored: false } // x+pipeW=75 < birdX=80
  const r = scorePassed({ y: 160, vy: 0 }, [pipe], CFG)
  assert.equal(r.gained, 1)
  assert.equal(r.pipes[0].scored, true)
})

test('scorePassed: ท่อที่ scored แล้ว ไม่ +ซ้ำ', () => {
  const pipe = { x: 5, gapY: 100, gapH: 120, scored: true }
  assert.equal(scorePassed({ y: 160, vy: 0 }, [pipe], CFG).gained, 0)
})

test('grantCoins: ปกติ = score * coinPerPoint', () => {
  assert.deepEqual(grantCoins(40, { coinPerPoint: 5, maxPlausibleScore: 500 }),
    { coins: 200, flagged: false })
})

test('grantCoins: เกินเพดาน → clamp + flagged', () => {
  assert.deepEqual(grantCoins(999, { coinPerPoint: 5, maxPlausibleScore: 500 }),
    { coins: 2500, flagged: true })
})

test('buildMinigameBoard: sort desc + filter best>0 + top50', () => {
  const fb = {
    '01': { uid: 'a', studentId: '01', nickname: 'A', best: undefined, minigames: { cr: { best: 10 } } },
    '02': { uid: 'b', studentId: '02', nickname: 'B', minigames: { cr: { best: 30 } } },
    '03': { uid: 'c', studentId: '03', nickname: 'C', minigames: {} }, // best 0 → ตัดออก
  }
  const rows = buildMinigameBoard(fb, null, 'cr')
  assert.equal(rows.length, 2)
  assert.equal(rows[0].nickname, 'B')
  assert.equal(rows[0].best, 30)
})

test('buildMinigameBoard: overlay me ด้วย best สดกว่า cache + isMe', () => {
  const fb = { '02': { uid: 'b', studentId: '02', nickname: 'Me', minigames: { cr: { best: 5 } } } }
  const me = { uid: 'b', studentId: '02', nickname: 'Me', track: 'sci', best: 50 }
  const rows = buildMinigameBoard(fb, me, 'cr')
  assert.equal(rows[0].best, 50)     // ใช้ best สดจาก me ไม่ใช่ 5 จาก cache
  assert.equal(rows[0].isMe, true)
})

test('buildMinigameBoard: me ยังไม่อยู่ใน fbUsers → เพิ่มเข้าไป', () => {
  const me = { uid: 'z', studentId: '99', nickname: 'New', track: 'care', best: 7 }
  const rows = buildMinigameBoard({}, me, 'cr')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].isMe, true)
})
