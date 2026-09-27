<template>
  <div id="toast" role="status" aria-live="polite" aria-atomic="true" :class="['toast', type, { show: visible }]" v-html="html"></div>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from '../../composables/useToast.js'
import { emojifyHtml } from '../../utils/emoji.js'
const { message, type, visible } = useToast()
// v-html ต้อง escape ก่อนเสมอ (CLAUDE.md ข้อ 8) — emojifyHtml escape ให้แล้วในตัว เหมือน ConfirmModal.vue
const html = computed(() => emojifyHtml(message.value, import.meta.env.BASE_URL))
</script>
