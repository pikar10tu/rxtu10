<template>
  <div class="tab-content">
    <div class="rv-head">
      <div class="rv-title"><Emoji char="🔍" /> ตรวจข้อสอบ</div>
      <RouterLink to="/questions" class="rv-back">คลังข้อสอบ ›</RouterLink>
    </div>

    <div v-if="!authStore.isQuestionEditor" class="rv-denied">
      เฉพาะแอดมินหรือทีมวิชาการเท่านั้น
    </div>

    <template v-else>
      <!-- ── แถบสรุปคิว ── -->
      <div class="rv-summary">
        <Emoji char="📋" /> เหลือต้องตรวจ <b>{{ summary.remaining }}</b> ข้อ<span v-if="summary.conflicts"> · ขัดแย้ง <b>{{ summary.conflicts }}</b> ข้อ</span>
      </div>

      <div v-if="loading" class="rv-empty">กำลังโหลดคลังข้อสอบ…</div>

      <!-- ── การ์ดข้อปัจจุบัน ── -->
      <section v-else-if="current" class="rv-card">
        <div class="rv-card-tags">
          <span v-if="current.domain" class="rv-cat">{{ domainLabel(current.domain) || current.domain }}</span>
          <span v-if="current.category" class="rv-cat rv-cat-sub">{{ current.category }}</span>
          <span v-if="!current.isPublished" class="rv-draft">ร่าง</span>
          <span v-if="currentStatus === 'conflict'" class="rv-conflict-badge">⚠️ ขัดแย้ง — คุณคือผู้ตัดสิน</span>
        </div>

        <div class="rv-q">{{ current.question }}</div>
        <ul class="rv-choices">
          <li v-for="(c, i) in current.choices" :key="i" :class="{ correct: i === current.answer }">
            <span class="rv-c-letter">{{ LETTERS[i] }}</span><span class="rv-c-text">{{ c }}</span>
            <span v-if="i === current.answer" class="rv-c-mark">✓ เฉลย</span>
          </li>
        </ul>
        <div v-if="current.explanation" class="rv-exp"><Emoji char="💡" /> {{ current.explanation }}</div>

        <!-- รีวิวเดิม 2 ฉบับ (โชว์เฉพาะข้อ conflict ให้คนที่ 3 ตัดสิน — ข้ออื่นซ่อนกันอคติ) -->
        <div v-if="currentStatus === 'conflict' && priorReviews.length" class="rv-priors">
          <div class="rv-priors-head">ผลตรวจก่อนหน้า ({{ priorReviews.length }})</div>
          <div v-for="p in priorReviews" :key="p.id" class="rv-prior">
            <div class="rv-prior-top">
              <span class="rv-prior-verdict" :class="p.verdict">{{ VERDICT_LABEL[p.verdict] || p.verdict }}</span>
              <b>{{ p.reviewerName || 'ไม่ระบุ' }}</b>
            </div>
            <div class="rv-prior-reason">{{ p.reason }}</div>
            <div v-if="p.ref" class="rv-prior-ref">เรฟ: {{ p.ref }}</div>
          </div>
        </div>

        <!-- ── ฟอร์มตรวจ ── -->
        <div class="rv-form">
          <div class="rv-verdicts">
            <button
              v-for="v in VERDICTS" :key="v.key"
              type="button" class="rv-vbtn" :class="[v.key, { on: verdict === v.key }]"
              @click="verdict = v.key"
            >{{ v.label }}</button>
          </div>

          <label class="rv-label">เหตุผล (บังคับ)</label>
          <textarea v-model="reason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="อธิบายว่าทำไมตัดสินแบบนี้…"></textarea>

          <label class="rv-label">เรฟอ้างอิง (ไม่บังคับ)</label>
          <input v-model="refText" :maxlength="LIMITS.reviewRef" class="rv-input" placeholder="ลิงก์ / ชื่อหนังสือ / แนวทาง…" />

          <div class="rv-actions">
            <button class="rv-btn rv-gray" :disabled="submitting" @click="skip">ข้ามข้อนี้</button>
            <button class="rv-btn rv-primary" :disabled="!canSubmit || submitting" @click="submit">
              {{ submitting ? 'กำลังส่ง…' : 'ส่งผลตรวจ' }}
            </button>
          </div>
        </div>
      </section>

      <div v-else class="rv-empty rv-done">
        <Emoji char="🎉" /> ตรวจครบทุกข้อที่เข้าคิวให้คุณแล้ว — ขอบคุณมาก!
      </div>

      <!-- ── leaderboard ── -->
      <section class="rv-board">
        <div class="rv-board-head"><Emoji char="🏅" /> ใครตรวจไปกี่ข้อ</div>
        <div v-if="!leaderboard.length" class="rv-empty rv-board-empty">ยังไม่มีใครตรวจ</div>
        <ol v-else class="rv-board-list">
          <li v-for="row in leaderboard" :key="row.uid" class="rv-board-row" :class="{ me: row.uid === myUid }">
            <span class="rv-board-name">{{ row.name }}<span v-if="row.uid === myUid" class="rv-you"> (คุณ)</span></span>
            <span class="rv-board-count">{{ row.count }} ข้อ</span>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { collection, getDocs, doc, writeBatch, arrayUnion, increment, deleteField, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { domainLabel } from '../data/domains.js'
import { computeStatus, tallyReviewCounts, nextReviewQueue, buildLeaderboard } from '../utils/questionReview.js'

const authStore = useAuthStore()
const members = useMembersStore()
const usage = useUsageStore()
const { toast } = useToast()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const VERDICTS = [
  { key: 'correct', label: '✅ ถูกต้อง' },
  { key: 'fix',     label: '🛠️ ต้องแก้' },
  { key: 'wrong',   label: '❌ ผิด' },
]
const VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด' }

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const skippedIds = ref(new Set())
const verdict = ref(null)
const reason = ref('')
const refText = ref('')
const priorReviews = ref([])

const myUid = computed(() => authStore.currentUser?.uid || null)

// คิวข้อที่ต้องให้ฉันตรวจ ลบข้อที่กด "ข้าม" ในเซสชันนี้
const queue = computed(() =>
  nextReviewQueue(list.value, myUid.value).filter(q => !skippedIds.value.has(q.id)))
const current = computed(() => queue.value[0] || null)
const currentStatus = computed(() => current.value ? computeStatus(current.value) : null)

const summary = computed(() => ({
  remaining: nextReviewQueue(list.value, myUid.value).length,
  conflicts: list.value.filter(q => computeStatus(q) === 'conflict').length,
}))

const canSubmit = computed(() => !!verdict.value && !!reason.value.trim())

// uid → ชื่อจริง จาก members store (รวม guestUsers เพราะ instructor=อาจารย์ เป็น guest)
const nameByUid = computed(() => {
  const m = {}
  const all = [...Object.values(members.fbUsers), ...members.guestUsers]
  for (const u of all) if (u.uid) m[u.uid] = u.realName || u.nickname || 'ไม่ระบุ'
  return m
})
const leaderboard = computed(() => buildLeaderboard(tallyReviewCounts(list.value), nameByUid.value))

onMounted(() => {
  if (!authStore.isQuestionEditor) return
  members.loadFbUsers()   // ได้ชื่อจริงให้ leaderboard (cache ข้ามเซสชันถ้ามี)
  load()
})

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc')))
    usage.track(snap.size)
    list.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[review load]', e); toast('โหลดข้อสอบไม่สำเร็จ', 'error') }
  finally { loading.value = false }
}

// เปลี่ยนข้อปัจจุบัน → ล้างฟอร์ม + โหลดรีวิวเดิมถ้าเป็นข้อ conflict (ให้คนที่ 3 เห็น)
watch(current, async (q) => {
  verdict.value = null; reason.value = ''; refText.value = ''; priorReviews.value = []
  if (q && currentStatus.value === 'conflict') {
    try {
      const snap = await getDocs(collection(db, 'questions', q.id, 'reviews'))
      usage.track(snap.size)
      // กรองเฉพาะรีวิวของรอบปัจจุบัน — subdoc รอบก่อน reset (แก้เนื้อหาแล้ว) ยังค้างอยู่
      priorReviews.value = snap.docs.filter(d => (q.reviewedBy || []).includes(d.id))
        .map(d => ({ id: d.id, ...d.data() }))
    } catch (e) { console.error('[review priors]', e) }
  }
}, { immediate: true })

function skip() {
  if (!current.value) return
  const next = new Set(skippedIds.value)
  next.add(current.value.id)
  skippedIds.value = next   // Set ใหม่ → computed queue เลื่อนไปข้อถัดไป
}

async function submit() {
  if (!canSubmit.value || submitting.value || !current.value || !myUid.value) return
  submitting.value = true
  const q = current.value
  const uid = myUid.value
  const u = authStore.userData || {}
  const reviewerName = u.realName || u.nickname || u.name || 'ไม่ระบุ'   // snapshot ชื่อจริง
  const v = verdict.value
  const isPass = v === 'correct'
  const newPass = (q.reviewPass || 0) + (isPass ? 1 : 0)
  const newFail = (q.reviewFail || 0) + (isPass ? 0 : 1)
  const newStatus = computeStatus({ reviewPass: newPass, reviewFail: newFail })
  try {
    const batch = writeBatch(db)
    // 1) รายละเอียดเต็มใน subcollection (doc id = uid → กันตรวจซ้ำ)
    batch.set(doc(db, 'questions', q.id, 'reviews', uid), {
      reviewerUid: uid,
      reviewerName,
      verdict: v,
      reason: cleanText(reason.value, LIMITS.reviewReason),
      ref: cleanText(refText.value, LIMITS.reviewRef),
      ts: serverTimestamp(),
    })
    // 2) aggregate บนเอกสารข้อสอบ (ให้ pull-model หาข้อถัดไปจากการอ่านคลังครั้งเดียว)
    //  เก็บแค่ตัวนับ pass/fail — ห้ามเก็บ uid→verdict บน doc (ข้อ published นักศึกษาอ่านได้ทั้งใบ)
    //  ตัวนับ merge ปลอดภัยด้วย increment/arrayUnion แม้ 2 คนส่งพร้อมกัน
    //  ⚠️ reviewStatus = "ค่าบอกใบ้" เท่านั้น (last-write-wins อาจคำนวณจากภาพเก่า)
    //     → consumer ทุกตัวให้ computeStatus ใหม่จาก reviewPass/reviewFail เสมอ
    batch.update(doc(db, 'questions', q.id), {
      reviewedBy: arrayUnion(uid),
      [isPass ? 'reviewPass' : 'reviewFail']: increment(1),
      reviewStatus: newStatus,
      reviewVerdicts: deleteField(),   // ล้าง map โครงเก่า (ถ้ามี) — กัน verdict รายคนหลุดถึงนักศึกษา
    })
    await batch.commit()
    usage.track(0, 2)
    // อัปเดต local list ให้คิว/leaderboard เลื่อนทันที (ไม่ reload ทั้งคลัง)
    const idx = list.value.findIndex(x => x.id === q.id)
    if (idx >= 0) {
      list.value[idx] = { ...q, reviewedBy: [...(q.reviewedBy || []), uid], reviewPass: newPass, reviewFail: newFail, reviewStatus: newStatus }
    }
    toast('ส่งผลตรวจแล้ว ขอบคุณ!', 'success')
  } catch (e) { console.error('[review submit]', e); toast('ส่งไม่สำเร็จ', 'error') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.rv-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.rv-title { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; color: var(--ink); line-height: 1.1; }
.rv-back { font-size: .72rem; font-weight: 700; color: #4f46e5; text-decoration: none; }
.rv-denied, .rv-empty { text-align: center; color: rgba(0,0,0,.4); padding: 26px 0; font-size: .85rem; }
.rv-done { color: #15803d; font-weight: 700; }

.rv-summary { font-size: .76rem; color: var(--ink); background: var(--primary-light, #eef2ff); border-radius: 10px; padding: 9px 12px; margin-bottom: 12px; line-height: 1.5; }
.rv-summary b { font-weight: 800; }

.rv-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 16px; }
.rv-card-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
.rv-cat { font-size: .62rem; color: #4f46e5; font-weight: 700; }
.rv-cat-sub { color: rgba(0,0,0,.45); }
.rv-draft { font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.07); color: rgba(0,0,0,.5); }
.rv-conflict-badge { font-size: .62rem; font-weight: 800; padding: 2px 9px; border-radius: 999px; background: #fff7ed; color: #c2410c; }
.rv-q { font-size: .92rem; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 11px; white-space: pre-wrap; overflow-wrap: anywhere; }
.rv-choices { list-style: none; margin: 0 0 4px; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.rv-choices li { font-size: .8rem; color: rgba(0,0,0,.65); display: flex; gap: 8px; align-items: baseline; padding: 7px 10px; border-radius: 9px; background: #f8fafc; }
.rv-choices li.correct { background: rgba(34,197,94,.12); color: #15803d; font-weight: 700; }
.rv-c-letter { font-weight: 800; flex-shrink: 0; }
.rv-c-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.rv-c-mark { flex-shrink: 0; font-size: .62rem; font-weight: 800; color: #15803d; }
.rv-exp { margin-top: 9px; font-size: .74rem; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 8px 10px; line-height: 1.45; }

.rv-priors { margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 11px; }
.rv-priors-head { font-size: .7rem; font-weight: 800; color: #c2410c; margin-bottom: 7px; }
.rv-prior { background: #fffdf7; border: 1px solid rgba(0,0,0,.08); border-radius: 10px; padding: 9px 11px; margin-bottom: 7px; }
.rv-prior-top { display: flex; align-items: center; gap: 8px; font-size: .78rem; margin-bottom: 4px; }
.rv-prior-verdict { font-size: .6rem; font-weight: 800; padding: 1px 7px; border-radius: 999px; }
.rv-prior-verdict.correct { background: rgba(34,197,94,.15); color: #15803d; }
.rv-prior-verdict.fix { background: rgba(245,158,11,.16); color: #b45309; }
.rv-prior-verdict.wrong { background: rgba(239,68,68,.12); color: #dc2626; }
.rv-prior-reason { font-size: .76rem; color: rgba(0,0,0,.7); line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.rv-prior-ref { font-size: .68rem; color: rgba(0,0,0,.45); margin-top: 3px; overflow-wrap: anywhere; }

.rv-form { margin-top: 13px; border-top: 1px dashed var(--border); padding-top: 12px; }
.rv-verdicts { display: flex; gap: 7px; margin-bottom: 11px; }
.rv-vbtn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 10px 6px; font-family: inherit; font-size: .78rem; font-weight: 800; background: #fff; color: var(--ink); cursor: pointer; transition: transform .1s; }
.rv-vbtn:active { transform: translate(1px,1px); }
.rv-vbtn.correct.on { background: #22c55e; border-color: #22c55e; color: #fff; }
.rv-vbtn.fix.on { background: #f59e0b; border-color: #f59e0b; color: #fff; }
.rv-vbtn.wrong.on { background: #ef4444; border-color: #ef4444; color: #fff; }
.rv-label { display: block; font-size: .68rem; font-weight: 700; color: #64748b; margin: 9px 0 5px; }
.rv-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.rv-input:focus { outline: none; box-shadow: var(--pop); }
.rv-actions { display: flex; gap: 8px; margin-top: 13px; }
.rv-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.rv-primary { background: var(--primary); color: #fff; box-shadow: var(--pop); }
.rv-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.rv-primary:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.rv-gray { background: #fff; color: var(--ink); flex: 0 0 110px; }

.rv-board { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; }
.rv-board-head { font-weight: 800; font-size: .9rem; margin-bottom: 10px; }
.rv-board-empty { padding: 14px 0; }
.rv-board-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; counter-reset: rank; }
.rv-board-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 10px; border-radius: 9px; font-size: .82rem; }
.rv-board-row::before { counter-increment: rank; content: counter(rank); flex-shrink: 0; width: 20px; font-weight: 800; color: rgba(0,0,0,.35); font-size: .72rem; }
.rv-board-row.me { background: var(--primary-light, #eef2ff); }
.rv-board-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.rv-you { color: #4f46e5; font-weight: 800; }
.rv-board-count { flex-shrink: 0; font-weight: 800; color: var(--ink); font-size: .78rem; }
</style>
