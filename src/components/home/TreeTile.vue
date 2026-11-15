<!-- ช่อง 🌳 ต้นไม้รุ่น 10 ในแถว "ประจำวันสนุกๆ" หน้า Home (15 พ.ย. 2026) — อยู่แถวเดียวกับดวง/เกร็ดฯ หน้าไม่ยาวขึ้น -->
<template>
  <RouterLink to="/tree" class="ft tt-tile">
    <span class="ft-em"><Emoji char="🌳" /></span>
    <b>ต้นไม้รุ่น 10</b>
    <small>ให้ดอกไม้ ติดอาวุธ ให้เพื่อนๆ</small>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Emoji from '../shared/Emoji.vue'
</script>

<style scoped>
.ft { font: inherit; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; height: 100%; box-sizing: border-box; padding: 10px; border-radius: 14px; border: var(--bw) solid var(--line); box-shadow: var(--pop); text-align: left; text-decoration: none; cursor: pointer; color: var(--ink); }
.ft-em { font-size: 1.35rem; line-height: 1; }
.ft b { font-size: .84rem; }
.ft small { font-size: .7rem; color: var(--muted); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.tt-tile { background: linear-gradient(160deg, #eaf7e4, #fff1f6); }
</style>
