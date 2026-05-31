<template>
  <div v-if="member" class="pf-ov" @click.self="$emit('close')">
    <div class="pf-box">
      <!-- Tier 1: hero (residence art = the flex background) -->
      <div class="pf-hero" :style="heroStyle">
        <button class="pf-x" @click="$emit('close')">✕</button>
        <div class="pf-hero-art">{{ tier.art }}</div>
        <img class="pf-avatar" :src="avatar" :alt="member.nickname" />
        <div v-if="member.realName" class="pf-real">{{ member.realName }}</div>
        <div class="pf-name">{{ member.nickname }}</div>
        <div class="pf-residence">{{ tier.art }} {{ tier.tierName }} · Lv.{{ lvl }}</div>
        <div class="pf-chips">
          <span class="pf-chip" :style="{ background: trackColor }">{{ trackLabel }}</span>
          <button class="pf-chip like" :class="{ on: likedToday }" @click="likeOnce">
            {{ likedToday ? '❤️' : '🤍' }} {{ member.likes || 0 }}
          </button>
        </div>
        <div class="pf-chips" style="margin-top:5px"><TagChips :member="member" /></div>
      </div>

      <!-- Tier 2: stat strip (max 3, no coins) -->
      <div class="pf-stats">
        <div class="pf-stat"><span>⚔️</span><b>{{ member.pvpVictories || 0 }}</b><small>PvP ชนะ</small></div>
        <div class="pf-stat"><span>🏯</span><b>{{ member.towerBest || 0 }}</b><small>หอคอย</small></div>
        <div class="pf-stat"><span>🐾</span><b>{{ (member.pets || []).length }}</b><small>สัตว์เลี้ยง</small></div>
      </div>

      <!-- Tier 3: showcase pets -->
      <div v-if="showcase.length" class="pf-showcase">
        <div v-for="(p, i) in showcase" :key="i" class="pf-pet" :class="'r-' + (p.rarity || 'common')">{{ p.emoji }}</div>
      </div>

      <!-- Tier 4: contact (only filled rows) -->
      <div v-if="hasContact" class="pf-contact">
        <div v-if="member.contact?.phone"><span>📞</span>{{ member.contact.phone }}</div>
        <div v-if="member.contact?.ig"><span>📷</span>{{ member.contact.ig }}</div>
        <div v-if="member.contact?.line"><span>💬</span>{{ member.contact.line }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { getTier } from '../../data/residence.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import TagChips from '../shared/TagChips.vue'

const props = defineProps({ member: { type: Object, default: null } })
defineEmits(['close'])

const auth = useAuthStore()
const { toast } = useToast()

const lvl  = computed(() => props.member?.residence?.level || 1)
const tier = computed(() => getTier(lvl.value))

// ── Likes (daily: +1 per person per day, never decreases, no unlike) ──
const myUid = computed(() => auth.currentUser?.uid)
const today = () => new Date().toDateString()
const likedToday = computed(() =>
  !!(props.member?.likedBy && myUid.value && props.member.likedBy[myUid.value] === today())
)
async function likeOnce() {
  const m = props.member
  if (!m) return
  if (!myUid.value) { toast('ต้องเข้าสู่ระบบก่อน', 'info'); return }
  if (m.registered === false || String(m.uid).startsWith('static_')) {
    toast('เพื่อนคนนี้ยังไม่เข้าระบบ ไลก์ไม่ได้', 'info'); return
  }
  if (m.uid === myUid.value) { toast('ไลก์ตัวเองไม่ได้นะ 😅', 'info'); return }
  if (likedToday.value) { toast('ไลก์เพื่อนคนนี้วันนี้แล้ว เดี๋ยวพรุ่งนี้มาใหม่!', 'info'); return }

  const d = today()
  // optimistic
  if (!m.likedBy) m.likedBy = {}
  m.likedBy[myUid.value] = d
  m.likes = (m.likes || 0) + 1
  try {
    await updateDoc(doc(db, 'users', m.uid), {
      likes: increment(1),
      [`likedBy.${myUid.value}`]: d,
    })
    toast('ส่งหัวใจให้แล้ว ❤️', 'success')
  } catch (e) {
    console.error('[like]', e)
    toast('กดไลก์ไม่สำเร็จ (สิทธิ์)', 'error')
  }
}

const avatar = computed(() =>
  props.member?.customPhoto || props.member?.googlePhoto ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(props.member?.nickname || '?')}&size=128`
)
const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tier.value.frameColor}, ${tier.value.frameColor}99)`,
}))

const TRACK = { sci: ['Sci', '#22c55e'], care: ['Care', '#3b82f6'], guest: ['Guest', '#9ca3af'] }
const trackLabel = computed(() => (TRACK[props.member?.track]?.[0]) || 'สมาชิก')
const trackColor = computed(() => (TRACK[props.member?.track]?.[1]) || '#6366f1')

const showcase = computed(() => (props.member?.pets || []).slice(0, 4))
const hasContact = computed(() => {
  const c = props.member?.contact || {}
  return !!(c.phone || c.ig || c.line)
})
</script>

<style scoped>
.pf-ov { position: fixed; inset: 0; z-index: 220; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.pf-box { background: #fff; width: 100%; max-width: 400px; border-radius: 20px; overflow: hidden; max-height: 88vh; overflow-y: auto; }
.pf-hero { position: relative; padding: 22px 16px 16px; text-align: center; color: #fff; overflow: hidden; }
.pf-hero-art { position: absolute; right: -10px; top: -10px; font-size: 5rem; opacity: .25; }
.pf-x { position: absolute; left: 12px; top: 12px; border: none; background: rgba(255,255,255,.25); color: #fff; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; }
.pf-avatar { width: 72px; height: 72px; border-radius: 50%; border: 3px solid rgba(255,255,255,.7); object-fit: cover; background: #fff; }
.pf-real {
  font-size: 1.15rem; font-weight: 800; margin-top: 8px; padding: 0 14px;
  line-height: 1.25;
}
.pf-name { font-size: .82rem; font-weight: 600; opacity: .85; margin-top: 1px; }
.pf-chips { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 10px; }
.pf-chip { font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: #fff; }
.pf-chip.likes { background: rgba(255,255,255,.25); }
.pf-chip.founder { background: rgba(0,0,0,.3); }
.pf-residence {
  font-size: .72rem; font-weight: 700; margin-top: 6px; opacity: .95; padding: 0 14px;
  line-height: 1.3;
}
.pf-chip.like {
  border: none; cursor: pointer; font-family: inherit; font-weight: 800;
  background: rgba(255,255,255,.25); color: #fff; transition: transform .12s;
}
.pf-chip.like:disabled { opacity: .7; cursor: default; }
.pf-chip.like.on { background: rgba(255,255,255,.4); }
.pf-chip.like:active:not(:disabled) { transform: scale(1.12); }
.pf-stats { display: flex; }
.pf-stat { flex: 1; text-align: center; padding: 14px 4px; border-right: 1px solid rgba(0,0,0,.06); }
.pf-stat:last-child { border-right: none; }
.pf-stat span { font-size: 1rem; }
.pf-stat b { display: block; font-size: 1.1rem; font-weight: 800; }
.pf-stat small { font-size: .6rem; color: rgba(0,0,0,.45); }
.pf-showcase { display: flex; gap: 8px; justify-content: center; padding: 12px; border-top: 1px solid rgba(0,0,0,.06); }
.pf-pet { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: 12px; border: 2px solid #cbd5e1; background: rgba(0,0,0,.03); }
.pf-pet.r-rare { border-color: #60a5fa; }
.pf-pet.r-epic { border-color: #c084fc; }
.pf-pet.r-legendary { border-color: #fbbf24; }
.pf-contact { padding: 12px 16px 16px; border-top: 1px solid rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 6px; font-size: .78rem; color: rgba(0,0,0,.65); }
.pf-contact div { display: flex; gap: 8px; align-items: center; }
</style>
