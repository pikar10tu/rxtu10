<!--
  src/views/Cc2LibraryView.vue — คลังเคส CC2 OSPE (route ที่ต้องการ: /study/cc2)
  โหลดรายการผ่าน useCc2Data.js (สัญญา A) · ป้ายซ้อมแล้ว/คะแนนจาก useCc2Progress (สัญญา C)
  กรอง Clinic/Product/SAP + กลุ่ม + ค้นชื่อ/หัวข้อในคลัง · ปุ่มเข้าซ้อม 16 สถานี + ซ้อมคู่กับเพื่อน (ห้อง FABLE)
  กดเคส (ที่ไม่ใช่ rest/free) → ไปหน้าเคสเดี่ยว /study/cc2/:id (เลน FABLE)
-->
<template>
  <div class="tab-content cl-wrap">
    <div class="page-title cl-head">
      <button class="cl-back" type="button" @click="$router.back()">‹ กลับ</button>
      <span><Emoji char="🩺" /> คลังเคส CC2 OSPE</span>
    </div>

    <div v-if="loading" class="cl-empty">กำลังโหลดคลังเคส…</div>
    <div v-else-if="loadError" class="cl-empty">โหลดคลังเคสไม่สำเร็จ · <button class="cl-retry" type="button" @click="load">ลองใหม่</button></div>

    <template v-else>
      <!-- ปุ่มเข้าซ้อม · สุ่ม 1 เคส = ซ้อมสั้นบนมือถือ (user 11 พ.ย. 2026) — สุ่มตามหมวด/กลุ่มที่กรองอยู่ -->
      <button type="button" class="cl-start cl-start-quick" :disabled="!quickPool.length" @click="randomOne">
        <span class="cl-start-ico"><Emoji char="🎲" /></span>
        <span class="cl-start-t"><b>สุ่ม 1 เคส</b><small>{{ cat ? `หมวด ${cat}` : 'ทุกหมวด' }} · นึกขั้นตอนก่อน แล้วเปิดเช็คลิสต์เทียบ</small></span>
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
      <input v-model="q" class="cl-search" type="search" placeholder="ค้นหาชื่อเคส หรือหัวข้อ" aria-label="ค้นหาเคส CC2">

      <!-- แท็บหมวด -->
      <div class="cl-cats" role="tablist">
        <button
          v-for="c in CATS" :key="c.key" type="button" class="cl-cat"
          :class="['cat-' + c.key, { on: cat === c.key }]"
          role="tab" :aria-selected="cat === c.key"
          @click="cat = cat === c.key ? '' : c.key"
        >{{ c.label }} <small>{{ countByCat[c.key] || 0 }}</small></button>
      </div>

      <!-- กรองกลุ่ม -->
      <div v-if="groupOptions.length" class="cl-groups">
        <button
          v-for="g in groupOptions" :key="g" type="button" class="cl-chip" :class="{ on: group === g }"
          @click="group = group === g ? '' : g"
        >{{ g }}</button>
      </div>

      <!-- รายการเคส -->
      <div v-if="!filtered.length" class="cl-empty">ไม่เจอเคสที่ตรงกับตัวกรองนี้</div>
      <div v-else class="cl-list">
        <component
          :is="c.playable ? RouterLink : 'div'"
          v-for="c in filtered" :key="c.id"
          :to="c.playable ? `/study/cc2/${c.id}` : undefined"
          class="cl-item" :class="{ rest: !c.playable }"
        >
          <span class="cl-item-cat" :class="'cat-' + c.cat">{{ c.cat }}</span>
          <span class="cl-item-body">
            <b class="cl-item-t">{{ c.title }}</b>
            <small class="cl-item-sub">{{ [c.group, c.topic].filter(Boolean).join(' · ') || c.source }}</small>
          </span>
          <span v-if="progressOf(c.id)" class="cl-item-score" :class="{ full: isFull(c.id) }">
            {{ progressOf(c.id).got }}/{{ progressOf(c.id).tot }}
          </span>
          <span v-else-if="c.playable" class="cl-item-new">ยังไม่ซ้อม</span>
        </component>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import { loadCc2Index } from '../composables/useCc2Data.js'
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
const cat = ref('')
const group = ref('')

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

const countByCat = computed(() => {
  const m = {}
  for (const c of playableCases.value) m[c.cat] = (m[c.cat] || 0) + 1
  return m
})

// ตัวเลือกกลุ่ม — อิงหมวดที่เลือกอยู่ (ถ้าเลือกหมวดแล้ว) ไม่งั้นรวมทุกหมวด
const groupOptions = computed(() => {
  const pool = cat.value ? playableCases.value.filter((c) => c.cat === cat.value) : playableCases.value
  return [...new Set(pool.map((c) => c.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th'))
})

// สุ่ม 1 เคสจากที่กรองอยู่ (ไม่รวมสถานีพัก/โจทย์ไม่มีเกณฑ์)
const quickPool = computed(() => filtered.value.filter((c) => c.mode === 'check' || c.mode === 'blank'))
function randomOne() {
  const pool = quickPool.value
  if (pool.length) router.push(`/study/cc2/${pool[Math.floor(Math.random() * pool.length)].id}?quick=1`)
}
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  return playableCases.value.filter((c) => {
    if (cat.value && c.cat !== cat.value) return false
    if (group.value && c.group !== group.value) return false
    if (term && !`${c.title} ${c.topic} ${c.group}`.toLowerCase().includes(term)) return false
    return true
  })
})

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

.cl-cats { display: flex; gap: 8px; margin-bottom: 10px; }
.cl-cat { flex: 1; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 8px 6px; font: inherit; font-size: .78rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.cl-cat small { display: block; font-size: .7rem; font-weight: 600; color: var(--muted); margin-top: 1px; }
.cl-cat.on.cat-Clinic { background: var(--primary-light); border-color: var(--primary); color: var(--primary-dark); }
.cl-cat.on.cat-Product { background: var(--mint-light); border-color: var(--mint); color: #1f7a5c; }
.cl-cat.on.cat-SAP { background: var(--accent-light); border-color: var(--accent); color: #b8326a; }

.cl-groups { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.cl-chip { border: 1px solid rgba(0,0,0,.12); background: #fff; border-radius: 999px; padding: 4px 11px; font: inherit; font-size: .72rem; color: var(--muted); cursor: pointer; }
.cl-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; }


.cl-list { display: flex; flex-direction: column; gap: 8px; }
.cl-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border: var(--bw) solid var(--line); border-radius: 14px; background: #fff; text-decoration: none; color: var(--ink); }
.cl-item.rest { opacity: .55; }
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
