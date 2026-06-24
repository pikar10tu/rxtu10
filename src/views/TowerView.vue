<template>
  <div class="tab-content">
    <div class="page-title tw-head">
      <span><Emoji char="🏯" /> หอคอย</span>
      <RouterLink to="/play" class="tw-back">‹ กลับ</RouterLink>
    </div>

    <template v-if="authStore.isLoggedIn">
      <div class="tw-card">
        <div class="tw-floor">ชั้น {{ floor }}<span class="tw-best">· สูงสุด {{ best }}</span></div>
        <div class="tw-bonus"><Emoji char="🪙" /> โบนัสรายได้ตอนนี้ +{{ bonus.toLocaleString() }}/วัน</div>

        <div class="tw-row">
          <span class="tw-label">ศัตรู</span>
          <span class="tw-team"><Emoji v-for="(p, i) in botTeam" :key="i" :char="defOf(p.id).emoji" /></span>
        </div>
        <div class="tw-vs">VS</div>
        <div class="tw-row">
          <span class="tw-label">ทีมคุณ</span>
          <span class="tw-team">
            <template v-if="team.length"><Emoji v-for="(p, i) in team" :key="i" :char="defOf(p.id).emoji" /></template>
            <span v-else class="tw-empty">ยังไม่ได้จัดทีม</span>
          </span>
          <button class="tw-edit" @click="pickOpen = true">จัดทีม</button>
        </div>

        <button class="tw-fight" :disabled="busy || !team.length" @click="onFight">
          <Emoji char="⚔️" /> {{ busy ? 'กำลังสู้…' : `สู้ชั้น ${floor}` }}
        </button>
        <div v-if="floor >= TOWER_MAX && best >= TOWER_MAX" class="tw-clear"><Emoji char="🏆" /> พิชิตหอคอยครบแล้ว!</div>
      </div>
    </template>
    <div v-else class="tw-login">เข้าสู่ระบบเพื่อเล่น</div>

    <TeamPicker v-model:open="pickOpen" />
    <BattleReplay :data="replay" @close="replay = null" />
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTower } from '../composables/useTower.js'
import { getPetDef } from '../data/index.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'

const authStore = useAuthStore()
const { floor, best, team, botTeam, bonus, fight, TOWER_MAX } = useTower()
const defOf = (id) => getPetDef(id) || { emoji: '❓' }

const pickOpen = ref(false)
const replay = ref(null)
const busy = ref(false)

async function onFight() {
  if (busy.value) return
  busy.value = true
  try { const r = await fight(); if (r) replay.value = r }
  finally { busy.value = false }
}
</script>

<style scoped>
.tw-head { display: flex; align-items: center; justify-content: space-between; }
.tw-back { font-size: .8rem; color: var(--muted); text-decoration: none; }
.tw-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; padding: 16px; box-shadow: var(--pop); }
.tw-floor { font-family: var(--font-display); font-size: 1.4rem; color: var(--ink); }
.tw-best { font-size: .8rem; color: var(--muted); margin-left: 8px; }
.tw-bonus { font-size: .76rem; color: #b45309; font-weight: 700; margin: 4px 0 14px; }
.tw-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.tw-label { font-size: .68rem; color: rgba(0,0,0,.45); width: 48px; flex-shrink: 0; }
.tw-team { font-size: 1.7rem; display: flex; gap: 6px; flex: 1; }
.tw-empty { font-size: .76rem; color: rgba(0,0,0,.35); }
.tw-edit { border: 1.5px solid var(--ink); background: #fff; border-radius: 10px; padding: 6px 12px; font-family: inherit; font-size: .72rem; font-weight: 800; cursor: pointer; }
.tw-vs { text-align: center; font-weight: 800; font-size: .72rem; color: rgba(0,0,0,.3); }
.tw-fight { width: 100%; margin-top: 14px; border: 2px solid var(--ink); border-radius: 14px; padding: 14px; font-family: inherit; font-size: .95rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.tw-fight:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.tw-clear { text-align: center; margin-top: 12px; font-weight: 800; color: #f59e0b; }
.tw-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
