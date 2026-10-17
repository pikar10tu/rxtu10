// บันทึกการเล่นเกม "เล่นด้วยกัน" → RTDB playlog/{game}/{pushId} = { at, size, uids[], names[], mode? }
// หัวห้องเขียนตอนกดเริ่มแต่ละรอบ · อ่านได้เฉพาะแอดมิน (rules เช็คอีเมล) — ใช้ดูว่ามีใครเข้ามาเล่นบ้าง
import { getDatabase, ref as dbRef, push, get, query, limitToLast, serverTimestamp } from 'firebase/database'
import { app } from '../firebase/config.js'

const db = () => getDatabase(app)

export function logPlay(game, players, extra = {}) {
  if (!players?.length) return
  push(dbRef(db(), `playlog/${game}`), {
    at: serverTimestamp(), size: players.length,
    uids: players.map(p => p.uid), names: players.map(p => p.name || '?'), ...extra,
  }).catch(() => {})
}

export async function loadPlayLog(game, n = 300) {
  const snap = await get(query(dbRef(db(), `playlog/${game}`), limitToLast(n)))
  const rows = []
  snap.forEach(c => { rows.push({ id: c.key, ...c.val() }) })
  return rows.reverse()
}
