// src/composables/useExpedition.js
// Expedition orchestration — อ่าน/เขียน user.expedition ผ่าน patchUser (doc ตัวเอง)
import { computed } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { resolveRewards, expeditionSeed } from '../utils/expedition.js'
import { MISSIONS, DURATIONS, REWARD_TYPES, EXPEDITION_PARTY_SIZE } from '../data/expeditions.js'

export function useExpedition() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const exp = computed(() => auth.userData?.expedition || null)

  // เพ็ทที่ส่งได้ = owns + ไม่อยู่ในทีมต่อสู้ (activePets) → บังคับใช้ม้านั่ง
  const eligiblePets = computed(() => {
    const team = new Set((auth.userData?.activePets || []).filter(Boolean))
    return (auth.userData?.pets || []).filter(p => p && !team.has(p.id))
  })

  const mission = (id) => MISSIONS.find(m => m.id === id) || null
  const duration = (id) => DURATIONS.find(d => d.id === id) || null

  async function send(petIds, missionId, durationId) {
    if (exp.value) { toast('มีคณะกำลังผจญภัยอยู่ รอกลับก่อนนะ', 'info'); return false }
    const dur = duration(durationId), mis = mission(missionId)
    if (!mis || !dur) { toast('เลือกมิชชัน/ระยะเวลาก่อนนะ', 'info'); return false }
    const ids = (petIds || []).filter(Boolean)
    if (ids.length !== EXPEDITION_PARTY_SIZE) { toast(`เลือกเพ็ท ${EXPEDITION_PARTY_SIZE} ตัว`, 'info'); return false }
    const team = new Set((auth.userData?.activePets || []).filter(Boolean))
    if (ids.some(id => team.has(id))) { toast('เพ็ทในทีมต่อสู้ส่งไม่ได้', 'info'); return false }
    // สแนปช็อตสเตตัสตอนส่ง → claim คำนวณได้เองโดยไม่พึ่งเพ็ทปัจจุบัน
    const party = resolveBattleTeam(ids, auth.userData?.pets)
    const startedAt = Date.now()
    const next = { petIds: ids, party, missionId, durationId, startedAt, endsAt: startedAt + dur.hours * 3600000 }
    const ok = await auth.patchUser({ expedition: next }, { expedition: next })
    if (!ok) { toast('ส่งไม่สำเร็จ ลองใหม่', 'error'); return false }
    return true
  }

  async function claim() {
    const e = exp.value
    if (!e) return null
    if (Date.now() < (e.endsAt || 0)) { toast('ยังไม่ถึงเวลากลับ', 'info'); return null }
    const rewards = resolveRewards(e.party, mission(e.missionId), duration(e.durationId), expeditionSeed(e))
    // เคลียร์ expedition + เพิ่มรางวัลตาม field (extensible)
    const optimistic = { expedition: null }
    const server = { expedition: null }
    for (const r of rewards) {
      const field = REWARD_TYPES[r.type]?.field
      if (!field) continue
      optimistic[field] = (auth.userData?.[field] || 0) + r.amount
      server[field] = increment(r.amount)
    }
    const ok = await auth.patchUser(optimistic, server)
    if (!ok) { toast('เก็บรางวัลไม่สำเร็จ ลองใหม่', 'error'); return null }
    return rewards
  }

  return { exp, eligiblePets, mission, duration, send, claim }
}
