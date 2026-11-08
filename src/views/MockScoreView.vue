<template>
  <div class="tab-content ms">
    <RouterLink to="/me" class="ms-back">‹ ฉัน</RouterLink>
    <div class="page-title"><Emoji char="📋" /> ผลสอบจำลอง</div>

    <div v-if="!loaded" class="ms-empty">กำลังโหลด…</div>
    <div v-else-if="!exams.length" class="ms-empty">ยังไม่มีประกาศผลสอบจำลอง</div>

    <template v-else>
      <div v-if="exams.length > 1" class="ms-exams">
        <button v-for="e in exams" :key="e.id" :class="{ on: e.id === exam.id }" @click="pick(e.id)">
          {{ e.name }}<small>{{ e.date }}</small>
        </button>
      </div>

      <!-- หัว: วงแหวน % รวม + ผ่าน/ยังไม่ผ่าน · ไม่มีผลของเรา = โชว์ภาพรวมรุ่นแทน -->
      <section class="ms-card ms-head">
        <svg class="ms-ring" viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r="40" fill="none" stroke="#edf1f7" stroke-width="9" />
          <circle cx="46" cy="46" r="40" fill="none" :stroke="ringColor" stroke-width="9" stroke-linecap="round"
            :stroke-dasharray="`${C * headPct} ${C}`" transform="rotate(-90 46 46)" />
          <text x="46" y="52" text-anchor="middle" class="ms-ring-t">{{ pctText(headPct) }}</text>
        </svg>
        <div class="ms-head-txt">
          <div class="ms-name">{{ exam.name }}</div>
          <template v-if="my">
            <div class="ms-total">{{ fmt(my.total) }}<small> / {{ exam.totalMax }}</small></div>
            <div class="ms-chips">
              <span class="ms-chip" :class="pass ? 'ok' : 'no'">{{ pass ? 'ผ่านเกณฑ์' : 'ยังไม่ถึงเกณฑ์' }} {{ pctText(exam.passPct) }}</span>
              <span class="ms-chip">ผ่าน {{ nPassSt }}/{{ exam.stations.length }} ฐาน</span>
            </div>
          </template>
          <template v-else>
            <div class="ms-sub">ยังไม่มีผลของเราในรอบนี้ — ดูภาพรวมรุ่นไปก่อนได้</div>
            <div class="ms-chips"><span class="ms-chip">เกณฑ์ผ่าน {{ pctText(exam.passPct) }}</span></div>
          </template>
        </div>
      </section>

      <!-- ภาพรวมรุ่น: เฉลี่ย (เลขคณิต) · ต่ำสุด · สูงสุด ของ % รวม -->
      <section class="ms-card ms-cls">
        <div class="ms-cls-cap">ภาพรวมรุ่น · {{ exam.n }} คน</div>
        <div class="ms-cls-grid">
          <div class="ms-cls-box avg"><small>ค่าเฉลี่ย</small><b>{{ pctText(clsPct) }}</b><small v-if="Number.isFinite(exam.sdPct)" class="ms-sd">SD {{ pctText(exam.sdPct) }}</small></div>
          <div class="ms-cls-box"><small>ต่ำสุด</small><b>{{ Number.isFinite(exam.minPct) ? pctText(exam.minPct) : '-' }}</b></div>
          <div class="ms-cls-box"><small>สูงสุด</small><b>{{ Number.isFinite(exam.maxPct) ? pctText(exam.maxPct) : '-' }}</b></div>
        </div>
      </section>

      <div v-if="my" class="ms-private"><Emoji char="🔒" /> คะแนนนี้เห็นแค่เราคนเดียว</div>

      <!-- แถบรายฐาน: ยาว = % ของฐานนั้น · แถบจาง = ช่วงต่ำสุด–สูงสุดของรุ่น · ขีด = เกณฑ์ · จุดขาว = เฉลี่ยรุ่น -->
      <section class="ms-card">
        <div class="ms-rows">
          <div v-for="r in rows" :key="r.i" class="ms-row">
            <div class="ms-row-top">
              <span class="ms-st">{{ r.name }}</span>
              <span class="ms-sc" v-if="my"><b>{{ fmt(r.score) }}</b>/{{ r.max }}</span>
              <span class="ms-sc" v-else>เฉลี่ย <b>{{ fmt(r.mean) }}</b>/{{ r.max }}</span>
            </div>
            <div class="ms-bar">
              <span v-if="Number.isFinite(r.min)" class="ms-range" :style="{ left: r.minPct * 100 + '%', width: (r.topPct - r.minPct) * 100 + '%' }" />
              <i :style="{ width: r.pct * 100 + '%', background: barColor(r.pct) }" />
              <span class="ms-pm" :style="{ left: exam.passPct * 100 + '%' }" />
              <span class="ms-avg" :style="{ left: r.meanPct * 100 + '%' }" />
            </div>
            <div class="ms-row-cls">
              <span class="avg">เฉลี่ย <b>{{ fmt(r.mean) }}</b></span>
              <template v-if="Number.isFinite(r.min)"><span>ต่ำสุด {{ fmt(r.min) }}</span><span>สูงสุด {{ fmt(r.top) }}</span></template>
              <span v-if="Number.isFinite(r.sd)">SD {{ fmt(r.sd) }}</span>
            </div>
          </div>
        </div>
        <div class="ms-legend">
          <span><span class="ms-lg-dot" /> เฉลี่ยรุ่น</span>
          <span><span class="ms-lg-rng" /> ช่วงต่ำสุด–สูงสุด</span>
          <span><span class="ms-lg-pm" /> เกณฑ์ {{ pctText(exam.passPct) }}</span>
        </div>
      </section>

      <div v-if="my && weak >= 0" class="ms-weak">
        <Emoji char="💡" /> ฐานที่ควรฝึกเพิ่ม: <b>{{ exam.stations[weak].name }}</b>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import { useAuthStore } from '../stores/auth.js'
import { useMockScores, loadMockScores, markSeen } from '../composables/useMockScores.js'
import { stationPct, overallPct, classPct, weakestStation } from '../utils/mockScore.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { exams, mine, loaded } = useMockScores()
const C = 2 * Math.PI * 40

const exam = computed(() => exams.value.find(e => e.id === route.query.exam) || exams.value[0])
const my = computed(() => (exam.value && mine.value[exam.value.id]) || null)
const clsPct = computed(() => classPct(exam.value.stations))
const myPct = computed(() => my.value ? overallPct(exam.value.stations, my.value.scores) : 0)
const headPct = computed(() => my.value ? myPct.value : clsPct.value)
const pass = computed(() => myPct.value >= exam.value.passPct - 1e-9)
const ringColor = computed(() => !my.value ? 'var(--primary)' : pass.value ? '#10b981' : '#ef4444')
const rows = computed(() => exam.value.stations.map((s, i) => {
  const score = my.value?.scores?.[i]
  const meanPct = stationPct(s.mean, s.max)
  return { i, name: s.name, max: s.max, mean: s.mean, sd: s.sd, min: s.min, top: s.top,
    minPct: stationPct(s.min, s.max), topPct: stationPct(s.top, s.max), score, meanPct, pct: my.value ? stationPct(score, s.max) : meanPct }
}))
const nPassSt = computed(() => rows.value.filter(r => r.pct >= exam.value.passPct - 1e-9).length)
const weak = computed(() => my.value ? weakestStation(exam.value.stations, my.value.scores, exam.value.passPct) : -1)

const pctText = p => `${Math.round(p * 1000) / 10}%`
const fmt = v => Number.isFinite(v) ? String(Math.round(v * 100) / 100) : '-'
const barColor = p => p >= exam.value.passPct ? '#10b981' : p >= exam.value.passPct - 0.1 ? '#f59e0b' : '#ef4444'
function pick(id) { router.replace({ query: { ...route.query, exam: id } }) }

onMounted(() => loadMockScores(auth.currentUser?.uid))
watch(() => auth.currentUser?.uid, uid => loadMockScores(uid))
watch(() => loaded.value && exam.value?.id, id => { if (id) markSeen(id, !!my.value) }, { immediate: true })
</script>

<style scoped>
.ms { display: flex; flex-direction: column; gap: 12px; }
.ms .page-title { margin-bottom: 0; }
.ms-back { font-size: .85rem; color: var(--muted); text-decoration: none; font-weight: 600; }
.ms-empty { text-align: center; color: var(--muted); padding: 40px 0; }
.ms-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); padding: 14px; }
.ms-exams { display: flex; gap: 6px; overflow-x: auto; }
.ms-exams button { flex: none; font: inherit; font-size: .78rem; border: var(--bw) solid var(--line); background: var(--surface); border-radius: 12px; padding: 6px 10px; color: var(--ink); display: flex; flex-direction: column; text-align: left; }
.ms-exams button small { color: var(--muted); font-size: .7rem; }
.ms-exams button.on { border-color: var(--primary); font-weight: 700; }
.ms-head { display: flex; align-items: center; gap: 14px; }
.ms-ring { width: 92px; height: 92px; flex: none; }
.ms-ring-t { font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 16px; fill: var(--ink); }
.ms-head-txt { min-width: 0; }
.ms-name { font-size: .8rem; color: var(--muted); }
.ms-total { font-family: var(--font-display); font-size: 1.8rem; line-height: 1.1; color: var(--ink); }
.ms-total small { font-size: .95rem; color: var(--muted); }
.ms-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 5px; }
.ms-chip { font-size: .72rem; font-weight: 700; border-radius: 999px; padding: 2px 9px; background: #eef5fb; color: var(--ink); }
.ms-chip.ok { background: #d1fae5; color: #047857; }
.ms-chip.no { background: #fee2e2; color: #b91c1c; }
.ms-sub { font-size: .78rem; color: var(--muted); margin-top: 5px; line-height: 1.4; }
.ms-private { font-size: .75rem; color: var(--muted); text-align: center; margin-top: -4px; }
.ms-rows { display: grid; gap: 11px; }
.ms-row-top { display: flex; justify-content: space-between; gap: 8px; font-size: .85rem; }
.ms-st { font-weight: 600; color: var(--ink); }
.ms-sc { font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--muted); }
.ms-sc b { color: var(--ink); }
.ms-bar { position: relative; height: 12px; border-radius: 999px; background: #edf1f7; margin-top: 4px; }
.ms-bar i { position: absolute; inset: 0 auto 0 0; border-radius: 999px; animation: ms-grow .7s cubic-bezier(.34, 1.3, .64, 1); }
.ms-pm { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--ink); opacity: .55; }
.ms-avg { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: #fff; border: 2px solid var(--ink); }
@keyframes ms-grow { from { width: 0; } }
.ms-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: .72rem; color: var(--muted); margin-top: 12px; }
.ms-legend > span { display: flex; align-items: center; gap: 5px; }
.ms-lg-dot { width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--ink); display: inline-block; }
.ms-lg-pm { width: 2px; height: 11px; background: var(--ink); display: inline-block; }
.ms-cls { padding: 12px 14px; }
.ms-cls-cap { font-size: .78rem; color: var(--muted); font-weight: 600; margin-bottom: 8px; }
.ms-cls-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ms-cls-box { border: var(--bw) solid var(--line); border-radius: 12px; padding: 8px 4px; text-align: center; display: flex; flex-direction: column; }
.ms-cls-box small { font-size: .72rem; color: var(--muted); }
.ms-cls-box b { font-family: var(--font-display); font-weight: 400; font-size: 1.2rem; color: var(--ink); }
.ms-cls-box .ms-sd { color: var(--primary); font-weight: 600; }
.ms-cls-box.avg { background: #eef5fb; border-color: var(--primary); }
.ms-cls-box.avg b { color: var(--primary); }
.ms-range { position: absolute; top: calc(100% + 3px); height: 4px; border-radius: 999px; background: rgba(53, 147, 207, .45); }
.ms-row-cls { display: flex; flex-wrap: wrap; gap: 2px 10px; font-size: .74rem; color: var(--muted); margin-top: 9px; font-variant-numeric: tabular-nums; }
.ms-row-cls .avg { color: var(--primary); }
.ms-row-cls .avg b { color: var(--primary); }
.ms-lg-rng { width: 16px; height: 4px; border-radius: 999px; background: rgba(53, 147, 207, .3); display: inline-block; }
.ms-weak { background: #eef5fb; border-radius: 14px; padding: 10px 12px; font-size: .84rem; color: var(--ink); }
.ms-weak b { color: #b45309; }
</style>
