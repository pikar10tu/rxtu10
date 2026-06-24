<template>
  <div class="tab-content">
    <div class="page-title tw-head">
      <span><Emoji char="🏯" /> หอคอย</span>
      <RouterLink to="/play" class="tw-back">‹ กลับ</RouterLink>
    </div>

    <template v-if="authStore.isLoggedIn">
      <!-- แถบไต่ชั้น -->
      <div class="tw-climb">
        <div class="tw-climb-best">สูงสุด {{ best }} · ↑ {{ TOWER_MAX }}</div>
        <div class="tw-climb-row">
          <div v-for="n in climbFloors" :key="n" class="tw-chip"
               :class="{ cleared: n <= best, current: n === floor, locked: n > floor, milestone: isMilestone(n) }">
            <span v-if="isMilestone(n)" class="tw-chip-coin"><Emoji char="🪙" /></span>
            <span class="tw-chip-n">{{ n }}</span>
            <Emoji v-if="n < floor" char="✅" />
            <Emoji v-else-if="n === floor" char="⚔️" />
            <Emoji v-else char="🔒" />
          </div>
        </div>
      </div>

      <!-- การ์ดชั้นปัจจุบัน -->
      <div class="tw-card">
        <div class="tw-zone" :style="{ background: `linear-gradient(135deg, ${zone.color}, ${zone.color}bb)` }">
          <div class="tw-zone-art"><Emoji :char="zone.art" /></div>
          <div class="tw-zone-txt">
            <div class="tw-zone-name">{{ zone.name }}</div>
            <div class="tw-zone-floor">ชั้น {{ floor }} <span class="tw-zone-best">· สูงสุด {{ best }}</span></div>
          </div>
        </div>
        <div class="tw-bonus"><Emoji char="🪙" /> โบนัสรายได้ตอนนี้ +{{ bonus.toLocaleString() }}/วัน</div>

        <div class="tw-row">
          <span class="tw-label">ศัตรู</span>
          <span class="tw-team">
            <button v-for="(p, i) in botTeam" :key="i" class="tw-mon" @click="scout = p">
              <Emoji :char="defOf(p.id).emoji" />
              <PetStatLine :pet="p" />
            </button>
          </span>
        </div>
        <div class="tw-vs"><Emoji char="⚔️" /> VS</div>
        <div class="tw-row">
          <span class="tw-label">ทีมคุณ</span>
          <span class="tw-team">
            <template v-if="team.length">
              <button v-for="(p, i) in team" :key="i" class="tw-mon" @click="detailId = p.id">
                <Emoji :char="defOf(p.id).emoji" />
                <PetStatLine :pet="p" />
              </button>
            </template>
            <span v-else class="tw-empty">ยังไม่ได้จัดทีม</span>
          </span>
        </div>

        <div class="tw-actions">
          <button class="tw-edit" @click="pickOpen = true"><Emoji char="🛡️" /> จัดทีม</button>
          <button class="tw-fight" :disabled="busy || !team.length" @click="onFight">
            <Emoji char="⚔️" /> {{ busy ? 'กำลังสู้…' : `สู้ชั้น ${floor}` }}
          </button>
        </div>
        <div v-if="floor >= TOWER_MAX && best >= TOWER_MAX" class="tw-clear"><Emoji char="🏆" /> พิชิตหอคอยครบแล้ว!</div>
      </div>
    </template>
    <div v-else class="tw-login">เข้าสู่ระบบเพื่อเล่น</div>

    <TeamPicker v-model:open="pickOpen" />
    <BattleReplay :data="replay" @close="replay = null" />
    <PetDetailModal :pet-id="detailId" @close="detailId = null" />

    <!-- scout ศัตรู (read-only) -->
    <div v-if="scout" class="tw-scout" @click.self="scout = null">
      <div class="tw-scout-box">
        <div class="tw-scout-emoji"><Emoji :char="defOf(scout.id).emoji" /></div>
        <div class="tw-scout-name">{{ defOf(scout.id).name }}</div>
        <div class="tw-scout-row"><span>ธาตุ</span><b><Emoji :char="elEmoji(scout)" /> {{ elName(scout) }}</b></div>
        <div class="tw-scout-row"><span>ระดับ</span><b>{{ rarityLabel(scout) }} · เกรด {{ scout.grade || 0 }}</b></div>
        <div class="tw-scout-row"><span>พลังโจมตี</span><b>{{ scoutStat.atk }}</b></div>
        <div class="tw-scout-row"><span>พลังชีวิต</span><b>{{ scoutStat.hp }}</b></div>
        <button class="tw-scout-x" @click="scout = null">ปิด</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTower } from '../composables/useTower.js'
import { getPetDef, ELEMENTS, RARITY } from '../data/index.js'
import { floorZone, TOWER_BONUS_FLOORS } from '../data/towerFloors.js'
import { buildCombatant } from '../data/battle.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'
import PetDetailModal from '../components/pets/PetDetailModal.vue'
import PetStatLine from '../components/shared/PetStatLine.vue'

const authStore = useAuthStore()
const { floor, best, team, botTeam, bonus, fight, TOWER_MAX } = useTower()
const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?' }

const pickOpen = ref(false)
const replay = ref(null)
const busy = ref(false)
const detailId = ref(null)
const scout = ref(null)

const EL_NAME = { fist: 'หมัด', scissors: 'กรรไกร', paper: 'กระดาษ' }
const zone = computed(() => floorZone(floor.value))
const isMilestone = (n) => TOWER_BONUS_FLOORS.includes(n)
const climbFloors = computed(() => {
  const start = Math.max(1, Math.min(TOWER_MAX - 5, floor.value - 1))
  const out = []
  for (let n = start; n < start + 6 && n <= TOWER_MAX; n++) out.push(n)
  return out
})
const elEmoji = (p) => ELEMENTS[p?.element]?.emoji || '✊'
const elName = (p) => EL_NAME[p?.element] || p?.element
const rarityLabel = (p) => RARITY[p?.rarity]?.label || p?.rarity
const scoutStat = computed(() => {
  if (!scout.value) return { atk: 0, hp: 0 }
  const c = buildCombatant(scout.value)
  return { atk: Math.round(c.atk), hp: Math.round(c.maxHp) }
})

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

.tw-climb { background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 10px 12px; box-shadow: var(--pop); margin-bottom: 12px; }
.tw-climb-best { font-size: .68rem; font-weight: 800; color: rgba(0,0,0,.5); margin-bottom: 6px; }
.tw-climb-row { display: flex; gap: 6px; }
.tw-chip { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 6px 2px; border-radius: 10px; background: #f1f5f9; font-size: .9rem; position: relative; }
.tw-chip-n { font-size: .64rem; font-weight: 800; color: rgba(0,0,0,.55); }
.tw-chip.cleared { background: #dcfce7; }
.tw-chip.current { background: var(--gold); box-shadow: 0 0 0 2px var(--ink); }
.tw-chip.locked { opacity: .55; }
.tw-chip.milestone { outline: 2px dashed #f59e0b; outline-offset: -2px; }
.tw-chip-coin { position: absolute; top: -7px; right: -3px; font-size: .6rem; }

.tw-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; box-shadow: var(--pop); overflow: hidden; }
.tw-zone { display: flex; align-items: center; gap: 12px; padding: 14px 16px; color: #fff; }
.tw-zone-art { font-size: 2rem; }
.tw-zone-name { font-family: var(--font-display); font-size: 1.3rem; line-height: 1; }
.tw-zone-floor { font-size: .78rem; font-weight: 700; margin-top: 3px; }
.tw-zone-best { opacity: .8; font-weight: 600; }
.tw-bonus { font-size: .76rem; color: #b45309; font-weight: 700; padding: 10px 16px 0; }
.tw-row { display: flex; align-items: center; gap: 10px; padding: 8px 16px; }
.tw-label { font-size: .68rem; color: rgba(0,0,0,.45); width: 48px; flex-shrink: 0; }
.tw-team { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; }
.tw-mon { border: none; background: rgba(0,0,0,.04); border-radius: 10px; font-size: 1.6rem; padding: 4px 5px 5px; cursor: pointer; line-height: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.tw-mon:active { transform: scale(.92); }
.tw-empty { font-size: .76rem; color: rgba(0,0,0,.35); }
.tw-vs { text-align: center; font-weight: 800; font-size: .72rem; color: rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; gap: 4px; }
.tw-actions { display: flex; gap: 8px; padding: 6px 16px 16px; }
.tw-edit { border: 2px solid var(--ink); background: #fff; border-radius: 12px; padding: 12px; font-family: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); display: flex; align-items: center; gap: 4px; }
.tw-edit:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight { flex: 1; border: 2px solid var(--ink); border-radius: 12px; padding: 12px; font-family: inherit; font-size: .92rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
.tw-fight:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.tw-clear { text-align: center; padding: 0 0 14px; font-weight: 800; color: #f59e0b; }
.tw-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }

.tw-scout { position: fixed; inset: 0; z-index: 240; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.tw-scout-box { background: #1e293b; color: #fff; border: 2px solid #fff; border-radius: 18px; padding: 16px 18px; width: 240px; display: flex; flex-direction: column; gap: 7px; }
.tw-scout-emoji { font-size: 2.8rem; text-align: center; }
.tw-scout-name { text-align: center; font-weight: 800; font-size: 1.1rem; margin-bottom: 4px; }
.tw-scout-row { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; }
.tw-scout-row span { color: rgba(255,255,255,.6); }
.tw-scout-x { margin-top: 10px; border: 2px solid #fff; background: rgba(255,255,255,.14); color: #fff; border-radius: 12px; padding: 9px; font-family: inherit; font-weight: 800; cursor: pointer; }
</style>
