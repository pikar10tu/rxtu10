<!-- ป้ายชวนตั้ง MBTI (user 25 ต.ค. 2026) — แถวเล็กใต้แบนเนอร์อีเวนต์บน Home
     โชว์เมื่อยังไม่มี MBTI (ลบออกก็กลับมา) · รางวัลมีแค่ครั้งแรก (mbtiQuest) ⇒ รับแล้วไม่บอกรางวัล -->
<template>
  <RouterLink v-if="tile && auth.isLoggedIn && auth.userData && !auth.userData.mbti" to="/me#mbti" class="ft mbp-tile">
    <span class="ft-em"><Emoji char="🧠" /></span>
    <b>MBTI</b>
    <small v-if="!auth.userData.mbtiQuest">ตั้งในโปรไฟล์ รับ {{ MBTI_QUEST_COINS.toLocaleString() }}🪙</small>
    <small v-else>ยังไม่ได้ตั้ง · ไปตั้ง ›</small>
  </RouterLink>
  <RouterLink v-else-if="auth.isLoggedIn && auth.userData && !auth.userData.mbti" to="/me#mbti" class="mbp">
    <span class="mbp-ic"><Emoji char="🧠" /></span>
    <span v-if="!auth.userData.mbtiQuest" class="mbp-txt">ตั้ง MBTI ในโปรไฟล์ รับ {{ MBTI_QUEST_COINS.toLocaleString() }} <Emoji char="🪙" /></span>
    <span v-else class="mbp-txt">ยังไม่ได้ตั้ง MBTI ในโปรไฟล์</span>
    <span class="mbp-go">ไปตั้ง ›</span>
  </RouterLink>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { MBTI_QUEST_COINS } from '../../data/mbti.js'

defineProps({ tile: { type: Boolean, default: false } })
const auth = useAuthStore()
</script>

<style scoped>
.mbp { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--ink); background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; padding: 7px 12px; margin: -2px 0 10px; font-size: .8rem; box-shadow: var(--pop); }
.mbp-ic { font-size: 1.15rem; line-height: 1; }
.mbp-txt { flex: 1; min-width: 0; font-weight: 700; }
.mbp-go { font-weight: 800; color: var(--primary); white-space: nowrap; }

/* ช่องเล็กในแถว "ประจำวันสนุกๆ" หน้า Home (13 พ.ย. 2026) */
.ft { font: inherit; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; height: 100%; box-sizing: border-box; padding: 10px; border-radius: 14px; border: var(--bw) solid var(--line); box-shadow: var(--pop); text-align: left; text-decoration: none; cursor: pointer; color: var(--ink); background: #fff; }
.ft-em { font-size: 1.35rem; line-height: 1; }
.ft b { font-size: .84rem; }
.ft small { font-size: .7rem; color: var(--muted); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.mbp-tile { background: var(--primary-light); }
</style>
