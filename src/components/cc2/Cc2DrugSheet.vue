<!-- src/components/cc2/Cc2DrugSheet.vue — การ์ดยาแบบย่อ เปิดจากชิปยาในเคส CC2 (11 พ.ย. 2026)
     โหลด data/drugDb.json แบบ lazy ตอนเปิดครั้งแรก (ไฟล์ ~500KB ไม่ควรติดมากับ chunk หน้าเคส)
     ใช้ BottomSheet (Teleport to body อยู่แล้ว · z400) · ข้อความในการ์ดเป็นของเราเอง (v-html เหมือน DrugDbView) -->
<template>
  <BottomSheet :open="open" icon="💊" :title="drug?.name || 'การ์ดยา'" @update:open="emit('update:open', $event)">
    <div v-if="!loaded" class="cds-hint">กำลังโหลดการ์ดยา…</div>
    <div v-else-if="!drug" class="cds-hint">ยังไม่มีการ์ดของยานี้ในฐานข้อมูล</div>
    <template v-else>
      <div class="cds-cls">{{ drug.cls }}</div>
      <div class="cds-chips">
        <span v-if="drug.nlem" class="nlem">NLEM 2569 · {{ drug.nlem }}</span>
        <span v-for="c in drug.chips" :key="c">{{ c }}</span>
      </div>
      <p v-if="L(drug.moa)" class="cds-moa"><b>กลไก</b> · <span v-html="L(drug.moa).t" /></p>
      <div v-if="drug.bw" class="cds-bw"><b>{{ drug.bwTitle || 'BOXED WARNING' }}</b><span v-html="L(drug.bw).t" /></div>
      <div v-if="drug.exam?.length" class="cds-exam">
        <h4><Emoji char="🎯" /> จุดที่ออกสอบบ่อย</h4>
        <ul><li v-for="(x, i) in drug.exam" :key="i" v-html="L(x).t" /></ul>
      </div>
      <router-link :to="{ path: '/study/drugs', query: { drug: drugId } }" class="cds-more">เปิดฐานข้อมูลยาฉบับเต็ม ›</router-link>
      <p class="cds-foot">ใช้เพื่อการเรียน ไม่ใช่แทนการตัดสินใจทางคลินิก</p>
    </template>
  </BottomSheet>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BottomSheet from '../shared/BottomSheet.vue'
import Emoji from '../shared/Emoji.vue'
import { cardRefs, resolveLine } from '../../utils/drugCard.js'

const props = defineProps({ open: Boolean, drugId: { type: String, default: '' } })
const emit = defineEmits(['update:open'])

const db = ref(null)
const loaded = computed(() => !!db.value)
let loading = null
watch(() => props.open, o => {
  if (!o || db.value) return
  loading ||= import('../../data/drugDb.json').then(m => { db.value = m.default || m }).catch(() => { loading = null })
}, { immediate: true })

const drug = computed(() => db.value?.find(d => d.id === props.drugId) || null)
const refs = computed(() => cardRefs(drug.value))
const L = line => resolveLine(line, refs.value)
</script>

<style scoped>
.cds-hint { color: var(--muted); font-size: .9rem; text-align: center; padding: 20px 0; }
.cds-cls { font-size: .85rem; color: var(--muted); margin-bottom: 6px; }
.cds-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.cds-chips span { font-size: .72rem; padding: 2px 8px; border-radius: 6px; background: var(--primary-light); }
.cds-chips span.nlem { background: var(--mint-light); color: #1f7a5a; font-weight: 700; }
.cds-moa { font-size: .88rem; line-height: 1.55; margin: 0 0 10px; }
.cds-bw { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 8px 10px; font-size: .84rem; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px; }
.cds-bw b { color: #be123c; font-size: .74rem; letter-spacing: .3px; }
.cds-exam { background: #f1eafb; border-radius: 12px; padding: 10px 12px; }
.cds-exam h4 { margin: 0 0 6px; font-size: .88rem; color: #6b3fb0; display: flex; align-items: center; gap: 5px; }
.cds-exam ul { margin: 0; padding-left: 18px; font-size: .86rem; line-height: 1.55; }
.cds-more { display: block; margin: 12px 0 0; text-align: center; font-weight: 700; color: var(--primary); text-decoration: none; padding: 10px; border-radius: 12px; border: var(--bw) solid var(--line); }
.cds-foot { font-size: .72rem; color: var(--muted); text-align: center; margin: 10px 0 0; }
</style>
