<!-- 🔄 ป้ายมีเวอร์ชันใหม่ (useAppVersion) — มุมบน ไม่บังปุ่มล่าง · z 520 (ชั้น toast) -->
<template>
  <Teleport to="body">
    <div v-if="hasUpdate" class="upd" role="status">
      <span><Emoji char="✨" /> มีเว็บเวอร์ชันใหม่</span>
      <button type="button" @click="reloadApp">รีเฟรช</button>
    </div>
  </Teleport>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { hasUpdate, reloadApp } from '../../composables/useAppVersion.js'
</script>

<style scoped>
.upd { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 520; display: flex; align-items: center; gap: 10px; background: #fff; border: var(--bw) solid var(--line); border-radius: 99px; padding: 6px 6px 6px 14px; box-shadow: var(--pop); font-size: .82rem; font-weight: 600; white-space: nowrap; }
.upd button { font: inherit; font-weight: 700; border: 0; border-radius: 99px; background: var(--primary); color: #fff; padding: 5px 14px; cursor: pointer; }
</style>
