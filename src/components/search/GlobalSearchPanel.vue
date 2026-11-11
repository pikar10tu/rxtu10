<!--
  <GlobalSearchPanel> — ค้นหารวม ยา · เคส CC2 OSPE · สรุป (ดู useGlobalSearch.js → public/search-index.json, 0 Firestore read)
  ใช้ได้ 2 แบบ:
    1) แผงฝังในหน้า (Study)         <GlobalSearchPanel v-model="q" />
    2) overlay เต็มจอจากปุ่ม 🔍 หน้าหลัก <GlobalSearchPanel v-if="open" overlay autofocus v-model="q" @close="open=false" />
       (overlay ต้อง Teleport to body เพราะ #main-content เป็น position:fixed → stacking context
        ของตัวเอง สู้ #bottom-nav (z200) ที่ root ไม่ได้ ถ้าไม่ Teleport — ดู CLAUDE.md ข้อ 6
        z-index = 400 ตามบันไดชั้น CLAUDE.md ข้อ 12 — เปิดจาก root ตรงๆ ไม่ได้เปิดจากใน modal อื่น)
  ไฮไลต์คำที่ตรง = ตัดสตริงเป็นช่วงแล้ว render เป็น text node ปกติ (ไม่ใช้ v-html กับข้อความดิบ)
  ป้าย 💊 ยา ลิงก์ไป /study/drugs?drug=<id> (DrugDbView อ่าน query แล้วเปิดยาให้)
-->
<template>
  <Teleport v-if="overlay" to="body">
    <div class="gsp-ov" @click.self="close">
      <div class="gsp-box">
        <div class="gsp-head">
          <span class="gsp-head-ico"><Emoji char="🔍" /></span>
          <input
            ref="inputEl"
            v-model="q"
            class="gsp-input"
            type="search"
            placeholder="ค้นหายา เคส CC2 หรือสรุป"
            aria-label="ค้นหารวม"
            @keydown.esc="close"
          >
          <button class="gsp-x" type="button" aria-label="ปิด" @click="close">✕</button>
        </div>
        <div class="gsp-scroll">
          <GspResults :groups="groups" :query="q" :ready="ready" @pick="close" />
        </div>
      </div>
    </div>
  </Teleport>

  <div v-else class="gsp-panel">
    <div v-if="!hideInput" class="gsp-panel-inputwrap">
      <span class="gsp-head-ico gsp-panel-ico"><Emoji char="🔍" /></span>
      <input
        ref="inputEl"
        v-model="q"
        class="gsp-input gsp-panel-input"
        type="search"
        placeholder="ค้นหายา เคส CC2 หรือสรุป"
        aria-label="ค้นหารวม"
      >
    </div>
    <div class="gsp-panel-scroll">
      <GspResults :groups="groups" :query="q" :ready="ready" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, h } from 'vue'
import { RouterLink } from 'vue-router'
import Emoji from '../shared/Emoji.vue'
import { useGlobalSearch } from '../../composables/useGlobalSearch.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  autofocus: { type: Boolean, default: false },
  overlay: { type: Boolean, default: false },
  hideInput: { type: Boolean, default: false },   // ฝังใต้ช่องค้นหาเดิมของหน้า (StudyView) — ใช้ query จากข้างนอก
  exclude: { type: Array, default: () => [] },     // ซ่อนกลุ่ม เช่น ['sums'] เมื่อหน้านั้นค้นสรุปเองอยู่แล้ว
})
const emit = defineEmits(['update:modelValue', 'close'])

const q = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const { results, ready } = useGlobalSearch(q)

const inputEl = ref(null)
onMounted(() => { if (props.autofocus) inputEl.value?.focus?.() })

function close() { emit('close') }
useEscapeKey(() => props.overlay, close)

// กลุ่มผลลัพธ์ตามสัญญา: 💊 ยา (/study/drugs) · 🩺 เคส CC2 (/study/cc2/:id) · 📖 สรุป (/study/summary/:id)
const groups = computed(() => {
  const r = results.value
  if (!r) return []
  return [
    {
      key: 'drugs', emoji: '💊', label: 'ยา',
      items: r.drugs.map((d) => ({ id: d.id, title: d.n, sub: d.cls || d.g, to: `/study/drugs?drug=${d.id}` })),
    },
    {
      key: 'cases', emoji: '🩺', label: 'เคส CC2',
      items: r.cases.map((c) => ({ id: c.id, title: c.t, sub: [c.cat, c.topic || c.g].filter(Boolean).join(' · '), to: `/study/cc2/${c.id}` })),
    },
    {
      key: 'sums', emoji: '📖', label: 'สรุป',
      items: r.sums.map((s) => ({ id: s.id, title: s.t, sub: s.g, to: `/study/summary/${s.id}` })),
    },
  ].filter((g) => g.items.length && !props.exclude.includes(g.key))
})

// ── ผลลัพธ์ย่อย — แยกเป็นคอมโพเนนต์ในไฟล์เดียวกัน (render function) เพื่อไม่ต้องสร้างไฟล์แยกนอกเลน ──
function highlightSegments(text, query) {
  const t = String(text ?? '')
  const k = String(query ?? '').trim()
  if (!k) return [{ text: t, hit: false }]
  const idx = t.toLowerCase().indexOf(k.toLowerCase())
  if (idx < 0) return [{ text: t, hit: false }]
  return [
    { text: t.slice(0, idx), hit: false },
    { text: t.slice(idx, idx + k.length), hit: true },
    { text: t.slice(idx + k.length), hit: false },
  ].filter((seg) => seg.text)
}

const GspResults = (props2, { emit: emit2 }) => {
  const g = props2.groups
  if (!props2.ready) return h('div', { class: 'gsp-empty' }, 'กำลังโหลดดัชนีค้นหา…')
  if (!props2.query.trim()) return h('div', { class: 'gsp-hint' }, 'พิมพ์ชื่อยา ชื่อโรค หรือหัวข้อเคส CC2')
  if (!g.length) return h('div', { class: 'gsp-empty' }, `ไม่เจอ "${props2.query.trim()}"`)
  return h('div', { class: 'gsp-groups' }, g.map((grp) => h('div', { class: 'gsp-group', key: grp.key }, [
    h('div', { class: 'gsp-group-label' }, [h(Emoji, { char: grp.emoji }), ' ' + grp.label]),
    ...grp.items.map((it) => h(RouterLink, {
      key: it.id, to: it.to, class: 'gsp-item', onClick: () => emit2('pick'),
    }, () => [
      h('span', { class: 'gsp-item-t' }, highlightSegments(it.title, props2.query).map((seg) =>
        seg.hit ? h('mark', seg.text) : seg.text)),
      it.sub ? h('small', { class: 'gsp-item-sub' }, it.sub) : null,
    ])),
  ])))
}
GspResults.props = ['groups', 'query', 'ready']
GspResults.emits = ['pick']
</script>

<style scoped>
/* overlay (เต็มจอจากปุ่ม 🔍 หน้าหลัก) */
.gsp-ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.45); display: flex; flex-direction: column; }
.gsp-box { background: #fff; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.gsp-head { display: flex; align-items: center; gap: 8px; padding: calc(12px + env(safe-area-inset-top, 0px)) 14px 12px; border-bottom: var(--bw) solid var(--line); background: #fff; }
.gsp-head-ico { font-size: 1.1rem; flex-shrink: 0; display: inline-flex; }
.gsp-input { flex: 1; min-width: 0; border: var(--bw) solid var(--line); border-radius: 12px; padding: 10px 12px; font: inherit; font-size: .88rem; background: var(--bg); }
.gsp-input:focus { outline: 2px solid var(--primary); outline-offset: 1px; }
.gsp-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 38px; height: 38px; font-size: .85rem; cursor: pointer; flex-shrink: 0; }
.gsp-scroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 10px 14px calc(16px + env(safe-area-inset-bottom, 0px)); }

/* panel (ฝังในหน้า Study) */
.gsp-panel { display: flex; flex-direction: column; gap: 10px; }
.gsp-panel-inputwrap { display: flex; align-items: center; gap: 8px; }
.gsp-panel-ico { font-size: 1rem; }
.gsp-panel-input { width: 100%; box-sizing: border-box; }
.gsp-panel-scroll { max-height: 60vh; overflow-y: auto; }

/* ผลลัพธ์ */
.gsp-hint, .gsp-empty { text-align: center; color: var(--muted); font-size: .8rem; padding: 24px 12px; }
.gsp-groups { display: flex; flex-direction: column; gap: 14px; }
.gsp-group-label { font-size: .74rem; font-weight: 800; color: var(--muted); margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
.gsp-item { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; margin-bottom: 6px; border: var(--bw) solid var(--line); border-radius: 12px; background: #fff; text-decoration: none; color: var(--ink); }
.gsp-item:active { background: var(--bg); }
.gsp-item-t { font-size: .86rem; font-weight: 700; }
.gsp-item-t mark { background: var(--mint-light); color: var(--primary-dark); border-radius: 3px; padding: 0 1px; }
.gsp-item-sub { font-size: .72rem; color: var(--muted); }
</style>
