<!-- 🎯 ป้ายลอยตอนอยู่ในโหมดโฟกัสแต่ไปหน้าอื่น (เช่น ทำข้อสอบ) — แตะกลับห้อง
     mount ใน App.vue ระดับ root (sibling ของ nav) · ลอยเหนือแถบล่าง ไม่ทับปุ่มหัวหน้า
     หน้าที่สอง: ตั้งสถานะ "ทำข้อสอบ" เมื่ออยู่หน้า /quiz (สถานะ derive จาก route) -->
<template>
  <RouterLink v-if="show" to="/focus" class="fp" aria-label="กลับโหมดโฟกัส">
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

const route = useRoute()
const auth = useAuthStore()
const house = computed(() => auth.userData?.residence?.level || 1)
const fm = useFocusMode(() => house.value)
const show = computed(() => fm.state.active && route.name !== 'focus')
watch(() => route.name, (n) => fm.setOnQuiz(['quiz', 'daily', 'timeAttack'].includes(n)), { immediate: true })
</script>

<style scoped>
.fp { position: fixed; z-index: 210; right: 12px; bottom: calc(var(--btm) + 12px); display: flex; align-items: center; gap: 6px; background: var(--primary); color: #fff; border-radius: 99px; padding: 7px 12px; font-size: .85rem; font-weight: 700; font-variant-numeric: tabular-nums; box-shadow: var(--shadow-lg); }
.fp small { font-size: .72rem; font-weight: 600; opacity: .9; }
.fp-dot { width: 8px; height: 8px; border-radius: 50%; background: #86efac; animation: fp-pulse 1.6s ease-in-out infinite; }
@keyframes fp-pulse { 50% { opacity: .35; } }
</style>
