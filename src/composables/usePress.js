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

/**
 * @param {{ onTap?: Function, onLong?: Function, drag?: { start: Function, move: Function, end: Function } }} h
 * @returns ชุด listener ไว้กาง `v-on="press(...)"` บน element
 */
export function pressHandlers(h) {
  let sx = 0, sy = 0, timer = null, longFired = false, moved = false, dragging = false, pid = null, el = null

  const clear = () => { clearTimeout(timer); timer = null; el?.classList.remove('pressing') }

  return {
    contextmenu: (e) => e.preventDefault(),
    pointerdown(e) {
      if (e.button > 0) return
      el = e.currentTarget
      sx = e.clientX; sy = e.clientY
      longFired = false; moved = false; dragging = false; pid = e.pointerId
      el.classList.add('pressing')
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
