<!--
  ข้อสอบประจำวัน — 5 ข้อชุดเดียวทั้งรุ่น · ข้อละ 30 วิ · เล่นวันละครั้ง · อันดับรับรางวัลหลัง 00:00
  spec: docs/superpowers/specs/2026-10-31-daily-challenge-v2-design.md
-->
<template>
  <div class="tab-content">
    <div class="dc-head">
      <button class="dc-back" aria-label="ย้อนกลับ" @click="$router.back()">‹</button>
      <span class="dc-head-title"><Emoji char="🌅" /> ข้อสอบประจำวัน</span>
    </div>

    <div v-if="!auth.isLoggedIn" class="dc-empty">เข้าสู่ระบบก่อนนะ</div>
    <template v-else>
      <!-- รางวัลอันดับของวันก่อน -->
      <div v-if="claim" class="dc-claim">
        <div class="dc-claim-t"><Emoji char="🏆" /> {{ thaiDay(claim.day) }} คุณได้อันดับ {{ claim.rank }}!</div>
        <button class="dc-btn" :disabled="claiming" @click="doClaim">กดรับ {{ claim.coins.toLocaleString() }} 🪙</button>
      </div>

      <div v-if="stage === 'loading'" class="dc-empty">กำลังเตรียมข้อสอบ…</div>

      <!-- กติกา -->
      <div v-else-if="stage === 'intro'" class="dc-card">
        <div class="dc-big"><Emoji char="🌅" /></div>
        <div class="dc-title">ชุดของวันที่ {{ thaiDay(today) }}</div>
        <ul class="dc-rules">
          <li>5 ข้อ ชุดเดียวกันทั้งรุ่น · ข้อละ 30 วินาที</li>
          <li>ตอบถูกเร็วได้คะแนนมาก (500–1,000 ต่อข้อ)</li>
          <li>เล่นได้วันละครั้ง — กดเริ่มแล้วออกกลางทาง = จบรอบนี้</li>
          <li>ได้ {{ DC_COIN_PER_CORRECT }} 🪙 ต่อข้อที่ถูกทันที</li>
          <li>ท็อป 10 ของวัน กดรับรางวัลได้หลังเที่ยงคืน: อันดับ 1 = 10,000 · 2 = 7,000 · 3 = 5,000 · 4–10 = 2,000 🪙</li>
        </ul>
        <button class="dc-btn dc-btn-wide" :disabled="starting" @click="start">{{ starting ? 'กำลังเตรียม…' : 'เริ่มเลย →' }}</button>
      </div>

      <!-- เล่น -->
      <div v-else-if="stage === 'play' && cur" class="dc-card">
        <div class="dc-prog">
          <span>ข้อ {{ idx + 1 }}/{{ qs.length }}</span>
          <span class="dc-score">{{ score.toLocaleString() }} แต้ม</span>
        </div>
        <div class="dc-timer"><span :style="{ width: (remain / DC_TIME_MS * 100) + '%' }" :class="{ low: remain < 8000 }"></span></div>
        <div class="dc-q">{{ cur.question }}</div>
        <div class="dc-opts">
          <button v-for="(c, i) in cur.choices" :key="i" class="dc-opt" :class="optClass(i)" :disabled="picked !== null" @click="answer(i)">
            <b>{{ LETTERS[i] }}</b> {{ c }}
          </button>
        </div>
        <template v-if="picked !== null">
          <div class="dc-fb" :class="lastPts ? 'ok' : 'no'">
            <b>{{ picked === -1 ? '⏰ หมดเวลา' : lastPts ? `✓ ถูก! +${lastPts}` : '✗ ยังไม่ถูก' }}</b>
            <span v-if="!lastPts"> · เฉลยข้อ {{ LETTERS[cur.answer] }}</span>
          </div>
          <div v-if="cur.explanation" class="dc-exp"><Emoji char="💡" /> {{ cur.explanation }}</div>
          <button class="dc-btn dc-btn-wide" :disabled="saving" @click="next">{{ idx + 1 < qs.length ? 'ข้อต่อไป →' : (saving ? 'กำลังบันทึก…' : 'ดูผล →') }}</button>
        </template>
      </div>

      <!-- ผล + กระดาน -->
      <template v-else-if="stage === 'done'">
        <div class="dc-card dc-result">
          <div class="dc-title">ผลวันนี้</div>
          <div v-if="mine" class="dc-mine">
            <div><b>{{ mine.score.toLocaleString() }}</b><small>แต้ม</small></div>
            <div><b>{{ mine.correct }}/5</b><small>ข้อถูก</small></div>
            <div><b>{{ mine.rank ? '#' + mine.rank : '-' }}</b><small>อันดับตอนนี้</small></div>
          </div>
          <div v-else class="dc-sub">รอบนี้ไม่มีผลบันทึก (ออกกลางทาง) — พรุ่งนี้มาใหม่นะ</div>
          <div class="dc-sub">ประกาศผลตอนเที่ยงคืน · ท็อป 10 กดรับรางวัลได้ที่หน้านี้</div>
        </div>
        <div v-if="review.length" class="dc-card">
          <div class="dc-title"><Emoji char="📖" /> ทบทวน 5 ข้อของวันนี้</div>
          <div class="dc-sub">ข้อไหนดูแปลก เฉลยน่าสงสัย กดแจ้งได้เลย ทีมวิชาการจะตรวจให้</div>
          <div v-for="(q, i) in review" :key="q.id" class="dc-rv">
            <div class="dc-rv-q"><b>{{ i + 1 }}.</b> {{ q.question }}</div>
            <div class="dc-rv-a"><b>เฉลย:</b> {{ q.choices?.[q.answer] }}</div>
            <div v-if="q.explanation" class="dc-rv-exp"><Emoji char="💡" /> {{ q.explanation }}</div>
            <QuestionReport :q="q" />
          </div>
        </div>
        <div class="dc-card">
          <div class="dc-title"><Emoji char="🏅" /> อันดับวันนี้</div>
          <div v-if="!board.length" class="dc-sub">ยังไม่มีใครเล่นเลย</div>
          <div v-for="r in board.slice(0, 10)" :key="r.uid" class="dc-row" :class="{ me: r.uid === uid }">
            <span class="dc-rank">{{ medal(r.rank) }}</span>
            <span class="dc-name">{{ r.name || '?' }}</span>
            <span class="dc-pts">{{ r.score.toLocaleString() }}</span>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  doc, getDoc, getDocs, setDoc, collection, query, where, orderBy, startAt, limit,
  runTransaction, serverTimestamp, increment, deleteField, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import Emoji from '../components/shared/Emoji.vue'
import QuestionReport from '../components/study/QuestionReport.vue'
import { shuffleChoices } from '../utils/quizShuffle.js'
import { applyQuizResults, buildQcardsPatch } from '../utils/srsQuestions.js'
import { tallyGroups, buildGsPatch } from '../utils/practiceStats.js'
import { activeEvent, quizPts, grantPatch } from '../utils/event.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import {
  DC_TIME_MS, DC_COIN_PER_CORRECT, dayKey, dayStartMs, questionScore, rankRows, prizeFor, pendingClaimDay, pickDaily,
} from '../utils/dailyChallenge.js'

const auth = useAuthStore()
const usage = useUsageStore()
const { toast } = useToast()
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const thaiDay = (k) => { const [, m, d] = k.split('-'); return `${+d} ${MONTHS[+m - 1]}` }
const medal = (r) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : '#' + r)

const today = dayKey()
const uid = computed(() => auth.currentUser?.uid)
const stage = ref('loading')      // loading | intro | play | done
const starting = ref(false)
const saving = ref(false)

const dayRef = (d) => doc(db, 'dailyChallenge', d)
const resultsCol = (d) => collection(db, 'dailyChallenge', d, 'results')

// ── กระดาน ──
const board = ref([])
async function loadBoard(d) {
  const snap = await getDocs(query(resultsCol(d), orderBy('score', 'desc'), limit(30)))
  usage.track(snap.size)
  return rankRows(snap.docs.map(x => x.data()))
}
const mine = ref(null)
const review = ref([])          // 5 ข้อของวัน (ลำดับต้นฉบับ) — ทบทวน + แจ้งข้อผิดหลังเล่นจบ
async function showDone() {
  try {
    if (!qsRaw.length) { const d = await getDoc(dayRef(today)); usage.track(1); if (d.exists()) qsRaw = d.data().qs || [] }
    review.value = qsRaw
    board.value = await loadBoard(today)
    const me = board.value.find(r => r.uid === uid.value)
    if (me) mine.value = me
    else {
      const s = await getDoc(doc(resultsCol(today), uid.value)); usage.track(1)
      mine.value = s.exists() ? { ...s.data(), rank: null } : null
    }
  } catch (e) { console.error('[daily board]', e) }
  stage.value = 'done'
}

// ── รางวัลของวันก่อน ──
const claim = ref(null)
const claiming = ref(false)
async function checkClaim() {
  const day = pendingClaimDay(auth.userData?.dc, today)
  if (!day) return
  try {
    const rows = await loadBoard(day)
    const me = rows.find(r => r.uid === uid.value)
    const coins = me ? prizeFor(me.rank) : 0
    if (coins) {
      const c = await getDoc(doc(db, 'dailyChallenge', day, 'claims', uid.value)); usage.track(1)
      if (!c.exists()) { claim.value = { day, rank: me.rank, coins }; return }
    }
    // ไม่ติดอันดับ / รับไปแล้ว → จำไว้ ไม่ต้องอ่านกระดานซ้ำ
    await auth.patchUser({ dc: { ...(auth.userData?.dc || {}), claimed: day } }, { 'dc.claimed': day })
  } catch (e) { console.error('[daily claim check]', e) }
}
async function doClaim() {
  if (!claim.value || claiming.value) return
  claiming.value = true
  const { day, rank, coins } = claim.value
  try {
    await setDoc(doc(db, 'dailyChallenge', day, 'claims', uid.value), { uid: uid.value, rank, coins, ts: serverTimestamp() })
  } catch (e) {
    // มีใบรับแล้ว (กดซ้ำ/อีกเครื่อง) → ปิดแบนเนอร์เฉยๆ
    console.error('[daily claim]', e); claim.value = null; claiming.value = false; return
  }
  const ok = await auth.patchUser(
    { coins: (auth.userData?.coins || 0) + coins, dc: { ...(auth.userData?.dc || {}), claimed: day } },
    { coins: increment(coins), 'dc.claimed': day },
  )
  if (ok) { toast(`รับ ${coins.toLocaleString()} 🪙 แล้ว เก่งมาก!`, 'success'); claim.value = null }
  else toast('รับรางวัลไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error')
  claiming.value = false
}

// ── ชุดของวัน: คนแรกที่เปิดสร้าง ──
async function ensureSet() {
  const s = await getDoc(dayRef(today)); usage.track(1)
  if (s.exists()) return s.data().qs
  const col = collection(db, 'questions')
  const base = [where('isPublished', '==', true), where('reviewStatus', '==', 'passed')]
  const R = Math.random()
  const first = await getDocs(query(col, ...base, orderBy('rand'), startAt(R), limit(8)))
  usage.track(first.size)
  let wrap = { docs: [] }
  if (first.size < 8) { wrap = await getDocs(query(col, ...base, orderBy('rand'), limit(8))); usage.track(wrap.size) }
  const toRow = (d) => ({ id: d.id, ...d.data() })
  const qs = pickDaily(first.docs.map(toRow), wrap.docs.map(toRow))
  if (qs.length < 5) throw new Error('not enough questions')
  return runTransaction(db, async (tx) => {
    const cur = await tx.get(dayRef(today))
    if (cur.exists()) return cur.data().qs           // มีคนสร้างตัดหน้า → ใช้ของเขา
    tx.set(dayRef(today), { date: today, qs, openAt: Timestamp.fromMillis(dayStartMs(today)), createdAt: serverTimestamp() })
    return qs
  })
}

// ── เล่น ──
let qsRaw = []                 // ชุดของวันตามต้นฉบับ (ก่อนสลับตัวเลือก)
const qs = ref([])
const idx = ref(0)
const cur = computed(() => qs.value[idx.value] || null)
const picked = ref(null)        // index ที่เลือก · -1 = หมดเวลา
const lastPts = ref(0)
const score = ref(0)
const answers = ref([])
const remain = ref(DC_TIME_MS)
let qStart = 0
let timer = null
let totalMs = 0

function tick() {
  remain.value = Math.max(0, DC_TIME_MS - (performance.now() - qStart))
  if (remain.value <= 0 && picked.value === null) answer(-1)
}
function beginQuestion() {
  picked.value = null; lastPts.value = 0; remain.value = DC_TIME_MS
  qStart = performance.now()
  clearInterval(timer); timer = setInterval(tick, 100)
}
function answer(i) {
  if (picked.value !== null) return
  clearInterval(timer)
  const ms = Math.min(DC_TIME_MS, Math.round(performance.now() - qStart))
  const ok = i === cur.value.answer
  picked.value = i
  lastPts.value = questionScore(ok, ms)
  score.value += lastPts.value
  totalMs += ms
  answers.value.push({ id: cur.value.id, domain: cur.value.domain, pleGroup: cur.value.pleGroup, correct: ok })
}
function optClass(i) {
  if (picked.value === null) return ''
  if (i === cur.value.answer) return 'correct'
  return i === picked.value ? 'wrong' : 'dim'
}
function next() {
  if (idx.value + 1 < qs.value.length) { idx.value++; beginQuestion() } else finish()
}

async function start() {
  if (starting.value) return
  starting.value = true
  try {
    const set = await ensureSet()
    qsRaw = set
    // จองสิทธิ์ก่อนเริ่ม: dc.last = วันนี้ → ออกกลางทางก็เล่นซ้ำไม่ได้
    const ok = await auth.patchUser({ dc: { ...(auth.userData?.dc || {}), last: today } }, { 'dc.last': today })
    if (!ok) { toast('เริ่มไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error'); return }
    qs.value = set.map(shuffleChoices)
    idx.value = 0; score.value = 0; answers.value = []; totalMs = 0
    stage.value = 'play'
    beginQuestion()
  } catch (e) {
    console.error('[daily start]', e); toast('เตรียมข้อสอบไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error')
  } finally { starting.value = false }
}

async function finish() {
  if (saving.value) return
  saving.value = true
  const correct = answers.value.filter(a => a.correct).length
  const u = auth.userData
  try {
    await setDoc(doc(resultsCol(today), uid.value), {
      uid: uid.value, name: u?.nickname || '?', score: score.value, ms: totalMs, correct, ts: serverTimestamp(),
    })
  } catch (e) { console.error('[daily result]', e); toast('บันทึกอันดับไม่สำเร็จ', 'error') }

  // เหรียญ + แต้มอีเวนต์ + กองข้อผิด + สถิติรายกลุ่ม — patch ก้อนเดียว (CLAUDE.md ข้อ 9: หยิบค่าก่อน)
  const grant = correct * DC_COIN_PER_CORRECT
  const ev = activeEvent()
  const evPts = quizPts(ev, answers.value.length, correct)
  const evp = grantPatch(u, ev, evPts, increment)
  const { set: qcSet, remove: qcRemove } = applyQuizResults({
    qcards: u?.study?.qcards, answers: answers.value, variant: 'normal', now: Date.now(), missingIds: [],
  })
  const { optimisticStudy, server: qcServer } = buildQcardsPatch({
    study: u?.study, set: qcSet, remove: qcRemove, deleteSentinel: deleteField(),
  })
  const { server: gsServer, optimisticGs } = buildGsPatch({ gs: u?.study?.gs, tally: tallyGroups(answers.value), increment })
  const study = { ...optimisticStudy, gs: optimisticGs }
  const dq = bumpDailyQuest(u?.dailyQuest, 'quiz', new Date().toISOString().slice(0, 10), answers.value.length)
  const ok = await auth.patchUser(
    {
      coins: (u?.coins || 0) + grant, quizDoneTotal: (u?.quizDoneTotal || 0) + answers.value.length,
      dailyQuest: dq, study, ...(evp ? evp.local : {}),
    },
    {
      ...(grant ? { coins: increment(grant) } : {}), quizDoneTotal: increment(answers.value.length),
      dailyQuest: dq, ...gsServer, ...qcServer, ...(evp ? evp.server : {}),
    },
  )
  if (ok && grant) toast(`ได้ ${grant.toLocaleString()} 🪙${evPts ? ` + ${evPts}${ev.pt}` : ''}`, 'success')
  saving.value = false
  await showDone()
}

onMounted(async () => {
  const run = async () => {
    checkClaim()
    if (auth.userData?.dc?.last === today) await showDone()
    else stage.value = 'intro'
  }
  if (auth.userData) run()
  else {
    const t = setInterval(() => { if (auth.userData) { clearInterval(t); run() } }, 200)
    setTimeout(() => clearInterval(t), 15000)
  }
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.dc-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.dc-back { border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; width: 34px; height: 34px; font-size: 1.1rem; cursor: pointer; color: var(--ink); }
.dc-head-title { font-weight: 800; font-size: 1.15rem; color: var(--ink); }
.dc-empty { text-align: center; color: var(--muted); padding: 30px 10px; font-size: .86rem; }
.dc-card { background: var(--surface, #fff); border: var(--bw) solid var(--line); border-radius: 20px; box-shadow: var(--pop); padding: 16px; margin-bottom: 12px; }
.dc-big { font-size: 2.4rem; text-align: center; }
.dc-title { font-weight: 800; font-size: .98rem; color: var(--ink); text-align: center; margin-bottom: 8px; }
.dc-sub { font-size: .76rem; color: var(--muted); text-align: center; margin-top: 6px; line-height: 1.5; }
.dc-rules { margin: 6px 0 14px; padding-left: 20px; font-size: .82rem; color: var(--ink); line-height: 1.7; }
.dc-btn { border: 0; background: var(--primary); color: #fff; font-family: inherit; font-weight: 800; font-size: .86rem; padding: 10px 16px; border-radius: 999px; cursor: pointer; }
.dc-btn:disabled { opacity: .6; cursor: default; }
.dc-btn-wide { display: block; width: 100%; margin-top: 12px; padding: 13px; }
.dc-claim { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; background: linear-gradient(135deg, #fff7d6, #ffe9c2); border: var(--bw) solid #f5d48a; border-radius: 16px; padding: 12px 14px; margin-bottom: 12px; }
.dc-claim-t { font-weight: 800; font-size: .86rem; color: #7a4b00; }

.dc-prog { display: flex; justify-content: space-between; font-size: .78rem; font-weight: 700; color: var(--muted); }
.dc-score { color: var(--primary); }
.dc-timer { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; margin: 8px 0 12px; }
.dc-timer span { display: block; height: 100%; background: var(--mint, #34d399); border-radius: 999px; transition: width .1s linear; }
.dc-timer span.low { background: var(--accent); }
.dc-q { font-size: .92rem; font-weight: 700; color: var(--ink); line-height: 1.6; margin-bottom: 12px; white-space: pre-wrap; }
.dc-opts { display: flex; flex-direction: column; gap: 8px; }
.dc-opt { text-align: left; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 11px 12px; font-family: inherit; font-size: .84rem; color: var(--ink); cursor: pointer; line-height: 1.5; }
.dc-opt b { color: var(--primary); margin-right: 4px; }
.dc-opt.correct { border-color: #22c55e; background: #f0fdf4; }
.dc-opt.wrong { border-color: #f43f5e; background: #fff1f2; }
.dc-opt.dim { opacity: .55; }
.dc-fb { margin-top: 12px; font-size: .84rem; padding: 10px 12px; border-radius: 12px; }
.dc-fb.ok { background: #f0fdf4; color: #166534; }
.dc-fb.no { background: #fff1f2; color: #9f1239; }
.dc-exp { margin-top: 8px; font-size: .8rem; color: var(--ink); background: #f8fafc; border-radius: 12px; padding: 10px 12px; line-height: 1.6; }

.dc-rv { border-top: 1px solid var(--line); padding: 12px 0 4px; }
.dc-rv-q { font-size: .84rem; color: var(--ink); line-height: 1.6; white-space: pre-wrap; }
.dc-rv-a { font-size: .8rem; color: #166534; background: #f0fdf4; border-radius: 10px; padding: 7px 10px; margin-top: 6px; }
.dc-rv-exp { font-size: .78rem; color: var(--muted); margin-top: 6px; line-height: 1.6; }
.dc-mine { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; }
.dc-mine b { display: block; font-size: 1.25rem; color: var(--ink); }
.dc-mine small { font-size: .72rem; color: var(--muted); }
.dc-row { display: grid; grid-template-columns: 44px 1fr auto; align-items: center; gap: 8px; padding: 9px 4px; border-top: 1px solid var(--line); font-size: .84rem; color: var(--ink); }
.dc-row.me { background: var(--primary-light); border-radius: 10px; font-weight: 800; }
.dc-rank { text-align: center; font-weight: 800; }
.dc-pts { font-weight: 800; color: var(--primary); }
</style>
