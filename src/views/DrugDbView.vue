<!-- src/views/DrugDbView.vue — ฐานข้อมูลยา (17 ต.ค. 2026)
     ข้อมูลยาภาษาไทย หลายแหล่ง (FDA · NLEM · guideline · LactMed) · ข้อมูล data/drugDb.json สร้างจาก D:\RXTU\drugdb
     8 พ.ย. 2026 การ์ดแบบใหม่: บน = จุดออกสอบ · กดขยาย = ข้อมูลเต็ม · ทุกบรรทัดมีป้ายอ้างอิง (schema ดู utils/drugCard.js)
     ปิดด้วย flag drugDbOpen — ตอนนี้แอดมินเห็นคนเดียว · ข้อความในการ์ดมี <b> ของเราเอง (v-html ปลอดภัย ไม่มี input ผู้ใช้) -->
<template>
  <div class="tab-content dd-wrap">
    <div class="page-title dd-head">
      <button class="dd-back" @click="back">‹ กลับ</button>
      <span><Emoji char="💊" /> ฐานข้อมูลยา</span>
    </div>

    <div v-if="!open" class="dd-card dd-empty">ฐานข้อมูลยายังไม่เปิดให้ใช้ เร็วๆ นี้</div>

    <template v-else-if="!drug">
      <div class="dd-note">ยังไม่เปิดให้ทั้งรุ่น (แอดมินเห็นคนเดียว) · {{ DRUG_DB.length }} ตัว</div>
      <input v-model="q" class="dd-search" type="search" placeholder="ค้นหาชื่อยา หรือกลุ่มยา" aria-label="ค้นหายา">
      <div v-for="g in groups" :key="g.name" class="dd-group">
        <h3>{{ g.name }}</h3>
        <button v-for="d in g.items" :key="d.id" type="button" class="dd-row" @click="pick(d.id)">
          <b>{{ d.name }}</b><small>{{ d.cls }}</small>
        </button>
      </div>
      <div v-if="!groups.length" class="dd-empty">ไม่เจอ "{{ q.trim() }}"</div>
    </template>

    <article v-else class="dd-card dd-drug">
      <header>
        <h2>{{ drug.name }}</h2>
        <div class="dd-cls">{{ drug.cls }}</div>
        <div class="dd-chips">
          <span v-if="drug.nlem" class="dd-nlem">NLEM 2569 · {{ drug.nlem }}<a v-if="nlemRef" class="dd-ref" :href="nlemRef.url" target="_blank" rel="noopener" :title="nlemRef.title">[{{ nlemRef.n }}]</a></span>
          <span v-for="c in drug.chips" :key="c">{{ c }}</span>
        </div>
      </header>
      <p v-if="drug.nlemCond" class="dd-cond"><b>เงื่อนไขบัญชียาหลัก</b> · {{ L(drug.nlemCond).t }}<RefChips :refs="L(drug.nlemCond).refs" /></p>
      <p v-if="L(drug.moa)" class="dd-moa"><b>กลไก</b> · <span v-html="L(drug.moa).t" /><RefChips :refs="L(drug.moa).refs" /></p>
      <div v-if="drug.bw" class="dd-bw"><b>{{ drug.bwTitle || 'BOXED WARNING' }}</b><span v-html="L(drug.bw).t" /><RefChips :refs="L(drug.bw).refs" /></div>

      <div v-if="drug.exam?.length" class="dd-exam">
        <h4><Emoji char="🎯" /> จุดที่ออกสอบบ่อย</h4>
        <ul><li v-for="(x, i) in drug.exam" :key="i"><span v-html="L(x).t" /><RefChips :refs="L(x).refs" /></li></ul>
      </div>

      <div class="dd-more">
        <details>
          <summary>ข้อบ่งใช้และขนาดยา</summary>
          <div class="dd-sec">
            <div class="dd-tbl"><table>
              <tr><th>ข้อบ่งใช้</th><th>ขนาดยา</th></tr>
              <tr v-for="(r, i) in indRows" :key="i"><td v-html="r.i" /><td><span v-html="r.d" /><RefChips :refs="r.refs" /></td></tr>
            </table></div>
            <ul v-if="drug.doseNotes?.length"><li v-for="(x, i) in drug.doseNotes" :key="i"><span v-html="L(x).t" /><RefChips :refs="L(x).refs" /></li></ul>
          </div>
        </details>
        <details v-if="drug.renal || drug.hepatic">
          <summary>ผู้ป่วยไตเสื่อม / ตับเสื่อม</summary>
          <div class="dd-sec">
            <p v-if="drug.renal"><b>ไต</b> · <span v-html="L(drug.renal).t" /><RefChips :refs="L(drug.renal).refs" /></p>
            <p v-if="drug.hepatic"><b>ตับ</b> · <span v-html="L(drug.hepatic).t" /><RefChips :refs="L(drug.hepatic).refs" /></p>
          </div>
        </details>
        <details v-for="s in sections" :key="s.k">
          <summary>{{ s.t }}</summary>
          <div class="dd-sec"><ul><li v-for="(x, i) in drug[s.k]" :key="i"><span v-html="L(x).t" /><RefChips :refs="L(x).refs" /></li></ul></div>
        </details>
        <details v-if="pkRows.length">
          <summary>เภสัชจลนศาสตร์</summary>
          <div class="dd-sec"><div class="dd-tbl"><table>
            <tr v-for="r in pkRows" :key="r.k"><td>{{ r.k }}</td><td><span v-html="r.v" /><RefChips :refs="r.refs" /></td></tr>
          </table></div></div>
        </details>
        <details open>
          <summary><Emoji char="📚" /> แหล่งอ้างอิง</summary>
          <ol class="dd-reflist">
            <li v-for="(r, i) in refs" :key="r.id"><span class="dd-n">[{{ i + 1 }}]</span><span><a :href="r.url" target="_blank" rel="noopener">{{ r.title }}</a><small v-if="r.src">{{ r.src }}</small></span></li>
          </ol>
        </details>
      </div>
      <footer class="dd-src">ใช้เพื่อการเรียน ไม่ใช่แทนการตัดสินใจทางคลินิก · กดเลขในวงเล็บเพื่อเปิดเอกสารต้นฉบับ</footer>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import DRUG_DB from '../data/drugDb.json'
import { useAuthStore } from '../stores/auth.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { isFeatureOpen } from '../utils/featureFlags.js'
import { LIST_SECTIONS, cardRefs, resolveLine, resolveIndRow, resolvePkRow } from '../utils/drugCard.js'

// ป้ายอ้างอิง [n §หัวข้อ] กดเปิดเอกสารต้นฉบับในแท็บใหม่
const RefChips = (props) => props.refs?.length
  ? props.refs.map(r => h('a', { class: 'dd-ref', href: r.url, target: '_blank', rel: 'noopener', title: r.title }, `[${r.label}]`))
  : null
RefChips.props = ['refs']

const router = useRouter()
const authStore = useAuthStore()
const { rawConfig } = useAppConfig()
// กันซ้ำในหน้า — router guard ปล่อยผ่านตอน config ยังไม่โหลด (refresh ค้างหน้านี้)
const open = computed(() => isFeatureOpen(rawConfig.value, 'drugDbOpen', { isAdmin: authStore.isAdmin }))


const q = ref('')
const selId = ref(null)
const drug = computed(() => DRUG_DB.find(d => d.id === selId.value) || null)
const refs = computed(() => cardRefs(drug.value))
const L = (line) => resolveLine(line, refs.value)
const indRows = computed(() => (drug.value?.ind || []).map(r => resolveIndRow(r, refs.value)))
const pkRows = computed(() => (drug.value?.pk || []).map(r => resolvePkRow(r, refs.value)))
const sections = computed(() => LIST_SECTIONS.filter(s => drug.value?.[s.k]?.length))
const nlemRef = computed(() => { const i = refs.value.findIndex(r => r.id === 'nlem'); return i < 0 ? null : { ...refs.value[i], n: i + 1 } })
const groups = computed(() => {
  const term = q.value.trim().toLowerCase()
  const m = new Map()
  for (const d of DRUG_DB) {
    if (term && !`${d.name} ${d.cls} ${d.group}`.toLowerCase().includes(term)) continue
    if (!m.has(d.group)) m.set(d.group, [])
    m.get(d.group).push(d)
  }
  return [...m].map(([name, items]) => ({ name, items }))
})
function pick(id) { selId.value = id; document.getElementById('main-content')?.scrollTo?.(0, 0) }
function back() { if (selId.value) selId.value = null; else router.push('/study') }
</script>

<style scoped>
.dd-head { display: flex; align-items: center; gap: 10px; }
.dd-back { all: unset; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 4px; }
.dd-back:focus-visible, .dd-row:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.dd-note { font-size: .78rem; color: var(--muted); margin-bottom: 8px; }
.dd-search { width: 100%; box-sizing: border-box; padding: 10px 12px; border: var(--bw) solid var(--line); border-radius: 12px; font: inherit; margin-bottom: 12px; }
.dd-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.dd-group h3 { margin: 0; font-size: .86rem; color: var(--muted); }
.dd-row { display: flex; flex-direction: column; gap: 1px; text-align: left; padding: 10px 12px; background: #fff; border: var(--bw) solid var(--line); border-radius: 12px; font: inherit; color: var(--ink); cursor: pointer; }
.dd-row small { font-size: .74rem; color: var(--muted); }
.dd-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); padding: 16px 14px; }
.dd-empty { text-align: center; color: var(--muted); font-size: .86rem; padding: 18px; }
.dd-drug { display: flex; flex-direction: column; gap: 16px; font-size: .88rem; line-height: 1.6; }
.dd-drug h2 { margin: 0; font-size: 1.3rem; }
.dd-cls { color: var(--muted); font-size: .8rem; }
.dd-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.dd-chips span { font-size: .7rem; padding: 1px 8px; border-radius: 6px; background: var(--primary-light); }
.dd-bw { background: #fde8e6; color: #9b231a; border-radius: 10px; padding: 9px 12px; font-size: .82rem; }
.dd-bw b { display: block; font-size: .7rem; letter-spacing: .04em; }
.dd-drug h4 { margin: 0 0 6px; font-size: .74rem; letter-spacing: .06em; text-transform: uppercase; color: var(--primary); }
.dd-drug ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; }
.dd-drug p { margin: 0 0 6px; }
.dd-tbl { overflow-x: auto; margin-bottom: 6px; }
.dd-tbl table { border-collapse: collapse; width: 100%; font-size: .82rem; }
.dd-tbl th, .dd-tbl td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--line); }
.dd-tbl th { font-size: .72rem; color: var(--muted); }
.dd-nlem { background: var(--mint) !important; font-weight: 700; }
.dd-moa, .dd-cond { margin: 0; }
.dd-cond { font-size: .8rem; color: var(--muted); }
.dd-exam { background: #f1eafb; border-radius: 12px; padding: 10px 12px; }
.dd-exam h4 { color: #6b3fb0 !important; }
.dd-ref { font-size: .7rem; font-weight: 700; color: var(--primary); text-decoration: none; background: var(--primary-light); border-radius: 5px; padding: 0 4px; margin-left: 4px; white-space: nowrap; }
.dd-ref:focus-visible { outline: 2px solid var(--primary); }
.dd-more details { border-top: 1px solid var(--line); }
.dd-more details:last-child { border-bottom: 1px solid var(--line); }
.dd-more summary { cursor: pointer; padding: 11px 2px; font-weight: 700; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.dd-more summary::-webkit-details-marker { display: none; }
.dd-more summary::after { content: '+'; color: var(--muted); font-weight: 400; }
.dd-more details[open] > summary::after { content: '−'; }
.dd-sec { padding: 0 2px 12px; display: flex; flex-direction: column; gap: 6px; }
.dd-sec p { margin: 0; }
.dd-reflist { list-style: none; margin: 0; padding: 0 2px 12px; display: flex; flex-direction: column; gap: 8px; font-size: .8rem; }
.dd-reflist li { display: grid; grid-template-columns: 30px 1fr; gap: 4px; }
.dd-reflist a { color: var(--ink); }
.dd-reflist small { display: block; color: var(--muted); font-size: .72rem; }
.dd-n { color: var(--primary); font-weight: 700; }
.dd-src { border-top: 1px solid var(--line); padding-top: 10px; font-size: .74rem; color: var(--muted); }
</style>
