<template>
  <!-- การ์ดผลสอบจำลองเหนือทีมเฝ้าบ้าน · ผลใหม่ = ฟ้าเต็ม+ป้ายใหม่ · เปิดแล้ว = ขาว+วงแหวน · ไม่มีผลเรา = ชวนดูเฉลี่ยรุ่น -->
  <RouterLink v-if="exam" :to="{ path: '/mock-score', query: { exam: exam.id } }" class="msc" :class="{ hot }">
    <span v-if="hot" class="msc-ico"><Emoji char="✉️" /></span>
    <svg v-else-if="my" class="msc-ring" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="none" stroke="#edf1f7" stroke-width="5" />
      <circle cx="24" cy="24" r="19" fill="none" :stroke="pass ? '#10b981' : '#ef4444'" stroke-width="5" stroke-linecap="round"
        :stroke-dasharray="`${C * pct} ${C}`" transform="rotate(-90 24 24)" />
      <text x="24" y="28" text-anchor="middle" class="msc-ring-t">{{ Math.round(pct * 100) }}%</text>
    </svg>
    <span v-else class="msc-ico"><Emoji char="📋" /></span>
    <span class="msc-txt">
      <span class="msc-t1">
        <template v-if="hot">ผล{{ exam.short || exam.name }} มาแล้ว <span class="msc-new">ใหม่</span></template>
        <template v-else>{{ exam.name }}</template>
      </span>
      <span class="msc-t2">
        <template v-if="hot">{{ exam.stations.length }} ฐาน · เห็นแค่เราคนเดียว</template>
        <template v-else-if="my">ผ่าน {{ nPassSt }}/{{ exam.stations.length }} ฐาน · ดูรายฐาน</template>
        <template v-else>ยังไม่มีผลของเรา · ดูค่าเฉลี่ยรุ่น</template>
      </span>
    </span>
    <span class="msc-go">›</span>
  </RouterLink>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useMockScores, loadMockScores, isSeen } from '../../composables/useMockScores.js'
import { overallPct, stationPct } from '../../utils/mockScore.js'

const auth = useAuthStore()
const { exams, mine } = useMockScores()
const C = 2 * Math.PI * 19
const exam = computed(() => exams.value[0] || null)
const my = computed(() => (exam.value && mine.value[exam.value.id]) || null)
const hot = computed(() => !!my.value && !isSeen(exam.value.id))
const pct = computed(() => my.value ? overallPct(exam.value.stations, my.value.scores) : 0)
const pass = computed(() => pct.value >= exam.value.passPct - 1e-9)
const nPassSt = computed(() => exam.value.stations.filter((s, i) => stationPct(my.value?.scores?.[i], s.max) >= exam.value.passPct - 1e-9).length)

onMounted(() => loadMockScores(auth.currentUser?.uid))
watch(() => auth.currentUser?.uid, uid => loadMockScores(uid))
</script>

<style scoped>
.msc { display: flex; align-items: center; gap: 12px; padding: 10px 12px; margin-top: 10px; border-radius: 16px; background: var(--surface); border: var(--bw) solid var(--line); box-shadow: var(--pop); color: var(--ink); text-decoration: none; position: relative; transition: transform .15s; }
.msc:active { transform: scale(.98); }
.msc-ring { width: 46px; height: 46px; flex: none; }
.msc-ring-t { font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 11px; fill: var(--ink); }
.msc-ico { font-size: 1.8rem; width: 46px; text-align: center; flex: none; }
.msc-txt { display: flex; flex-direction: column; min-width: 0; }
.msc-t1 { font-weight: 700; font-size: .9rem; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.msc-t2 { font-size: .76rem; color: var(--muted); margin-top: 1px; }
.msc-go { margin-left: auto; font-size: 1.3rem; color: var(--muted); }
.msc-new { font-size: .7rem; background: var(--accent); color: #fff; border-radius: 6px; padding: 0 6px; font-weight: 700; }
.msc.hot { background: linear-gradient(120deg, #3593cf, #6c8ff0); color: #fff; border-color: transparent; box-shadow: 0 8px 20px -8px rgba(53, 147, 207, .7); }
.msc.hot .msc-t2, .msc.hot .msc-go { color: rgba(255, 255, 255, .9); }
.msc.hot .msc-new { background: #fff; color: #e2518a; }
.msc.hot .msc-ico { animation: msc-wig 2.4s ease-in-out infinite; }
.msc.hot::before { content: ''; position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; }
@keyframes msc-wig { 0%, 85%, 100% { transform: rotate(0); } 88% { transform: rotate(-12deg); } 92% { transform: rotate(10deg); } 96% { transform: rotate(-6deg); } }
</style>
