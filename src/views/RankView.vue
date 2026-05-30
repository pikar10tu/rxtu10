<template>
  <div class="tab-content">
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">🏆 Rank</div>

    <!-- board selector -->
    <div class="rk-tabs">
      <button
        v-for="b in BOARDS" :key="b.key"
        class="rk-tab" :class="{ on: board === b.key }"
        @click="board = b.key"
      >{{ b.icon }} {{ b.label }}</button>
    </div>

    <div v-if="members.loading" class="rk-empty">กำลังโหลด…</div>
    <div v-else-if="!ranked.length" class="rk-empty">ยังไม่มีข้อมูล</div>

    <ol v-else class="rk-list">
      <li
        v-for="(m, i) in ranked" :key="m.uid"
        class="rk-row" :class="{ me: m.uid === myUid, top: i < 3 }"
      >
        <span class="rk-pos" :class="medal(i)">{{ i < 3 ? ['🥇','🥈','🥉'][i] : i + 1 }}</span>
        <img class="rk-avatar" :src="avatarOf(m)" :alt="m.nickname" />
        <div class="rk-name">
          {{ m.nickname }}
          <ResidenceBadge v-if="board !== 'residence'" :level="m.residence?.level || 1" />
        </div>
        <span class="rk-val">{{ valueOf(m).toLocaleString() }}<small>{{ current.unit }}</small></span>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMembersStore } from '../stores/members.js'
import { useAuthStore } from '../stores/auth.js'
import ResidenceBadge from '../components/residence/ResidenceBadge.vue'

const members = useMembersStore()
const auth = useAuthStore()
const myUid = computed(() => auth.currentUser?.uid)

const BOARDS = [
  { key: 'residence', icon: '🏠', label: 'เลเวลบ้าน', unit: '',     get: m => m.residence?.level || 1 },
  { key: 'pvp',       icon: '⚔️', label: 'PvP',        unit: ' ชนะ', get: m => m.pvpVictories || 0 },
  { key: 'tower',     icon: '🏯', label: 'หอคอย',      unit: ' ชั้น', get: m => m.towerBest || 0 },
  { key: 'likes',     icon: '❤️', label: 'ยอดไลก์',    unit: '',     get: m => m.likes || 0 },
]

const board = ref('residence')
const current = computed(() => BOARDS.find(b => b.key === board.value))
const valueOf = (m) => current.value.get(m)

onMounted(() => { if (!Object.keys(members.fbUsers.value || {}).length) members.loadFbUsers() })

const all = computed(() => [
  ...Object.values(members.fbUsers.value || {}),
  ...(members.guestUsers.value || []),
])

const ranked = computed(() =>
  all.value
    .slice()
    .sort((a, b) => valueOf(b) - valueOf(a))
    .slice(0, 50)
)

const medal = (i) => (i === 0 ? 'g' : i === 1 ? 's' : i === 2 ? 'b' : '')
const avatarOf = (m) =>
  m.customPhoto || m.googlePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nickname || '?')}&size=64`
</script>

<style scoped>
.rk-tabs { display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; }
.rk-tab { flex: 1; white-space: nowrap; border: 1px solid rgba(0,0,0,.1); background: #fff; border-radius: 999px; padding: 7px 10px; font-family: inherit; font-size: .72rem; font-weight: 700; cursor: pointer; color: rgba(0,0,0,.55); }
.rk-tab.on { background: #1e293b; color: #fff; border-color: #1e293b; }
.rk-empty { text-align: center; color: rgba(0,0,0,.4); padding: 24px 0; font-size: .85rem; }
.rk-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.rk-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; background: #fff; border: 1px solid rgba(0,0,0,.06); }
.rk-row.top { background: linear-gradient(135deg,#fffbeb,#fff); border-color: rgba(251,191,36,.4); }
.rk-row.me { outline: 2px solid #6366f1; }
.rk-pos { width: 26px; text-align: center; font-weight: 800; font-size: .82rem; color: rgba(0,0,0,.5); flex-shrink: 0; }
.rk-pos.g, .rk-pos.s, .rk-pos.b { font-size: 1.1rem; }
.rk-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #eee; flex-shrink: 0; }
.rk-name { flex: 1; min-width: 0; font-size: .82rem; font-weight: 700; display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rk-val { font-weight: 800; font-size: .9rem; color: #b45309; white-space: nowrap; }
.rk-val small { font-size: .6rem; color: rgba(0,0,0,.4); font-weight: 600; }
</style>
