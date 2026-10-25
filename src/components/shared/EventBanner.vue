<!-- แบนเนอร์อีเวนต์ประจำเดือน (หน้า Play + Home) — โผล่เฉพาะช่วงอีเวนต์ (data/events.js)
     2 วันสุดท้ายเปลี่ยนเป็นข้อความเตือน "ใกล้หมดอายุ รีบแลก" (user 25 ต.ค. 2026: แต้มที่เหลือหายเงียบๆ ไม่ดี) -->
<template>
  <RouterLink v-if="ev" to="/event" class="evb" :class="{ urgent: daysLeft <= WARN_DAYS }">
    <span class="evb-ic"><Emoji :char="ev.pt" /></span>
    <span class="evb-txt">
      <b>{{ ev.name }} <span class="evb-cd"><Emoji char="⏳" /> {{ cdText }}</span></b>
      <small v-if="daysLeft <= WARN_DAYS">{{ daysLeft <= 1 ? 'วันสุดท้าย!' : `อีก ${daysLeft} วัน` }} {{ ev.ptName }}หมดอายุ รีบแลกนะ</small>
      <small v-else>ทำข้อสอบหรือลงดันเก็บ{{ ev.ptName }} แลกของลิมิเต็ด</small>
    </span>
    <span class="evb-have"><Emoji :char="ev.pt" /> {{ pts }}</span>
  </RouterLink>
</template>

<script setup>
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import Emoji from './Emoji.vue'
import { activeEvent, evtOf, EVT_HUNTER_GOAL } from '../../utils/event.js'
import { grantSecret } from '../../composables/useAchievements.js'
import { useAuthStore } from '../../stores/auth.js'

const WARN_DAYS = 2
const auth = useAuthStore()
const ev = activeEvent()
const pts = computed(() => evtOf(auth.userData, ev).pts)
// นักล่าฟักทอง: เก็บรวมครบ 500 (ทั้งจากข้อสอบและดัน) — เช็คที่แบนเนอร์เพราะโผล่ทั้ง Home/Play (grantSecret ซ้ำได้ ไม่เขียนซ้ำ)
const got = computed(() => evtOf(auth.userData, ev).got || 0)
watch(got, (n) => { if (ev?.id === 'hw26' && n >= EVT_HUNTER_GOAL) grantSecret('hw_hunter') }, { immediate: true })
const endText = ev ? new Date(ev.end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : ''
// นับวันปฏิทินที่เหลือรวมวันนี้ (วันสุดท้าย = 1)
const daysLeft = ev ? Math.max(1, Math.ceil((ev.end - Date.now()) / 864e5)) : 99
// นับถอยหลังถึงจบอีเวนต์ — เดินทุกวินาที (ตัวจับเวลาเดียว ไม่แตะ Firestore)
const now = ref(Date.now())
let t = null
onMounted(() => { t = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(t))
const pad = (n) => String(n).padStart(2, '0')
const cdText = computed(() => {
  if (!ev) return ''
  const ms = Math.max(0, ev.end - now.value)
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60
  return `${d > 0 ? d + ' วัน ' : ''}${pad(h)}:${pad(m)}:${pad(s)}`
})
</script>

<style scoped>
.evb { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #2b1f3d; background: linear-gradient(120deg, #fdba74, #c4b5fd); border-radius: 18px; padding: 10px 12px; margin-bottom: 10px; box-shadow: 0 0 18px rgba(253, 186, 116, .45); }
.evb.urgent { background: linear-gradient(120deg, #fb923c, #f472b6); box-shadow: 0 0 20px rgba(251, 146, 60, .6); }
.evb-ic { font-size: 1.8rem; line-height: 1; }
.evb-txt { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.evb-txt b { font-size: .92rem; }
.evb-txt small { font-size: .72rem; color: #3b2a52; }
.evb.urgent .evb-txt small { color: #2b1f3d; font-weight: 700; }
.evb-cd { font-size: .74rem; font-weight: 800; color: #7c2d12; background: rgba(255,255,255,.65); border-radius: 999px; padding: 1px 8px; margin-left: 4px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.evb-have { background: #fff; border-radius: 12px; padding: 6px 10px; font-weight: 800; font-size: .84rem; color: #9a3412; white-space: nowrap; }
</style>
