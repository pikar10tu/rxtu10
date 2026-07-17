// battleFx.js — motion layer ของ BattleReplay (plain JS ไม่พึ่ง Vue)
// doctrine: pool element promote ถาวร reuse · ขับด้วย WAAPI transform/opacity เท่านั้น · promise resolve เสมอ · one-way (Vue→fx)
import { fluentFile } from './emoji.js'

const BASE = import.meta.env.BASE_URL

export function createBattleFx() {
  let boxEl = null, layer = null, getEl = () => null, rate = 1
  const anims = new Set()               // active WAAPI (สำหรับ cancelAll)
  let centers = {}, boxRect = null

  // ── centers cache (ย้ายมาจาก BattleReplay) ──
  function invalidateCenters() { centers = {}; boxRect = null }
  function centerOf(uid) {
    const c = centers[uid]; if (c) return c
    const el = getEl(uid); if (!el || !boxEl) return null
    if (!boxRect) boxRect = boxEl.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const v = { x: r.left - boxRect.left + r.width / 2, y: r.top - boxRect.top + r.height / 2 }
    centers[uid] = v; return v
  }
  function onResize() { invalidateCenters() }

  // ── WAAPI helper: resolve เสมอ (cancel = reject → กลืน) ──
  function run(el, keyframes, opts) {
    const a = el.animate(keyframes, { duration: opts.duration / rate, easing: opts.easing || 'ease-out', fill: opts.fill || 'none' })
    anims.add(a)
    return a.finished.catch(() => {}).finally(() => anims.delete(a))
  }

  function attach({ boxEl: b, layerEl, getEl: g }) {
    boxEl = b; layer = layerEl; getEl = g
    buildPools()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
  }
  function reset() { invalidateCenters(); cancelAll() }
  function cancelAll() {
    for (const a of anims) a.cancel()          // reject → run() กลืนแล้ว
    anims.clear()
    hideAllPools()
  }
  function setRate(s) { rate = s || 1 }
  function destroy() {
    cancelAll()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    if (layer) layer.innerHTML = ''
  }

  // ── pool infra ──
  function mkEl(cls) { const e = document.createElement('div'); e.className = 'brfx ' + cls; layer.appendChild(e); return e }
  function mkImg(cls) { const e = document.createElement('img'); e.className = 'brfx ' + cls; e.setAttribute('aria-hidden', 'true'); e.loading = 'eager'; e.decoding = 'sync'; layer.appendChild(e); return e }
  function imgSrc(el, char) { const f = fluentFile(char); el.src = f ? BASE + f : '' }
  // ตั้งตำแหน่งฐานด้วย transform (translateZ promote) — dx/dy = offset ในหน่วย px, bake ใน translate
  function baseXform(uid, dx = 0, dy = 0) { const c = centerOf(uid); return c ? `translate(${(c.x + dx).toFixed(1)}px, ${(c.y + dy).toFixed(1)}px) translateZ(0)` : null }

  const pool = { pop: [], call: [], puff: [], ring: [], burst: [] }
  let popIdx = 0, callIdx = 0, puffIdx = 0

  function buildPools() {
    for (let i = 0; i < 4; i++) pool.pop.push(mkEl('brfx-pop'))
    for (let i = 0; i < 2; i++) pool.call.push(mkEl('brfx-call'))
    for (let i = 0; i < 2; i++) { const e = mkImg('brfx-puff'); imgSrc(e, '💀'); pool.puff.push(e) }
    pool.ring = [mkEl('brfx-ring')]
    pool.burst = [mkImg('brfx-burst'), mkImg('brfx-burst')]
    pool.burst.forEach(e => imgSrc(e, '💥'))
    hideAllPools()
  }
  function hideAllPools() {
    for (const arr of Object.values(pool)) for (const e of arr) { e.style.opacity = '0'; e.getAnimations?.().forEach(a => a.cancel()) }
  }

  // ── effect methods (pooled ephemeral, imperative fire-and-forget) ──
  function pop(uid, { dmg, crit, eff }) {
    const el = pool.pop[popIdx = (popIdx + 1) % pool.pop.length]
    el.getAnimations?.().forEach(a => a.cancel())
    el.textContent = '-' + dmg
    el.className = 'brfx brfx-pop' + (crit ? ' crit' : eff === 'super' ? ' super' : eff === 'weak' ? ' weak' : '')
    const dx = Math.round(Math.random() * 28 - 14)          // offset สุ่ม bake ใน translate (ไม่ใช้ margin)
    const base = baseXform(uid, dx, -6); if (!base) return
    el.style.opacity = '1'
    // popMs คงที่ไม่หารด้วย rate (อ่านเลขทันแม้ ×4) — จึงเรียก animate ตรง ไม่ผ่าน run() ที่หาร rate
    const a = el.animate([
      { transform: base + ' translateY(0) scale(.6)', opacity: 0, offset: 0 },
      { transform: base + ' translateY(-6px) scale(1.15)', opacity: 1, offset: .18 },
      { transform: base + ' translateY(-12px) scale(1)', opacity: 1, offset: .35 },
      { transform: base + ' translateY(-40px) scale(1)', opacity: 0, offset: 1 },
    ], { duration: 900, easing: 'ease-out', fill: 'forwards' })
    a.finished.catch(() => {}).then(() => { if (el.textContent === '-' + dmg) el.style.opacity = '0' })
  }

  function callout(uid, kind) {              // kind: 'super' | 'weak'
    const el = pool.call[callIdx = (callIdx + 1) % pool.call.length]
    el.getAnimations?.().forEach(a => a.cancel())
    el.className = 'brfx brfx-call ' + kind
    el.textContent = kind === 'super' ? 'แพ้ทาง! ⚡' : 'ต้านทาน 🛡️'
    const base = baseXform(uid, 0, -16); if (!base) return
    el.style.opacity = '1'
    const a = el.animate([
      { transform: base + ' translateY(0)', opacity: 1 },
      { transform: base + ' translateY(-24px)', opacity: 0 },
    ], { duration: 750, easing: 'ease-out', fill: 'forwards' })
    a.finished.catch(() => {}).then(() => { el.style.opacity = '0' })
  }

  function koPuff(uid) {
    const el = pool.puff[puffIdx = (puffIdx + 1) % pool.puff.length]
    el.getAnimations?.().forEach(a => a.cancel())
    const base = baseXform(uid, 0, 0); if (!base) return
    el.style.opacity = '1'
    const a = el.animate([
      { transform: base + ' translateY(0) scale(.6)', opacity: 1 },
      { transform: base + ' translateY(-16px) scale(1.25)', opacity: 0 },
    ], { duration: 500, easing: 'ease-out', fill: 'forwards' })
    a.finished.catch(() => {}).then(() => { el.style.opacity = '0' })
  }

  let burstIdx = 0
  function ring(uid, phase) {
    const el = pool.ring[0]
    el.getAnimations?.().forEach(a => a.cancel())
    el.className = 'brfx brfx-ring ' + phase
    const base = baseXform(uid, 0, 0); if (!base) return Promise.resolve()
    el.style.transform = base
    return run(el, [
      { transform: base + ' scale(.85)', opacity: 0 },
      { transform: base + ' scale(1.05)', opacity: 1, offset: .4 },
      { transform: base + ' scale(1)', opacity: phase === 'windup' ? .9 : 1 },
    ], { duration: phase === 'windup' ? 250 : 120, easing: 'ease-out', fill: 'forwards' })
      .then(() => { if (phase === 'acting') { el.style.opacity = '0' } })
  }
  function burst(uid) {
    const el = pool.burst[burstIdx = (burstIdx + 1) % pool.burst.length]
    el.getAnimations?.().forEach(a => a.cancel())
    const base = baseXform(uid, 0, 0); if (!base) return Promise.resolve()
    el.style.opacity = '1'
    return run(el, [
      { transform: base + ' scale(.4)', opacity: 1 },
      { transform: base + ' scale(1.4)', opacity: 0 },
    ], { duration: 280, easing: 'ease-out', fill: 'forwards' }).then(() => { el.style.opacity = '0' })
  }

  return { attach, reset, cancelAll, setRate, destroy, centerOf, invalidateCenters, pop, callout, koPuff, ring, burst }
}
