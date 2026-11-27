// 🥊 หมัดปิดฉากสนามมวย (27 พ.ย. 2026) — ตรรกะล้วน · ไฟต์จริง (RingLayer) กับรีเพลย์ (RingReplay) ใช้ตัวเดียวกัน
//  k = { s, hold, spd, zone, seed }  ← คนชนะเขียนไว้ใน match.k แล้วติดไปกับกระดานผล
//     s = ตำแหน่งลูกศรตอนปล่อย 0..1 · hold = กดค้างนานกี่ ms · spd = ความเร็วลูกศร · zone = ความกว้างโซนแดง · seed = เมล็ดสุ่มการเด้ง
//     k = null / s < 0 = ไม่กดภายในเวลา → ต่อยแล้วล้มเฉยๆ
//  ฟิสิกส์สเต็ปคงที่ 1/120 วิ + สุ่มจาก seed → ทุกเครื่องและรีเพลย์กระเด็นทางเดียวกันเป๊ะ
import { RING } from './ringMatch.js'

export const GAUGE_MS = 5000
export const ARROW_SPD = 0.9      // รอบ/วิ (ไปกลับ = 2)
export const RED_ZONE = 0.14
export const STEP = 1 / 120
const G = 260, FLOOR_RING = 80, FLOOR_OUT = 95, BOUNCE_S = 0.5
const inRing = (x) => x > RING.x0 - 4 && x < RING.x1 + 4

export function mulberry(a) {
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}
/** ลูกศรขึ้นลง: เฟส (รอบ) → ตำแหน่ง 0..1 */
export const arrowAt = (ph) => { const p = ((ph % 2) + 2) % 2; return p < 1 ? p : 2 - p }
/** แรงจาก k: -1 = ล้มเฉยๆ · 0.08..0.85 = ปกติ · 0.95..1 = โซนแดง (บินชนขอบจอ) */
export function powerOf(k) {
  if (!k || !(k.s >= 0)) return -1
  const z = k.zone || RED_ZONE
  return k.s >= 1 - z ? 0.95 + 0.05 * Math.min(1, (k.s - (1 - z)) / z) : Math.max(0.08, k.s * 0.85)
}
export const powerLabel = (k) => { const p = powerOf(k); return p < 0 ? 'ล้มเฉยๆ' : p > 0.9 ? 'บินชนขอบจอ' : p > 0.5 ? 'ซัดแรง' : 'ซัดเบา' }

/**
 * เริ่มกระเด็น: คืน body ที่ step() ได้ · dir = +1 กระเด็นไปขวา / -1 ซ้าย
 * body.ev = เหตุการณ์ล่าสุดในสเต็ปนั้น ('wall'|'ceil'|'floor'|'rope'|'land'|null) ไว้ให้ฝั่งจอใส่เสียง/สั่น
 */
export function launch(k, x, y, dir) {
  const p = powerOf(k), r = mulberry((k?.seed | 0) || 1)
  const b = { x, y, vx: 0, vy: 0, rot: 0, vr: 0, air: p >= 0, fly: p > 0.9, homing: false, roped: false, hits: 0, bt: 0, maxHits: 2 + Math.floor(r() * 4), r, done: p < 0, ev: null, p }
  if (p < 0) { b.rot = dir * Math.PI / 2; return b }
  if (b.fly) { b.vy = -(300 + r() * 80); b.vx = dir * (260 + r() * 90); b.vr = dir * (14 + r() * 10) }
  else { b.vx = dir * (40 + 150 * p); b.vy = -(40 + 170 * p); b.vr = dir * (4 + 18 * p) }
  return b
}
function homeTo(b) {   // เด้งครบ/ครบเวลา → โยนโค้งไปลงพื้นนอกเวที (จุดตาม seed)
  const r = b.r, left = b.x < 80 ? r() < 0.75 : r() < 0.25
  const tx = left ? 10 + r() * 20 : 130 + r() * 20
  const T = 0.35 + r() * 0.1, dy = FLOOR_OUT - b.y   // ร่อนลงไวๆ ไม่ลอยค้าง
  b.homing = true; b.vx = (tx - b.x) / T; b.vy = (dy - 0.5 * G * T * T) / T
}
function land(b, floor) { b.y = floor; b.air = false; b.fly = b.homing = false; b.vx = b.vy = b.vr = 0; b.rot = (b.x < 80 ? -1 : 1) * Math.PI / 2; b.done = true; b.ev = 'land' }

export function step(b, dt = STEP) {
  b.ev = null
  if (!b.air) return b
  const r = b.r
  b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt
  if (b.homing) { if (b.y >= FLOOR_OUT && b.vy > 0) land(b, FLOOR_OUT); return b }
  if (b.fly && b.hits > 0) { b.bt += dt; if (b.bt > BOUNCE_S) { homeTo(b); return b } }   // เด้งรวมไม่เกิน 0.5 วิ
  const bump = (ev) => { b.hits++; b.ev = ev; b.vr = -b.vr * (0.6 + r() * 0.7); if (b.hits >= b.maxHits) homeTo(b) }
  if (b.fly) {
    if (b.x < 6 && b.vx < 0) { b.x = 6; b.vx = -b.vx * (0.8 + r() * 0.2); b.vy += -90 + r() * 120; bump('wall'); return b }
    if (b.x > 154 && b.vx > 0) { b.x = 154; b.vx = -b.vx * (0.8 + r() * 0.2); b.vy += -90 + r() * 120; bump('wall'); return b }
    if (b.y < 14 && b.vy < 0) { b.y = 14; b.vy = -b.vy * (0.7 + r() * 0.3); b.vx += -80 + r() * 160; bump('ceil'); return b }
  } else if ((b.x < RING.x0 + 2 || b.x > RING.x1 - 2) && !b.roped) {
    b.roped = true; b.x = Math.max(RING.x0 + 2, Math.min(RING.x1 - 2, b.x)); b.vx *= -0.45; b.vr *= -0.6; b.ev = 'rope'
  }
  const floor = b.fly && !inRing(b.x) ? FLOOR_OUT : FLOOR_RING
  if (b.y >= floor && b.vy > 0) {
    b.y = floor
    if (b.fly) { b.vy = -Math.max(200, b.vy * (0.6 + r() * 0.3)); bump('floor'); return b }
    if (b.vy > 50) { b.vy *= -0.35; b.vx *= 0.6; b.vr *= 0.5; b.ev = 'floor' }
    else land(b, FLOOR_RING)
  }
  return b
}
/** จำลองจนจบ (เทส/หาจุดลง) */
export function simulate(k, x, y, dir, maxS = 6) {
  const b = launch(k, x, y, dir); let t = 0
  while (!b.done && t < maxS) { step(b); t += STEP }
  return { x: b.x, y: b.y, t, hits: b.hits, p: b.p }
}
