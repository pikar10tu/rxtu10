<template>
  <button class="help-btn" type="button" aria-label="ดูวิธีใช้" @click.stop="openHelp(topic)">?</button>
</template>

<script setup>
import { useHelp } from '../../composables/useHelp.js'
defineProps({ topic: { type: String, required: true } })
const { openHelp } = useHelp()
</script>

<style scoped>
.help-btn {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 999px;
  border: 2px solid var(--ink); background: #fff; color: var(--ink);
  font-weight: 800; font-size: .8rem; line-height: 1; cursor: pointer; padding: 0;
}
.help-btn:active { transform: translate(1px,1px); }
</style>
