<!-- กรอบรูปจากร้านตกแต่ง — ห่อรูปโปรไฟล์ (slot) · ไม่มีกรอบ = คืน slot เปล่าๆ ไม่มี wrapper เพิ่ม
     still = ภาพนิ่ง (รายชื่อสมาชิก) · ของประดับ/ของวนรอบวาดเป็น emoji ทับบน (pointer-events: none) -->
<template>
  <div v-if="item" class="cz-fw" :class="['cz-' + item.id, { 'cz-still': still }]">
    <slot />
    <span v-for="(d, i) in item.deco || []" :key="'d' + i" class="cz-deco" :class="{ 'cz-float': d[2] }" :style="d[1]"><Emoji :char="d[0]" /></span>
    <span v-if="item.orbit && !still" class="cz-orbit" :style="item.orbitSec ? { animationDuration: item.orbitSec + 's' } : null">
      <i v-for="(o, i) in item.orbit" :key="'o' + i" :style="o[1]"><Emoji :char="o[0]" /></i>
    </span>
  </div>
  <slot v-else />
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { getCosmetic } from '../../data/cosmetics.js'

const props = defineProps({ id: { type: String, default: null }, still: { type: Boolean, default: false } })
const item = computed(() => {
  const c = getCosmetic(props.id)
  return c && c.kind === 'f' ? c : null
})
</script>
