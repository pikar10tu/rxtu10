<!-- src/views/DrugDbView.vue — ฐานข้อมูลยา (17 ต.ค. 2026)
     ข้อมูลยาภาษาไทย จากฐานข้อมูล DailyMed (US FDA) · ข้อมูล data/drugDb.json สร้างจาก D:\RXTU\drugdb
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
        <div class="dd-chips"><span v-for="c in drug.chips" :key="c">{{ c }}</span></div>
      </header>
      <div v-if="drug.bw" class="dd-bw"><b>{{ drug.bwTitle || 'BOXED WARNING' }}</b><span v-html="drug.bw" /></div>

      <section>
        <h4>ข้อบ่งใช้และขนาดยา</h4>
        <div class="dd-tbl"><table>
          <tr><th>ข้อบ่งใช้</th><th>ขนาดยา</th></tr>
          <tr v-for="r in drug.ind" :key="r[0]"><td v-html="r[0]" /><td v-html="r[1]" /></tr>
        </table></div>
        <ul><li v-for="x in drug.doseNotes" :key="x" v-html="x" /></ul>
      </section>
      <div class="dd-organ"><b>ไต</b> · <span v-html="drug.renal" /><br><b>ตับ</b> · <span v-html="drug.hepatic" /></div>

      <section>
        <h4>กลไกการออกฤทธิ์และเภสัชจลนศาสตร์</h4>
        <p v-html="drug.moa" />
        <div class="dd-tbl"><table><tr v-for="r in drug.pk" :key="r[0]"><td>{{ r[0] }}</td><td v-html="r[1]" /></tr></table></div>
      </section>
      <section v-for="s in LIST_SECTIONS" :key="s.k">
        <h4>{{ s.t }}</h4>
        <ul><li v-for="x in drug[s.k]" :key="x" v-html="x" /></ul>
      </section>

      <footer class="dd-src">
        ที่มา: {{ drug.src.lab }} · ฉลากฉบับ {{ drug.src.date }}<b v-if="drug.src.old"> · {{ drug.src.old }}</b><br>
        <a :href="`https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${drug.src.set}`" target="_blank" rel="noopener">อ่านเอกสารกำกับยาฉบับเต็ม (DailyMed)</a>
        · ใช้เพื่อการเรียน ไม่ใช่แทนการตัดสินใจทางคลินิก
      </footer>
    </article>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import DRUG_DB from '../data/drugDb.json'
import { useAuthStore } from '../stores/auth.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { isFeatureOpen } from '../utils/featureFlags.js'

const router = useRouter()
const authStore = useAuthStore()
const { rawConfig } = useAppConfig()
// กันซ้ำในหน้า — router guard ปล่อยผ่านตอน config ยังไม่โหลด (refresh ค้างหน้านี้)
const open = computed(() => isFeatureOpen(rawConfig.value, 'drugDbOpen', { isAdmin: authStore.isAdmin }))

const LIST_SECTIONS = [
  { k: 'mon', t: 'Monitoring' }, { k: 'ci', t: 'ข้อห้ามใช้' }, { k: 'warn', t: 'คำเตือน' },
  { k: 'ae', t: 'อาการไม่พึงประสงค์' }, { k: 'ddi', t: 'อันตรกิริยา' }, { k: 'pop', t: 'กลุ่มประชากรพิเศษ' },
  { k: 'od', t: 'ยาเกินขนาด' }, { k: 'cou', t: 'Counseling' },
]

const q = ref('')
const selId = ref(null)
const drug = computed(() => DRUG_DB.find(d => d.id === selId.value) || null)
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
.dd-organ { background: #fff6e0; border-left: 3px solid #d08a16; border-radius: 0 8px 8px 0; padding: 8px 10px; font-size: .82rem; }
.dd-src { border-top: 1px solid var(--line); padding-top: 10px; font-size: .74rem; color: var(--muted); }
.dd-src a { color: var(--primary); }
</style>
