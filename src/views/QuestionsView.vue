<template>
  <div class="tab-content">
    <div class="qz-head">
      <div class="qz-title"><Emoji char="📝" /> คลังข้อสอบ</div>
      <span class="qz-count">{{ filtered.length }}/{{ list.length }} ข้อ</span>
    </div>

    <div v-if="!authStore.isAcademic" class="qz-denied">
      เฉพาะแอดมินหรือทีมวิชาการเท่านั้น
    </div>

    <template v-else>
      <!-- ── นำเข้าหลายข้อ (bulk JSON import) ── -->
      <details class="qz-import">
        <summary class="qz-import-sum"><Emoji char="📥" /> นำเข้าข้อสอบหลายข้อ (JSON)</summary>
        <div class="qz-import-body">
          <div class="qz-import-file">
            <input ref="fileEl" type="file" accept=".json,application/json" hidden @change="onFile" />
            <button type="button" class="qz-pick" @click="fileEl?.click()"><Emoji char="📂" /> เลือกไฟล์ .json จากเครื่อง</button>
            <span class="qz-pick-hint">หรือวาง JSON ด้านล่าง</span>
          </div>

          <textarea
            v-model="importText" class="qz-input qz-import-ta" rows="6" spellcheck="false"
            placeholder='วาง JSON ที่นี่ — array ของข้อสอบ เช่น [ { "question": "...", "choices": ["ก","ข"], "answer": 0 } ]'
          ></textarea>

          <details class="qz-fmt">
            <summary>ดูรูปแบบ JSON</summary>
            <pre class="qz-fmt-pre">{{ FORMAT_EXAMPLE }}</pre>
            <p class="qz-fmt-note">
              <code>answer</code> = ลำดับตัวเลือกที่ถูก เริ่มที่ 0 · <code>choices</code> 2–6 ตัว ·
              <code>category</code>/<code>explanation</code> ไม่บังคับ ·
              ทุกข้อนำเข้าเป็น <b>“ร่าง”</b> ต้องไปกดเผยแพร่ทีหลัง
            </p>
          </details>

          <div v-if="importError" class="qz-import-err"><Emoji char="⚠️" /> {{ importError }}</div>
          <div v-else-if="importText.trim()" class="qz-import-hint">
            พร้อมนำเข้า <b>{{ importCount }}</b> ข้อ<span v-if="importSkipped"> · ข้าม {{ importSkipped }} ข้อ (ผิดรูปแบบ)</span>
          </div>

          <button class="qz-btn qz-primary qz-import-btn" :disabled="importing || !importCount" @click="runImport">
            {{ importing ? 'กำลังนำเข้า…' : (importCount ? `📥 นำเข้า ${importCount} ข้อ` : '📥 นำเข้า') }}
          </button>

          <button class="qz-btn qz-maint qz-import-btn" :disabled="backfilling" @click="backfillRand">
            {{ backfilling ? 'กำลังเติม rand…' : '🔧 เติม rand ให้ข้อเก่า' }}
          </button>
          <button class="qz-btn qz-maint qz-import-btn" :disabled="recomputingMeta" @click="recomputeMeta">
            {{ recomputingMeta ? 'กำลังคำนวณ…' : '🔄 คำนวณ meta ใหม่' }}
          </button>
        </div>
      </details>

      <!-- ── ข้อที่ถูกแจ้งว่าผิด (questionReports) ── -->
      <details class="qz-reports" @toggle="onReportsToggle">
        <summary class="qz-reports-sum"><Emoji char="🚩" /> ข้อที่ถูกแจ้งว่าผิด<span v-if="reportsOpen"> ({{ reports.length }})</span></summary>
        <div class="qz-reports-body">
          <div v-if="reportsLoading" class="qz-empty">กำลังโหลด…</div>
          <div v-else-if="!reportGroups.length" class="qz-empty">ยังไม่มีข้อที่ถูกแจ้ง <Emoji char="🎉" /></div>
          <div v-else class="qz-report-list">
            <div v-for="g in reportGroups" :key="g.questionId" class="qz-report-card">
              <div class="qz-report-top">
                <span class="qz-report-badge">ถูกแจ้ง {{ g.count }} ครั้ง</span>
                <span v-if="!questionExists(g.questionId)" class="qz-report-deleted">ข้อถูกลบแล้ว</span>
              </div>
              <div class="qz-report-q">{{ reportQuestionText(g) }}</div>
              <ul class="qz-report-reasons">
                <li v-for="r in g.reports" :key="r.id">
                  <b>{{ r.reason }}</b><span v-if="r.note"> — {{ r.note }}</span>
                  <span class="qz-report-meta"> · {{ r.reportedByName || 'ไม่ระบุ' }} · {{ fmtTime(r.createdAt) }}</span>
                </li>
              </ul>
              <div class="qz-report-actions">
                <button class="qz-mini" :disabled="!questionExists(g.questionId)" @click="editReported(g)">แก้ไขข้อนี้</button>
                <button class="qz-mini" :disabled="resolvingId === g.questionId" @click="resolveReports(g, 'valid')">✓ ผิดจริง (ให้รางวัล)</button>
                <button class="qz-mini qz-danger" :disabled="resolvingId === g.questionId" @click="resolveReports(g, 'invalid')">✕ ไม่ผิด</button>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- ── editor ── -->
      <section class="qz-card">
        <div class="qz-card-head">{{ draft.id ? '✏️ แก้ไขข้อสอบ' : '➕ เพิ่มข้อสอบใหม่' }}</div>

        <label class="qz-label">โจทย์</label>
        <textarea v-model="draft.question" :maxlength="LIMITS.question" class="qz-input" rows="3" placeholder="พิมพ์คำถาม…"></textarea>

        <label class="qz-label">ตัวเลือก (กดวงกลมเพื่อเลือกข้อที่ถูก)</label>
        <div v-for="(c, i) in draft.choices" :key="i" class="qz-choice">
          <button
            class="qz-radio" :class="{ on: draft.answer === i }"
            type="button" @click="draft.answer = i"
            :title="draft.answer === i ? 'ข้อที่ถูก' : 'ตั้งเป็นข้อที่ถูก'"
          >{{ draft.answer === i ? '✓' : LETTERS[i] }}</button>
          <input v-model="draft.choices[i]" :maxlength="LIMITS.choice" class="qz-input qz-choice-in" :placeholder="`ตัวเลือก ${LETTERS[i]}`" />
          <button class="qz-del-choice" type="button" :disabled="draft.choices.length <= 2" @click="removeChoice(i)">✕</button>
        </div>
        <button class="qz-add-choice" type="button" :disabled="draft.choices.length >= 6" @click="draft.choices.push('')">+ เพิ่มตัวเลือก</button>

        <label class="qz-label">หมวด / กลุ่มเนื้อหา</label>
        <input v-model="draft.category" :maxlength="LIMITS.category" class="qz-input" placeholder="เช่น ยาปฏิชีวนะ, ระบบหัวใจ, เภสัชจลนศาสตร์…" />

        <label class="qz-label">คำอธิบายเฉลย (ไม่บังคับ)</label>
        <textarea v-model="draft.explanation" :maxlength="LIMITS.explanation" class="qz-input" rows="2" placeholder="อธิบายว่าทำไมข้อนี้ถูก…"></textarea>

        <label class="qz-check">
          <input type="checkbox" v-model="draft.isPublished" />
          เผยแพร่ให้นักศึกษาเห็น (ติ๊กออก = ร่าง เห็นเฉพาะทีมวิชาการ)
        </label>

        <div class="qz-actions">
          <button v-if="draft.id" class="qz-btn qz-gray" @click="resetDraft">ยกเลิก</button>
          <button class="qz-btn qz-primary" :disabled="!valid || saving" @click="save">
            {{ saving ? 'กำลังบันทึก…' : (draft.id ? 'บันทึกการแก้ไข' : 'เพิ่มข้อสอบ') }}
          </button>
        </div>
      </section>

      <!-- ── list ── -->
      <div class="qz-list-head">
        <span>รายการข้อสอบ</span>
        <button class="qz-mini" :disabled="loading" @click="load">{{ loading ? '...' : '↻ โหลด' }}</button>
      </div>

      <!-- ── ค้นหา / กรอง ── -->
      <div v-if="list.length" class="qz-filters">
        <input v-model="search" class="qz-input qz-search" type="text" placeholder="🔍 ค้นหาโจทย์ / หมวด…" />
        <div class="qz-filter-row">
          <select v-model="statusFilter" class="qz-select">
            <option value="all">ทุกสถานะ</option>
            <option value="published">เผยแพร่</option>
            <option value="draft">ร่าง</option>
          </select>
          <select v-model="catFilter" class="qz-select">
            <option value="__all">ทุกหมวด</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <!-- ── เลือกหลายข้อ + batch ── -->
      <div v-if="filtered.length" class="qz-batch">
        <label class="qz-selall">
          <input type="checkbox" :checked="allFilteredSelected" @change="toggleSelectAllFiltered" />
          เลือกทั้งหมดในผลกรอง ({{ filtered.length }})
        </label>
        <button v-if="selected.size" class="qz-mini" @click="clearSelection">ล้างที่เลือก</button>
      </div>
      <div v-if="selected.size" class="qz-batch-actions">
        <span class="qz-selcount">เลือก {{ selected.size }} ข้อ →</span>
        <button class="qz-mini" :disabled="batchBusy" @click="batchPublish(true)">เผยแพร่</button>
        <button class="qz-mini" :disabled="batchBusy" @click="batchPublish(false)">ถอนเป็นร่าง</button>
        <button class="qz-mini qz-danger" :disabled="batchBusy" @click="batchDelete">ลบ</button>
      </div>
      <button
        v-if="filteredDraftIds.length"
        class="qz-btn qz-primary qz-pubfiltered" :disabled="batchBusy"
        @click="publishAllFilteredDrafts"
      >
        {{ batchBusy ? 'กำลังทำ…' : `🚀 เผยแพร่ร่างที่กรองอยู่ทั้งหมด (${filteredDraftIds.length})` }}
      </button>

      <div v-if="loading" class="qz-empty">กำลังโหลด…</div>
      <div v-else-if="!list.length" class="qz-empty">ยังไม่มีข้อสอบ — เพิ่มข้อแรกได้เลย</div>
      <div v-else-if="!filtered.length" class="qz-empty">ไม่พบข้อสอบตามเงื่อนไข</div>
      <ul v-else class="qz-list">
        <li v-for="q in visible" :key="q.id" class="qz-item" :class="{ sel: selected.has(q.id) }">
          <div class="qz-item-top">
            <input class="qz-check-item" type="checkbox" :checked="selected.has(q.id)" @change="toggleSelect(q.id)" />
            <span class="qz-badge" :class="q.isPublished ? 'pub' : 'draft'">{{ q.isPublished ? 'เผยแพร่' : 'ร่าง' }}</span>
            <span v-if="q.category" class="qz-cat">{{ q.category }}</span>
            <div class="qz-item-actions">
              <button class="qz-mini" @click="edit(q)">แก้ไข</button>
              <button class="qz-mini qz-danger" @click="remove(q)">ลบ</button>
            </div>
          </div>
          <div class="qz-q">{{ q.question }}</div>
          <ul class="qz-choices">
            <li v-for="(c, i) in q.choices" :key="i" :class="{ correct: i === q.answer }">
              <span class="qz-c-letter">{{ LETTERS[i] }}</span>{{ c }}
            </li>
          </ul>
          <div v-if="q.explanation" class="qz-exp"><Emoji char="💡" /> {{ q.explanation }}</div>
        </li>
      </ul>
      <button v-if="filtered.length > visible.length" class="qz-btn qz-gray qz-more" @click="visibleCount += PAGE">
        แสดงเพิ่ม ({{ filtered.length - visible.length }} เหลือ)
      </button>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit, serverTimestamp, writeBatch, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { parseImport } from '../utils/importQuestions.js'
import { buildMeta } from '../utils/questionsMeta.js'
import { filterQuestions, distinctCategories } from '../utils/questionsFilter.js'
import { groupReports, resolvePayload } from '../utils/questionReport.js'
import { buildReportRewardMail } from '../utils/mailbox.js'
import { REPORT_REWARD } from '../data/index.js'

const authStore = useAuthStore()
const usage = useUsageStore()
const { toast } = useToast()
const { confirm } = useConfirm()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']

const list = ref([])
const loading = ref(false)
const saving = ref(false)

// ── ค้นหา / กรอง / แบ่งหน้า / เลือกหลายข้อ (admin UX) ──
const PAGE = 50
const search = ref('')
const statusFilter = ref('all')   // all | published | draft
const catFilter = ref('__all')
const visibleCount = ref(PAGE)
const selected = ref(new Set())   // เก็บ id ที่เลือก (Vue 3 track Set ได้)
const batchBusy = ref(false)

const categories = computed(() => distinctCategories(list.value))
const filtered = computed(() => filterQuestions(list.value, {
  search: search.value, status: statusFilter.value, category: catFilter.value,
}))
const visible = computed(() => filtered.value.slice(0, visibleCount.value))
const filteredDraftIds = computed(() => filtered.value.filter(q => !q.isPublished).map(q => q.id))
const allFilteredSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every(q => selected.value.has(q.id)))

// กรองใหม่ → รีเซ็ตจำนวนที่โชว์ (กัน DOM ค้างเยอะ)
watch([search, statusFilter, catFilter], () => { visibleCount.value = PAGE })

function toggleSelect(id) {
  if (selected.value.has(id)) selected.value.delete(id)
  else selected.value.add(id)
}
function toggleSelectAllFiltered() {
  if (allFilteredSelected.value) filtered.value.forEach(q => selected.value.delete(q.id))
  else filtered.value.forEach(q => selected.value.add(q.id))
}
function clearSelection() { selected.value.clear() }

// commit ids เป็น batch ละ 500 (ลิมิต Firestore) · fn(batch, ref) สั่งงานต่อ doc
async function commitInChunks(ids, fn) {
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500)
    const batch = writeBatch(db)
    for (const id of chunk) fn(batch, doc(db, 'questions', id))
    await batch.commit()
    usage.track(0, chunk.length)
  }
}

async function afterBatch(msg) {
  clearSelection()
  await load()
  await recomputeMeta() // สถานะเผยแพร่เปลี่ยน → meta (publishedTotal/หมวด) ต้องคำนวณใหม่
  toast(msg, 'success')
}

async function batchPublish(value) {
  const ids = [...selected.value]
  if (!ids.length || batchBusy.value) return
  batchBusy.value = true
  try {
    await commitInChunks(ids, (b, ref) => b.update(ref, { isPublished: value, updatedAt: serverTimestamp() }))
    await afterBatch(`${value ? 'เผยแพร่' : 'ถอนเป็นร่าง'} ${ids.length} ข้อแล้ว`)
  } catch (e) { console.error('[batch publish]', e); toast('ทำไม่สำเร็จ', 'error') }
  finally { batchBusy.value = false }
}

async function batchDelete() {
  const ids = [...selected.value]
  if (!ids.length || batchBusy.value) return
  if (!(await confirm(`ลบข้อสอบที่เลือก ${ids.length} ข้อ? (ลบถาวร)`))) return
  batchBusy.value = true
  try {
    await commitInChunks(ids, (b, ref) => b.delete(ref))
    await afterBatch(`ลบ ${ids.length} ข้อแล้ว`)
  } catch (e) { console.error('[batch delete]', e); toast('ลบไม่สำเร็จ', 'error') }
  finally { batchBusy.value = false }
}

// ปุ่มลัด: เผยแพร่ "ร่างที่กรองอยู่" ทั้งหมด — จบงานหลัง import คลิกเดียว
async function publishAllFilteredDrafts() {
  const ids = filteredDraftIds.value
  if (!ids.length || batchBusy.value) return
  if (!(await confirm(`เผยแพร่ร่างที่กรองอยู่ทั้งหมด ${ids.length} ข้อ?`))) return
  batchBusy.value = true
  try {
    await commitInChunks(ids, (b, ref) => b.update(ref, { isPublished: true, updatedAt: serverTimestamp() }))
    await afterBatch(`เผยแพร่ ${ids.length} ข้อแล้ว`)
  } catch (e) { console.error('[publish drafts]', e); toast('เผยแพร่ไม่สำเร็จ', 'error') }
  finally { batchBusy.value = false }
}

function blankDraft() {
  return { id: null, question: '', choices: ['', '', '', ''], answer: 0, category: '', explanation: '', isPublished: false }
}
const draft = ref(blankDraft())
function resetDraft() { draft.value = blankDraft() }

const valid = computed(() => {
  const d = draft.value
  const filled = d.choices.filter(c => c.trim()).length
  return d.question.trim() && filled >= 2 && d.choices[d.answer]?.trim()
})

function removeChoice(i) {
  if (draft.value.choices.length <= 2) return
  draft.value.choices.splice(i, 1)
  // keep answer pointing at a valid index
  if (draft.value.answer >= draft.value.choices.length) draft.value.answer = draft.value.choices.length - 1
  else if (draft.value.answer > i) draft.value.answer--
}

onMounted(() => { if (authStore.isAcademic) load() })

// ── bulk JSON import ──
const FORMAT_EXAMPLE = `[
  {
    "question": "ยาใดเป็น first-line ของ ...",
    "choices": ["ก", "ข", "ค", "ง"],
    "answer": 2,
    "category": "ยาปฏิชีวนะ",
    "explanation": "เพราะ ..."
  }
]`
const importText = ref('')
const importing = ref(false)
const fileEl = ref(null)

// เลือกไฟล์ .json จากเครื่อง → เทเนื้อหาลง textarea (parse/preview เหมือนวางเอง)
async function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    importText.value = await file.text()
    const { rows, error } = parseImport(importText.value)
    if (error) toast(error, 'error')
    else toast(`อ่านไฟล์แล้ว · พบ ${rows.length} ข้อ`, 'success')
  } catch (err) {
    console.error('[questions import file]', err)
    toast('อ่านไฟล์ไม่สำเร็จ', 'error')
  } finally {
    e.target.value = '' // reset ให้เลือกไฟล์เดิมซ้ำได้
  }
}
const importParsed = computed(() => parseImport(importText.value))
const importCount = computed(() => importParsed.value.rows.length)
const importSkipped = computed(() => importParsed.value.skipped.length)
const importError = computed(() => (importText.value.trim() ? importParsed.value.error : null))

async function runImport() {
  if (importing.value) return
  const { rows, skipped, error } = parseImport(importText.value)
  if (error) { toast(error, 'error'); return }
  if (!rows.length) { toast('ไม่มีข้อที่นำเข้าได้', 'error'); return }
  importing.value = true
  try {
    const meta = {
      createdBy: authStore.currentUser?.uid || null,
      createdByName: authStore.userData?.nickname || authStore.userData?.name || null,
      source: 'import',
    }
    const col = collection(db, 'questions')
    // chunk ละ 500 — Firestore batch จำกัด 500 ops/commit
    for (let i = 0; i < rows.length; i += 500) {
      const batch = writeBatch(db)
      for (const row of rows.slice(i, i + 500)) {
        batch.set(doc(col), { ...row, ...meta, rand: Math.random(), createdAt: serverTimestamp() })
      }
      await batch.commit()
    }
    if (skipped.length) console.warn('[questions import] ข้ามข้อ (index, เหตุผล):', skipped)
    toast(`นำเข้า ${rows.length} ข้อ${skipped.length ? ` · ข้าม ${skipped.length} ข้อ` : ''}`, 'success')
    importText.value = ''
    await load()
    await recomputeMeta()
  } catch (e) {
    console.error('[questions import]', e)
    toast('นำเข้าไม่สำเร็จ', 'error')
  } finally {
    importing.value = false
  }
}

const backfilling = ref(false)
// เติม rand ให้ข้อเก่าที่ยังไม่มี field (จำเป็นก่อนสลับ quiz ไป windowed query —
// orderBy('rand') จะไม่คืน doc ที่ไม่มี rand)
async function backfillRand() {
  if (backfilling.value) return
  if (!(await confirm('เติมค่า rand ให้ข้อสอบเก่าที่ยังไม่มี? (ทำครั้งเดียวก่อนเปิดควิซแบบใหม่)'))) return
  backfilling.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc')))
    usage.track(snap.size)
    const missing = snap.docs.filter(d => typeof d.data().rand !== 'number')
    for (let i = 0; i < missing.length; i += 500) {
      const batch = writeBatch(db)
      for (const d of missing.slice(i, i + 500)) batch.update(d.ref, { rand: Math.random() })
      await batch.commit()
    }
    toast(`เติม rand แล้ว ${missing.length} ข้อ`, 'success')
  } catch (e) {
    console.error('[backfill rand]', e); toast('เติม rand ไม่สำเร็จ', 'error')
  } finally { backfilling.value = false }
}

const recomputingMeta = ref(false)
// อ่านทั้งคลังครั้งเดียว (admin เท่านั้น = ถูก) → เขียน config/questionsMeta
// ให้หน้า quiz home ใช้แทนการ getDocs ทั้งคลัง
async function recomputeMeta() {
  if (recomputingMeta.value) return
  recomputingMeta.value = true
  try {
    const snap = await getDocs(collection(db, 'questions'))
    usage.track(snap.size)
    const meta = buildMeta(snap.docs.map(d => d.data()))
    await setDoc(doc(db, 'config', 'questionsMeta'), { ...meta, updatedAt: serverTimestamp() })
    toast(`อัปเดต meta: เผยแพร่ ${meta.publishedTotal} ข้อ, ${meta.categories.length} หมวด`, 'success')
  } catch (e) {
    console.error('[recompute meta]', e); toast('อัปเดต meta ไม่สำเร็จ', 'error')
  } finally { recomputingMeta.value = false }
}

async function load() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc')))
    usage.track(snap.size)
    list.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[questions load]', e); toast('โหลดข้อสอบไม่สำเร็จ', 'error') }
  finally { loading.value = false }
}

async function save() {
  if (!valid.value || saving.value) return
  saving.value = true
  const d = draft.value
  const payload = {
    question: cleanText(d.question, LIMITS.question),
    choices: d.choices.map(c => cleanText(c, LIMITS.choice)).filter(Boolean),
    answer: d.answer,
    category: cleanText(d.category, LIMITS.category) || null,
    explanation: cleanText(d.explanation, LIMITS.explanation) || null,
    isPublished: !!d.isPublished,
    updatedAt: serverTimestamp(),
  }
  // clamp answer in case trailing empty choices were dropped
  if (payload.answer >= payload.choices.length) payload.answer = 0
  try {
    if (d.id) {
      await updateDoc(doc(db, 'questions', d.id), payload)
      toast('บันทึกการแก้ไขแล้ว', 'success')
    } else {
      await addDoc(collection(db, 'questions'), {
        ...payload,
        rand: Math.random(),
        createdBy: authStore.currentUser?.uid || null,
        createdByName: authStore.userData?.nickname || authStore.userData?.name || null,
        createdAt: serverTimestamp(),
      })
      toast('เพิ่มข้อสอบแล้ว', 'success')
    }
    resetDraft()
    await load()
  } catch (e) { console.error('[questions save]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { saving.value = false }
}

function edit(q) {
  draft.value = {
    id: q.id,
    question: q.question || '',
    choices: (q.choices && q.choices.length >= 2) ? [...q.choices] : ['', ''],
    answer: q.answer || 0,
    category: q.category || '',
    explanation: q.explanation || '',
    isPublished: !!q.isPublished,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function remove(q) {
  if (!(await confirm(`ลบข้อสอบนี้?\n\n"${q.question}"`))) return
  try {
    await deleteDoc(doc(db, 'questions', q.id))
    list.value = list.value.filter(x => x.id !== q.id)
    selected.value.delete(q.id)
    if (draft.value.id === q.id) resetDraft()
    toast('ลบแล้ว', 'success')
  } catch (e) { console.error('[questions remove]', e); toast('ลบไม่สำเร็จ', 'error') }
}

// ── ข้อที่ถูกแจ้งว่าผิด (Phase 5) ──
const reportsOpen = ref(false)
const reports = ref([])              // open reports (flat)
const reportsLoading = ref(false)
const resolvingId = ref(null)        // questionId ที่กำลังปิด
const reportGroups = computed(() => groupReports(reports.value))

function questionExists(qid) { return list.value.some(x => x.id === qid) }
function reportQuestionText(g) {
  const q = list.value.find(x => x.id === g.questionId)
  return q?.question || g.snapshot?.question || '(ไม่พบโจทย์)'
}
function fmtTime(t) {
  const ms = t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : new Date(t).getTime())
  if (!ms || Number.isNaN(ms)) return ''
  return new Date(ms).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

async function loadReports() {
  reportsLoading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'questionReports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(200),
    ))
    usage.track(snap.size)
    reports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[reports load]', e); toast('โหลดรายการที่ถูกแจ้งไม่สำเร็จ', 'error') }
  finally { reportsLoading.value = false }
}

function onReportsToggle(e) {
  reportsOpen.value = e.target.open
  if (e.target.open) loadReports()
}

function editReported(g) {
  const q = list.value.find(x => x.id === g.questionId)
  if (q) edit(q)
  else toast('ข้อนี้ถูกลบไปแล้ว — แก้ไขไม่ได้', 'error')
}

async function resolveReports(g, verdict) {
  if (resolvingId.value) return
  resolvingId.value = g.questionId
  try {
    const batch = writeBatch(db)
    if (verdict === 'valid') {
      // ผิดจริง → mint mail รางวัลให้ผู้แจ้งแต่ละคน (auto-deliver) + ปิด report เป็น delivered
      for (const r of g.reports) {
        const mailRef = doc(collection(db, 'users', r.reportedBy, 'mail'))
        batch.set(mailRef, buildReportRewardMail(r, REPORT_REWARD, serverTimestamp()))
        batch.update(doc(db, 'questionReports', r.id), {
          ...resolvePayload('valid', REPORT_REWARD),
          rewardDelivered: true,                 // ส่งทันที (auto-mint)
          resolvedAt: serverTimestamp(),
        })
      }
    } else {
      for (const r of g.reports) {
        batch.update(doc(db, 'questionReports', r.id), {
          ...resolvePayload('invalid', REPORT_REWARD),
          resolvedAt: serverTimestamp(),
        })
      }
    }
    await batch.commit()
    usage.track(0, verdict === 'valid' ? g.reports.length * 2 : g.reports.length)
    reports.value = reports.value.filter(r => r.questionId !== g.questionId) // ตัดกลุ่มที่ปิดออก
    toast(verdict === 'valid'
      ? `ส่งรางวัล ${REPORT_REWARD} เหรียญให้ผู้แจ้ง ${g.reports.length} คนแล้ว`
      : 'ปิดรายการแล้ว (ไม่ผิด)', 'success')
  } catch (e) { console.error('[resolve report]', e); toast('ปิดรายการไม่สำเร็จ', 'error') }
  finally { resolvingId.value = null }
}
</script>

<style scoped>
.qz-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.qz-title { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; color: var(--ink); line-height: 1.1; }
.qz-count { font-size: .66rem; color: rgba(0,0,0,.45); font-weight: 600; }
.qz-denied, .qz-empty { text-align: center; color: rgba(0,0,0,.4); padding: 26px 0; font-size: .85rem; }

.qz-import { background: #fff; border: 2px dashed var(--ink); border-radius: 16px; padding: 4px 14px; margin-bottom: 16px; }
.qz-import[open] { padding-bottom: 14px; }
.qz-import-sum { cursor: pointer; font-weight: 800; font-size: .9rem; padding: 11px 0; list-style: none; user-select: none; }
.qz-import-sum::-webkit-details-marker { display: none; }
.qz-import-sum::before { content: '▸ '; color: #94a3b8; }
.qz-import[open] .qz-import-sum::before { content: '▾ '; }
.qz-import-body { display: flex; flex-direction: column; gap: 9px; }
.qz-import-file { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.qz-pick { border: 1px dashed rgba(0,0,0,.25); background: none; border-radius: 9px; padding: 8px 13px; font-family: inherit; font-size: .76rem; font-weight: 700; color: #4f46e5; cursor: pointer; }
.qz-pick:active { transform: translate(1px,1px); }
.qz-pick-hint { font-size: .7rem; color: rgba(0,0,0,.4); }
.qz-import-ta { font-family: 'Space Mono', ui-monospace, monospace; font-size: .74rem; line-height: 1.5; white-space: pre; overflow-wrap: normal; overflow-x: auto; }
.qz-fmt { font-size: .72rem; }
.qz-fmt > summary { cursor: pointer; color: #4f46e5; font-weight: 700; }
.qz-fmt-pre { margin: 8px 0 6px; padding: 10px; background: #f8fafc; border: 1px solid var(--border); border-radius: 9px; font-family: 'Space Mono', ui-monospace, monospace; font-size: .68rem; line-height: 1.5; overflow-x: auto; }
.qz-fmt-note { color: rgba(0,0,0,.55); line-height: 1.6; }
.qz-fmt-note code { background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 5px; font-size: .92em; }
.qz-import-hint { font-size: .74rem; color: #15803d; font-weight: 600; }
.qz-import-err { font-size: .74rem; color: #dc2626; font-weight: 600; background: #fef2f2; border-radius: 8px; padding: 7px 10px; line-height: 1.4; }
.qz-import-btn { width: 100%; }
.qz-maint { background: #fff; color: var(--ink); }

.qz-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 16px; }
.qz-card-head { font-weight: 800; font-size: .92rem; margin-bottom: 10px; }
.qz-label { display: block; font-size: .68rem; font-weight: 700; color: #64748b; margin: 10px 0 5px; }
.qz-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.qz-input:focus { outline: none; box-shadow: var(--pop); }
.qz-choice { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
.qz-radio { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); background: #fff; color: rgba(0,0,0,.45); font-weight: 800; font-size: .82rem; cursor: pointer; }
.qz-radio.on { background: #22c55e; border-color: #22c55e; color: #fff; }
.qz-choice-in { flex: 1; }
.qz-del-choice { flex-shrink: 0; border: none; background: rgba(0,0,0,.05); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; color: #ef4444; }
.qz-del-choice:disabled { opacity: .3; cursor: default; }
.qz-add-choice { margin-top: 2px; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 9px; padding: 7px 12px; font-family: inherit; font-size: .74rem; font-weight: 700; color: #475569; cursor: pointer; }
.qz-add-choice:disabled { opacity: .4; cursor: default; }
.qz-check { display: flex; align-items: center; gap: 8px; font-size: .74rem; color: rgba(0,0,0,.65); margin-top: 12px; cursor: pointer; }
.qz-actions { display: flex; gap: 8px; margin-top: 14px; }
.qz-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.qz-primary { background: var(--primary); color: #fff; box-shadow: var(--pop); }
.qz-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qz-primary:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.qz-gray { background: #fff; color: var(--ink); flex: 0 0 90px; }

.qz-list-head { display: flex; align-items: center; justify-content: space-between; font-weight: 800; font-size: .85rem; margin-bottom: 8px; }
.qz-mini { border: none; border-radius: 8px; padding: 5px 10px; font-family: inherit; font-size: .7rem; font-weight: 700; cursor: pointer; background: rgba(0,0,0,.06); color: rgba(0,0,0,.6); }
.qz-mini.qz-danger { background: rgba(239,68,68,.12); color: #dc2626; }
.qz-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.qz-item { background: #fff; border: 2px solid var(--ink); border-radius: 14px; box-shadow: var(--pop); padding: 12px; }
.qz-item.sel { background: var(--primary-light, #eef2ff); }
.qz-check-item { width: 17px; height: 17px; flex-shrink: 0; accent-color: var(--primary); }
.qz-item-top { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }

/* ── filters / batch ── */
.qz-filters { display: flex; flex-direction: column; gap: 7px; margin-bottom: 10px; }
.qz-search { font-size: .8rem; }
.qz-filter-row { display: flex; gap: 7px; }
.qz-select { flex: 1; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 8px 10px; font-family: inherit; font-size: .78rem; font-weight: 700; background: #fff; color: var(--ink); }
.qz-batch { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.qz-selall { display: flex; align-items: center; gap: 7px; font-size: .74rem; font-weight: 700; color: rgba(0,0,0,.6); cursor: pointer; }
.qz-selall input { width: 16px; height: 16px; accent-color: var(--primary); }
.qz-batch-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; background: #f8fafc; border-radius: 10px; padding: 8px 10px; }
.qz-selcount { font-size: .72rem; font-weight: 800; color: var(--ink); }
.qz-pubfiltered { width: 100%; margin-bottom: 12px; }
.qz-more { width: 100%; margin-top: 10px; }
.qz-badge { font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
.qz-badge.pub { background: rgba(34,197,94,.15); color: #15803d; }
.qz-badge.draft { background: rgba(0,0,0,.07); color: rgba(0,0,0,.5); }
.qz-cat { font-size: .62rem; color: #4f46e5; font-weight: 700; }
.qz-item-actions { margin-left: auto; display: flex; gap: 5px; }
.qz-q { font-size: .85rem; font-weight: 700; color: #1e293b; margin-bottom: 8px; line-height: 1.4; }
.qz-choices { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.qz-choices li { font-size: .76rem; color: rgba(0,0,0,.6); display: flex; gap: 7px; align-items: baseline; padding: 4px 8px; border-radius: 7px; }
.qz-choices li.correct { background: rgba(34,197,94,.1); color: #15803d; font-weight: 700; }
.qz-c-letter { font-weight: 800; flex-shrink: 0; }
.qz-exp { margin-top: 8px; font-size: .72rem; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 7px 10px; line-height: 1.4; }

/* ── ข้อที่ถูกแจ้งว่าผิด (Phase 5) ── */
.qz-reports { background: #fff; border: 2px dashed #f59e0b; border-radius: 16px; padding: 4px 14px; margin-bottom: 16px; }
.qz-reports[open] { padding-bottom: 14px; }
.qz-reports-sum { cursor: pointer; font-weight: 800; font-size: .9rem; padding: 11px 0; list-style: none; user-select: none; color: #b45309; }
.qz-reports-sum::-webkit-details-marker { display: none; }
.qz-reports-sum::before { content: '▸ '; color: #f59e0b; }
.qz-reports[open] .qz-reports-sum::before { content: '▾ '; }
.qz-reports-body { display: flex; flex-direction: column; gap: 10px; }
.qz-report-list { display: flex; flex-direction: column; gap: 10px; }
.qz-report-card { border: 1px solid rgba(0,0,0,.1); border-radius: 12px; padding: 11px; background: #fffdf7; }
.qz-report-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.qz-report-badge { font-size: .6rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(245,158,11,.16); color: #b45309; }
.qz-report-deleted { font-size: .6rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(239,68,68,.12); color: #dc2626; }
.qz-report-q { font-size: .82rem; font-weight: 700; color: #1e293b; margin-bottom: 7px; line-height: 1.4; }
.qz-report-reasons { list-style: none; margin: 0 0 9px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.qz-report-reasons li { font-size: .74rem; color: rgba(0,0,0,.7); line-height: 1.4; }
.qz-report-meta { color: rgba(0,0,0,.4); font-size: .68rem; }
.qz-report-actions { display: flex; gap: 6px; flex-wrap: wrap; }
</style>
