<template>
  <div class="tab-content">
    <div class="mv-head">
      <div class="mv-title">👥 สมาชิก</div>
      <span class="mv-count">{{ registeredCount }}/{{ roster.length }} เข้าระบบแล้ว</span>
    </div>

    <input v-model="search" class="mv-search" type="text" placeholder="🔍 ค้นหาชื่อเล่น / ชื่อจริง / รหัส…" />

    <div class="mv-filters">
      <button v-for="f in FILTERS" :key="f.key" class="mv-filter" :class="{ on: track === f.key }" @click="track = f.key">
        {{ f.label }}
      </button>
    </div>

    <div v-if="members.loading" class="mv-empty">กำลังโหลด…</div>
    <div v-else-if="!list.length" class="mv-empty">ไม่พบสมาชิก</div>

    <div v-else class="mv-grid">
      <button
        v-for="m in list" :key="m.uid"
        class="mv-card" :class="{ off: !m.registered }"
        @click="m.registered && (selected = m)"
      >
        <div class="mv-av-wrap" :style="{ '--ring': trackColor(m.track) }">
          <img class="mv-avatar" :src="avatarOf(m)" :alt="m.nickname" loading="lazy" />
          <span v-if="m.registered" class="mv-lv" :style="{ background: tierColor(m) }">{{ m.residence?.level || 1 }}</span>
        </div>
        <div class="mv-nick">{{ m.nickname }}</div>
        <div class="mv-track" :style="{ color: trackColor(m.track) }">{{ trackLabel(m.track) }}</div>
        <div v-if="m.registered" class="mv-likes">❤️ {{ m.likes || 0 }}</div>
        <div v-else class="mv-off-tag">ยังไม่เข้าระบบ</div>
      </button>
    </div>

    <ProfileModal :member="selected" @close="selected = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMembersStore } from '../stores/members.js'
import { getTier } from '../data/residence.js'
import ProfileModal from '../components/members/ProfileModal.vue'

const members = useMembersStore()
const search = ref('')
const track = ref('all')
const selected = ref(null)

onMounted(() => { if (!Object.keys(members.fbUsers || {}).length) members.loadFbUsers() })

// merge the full static roster (83) with logged-in user data (by studentId)
const roster = computed(() => {
  const fb = members.fbUsers || {}
  const merged = (members.students || []).map(s => {
    const u = fb[s.id]
    if (u) return { ...u, registered: true }
    return {
      uid: 'static_' + s.id, studentId: s.id,
      nickname: s.nickname, realName: s.realName, track: s.track,
      residence: { level: 1 }, likes: 0, pets: [], registered: false,
    }
  })
  const guests = (members.guestUsers || []).map(g => ({ ...g, registered: true }))
  return [...merged, ...guests]
})

const registeredCount = computed(() => roster.value.filter(m => m.registered).length)

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'sci', label: 'Sci' },
  { key: 'care', label: 'Care' },
]

const list = computed(() => {
  const q = search.value.trim().toLowerCase()
  let r = roster.value
  if (track.value !== 'all') r = r.filter(m => m.track === track.value)
  if (q) r = r.filter(m => [m.nickname, m.realName, m.studentId].some(v => (v || '').toLowerCase().includes(q)))
  // registered first, then by residence level desc, then by id
  return r.slice().sort((a, b) =>
    (b.registered - a.registered) ||
    ((b.residence?.level || 1) - (a.residence?.level || 1)) ||
    String(a.studentId).localeCompare(String(b.studentId))
  )
})

const TRACK = { sci: ['Sci', '#22c55e'], care: ['Care', '#3b82f6'], guest: ['Guest', '#9ca3af'] }
const trackLabel = (t) => TRACK[t]?.[0] || 'สมาชิก'
const trackColor = (t) => TRACK[t]?.[1] || '#6366f1'
const tierColor = (m) => getTier(m.residence?.level || 1).frameColor
const avatarOf = (m) =>
  m.customPhoto || m.googlePhoto ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent((m.nickname || '?').replace(/[^฀-๿a-zA-Z]/g, '') || '?')}&size=96&background=random`
</script>

<style scoped>
.mv-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.mv-title { font-size: 1.15rem; font-weight: 800; }
.mv-count { font-size: .66rem; color: rgba(0,0,0,.45); font-weight: 600; }
.mv-search {
  width: 100%; box-sizing: border-box; padding: 10px 14px;
  border: 1px solid rgba(0,0,0,.1); border-radius: 12px;
  font-family: inherit; font-size: .82rem; margin-bottom: 10px; background: #fff;
}
.mv-search:focus { outline: 2px solid #6366f1aa; border-color: transparent; }
.mv-filters { display: flex; gap: 6px; margin-bottom: 14px; }
.mv-filter {
  border: 1px solid rgba(0,0,0,.1); background: #fff; border-radius: 999px;
  padding: 6px 14px; font-family: inherit; font-size: .74rem; font-weight: 700;
  color: rgba(0,0,0,.5); cursor: pointer; transition: .12s;
}
.mv-filter.on { background: #1e293b; color: #fff; border-color: #1e293b; }
.mv-empty { text-align: center; color: rgba(0,0,0,.4); padding: 28px 0; font-size: .85rem; }
.mv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.mv-card {
  background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 16px;
  padding: 14px 8px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px;
  cursor: pointer; font-family: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.04);
  transition: transform .12s, box-shadow .12s;
}
.mv-card:active { transform: scale(.96); }
.mv-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.mv-card.off { opacity: .5; cursor: default; box-shadow: none; }
.mv-card.off:active { transform: none; }
.mv-av-wrap { position: relative; }
.mv-avatar {
  width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: #eee;
  border: 3px solid var(--ring, #ddd); box-sizing: border-box;
}
.mv-lv {
  position: absolute; right: -3px; bottom: -3px;
  min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px;
  color: #fff; font-size: .6rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}
.mv-nick {
  font-size: .8rem; font-weight: 700; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
.mv-track { font-size: .62rem; font-weight: 700; }
.mv-likes { font-size: .62rem; color: rgba(0,0,0,.5); }
.mv-off-tag { font-size: .56rem; color: rgba(0,0,0,.35); }
</style>
