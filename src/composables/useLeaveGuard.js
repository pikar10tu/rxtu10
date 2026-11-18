// กันมือลั่นระหว่างทำข้อสอบ/เล่นของสำคัญ — ถามยืนยันก่อนออกจากหน้า
// ครอบทุกทางออกที่เปลี่ยน route: toolbar ล่าง · ปุ่มกลับ · ปุ่ม back มือถือ/เบราว์เซอร์
// + เตือนตอนปิดแท็บ/รีเฟรช (beforeunload — ข้อความเบราว์เซอร์กำหนดเอง)
//
// ใช้: useLeaveGuard(() => mode.value === 'quiz', 'ออกตอนนี้ ...?', { onLeave: () => finish() })
import { onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useConfirm } from './useConfirm.js'

export function useLeaveGuard(isActive, message, { onLeave } = {}) {
  const { confirm } = useConfirm()
  let asking = false

  onBeforeRouteLeave(async () => {
    if (!isActive()) return true
    if (asking) return false            // กดรัวระหว่าง popup เปิดอยู่
    asking = true
    try {
      const ok = await confirm(message)
      if (ok) onLeave?.()
      return ok
    } finally { asking = false }
  })

  const onUnload = e => { if (isActive()) { e.preventDefault(); e.returnValue = '' } }
  onMounted(() => window.addEventListener('beforeunload', onUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onUnload))

  // ปุ่มในหน้าที่ออกโดยไม่เปลี่ยน route (เช่น ออกจากห้อง) — เรียกถามแบบเดียวกันก่อน
  async function confirmLeave() {
    if (!isActive()) return true
    return confirm(message)
  }
  return { confirmLeave }
}
