<template>
  <div class="tab-content">
    <div class="mv-head">
      <div style="font-size:1.1rem;font-weight:800">👥 Members</div>
      <span class="mv-count">{{ list.length }} คน</span>
    </div>

    <input v-model="search" class="mv-search" type="text" placeholder="ค้นหาชื่อ / รหัส…" />

    <div v-if="members.loading" class="mv-empty">กำลังโหลด…</div>
    <div v-else-if="!list.length" class="mv-empty">ไม่พบสมาชิก</div>

    <div v-else class="mv-grid">
      <button v-for="m in list" :key="m.uid" class="mv-card" @click="selected = m">
        <img class="mv-avatar" :src="avatarOf(m)" :alt="m.nickname" />
        <div class="mv-nick">{{ m.nickname }}</div>
        <div class="mv-row">
          <span class="mv-track" :style="{ background: trackColor(m.track) }">{{ trackLabel(m.track) }}</span>
        </div>
        <div class="mv-row">
          <ResidenceBadge :level="m.residence?.level || 1" />
          <span class="mv-likes">❤️ {{ m.likes || 0 }}</span>
        </div>
      </button>
    </div>

    <ProfileModal :member="selected" @close="selected = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMembersStore } from '../stores/members.js'
import ResidenceBadge from '../components/residence/ResidenceBadge.vue'
import ProfileModal from '../components/members/ProfileModal.vue'

const members = useMembersStore()
const search = ref('')
const selected = ref(null)

onMounted(() => { if (!Object.keys(members.fbUsers.value || {}).length) members.loadFbUsers() })

const all = computed(() => [
  ...Object.values(members.fbUsers.value || {}),
  ...(members.guestUsers.value || []),
])

const list = computed(() => {
  const q = search.value.trim().toLowerCase()
  const base = all.value
  const filtered = !q ? base : base.filter(m =>
    [m.nickname, m.realName, m.studentId].some(v => (v || '').toLowerCase().includes(q))
  )
  return filtered.slice().sort((a, b) => (b.residence?.level || 1) - (a.residence?.level || 1))
})

const TRACK = { sci: ['วิทย์', '#22c55e'], care: ['บริบาล', '#3b82f6'], guest: ['เกสต์', '#9ca3af'] }
const trackLabel = (t) => TRACK[t]?.[0] || 'สมาชิก'
const trackColor = (t) => TRACK[t]?.[1] || '#6366f1'
const avatarOf = (m) =>
  m.customPhoto || m.googlePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nickname || '?')}&size=96`
</script>

<style scoped>
.mv-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; }
.mv-count { font-size: .68rem; color: rgba(0,0,0,.45); }
.mv-search { width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid rgba(0,0,0,.12); border-radius: 10px; font-family: inherit; font-size: .82rem; margin-bottom: 12px; }
.mv-empty { text-align: center; color: rgba(0,0,0,.4); padding: 24px 0; font-size: .85rem; }
.mv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.mv-card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 14px; padding: 12px 6px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; font-family: inherit; }
.mv-card:active { transform: scale(.97); }
.mv-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #eee; }
.mv-nick { font-size: .76rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.mv-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center; }
.mv-track { font-size: .54rem; font-weight: 800; color: #fff; padding: 1px 7px; border-radius: 999px; }
.mv-likes { font-size: .58rem; color: rgba(0,0,0,.5); }
</style>
