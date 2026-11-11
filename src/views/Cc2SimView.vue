<!--
  src/views/Cc2SimView.vue — ซ้อม CC2 OSPE ทีละสถานี (route ที่ต้องการ: /study/cc2/sim)
  ตั้งสัดส่วน → สุ่มชุดด้วย utils/cc2Sim.js → เล่นทีละสถานีด้วย Cc2CaseBody (role=solo, สัญญา B)
  จับเวลาสถานีละ N นาที (ค่าเริ่ม 4 — ใช้ durationMin ของเคสเองถ้ามี) หมดเวลา auto/manual ไปสถานีถัดไป
  จบเคสจริงทุกสถานี → scoreCase() + finishCase() (สัญญา C) · สถานีพัก (mode rest) ไม่คิดคะแนน ไม่เรียก finishCase
  CC2 = self-learning ล้วน (user เคาะ 11 พ.ย. 2026): ไม่มีเหรียญ/โบนัส — จบชุดแล้วโชว์คะแนนรายสถานีให้ทบทวนตัวเองเท่านั้น
  (finishSim() เป็น no-op ตามสัญญาปัจจุบัน — เรียกไว้เผื่ออนาคตเปลี่ยนนโยบาย แต่ไม่โชว์ผลลัพธ์เป็นรางวัลใดๆ)
-->
<template>
  <div class="tab-content cs-wrap">
    <!-- ── SETUP ── -->
    <template v-if="phase === 'setup'">
      <div class="page-title cs-head">
        <button class="cs-back" type="button" @click="$router.back()">‹ กลับ</button>
        <span><Emoji char="⏱️" /> ซ้อม 16 สถานี</span>
      </div>

      <div v-if="loading" class="cs-empty">กำลังโหลดคลังเคส…</div>
      <div v-else-if="loadError" class="cs-empty">โหลดคลังเคสไม่สำเร็จ · <button class="cs-retry" type="button" @click="load">ลองใหม่</button></div>

      <template v-else>
        <div class="cs-card">
          <div class="cs-card-title">สัดส่วนสถานี</div>
          <div class="cs-stepper-row" v-for="r in ratioRows" :key="r.key">
            <span class="cs-stepper-label" :class="'cat-' + r.key">{{ r.key }}</span>
            <div class="cs-stepper">
              <button type="button" @click="r.set(Math.max(0, r.get() - 1))">−</button>
              <span>{{ r.get() }}</span>
              <button type="button" @click="r.set(r.get() + 1)">+</button>
            </div>
          </div>
          <div class="cs-stepper-row">
            <span class="cs-stepper-label">พัก</span>
            <div class="cs-stepper">
              <button type="button" @click="restCount = Math.max(0, restCount - 1)">−</button>
              <span>{{ restCount }}</span>
              <button type="button" @click="restCount = restCount + 1">+</button>
            </div>
          </div>
          <div class="cs-total">รวม {{ totalStations }} สถานี</div>
        </div>

        <div class="cs-card">
          <div class="cs-card-title">เวลาต่อสถานี (นาที)</div>
          <div class="cs-stepper-row">
            <span class="cs-stepper-label">ค่าเริ่ม</span>
            <div class="cs-stepper">
              <button type="button" @click="minutesPerStation = Math.max(1, minutesPerStation - 1)">−</button>
              <span>{{ minutesPerStation }}</span>
              <button type="button" @click="minutesPerStation = minutesPerStation + 1">+</button>
            </div>
          </div>
          <small class="cs-hint">ใช้เวลานี้เฉพาะเคสที่ไม่ได้กำหนดเวลาไว้เอง</small>
          <label class="cs-check"><input v-model="autoAdvance" type="checkbox"> หมดเวลาแล้วไปสถานีถัดไปให้อัตโนมัติ</label>
        </div>

        <div class="cs-card">
          <div class="cs-card-title">กรองคลัง (ไม่เลือก = ไม่กรอง)</div>
          <div class="cs-groups">
            <button
              v-for="g in groupOptions" :key="g" type="button" class="cl-chip" :class="{ on: groupFilter.includes(g) }"
              @click="toggleGroup(g)"
            >{{ g }}</button>
          </div>
          <select v-model="sourceFilter" class="cs-select">
            <option value="">ทุกแหล่งที่มา</option>
            <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <button class="cs-start" :disabled="!totalStations" @click="startSim">
          <Emoji char="🎲" /> สุ่มชุด {{ totalStations }} สถานี แล้วเริ่ม
        </button>
      </template>
    </template>

    <!-- ── PLAYING ── -->
    <template v-else-if="phase === 'playing'">
      <div class="cs-top">
        <button class="cs-quit" type="button" @click="quit">✕</button>
        <div class="cs-topbar">
          <div class="cs-topbar-fill" :style="{ width: ((idx) / stations.length * 100) + '%' }"></div>
        </div>
        <span class="cs-topcount">{{ idx + 1 }}/{{ stations.length }}</span>
      </div>

      <div v-if="warnings.length" class="cs-warn">
        <div v-for="(w, i) in warnings" :key="i">⚠️ {{ w }}</div>
      </div>

      <div class="cs-timerbar" :class="{ low: remaining <= 30, timeup: remaining <= 0 }">
        <span class="cs-timer-cat" :class="'cat-' + currentStation.cat">{{ currentStation.cat }}</span>
        <span class="cs-timer-t">{{ fmtTime(remaining) }}</span>
        <span v-if="remaining <= 0" class="cs-timer-up">หมดเวลา!</span>
      </div>

      <!-- สถานีพัก — นับถอยหลังเฉยๆ ไม่มีเช็คลิสต์ -->
      <div v-if="currentStation.mode === 'rest'" class="cs-rest">
        <div class="cs-rest-ico"><Emoji char="☕" /></div>
        <div class="cs-rest-title">{{ currentStation.title || 'พัก' }}</div>
        <p v-if="currentCase?.scenario" class="cs-rest-text">{{ currentCase.scenario }}</p>
      </div>

      <!-- เคสจริง -->
      <div v-else>
        <div v-if="caseLoading" class="cs-empty">กำลังโหลดเคส…</div>
        <div v-else-if="!currentCase" class="cs-empty">โหลดเคสนี้ไม่สำเร็จ · <button class="cs-retry" type="button" @click="enterStation(idx)">ลองใหม่</button></div>
        <Cc2CaseBody
          v-else
          :case-data="currentCase"
          role="solo"
          :revealed="currentCase.gated || []"
          v-model:checks="checks"
          v-model:answers="answers"
          @open-drug="onOpenDrug"
        />
      </div>

      <button class="cs-next" @click="advance">
        {{ idx + 1 >= stations.length ? 'จบสถานีสุดท้าย →' : 'สถานีถัดไป →' }}
      </button>
    </template>

    <!-- ── DONE ── -->
    <template v-else>
      <div class="cs-done">
        <div class="cs-done-ico"><Emoji char="🎓" /></div>
        <div class="cs-done-title">จบชุดฝึกแล้ว!</div>
        <div class="cs-done-line">ทำไป {{ results.length }} สถานี (ไม่รวมพัก) · ได้คะแนนรวม {{ totalGot }}/{{ totalTot }}</div>
        <div class="cs-done-sub">ทบทวนคะแนนรายสถานีด้านล่าง — ไม่มีเหรียญ/รางวัล (CC2 เป็นโหมดฝึกประเมินตัวเอง)</div>

        <div class="cs-results">
          <div v-for="r in results" :key="r.id" class="cs-result-row">
            <span class="cs-result-cat" :class="'cat-' + r.cat">{{ r.cat }}</span>
            <span class="cs-result-t">{{ r.title }}</span>
            <span class="cs-result-score" :class="{ full: r.tot > 0 && r.got >= r.tot }">{{ r.tot > 0 ? `${r.got}/${r.tot}` : 'ไม่มีคะแนน' }}</span>
          </div>
        </div>

        <button class="cs-start" @click="phase = 'setup'"><Emoji char="🔁" /> ซ้อมชุดใหม่</button>
        <RouterLink to="/study/cc2" class="cs-back-lib">กลับไปคลังเคส ›</RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import Cc2CaseBody from '../components/cc2/Cc2CaseBody.vue'
import { loadCc2Index, loadCc2Case } from '../composables/useCc2Data.js'
import { useCc2Progress } from '../composables/useCc2Progress.js'
import { scoreCase } from '../utils/cc2Case.js'
import { pickCc2Set, DEFAULT_RATIO } from '../utils/cc2Sim.js'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'

const router = useRouter()
const { toast } = useToast()
const { confirm } = useConfirm()
const { finishCase, finishSim } = useCc2Progress()

// ── โหลดคลัง ──
const cases = ref([])
const loading = ref(true)
const loadError = ref(false)
async function load() {
  loading.value = true
  loadError.value = false
  try {
    const idx = await loadCc2Index()
    cases.value = idx?.cases || []
  } catch (e) {
    console.error('[Cc2SimView] โหลดคลังเคสไม่สำเร็จ', e)
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

const groupOptions = computed(() => {
  const pool = cases.value.filter((c) => c.mode !== 'rest' && c.mode !== 'free')
  return [...new Set(pool.map((c) => c.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th'))
})
const sourceOptions = computed(() => {
  const pool = cases.value.filter((c) => c.mode !== 'rest' && c.mode !== 'free')
  return [...new Set(pool.map((c) => c.source).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th'))
})
function toggleGroup(g) {
  groupFilter.value = groupFilter.value.includes(g) ? groupFilter.value.filter((x) => x !== g) : [...groupFilter.value, g]
}

// ── ตั้งค่าสัดส่วน ──
const ratioClinic = ref(DEFAULT_RATIO.Clinic)
const ratioProduct = ref(DEFAULT_RATIO.Product)
const ratioSap = ref(DEFAULT_RATIO.SAP)
const restCount = ref(0)
const minutesPerStation = ref(4)
const autoAdvance = ref(true)
const groupFilter = ref([])
const sourceFilter = ref('')
const ratioRows = [
  { key: 'Clinic', get: () => ratioClinic.value, set: (v) => (ratioClinic.value = v) },
  { key: 'Product', get: () => ratioProduct.value, set: (v) => (ratioProduct.value = v) },
  { key: 'SAP', get: () => ratioSap.value, set: (v) => (ratioSap.value = v) },
]
const totalStations = computed(() => ratioClinic.value + ratioProduct.value + ratioSap.value + restCount.value)

// ── session state ──
const phase = ref('setup') // setup | playing | done
const stations = ref([])
const warnings = ref([])
const idx = ref(0)
const currentCase = ref(null)
const caseLoading = ref(false)
const checks = ref({})
const answers = ref({})
const remaining = ref(0)
const results = ref([])
let timerId = null

const currentStation = computed(() => stations.value[idx.value] || {})
const totalGot = computed(() => results.value.reduce((a, r) => a + r.got, 0))
const totalTot = computed(() => results.value.reduce((a, r) => a + r.tot, 0))

function fmtTime(sec) {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null } }
function startTimer() {
  stopTimer()
  timerId = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stopTimer()
      if (autoAdvance.value) advance()
    }
  }, 1000)
}
onUnmounted(stopTimer)

async function startSim() {
  const ratio = { Clinic: ratioClinic.value, Product: ratioProduct.value, SAP: ratioSap.value }
  const { stations: s, warnings: w } = pickCc2Set(cases.value, {
    ratio,
    restCount: restCount.value,
    groups: groupFilter.value.length ? groupFilter.value : null,
    sources: sourceFilter.value ? [sourceFilter.value] : null,
  })
  if (!s.length) { toast('สุ่มชุดไม่ได้ ลองลดตัวกรองหรือเพิ่มสัดส่วนดู', 'error'); return }
  stations.value = s
  warnings.value = w
  idx.value = 0
  results.value = []
  phase.value = 'playing'
  await enterStation(0)
}

async function enterStation(i) {
  const st = stations.value[i]
  checks.value = {}
  answers.value = {}
  currentCase.value = null
  caseLoading.value = true
  try {
    currentCase.value = await loadCc2Case(st.id)
  } catch (e) {
    console.error('[Cc2SimView] โหลดเคสไม่สำเร็จ', st.id, e)
    currentCase.value = null
  } finally {
    caseLoading.value = false
  }
  const mins = currentCase.value?.durationMin || minutesPerStation.value
  remaining.value = Math.max(1, Math.round(mins * 60))
  startTimer()
}

async function advance() {
  stopTimer()
  const st = stations.value[idx.value]
  if (st.mode !== 'rest' && currentCase.value) {
    const { got, tot } = scoreCase(currentCase.value, checks.value, answers.value)
    results.value.push({ id: st.id, title: st.title, cat: st.cat, got, tot })
    const r = await finishCase({ caseId: st.id, got, tot })
    if (!r.ok) console.warn('[Cc2SimView] finishCase ไม่สำเร็จ', st.id)
  }
  if (idx.value + 1 >= stations.value.length) await finishSimSet()
  else { idx.value++; await enterStation(idx.value) }
}

async function finishSimSet() {
  stopTimer()
  phase.value = 'done'
  await finishSim() // no-op ตามนโยบายปัจจุบัน (เผื่ออนาคต) — ไม่โชว์ผลเป็นรางวัล
}

async function quit() {
  const ok = await confirm('ออกจากการซ้อมตอนนี้? สถานีที่ยังไม่จบจะไม่ถูกบันทึก')
  if (ok) { stopTimer(); phase.value = 'setup' }
}

// เปิดข้อมูลยาแท็บใหม่ — กันหลุดจากการจับเวลา (เดิมจะเด้งออกจากหน้าซ้อมถ้าเปลี่ยนแท็บในตัว)
// ⚠️ DrugDbView ยังไม่อ่าน query นี้เพื่อเปิดยาให้อัตโนมัติ (ดูหมายเหตุ GlobalSearchPanel.vue)
function onOpenDrug(drugId) {
  const href = router.resolve({ path: '/study/drugs', query: { drug: drugId } }).href
  window.open(href, '_blank', 'noopener')
}
</script>

<style scoped>
.cs-head { display: flex; align-items: center; gap: 10px; }
.cs-back { all: unset; cursor: pointer; font-size: 1.3rem; line-height: 1; color: var(--ink); padding: 0 4px 2px 0; }
.cs-empty { text-align: center; color: var(--muted); font-size: .84rem; padding: 30px 10px; }
.cs-retry { border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 6px 12px; font: inherit; font-size: .78rem; cursor: pointer; }

.cs-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 12px; }
.cs-card-title { font-size: .84rem; font-weight: 800; color: var(--ink); margin-bottom: 10px; }
.cs-stepper-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
.cs-stepper-label { font-size: .8rem; font-weight: 700; color: var(--muted); }
.cs-stepper-label.cat-Clinic { color: var(--primary-dark); }
.cs-stepper-label.cat-Product { color: #1f7a5c; }
.cs-stepper-label.cat-SAP { color: #b8326a; }
.cs-stepper { display: flex; align-items: center; gap: 10px; }
.cs-stepper button { width: 30px; height: 30px; border-radius: 9px; border: var(--bw) solid var(--line); background: var(--bg); font-size: 1rem; font-weight: 800; cursor: pointer; color: var(--ink); }
.cs-stepper span { min-width: 22px; text-align: center; font-weight: 800; font-variant-numeric: tabular-nums; }
.cs-total { margin-top: 8px; font-size: .76rem; color: var(--muted); font-weight: 700; }
.cs-hint { display: block; font-size: .7rem; color: var(--muted); margin-top: 2px; }
.cs-check { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: .76rem; color: var(--ink); }
.cs-groups { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.cl-chip { border: 1px solid rgba(0,0,0,.12); background: #fff; border-radius: 999px; padding: 4px 11px; font: inherit; font-size: .72rem; color: var(--muted); cursor: pointer; }
.cl-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; }
.cs-select { width: 100%; box-sizing: border-box; padding: 9px 10px; border: var(--bw) solid var(--line); border-radius: 10px; font: inherit; font-size: .8rem; background: #fff; }

.cs-start { width: 100%; border: var(--bw) solid var(--line); border-radius: 14px; padding: 15px; font-family: inherit; font-size: .92rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
.cs-start:disabled { background: #cbd5e1; cursor: default; }
.cs-start:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }

.cs-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.cs-quit { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; flex-shrink: 0; font-size: .85rem; }
.cs-topbar { flex: 1; height: 7px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.cs-topbar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-2)); transition: width .3s; }
.cs-topcount { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.5); flex-shrink: 0; }

.cs-warn { background: #fff7ed; border: 1px solid #fbbf24; border-radius: 10px; padding: 8px 10px; font-size: .7rem; color: #92400e; margin-bottom: 10px; line-height: 1.5; }

.cs-timerbar { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; background: var(--primary-light); margin-bottom: 10px; }
.cs-timer-cat { font-size: .7rem; font-weight: 800; padding: 2px 7px; border-radius: 8px; color: #fff; }
.cs-timer-cat.cat-Clinic { background: var(--primary); }
.cs-timer-cat.cat-Product { background: var(--mint); }
.cs-timer-cat.cat-SAP { background: var(--accent); }
.cs-timer-t { font-size: 1rem; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--primary-dark); }
.cs-timerbar.low .cs-timer-t { color: #dc2626; }
.cs-timer-up { margin-left: auto; font-size: .76rem; font-weight: 800; color: #dc2626; }

.cs-rest { text-align: center; padding: 36px 14px; background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; }
.cs-rest-ico { font-size: 2.2rem; margin-bottom: 8px; }
.cs-rest-title { font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
.cs-rest-text { font-size: .8rem; color: var(--muted); line-height: 1.5; white-space: pre-line; }

.cs-next { width: 100%; margin-top: 12px; border: var(--bw) solid var(--line); border-radius: 14px; padding: 14px; font-family: inherit; font-size: .88rem; font-weight: 800; color: #fff; background: var(--mint); box-shadow: var(--pop); cursor: pointer; }
.cs-next:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }

.cs-done { text-align: center; padding: 20px 0; }
.cs-done-ico { font-size: 3rem; }
.cs-done-title { font-size: 1.25rem; font-weight: 800; margin: 8px 0; }
.cs-done-line { font-size: .84rem; color: rgba(0,0,0,.6); margin-bottom: 6px; }
.cs-done-sub { font-size: .74rem; color: var(--muted); margin-bottom: 16px; }
.cs-results { display: flex; flex-direction: column; gap: 6px; text-align: left; margin: 14px 0; }
.cs-result-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: var(--bw) solid var(--line); border-radius: 10px; background: #fff; }
.cs-result-cat { flex-shrink: 0; font-size: .7rem; font-weight: 800; padding: 2px 6px; border-radius: 7px; color: #fff; }
.cs-result-cat.cat-Clinic { background: var(--primary); }
.cs-result-cat.cat-Product { background: var(--mint); }
.cs-result-cat.cat-SAP { background: var(--accent); }
.cs-result-t { flex: 1; min-width: 0; font-size: .76rem; text-align: left; }
.cs-result-score { flex-shrink: 0; font-size: .74rem; font-weight: 800; color: var(--primary-dark); }
.cs-result-score.full { color: #1f7a5c; }
.cs-back-lib { display: block; margin-top: 10px; font-size: .78rem; color: var(--primary); text-decoration: underline; }
</style>
