<!-- src/views/Cc2CaseView.vue — เคส CC2 OSPE เดี่ยว /study/cc2/:id (11 พ.ย. 2026)
     ประเมินตัวเอง: อ่านสถานการณ์ → ติ๊กเช็คลิสต์/เติมคำ → "จบเคส" บันทึกผลผ่าน useCc2Progress().finishCase (เลน OPUS)
     CC2 เป็น self-learning ล้วน — ไม่มีเหรียญ ไม่โชว์ข้อความได้เหรียญ · เคสถัดไปตาม field next ของ index -->
<template>
  <div class="tab-content ccv">
    <header class="ccv-head">
      <router-link to="/study/cc2" class="ccv-back">‹ คลังเคส</router-link>
      <span v-if="caseData" class="ccv-timer" :class="{ over: overTime }">{{ clock }}</span>
    </header>

    <div v-if="error" class="ccv-card ccv-err">{{ error }} <button type="button" @click="load">ลองใหม่</button></div>
    <div v-else-if="!caseData" class="ccv-card ccv-hint">กำลังโหลดเคส…</div>

    <template v-else>
      <h1 class="ccv-title"><span class="ccv-id">{{ caseData.id }}</span>{{ caseData.title }}</h1>

      <!-- ผลหลังจบเคส -->
      <section v-if="done" class="ccv-card ccv-result">
        <template v-if="result.tot > 0">
          <div class="ccv-res-top">
            <div class="ccv-res-score">{{ fmt(result.got) }}<small>/{{ fmt(result.tot) }}</small></div>
            <div class="ccv-res-pct" :class="band">{{ pct }}%</div>
          </div>
          <div class="ccv-res-msg">{{ resultMsg }}</div>
        </template>
        <div v-else class="ccv-res-msg">{{ caseData.rest ? 'พักเสร็จแล้ว ไปสถานีถัดไปกัน' : 'ทำเสร็จแล้ว ดูเฉลยด้านล่างได้เลย' }}</div>
        <div class="ccv-res-act">
          <button type="button" class="ccv-btn alt" @click="reset">ทำอีกครั้ง</button>
          <button v-if="quick" type="button" class="ccv-btn" @click="randomNext">🎲 สุ่มอีกเคส</button>
          <router-link v-else-if="nextId" :to="`/study/cc2/${nextId}`" class="ccv-btn">เคสถัดไป ›</router-link>
          <router-link v-else to="/study/cc2" class="ccv-btn">กลับคลังเคส</router-link>
        </div>
      </section>

      <Cc2CaseBody :case-data="caseData" role="solo" recall :readonly="done" @recall-hidden="keyHidden = $event" v-model:checks="checks" v-model:answers="answers" @open-drug="openDrug" />
      <Cc2ReportBox :case-data="caseData" />

      <!-- แถบล่าง: จบเคส -->
      <div v-if="!done" class="ccv-bar">
        <div class="ccv-bar-score" v-if="live.tot > 0 && !mustOpen">ตอนนี้ <b>{{ fmt(live.got) }}</b>/{{ fmt(live.tot) }}</div>
        <!-- โหมดนึกก่อน: ยังไม่เปิดเช็คลิสต์ = ยังจบไม่ได้ (กันบันทึก 0 คะแนนหลอก) -->
        <div v-if="mustOpen" class="ccv-bar-score">นึกขั้นตอนให้ครบ แล้วเปิดเช็คลิสต์ด้านบน</div>
        <button v-if="!(mustOpen)" type="button" class="ccv-btn" :disabled="busy" @click="finish">
          {{ caseData.rest ? 'พักเสร็จแล้ว' : live.tot > 0 ? 'จบเคส · ดูผล' : 'ทำเสร็จแล้ว' }}
        </button>
      </div>
    </template>

    <Cc2DrugSheet v-model:open="drugOpen" :drug-id="drugId" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Cc2CaseBody from '../components/cc2/Cc2CaseBody.vue'
import Cc2DrugSheet from '../components/cc2/Cc2DrugSheet.vue'
import Cc2ReportBox from '../components/cc2/Cc2ReportBox.vue'
import { loadCc2Case, loadCc2Index, nextCaseOf } from '../composables/useCc2Data.js'
import { scoreCase } from '../utils/cc2Case.js'
import { useToast } from '../composables/useToast.js'
import { useCc2Progress } from '../composables/useCc2Progress.js'

const progress = useCc2Progress()

const route = useRoute()
const router = useRouter()
// สุ่ม 1 เคส (มาจากปุ่มในคลัง ?quick=1) — ปุ่มท้ายเคสสุ่มต่อในหมวดเดียวกัน
const quick = computed(() => route.query.quick === '1')
async function randomNext() {
  const idx = await loadCc2Index().catch(() => null)
  const pool = (idx?.cases || []).filter(c => c.cat === caseData.value?.cat && c.id !== caseData.value?.id && (c.mode === 'check' || c.mode === 'blank'))
  if (pool.length) router.push(`/study/cc2/${pool[Math.floor(Math.random() * pool.length)].id}?quick=1`)
}
const { toast } = useToast()
const caseData = ref(null), error = ref(''), busy = ref(false)
const checks = ref({}), answers = ref({})
const done = ref(false), result = ref({ got: 0, tot: 0 }), nextId = ref(null)
const drugOpen = ref(false), drugId = ref('')
const keyHidden = ref(false)
const mustOpen = computed(() => keyHidden.value && !!caseData.value?.checklist?.length)
const fmt = n => (Number.isInteger(n) ? String(n) : (+n).toFixed(2).replace(/0$/, ''))

async function load() {
  const id = String(route.params.id || '')
  error.value = ''; caseData.value = null; reset()
  try {
    caseData.value = await loadCc2Case(id)
    nextId.value = caseData.value.next || await nextCaseOf(id).catch(() => null)
    document.getElementById('main-content')?.scrollTo?.(0, 0)
  } catch (e) { error.value = 'โหลดเคสไม่ได้: ' + (e?.message || e) }
}

// ── นาฬิกา: นับขึ้นจากตอนเปิดเคส · มี durationMin → นับถอยหลัง เลยเวลาแค่เตือนสี ไม่ตัดจบ ──
const startedAt = ref(Date.now()), tick = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { if (!done.value) tick.value = Date.now() }, 500) })
onUnmounted(() => clearInterval(timer))
const elapsedSec = computed(() => Math.max(0, Math.floor((tick.value - startedAt.value) / 1000)))
const limitSec = computed(() => (caseData.value?.durationMin || 0) * 60)
const overTime = computed(() => limitSec.value > 0 && elapsedSec.value >= limitSec.value)
const clock = computed(() => {
  const s = limitSec.value ? Math.abs(limitSec.value - elapsedSec.value) : elapsedSec.value
  const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0')
  return (overTime.value ? '-' : '') + `${mm}:${ss}`
})

const live = computed(() => (caseData.value ? scoreCase(caseData.value, checks.value, answers.value) : { got: 0, tot: 0 }))
const pct = computed(() => (result.value.tot ? Math.round(result.value.got / result.value.tot * 100) : 0))
const band = computed(() => (pct.value >= 80 ? 'hi' : pct.value >= 60 ? 'mid' : 'lo'))
const resultMsg = computed(() => pct.value >= 80 ? 'ทำได้ดีมาก ลองเคสถัดไปต่อเลย' : pct.value >= 60 ? 'ผ่านเกณฑ์แล้ว ดูข้อที่ยังไม่ได้ติ๊กแล้วทวนอีกรอบ' : 'ยังไม่ครบ ไล่ดูเช็คลิสต์ที่พลาดแล้วลองใหม่อีกครั้ง')

function reset() {
  checks.value = {}; answers.value = {}; done.value = false
  result.value = { got: 0, tot: 0 }; startedAt.value = Date.now(); tick.value = Date.now()
}
async function finish() {
  if (!caseData.value || busy.value) return
  const c = caseData.value
  const r = scoreCase(c, checks.value, answers.value)
  result.value = r; done.value = true
  document.getElementById('main-content')?.scrollTo?.({ top: 0, behavior: 'smooth' })
  // เคสพัก/ไม่มีเกณฑ์ (tot 0) ไม่บันทึกผล — ไม่มีอะไรให้วัด
  if (r.tot <= 0 || !progress?.finishCase) return
  busy.value = true
  try {
    const res = await progress.finishCase({ caseId: c.id, cat: c.cat, got: r.got, tot: r.tot })
    if (res && res.ok === false) toast('บันทึกผลไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
  } catch { toast('บันทึกผลไม่สำเร็จ ลองใหม่อีกครั้ง', 'error') }
  finally { busy.value = false }
}
function openDrug(id) { drugId.value = id; drugOpen.value = true }

// ⚠️ ต้องอยู่ท้ายสุด: immediate → load() → reset() ใช้ startedAt/tick — ถ้าอยู่ก่อนประกาศ = TDZ "Cannot access before initialization" (เคยพังบนเว็บจริง 11 พ.ย.)
watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.ccv { display: flex; flex-direction: column; gap: 10px; padding-bottom: 90px; }
.ccv-head { display: flex; align-items: center; justify-content: space-between; }
.ccv-back { font-weight: 700; color: var(--primary); text-decoration: none; padding: 6px 0; }
.ccv-timer { font-variant-numeric: tabular-nums; font-weight: 800; font-size: .95rem; background: #fff; border: var(--bw) solid var(--line); border-radius: 999px; padding: 3px 12px; }
.ccv-timer.over { color: #c2415f; border-color: #f0a6c4; }
.ccv-title { font-size: 1.1rem; line-height: 1.4; margin: 0; }
.ccv-id { display: inline-block; font-size: .72rem; font-weight: 800; color: var(--muted); background: var(--bg); border-radius: 6px; padding: 1px 7px; margin-right: 6px; vertical-align: middle; }
.ccv-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm); }
.ccv-hint { color: var(--muted); text-align: center; }
.ccv-err { background: #fff5f9; color: #a3345f; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ccv-err button { font: inherit; border: none; background: #fff; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-weight: 700; }

.ccv-result { border-color: var(--primary-2); background: linear-gradient(180deg, #f3fafe, #fff); }
.ccv-res-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ccv-res-score { font-size: 2rem; font-weight: 800; color: var(--primary-dark); font-variant-numeric: tabular-nums; }
.ccv-res-score small { font-size: 1rem; color: var(--muted); }
.ccv-res-pct { font-size: 1.3rem; font-weight: 800; padding: 4px 14px; border-radius: 999px; }
.ccv-res-pct.hi { background: var(--mint-light); color: #1f7a5a; }
.ccv-res-pct.mid { background: #fff3d6; color: #8a5a00; }
.ccv-res-pct.lo { background: #fff0f6; color: #a3345f; }
.ccv-res-msg { font-size: .9rem; color: var(--text); margin: 6px 0 10px; }
.ccv-res-act { display: flex; gap: 8px; }
.ccv-res-act .ccv-btn { flex: 1; text-align: center; text-decoration: none; }

.ccv-btn { font: inherit; font-weight: 800; font-size: .95rem; padding: 12px 18px; border-radius: 14px; border: none; background: var(--primary); color: #fff; cursor: pointer; box-shadow: var(--pop); }
.ccv-btn:disabled { opacity: .55; cursor: default; }
.ccv-btn.alt { background: #fff; color: var(--primary); border: 2px solid var(--primary); box-shadow: none; }

.ccv-bar { position: sticky; bottom: 6px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.96); backdrop-filter: blur(6px); border: var(--bw) solid var(--line); border-radius: 16px; padding: 8px 10px 8px 14px; box-shadow: var(--pop-lg); z-index: 5; margin-top: 4px; }
.ccv-bar-score { font-size: .85rem; color: var(--muted); }
.ccv-bar-score b { color: var(--primary-dark); font-size: 1rem; }
.ccv-bar .ccv-btn { margin-left: auto; }
</style>
