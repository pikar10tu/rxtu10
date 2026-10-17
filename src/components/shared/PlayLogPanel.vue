<!-- PlayLogPanel — ตัวนับการเล่น (เฉพาะแอดมิน) ใช้ในหน้าล็อบบี้เกม "เล่นด้วยกัน" · ข้อมูลจาก utils/playLog.js -->
<template>
  <div v-if="auth.isAdmin" class="plp">
    <button class="plp-head" @click="toggle">
      <span><Emoji char="📊" /> ตัวนับการเล่น <span class="plp-tag">แอดมิน</span></span>
      <span>{{ open ? '▲' : '▼' }}</span>
    </button>
    <template v-if="open">
      <div v-if="loading" class="plp-dim">กำลังโหลด…</div>
      <div v-else-if="err" class="plp-dim">{{ err }}</div>
      <template v-else>
        <div class="plp-stats">
          <div><b>{{ today }}</b><small>รอบวันนี้</small></div>
          <div><b>{{ rows.length }}</b><small>รอบทั้งหมด</small></div>
          <div><b>{{ people.length }}</b><small>คนไม่ซ้ำ</small></div>
        </div>
        <div v-if="people.length" class="plp-people">
          <span v-for="p in people" :key="p.uid">{{ p.name }} <small>×{{ p.n }}</small></span>
        </div>
        <div class="plp-sub">รอบล่าสุด</div>
        <div v-if="!rows.length" class="plp-dim">ยังไม่มีใครเล่น</div>
        <div v-for="r in rows.slice(0, 15)" :key="r.id" class="plp-row">
          <span class="plp-time">{{ fmt(r.at) }}</span>
          <span class="plp-names">{{ (r.names || []).join(', ') }}</span>
          <span v-if="r.mode" class="plp-mode">{{ r.mode }}</span>
        </div>
        <div v-if="rows.length >= 300" class="plp-dim">นับจาก 300 รอบล่าสุด</div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from './Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { loadPlayLog } from '../../utils/playLog.js'

const props = defineProps({ game: { type: String, required: true } })
const auth = useAuthStore()
const open = ref(false), loading = ref(false), err = ref(''), rows = ref([])

async function toggle() {
  open.value = !open.value
  if (!open.value) return
  loading.value = true; err.value = ''
  try { rows.value = await loadPlayLog(props.game) } catch (e) { err.value = 'โหลดไม่ได้: ' + e.message }
  loading.value = false
}

const today = computed(() => {
  const d0 = new Date(); d0.setHours(0, 0, 0, 0)
  return rows.value.filter(r => (r.at || 0) >= d0.getTime()).length
})
const people = computed(() => {
  const m = new Map()
  for (const r of rows.value) (r.uids || []).forEach((u, i) => {
    const p = m.get(u) || { uid: u, name: r.names?.[i] || '?', n: 0 }
    p.n++; m.set(u, p)
  })
  return [...m.values()].sort((a, b) => b.n - a.n)
})
const fmt = (t) => t ? new Date(t).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'
</script>

<style scoped>
.plp { margin-top: 16px; background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; padding: 4px 12px 10px; }
.plp-head { all: unset; cursor: pointer; display: flex; justify-content: space-between; width: 100%; padding: 8px 0; font-weight: 700; font-size: .88rem; }
.plp-tag { font-size: .7rem; background: #fef3c7; color: #92400e; border-radius: 6px; padding: 1px 6px; margin-left: 4px; }
.plp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; }
.plp-stats div { background: var(--mint-light); border-radius: 10px; padding: 6px 0; display: flex; flex-direction: column; }
.plp-stats b { font-size: 1.15rem; font-variant-numeric: tabular-nums; }
.plp-stats small { font-size: .7rem; color: rgba(0,0,0,.55); }
.plp-people { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.plp-people span { font-size: .75rem; background: #f3f4f6; border-radius: 8px; padding: 2px 8px; }
.plp-people small { font-size: .7rem; color: rgba(0,0,0,.5); }
.plp-sub { font-weight: 700; font-size: .8rem; margin: 10px 0 4px; }
.plp-row { display: flex; gap: 8px; font-size: .78rem; padding: 4px 0; border-bottom: 1px dashed rgba(0,0,0,.08); }
.plp-time { color: rgba(0,0,0,.5); white-space: nowrap; }
.plp-names { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plp-mode { font-size: .7rem; background: var(--primary-light); border-radius: 6px; padding: 0 6px; }
.plp-dim { color: rgba(0,0,0,.5); font-size: .8rem; text-align: center; margin: 6px 0; }
</style>
