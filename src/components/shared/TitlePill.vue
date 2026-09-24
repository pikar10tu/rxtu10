<!-- ป้ายฉายา — บรรทัดเดียวเสมอ ไม่ตัดชื่อ ชื่อยาวหดตัวอักษรแทน
     ⚠️ ข้อยกเว้นกฎ font ขั้นต่ำ .7rem (CLAUDE.md) — user อนุญาตเฉพาะป้ายฉายา 25 ก.ย. 2026
        ("สองบรรทัดมันดูไม่ดี · ตัวเล็กก็ไม่เป็นไร เพราะเท่") · ห้ามลามไปใช้กับข้อความอื่น
     base = ขนาดเมื่อชื่อสั้น (rem) · ยาวขึ้นหดตามจำนวนตัวอักษรที่มองเห็น (ไม่นับสระบน-ล่าง/วรรณยุกต์) -->
<template>
  <span class="tp" :style="{ fontSize: size + 'rem' }"><Emoji v-if="icon" :char="icon" /> {{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from './Emoji.vue'

const props = defineProps({
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  base: { type: Number, default: 0.7 },
  fit: { type: Number, default: 13 },   // เกินกี่ตัว (ที่มองเห็น) เริ่มหด
})
const COMBINING = /[ัิ-ฺ็-๎]/g
const size = computed(() => {
  const n = String(props.label).replace(COMBINING, '').length + (props.icon ? 2 : 0)
  if (n <= props.fit) return props.base
  return Math.max(0.45, +(props.base * props.fit / n).toFixed(3))
})
</script>

<style scoped>
.tp { display: inline-flex; align-items: center; gap: .25em; white-space: nowrap; max-width: 100%; line-height: 1.35; }
</style>
