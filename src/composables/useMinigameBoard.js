import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMembersStore } from '../stores/members.js'
import { useAuthStore } from '../stores/auth.js'
import { buildMinigameBoard } from '../utils/minigameCore.js'

// Leaderboard ต่อเกม — จาก members store (โหลด lazy, ใช้ cache) + overlay "ฉัน" ด้วย best สด
// guestUsers ไม่รวมในอันดับ (Phase นี้) — เป็นผู้เยี่ยมชม ไม่ใช่ผู้เล่นประจำ
export function useMinigameBoard(key) {
  const members = useMembersStore()
  const auth = useAuthStore()
  const { fbUsers, loading } = storeToRefs(members)

  const rows = computed(() => {
    const u = auth.userData
    const me = u && u.studentId
      ? {
          uid: u.uid, studentId: u.studentId, nickname: u.nickname, track: u.track,
          googlePhoto: u.googlePhoto, customPhoto: u.customPhoto,
          best: u.minigames?.[key]?.best || 0,
        }
      : null
    return buildMinigameBoard(fbUsers.value, me, key)
  })

  return { rows, loading, load: () => members.loadFbUsers() }
}
