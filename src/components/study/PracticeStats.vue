<!--
  <PracticeStats> — แท็บ 📊 ผลฝึก หน้าฉัน
  radar 21 ด้าน / แถบอ่อน→เก่ง จาก study.gs (0 reads) · หมวดที่ควรฝึก · ข้อที่ผิดบ่อย (≤5 reads ตอนเปิดแท็บ)
  spec: docs/superpowers/specs/2026-10-31-practice-stats-radar-design.md
-->
<template>
  <div class="ps">
    <div class="ps-card">
      <div class="ps-head">
        <span class="ps-title"><Emoji char="📊" /> ผลฝึกของฉัน</span>
        <div class="ps-seg" role="tablist">
          <button :class="{ on: view === 'radar' }" @click="view = 'radar'">กราฟใยแมงมุม</button>
          <button :class="{ on: view === 'bars' }" @click="view = 'bars'">เรียงอ่อน→เก่ง</button>
        </div>
      </div>
      <p class="ps-sub">
        <template v-if="totalAnswered">ทำไปแล้ว {{ totalAnswered.toLocaleString() }} ข้อ · ถูก {{ totalPct }}% · แตะหมวดเพื่อดูละเอียด</template>
        <template v-else>เริ่มนับตั้งแต่ 31 ต.ค. 69 — ทำข้อสอบสักชุด กราฟจะเริ่มขึ้นเลย</template>
      </p>

      <svg v-if="view === 'radar'" class="ps-radar" viewBox="0 0 340 340" role="img" aria-label="กราฟผลฝึก 21 หมวด">
        <polygon v-for="lv in [0.25, 0.5, 0.75, 1]" :key="lv" class="ps-ring" :points="ring(lv)" />
        <line v-for="(r, i) in rows" :key="'l' + r.key" class="ps-spoke" :x1="C" :y1="C" :x2="pt(i, 1).x" :y2="pt(i, 1).y" />
        <polygon class="ps-area" :points="rows.map((r, i) => xy(pt(i, r.pct / 100))).join(' ')" />
        <circle v-for="(r, i) in rows" :key="'d' + r.key" class="ps-dot" :class="{ none: !r.t, sel: sel === r.key }"
          :cx="pt(i, r.pct / 100).x" :cy="pt(i, r.pct / 100).y" r="3.5" />
        <text v-for="(r, i) in rows" :key="'t' + r.key" class="ps-lbl" :class="{ sel: sel === r.key, none: !r.t }"
          :x="pt(i, 1.2).x" :y="pt(i, 1.2).y" :text-anchor="anchor(i)" dominant-baseline="middle"
          @click="pick(r.key)">{{ r.label }}</text>
      </svg>

      <div v-else class="ps-bars">
        <button v-for="r in weakFirst" :key="r.key" class="ps-bar" :class="{ sel: sel === r.key }" @click="pick(r.key)">
          <span class="ps-bar-name">{{ r.label }}</span>
          <span class="ps-bar-track"><span class="ps-bar-fill" :style="{ width: r.pct + '%' }"></span></span>
          <span class="ps-bar-val">{{ r.t ? r.pct + '%' : 'ยังไม่ได้ฝึก' }}</span>
        </button>
      </div>

      <div v-if="selRow" class="ps-detail">
        <div class="ps-detail-name">{{ fullName(selRow) }}</div>
        <div class="ps-detail-num">
          <template v-if="selRow.t">ถูก {{ selRow.c }}/{{ selRow.t }} ข้อ ({{ selRow.pct }}%)</template>
          <template v-else>ยังไม่ได้ฝึกหมวดนี้</template>
        </div>
        <RouterLink class="ps-go" :to="practiceLink(selRow)">▶ ฝึกหมวดนี้</RouterLink>
      </div>
    </div>

    <div class="ps-card">
      <div class="ps-title"><Emoji char="🎯" /> หมวดที่ควรฝึก</div>
      <p class="ps-sub">อันดับจากหมวดที่ทำแล้วอย่างน้อย {{ MIN_ANSWERED }} ข้อ — ถ้ายังไม่พอ จะชวนไปลองหมวดที่ยังไม่เคยทำ</p>
      <RouterLink v-for="r in suggest" :key="r.key" class="ps-sug" :to="practiceLink(r)">
        <span class="ps-sug-name"><b>{{ r.label }}</b> {{ thName(r) }}</span>
        <span class="ps-sug-val">{{ r.t ? r.pct + '%' : 'ยังไม่เคยทำ' }} ›</span>
      </RouterLink>
    </div>

    <div class="ps-card">
      <div class="ps-title"><Emoji char="🔁" /> ข้อที่ผิดบ่อย</div>
      <p v-if="!wrongIds.length" class="ps-sub">ยังไม่มีข้อที่ผิดค้างอยู่ — เก่งมาก! <Emoji char="✨" /></p>
      <template v-else>
        <p class="ps-sub">แตะเพื่อดูเฉลย · ตอบถูกติดกัน 3 ครั้งในโหมดทบทวน ข้อจะหลุดออกจากรายการเอง</p>
        <div v-if="loadingWrong" class="ps-sub">กำลังโหลด…</div>
        <button v-for="w in wrongRows" :key="w.id" class="ps-wrong" :class="{ open: openId === w.id }" @click="openId = openId === w.id ? null : w.id">
          <span class="ps-wrong-n">ผิด {{ w.lapses }} ครั้ง</span>
          <span class="ps-wrong-q">{{ w.q?.question || 'ข้อนี้ถูกนำออกจากคลังแล้ว' }}</span>
          <span v-if="openId === w.id && w.q" class="ps-wrong-ans">
            <b>เฉลย:</b> {{ w.q.choices?.[w.q.answer] }}
            <span v-if="w.q.explanation" class="ps-wrong-exp"><Emoji char="💡" /> {{ w.q.explanation }}</span>
          </span>
        </button>
        <RouterLink class="ps-go ps-go-wide" to="/quiz?mode=redo">▶ ทบทวนข้อที่เคยผิด</RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useUsageStore } from '../../stores/usage.js'
import Emoji from '../shared/Emoji.vue'
import { groupByKey } from '../../data/plecc.js'
import {
  MIN_ANSWERED, axisStats, sortWeakFirst, suggestAxes, topWrongIds, axisPrimaryGroup, axisFullName,
} from '../../utils/practiceStats.js'

const auth = useAuthStore()
const usage = useUsageStore()

const view = ref('radar')
const sel = ref(null)
const rows = computed(() => axisStats(auth.userData?.study?.gs))
const weakFirst = computed(() => sortWeakFirst(rows.value))
const suggest = computed(() => suggestAxes(rows.value))
const selRow = computed(() => rows.value.find(r => r.key === sel.value) || null)
const totalAnswered = computed(() => rows.value.reduce((s, r) => s + r.t, 0))
const totalPct = computed(() => {
  const c = rows.value.reduce((s, r) => s + r.c, 0)
  return totalAnswered.value ? Math.round((c / totalAnswered.value) * 100) : 0
})

function pick(key) { sel.value = sel.value === key ? null : key }
const fullName = axisFullName
const thName = (r) => r.groups.map(k => groupByKey(k)?.th).filter(Boolean).join(' + ')
const practiceLink = (r) => ({ path: '/quiz', query: { group: axisPrimaryGroup(r) } })

// ── เรขาคณิต radar ── (เริ่มที่ 12 นาฬิกา ตามเข็ม)
const C = 170, R = 112
const N = 21
function pt(i, f) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N
  return { x: C + Math.cos(a) * R * f, y: C + Math.sin(a) * R * f }
}
const xy = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`
const ring = (f) => Array.from({ length: N }, (_, i) => xy(pt(i, f))).join(' ')
function anchor(i) {
  const x = Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / N)
  return Math.abs(x) < 0.2 ? 'middle' : x > 0 ? 'start' : 'end'
}

// ── ข้อที่ผิดบ่อย — โหลดโจทย์ตอนเปิดแท็บ (≤5 reads) ──
const wrongIds = computed(() => topWrongIds(auth.userData?.study?.qcards, 5))
const wrongDocs = ref({})
const loadingWrong = ref(false)
const openId = ref(null)
const wrongRows = computed(() => wrongIds.value.map(w => ({ ...w, q: wrongDocs.value[w.id] || null })))
onMounted(async () => {
  const ids = wrongIds.value.map(w => w.id)
  if (!ids.length) return
  loadingWrong.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), where(documentId(), 'in', ids)))
    usage.track(snap.size)
    const out = {}
    for (const d of snap.docs) { const q = d.data(); if (q.isPublished) out[d.id] = q }
    wrongDocs.value = out
  } catch (e) { console.error('[practice wrong]', e) } finally { loadingWrong.value = false }
})
</script>

<style scoped>
.ps { display: flex; flex-direction: column; gap: 10px; }
.ps-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; padding: 14px; box-shadow: var(--pop); }
.ps-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.ps-title { font-weight: 800; font-size: .92rem; color: var(--ink); }
.ps-sub { font-size: .74rem; color: var(--muted); margin: 6px 0 8px; line-height: 1.5; }
.ps-seg { display: flex; border: var(--bw) solid var(--line); border-radius: 999px; overflow: hidden; }
.ps-seg button { border: 0; background: #fff; padding: 5px 10px; font-family: inherit; font-size: .72rem; font-weight: 700; color: var(--muted); cursor: pointer; }
.ps-seg button.on { background: var(--primary); color: #fff; }

.ps-radar { width: 100%; max-width: 380px; display: block; margin: 0 auto; overflow: visible; }
.ps-ring { fill: none; stroke: var(--line); stroke-width: 1; }
.ps-spoke { stroke: var(--line); stroke-width: 1; }
.ps-area { fill: color-mix(in srgb, var(--primary) 22%, transparent); stroke: var(--primary); stroke-width: 2; stroke-linejoin: round; }
.ps-dot { fill: var(--primary); }
.ps-dot.none { fill: var(--line); }
.ps-dot.sel { fill: var(--accent); r: 5.5; }
.ps-lbl { font-size: 11.5px; font-weight: 700; fill: var(--ink); cursor: pointer; }
.ps-lbl.none { fill: var(--muted); }
.ps-lbl.sel { fill: var(--accent); }

.ps-bars { display: flex; flex-direction: column; gap: 4px; }
.ps-bar { display: grid; grid-template-columns: 76px 1fr 72px; align-items: center; gap: 8px; border: 0; background: none; padding: 4px 2px; font-family: inherit; cursor: pointer; border-radius: 8px; text-align: left; }
.ps-bar.sel { background: var(--primary-light); }
.ps-bar-name { font-size: .74rem; font-weight: 700; color: var(--ink); }
.ps-bar-track { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.ps-bar-fill { display: block; height: 100%; background: var(--primary); border-radius: 999px; }
.ps-bar-val { font-size: .72rem; color: var(--muted); text-align: right; }

.ps-detail { margin-top: 10px; padding: 10px 12px; background: var(--primary-light); border-radius: 12px; }
.ps-detail-name { font-weight: 800; font-size: .82rem; color: var(--ink); }
.ps-detail-num { font-size: .76rem; color: var(--muted); margin: 3px 0 8px; }
.ps-go { display: inline-block; background: var(--primary); color: #fff; font-weight: 800; font-size: .78rem; padding: 7px 14px; border-radius: 999px; text-decoration: none; }
.ps-go-wide { display: block; text-align: center; margin-top: 8px; }

.ps-sug { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 2px; border-top: 1px solid var(--line); text-decoration: none; color: var(--ink); }
.ps-sug:first-of-type { border-top: 0; }
.ps-sug-name { font-size: .8rem; }
.ps-sug-val { font-size: .76rem; font-weight: 800; color: var(--primary); white-space: nowrap; }

.ps-wrong { display: flex; flex-direction: column; gap: 3px; width: 100%; text-align: left; border: 0; border-top: 1px solid var(--line); background: none; padding: 10px 2px; font-family: inherit; cursor: pointer; }
.ps-wrong-n { font-size: .7rem; font-weight: 800; color: var(--accent); }
.ps-wrong-q { font-size: .8rem; color: var(--ink); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ps-wrong.open .ps-wrong-q { -webkit-line-clamp: unset; display: block; }
.ps-wrong-ans { font-size: .78rem; color: var(--ink); background: #f0fdf4; border-radius: 8px; padding: 8px; margin-top: 4px; line-height: 1.5; }
.ps-wrong-exp { display: block; margin-top: 4px; color: var(--muted); }
</style>
