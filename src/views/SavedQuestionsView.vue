<template>
  <!-- 📖 อ่านข้อที่บันทึกไว้ (18 พ.ย. 2026) — ดูโจทย์+เฉลย+ความเห็นได้เลย ไม่ต้องทำใหม่
       read: 1/ข้อ (getDoc ทีละ doc — ห้ามใช้ documentId() in เพราะข้อถอนเผยแพร่ทำพังทั้งก้อน)
       โหลดทีละหน้า PAGE ข้อ · ข้อที่โหลดแล้วจำไว้ในเครื่องตลอดเซสชัน (cache ระดับโมดูล) · ความเห็น 1 query/หน้า -->
  <div class="tab-content">
    <div class="sv-head">
      <BackButton aria-label="ย้อนกลับ" @click="$router.back()" />
      <span class="sv-title"><Emoji char="🔖" /> ข้อที่บันทึกไว้</span>
      <span class="sv-count">{{ ids.length }} ข้อ</span>
    </div>

    <div v-if="!auth.isLoggedIn" class="sv-empty">เข้าสู่ระบบก่อนนะ</div>
    <div v-else-if="!ids.length" class="sv-empty">ยังไม่มีข้อที่บันทึกไว้ — กด 🔖 ที่หน้าเฉลยได้เลย</div>
    <template v-else>
      <button class="sv-play" @click="$router.push({ path: '/quiz', query: { mode: 'saved' } })">
        <Emoji char="📝" /> ทำชุดนี้ ({{ Math.min(ids.length, SAVED_BATCH) }} ข้อล่าสุด) ›
      </button>

      <article v-for="(q, n) in shown" :key="q.id" class="sv-card">
        <div class="sv-meta">
          <span class="sv-tag">#{{ n + 1 }}</span>
          <span v-if="q.domain" class="sv-tag">{{ domainLabel(q.domain) }}</span>
        </div>
        <div class="sv-q">{{ q.question }}</div>
        <QuestionImages :question="q" />
        <ol class="sv-choices">
          <li v-for="(c, i) in q.choices" :key="i" :class="{ ok: i === q.answer }">
            <span class="sv-letter">{{ LETTERS[i] }}</span><span>{{ c }}</span><span v-if="i === q.answer" class="sv-ans">✓ เฉลย</span>
          </li>
        </ol>
        <div v-if="q.explanation" class="sv-exp"><Emoji char="💡" /> {{ q.explanation }}</div>
        <div v-if="q.reviewNote" class="sv-note"><Emoji char="📝" /> หมายเหตุจากผู้ตรวจ: {{ q.reviewNote }}</div>
        <QuestionActions :q="q" />
      </article>

      <div v-if="goneCount" class="sv-note">มี {{ goneCount }} ข้อถูกนำออกจากคลังแล้ว เลยเอาออกจากที่บันทึกให้</div>
      <button v-if="loadedUpTo < ids.length" class="sv-more" :disabled="loading" @click="loadPage">
        {{ loading ? 'กำลังโหลด…' : `โหลดเพิ่มอีก ${Math.min(PAGE, ids.length - loadedUpTo)} ข้อ` }}
      </button>
      <div v-else-if="loading" class="sv-empty">กำลังโหลด…</div>
    </template>
  </div>
</template>

<script>
// cache ข้ามการเข้าหน้าในเซสชันเดียวกัน — ไม่โหลดโจทย์ซ้ำ
const qCache = new Map()   // id → question | null (null = หาย/ถอนเผยแพร่)
</script>

<script setup>
import { ref, computed, watch } from 'vue'
import { getDoc, doc, deleteField } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import BackButton from '../components/shared/BackButton.vue'
import Emoji from '../components/shared/Emoji.vue'
import QuestionImages from '../components/shared/QuestionImages.vue'
import QuestionActions from '../components/quiz/QuestionActions.vue'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { loadQComments } from '../composables/useQComments.js'
import { savedIds, buildSavedRemove, SAVED_BATCH } from '../utils/savedQuestions.js'
import { domainLabel } from '../data/domains.js'

const PAGE = 10
const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const auth = useAuthStore()
const usage = useUsageStore()
const { toast } = useToast()

// ล็อกลำดับตอนเข้าหน้า — กดเอาออกระหว่างอ่าน การ์ดไม่หายวูบ (ปุ่มกลับเป็น "บันทึก" ให้กดคืนได้)
const ids = ref([])
const loadedUpTo = ref(0)
const loading = ref(false)
const goneCount = ref(0)
const tick = ref(0)

const shown = computed(() => (tick.value, ids.value.slice(0, loadedUpTo.value).map(id => qCache.get(id)).filter(Boolean)))

async function loadPage() {
  if (loading.value) return
  loading.value = true
  try {
    const page = ids.value.slice(loadedUpTo.value, loadedUpTo.value + PAGE)
    const need = page.filter(id => !qCache.has(id))
    if (need.length) {
      const snaps = await Promise.all(need.map(id =>
        getDoc(doc(db, 'questions', id)).catch(e => { if (e?.code === 'permission-denied') return null; throw e })))
      usage.track(snaps.length)
      need.forEach((id, i) => {
        const s = snaps[i]
        const q = s?.exists() ? { id, ...s.data() } : null
        qCache.set(id, q && q.isPublished && Array.isArray(q.choices) && q.choices.length >= 2 ? q : null)
      })
    }
    const gone = page.filter(id => qCache.get(id) === null)
    if (gone.length) {
      goneCount.value += gone.length
      const { optimisticStudy, server } = buildSavedRemove({ study: auth.userData?.study, ids: gone, deleteSentinel: deleteField() })
      auth.patchUser({ study: optimisticStudy }, server)
    }
    loadedUpTo.value += page.length
    tick.value++
    loadQComments(page.filter(id => qCache.get(id)))
  } catch (e) {
    console.error('[saved read]', e); toast('โหลดข้อที่บันทึกไว้ไม่สำเร็จ', 'error')
  } finally { loading.value = false }
}

// รอ userData มาก่อน (เปิดลิงก์ตรง/รีเฟรช) แล้วล็อกลิสต์ครั้งเดียว
const stop = watch(() => auth.userData, u => {
  if (!u) return
  ids.value = savedIds(u.study?.saved)
  if (ids.value.length) loadPage()
  queueMicrotask(() => stop())
}, { immediate: true })
</script>

<style scoped>
.sv-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sv-title { font-weight: 800; font-size: 1.05rem; }
.sv-count { margin-left: auto; font-size: .8rem; color: var(--muted); }
.sv-empty { text-align: center; color: var(--muted); padding: 28px 8px; }
.sv-play { width: 100%; font: inherit; font-weight: 700; border: 0; border-radius: 12px; padding: 11px; margin-bottom: 12px; background: var(--primary); color: #fff; cursor: pointer; }
.sv-card { background: var(--card, #fff); border-radius: 14px; padding: 12px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.sv-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.sv-tag { font-size: .7rem; padding: 1px 8px; border-radius: 999px; background: var(--line); color: var(--muted); }
.sv-q { white-space: pre-wrap; line-height: 1.55; margin-bottom: 8px; }
.sv-choices { list-style: none; padding: 0; margin: 0 0 8px; display: grid; gap: 4px; }
.sv-choices li { display: flex; gap: 8px; align-items: baseline; padding: 6px 8px; border-radius: 9px; font-size: .9rem; border: 1px solid var(--line); }
.sv-choices li.ok { border-color: #22c55e; background: #f0fdf4; font-weight: 600; }
.sv-letter { font-weight: 800; color: var(--muted); }
.sv-ans { margin-left: auto; font-size: .7rem; color: #16a34a; white-space: nowrap; }
.sv-exp { font-size: .86rem; line-height: 1.55; background: #fffbeb; border-radius: 9px; padding: 8px; white-space: pre-wrap; }
.sv-note { font-size: .78rem; color: var(--muted); margin-top: 6px; }
.sv-more { width: 100%; font: inherit; border: 1px dashed var(--line); background: none; border-radius: 12px; padding: 10px; color: var(--muted); cursor: pointer; }
</style>
