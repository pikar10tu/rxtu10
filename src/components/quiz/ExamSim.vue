<!--
  📋 จำลองสอบจริง (28 พ.ย. 2026) — หน้าจอเลียนแอป ExamPod ที่ใช้สอบ PLE-CC1
  แถบบน: ตารางทุกข้อ · ‹ ข้อ/ทั้งหมด › · เวลา · ส่ง · พื้นขาวล้วนเฉพาะหน้านี้ (ไม่ใช้ธีมพาสเทล)
  ไม่เฉลยระหว่างทำ · คำตอบเก็บในเครื่อง (utils/examSim) → รีเฟรช/ปิดแท็บแล้วกลับมาทำต่อได้ · ออก/ส่ง = ล้าง
  เวลาอิง deadline จริง (นาฬิกาเดินต่อแม้ปิดแอป) · หมดเวลา = ส่งเอง
  Teleport ไป body (กฎข้อ 6) · z 450: เหนือ sheet 400 ต่ำกว่า toast 500 / confirm 900
-->
<template>
  <Teleport to="body">
    <div class="xs" role="dialog" aria-label="จำลองสอบจริง">
      <header class="xs-bar">
        <div class="xs-l">
          <button class="xs-ic" aria-label="ดูทุกข้อ" @click="panel = 'dash'">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          </button>
          <button class="xs-ic" aria-label="ออกจากการสอบ" @click="panel = 'exit'">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div class="xs-pager">
          <button :disabled="st.i === 0" aria-label="ข้อก่อนหน้า" @click="go(st.i - 1)">‹</button>
          <span>{{ st.i + 1 }} / {{ qs.length }}</span>
          <button :disabled="st.i === qs.length - 1" aria-label="ข้อถัดไป" @click="go(st.i + 1)">›</button>
        </div>
        <div class="xs-r">
          <span class="xs-time" :class="{ low: left <= 300 }" :aria-label="`เหลือเวลา ${timeText}`">{{ timeText }}</span>
          <button class="xs-submit" @click="panel = 'submit'">ส่ง<span class="xs-wide">คำตอบ</span></button>
        </div>
      </header>

      <main ref="scroller" class="xs-main">
        <article class="xs-card">
          <div class="xs-qhead">
            <button class="xs-star" :class="{ on: st.star[st.i] }" :aria-pressed="st.star[st.i]" aria-label="มาร์คข้อนี้" @click="toggleStar">
              <svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z" /></svg>
            </button>
            <span class="xs-qno">QUESTION {{ st.i + 1 }}</span>
            <span class="xs-saved" :class="{ show: savedFlash }">✓ Saved</span>
          </div>
          <div class="xs-qtext">{{ q.question }}</div>
          <QuestionImages :question="q" />
          <ul class="xs-choices">
            <li v-for="(c, j) in q.choices" :key="j">
              <button class="xs-choice" :class="{ sel: st.ans[st.i] === j }" :aria-pressed="st.ans[st.i] === j" @click="answer(j)">
                <span class="xs-radio" /><span><span class="xs-lt">{{ LETTERS[j] }}.</span> {{ c }}</span>
              </button>
            </li>
          </ul>
        </article>
        <div class="xs-foot">
          <button class="xs-ghost" :disabled="st.i === 0" @click="go(st.i - 1)">‹ ข้อก่อนหน้า</button>
          <button v-if="st.i < qs.length - 1" class="xs-ghost" @click="go(st.i + 1)">ข้อถัดไป ›</button>
          <button v-else class="xs-ghost xs-ghost-main" @click="panel = 'submit'">ส่งคำตอบ</button>
        </div>
      </main>

      <div v-if="panel" class="xs-ov" @click.self="panel = null">
        <div class="xs-panel">
          <template v-if="panel === 'dash'">
            <div class="xs-phead">ทุกข้อ<button aria-label="ปิด" @click="panel = null">×</button></div>
            <div class="xs-grid">
              <button v-for="(_, k) in qs" :key="k" class="xs-cell" :class="{ done: st.ans[k] !== null, cur: k === st.i }" :aria-label="`ข้อ ${k + 1}`" @click="panel = null; go(k)">
                {{ k + 1 }}<span v-if="st.star[k]" class="xs-cstar">★</span>
              </button>
            </div>
            <div class="xs-legend"><span><i />ตอบแล้ว</span><span><i class="no" />ยังไม่ตอบ</span><span><b>★</b> มาร์คไว้</span></div>
            <div class="xs-pfoot">{{ qs.length }} total | {{ doneN }} completed | {{ starN }} starred</div>
          </template>
          <template v-else-if="panel === 'submit'">
            <div class="xs-phead">ส่งคำตอบ<button aria-label="ปิด" @click="panel = null">×</button></div>
            <div class="xs-pbody">
              <div>ตอบแล้ว {{ doneN }} จาก {{ qs.length }} ข้อ</div>
              <div v-if="missList.length" class="xs-warn">ยังไม่ได้ตอบ {{ missList.length }} ข้อ: {{ listText(missList) }}</div>
              <div v-if="starList.length">มาร์คไว้ {{ starList.length }} ข้อ: {{ listText(starList) }}</div>
              <div class="xs-mute">ส่งแล้วแก้คำตอบไม่ได้ ข้อที่ไม่ได้ตอบนับเป็นผิด</div>
              <div class="xs-row"><button class="xs-ghost" @click="panel = null">กลับไปทำต่อ</button><button class="xs-submit" @click="submit">ส่งคำตอบ</button></div>
            </div>
          </template>
          <template v-else-if="panel === 'exit'">
            <div class="xs-phead">ออกจากการสอบ<button aria-label="ปิด" @click="panel = null">×</button></div>
            <div class="xs-pbody">
              <div><b>พักไว้ทำต่อ</b> เก็บคำตอบไว้ในเครื่องนี้และหยุดเวลา กลับมากด "ทำต่อ" ได้จากหน้าจำลองสอบ</div>
              <div><b>ทิ้งชุดนี้</b> ล้างคำตอบ ไม่บันทึกผล</div>
              <div class="xs-row"><button class="xs-ghost" @click="panel = null">ยกเลิก</button><button class="xs-danger" @click="exit">ทิ้งชุดนี้</button><button class="xs-submit" @click="pause">พักไว้ทำต่อ</button></div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import QuestionImages from '../shared/QuestionImages.vue'
import { saveExamState, clearExamState } from '../../utils/examSim.js'

const props = defineProps({
  // { qs, ans, star, i, deadline } — สร้างจาก QuizView (เริ่มใหม่หรือกลับมาทำต่อ)
  session: { type: Object, required: true },
  uid: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'exit', 'pause'])

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const qs = props.session.qs
const st = reactive({ ans: [...props.session.ans], star: [...props.session.star], i: props.session.i || 0 })
const q = computed(() => qs[st.i])
const panel = ref(null)
const scroller = ref(null)
const storage = typeof window !== 'undefined' ? window.localStorage : null

const persist = () => saveExamState(storage, props.uid, { qs, ans: st.ans, star: st.star, i: st.i, deadline: props.session.deadline, n: qs.length })
watch(() => [st.i, st.ans.slice(), st.star.slice()], () => { if (!done) persist() }, { deep: true })

function go(k) {
  if (k < 0 || k >= qs.length) return
  st.i = k
  nextTick(() => scroller.value?.scrollTo?.({ top: 0 }))
}
const savedFlash = ref(false)
let flashT = 0
function answer(j) {
  st.ans[st.i] = j
  savedFlash.value = true; clearTimeout(flashT); flashT = setTimeout(() => { savedFlash.value = false }, 1200)
}
function toggleStar() { st.star[st.i] = !st.star[st.i] }

// รายการยาว (ชุด 120) โชว์ 30 ตัวแรก ที่เหลือดูในตารางทุกข้อ
const listText = (a) => a.length > 30 ? `${a.slice(0, 30).join(', ')} … (ดูทั้งหมดในตารางทุกข้อ)` : a.join(', ')
const doneN = computed(() => st.ans.filter(a => a !== null).length)
const starN = computed(() => st.star.filter(Boolean).length)
const missList = computed(() => st.ans.map((a, k) => (a === null ? k + 1 : null)).filter(Boolean))
const starList = computed(() => st.star.map((s, k) => (s ? k + 1 : null)).filter(Boolean))

// ⏱️ เวลาจาก deadline จริง — ปิดแอปไปแล้วกลับมา เวลาก็เดินไปแล้ว
const now = ref(Date.now())
const left = computed(() => Math.max(0, Math.round((props.session.deadline - now.value) / 1000)))
const timeText = computed(() => {
  const s = left.value, h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60
  const p = (x) => String(x).padStart(2, '0')
  return h ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`
})
let done = false
function submit() {
  if (done) return
  done = true
  clearExamState(storage, props.uid)
  emit('submit', { ans: [...st.ans], star: [...st.star] })
}
// ⏸️ พัก: เก็บเวลาที่เหลือ (ไม่ใช่ deadline) → กลับมาเวลาเริ่มนับต่อจากเดิม · ไม่ต้องดึงข้อใหม่ = ไม่เสีย read
function pause() {
  done = true
  saveExamState(storage, props.uid, { qs, ans: st.ans, star: st.star, i: st.i, deadline: props.session.deadline, n: qs.length, paused: true, remainMs: Math.max(0, props.session.deadline - Date.now()) })
  emit('pause')
}
function exit() {
  done = true
  clearExamState(storage, props.uid)
  emit('exit')
}
let tick = 0
onMounted(() => {
  persist()
  tick = setInterval(() => { now.value = Date.now(); if (left.value <= 0) submit() }, 1000)
  document.documentElement.classList.add('xs-lock')
})
onBeforeUnmount(() => { clearInterval(tick); clearTimeout(flashT); document.documentElement.classList.remove('xs-lock') })

function onKey(e) {
  if (e.key === 'Escape') { panel.value = null; return }
  if (panel.value || e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return
  if (e.key === 'ArrowRight') go(st.i + 1)
  if (e.key === 'ArrowLeft') go(st.i - 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
defineExpose({ submit })
</script>

<style scoped>
/* จอสอบสีขาวล้วน — ค่าสีตายตัวเพราะเลียนจอสอบจริง ไม่ผูกธีมเว็บ */
.xs { position: fixed; inset: 0; z-index: 450; display: flex; flex-direction: column; background: #f6f7f9; color: #1f2430;
  font-family: 'Sarabun', 'Noto Sans Thai', var(--font-body, system-ui), sans-serif; font-size: 16px; line-height: 1.65; }
.xs button { font: inherit; color: inherit; cursor: pointer; }
.xs button:focus-visible { outline: 2px solid #3b4fd8; outline-offset: 2px; }
.xs-bar { flex: none; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; background: #fff; border-bottom: 1px solid #e5e7eb;
  padding: calc(8px + env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px)) 8px max(12px, env(safe-area-inset-left, 0px)); }
.xs-l { display: flex; gap: 6px; }
.xs-r { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
.xs-ic { width: 38px; height: 38px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; display: grid; place-items: center; padding: 0; }
.xs-ic svg { width: 18px; height: 18px; stroke: #1f2430; fill: none; stroke-width: 1.8; stroke-linecap: round; }
.xs-pager { display: flex; align-items: center; border: 1px solid #e5e7eb; border-radius: 999px; overflow: hidden; background: #fff; }
.xs-pager button { border: 0; background: none; width: 38px; height: 34px; font-size: 1.15rem; color: #6b7280; }
.xs-pager button:disabled { opacity: .3; cursor: default; }
.xs-pager span { min-width: 64px; text-align: center; font-variant-numeric: tabular-nums; font-size: .9rem; }
.xs-time { font-variant-numeric: tabular-nums; font-size: .9rem; color: #6b7280; white-space: nowrap; }
.xs-time.low { color: #dc2626; font-weight: 700; }
.xs-submit { border: 0; background: #3b4fd8; color: #fff !important; border-radius: 8px; padding: 7px 14px; font-weight: 600; font-size: .9rem; white-space: nowrap; }
.xs-main { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  padding: 20px max(16px, env(safe-area-inset-right, 0px)) calc(40px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
.xs-card { max-width: 780px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 22px 20px; }
.xs-qhead { display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.xs-star { border: 0; background: none; padding: 2px; display: grid; place-items: center; }
.xs-star svg { width: 22px; height: 22px; stroke: #6b7280; fill: none; stroke-width: 1.6; }
.xs-star.on svg { stroke: #f5a524; fill: #f5a524; }
.xs-qno { font-size: .78rem; letter-spacing: .12em; color: #6b7280; font-weight: 600; }
.xs-saved { margin-left: auto; font-size: .8rem; color: #16a34a; opacity: 0; transition: opacity .2s; }
.xs-saved.show { opacity: 1; }
.xs-qtext { white-space: pre-line; margin: 16px 0 14px; font-size: 1.02rem; overflow-wrap: anywhere; }
.xs-choices { list-style: none; margin: 8px 0 0; padding: 0; }
.xs-choices li + li { border-top: 1px solid #e5e7eb; }
.xs-choice { width: 100%; display: flex; gap: 12px; align-items: flex-start; text-align: left; background: none; border: 0; padding: 12px 6px; border-radius: 6px; overflow-wrap: anywhere; }
.xs-choice:hover { background: #f9fafb; }
.xs-radio { flex: none; width: 20px; height: 20px; margin-top: 3px; border: 1.5px solid #c4c8d0; border-radius: 50%; display: grid; place-items: center; }
.xs-choice.sel .xs-radio { border-color: #3b4fd8; }
.xs-choice.sel .xs-radio::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: #3b4fd8; }
.xs-lt { color: #6b7280; }
.xs-foot { max-width: 780px; margin: 14px auto 0; display: flex; justify-content: space-between; gap: 8px; }
.xs-ghost { border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; padding: 9px 16px; }
.xs-ghost:disabled { opacity: .4; cursor: default; }
.xs-ghost-main { border-color: #3b4fd8; color: #3b4fd8 !important; font-weight: 600; }
.xs-danger { border: 0; background: #dc2626; color: #fff !important; border-radius: 8px; padding: 9px 14px; font-weight: 600; }
.xs-ov { position: fixed; inset: 0; z-index: 2; background: rgba(15,18,30,.35); display: grid; place-items: center; padding: 16px; }
.xs-panel { width: min(460px, 100%); max-height: calc(100% - 32px); overflow: auto; background: #fff; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,.18); }
.xs-phead { position: sticky; top: 0; background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
.xs-phead button { border: 0; background: none; font-size: 1.3rem; color: #6b7280; line-height: 1; }
.xs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 8px; padding: 18px; }
.xs-cell { position: relative; height: 42px; border-radius: 6px; border: 1px solid transparent; background: none; font-variant-numeric: tabular-nums; color: #6b7280 !important; }
.xs-cell.done { border-color: #c9cdd6; color: #1f2430 !important; font-weight: 600; }
.xs-cell.cur { outline: 2px solid #3b4fd8; outline-offset: 1px; }
.xs-cstar { position: absolute; top: -8px; right: -5px; color: #f5a524; font-size: .9rem; }
.xs-legend { display: flex; gap: 14px; flex-wrap: wrap; padding: 0 18px 12px; font-size: .78rem; color: #6b7280; }
.xs-legend i { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: -2px; margin-right: 4px; border: 1px solid #c9cdd6; }
.xs-legend i.no { border-color: transparent; background: #f3f4f6; }
.xs-legend b { color: #f5a524; }
.xs-pfoot { border-top: 1px solid #e5e7eb; padding: 12px 18px; text-align: center; font-size: .85rem; color: #6b7280; font-variant-numeric: tabular-nums; }
.xs-pbody { padding: 18px; display: grid; gap: 12px; }
.xs-warn { color: #dc2626; }
.xs-mute { color: #6b7280; font-size: .88rem; }
.xs-row { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.xs-wide { display: none; }
@media (min-width: 700px) {
  .xs { font-size: 17px; }
  .xs-wide { display: inline; }
  .xs-choice { padding: 14px 8px; }
  .xs-card { padding: 22px 28px 24px; }
}
@media (max-width: 560px) {
  .xs-bar { grid-template-columns: auto 1fr auto; gap: 6px; }
  .xs-pager { justify-self: center; }
  .xs-pager span { min-width: 52px; font-size: .82rem; }
  .xs-pager button { width: 32px; }
  .xs-ic { width: 34px; height: 34px; }
  .xs-time { font-size: .8rem; }
  .xs-submit { padding: 7px 10px; }
  .xs-card { padding: 14px 14px 16px; }
  .xs-main { padding-top: 12px; }
}
@media (max-width: 420px) {
  .xs-main { padding-left: 8px; padding-right: 8px; }
  .xs-card { border-radius: 8px; padding: 12px 12px 14px; }
  .xs-foot { padding: 0 4px; }
}
</style>
<style>
/* ล็อกพื้นหลังไม่ให้เลื่อนตามตอนจอสอบเปิด */
html.xs-lock, html.xs-lock body { overflow: hidden; }
</style>
