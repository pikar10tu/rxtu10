<!-- 🎯 ป้ายลอยตอนอยู่ในโหมดโฟกัสแต่ไปหน้าอื่น (เช่น ทำข้อสอบ) — แตะกลับห้อง
     mount ใน App.vue ระดับ root (sibling ของ nav) · ลอยเหนือแถบล่าง ไม่ทับปุ่มหัวหน้า
     หน้าที่สอง: ตั้งสถานะ "ทำข้อสอบ" เมื่ออยู่หน้า /quiz (สถานะ derive จาก route) -->
<template>
  <RouterLink v-if="show" to="/focus" class="fp" aria-label="กลับ Co-working space">
    <span class="fp-dot" aria-hidden="true"></span>
    🎯 {{ fmtClock(fm.state.secs) }}
    <small v-if="!fm.capFull.value">+{{ house }}/วิ</small>
    <small v-if="audio.track >= 0">♪</small>
  </RouterLink>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useFocusMode, fmtClock } from '../../composables/useFocusMode.js'
import { audioState as audio } from '../../utils/focusAudio.js'
import { useFocusRoom } from '../../composables/useFocusRoom.js'
import { useToast } from '../../composables/useToast.js'
import { freeSeat, seatFoot } from '../../utils/focusLayout.js'

const route = useRoute()
const auth = useAuthStore()
const house = computed(() => auth.userData?.residence?.level || 1)
const fm = useFocusMode(() => house.value)
const show = computed(() => fm.state.active && route.name !== 'focus')
watch(() => route.name, (n) => fm.setOnQuiz(['quiz', 'daily', 'timeAttack'].includes(n)), { immediate: true })
// 🎮 หน้าเกม (ทุกอย่างใต้ /play + เกมเพ็ท) → สถานะเล่นเกม · ฟาร์ม/เพ็ท/ร้านไม่นับเป็นเกม
const GAME_ROUTES = ['tower', 'arena', 'team', 'dungeon', 'expedition', 'event']
watch(() => route.path, () => fm.setOnGame(route.path.startsWith('/play') || GAME_ROUTES.includes(route.name)), { immediate: true })
// สถานะในห้อง (✍️/💤) ส่งให้เพื่อนเห็น · รีเฟรชหน้าอื่นระหว่างอยู่ในห้อง → presence หาย (onDisconnect) → เข้าห้องให้ใหม่
const room = useFocusRoom()
watch(() => fm.status.value, (st) => room.patch({ st }))
watch(() => [fm.state.active, room.joined.value, auth.userData?.uid || auth.userData?.nickname], ([active, joined, ready]) => {
  if (!active || joined || !ready || route.name === 'focus') return   // หน้าโฟกัสจัดการเอง
  const taken = new Set(room.people.value.filter(p => p.zone === fm.state.zone).map(p => p.seat))
  const seat = freeSeat(taken); const [x, y] = seat >= 0 ? seatFoot(seat) : [80, 80]
  room.join({ zone: fm.state.zone, seat, x, y, st: fm.status.value }, { auto: true })
}, { immediate: true })
// 📱 เครื่องอื่นเข้าห้องแทน → เครื่องนี้ออก (นับเครื่องเดียว)
const { toast } = useToast()
watch(() => room.kicked.value, () => {
  if (!fm.state.active) return
  fm.leave()
  toast('ย้ายไปนั่งที่เครื่องอื่นแล้ว · เครื่องนี้ออกจากห้อง', 'info')
})
</script>

<style scoped>
.fp { position: fixed; z-index: 210; right: 12px; bottom: calc(var(--btm) + 12px); display: flex; align-items: center; gap: 6px; background: var(--primary); color: #fff; border-radius: 99px; padding: 7px 12px; font-size: .85rem; font-weight: 700; font-variant-numeric: tabular-nums; box-shadow: var(--shadow-lg); }
.fp small { font-size: .72rem; font-weight: 600; opacity: .9; }
.fp-dot { width: 8px; height: 8px; border-radius: 50%; background: #86efac; animation: fp-pulse 1.6s ease-in-out infinite; }
@keyframes fp-pulse { 50% { opacity: .35; } }
</style>
