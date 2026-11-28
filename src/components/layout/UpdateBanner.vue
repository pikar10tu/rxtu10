<!-- 🔄 ป้ายมีเวอร์ชันใหม่ (useAppVersion) — มุมบน ไม่บังปุ่มล่าง · z 520 (ชั้น toast)
     29 พ.ย. เพื่อนแจ้ง: ป้ายบังตอนทำข้อสอบ ซ่อนไม่ได้ → ไม่โชว์ในหน้าทำข้อสอบ/ซ้อมสอบ ออกจากหน้าแล้วค่อยขึ้น · มี ✕ พักไว้ 10 นาที -->
<template>
  <Teleport to="body">
    <div v-if="hasUpdate && !onExamPage && !snoozed" class="upd" role="status">
      <span><Emoji char="✨" /> มีเว็บเวอร์ชันใหม่</span>
      <button type="button" @click="reloadApp">รีเฟรช</button>
      <button type="button" class="upd-x" aria-label="ไว้ทีหลัง" @click="snooze">✕</button>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Emoji from '../shared/Emoji.vue'
import { hasUpdate, reloadApp } from '../../composables/useAppVersion.js'

// หน้าที่กำลังทำข้อสอบ/ซ้อม — รีเฟรชกลางชุด = เสียของที่ทำค้าง จึงไม่ชวน
const EXAM_ROUTES = new Set(['quiz', 'daily', 'timeAttack', 'cc2-sim', 'cc2-room', 'cc2-case'])
const route = useRoute()
const onExamPage = computed(() => EXAM_ROUTES.has(route.name))

const SNOOZE_MS = 10 * 60 * 1000
const snoozeUntil = ref(0)
const now = ref(Date.now())
const t = setInterval(() => { now.value = Date.now() }, 30000)
onBeforeUnmount(() => clearInterval(t))
const snoozed = computed(() => now.value < snoozeUntil.value)
function snooze() { snoozeUntil.value = Date.now() + SNOOZE_MS; now.value = Date.now() }
</script>

<style scoped>
.upd { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 520; display: flex; align-items: center; gap: 8px; background: #fff; border: var(--bw) solid var(--line); border-radius: 99px; padding: 6px 6px 6px 14px; box-shadow: var(--pop); font-size: .82rem; font-weight: 600; white-space: nowrap; }
.upd button { font: inherit; font-weight: 700; border: 0; border-radius: 99px; background: var(--primary); color: #fff; padding: 5px 14px; cursor: pointer; }
.upd .upd-x { background: none; color: var(--muted); padding: 5px 8px; }
</style>
