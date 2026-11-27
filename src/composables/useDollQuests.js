// 🏅 ชุดภารกิจปลดล็อค → บอลลูนฉลอง (27 พ.ย. 2026) · ของได้เองผ่าน dollOf ไม่ต้องเขียนอะไร
// จำเซ็ตที่เคยฉลองไว้ในเครื่อง (ต่อ uid) · เซ็ตละครั้งต่อเครื่อง
import { watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useAchievementBalloon } from './useAchievementBalloon.js'
import { questProgress } from '../utils/dollQuests.js'
import { LIMITED_SETS } from '../data/dollLimited.js'

const ICON = { lib: '📚', cafe: '☕', forest: '🌳', boxer: '🥊', arena: '⚔️', tower: '🗼', early: '🌅', pharm: '🩺', farm: '🌾', spy: '🕵️' }
let started = false
export function initDollQuests() {
  if (started) return
  started = true
  const auth = useAuthStore()
  watch(() => auth.userData, (u) => {
    const uid = auth.currentUser?.uid
    if (!u || !uid) return
    const key = 'rxtu.questSeen.' + uid
    let seen = null
    try { seen = JSON.parse(localStorage.getItem(key) || 'null') } catch { seen = null }
    const done = Object.entries(questProgress(u)).filter(([, p]) => p.done).map(([id]) => id)
    const fresh = seen ? done.filter(id => !seen.includes(id)) : done   // ครั้งแรกในเครื่องนี้: ฉลองของที่ได้ย้อนหลังด้วย (เช่น หอคอยเกิน 50 อยู่แล้ว)
    if (!seen || fresh.length) { try { localStorage.setItem(key, JSON.stringify(done)) } catch { /* private mode */ } }
    for (const id of fresh) {
      const set = LIMITED_SETS.find(s => s.id === 'q_' + id)
      useAchievementBalloon().celebrate({ head: 'ปลดล็อกเครื่องแต่งกาย!', title: `ปลดล็อค${set ? set.label.replace('ครบเซ็ต', '') : 'ชุดใหม่'}แล้ว! ไปใส่ที่ห้องแต่งตัวได้เลย`, icon: ICON[id] || '🎁' })
    }
  }, { deep: true })
}
