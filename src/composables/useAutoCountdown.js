// นับถอยหลังก่อนเริ่มไฟต์ถัดไป (ตีซ้ำดันเจี้ยน / ไต่หอคอยต่อเนื่อง) — คู่กับ components/battle/AutoRepeatBar.vue
import { ref, onUnmounted } from 'vue'

export const AUTO_COUNTDOWN_SEC = 5

export function useAutoCountdown() {
  const left = ref(null)   // วินาทีที่เหลือ · null = ไม่ได้นับ
  let timer = null
  let job = null

  function cancel() {
    clearInterval(timer); timer = null; job = null; left.value = null
  }
  /** เริ่มนับ แล้วเรียก fn ตอนครบ (เรียกซ้ำ = เริ่มนับใหม่) */
  function start(fn, sec = AUTO_COUNTDOWN_SEC) {
    cancel()
    job = fn
    left.value = sec
    timer = setInterval(() => {
      left.value--
      if (left.value <= 0) now()
    }, 1000)
  }
  /** ข้ามการนับ เริ่มเลย */
  function now() {
    const f = job
    cancel()
    if (f) f()
  }
  onUnmounted(cancel)
  return { left, start, cancel, now }
}
