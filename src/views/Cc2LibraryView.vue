<!--
  src/views/Cc2LibraryView.vue — คลังเคส CC2 OSPE (route ที่ต้องการ: /study/cc2)
  โหลดรายการผ่าน useCc2Data.js (สัญญา A) · ป้ายซ้อมแล้ว/คะแนนจาก useCc2Progress (สัญญา C)
  หมวด > กลุ่ม > เคส พับได้ (14 พ.ย. 2026) · ค้นหา = ลิสต์แบน หลายคำ/รหัส/ชื่อยาในเนื้อเคส (utils/cc2Search.js + search.json) · ปุ่มเข้าซ้อม 16 สถานี + ซ้อมคู่กับเพื่อน (ห้อง FABLE)
  กดเคส (ที่ไม่ใช่ rest/free) → ไปหน้าเคสเดี่ยว /study/cc2/:id (เลน FABLE)
-->
<template>
  <div class="tab-content cl-wrap">
    <div class="page-title cl-head">
      <button class="cl-back" type="button" @click="$router.push('/study')">‹ กลับ</button>
      <span><Emoji char="🩺" /> คลังเคส CC2 OSPE</span>
    </div>

    <div v-if="loading" class="cl-empty">กำลังโหลดคลังเคส…</div>
    <div v-else-if="loadError" class="cl-empty">โหลดคลังเคสไม่สำเร็จ · <button class="cl-retry" type="button" @click="load">ลองใหม่</button></div>

    <template v-else>
      <!-- ปุ่มเข้าซ้อม · สุ่ม 1 เคส = ซ้อมสั้นบนมือถือ (user 11 พ.ย. 2026) — สุ่มตามหมวด/กลุ่มที่กรองอยู่ -->
      <button type="button" class="cl-start cl-start-quick" :disabled="!quickPool.length" @click="randomOne">
        <span class="cl-start-ico"><Emoji char="🎲" /></span>
        <span class="cl-start-t"><b>สุ่ม 1 เคส</b><small>{{ terms.length ? 'จากผลค้นหา' : 'ทุกหมวด' }} · นึกขั้นตอนก่อน แล้วเปิดเช็คลิสต์เทียบ</small></span>
      </button>
      <div class="cl-start-row">
        <RouterLink to="/study/cc2/sim" class="cl-start cl-start-solo">
          <span class="cl-start-ico"><Emoji char="⏱️" /></span>
          <span class="cl-start-t"><b>ซ้อม 16 สถานี</b><small>สุ่มชุด จับเวลาสถานีละ 4 นาที</small></span>
        </RouterLink>
        <RouterLink to="/study/cc2/room" class="cl-start cl-start-duo">
          <span class="cl-start-ico"><Emoji char="🧑‍🤝‍🧑" /></span>
          <span class="cl-start-t"><b>ซ้อมคู่กับเพื่อน</b><small>คนหนึ่งเป็นผู้ป่วย อีกคนตรวจ</small></span>
        </RouterLink>
      </div>

      <!-- ค้นหา -->
      <input v-model="q" class="cl-search" type="search" placeholder="ค้นชื่อเคส รหัส OS-xxxx หรือชื่อยา (หลายคำได้)" aria-label="ค้นหาเคส CC2" @focus="wantBody">

      <!-- ค้นหาอยู่ → ลิสต์แบน -->
      <template v-if="terms.length">
        <div class="cl-found">เจอ {{ found.length }} เคส<span v-if="bodyLoading"> · กำลังค้นในเนื้อเคส…</span></div>
        <div v-if="!found.length" class="cl-empty">ไม่เจอเคสที่ตรงกับคำค้น</div>
        <div v-else class="cl-list">
          <RouterLink v-for="c in found" :key="c.id" :to="`/study/cc2/${c.id}`" class="cl-item">
            <span class="cl-item-cat" :class="'cat-' + c.cat">{{ c.cat }}</span>
            <span class="cl-item-body">
              <b class="cl-item-t"><span class="cl-id">{{ c.id }}</span>{{ c.title }}</b>
              <small class="cl-item-sub">{{ [c.group, c.topic].filter(Boolean).join(' · ') || c.source }}</small>
            </span>
            <span v-if="progressOf(c.id)" class="cl-item-score" :class="{ full: isFull(c.id) }">{{ progressOf(c.id).got }}/{{ progressOf(c.id).tot }}</span>
            <span v-else class="cl-item-new">ยังไม่ซ้อม</span>
          </RouterLink>
        </div>
      </template>

      <!-- หมวด > กลุ่ม > เคส พับได้ -->
      <div v-else class="cl-tree">
        <details v-for="cg in tree" :key="cg.cat" class="cl-catbox" :class="'cat-' + cg.cat">
          <summary class="cl-cat-h">
            <span class="cl-item-cat" :class="'cat-' + cg.cat">{{ cg.cat }}</span>
            <span class="cl-cat-n">{{ cg.n }} เคส · ซ้อมแล้ว {{ cg.done }}</span>
          </summary>
          <details v-for="g in cg.groups" :key="g.name" class="cl-grp">
            <summary class="cl-grp-h"><span>{{ g.name }}</span><small>{{ g.done }}/{{ g.cases.length }}</small></summary>
            <div class="cl-list">
              <RouterLink v-for="c in g.cases" :key="c.id" :to="`/study/cc2/${c.id}`" class="cl-item">
                <span class="cl-item-body">
                  <b class="cl-item-t"><span class="cl-id">{{ c.id }}</span>{{ c.title }}</b>
                  <small v-if="c.topic && c.topic !== '-'" class="cl-item-sub">{{ c.topic }}</small>
                </span>
                <span v-if="progressOf(c.id)" class="cl-item-score" :class="{ full: isFull(c.id) }">{{ progressOf(c.id).got }}/{{ progressOf(c.id).tot }}</span>
                <span v-else class="cl-item-new">ยังไม่ซ้อม</span>
              </RouterLink>
            </div>
          </details>
        </details>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import { loadCc2Index, loadCc2Search } from '../composables/useCc2Data.js'
import { searchTerms, matchCase } from '../utils/cc2Search.js'
import { useCc2Progress } from '../composables/useCc2Progress.js'

const router = useRouter()

const CATS = [
  { key: 'Clinic', label: 'Clinic' },
  { key: 'Product', label: 'Product' },
  { key: 'SAP', label: 'SAP' },
]

const cases = ref([])
const loading = ref(true)
const loadError = ref(false)
const q = ref('')

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const idx = await loadCc2Index()
    cases.value = idx?.cases || []
  } catch (e) {
    console.error('[Cc2LibraryView] โหลดคลังเคสไม่สำเร็จ', e)
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

// เคส rest/free เป็นสถานีว่าง/ต่อเนื่อง ไม่มีหน้าของตัวเองให้กดเข้า (ดูสัญญา A หมายเหตุ mode)
const playableCases = computed(() => cases.value
  .filter((c) => c.mode !== 'rest' && c.mode !== 'free')
  .map((c) => ({ ...c, playable: true })))

// หมวด > กลุ่ม (เรียงตามชื่อไทย · ไม่มีกลุ่ม = "อื่นๆ" ไว้ท้าย) · เคสเรียงตามรหัส
const tree = computed(() => CATS.map(({ key }) => {
  const by = new Map()
  for (const c of playableCases.value) {
    if (c.cat !== key) continue
    const g = c.group || 'อื่นๆ'
    if (!by.has(g)) by.set(g, [])
    by.get(g).push(c)
  }
  const groups = [...by].map(([name, cases]) => ({ name, cases, done: cases.filter(c => progressOf(c.id)).length }))
    .sort((a, b) => (a.name === 'อื่นๆ') - (b.name === 'อื่นๆ') || a.name.localeCompare(b.name, 'th'))
  return { cat: key, groups, n: groups.reduce((a, g) => a + g.cases.length, 0), done: groups.reduce((a, g) => a + g.done, 0) }
}).filter(cg => cg.n))

// ── ค้นหา ── เนื้อเคสโหลดตอนแตะช่องค้นครั้งแรก (ระหว่างรอ ค้นจากชื่อ/หัวข้อ/รหัสไปก่อน)
const bodies = ref({}), bodyLoading = ref(false)
function wantBody() {
  if (bodyLoading.value || Object.keys(bodies.value).length) return
  bodyLoading.value = true
  loadCc2Search().then(b => { bodies.value = b || {} }).catch(() => {}).finally(() => { bodyLoading.value = false })
}
const terms = computed(() => searchTerms(q.value))
const found = computed(() => playableCases.value.filter(c => matchCase(c, terms.value, bodies.value[c.id] || '')))

// สุ่ม 1 เคส (ไม่รวมสถานีพัก/โจทย์ไม่มีเกณฑ์) — ค้นอยู่ = สุ่มจากผลค้น
const quickPool = computed(() => (terms.value.length ? found.value : playableCases.value).filter((c) => c.mode === 'check' || c.mode === 'blank'))
function randomOne() {
  const pool = quickPool.value
  if (pool.length) router.push(`/study/cc2/${pool[Math.floor(Math.random() * pool.length)].id}?quick=1`)
}

// CC2 = self-learning ล้วน (user เคาะ 11 พ.ย. 2026) — useCc2Progress ไม่มี summary/radar แล้ว
// เหลือแค่ progress ต่อเคส (ป้ายซ้อมแล้ว + คะแนนล่าสุด) ให้เจ้าของดูเอง
const { progress } = useCc2Progress()
const progressOf = (id) => progress.value?.[id] || null
const isFull = (id) => { const p = progressOf(id); return !!p && p.got >= p.tot }
</script>

<style scoped>
.cl-start-quick { width: 100%; margin-bottom: 8px; font: inherit; text-align: left; cursor: pointer; background: linear-gradient(135deg, var(--accent-light), var(--primary-light)); }
.cl-start-quick:disabled { opacity: .5; cursor: default; }
.cl-head { display: flex; align-items: center; gap: 10px; }
.cl-back { all: unset; cursor: pointer; font-size: 1.3rem; line-height: 1; color: var(--ink); padding: 0 4px 2px 0; }
.cl-empty { text-align: center; color: var(--muted); font-size: .84rem; padding: 30px 10px; }
.cl-retry { border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 6px 12px; font: inherit; font-size: .78rem; cursor: pointer; }

.cl-start-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.cl-start { display: flex; flex-direction: column; gap: 8px; padding: 14px 12px; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); text-decoration: none; color: var(--ink); transition: transform .12s, box-shadow .12s; }
.cl-start:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }
.cl-start-solo { background: var(--primary-light); }
.cl-start-duo { background: var(--mint-light); }
.cl-start.cl-start-quick { flex-direction: row; align-items: center; gap: 12px; }
.cl-start-ico { font-size: 1.6rem; }
.cl-start-t { display: flex; flex-direction: column; gap: 2px; }
.cl-start-t b { font-size: .86rem; }
.cl-start-t small { font-size: .7rem; color: var(--muted); line-height: 1.35; }

.cl-search { width: 100%; box-sizing: border-box; padding: 10px 14px; border: var(--bw) solid var(--line); border-radius: 14px; font: inherit; font-size: .86rem; background: #fff; margin-bottom: 10px; }



.cl-found { font-size: .76rem; color: var(--muted); margin: 0 2px 8px; }
.cl-tree { display: flex; flex-direction: column; gap: 10px; }
.cl-catbox { border: var(--bw) solid var(--line); border-radius: 16px; background: #fff; padding: 4px 10px; }
.cl-catbox[open] { padding-bottom: 10px; }
.cl-cat-h, .cl-grp-h { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.cl-cat-h::-webkit-details-marker, .cl-grp-h::-webkit-details-marker { display: none; }
.cl-cat-h { padding: 10px 2px; font-weight: 800; }
.cl-cat-h::after, .cl-grp-h::after { content: '›'; margin-left: auto; font-size: 1.1rem; color: var(--muted); transition: transform .15s; }
details[open] > .cl-cat-h::after, details[open] > .cl-grp-h::after { transform: rotate(90deg); }
.cl-cat-h .cl-item-cat { font-size: .78rem; padding: 3px 9px; }
.cl-cat-n { font-size: .76rem; color: var(--muted); font-weight: 600; }
.cl-grp { border-top: 1px dashed var(--line); }
.cl-grp-h { padding: 9px 2px; font-size: .82rem; font-weight: 700; }
.cl-grp-h small { font-size: .7rem; color: var(--muted); font-weight: 600; }
.cl-grp-h small { margin-left: auto; }
.cl-grp-h::after { margin-left: 4px; }
.cl-grp .cl-list { padding-bottom: 8px; }
.cl-id { font-size: .7rem; font-weight: 700; color: var(--muted); margin-right: 6px; }
.cl-list { display: flex; flex-direction: column; gap: 8px; }
.cl-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border: var(--bw) solid var(--line); border-radius: 14px; background: #fff; text-decoration: none; color: var(--ink); }
.cl-item-cat { flex-shrink: 0; font-size: .7rem; font-weight: 800; padding: 2px 7px; border-radius: 8px; color: #fff; }
.cl-item-cat.cat-Clinic { background: var(--primary); }
.cl-item-cat.cat-Product { background: var(--mint); }
.cl-item-cat.cat-SAP { background: var(--accent); }
.cl-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cl-item-t { font-size: .84rem; line-height: 1.3; }
.cl-item-sub { font-size: .7rem; color: var(--muted); line-height: 1.3; }
.cl-item-score { flex-shrink: 0; font-size: .74rem; font-weight: 800; color: var(--primary-dark); background: var(--primary-light); border-radius: 8px; padding: 3px 8px; }
.cl-item-score.full { color: #1f7a5c; background: var(--mint-light); }
.cl-item-new { flex-shrink: 0; font-size: .7rem; color: var(--muted); }
</style>
