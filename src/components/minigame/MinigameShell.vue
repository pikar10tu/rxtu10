<!--
  <MinigameShell> — chrome ร่วมของมินิเกม (หัว/กลับ/สถิติส่วนตัว/พื้นที่เกม/ปุ่มอันดับ)
  ใช้: <MinigameShell game-key="..." :best="123">
         ...พื้นที่เกม...
         <template #gameover>...การ์ดจบเกม...</template>
       </MinigameShell>
  slot "gameover" ส่งเนื้อหาจบเกม (คะแนน/เหรียญ/ปุ่ม) มาจาก view เอง — shell ไม่ยุ่งกับ logic เกม
-->
<template>
  <div class="ms">
    <header class="ms-head">
      <button class="ms-back" @click="$router.push('/play')" aria-label="กลับ">‹ กลับ</button>
      <span class="ms-title"><Emoji :char="game?.emoji" /> {{ game?.name }}</span>
      <button class="ms-lb" @click="lbOpen = true" aria-label="อันดับ">🏆</button>
    </header>

    <div class="ms-best">สถิติของคุณ: <b>{{ best.toLocaleString() }}</b> {{ game?.scoreLabel }}</div>

    <div class="ms-stage"><slot /></div>

    <slot name="gameover" />

    <BottomSheet v-model:open="lbOpen" icon="🏆" title="อันดับ">
      <MinigameLeaderboard :game-key="gameKey" />
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import MinigameLeaderboard from './MinigameLeaderboard.vue'
import { getMinigame } from '../../data/minigames.js'

const props = defineProps({
  gameKey: { type: String, required: true },
  best: { type: Number, default: 0 },
})
const game = getMinigame(props.gameKey)
const lbOpen = ref(false)
</script>

<style scoped>
.ms { max-width: 480px; margin: 0 auto; padding: 8px 12px; }
.ms-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.ms-back { all: unset; cursor: pointer; font-weight: 700; color: #4f46e5; padding: 6px 4px; }
.ms-title { font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 6px; }
.ms-lb { all: unset; cursor: pointer; font-size: 1.3rem; padding: 6px; }
.ms-best { text-align: center; font-size: .78rem; color: rgba(0,0,0,.55); margin-bottom: 8px; }
.ms-stage { position: relative; }
</style>
