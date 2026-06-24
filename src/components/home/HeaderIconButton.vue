<!--
  <HeaderIconButton> — ปุ่มไอคอนกลมบน header + จุดแดงแจ้งเตือน
  ใช้: <HeaderIconButton icon="📬" :dot="hasMail" label="กล่องจดหมาย" @click="..." />
-->
<template>
  <button class="hib" :aria-label="label" @click="$emit('click')">
    <Emoji :char="icon" />
    <span v-if="dot" class="hib-dot" aria-hidden="true"></span>
  </button>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'

defineProps({
  icon: { type: String, default: '' },
  dot: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
defineEmits(['click'])
</script>

<style scoped>
.hib {
  position: relative;
  width: 42px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; border-radius: 13px;
  background: #fff; border: 2px solid var(--ink); box-shadow: var(--pop);
  cursor: pointer;
  transition: transform .12s, box-shadow .12s;
}
.hib:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }
.hib-dot {
  position: absolute; top: -3px; right: -3px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #ef4444; border: 2px solid #fff;
}
</style>
