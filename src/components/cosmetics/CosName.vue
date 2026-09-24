<!-- ชื่อ + ป้ายหน้าชื่อ + สีชื่อ จากร้านแต่งตัว
     reserve = จองช่องป้ายไว้เสมอแม้ไม่มีป้าย (user เลือก 25 ก.ย. 2026: ป้ายอยู่หน้าชื่อ + เว้นช่องให้คนไม่มี
     ⇒ ชื่อทุกคนตรงแนว และคนที่มีป้ายเด่นขึ้นมา) · ใช้ในรายชื่อสมาชิก · การ์ดโปรไฟล์ไม่ต้องจอง -->
<template>
  <span class="cz-name" :class="{ 'cz-still': still }">
    <span v-if="badge || reserve" class="cz-slot">
      <span v-if="badge" class="cz-bd" :class="badge.fx ? 'cz-bd-' + badge.fx : null"><Emoji :char="badge.emoji" /></span>
    </span>
    <span class="cz-txt" :class="color ? 'cz-' + color.id : null">{{ name }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { getCosmetic } from '../../data/cosmetics.js'

const props = defineProps({
  name: { type: String, default: '' },
  cos: { type: Object, default: null },     // { n, b } จาก user doc / แถว roster
  reserve: { type: Boolean, default: false },
  still: { type: Boolean, default: false },
})
const pick = (id, kind) => { const c = getCosmetic(id); return c && c.kind === kind ? c : null }
const color = computed(() => pick(props.cos?.n, 'n'))
const badge = computed(() => pick(props.cos?.b, 'b'))
</script>
