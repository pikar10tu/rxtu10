<template>
  <div class="tab-content">
    <div class="page-title ph-head">
      <RouterLink to="/play" class="ph-back" aria-label="กลับ">‹</RouterLink>
      <span><Emoji char="🐾" /> โหมดเพ็ท</span>
      <HelpButton topic="pets" />
    </div>

    <!-- 🎁 ตำนานตัวแรกเป็นของขวัญ (user 28 ต.ค.) — ยังไม่มีเพ็ท/ยังไม่มีตำนาน · ครั้งเดียว -->
    <button v-if="giftOn" type="button" class="ph-gift" @click="giftOpen = true">
      <span class="ph-gift-ic"><Emoji char="🎁" /></span>
      <span class="ph-gift-t"><b>ของขวัญต้อนรับ เลือกตำนานได้ 1 ตัว</b><small>เลือกเพื่อนคู่ใจตัวแรกไปลุยด้วยกัน</small></span>
      <span class="go-go">›</span>
    </button>
    <BottomSheet :open="giftOpen" @update:open="giftOpen = $event" icon="🎁" title="เลือกตำนาน 1 ตัว">
      <div class="gift-grid">
        <button v-for="p in STARTER_LEGENDS" :key="p.id" type="button" class="gift-pet" :class="{ on: giftPick === p.id }" @click="giftPick = p.id">
          <span class="gift-emo"><Emoji :char="p.emoji" /></span>
          <b>{{ p.name }}</b>
          <small v-if="passiveOf(p)">{{ passiveOf(p).name }}</small>
        </button>
      </div>
      <p v-if="giftPick && passiveOf({ id: giftPick })" class="gift-desc">{{ passiveText(giftPick) }}</p>
      <button type="button" class="gift-ok" :disabled="!giftPick || giftBusy" @click="claimGift">
        {{ giftPick ? `รับ ${defName(giftPick)} เข้าคลัง` : 'แตะเลือกตัวที่ชอบก่อนนะ' }}
      </button>
      <small class="gift-note">เลือกได้ครั้งเดียว ตัวอื่นไปอัญเชิญต่อได้ที่ร้านเพ็ท</small>
    </BottomSheet>

    <!-- แบบ A (user เลือก 4 ต.ค. 2026): กล่องบน = ทีม + ปุ่มจัดทีม/คลัง · ล่าง = เฉพาะโหมดที่ไปสู้
         ทุกอย่างมีทางเข้าทางเดียว — เดิมการ์ดหัวกับการ์ด 'จัดทีม' พาไป /team ซ้ำกันจนเพื่อนงง -->
    <div class="ph-hero">
      <div class="ph-hero-top"><b>ทีมของฉัน</b></div>
      <div class="ph-team">
        <span v-for="(e, i) in teamEmojis" :key="i" class="ph-team-pet" :class="{ empty: !e }"><Emoji v-if="e" :char="e" /><template v-else>＋</template></span>
      </div>
      <div class="ph-stats">
        <span><b>{{ petCount }}</b> ตัว</span>
        <span><b>{{ legendCount }}</b> เลเจนด์</span>
        <span>หอคอยชั้น <b>{{ authStore.userData?.towerBest || 0 }}</b></span>
      </div>
      <div class="ph-btns">
        <RouterLink to="/team" class="ph-btn main"><Emoji char="🛡️" /> จัดทีม</RouterLink>
        <RouterLink to="/pets" class="ph-btn"><Emoji char="📦" /> คลังเพ็ท</RouterLink>
      </div>
    </div>
    <!-- เลือกเองว่าวันนี้จะไปลุยที่ไหน — 3 ทางน้ำหนักเท่ากัน ไม่ดันเข้าหอคอยอย่างเดียว (user เคาะจากเดโม 25 ต.ค. 2026) -->
    <div class="ph-sec">วันนี้ไปลุยที่ไหนดี?</div>
    <div class="go-list">
      <RouterLink v-if="pvpOpen || authStore.isAdmin" to="/arena" class="go g-arena">
        <span v-if="arenaDot" class="nav-dot gc-dot" aria-label="มีรางวัลรอรับ"></span>
        <span class="go-ic"><Emoji char="⚔️" /></span>
        <span class="go-t"><b>ลุยสนามประลอง</b><small>สู้ทีมเพื่อนในรุ่น ไต่อันดับซีซั่น</small></span>
        <span class="go-go">›</span>
      </RouterLink>
      <RouterLink to="/tower" class="go g-tower">
        <span v-if="towerDot" class="nav-dot gc-dot" aria-label="มีรางวัลซีซั่นรอรับ"></span>
        <span class="go-ic"><Emoji char="🏯" /></span>
        <span class="go-t"><b>ไต่หอคอย</b><small>ชั้น {{ towerBest }} · ยิ่งสูงรายได้รายวันยิ่งเยอะ</small></span>
        <!-- 🪙 รายได้หอคอย/วัน ตรงที่โล่งขวาการ์ด — ดึงคนไต่หอ (user 28 ต.ค.) · ยังไม่เคยไต่ = โชว์ว่าชั้น 1 ได้เท่าไร -->
        <span class="go-inc">
          <template v-if="towerBest > 0"><b><Emoji char="🪙" /> {{ towerInc.toLocaleString() }}</b><small>ต่อวัน</small></template>
          <template v-else><b class="go-inc-none">ยังไม่มีรายได้จากหอคอย</b><small>ชนะชั้นแรก ก็มีเหรียญเข้าทุกวันแล้วนะ</small></template>
          <small v-if="towerBest > 0 && towerNext > 0" class="go-inc-up">ชั้นถัดไป +{{ towerNext.toLocaleString() }}</small>
        </span>
        <span class="go-go">›</span>
      </RouterLink>
      <RouterLink v-if="dungeonOpen" to="/dungeon" class="go g-dun">
        <span class="go-ic"><Emoji char="🎃" /></span>
        <span class="go-t"><b>ลงดันเจี้ยน</b><small>ฟักทองบุก · ฟาร์มฟักทอง</small></span>
        <span class="go-go">›</span>
      </RouterLink>
      <div v-else class="go g-soon">
        <span class="go-ic"><Emoji char="🗝️" /></span>
        <span class="go-t"><b>ลงดันเจี้ยน</b><small>เร็วๆ นี้</small></span>
      </div>
      <!-- ส่งผจญภัยพับเก็บ 25 ก.ย. 2026 · บอสรวมรุ่นถอดการ์ด "เร็วๆ นี้" ออก 25 ต.ค. (ดันเจี้ยนมาแทนที่ช่องนี้) -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import SoonCard from '../components/shared/SoonCard.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { useAuthStore } from '../stores/auth.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { useNavDots } from '../composables/useNavDots.js'
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { getPetDef } from '../data/index.js'
import { BATTLE_SLOTS } from '../data/residence.js'
import { activeEvent } from '../utils/event.js'
import { PUMPKIN_DUNGEON } from '../data/dungeons.js'
import { getTowerBonus, towerBonusGain } from '../data/towerFloors.js'
import BottomSheet from '../components/shared/BottomSheet.vue'
import { STARTER_LEGENDS, starterEligible, starterPatch } from '../utils/starterGift.js'
import { passiveOf as petPassiveOf } from '../data/index.js'
import { passiveText as fmtPassive } from '../data/petPassives.js'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast.js'

const authStore = useAuthStore()
const { pvpOpen, expeditionOpen } = useAppConfig()
const { exp } = useExpedition()
const { towerDot, arenaDot } = useNavDots()
// 🎁 ตำนานของขวัญ · ยังไม่มีเพ็ทเลยแต่มีตั๋ว = พาไปอัญเชิญที่ร้านเพ็ทก่อน (ตั๋วต้อนรับ 50 ใบ)
const router = useRouter()
const { toast } = useToast()
const passiveOf = petPassiveOf
const giftOn = computed(() => starterEligible(authStore.userData))
const giftOpen = ref(false), giftPick = ref(null), giftBusy = ref(false)
const defName = (id) => STARTER_LEGENDS.find(p => p.id === id)?.name || ''
const passiveText = (id) => { const p = petPassiveOf({ id }); return p ? fmtPassive(p, 1) : '' }
async function claimGift() {
  const patch = starterPatch(authStore.userData, giftPick.value)
  if (!patch || giftBusy.value) return
  giftBusy.value = true
  const ok = await authStore.patchUser(patch, patch)
  giftBusy.value = false
  if (ok) { giftOpen.value = false; toast(`ได้ ${defName(giftPick.value)} แล้ว ไปจัดทีมกันเลย!`, 'success') }
  else toast('รับของขวัญไม่สำเร็จ ลองใหม่อีกทีนะ', 'error')
}
onMounted(() => {
  const u = authStore.userData
  if (u && !(u.pets || []).length && (u.freeGachaTickets || 0) > 0) router.replace({ path: '/shop', query: { tab: 'pet' } })
})
const towerBest = computed(() => authStore.userData?.towerBest || 0)
const towerInc = computed(() => getTowerBonus(towerBest.value))
const towerNext = computed(() => towerBonusGain(towerBest.value + 1, towerBest.value))
// ดันเจี้ยนตอนนี้มีแค่ดันฟักทอง — เปิดตามอีเวนต์ (ดันหิน/ดันทองยังไม่ทำ)
const dungeonOpen = activeEvent()?.id === PUMPKIN_DUNGEON.ev
// การ์ดหัว
const team = computed(() => resolveBattleTeam(authStore.userData?.activePets, authStore.userData?.pets))
const teamEmojis = computed(() => Array.from({ length: BATTLE_SLOTS }, (_, i) => getPetDef(team.value[i]?.id)?.emoji || null))
const petCount = computed(() => (authStore.userData?.pets || []).length)
const legendCount = computed(() => (authStore.userData?.pets || []).filter(p => p?.rarity === 'legendary').length)

// coarse tick (5s) ให้ badge ส่งผจญภัยสด
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(timer))

const expState = computed(() => expeditionState(exp.value, now.value))
</script>

<style scoped>
.ph-head { display: flex; align-items: center; gap: 8px; }
.ph-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }

/* ทางไปลุย 3 ทาง */
.ph-gift { all: unset; box-sizing: border-box; cursor: pointer; width: 100%; display: flex; align-items: center; gap: 12px; margin: 6px 0 10px; padding: 12px 14px; border-radius: 18px;
  background: linear-gradient(120deg, #fff7d6, #ffe4f1); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.ph-gift-ic { font-size: 1.8rem; }
.ph-gift-t { flex: 1; display: flex; flex-direction: column; }
.ph-gift-t b { font-size: .92rem; } .ph-gift-t small { font-size: .74rem; color: var(--muted); }
.gift-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.gift-pet { all: unset; cursor: pointer; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px; border-radius: 14px; background: #fff; border: 2px solid transparent; box-shadow: var(--pop); text-align: center; }
.gift-pet.on { border-color: #f59e0b; background: #fffbeb; }
.gift-emo { font-size: 1.9rem; }
.gift-pet b { font-size: .8rem; } .gift-pet small { font-size: .7rem; color: var(--muted); }
.gift-desc { font-size: .8rem; margin: 10px 2px 0; color: var(--ink); }
.gift-ok { width: 100%; margin-top: 12px; padding: 12px; border: 0; border-radius: 14px; font: inherit; font-weight: 800; color: #fff; background: #6246b8; cursor: pointer; }
.gift-ok:disabled { opacity: .5; cursor: default; }
.gift-note { display: block; text-align: center; font-size: .72rem; color: var(--muted); margin-top: 6px; }
.go-list { display: flex; flex-direction: column; gap: 8px; }
.go { position: relative; display: flex; align-items: center; gap: 12px; text-decoration: none; color: #2b1f3d; border-radius: 18px; padding: 14px; box-shadow: var(--pop); border: var(--bw) solid var(--line); }
.go:active { transform: translate(1px, 1px); }
.go-ic { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,.7); display: grid; place-items: center; font-size: 1.7rem; flex-shrink: 0; }
.go-t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.go-t b { font-size: 1rem; }
.go-t small { font-size: .74rem; color: rgba(43,31,61,.72); }
.go-go { font-size: 1.4rem; font-weight: 800; opacity: .5; }
.go-inc { display: flex; flex-direction: column; align-items: flex-end; text-align: right; flex-shrink: 0; line-height: 1.2; }
.go-inc b { font-size: 1.05rem; color: #5b3fb0; white-space: nowrap; }
.go-inc small { font-size: .7rem; color: rgba(43,31,61,.65); }
.go-inc .go-inc-none { font-size: .8rem; color: #6b5a8e; }
.go-inc .go-inc-up { color: #15803d; font-weight: 700; }
.g-arena { background: linear-gradient(120deg, #ffe4e6, #fecdd3); }
.g-tower { background: linear-gradient(120deg, #ede9fe, #ddd6fe); }
.g-dun { background: linear-gradient(120deg, #ffedd5, #fed7aa); }
.g-soon { background: #f6f4f9; border-style: dashed; opacity: .75; }

/* การ์ดเกม (ยกจาก PlayView เดิม) */
.play-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.game-card { all: unset; cursor: pointer; box-sizing: border-box; background: #e2f7f0; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: transform .12s, box-shadow .12s; }
.game-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.game-card { position: relative; }
.gc-dot { top: 8px; right: 8px; width: 12px; height: 12px; }
.gc-emoji { font-size: 1.6rem; }
.gc-name { font-size: .8rem; font-weight: 800; }
.gc-badge { font-size: .7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.gc-badge.ready { color: #15803d; background: rgba(34,197,94,.16); }
.gc-badge.plant { color: #b45309; background: rgba(251,191,36,.18); }
.gc-badge.grow  { color: rgba(0,0,0,.45); background: rgba(0,0,0,.05); }

/* ═══ จัดใหม่ 25 ก.ย. 2026 ═══ */
.ph-hero { display: block; text-decoration: none; color: var(--ink); margin: 6px 0 12px; padding: 14px; border-radius: 22px;
  background: linear-gradient(140deg, #e6dcfd 0%, #fff 55%, #fde2ee 100%); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.ph-hero-top { display: flex; align-items: baseline; justify-content: space-between; }
.ph-hero-top b { font-size: .95rem; }
.ph-hero-go { font-size: .74rem; font-weight: 700; color: #6246b8; }
.ph-team { display: flex; justify-content: center; gap: 10px; margin: 12px 0; }
.ph-team-pet { width: 62px; height: 62px; border-radius: 18px; display: grid; place-items: center; font-size: 2.1rem; background: #fff; box-shadow: var(--pop); }
.ph-team-pet.empty { background: rgba(255,255,255,.6); border: 2px dashed #c9b8f4; box-shadow: none; color: #b9a6ef; font-size: 1.3rem; }
.ph-stats { display: flex; justify-content: center; gap: 14px; font-size: .74rem; color: var(--muted); }
.ph-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.ph-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 14px; font-size: .86rem; font-weight: 800; text-decoration: none; color: #6246b8; background: #fff; border: var(--bw) solid var(--line); }
.ph-btn.main { background: #6246b8; color: #fff; border-color: transparent; }
.ph-btn:active { transform: translateY(1px); }
.ph-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.ph-sec { font-size: .78rem; font-weight: 800; color: var(--muted); margin: 0 2px 6px; }
.ph-stats b { color: var(--ink); font-size: .9rem; }
.play-grid { gap: 10px; }
.game-card { --gc: #e6dcfd; background: linear-gradient(160deg, var(--gc), #fff 75%); border-radius: 18px; padding: 14px 8px; box-shadow: var(--pop); transition: transform .12s; }
.game-card:active { transform: translateY(1px); box-shadow: var(--pop); }
.gc-emoji { font-size: 2rem; }
.gc-name { font-size: .86rem; }
.gc-team { --gc: #ece8ff; } .gc-col { --gc: #e6f5fc; } .gc-shop { --gc: #fde2ee; } .gc-tower { --gc: #e6dcfd; } .gc-arena { --gc: #fbd5e3; } .gc-exp { --gc: #d6f5e3; }
</style>
