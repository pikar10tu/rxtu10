<!-- src/components/cc2/Cc2CaseBody.vue — เนื้อเคส CC2 OSPE แสดงตามบทบาท (สัญญา B · 11 พ.ย. 2026)
     role: solo = เห็นทุกอย่าง (ประเมินตัวเอง) · examiner = เห็นทุกอย่าง + ปุ่ม "ส่งข้อมูล" ส่วนที่ gated
           examinee = เห็นแค่สถานการณ์ + ส่วนที่ไม่ gated + ส่วนที่ผู้ประเมินส่งแล้ว (revealed) · ไม่เห็นเช็คลิสต์/เฉลย/บทผู้ป่วยจำลอง/ชิปยา
     HTML ของเคสกรองแล้วตอน build (scripts/cc2/build-cc2.mjs) → v-html ได้ · คำตอบที่ผู้ใช้พิมพ์แสดงผ่าน {{ }} เท่านั้น
     ส่วนที่ผู้สอบห้ามเห็น แยกด้วย caseSections()/splitExaminerOnly() ใน utils/cc2Case.js (มีเทส) -->
<template>
  <div class="ccb">
    <div class="ccb-meta">
      <span class="ccb-cat" :class="caseData.cat">{{ caseData.cat }}</span>
      <span v-if="caseData.group" class="ccb-grp">{{ caseData.group }}</span>
      <span v-if="caseData.topic && role !== 'examinee'" class="ccb-topic">{{ caseData.topic }}</span>
      <span v-if="caseData.durationMin" class="ccb-tag"><Emoji char="⏱️" /> {{ caseData.durationMin }} นาที</span>
      <span v-if="tot > 0" class="ccb-tag">เต็ม {{ fmt(tot) }} คะแนน</span>
      <span v-if="caseData.source" class="ccb-src">{{ caseData.source }}</span>
    </div>

    <!-- สถานีพัก / โจทย์ไม่มีเกณฑ์ -->
    <section v-if="caseData.rest" class="ccb-card ccb-rest">
      <Emoji char="☕" /> <b>สถานีพัก</b> — นั่งพัก หายใจลึกๆ แล้วไปสถานีถัดไป
    </section>
    <section v-else-if="caseData.noScore" class="ccb-card ccb-hint">โจทย์นี้ให้ฝึกทำ ยังไม่มีเกณฑ์คะแนน</section>

    <!-- สถานการณ์ -->
    <section v-if="scenarioHtml" class="ccb-card">
      <h3><Emoji char="📋" /> สถานการณ์</h3>
      <div class="ccb-html" v-html="scenarioShown" />
    </section>

    <!-- ข้อมูลผู้ป่วย (แยกเป็นชิ้นตามที่ผู้ประเมินส่ง) -->
    <template v-for="p in sections.patient" :key="p.key">
      <section v-if="canSee(p)" class="ccb-card" :class="{ gated: p.gated }">
        <h3>
          <Emoji char="🧑‍⚕️" /> {{ sections.patient.length > 1 ? p.label : 'ข้อมูลผู้ป่วย' }}
          <GateBadge v-if="p.gated" :part="p" />
        </h3>
        <div v-if="p.html" class="ccb-html" v-html="p.html" />
        <div v-if="showKey && p.examinerHtml" class="ccb-secret">
          <div class="ccb-secret-h"><Emoji char="🤫" /> บทผู้ป่วยจำลอง — ผู้ประเมินอ่านคนเดียว</div>
          <div class="ccb-html" v-html="p.examinerHtml" />
        </div>
      </section>
    </template>

    <!-- ของในสถานี / รายการยา -->
    <section v-if="sections.equipment && canSee(sections.equipment)" class="ccb-card" :class="{ gated: sections.equipment.gated }">
      <h3><Emoji char="🧰" /> ของในสถานี <GateBadge v-if="sections.equipment.gated" :part="sections.equipment" /></h3>
      <div class="ccb-html" v-html="paired ? stripImgs(sections.equipment.html) : sections.equipment.html" />
    </section>

    <!-- ห้องคู่: รูปในสถานการณ์/ของในสถานี แยกออกมา · ผู้สอบไม่รู้ว่ามีรูปจนผู้ประเมินส่ง (user 13 พ.ย.) -->
    <section v-if="paired && shownImgs.length" class="ccb-card" :class="{ gated: role === 'examiner' }">
      <h3><Emoji char="🖼️" /> {{ role === 'examiner' ? 'รูปในเคส — ส่งเมื่อผู้สอบถามถึง' : 'รูปที่ผู้ประเมินส่งมา' }}</h3>
      <div v-for="im in shownImgs" :key="im.key" class="ccb-img">
        <div class="ccb-html" v-html="im.html" />
        <GateBadge v-if="role === 'examiner'" :part="im" />
      </div>
    </section>

    <!-- ผู้สอบ: ส่วนที่ยังรอผู้ประเมินส่ง -->
    <section v-if="role === 'examinee' && pendingCount" class="ccb-card ccb-wait">
      <Emoji char="📨" /> ผู้ประเมินจะส่งข้อมูลเพิ่มให้ระหว่างสอบ (อีก {{ pendingCount }} ส่วน) — ซักถามให้ครบแล้วรอรับนะ
    </section>

    <!-- ชิปยา -->
    <div v-if="showDrugs && drugs.length" class="ccb-drugs">
      <span class="ccb-drugs-l"><Emoji char="💊" /> ยาในเคส</span>
      <button v-for="d in drugs" :key="d.id" type="button" class="ccb-chip" @click="emit('open-drug', d.id)">{{ d.name }}</button>
    </div>

    <!-- ช่องเติมคำ -->
    <section v-if="blanks.length" class="ccb-card">
      <h3><Emoji char="✍️" /> ช่องเติมคำ <small>({{ blanks.length }} ช่อง)</small></h3>
      <div v-for="b in blanks" :key="b.i" class="ccb-blank-row" :class="blankClass(b)">
        <label :for="`ccb-b-${uidKey}-${b.i}`">{{ b.label }} <small>· {{ fmt(b.score) }} คะแนน</small></label>
        <input v-if="role !== 'examiner'" :id="`ccb-b-${uidKey}-${b.i}`" type="text" autocomplete="off" :readonly="readonly"
               :value="answers[b.i] || ''" placeholder="พิมพ์คำตอบ" maxlength="80" @input="setAnswer(b.i, $event.target.value)">
        <div v-else class="ccb-blank-ans">ผู้สอบตอบ: <b>{{ answers[b.i]?.trim() || '—' }}</b></div>
        <div v-if="showBlankKey" class="ccb-blank-key">
          <span>{{ checkBlank(b, answers[b.i]) ? '✓ ถูก' : '✗ ยังไม่ถูก' }}</span> · เฉลย: {{ b.answers.join(' / ') }}
        </div>
      </div>
    </section>

    <!-- โหมดนึกก่อน (ซ้อมในใจ/เขียนกระดาษ แล้วค่อยเปิดเช็คลิสต์ — user 11 พ.ย. 2026) -->
    <section v-if="isStaff && hidden" class="ccb-card ccb-recall">
      <h3><Emoji char="🧠" /> ลองนึกก่อนเปิดเช็คลิสต์</h3>
      <p>พูดหรือเขียนขั้นตอนที่จะทำในสถานีนี้ออกมาก่อน (ใช้กระดาษก็ได้) แล้วค่อยเปิดเช็คลิสต์มาติ๊กเทียบ</p>
      <button type="button" class="ccb-recall-btn" @click="opened = true">เปิดเช็คลิสต์ / เฉลย</button>
    </section>

    <!-- เช็คลิสต์ (ผู้ประเมิน / เดี่ยว) -->
    <section v-if="showKey && groups.length" class="ccb-card ccb-check">
      <h3>
        <Emoji char="✅" /> เช็คลิสต์
        <span class="ccb-score">{{ fmt(score.got) }}<small>/{{ fmt(score.tot) }}</small></span>
      </h3>
      <div class="ccb-bar"><i :style="{ width: pct + '%' }" /></div>
      <div v-for="g in groups" :key="g.name" class="ccb-group">
        <div class="ccb-group-h"><span>{{ g.name || 'รายการ' }}</span><small>{{ fmt(g.got) }}/{{ fmt(g.tot) }}</small></div>
        <label v-for="it in g.items" :key="it.i" class="ccb-item" :class="{ on: !!checks[it.i], sub: it.sub, ro: readonly }">
          <input type="checkbox" :checked="!!checks[it.i]" :disabled="readonly" @change="toggle(it.i)">
          <span class="ccb-item-t">
            <span v-if="it.html" v-html="it.html" /><span v-else>{{ it.t }}</span>
            <span v-if="it.img" class="ccb-item-img" v-html="it.img" />
          </span>
          <span class="ccb-item-s">{{ fmt(it.s) }}</span>
        </label>
      </div>
    </section>

    <!-- บันทึกผู้ประเมิน / เฉลย -->
    <details v-if="showKey && caseData.noteHtml" class="ccb-card ccb-note" :open="role === 'examiner'">
      <summary><Emoji char="📝" /> บันทึกผู้ประเมิน / เฉลย</summary>
      <div class="ccb-html" v-html="caseData.noteHtml" />
    </details>
  </div>
</template>

<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { caseSections, blankPlaceholders, parseBlanks, checkBlank, scoreCase } from '../../utils/cc2Case.js'
import { loadDrugLinks } from '../../composables/useCc2Data.js'
import { loadSearchIndex } from '../../composables/useGlobalSearch.js'

const props = defineProps({
  caseData: { type: Object, required: true },
  role: { type: String, default: 'solo' },            // 'solo' | 'examinee' | 'examiner'
  revealed: { type: Array, default: () => [] },       // key ที่ผู้ประเมินส่งแล้ว
  checks: { type: Object, default: () => ({}) },      // v-model:checks {[index]: bool}
  answers: { type: Object, default: () => ({}) },     // v-model:answers {[blankIndex]: string}
  readonly: { type: Boolean, default: false },
  recall: { type: Boolean, default: false },          // solo: ซ่อนเช็คลิสต์/เฉลย/ชิปยาจนกดเปิด
})
const emit = defineEmits(['update:checks', 'update:answers', 'reveal', 'open-drug', 'recall-hidden'])

const uidKey = Math.random().toString(36).slice(2, 7)   // กัน id ซ้ำเมื่อมี body สองตัวในหน้าเดียว
const isStaff = computed(() => props.role !== 'examinee')
const opened = ref(false)
watch(() => props.caseData, () => { opened.value = false })
const hidden = computed(() => props.recall && props.role === 'solo' && !opened.value && !props.readonly)
watch(hidden, v => emit('recall-hidden', v), { immediate: true })
const showKey = computed(() => isStaff.value && !hidden.value)   // เช็คลิสต์ / เฉลย / บท SP
const fmt = n => (Number.isInteger(n) ? String(n) : (+n).toFixed(2).replace(/0$/, ''))

// ── สถานการณ์: contentHtml (ซ่อนเฉลยใน [BLANK]) · ไม่มี → scenario ข้อความล้วน escape เอง ──
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
const scenarioHtml = computed(() => {
  const c = props.caseData
  if (c.contentHtml) return blankPlaceholders(c.contentHtml)
  if (!c.scenario) return ''
  return blankPlaceholders(c.scenario.split(/\n+/).map(l => `<p>${esc(l)}</p>`).join(''))
})

// ── รูปในห้องคู่ ──
const IMG_RE = /<img[^>]*>/gi
const stripImgs = html => String(html || '').replace(IMG_RE, '')
const paired = computed(() => props.role === 'examiner' || props.role === 'examinee')
const scenarioShown = computed(() => (paired.value ? stripImgs(scenarioHtml.value) : scenarioHtml.value))
const caseImgs = computed(() => {
  const eq = caseSections(props.caseData).equipment
  const src = scenarioHtml.value + (eq?.html || '')
  return (src.match(IMG_RE) || []).map((html, n) => ({ key: `img_${n}`, html }))
})
const shownImgs = computed(() => (props.role === 'examiner' ? caseImgs.value : caseImgs.value.filter(im => props.revealed.includes(im.key))))

// ── ส่วนผู้ป่วย / ของในสถานี + gate ──
// ห้องคู่ (examiner/examinee): ข้อมูลผู้ป่วยทุกส่วนต้องให้ผู้ประเมินส่งก่อน ผู้สอบต้องซักเอง (user ขอ 13 พ.ย.) · solo ใช้ gate ตามเคส
const sections = computed(() => {
  const s = caseSections(props.caseData)
  if (props.role === 'solo') return s
  const patient = s.patient.map(p => ({ ...p, gated: true }))
  const gateKeys = [...patient.map(p => p.key), ...(s.equipment?.gated ? ['equipment'] : [])]
  return { ...s, patient, gateKeys }
})
const isRevealed = p => props.revealed.includes(p.key)
const canSee = p => !p.gated || isStaff.value || isRevealed(p)
const pendingCount = computed(() => sections.value.gateKeys.filter(k => !props.revealed.includes(k)).length)

// ป้าย/ปุ่มส่งข้อมูลบนหัวการ์ด — examiner กดส่ง · solo เห็นแค่ป้ายว่าของจริงผู้ประเมินเป็นคนส่ง
const GateBadge = (p) => {
  const part = p.part
  if (props.role === 'examiner') {
    return isRevealed(part)
      ? h('span', { class: 'ccb-gate sent' }, 'ส่งแล้ว ✓')
      : h('button', { type: 'button', class: 'ccb-gate btn', disabled: props.readonly, onClick: () => emit('reveal', part.key) }, '📨 ส่งให้ผู้สอบ')
  }
  if (props.role === 'examinee') return h('span', { class: 'ccb-gate sent' }, 'ผู้ประเมินส่งมา')
  return h('span', { class: 'ccb-gate' }, 'ผู้ประเมินส่งให้ระหว่างสอบ')
}
GateBadge.props = ['part']

// ── ช่องเติมคำ ──
const blanks = computed(() => Array.isArray(props.caseData.blanks) ? props.caseData.blanks : parseBlanks(props.caseData.scenario))
const showBlankKey = computed(() => props.readonly || props.role === 'examiner')
const blankClass = b => (showBlankKey.value ? (checkBlank(b, props.answers[b.i]) ? 'ok' : 'bad') : '')
function setAnswer(i, v) { if (!props.readonly) emit('update:answers', { ...props.answers, [i]: v }) }

// ── เช็คลิสต์ จัดกลุ่มตาม g (คงลำดับเดิม) ──
const groups = computed(() => {
  const out = [], by = new Map()
  ;(props.caseData.checklist || []).forEach((k, i) => {
    const name = k.g || ''
    if (!by.has(name)) { const g = { name, items: [], got: 0, tot: 0 }; by.set(name, g); out.push(g) }
    const g = by.get(name), s = +k.s || 0
    g.items.push({ ...k, i, s }); g.tot += s; if (props.checks[i]) g.got += s
  })
  return out
})
function toggle(i) { if (!props.readonly) emit('update:checks', { ...props.checks, [i]: !props.checks[i] }) }
const score = computed(() => scoreCase(props.caseData, props.checks, props.answers))
const tot = computed(() => score.value.tot)
const pct = computed(() => (tot.value ? Math.round(score.value.got / tot.value * 100) : 0))

// ── ชิปยา (drug-links → ชื่อจากดัชนีค้นหา) · ผู้สอบเห็นหลังจบเคสเท่านั้น เพราะลิงก์ยาคำนวณจากเช็คลิสต์ด้วย = ใบ้คำตอบ ──
const links = ref({}), names = ref(new Map())
onMounted(async () => {
  const [l, idx] = await Promise.all([loadDrugLinks(), loadSearchIndex()])
  links.value = l || {}
  names.value = new Map((idx?.drugs || []).map(d => [d.id, d.n || d.id]))
})
const drugs = computed(() => (links.value[props.caseData.id] || []).map(id => ({ id, name: names.value.get(id) || id })))
const showDrugs = computed(() => showKey.value || props.readonly)   // ชิปยาคำนวณจากเช็คลิสต์ด้วย = ใบ้คำตอบ
</script>

<style scoped>
.ccb { display: flex; flex-direction: column; gap: 10px; }
.ccb-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: .78rem; color: var(--muted); }
.ccb-cat { font-weight: 800; font-size: .72rem; padding: 2px 9px; border-radius: 999px; background: var(--primary-light); color: var(--primary-dark); }
.ccb-cat.Product { background: var(--accent-light); color: #a3345f; }
.ccb-cat.SAP { background: var(--mint-light); color: #1f7a5a; }
.ccb-grp { font-weight: 700; color: var(--text); }
.ccb-topic::before { content: '· '; }
.ccb-tag { background: #fff; border: var(--bw) solid var(--line); border-radius: 8px; padding: 1px 7px; font-size: .72rem; }
.ccb-src { flex-basis: 100%; font-size: .72rem; }

.ccb-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm); }
.ccb-card.gated { border-color: #f6c86a; background: #fffdf5; }
.ccb-card h3 { margin: 0 0 8px; font-size: .95rem; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ccb-card h3 small { font-weight: 500; color: var(--muted); font-size: .75rem; }
.ccb-rest { text-align: center; font-size: 1rem; background: var(--mint-light); }
.ccb-hint, .ccb-wait { font-size: .85rem; color: var(--muted); }
.ccb-wait { background: #fffdf5; border-color: #f6c86a; color: #8a5a00; }

.ccb-html { font-size: .9rem; line-height: 1.6; overflow-wrap: anywhere; }
.ccb-html :deep(p) { margin: 0 0 6px; }
.ccb-html :deep(ul), .ccb-html :deep(ol) { margin: 0 0 6px; padding-left: 20px; }
.ccb-html :deep(img) { max-width: 100%; height: auto; border-radius: 10px; }
.ccb-html :deep(table) { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; font-size: .82rem; }
.ccb-html :deep(td), .ccb-html :deep(th) { border: 1px solid var(--border); padding: 4px 6px; vertical-align: top; }
.ccb-html :deep(.cc2-blank) { display: inline-block; background: var(--primary-light); color: var(--primary-dark); border: 1px dashed var(--primary); border-radius: 6px; padding: 0 8px; font-weight: 700; font-size: .8rem; }

.ccb-secret { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: #fdf2f8; border: 1px dashed #f0a6c4; }
.ccb-secret-h { font-size: .78rem; font-weight: 800; color: #a3345f; margin-bottom: 4px; }

:deep(.ccb-gate) { margin-left: auto; font-size: .72rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: #fff3d6; color: #8a5a00; border: 1px solid #f6c86a; }
:deep(.ccb-gate.sent) { background: var(--mint-light); color: #1f7a5a; border-color: #9fe0c6; }
:deep(.ccb-gate.btn) { cursor: pointer; background: var(--primary); color: #fff; border-color: var(--primary); font: inherit; font-size: .78rem; font-weight: 800; padding: 6px 12px; }
:deep(.ccb-gate.btn:disabled) { opacity: .5; cursor: default; }
.ccb-img { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding: 6px 0; border-bottom: 1px dashed var(--line); }
.ccb-img:last-child { border-bottom: none; }
.ccb-img .ccb-html { align-self: stretch; }

.ccb-drugs { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ccb-drugs-l { font-size: .78rem; color: var(--muted); font-weight: 700; }
.ccb-chip { font: inherit; font-size: .8rem; font-weight: 700; padding: 5px 11px; border-radius: 999px; border: var(--bw) solid var(--line); background: #fff; color: var(--primary-dark); cursor: pointer; box-shadow: var(--shadow-sm); }
.ccb-chip:active { transform: scale(.97); }
.ccb-recall { text-align: center; background: var(--primary-light); }
.ccb-recall p { margin: 6px 0 12px; font-size: .85rem; color: var(--muted); line-height: 1.6; }
.ccb-recall-btn { font: inherit; font-weight: 700; padding: 10px 18px; border-radius: 12px; border: 0; background: var(--primary); color: #fff; cursor: pointer; }

.ccb-blank-row { display: flex; flex-direction: column; gap: 4px; padding: 8px 0; border-top: 1px solid var(--border); }
.ccb-blank-row:first-of-type { border-top: none; }
.ccb-blank-row label { font-size: .85rem; font-weight: 700; }
.ccb-blank-row label small { font-weight: 500; color: var(--muted); }
.ccb-blank-row input { font: inherit; font-size: .95rem; padding: 9px 12px; border-radius: 10px; border: var(--bw) solid var(--line); background: #fff; }
.ccb-blank-row.ok input { border-color: var(--mint); background: var(--mint-light); }
.ccb-blank-row.bad input { border-color: #f0a6c4; background: #fff5f9; }
.ccb-blank-ans { font-size: .9rem; }
.ccb-blank-key { font-size: .8rem; color: var(--muted); }
.ccb-blank-row.ok .ccb-blank-key span { color: #1f7a5a; font-weight: 800; }
.ccb-blank-row.bad .ccb-blank-key span { color: #c2415f; font-weight: 800; }

.ccb-score { margin-left: auto; font-size: 1.1rem; font-weight: 800; color: var(--primary-dark); font-variant-numeric: tabular-nums; }
.ccb-score small { font-size: .78rem; color: var(--muted); font-weight: 600; }
.ccb-bar { height: 8px; border-radius: 999px; background: var(--bg); overflow: hidden; margin-bottom: 6px; }
.ccb-bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-2)); transition: width .25s; }
.ccb-group { margin-top: 10px; }
.ccb-group-h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: .8rem; font-weight: 800; color: var(--muted); padding-bottom: 4px; border-bottom: 1px solid var(--border); }
.ccb-group-h small { font-weight: 600; font-variant-numeric: tabular-nums; }
.ccb-item { display: flex; align-items: flex-start; gap: 10px; padding: 9px 6px; border-radius: 10px; cursor: pointer; font-size: .88rem; line-height: 1.45; }
.ccb-item.ro { cursor: default; }
.ccb-item:not(.ro):active { background: var(--bg); }
.ccb-item.on { background: var(--mint-light); }
.ccb-item.sub { margin-left: 22px; font-size: .84rem; }
.ccb-item input { width: 20px; height: 20px; margin: 2px 0 0; flex-shrink: 0; accent-color: var(--primary); }
.ccb-item-t { flex: 1; }
.ccb-item-img :deep(img) { max-width: 100%; height: auto; border-radius: 8px; margin-top: 6px; }
.ccb-item-s { font-size: .75rem; font-weight: 800; color: var(--muted); font-variant-numeric: tabular-nums; padding-top: 2px; }

.ccb-note summary { font-weight: 800; font-size: .95rem; cursor: pointer; list-style: none; display: flex; align-items: center; gap: 6px; }
.ccb-note summary::after { content: '›'; margin-left: auto; transform: rotate(90deg); color: var(--muted); }
.ccb-note[open] summary::after { transform: rotate(-90deg); }
.ccb-note .ccb-html { margin-top: 8px; }
</style>
