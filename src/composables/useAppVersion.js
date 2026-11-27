// 🔄 เช็คเวอร์ชันเว็บ (27 พ.ย. 2026 · user: เจอปัญหาเพื่อนเปิดเวอร์ชันเก่าค้างหลายรอบ)
// เทียบรหัส build ที่ฝังในแอป (__BUILD_ID__) กับ version.json บนโฮสต์ · ไม่แตะ Firebase (ฟรี)
// เช็คตอนเปิด · ทุก 5 นาที · ตอนกลับมาที่แท็บ — ต่างกัน = โชว์ป้ายให้กดรีเฟรช
import { ref } from 'vue'

export const hasUpdate = ref(false)
let started = false, lastAt = 0

async function check() {
  if (hasUpdate.value || Date.now() - lastAt < 30000) return
  lastAt = Date.now()
  try {
    const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return
    const { v } = await r.json()
    if (v && v !== __BUILD_ID__) hasUpdate.value = true
  } catch { /* เน็ตหลุด = ข้าม */ }
}

export function startVersionWatch() {
  if (started || import.meta.env.DEV) return
  started = true
  check()
  setInterval(check, 5 * 60 * 1000)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check() })
}

export function reloadApp() { window.location.reload() }
