<template>
  <RouterLink v-if="tile" to="/fun-facts" class="ft ffw-tile">
    <span class="ft-em"><Emoji char="💡" /></span>
    <b>เกร็ดความรู้</b>
    <small>{{ loading ? 'กำลังโหลด…' : `เพื่อนๆ ทำข้อสอบไป ${stats.quizTotal.toLocaleString()} ข้อ` }}</small>
  </RouterLink>
  <div v-else-if="!loading" class="ffw">
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
  tile: { type: Boolean, default: false },
})

const stats = ref({ ...DEFAULT_GLOBAL_STATS })
const loading = ref(true)

onMounted(async () => {
  stats.value = await fetchGlobalStats()
  loading.value = false
})
</script>

<style scoped>
.ffw { background:#fff; border:var(--bw) solid var(--line); border-radius:14px; box-shadow:var(--pop); padding:12px 14px; margin:10px 0; display:flex; flex-direction:column; gap:6px; }
.ffw-row { font-size:.82rem; color:var(--ink); display:flex; align-items:center; gap:6px; }
.ffw-more { align-self:flex-end; font-size:.75rem; color:var(--accent,var(--primary)); font-weight:700; text-decoration:none; }

/* ช่องเล็กในแถว "ประจำวันสนุกๆ" หน้า Home (13 พ.ย. 2026) */
.ft { font: inherit; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; height: 100%; box-sizing: border-box; padding: 10px; border-radius: 14px; border: var(--bw) solid var(--line); box-shadow: var(--pop); text-align: left; text-decoration: none; cursor: pointer; color: var(--ink); background: #fff; }
.ft-em { font-size: 1.35rem; line-height: 1; }
.ft b { font-size: .84rem; }
.ft small { font-size: .7rem; color: var(--muted); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.ffw-tile { background: var(--mint-light); }
</style>
