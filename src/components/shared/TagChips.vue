<template>
  <span v-if="tags.length" class="tags">
    <span
      v-for="id in tags" :key="id"
      class="tag" :style="{ background: getTag(id)?.color || '#888' }"
    >{{ getTag(id)?.emoji }} {{ getTag(id)?.label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getTag, effectiveTags } from '../../data/tags.js'

// pass either a member-like object (uses founder+tags) or an explicit list
const props = defineProps({
  member: { type: Object, default: null },
  list: { type: Array, default: null },
})
const tags = computed(() => props.list || effectiveTags(props.member))
</script>

<style scoped>
.tags { display: inline-flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.tag { font-size: .56rem; font-weight: 800; color: #fff; padding: 2px 7px; border-radius: 999px; white-space: nowrap; }
</style>
