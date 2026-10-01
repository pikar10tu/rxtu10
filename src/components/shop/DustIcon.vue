<!-- ไอคอนประกายดาว — WebP จาก scripts/dust-art.mjs (ไม่ใช้ SVG: เหตุผลเดียวกับอีโมจิ CLAUDE.md ข้อ 17) -->
<template>
  <img class="dusti" :src="src" :alt="dustName(k)" :style="{ width: size, height: size }" draggable="false">
</template>

<script setup>
import { computed } from 'vue'
import { DUST, dustName } from '../../utils/stardust.js'
const props = defineProps({ k: { type: String, required: true }, size: { type: String, default: '1.2em' } })
const src = computed(() => `${import.meta.env.BASE_URL}fx/${DUST[props.k]?.img || 'dust-common'}.webp`)
</script>

<style scoped>
.dusti { display: inline-block; vertical-align: -0.25em; object-fit: contain; flex-shrink: 0; }
</style>
