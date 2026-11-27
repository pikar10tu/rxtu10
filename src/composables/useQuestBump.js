// 🏅 +ตัวนับชุดภารกิจ (users.quest.<key>) — กันนับซ้ำด้วย onceKey (เช่น id ไฟต์/เกม) ภายในแท็บนี้
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'

const done = new Set()
export async function bumpQuest(key, onceKey = null, n = 1) {
  if (onceKey) { const k = key + ':' + onceKey; if (done.has(k)) return false; done.add(k) }
  const auth = useAuthStore(), u = auth.userData
  if (!u) return false
  const q = { ...(u.quest || {}) }
  q[key] = (Number(q[key]) || 0) + n
  return auth.patchUser({ quest: q }, { [`quest.${key}`]: increment(n) })
}
