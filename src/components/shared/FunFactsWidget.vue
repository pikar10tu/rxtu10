<template>
  <div v-if="!loading" class="ffw">
    <div class="ffw-row"><Emoji char="📝" /> เพื่อนๆ ทำข้อสอบไปแล้ว <b>{{ stats.quizTotal.toLocaleString() }}</b> ข้อ</div>
    <div class="ffw-row"><Emoji char="⚔️" /> สู้กันไปแล้ว <b>{{ stats.pvpTotal.toLocaleString() }}</b> ครั้ง</div>
    <div class="ffw-row"><Emoji char="🃏" /> พลิกการ์ดไปแล้ว <b>{{ stats.flashcardFlips.toLocaleString() }}</b> ครั้ง</div>
    <RouterLink v-if="showLink" to="/fun-facts" class="ffw-more">ดูสถิติทั้งหมด →</RouterLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Emoji from './Emoji.vue'
import { fetchGlobalStats } from '../../composables/useGlobalStats.js'
import { DEFAULT_GLOBAL_STATS } from '../../utils/globalStats.js'

defineProps({
  showLink: { type: Boolean, default: true },
})

const stats = ref({ ...DEFAULT_GLOBAL_STATS })
const loading = ref(true)

onMounted(async () => {
  stats.value = await fetchGlobalStats()
  loading.value = false
})
</script>

<style scoped>
.ffw { background:#fff; border:2px solid var(--ink); border-radius:14px; box-shadow:var(--pop); padding:12px 14px; margin:10px 0; display:flex; flex-direction:column; gap:6px; }
.ffw-row { font-size:.82rem; color:var(--ink); display:flex; align-items:center; gap:6px; }
.ffw-more { align-self:flex-end; font-size:.75rem; color:var(--accent,#4f46e5); font-weight:700; text-decoration:none; }
</style>
