// usePress — แตะ / กดค้าง / ลาก บน element เดียว (หน้าจัดทีม 18 ต.ค. 2026 · user เคาะจากเดโม)
//
// ท่าเริ่มของ "กดค้าง" กับ "ลาก" เหมือนกัน (นิ้วแตะค้าง) ⇒ แยกด้วยว่านิ้วขยับก่อนครบเวลาไหม
//   · นิ้วนิ่งจนครบ LONG_MS          → onLong (เปิดการ์ด)
//   · ขยับเกิน MOVE_PX ก่อนครบเวลา  → มี drag = เริ่มลาก · ไม่มี drag = ยกเลิกเฉยๆ (ปล่อยให้จอเลื่อน)
//   · ยกนิ้วก่อนครบเวลา ไม่ขยับ      → onTap
// element ที่ลากได้ต้องตั้ง touch-action:none เอง ไม่งั้นมือถือจะเอาการลากไปเลื่อนจอ
// กันเมนูเซฟรูป/คลุมข้อความของมือถือด้วย CSS: user-select:none + -webkit-touch-callout:none (ฝั่ง component)

export const LONG_MS = 450
export const MOVE_PX = 10
// วงแหวนโปรเกรสตอนกดค้าง (user ขอ 25 ต.ค.) — โผล่หลัง RING_DELAY กันแตะเฉยๆ แล้ววงกะพริบ · เต็มวงพอดี LONG_MS
const RING_DELAY = 120

let styled = false
function ensureRingStyle() {
  if (styled || typeof document === 'undefined') return
  styled = true
  const st = document.createElement('style')
  st.textContent = `
.press-ring{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;pointer-events:none;z-index:5;
  opacity:0;animation:press-ring-in 80ms ${RING_DELAY}ms forwards;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
.press-ring circle{fill:none;stroke-width:6;stroke-linecap:round}
.press-ring .bg{stroke:rgba(255,255,255,.55)}
.press-ring .fg{stroke:#ff8fab;stroke-dasharray:132;stroke-dashoffset:132;transform:rotate(-90deg);transform-origin:center;
  animation:press-ring-fill ${LONG_MS - RING_DELAY}ms ${RING_DELAY}ms linear forwards}
@keyframes press-ring-in{to{opacity:1}}
@keyframes press-ring-fill{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.press-ring .fg{animation-duration:1ms;animation-delay:${LONG_MS - 1}ms}}`
  document.head.appendChild(st)
}

function addRing(el) {
  ensureRingStyle()
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  const r = document.createElement('div')
  r.className = 'press-ring'
  r.innerHTML = '<svg viewBox="0 0 56 56" width="56" height="56"><circle class="bg" cx="28" cy="28" r="21"/><circle class="fg" cx="28" cy="28" r="21"/></svg>'
  el.appendChild(r)
  return r
}

/**
 * @param {{ onTap?: Function, onLong?: Function, drag?: { start: Function, move: Function, end: Function } }} h
 * @returns ชุด listener ไว้กาง `v-on="press(...)"` บน element
 */
export function pressHandlers(h) {
  let sx = 0, sy = 0, timer = null, ring = null, longFired = false, moved = false, dragging = false, pid = null, el = null

  const clear = () => { clearTimeout(timer); timer = null; ring?.remove(); ring = null; el?.classList.remove('pressing') }

  return {
    contextmenu: (e) => e.preventDefault(),
    pointerdown(e) {
      if (e.button > 0) return
      el = e.currentTarget
      sx = e.clientX; sy = e.clientY
      longFired = false; moved = false; dragging = false; pid = e.pointerId
      el.classList.add('pressing')
      if (h.onLong) ring = addRing(el)
      if (h.drag) { try { el.setPointerCapture(pid) } catch { /* บางเบราว์เซอร์ไม่ให้ — ลากยังได้ แค่หลุดง่ายขึ้น */ } }
      timer = setTimeout(() => {
        longFired = true; clear()
        navigator.vibrate?.(15)
        h.onLong?.()
      }, LONG_MS)
    },
    pointermove(e) {
      if (e.pointerId !== pid || longFired) return
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > MOVE_PX) {
        moved = true; clear()
        if (h.drag) { dragging = true; h.drag.start(e) }
      }
      if (dragging) h.drag.move(e)
    },
    pointerup(e) { finish(e, false) },
    pointercancel(e) { finish(e, true) },
    keydown(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.onTap?.() }
    },
  }

  function finish(e, cancelled) {
    if (e.pointerId !== pid) return
    clear(); pid = null
    if (dragging) { dragging = false; h.drag.end(e, cancelled); return }
    if (!cancelled && !longFired && !moved) h.onTap?.()
  }
}
