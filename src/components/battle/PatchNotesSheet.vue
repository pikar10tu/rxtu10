<!-- src/components/battle/PatchNotesSheet.vue — การ์ดสรุปบัฟ/เนิฟ เปิดจากหน้าจัดทีม (18 ต.ค. 2026)
     BottomSheet ห่อ Teleport ให้แล้ว · ข้อมูลอยู่ data/patchNotes.js -->
<template>
  <BottomSheet :open="open" icon="📋" :title="PATCH_NOTES.title" @update:open="$emit('update:open', $event)">
    <div class="pn-date">{{ dateLabel }}</div>
    <!-- สรุปสั้น: ใครรีเวิร์ค/บัฟ/เนิฟ · อยากรู้เลขค่อยกดดูละเอียด (18 ต.ค. user) -->
    <section v-for="g in PATCH_NOTES.groups" :key="g.kind" class="pn-group">
      <div class="pn-glabel" :class="g.kind">{{ g.label }} {{ g.items.length }} ตัว</div>
      <div class="pn-chips">
        <span v-for="it in g.items" :key="it.id" class="pn-chip" :class="g.kind"><Emoji :char="defOf(it.id).emoji" /> {{ defOf(it.id).name }}</span>
      </div>
    </section>
    <button class="pn-more" @click="detail = !detail">{{ detail ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดตัวเลข' }} <span>{{ detail ? '▴' : '▾' }}</span></button>
    <template v-if="detail">
      <section v-for="g in PATCH_NOTES.groups" :key="'d' + g.kind" class="pn-group">
        <div v-for="it in g.items" :key="it.id" class="pn-item" :class="g.kind">
          <span class="pn-face"><Emoji :char="defOf(it.id).emoji" /></span>
          <div class="pn-body">
            <b class="pn-name">{{ defOf(it.id).name }}</b>
            <div v-for="(l, i) in it.lines" :key="i" class="pn-line">{{ l }}</div>
          </div>
        </div>
      </section>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref } from 'vue'
import BottomSheet from '../shared/BottomSheet.vue'
import Emoji from '../shared/Emoji.vue'
import { getPetDef } from '../../data/index.js'
import { PATCH_NOTES } from '../../data/patchNotes.js'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['update:open'])

const detail = ref(false)
const defOf = (id) => getPetDef(id) || { name: id, emoji: '❓' }
const dateLabel = new Date(PATCH_NOTES.date + 'T00:00:00')
  .toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<style scoped>
.pn-date { font-size: .74rem; color: var(--muted); margin: -4px 0 10px; }
.pn-group { margin-bottom: 14px; }
.pn-glabel { display: inline-block; font-size: .72rem; font-weight: 800; padding: 2px 10px; border-radius: 999px; margin-bottom: 6px; color: #fff; }
.pn-glabel.buff { background: #3fa66b; }
.pn-glabel.nerf { background: #d2564b; }
.pn-glabel.rework { background: #7a63d6; }
.pn-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.pn-chip { font-size: .8rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: #fff; border: var(--bw, 1px) solid var(--line); }
.pn-chip.buff { border-color: #3fa66b; }
.pn-chip.nerf { border-color: #d2564b; }
.pn-chip.rework { border-color: #7a63d6; }
.pn-more { all: unset; box-sizing: border-box; cursor: pointer; display: flex; justify-content: center; gap: 6px; width: 100%;
  padding: 8px; margin: 2px 0 12px; border-radius: 10px; font-size: .8rem; font-weight: 700; color: var(--muted); border: var(--bw, 1px) dashed var(--line); }
.pn-more:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.pn-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 12px; margin-bottom: 6px;
  background: var(--card, #fff); border: var(--bw, 1px) solid var(--line); border-left-width: 4px; }
.pn-item.buff { border-left-color: #3fa66b; }
.pn-item.nerf { border-left-color: #d2564b; }
.pn-item.rework { border-left-color: #7a63d6; }
.pn-face { font-size: 1.5rem; line-height: 1; flex: none; }
.pn-body { min-width: 0; }
.pn-name { font-size: .88rem; }
.pn-line { font-size: .78rem; color: var(--ink); line-height: 1.45; overflow-wrap: anywhere; }
</style>
