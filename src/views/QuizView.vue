<template>
  <div class="tab-content">
    <div class="qv-head">
      <button class="qv-back" aria-label="ย้อนกลับ" @click="$router.back()">‹</button>
      <span class="qv-head-title"><Emoji char="📝" /> ทำข้อสอบ</span>
      <HelpButton topic="quiz" style="margin-left:auto" />
    </div>

    <div v-if="!authStore.isLoggedIn" class="qv-empty">เข้าสู่ระบบเพื่อทำข้อสอบ</div>

    <!-- ── HOME ── -->
    <template v-else-if="mode === 'home'">
      <div v-if="loading" class="qv-empty">กำลังโหลดข้อสอบ…</div>
      <div v-else-if="!publishedTotal" class="qv-empty">ยังไม่มีข้อสอบที่เผยแพร่ — รอทีมวิชาการเพิ่มก่อนนะ <Emoji char="📚" /></div>
      <template v-else>
        <div class="qv-info">มีข้อสอบให้ทำ <b>{{ publishedTotal }}</b> ข้อ</div>

        <template v-if="domainChips.length">
          <div class="qv-label">หมวด</div>
          <div class="qv-chips">
            <button class="qv-chip" :class="{ on: dom === '__all' }" @click="dom = '__all'">ทั้งหมด</button>
            <button v-for="d in domainChips" :key="d.key" class="qv-chip" :class="{ on: dom === d.key }" @click="dom = d.key">{{ d.label }}</button>
          </div>
        </template>

        <div class="qv-label">จำนวนข้อ</div>
        <div class="qv-chips">
          <button v-for="n in lenChoices" :key="n" class="qv-chip" :class="{ on: len === n }" @click="len = n">
            {{ n }} ข้อ
          </button>
        </div>

        <button class="qv-start" :disabled="!publishedTotal || starting" @click="start">
          {{ starting ? 'กำลังสุ่มข้อ…' : `เริ่มทำข้อสอบ (${quizCount} ข้อ)` }}
        </button>
        <button class="qv-history-btn" @click="openHistory"><Emoji char="📊" /> ประวัติของฉัน</button>
        <div class="qv-hint">ทำข้อสอบได้เหรียญ +10/ข้อที่ถูก (สูงสุด {{ DAILY_CAP }}<Emoji char="🪙" />/วัน)</div>
      </template>
    </template>

    <!-- ── QUIZ ── -->
    <template v-else-if="mode === 'quiz'">
      <div class="qv-bar-row">
        <button class="qv-quit" aria-label="ออกจากการทำข้อสอบ" @click="quit">✕</button>
        <div class="qv-bar"><div class="qv-fill" :style="{ width: progress + '%' }"></div></div>
        <span class="qv-count">{{ idx + 1 }}/{{ quiz.length }}</span>
      </div>
      <div class="qv-running">คะแนน {{ correct }}/{{ answered }}</div>

      <div class="qv-q">{{ current.question }}</div>
      <div class="qv-choices">
        <button
          v-for="(c, i) in current.choices" :key="i"
          class="qv-choice" :class="choiceClass(i)"
          :disabled="picked !== null" @click="pick(i)"
        >
          <span class="qv-letter">{{ LETTERS[i] }}</span><span class="qv-ctext">{{ c }}</span>
        </button>
      </div>

      <div v-if="picked !== null" class="qv-feedback">
        <div :class="picked === current.answer ? 'qv-fb ok' : 'qv-fb no'">
          {{ picked === current.answer ? '✓ ถูกต้อง!' : `✗ ยังไม่ถูก — เฉลยคือข้อ ${LETTERS[current.answer]}` }}
        </div>
        <div v-if="current.explanation" class="qv-exp"><Emoji char="💡" /> {{ current.explanation }}</div>
        <button class="qv-next" @click="next">{{ idx + 1 < quiz.length ? 'ข้อถัดไป →' : 'ดูผลคะแนน' }}</button>

        <!-- 🚩 แจ้งข้อผิด -->
        <div class="qv-report">
          <button v-if="reportedIds.has(current.id)" class="qv-report-btn done" disabled><Emoji char="🚩" /> แจ้งแล้ว ✓</button>
          <button v-else-if="!reportOpen" class="qv-report-btn" @click="reportOpen = true"><Emoji char="🚩" /> แจ้งข้อผิด</button>
          <div v-else class="qv-report-panel">
            <div class="qv-report-chips">
              <button
                v-for="r in REPORT_REASONS" :key="r"
                class="qv-report-chip" :class="{ on: reportReason === r }"
                :aria-pressed="reportReason === r"
                @click="reportReason = r"
              >{{ r }}</button>
            </div>
            <textarea v-model="reportNote" :maxlength="LIMITS.report" class="qv-report-note" rows="2" aria-label="รายละเอียดเพิ่มเติมเกี่ยวกับข้อผิด" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)…"></textarea>
            <div class="qv-report-actions">
              <button class="qv-report-cancel" @click="resetReport">ยกเลิก</button>
              <button class="qv-report-send" :disabled="!reportReason || reportSending" @click="sendReport">{{ reportSending ? 'กำลังส่ง…' : 'ส่ง' }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── RESULT ── -->
    <template v-else-if="mode === 'result'">
      <div class="qv-result">
        <div class="qv-result-emoji">{{ resultEmoji }}</div>
        <div class="qv-result-title">ทำข้อสอบจบแล้ว!</div>
        <div class="qv-result-score">{{ correct }}<span>/{{ quiz.length }}</span></div>
        <div class="qv-result-pct">{{ pct }}%</div>
        <div v-if="coinsEarned" class="qv-result-coins">+{{ coinsEarned.toLocaleString() }} <Emoji char="🪙" /></div>
        <div v-else class="qv-result-nocoins">วันนี้รับเหรียญครบเพดานแล้ว</div>
        <button class="qv-start" @click="mode = 'home'">ทำชุดใหม่</button>
      </div>
    </template>

    <!-- ── HISTORY ── -->
    <template v-else-if="mode === 'history'">
      <div class="qv-head">
        <button class="qv-back" aria-label="ย้อนกลับ" @click="mode = 'home'">‹</button>
        <span class="qv-head-title"><Emoji char="📊" /> ประวัติของฉัน</span>
      </div>

      <div v-if="historyLoading" class="qv-empty">กำลังโหลด…</div>
      <div v-else-if="!stats.count" class="qv-empty">ยังไม่เคยทำข้อสอบ — ลองทำชุดแรกดูสิ! <Emoji char="📚" /></div>
      <template v-else>
        <div class="qv-hist-latest">
          ล่าสุด <b>{{ stats.latest.correct }}/{{ stats.latest.total }}</b> ({{ stats.latest.pct }}%)
        </div>

        <div class="qv-label">พัฒนาการ ({{ stats.count }} ครั้งล่าสุด)</div>
        <div class="qv-trend">
          <div v-for="(p, i) in stats.trend" :key="i" class="qv-trend-bar" :style="{ height: Math.max(4, p) + '%' }" :title="p + '%'"></div>
        </div>

        <div class="qv-label">สถิติรายหมวด</div>
        <div class="qv-dom-stats">
          <div v-for="d in DOMAINS" :key="d.key" class="qv-dom-row">
            <span class="qv-dom-name">{{ d.label }}</span>
            <span class="qv-dom-bar"><span class="qv-dom-fill" :style="{ width: stats.byDomain[d.key].pct + '%' }"></span></span>
            <span class="qv-dom-val">{{ stats.byDomain[d.key].c }}/{{ stats.byDomain[d.key].t }}</span>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { collection, getDocs, getDoc, query, where, orderBy, startAt, limit, doc, addDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { quizSample } from '../utils/quizSample.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { reportDocId, buildSnapshot } from '../utils/questionReport.js'
import { DOMAINS, DOMAIN_KEYS, domainLabel } from '../data/domains.js'
import { aggregateExamStats } from '../utils/examStats.js'

const authStore = useAuthStore()
const usage = useUsageStore()
const { toast } = useToast()
const route = useRoute()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const DAILY_CAP = 300
const COIN_PER_CORRECT = 10
const LEN_CHOICES = [5, 10, 15, 20]
const DEFAULT_LEN = 5

// ── home: อ่านแค่ config/questionsMeta (1 read) แทนการโหลดข้อทั้งคลัง ──
const publishedTotal = ref(0)
const metaDomains = ref({})
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const snap = await getDoc(doc(db, 'config', 'questionsMeta'))
    usage.track(1)
    const m = snap.exists() ? snap.data() : { publishedTotal: 0, categories: [], domains: {} }
    publishedTotal.value = m.publishedTotal || 0
    metaDomains.value = m.domains || {}
  } catch (e) {
    console.error('[quiz meta]', e)
    toast('โหลดข้อมูลข้อสอบไม่สำเร็จ', 'error')
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  if (!authStore.isLoggedIn) return
  load()
  if (route.query.view === 'history') openHistory()
})

const dom = ref('__all')
// chips เฉพาะ domain ที่มีข้ออย่างน้อย 1 ข้อ
const domainChips = computed(() => DOMAINS.filter(d => (metaDomains.value[d.key] || 0) > 0))

const len = ref(DEFAULT_LEN)
const lenChoices = computed(() => LEN_CHOICES)
const quizCount = computed(() => len.value) // ขอ N; ได้จริงอาจน้อยกว่าถ้าคลัง/หมวดมีไม่พอ

// ── session state ──
const mode = ref('home')          // home | quiz | result | history
const quiz = ref([])
const idx = ref(0)
const picked = ref(null)
const correct = ref(0)
const answered = ref(0)
const coinsEarned = ref(0)
const answers = ref([])

// ── ประวัติของฉัน (Phase 1 — private, ไม่มี leaderboard) ──
const history = ref([])
const historyLoading = ref(false)
const stats = computed(() => aggregateExamStats(history.value))

async function loadHistory() {
  if (!authStore.currentUser) return
  historyLoading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'examSessions'),
      where('userId', '==', authStore.currentUser.uid),
      orderBy('ts', 'desc'), limit(30),
    ))
    usage.track(snap.size)
    history.value = snap.docs.map(d => d.data())
  } catch (e) {
    console.error('[exam history]', e); toast('โหลดประวัติไม่สำเร็จ', 'error')
  } finally { historyLoading.value = false }
}
function openHistory() { mode.value = 'history'; loadHistory() }

// ── แจ้งข้อสอบผิด (Phase 5) ──
const REPORT_REASONS = ['เฉลยผิด', 'โจทย์/ตัวเลือกพิมพ์ผิด', 'โจทย์ไม่ชัด', 'ข้อมูลล้าสมัย', 'อื่นๆ']
const reportOpen = ref(false)
const reportReason = ref('')
const reportNote = ref('')
const reportSending = ref(false)
const reportedIds = ref(new Set())   // กันสแปมในเซสชันเดียว (ข้ามเซสชัน deterministic id ทับเอง)

function resetReport() { reportOpen.value = false; reportReason.value = ''; reportNote.value = '' }

async function sendReport() {
  const q = current.value
  if (reportSending.value || !reportReason.value || !q || !authStore.currentUser) return
  reportSending.value = true
  try {
    usage.track(0, 1)
    await setDoc(doc(db, 'questionReports', reportDocId(q.id, authStore.currentUser.uid)), {
      questionId: q.id,
      reason: reportReason.value,
      note: cleanText(reportNote.value, LIMITS.report),
      reportedBy: authStore.currentUser.uid,
      reportedByName: authStore.userData?.nickname || authStore.userData?.name || null,
      status: 'open',
      verdict: null,
      rewardAmount: 0,
      rewardDelivered: false,
      questionSnapshot: buildSnapshot(q),
      createdAt: serverTimestamp(),
      resolvedAt: null,
    }, { merge: true })
    reportedIds.value.add(q.id)
    resetReport()
    toast('ขอบคุณที่ช่วยแจ้ง! ทีมวิชาการจะตรวจสอบให้', 'success')
  } catch (e) {
    console.error('[question report]', e); toast('ส่งรายงานไม่สำเร็จ', 'error')
  } finally { reportSending.value = false }
}

const current = computed(() => quiz.value[idx.value] || null)
const progress = computed(() => quiz.value.length ? Math.round((idx.value / quiz.value.length) * 100) : 0)
const pct = computed(() => quiz.value.length ? Math.round((correct.value / quiz.value.length) * 100) : 0)
const resultEmoji = computed(() => pct.value >= 80 ? '🏆' : pct.value >= 50 ? '😊' : '📚')

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// สลับตำแหน่งตัวเลือกในแต่ละข้อ + remap index เฉลยให้ตรงตำแหน่งใหม่
// (กันคนจำว่า "เฉลยคือข้อ ก" จากการทำซ้ำ — ให้จำเนื้อหาแทน)
function shuffleChoices(q) {
  const order = shuffle(q.choices.map((_, i) => i))
  return {
    ...q,
    choices: order.map(i => q.choices[i]),
    answer: order.indexOf(q.answer),
  }
}

const starting = ref(false)
async function start() {
  if (starting.value) return
  starting.value = true
  try {
    const R = Math.random()
    const base = [where('isPublished', '==', true)]
    if (dom.value !== '__all') base.push(where('domain', '==', dom.value))
    const col = collection(db, 'questions')
    const firstSnap = await getDocs(query(col, ...base, orderBy('rand'), startAt(R), limit(len.value)))
    usage.track(firstSnap.size)
    const first = firstSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    let wrap = []
    if (first.length < len.value) {
      const wrapSnap = await getDocs(query(col, ...base, orderBy('rand'), limit(len.value)))
      usage.track(wrapSnap.size)
      wrap = wrapSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    const picks = quizSample(first, wrap, len.value)
      .filter(q => Array.isArray(q.choices) && q.choices.length >= 2)
    quiz.value = shuffle(picks).map(shuffleChoices)
    idx.value = 0; resetRound()
    if (quiz.value.length) mode.value = 'quiz'
    else toast('ยังไม่มีข้อสอบในหมวดนี้', 'error')
  } catch (e) {
    console.error('[quiz start]', e); toast('เริ่มข้อสอบไม่สำเร็จ', 'error')
  } finally { starting.value = false }
}
// รีเซ็ต state รอบใหม่
function resetRound() {
  picked.value = null; correct.value = 0; answered.value = 0; coinsEarned.value = 0
  answers.value = []
}

function pick(i) {
  if (picked.value !== null) return
  picked.value = i
  answered.value++
  const isCorrect = i === current.value.answer
  if (isCorrect) correct.value++
  answers.value.push({ domain: current.value.domain || null, correct: isCorrect })
}
function choiceClass(i) {
  if (picked.value === null) return ''
  if (i === current.value.answer) return 'correct'
  if (i === picked.value) return 'wrong'
  return 'dim'
}
function next() {
  resetReport()
  if (idx.value + 1 < quiz.value.length) { idx.value++; picked.value = null }
  else finish()
}
function quit() {
  if (answered.value > 0) finish()
  else mode.value = 'home'
}

async function finish() {
  mode.value = 'result'

  // daily-capped coin reward (trust-based, anti-runaway-farm)
  const today = new Date().toISOString().slice(0, 10)
  const earnedToday = authStore.userData?.quizCoinDate === today ? (authStore.userData?.quizCoinsToday || 0) : 0
  const reward = correct.value * COIN_PER_CORRECT
  const grant = Math.max(0, Math.min(reward, DAILY_CAP - earnedToday))
  coinsEarned.value = grant

  if (!authStore.currentUser) return

  // 1) record the attempt (examSessions — owner-only)
  try {
    usage.track(0, 1)
    // สรุปถูก/ทั้งหมดต่อ domain จาก answers (วนจาก DOMAIN_KEYS + bucket none สำหรับข้อไม่มี domain)
    const domainStats = Object.fromEntries(DOMAIN_KEYS.map(k => [k, { c: 0, t: 0 }]))
    domainStats.none = { c: 0, t: 0 }
    for (const a of answers.value) {
      const bucket = (a.domain && domainStats[a.domain]) ? a.domain : 'none'
      domainStats[bucket].t++
      if (a.correct) domainStats[bucket].c++
    }
    await addDoc(collection(db, 'examSessions'), {
      userId: authStore.currentUser.uid,
      nickname: authStore.userData?.nickname || null,
      total: quiz.value.length,
      correct: correct.value,
      pct: pct.value,
      domain: dom.value === '__all' ? null : dom.value,
      category: null,
      domainStats,
      ts: serverTimestamp(),
    })
  } catch (e) { console.error('[exam save]', e) }

  // 2) update the user doc: coins + best score + daily cap
  const newHigh = Math.max(authStore.userData?.quizHigh || 0, correct.value)
  await authStore.patchUser(
    {
      coins: (authStore.userData?.coins || 0) + grant,
      quizHigh: newHigh, quizCoinDate: today, quizCoinsToday: earnedToday + grant,
      quizDoneTotal: (authStore.userData?.quizDoneTotal || 0) + answered.value,
    },
    {
      ...(grant ? { coins: increment(grant) } : {}),
      quizHigh: newHigh, quizCoinDate: today, quizCoinsToday: earnedToday + grant,
      quizDoneTotal: increment(answered.value),
    },
  )
  if (grant) toast(`ได้ ${grant}🪙 จากการทำข้อสอบ`, 'success')
}
</script>

<style scoped>
.qv-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.qv-head-title { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; color: var(--ink); }
.qv-back { border: 2px solid var(--ink); background: #fff; border-radius: 10px; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer; box-shadow: var(--pop); }
.qv-back:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-empty { text-align: center; color: rgba(0,0,0,.45); padding: 40px 16px; font-size: .85rem; line-height: 1.6; }

.qv-info { font-size: .9rem; color: #334155; margin-bottom: 14px; }
.qv-label { font-size: .68rem; font-weight: 700; color: #64748b; margin: 12px 0 6px; }
.qv-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.qv-chip { border: 2px solid var(--ink); background: #fff; border-radius: 999px; padding: 7px 14px; font-family: inherit; font-size: .76rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.qv-chip.on { background: var(--primary); border-color: var(--ink); color: #fff; }
.qv-start { width: 100%; margin-top: 20px; border: 2px solid var(--ink); border-radius: 14px; padding: 15px; font-family: inherit; font-size: .95rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.qv-start:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-start:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.qv-hint { text-align: center; font-size: .64rem; color: rgba(0,0,0,.4); margin-top: 10px; }

.qv-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.qv-quit { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; font-size: .85rem; cursor: pointer; flex-shrink: 0; }
.qv-bar { flex: 1; height: 7px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.qv-fill { height: 100%; background: linear-gradient(90deg,#4f46e5,#6366f1); transition: width .3s; }
.qv-count { font-size: .68rem; font-weight: 700; color: rgba(0,0,0,.5); flex-shrink: 0; }
.qv-running { text-align: right; font-size: .68rem; font-weight: 700; color: #15803d; margin-bottom: 10px; }
.qv-q { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 18px; font-size: .95rem; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 14px; }
.qv-choices { display: flex; flex-direction: column; gap: 10px; }
.qv-choice { display: flex; align-items: center; gap: 10px; text-align: left; border: 2px solid var(--ink); background: #fff; border-radius: 12px; padding: 13px 14px; font-family: inherit; font-size: .85rem; color: var(--ink); cursor: pointer; box-shadow: var(--pop); transition: transform .1s, box-shadow .1s; }
.qv-choice:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-choice:disabled { cursor: default; }
.qv-letter { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,.06); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: .78rem; }
.qv-ctext { flex: 1; }
.qv-choice.correct { border-color: #22c55e; background: rgba(34,197,94,.1); color: #15803d; font-weight: 700; }
.qv-choice.correct .qv-letter { background: #22c55e; color: #fff; }
.qv-choice.wrong { border-color: #ef4444; background: rgba(239,68,68,.08); color: #dc2626; }
.qv-choice.wrong .qv-letter { background: #ef4444; color: #fff; }
.qv-choice.dim { opacity: .5; }
.qv-feedback { margin-top: 14px; }
.qv-fb { font-weight: 800; font-size: .9rem; text-align: center; padding: 8px; border-radius: 10px; }
.qv-fb.ok { color: #15803d; background: rgba(34,197,94,.12); }
.qv-fb.no { color: #dc2626; background: rgba(239,68,68,.1); }
.qv-exp { margin-top: 10px; font-size: .76rem; color: #b45309; background: #fffbeb; border-radius: 10px; padding: 10px 12px; line-height: 1.5; }
.qv-next { width: 100%; margin-top: 14px; border: none; border-radius: 12px; padding: 13px; font-family: inherit; font-size: .88rem; font-weight: 800; color: #fff; background: linear-gradient(135deg,#4f46e5,#6366f1); cursor: pointer; }

.qv-report { margin-top: 12px; }
.qv-report-btn { width: 100%; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 10px; padding: 9px; font-family: inherit; font-size: .76rem; font-weight: 700; color: #64748b; cursor: pointer; }
.qv-report-btn.done { color: #15803d; border-color: rgba(34,197,94,.4); cursor: default; }
.qv-report-panel { border: 1px solid var(--border); border-radius: 12px; padding: 10px; }
.qv-report-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.qv-report-chip { border: 2px solid var(--ink); background: #fff; border-radius: 999px; padding: 5px 11px; font-family: inherit; font-size: .7rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.qv-report-chip.on { background: var(--primary); border-color: var(--ink); color: #fff; }
.qv-report-note { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 8px 10px; font-family: inherit; font-size: .78rem; resize: vertical; }
.qv-report-actions { display: flex; gap: 8px; margin-top: 8px; }
.qv-report-cancel { flex: 0 0 80px; border: 2px solid var(--ink); background: #fff; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
.qv-report-send { flex: 1; border: none; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .78rem; font-weight: 800; color: #fff; background: var(--primary); cursor: pointer; }
.qv-report-send:disabled { background: #cbd5e1; cursor: default; }

.qv-result { text-align: center; padding: 24px 0; }
.qv-result-emoji { font-size: 3.4rem; }
.qv-result-title { font-size: 1.2rem; font-weight: 800; margin: 6px 0 14px; }
.qv-result-score { font-family: var(--font-display); font-weight: 400; font-size: 2.8rem; color: var(--primary); line-height: 1; }
.qv-result-score span { font-size: 1.3rem; color: rgba(0,0,0,.35); }
.qv-result-pct { font-size: 1rem; font-weight: 700; color: #64748b; margin-top: 4px; }
.qv-result-coins { font-size: 1.2rem; font-weight: 800; color: #d97706; margin: 14px 0; }
.qv-result-nocoins { font-size: .72rem; color: rgba(0,0,0,.4); margin: 14px 0; }
.qv-result .qv-start { max-width: 260px; margin: 6px auto 0; }

.qv-history-btn { width: 100%; margin-top: 10px; border: 2px solid var(--ink); background: #fff; border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 700; font-size: .85rem; color: var(--ink); cursor: pointer; box-shadow: var(--pop); }
.qv-history-btn:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-hist-latest { font-size: .95rem; margin-bottom: 14px; }
.qv-trend { display: flex; align-items: flex-end; gap: 4px; height: 80px; padding: 8px; border: 2px solid var(--ink); border-radius: 12px; background: #fff; margin-bottom: 8px; }
.qv-trend-bar { flex: 1; min-width: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
.qv-dom-stats { display: flex; flex-direction: column; gap: 8px; }
.qv-dom-row { display: flex; align-items: center; gap: 8px; }
.qv-dom-name { width: 44px; font-size: .78rem; font-weight: 700; }
.qv-dom-bar { flex: 1; height: 14px; background: rgba(0,0,0,.07); border-radius: 999px; overflow: hidden; }
.qv-dom-fill { display: block; height: 100%; background: var(--primary); }
.qv-dom-val { font-size: .72rem; font-variant-numeric: tabular-nums; color: rgba(0,0,0,.6); }
</style>
