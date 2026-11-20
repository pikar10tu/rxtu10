<!-- 🏆 แท่นยืนอันดับ 1–3 ข้อสอบประจำวัน (แผนกอาร์ต งาน D · podium-pharmacy 180×110 · 20 พ.ย. 2026)
     วาดที่ 2 เท่า (360×220) แล้วย่อ/ขยายทั้งก้อนตามความกว้างจริง เหมือน ResidenceScene
     อวาตาร์เอาจากรหัส dl ในแถว roster (ไม่ต้องอ่าน doc เพิ่ม) · ช่องที่ยังไม่มีคน = แท่นว่าง -->
<template>
  <div class="dp">
    <div ref="box" class="dp-scene">
      <div class="dp-in" :style="{ width: 180 * S + 'px', height: 110 * S + 'px', transform: `scale(${k})` }">
        <img class="dp-img" :src="img" alt="แท่นอันดับ" width="180" height="110" draggable="false" />
        <span v-for="p in placed" :key="p.uid" class="dp-doll" :style="p.pos">
          <DollFigure :eq="p.eq" :scale="S" :label="`อวาตาร์ของ ${p.name}`" />
        </span>
      </div>
    </div>
    <div class="dp-names">
      <div v-for="slot in [1, 0, 2]" :key="slot" class="dp-name" :class="{ me: top[slot]?.uid === me }">
        <template v-if="top[slot]">
          <b>{{ top[slot].name || '?' }}</b>
          <small>{{ top[slot].score.toLocaleString() }} แต้ม</small>
        </template>
        <small v-else class="dp-empty">ว่างอยู่</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import DollFigure from '../doll/DollFigure.vue'
import { useMembersStore } from '../../stores/members.js'
import { decodeDoll } from '../../utils/dollCode.js'
import img from '../../assets/podium.png'

const props = defineProps({
  rows: { type: Array, default: () => [] },   // กระดานเรียงแล้ว (rankRows)
  me: { type: String, default: '' },
})
const S = 2
// จุดเท้า [x กลางตัว, y ยอดแท่น] ในพิกัดภาพ — ลำดับ 1, 2, 3 (วัดจากภาพ)
const FEET = [[90, 70], [32, 80], [149, 86]]

const members = useMembersStore()
onMounted(() => members.loadRoster())
const top = computed(() => props.rows.slice(0, 3))
const placed = computed(() => top.value.map((r, i) => {
  const [x, y] = FEET[i]
  return {
    uid: r.uid, name: r.name || '?',
    eq: decodeDoll(members.rosterRows?.[r.uid]?.dl),
    pos: { left: (x - 30) * S + 'px', top: (y - 52) * S + 'px' },
  }
}))

const box = ref(null)
const k = ref(1)
let ro = null
onMounted(() => {
  const fit = () => { const w = box.value?.clientWidth; if (w) k.value = w / (180 * S) }
  fit()
  ro = new ResizeObserver(fit); ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<style scoped>
.dp-scene { position: relative; overflow: hidden; width: 100%; aspect-ratio: 18 / 11; border-radius: 12px; background: var(--primary-light); }
.dp-in { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.dp-img { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; user-select: none; }
.dp-doll { position: absolute; line-height: 0; }
.dp-names { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px; text-align: center; }
.dp-name { display: flex; flex-direction: column; min-width: 0; font-size: .8rem; }
.dp-name b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dp-name small { font-size: .7rem; color: var(--muted, #888); }
.dp-name.me b { color: var(--primary); }
</style>
