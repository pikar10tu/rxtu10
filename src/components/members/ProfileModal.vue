<template>
  <div v-if="member" class="pm-ov" @click.self="$emit('close')">
    <div class="pm-box">
      <!-- Tier 1: hero (residence art = the flex background) -->
      <div class="pm-hero" :style="heroStyle">
        <button class="pm-x" @click="$emit('close')">✕</button>
        <div class="pm-hero-art">{{ tier.art }}</div>
        <img class="pm-avatar" :src="avatar" :alt="member.nickname" />
        <div class="pm-name">{{ member.nickname }}</div>
        <div v-if="member.realName" class="pm-real">{{ member.realName }}</div>
        <div class="pm-chips">
          <span class="pm-chip" :style="{ background: trackColor }">{{ trackLabel }}</span>
          <ResidenceBadge :level="lvl" />
          <span v-if="member.founder" class="pm-chip founder">🏅 ผู้บุกเบิก</span>
          <span class="pm-chip likes">❤️ {{ member.likes || 0 }}</span>
        </div>
      </div>

      <!-- Tier 2: stat strip (max 3, no coins) -->
      <div class="pm-stats">
        <div class="pm-stat"><span>⚔️</span><b>{{ member.pvpVictories || 0 }}</b><small>PvP ชนะ</small></div>
        <div class="pm-stat"><span>🏯</span><b>{{ member.towerBest || 0 }}</b><small>หอคอย</small></div>
        <div class="pm-stat"><span>🐾</span><b>{{ (member.pets || []).length }}</b><small>สัตว์เลี้ยง</small></div>
      </div>

      <!-- Tier 3: showcase pets -->
      <div v-if="showcase.length" class="pm-showcase">
        <div v-for="(p, i) in showcase" :key="i" class="pm-pet" :class="'r-' + (p.rarity || 'common')">{{ p.emoji }}</div>
      </div>

      <!-- Tier 4: contact (only filled rows) -->
      <div v-if="hasContact" class="pm-contact">
        <div v-if="member.contact?.phone"><span>📞</span>{{ member.contact.phone }}</div>
        <div v-if="member.contact?.ig"><span>📷</span>{{ member.contact.ig }}</div>
        <div v-if="member.contact?.line"><span>💬</span>{{ member.contact.line }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTier } from '../../data/residence.js'
import ResidenceBadge from '../residence/ResidenceBadge.vue'

const props = defineProps({ member: { type: Object, default: null } })
defineEmits(['close'])

const lvl  = computed(() => props.member?.residence?.level || 1)
const tier = computed(() => getTier(lvl.value))

const avatar = computed(() =>
  props.member?.customPhoto || props.member?.googlePhoto ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(props.member?.nickname || '?')}&size=128`
)
const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tier.value.frameColor}, ${tier.value.frameColor}99)`,
}))

const TRACK = { sci: ['สายวิทย์', '#22c55e'], care: ['บริบาล', '#3b82f6'], guest: ['เกสต์', '#9ca3af'] }
const trackLabel = computed(() => (TRACK[props.member?.track]?.[0]) || 'สมาชิก')
const trackColor = computed(() => (TRACK[props.member?.track]?.[1]) || '#6366f1')

const showcase = computed(() => (props.member?.pets || []).slice(0, 4))
const hasContact = computed(() => {
  const c = props.member?.contact || {}
  return !!(c.phone || c.ig || c.line)
})
</script>

<style scoped>
.pm-ov { position: fixed; inset: 0; z-index: 220; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.pm-box { background: #fff; width: 100%; max-width: 360px; border-radius: 20px; overflow: hidden; max-height: 88vh; overflow-y: auto; }
.pm-hero { position: relative; padding: 22px 16px 16px; text-align: center; color: #fff; overflow: hidden; }
.pm-hero-art { position: absolute; right: -10px; top: -10px; font-size: 5rem; opacity: .25; }
.pm-x { position: absolute; left: 12px; top: 12px; border: none; background: rgba(255,255,255,.25); color: #fff; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; }
.pm-avatar { width: 72px; height: 72px; border-radius: 50%; border: 3px solid rgba(255,255,255,.7); object-fit: cover; background: #fff; }
.pm-name { font-size: 1.2rem; font-weight: 800; margin-top: 6px; }
.pm-real { font-size: .72rem; opacity: .85; }
.pm-chips { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 10px; }
.pm-chip { font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: #fff; }
.pm-chip.likes { background: rgba(255,255,255,.25); }
.pm-chip.founder { background: rgba(0,0,0,.3); }
.pm-stats { display: flex; }
.pm-stat { flex: 1; text-align: center; padding: 14px 4px; border-right: 1px solid rgba(0,0,0,.06); }
.pm-stat:last-child { border-right: none; }
.pm-stat span { font-size: 1rem; }
.pm-stat b { display: block; font-size: 1.1rem; font-weight: 800; }
.pm-stat small { font-size: .6rem; color: rgba(0,0,0,.45); }
.pm-showcase { display: flex; gap: 8px; justify-content: center; padding: 12px; border-top: 1px solid rgba(0,0,0,.06); }
.pm-pet { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: 12px; border: 2px solid #cbd5e1; background: rgba(0,0,0,.03); }
.pm-pet.r-rare { border-color: #60a5fa; }
.pm-pet.r-epic { border-color: #c084fc; }
.pm-pet.r-legendary { border-color: #fbbf24; }
.pm-contact { padding: 12px 16px 16px; border-top: 1px solid rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 6px; font-size: .78rem; color: rgba(0,0,0,.65); }
.pm-contact div { display: flex; gap: 8px; align-items: center; }
</style>
