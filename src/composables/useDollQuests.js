// 🏅 ชุดภารกิจปลดล็อค → บอลลูนฉลอง (27 พ.ย. 2026) · ของได้เองผ่าน dollOf ไม่ต้องเขียนอะไร
// จำเซ็ตที่เคยฉลองไว้ที่ users.quest.seen (ข้ามเครื่อง · 27 พ.ย. user เข้าคอม+มือถือแล้วเด้งทุกเครื่อง) + localStorage กันเด้งซ้ำก่อนเซิร์ฟเวอร์ตอบ
import { watch } from 'vue'
import { arrayUnion } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useAchievementBalloon } from './useAchievementBalloon.js'
import { questProgress } from '../utils/dollQuests.js'
import { LIMITED_SETS } from '../data/dollLimited.js'

const ICON = { lib: '📚', cafe: '☕', forest: '🌳', boxer: '🥊', arena: '⚔️', tower: '🗼', early: '🌅', pharm: '🩺', farm: '🌾', spy: '🕵️' }
let started = false, pending = false
export function initDollQuests() {
  if (started) return
  started = true
  const auth = useAuthStore()
  watch(() => auth.userData, (u) => {
    const uid = auth.currentUser?.uid
    if (!u || !uid) return
    const key = 'rxtu.questSeen.' + uid
    let local = null
    try { local = JSON.parse(localStorage.getItem(key) || 'null') } catch { local = null }
    const server = Array.isArray(u.quest?.seen) ? u.quest.seen : null
    const done = Object.entries(questProgress(u)).filter(([, p]) => p.done).map(([id]) => id)
    // ยังไม่เคยจำที่ไหนเลย = ฉลองของที่ได้ย้อนหลังด้วย (เช่น หอคอยเกิน 50 อยู่แล้ว)
    const seen = (local || server) ? new Set([...(local || []), ...(server || [])]) : null
    const fresh = seen ? done.filter(id => !seen.has(id)) : done
    const all = [...new Set([...(seen || []), ...done])]
    if (!local || fresh.length || all.length !== local.length) { try { localStorage.setItem(key, JSON.stringify(all)) } catch { /* private mode */ } }
    const missing = all.filter(id => !(server || []).includes(id))
    if (missing.length && !pending) {
      pending = true
      auth.patchUser({ quest: { ...(u.quest || {}), seen: all } }, { 'quest.seen': arrayUnion(...missing) }).finally(() => { pending = false })
    }
    for (const id of fresh) {
      const set = LIMITED_SETS.find(s => s.id === 'q_' + id)
      useAchievementBalloon().celebrate({ head: 'ปลดล็อกเครื่องแต่งกาย!', title: `ปลดล็อค${set ? set.label.replace('ครบเซ็ต', '') : 'ชุดใหม่'}แล้ว! ไปใส่ที่ห้องแต่งตัวได้เลย`, icon: ICON[id] || '🎁' })
    }
  }, { deep: true })
}
