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

  // pools + effect methods เติมใน task ถัดไป
  function buildPools() {}
  function hideAllPools() {}

  return { attach, reset, cancelAll, setRate, destroy, centerOf, invalidateCenters }
}
