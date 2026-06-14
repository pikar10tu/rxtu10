<template>
  <div class="tab-content">
    <div class="qv-head">
      <button class="qv-back" @click="$router.back()">‹</button>
      <span>📝 ทำข้อสอบ</span>
    </div>

    <div v-if="!authStore.isLoggedIn" class="qv-empty">เข้าสู่ระบบเพื่อทำข้อสอบ</div>

    <!-- ── HOME ── -->
    <template v-else-if="mode === 'home'">
      <div v-if="loading" class="qv-empty">กำลังโหลดข้อสอบ…</div>
      <div v-else-if="!pool.length" class="qv-empty">ยังไม่มีข้อสอบที่เผยแพร่ — รอทีมวิชาการเพิ่มก่อนนะ 📚</div>
      <template v-else>
        <div class="qv-info">มีข้อสอบให้ทำ <b>{{ pool.length }}</b> ข้อ</div>

        <template v-if="categories.length > 1">
          <div class="qv-label">หมวด</div>
          <div class="qv-chips">
            <button v-for="c in categories" :key="c" class="qv-chip" :class="{ on: cat === c }" @click="cat = c">
              {{ c === '__all' ? 'ทั้งหมด' : c }}
            </button>
          </div>
        </template>

        <div class="qv-label">จำนวนข้อ</div>
        <div class="qv-chips">
          <button v-for="n in lenChoices" :key="n" class="qv-chip" :class="{ on: len === n }" @click="len = n">
            {{ n === 0 ? `ทั้งหมด (${filtered.length})` : `${n} ข้อ` }}
          </button>
        </div>

        <button class="qv-start" :disabled="!filtered.length" @click="start">
          เริ่มทำข้อสอบ ({{ quizCount }} ข้อ)
        </button>
        <div class="qv-hint">ทำข้อสอบได้เหรียญ +10/ข้อที่ถูก (สูงสุด {{ DAILY_CAP }}🪙/วัน)</div>
      </template>
    </template>

    <!-- ── QUIZ ── -->
    <template v-else-if="mode === 'quiz'">
      <div class="qv-bar-row">
        <button class="qv-quit" @click="quit">✕</button>
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
        <div v-if="current.explanation" class="qv-exp">💡 {{ current.explanation }}</div>
        <button class="qv-next" @click="next">{{ idx + 1 < quiz.length ? 'ข้อถัดไป →' : 'ดูผลคะแนน' }}</button>
      </div>
    </template>

    <!-- ── RESULT ── -->
    <template v-else-if="mode === 'result'">
      <div class="qv-result">
        <div class="qv-result-emoji">{{ resultEmoji }}</div>
        <div class="qv-result-title">ทำข้อสอบจบแล้ว!</div>
        <div class="qv-result-score">{{ correct }}<span>/{{ quiz.length }}</span></div>
        <div class="qv-result-pct">{{ pct }}%</div>
        <div v-if="coinsEarned" class="qv-result-coins">+{{ coinsEarned.toLocaleString() }} 🪙</div>
        <div v-else class="qv-result-nocoins">วันนี้รับเหรียญครบเพดานแล้ว</div>
        <button class="qv-start" @click="mode = 'home'">ทำชุดใหม่</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { collection, getDocs, query, where, addDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'

const authStore = useAuthStore()
const { toast } = useToast()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const DAILY_CAP = 300
const COIN_PER_CORRECT = 10

// ── pool of published questions ──
const pool = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), where('isPublished', '==', true)))
    pool.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(q => Array.isArray(q.choices) && q.choices.length >= 2)
  } catch (e) {
    console.error('[quiz load]', e)
    toast('โหลดข้อสอบไม่สำเร็จ', 'error')
  } finally {
    loading.value = false
  }
}
onMounted(() => { if (authStore.isLoggedIn) load() })

const categories = computed(() => ['__all', ...new Set(pool.value.map(q => q.category).filter(Boolean))])
const cat = ref('__all')
const filtered = computed(() => cat.value === '__all' ? pool.value : pool.value.filter(q => q.category === cat.value))

const len = ref(10)
const lenChoices = computed(() => {
  const opts = [5, 10, 20].filter(n => n < filtered.value.length)
  opts.push(0) // 0 = all
  return opts
})
// keep `len` valid as the filtered pool changes
watch(lenChoices, (opts) => { if (!opts.includes(len.value)) len.value = opts.includes(10) ? 10 : opts[opts.length - 1] }, { immediate: true })
const quizCount = computed(() => len.value === 0 ? filtered.value.length : Math.min(len.value, filtered.value.length))

// ── session state ──
const mode = ref('home')          // home | quiz | result
const quiz = ref([])
const idx = ref(0)
const picked = ref(null)
const correct = ref(0)
const answered = ref(0)
const coinsEarned = ref(0)

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

function start() {
  quiz.value = shuffle(filtered.value).slice(0, quizCount.value).map(shuffleChoices)
  idx.value = 0; picked.value = null; correct.value = 0; answered.value = 0; coinsEarned.value = 0
  if (quiz.value.length) mode.value = 'quiz'
}

function pick(i) {
  if (picked.value !== null) return
  picked.value = i
  answered.value++
  if (i === current.value.answer) correct.value++
}
function choiceClass(i) {
  if (picked.value === null) return ''
  if (i === current.value.answer) return 'correct'
  if (i === picked.value) return 'wrong'
  return 'dim'
}
function next() {
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
    await addDoc(collection(db, 'examSessions'), {
      userId: authStore.currentUser.uid,
      nickname: authStore.userData?.nickname || null,
      total: quiz.value.length,
      correct: correct.value,
      pct: pct.value,
      category: cat.value === '__all' ? null : cat.value,
      ts: serverTimestamp(),
    })
  } catch (e) { console.error('[exam save]', e) }

  // 2) update the user doc: coins + best score + daily cap
  const newHigh = Math.max(authStore.userData?.quizHigh || 0, correct.value)
  await authStore.patchUser(
    {
      coins: (authStore.userData?.coins || 0) + grant,
      quizHigh: newHigh, quizCoinDate: today, quizCoinsToday: earnedToday + grant,
    },
    {
      ...(grant ? { coins: increment(grant) } : {}),
      quizHigh: newHigh, quizCoinDate: today, quizCoinsToday: earnedToday + grant,
    },
  )
  if (grant) toast(`ได้ ${grant}🪙 จากการทำข้อสอบ`, 'success')
}
</script>

<style scoped>
.qv-head { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.05rem; margin-bottom: 14px; }
.qv-back { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; font-size: 1.1rem; cursor: pointer; }
.qv-empty { text-align: center; color: rgba(0,0,0,.45); padding: 40px 16px; font-size: .85rem; line-height: 1.6; }

.qv-info { font-size: .9rem; color: #334155; margin-bottom: 14px; }
.qv-label { font-size: .68rem; font-weight: 700; color: #64748b; margin: 12px 0 6px; }
.qv-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.qv-chip { border: 1px solid rgba(0,0,0,.12); background: #fff; border-radius: 999px; padding: 7px 14px; font-family: inherit; font-size: .76rem; font-weight: 700; color: rgba(0,0,0,.55); cursor: pointer; }
.qv-chip.on { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.qv-start { width: 100%; margin-top: 20px; border: none; border-radius: 14px; padding: 15px; font-family: inherit; font-size: .95rem; font-weight: 800; color: #fff; background: linear-gradient(135deg,#4f46e5,#6366f1); cursor: pointer; }
.qv-start:disabled { background: #cbd5e1; cursor: default; }
.qv-hint { text-align: center; font-size: .64rem; color: rgba(0,0,0,.4); margin-top: 10px; }

.qv-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.qv-quit { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; font-size: .85rem; cursor: pointer; flex-shrink: 0; }
.qv-bar { flex: 1; height: 7px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.qv-fill { height: 100%; background: linear-gradient(90deg,#4f46e5,#6366f1); transition: width .3s; }
.qv-count { font-size: .68rem; font-weight: 700; color: rgba(0,0,0,.5); flex-shrink: 0; }
.qv-running { text-align: right; font-size: .68rem; font-weight: 700; color: #15803d; margin-bottom: 10px; }
.qv-q { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 18px; font-size: .95rem; font-weight: 700; color: #1e293b; line-height: 1.5; margin-bottom: 12px; }
.qv-choices { display: flex; flex-direction: column; gap: 8px; }
.qv-choice { display: flex; align-items: center; gap: 10px; text-align: left; border: 1.5px solid rgba(0,0,0,.1); background: #fff; border-radius: 12px; padding: 13px 14px; font-family: inherit; font-size: .85rem; color: #334155; cursor: pointer; }
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

.qv-result { text-align: center; padding: 24px 0; }
.qv-result-emoji { font-size: 3.4rem; }
.qv-result-title { font-size: 1.2rem; font-weight: 800; margin: 6px 0 14px; }
.qv-result-score { font-size: 2.6rem; font-weight: 800; color: #4f46e5; line-height: 1; }
.qv-result-score span { font-size: 1.3rem; color: rgba(0,0,0,.35); }
.qv-result-pct { font-size: 1rem; font-weight: 700; color: #64748b; margin-top: 4px; }
.qv-result-coins { font-size: 1.2rem; font-weight: 800; color: #d97706; margin: 14px 0; }
.qv-result-nocoins { font-size: .72rem; color: rgba(0,0,0,.4); margin: 14px 0; }
.qv-result .qv-start { max-width: 260px; margin: 6px auto 0; }
</style>
