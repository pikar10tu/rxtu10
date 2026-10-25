<!-- ป้ายชวนตั้ง MBTI (user 25 ต.ค. 2026) — แถวเล็กใต้แบนเนอร์อีเวนต์บน Home
     โชว์เมื่อยังไม่มี MBTI (ลบออกก็กลับมา) · รางวัลมีแค่ครั้งแรก (mbtiQuest) ⇒ รับแล้วไม่บอกรางวัล -->
<template>
  <RouterLink v-if="auth.isLoggedIn && auth.userData && !auth.userData.mbti" to="/me#mbti" class="mbp">
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

const auth = useAuthStore()
</script>

<style scoped>
.mbp { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--ink); background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; padding: 7px 12px; margin: -2px 0 10px; font-size: .8rem; box-shadow: var(--pop); }
.mbp-ic { font-size: 1.15rem; line-height: 1; }
.mbp-txt { flex: 1; min-width: 0; font-weight: 700; }
.mbp-go { font-weight: 800; color: var(--primary); white-space: nowrap; }
</style>
