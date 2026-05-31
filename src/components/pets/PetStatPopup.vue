<template>
  <div v-if="pet" class="ps-ov" @click.self="$emit('close')">
    <div class="ps-box">
      <div class="ps-hero" :style="{ background: `linear-gradient(135deg, ${rc}, ${rc}aa)` }">
        <button class="ps-x" @click="$emit('close')">✕</button>
        <div class="ps-emoji">{{ pet.emoji }}</div>
        <div class="ps-name">{{ pet.name }}</div>
        <div class="ps-tags">
          <span class="ps-tag">{{ rarityLabel }}</span>
          <span class="ps-tag" v-if="pet.grade > 0">เกรด {{ GRADE_LABELS[pet.grade] }}</span>
        </div>
      </div>

      <div class="ps-stats">
        <div class="ps-stat"><span>⚔️</span><b>{{ atk }}</b><small>ATK</small></div>
        <div class="ps-stat"><span>❤️</span><b>{{ hp }}</b><small>HP</small></div>
        <div class="ps-stat"><span>💰</span><b>{{ income }}</b><small>/วัน</small></div>
      </div>
      <div class="ps-substats">
        <span>🎯 Crit {{ crit }}%</span>
        <span>💥 CritDMG {{ critDmg }}%</span>
        <span v-if="lifesteal">🩸 {{ lifesteal }}%</span>
        <span v-if="dodge">💨 {{ dodge }}%</span>
      </div>

      <div v-if="pot.length" class="ps-pot">
        <div class="ps-pot-head">⚗️ ศักยภาพ</div>
        <div class="ps-pot-list">
          <span v-for="(a, i) in pot" :key="i" class="ps-aff">{{ affixMeta(a.stat).label }} +{{ a.value }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RARITY, GRADE_LABELS, petStats } from '../../data/index.js'
import { petDailyCoins } from '../../utils/petUtils.js'
import { statBonusPct, affixMeta } from '../../data/potential.js'

const props = defineProps({ pet: { type: Object, default: null } })
defineEmits(['close'])

const rc = computed(() => RARITY[props.pet?.rarity]?.color || '#94a3b8')
const rarityLabel = computed(() => RARITY[props.pet?.rarity]?.label || props.pet?.rarity)
const pot = computed(() => props.pet?.potential || [])
const base = computed(() => (props.pet ? petStats(props.pet) : { atk: 0, hp: 0 }))
const atk = computed(() => Math.round(base.value.atk * (1 + statBonusPct(pot.value, 'atk') / 100)))
const hp = computed(() => Math.round(base.value.hp * (1 + statBonusPct(pot.value, 'hp') / 100)))
const income = computed(() => props.pet ? petDailyCoins(props.pet) : 0)
const crit = computed(() => 5 + statBonusPct(pot.value, 'crit'))
const critDmg = computed(() => 50 + statBonusPct(pot.value, 'critDmg'))
const lifesteal = computed(() => statBonusPct(pot.value, 'lifesteal'))
const dodge = computed(() => statBonusPct(pot.value, 'dodge'))
</script>

<style scoped>
.ps-ov { position: fixed; inset: 0; z-index: 250; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
.ps-box { background: #fff; width: 100%; max-width: 320px; border-radius: 20px; overflow: hidden; }
.ps-hero { position: relative; padding: 20px 16px 14px; text-align: center; color: #fff; }
.ps-x { position: absolute; left: 10px; top: 10px; border: none; background: rgba(255,255,255,.25); color: #fff; border-radius: 8px; width: 26px; height: 26px; cursor: pointer; }
.ps-emoji { font-size: 3rem; }
.ps-name { font-size: 1.1rem; font-weight: 800; }
.ps-tags { display: flex; gap: 5px; justify-content: center; margin-top: 6px; }
.ps-tag { background: rgba(255,255,255,.25); font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
.ps-stats { display: flex; }
.ps-stat { flex: 1; text-align: center; padding: 13px 4px; border-right: 1px solid rgba(0,0,0,.06); }
.ps-stat:last-child { border-right: none; }
.ps-stat b { display: block; font-size: 1.1rem; font-weight: 800; }
.ps-stat small { font-size: .58rem; color: rgba(0,0,0,.45); }
.ps-substats { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 6px 14px; font-size: .62rem; color: rgba(0,0,0,.55); font-weight: 600; }
.ps-pot { padding: 10px 16px 16px; border-top: 1px solid rgba(0,0,0,.06); }
.ps-pot-head { font-weight: 800; font-size: .76rem; margin-bottom: 6px; }
.ps-pot-list { display: flex; flex-wrap: wrap; gap: 5px; }
.ps-aff { background: #f4edff; color: #7c3aed; font-size: .64rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; }
</style>
