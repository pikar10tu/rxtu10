<!-- src/views/ArenaView.vue -->
<!-- สนามประลอง PvP — แต้มประลอง, หาคู่แบบสุ่ม (รูเล็ต) + พลังงาน, รางวัลรายวัน, จัดทีม
     สนามปิด = เด้งกลับ /play ทันที (นักศึกษาไม่เห็นหน้านี้เลย)
     admin: เข้าและบุกได้เสมอแม้ pvpOpen=false (ทดสอบก่อนเปิดจริง) -->
<template>
  <div class="tab-content">
    <div class="page-title ar-head">
      <span><Emoji char="⚔️" /> สนามประลอง</span>
      <span class="ar-head-r">
        <HelpButton topic="arena" />
        <RouterLink to="/play/pets" class="ar-back">‹ กลับ</RouterLink>
      </span>
    </div>

    <template v-if="authStore.isLoggedIn">
      <SeasonClaimBanner mode="arena" />
      <ArenaStatus
        :rating="rating" :wins="wins" :losses="losses" :attacks-left="attacksLeft"
        :my-rank="rivals.myRank" :total="rivals.total" :team="myTeam" :arena-ref="myArena"
        @pick="pickOpen = true" @arena="arenaOpen = true"
      />

      <!-- หาคู่ = สุ่มอย่างเดียว เลือกคู่ไม่ได้ (28 ก.ย. 2026 — แทนกระดาน 5 ช่อง ที่ทำให้คนรุมตีคนอ่อน) -->
      <!-- เอฟเฟกต์ประจำสัปดาห์ (config/app.pvpWeekly · data/pvpWeekly.js) — แอดมินกดเปิด 7 วัน หมดแล้วซ่อนเอง
           มีผลกับไฟต์จริงทั้งฝั่งบุกและตั้งรับ -->
      <div v-if="weekly" class="ar-weekly">
        <span class="ar-weekly-ico"><Emoji :char="weekly.icon" /></span>
        <span class="ar-weekly-l">
          <span class="ar-weekly-cap">เอฟเฟกต์ประจำสัปดาห์ · เหลือ {{ weeklyLeft }}</span>
          <b class="ar-weekly-t">{{ weekly.title }}</b>
          <span v-if="weekly.desc" class="ar-weekly-d">{{ weekly.desc }}</span>
        </span>
      </div>

      <!-- พลังงานติดปุ่มหาคู่ (user สั่ง 28 ก.ย. — เดิมอยู่ในแผงบน ไกลจนไม่มีใครเห็น) -->
      <div class="ar-energy">
        <span class="ar-dots" role="img" :aria-label="`พลังงาน ${attacksLeft} จาก ${energyMax} หน่วย`">
          <i v-for="i in energyMax" :key="i" :class="{ on: i <= attacksLeft }" />
        </span>
        <span class="ar-energy-txt">
          <b>พลังงาน {{ attacksLeft }}/{{ energyMax }}</b>
          <template v-if="energy.nextMs > 0"> · +1 หน่วยใน {{ countdown }}</template>
          <template v-else> · เต็มแล้ว</template>
        </span>
      </div>
      <button class="ar-find" :disabled="!canFight || busy || attacksLeft <= 0 || !myTeam.length" @click="onFind">
        <span class="ar-find-main"><Emoji char="⚔️" /> หาคู่ต่อสู้</span>
        <span class="ar-find-sub">{{ findSub }}</span>
      </button>

      <!-- รางวัลรายวัน: ลงสนามครบ 5 ครั้ง กดรับ -->
      <div class="ar-daily" :class="{ ready: canClaim }">
        <span class="ar-daily-l">
          <span class="ar-daily-t"><Emoji char="🎁" /> ลงสนามครบ {{ dailyGoal }} ครั้งวันนี้</span>
          <span class="ar-daily-bar"><i :style="{ width: Math.min(100, daily.n / dailyGoal * 100) + '%' }" /></span>
          <span class="ar-daily-n">{{ Math.min(daily.n, dailyGoal) }}/{{ dailyGoal }}</span>
        </span>
        <button class="ar-daily-btn" :disabled="!canClaim || busy" @click="onClaim">
          <template v-if="daily.claimed">รับแล้ว</template>
          <template v-else><Emoji char="🪙" /> {{ dailyReward.toLocaleString() }} + <Emoji :char="ANTI_LOSS.emoji" /></template>
        </button>
      </div>

      <!-- กดชื่อ → โปรไฟล์ (มีปุ่มท้าสู้ในนั้นอยู่แล้ว) · user สั่ง 29 ก.ย. -->
      <ArenaRankCard :rivals="rivals" @open="openProfile" />

      <ArenaGuide :rows="members.rosterRows" :hof="members.rosterHof" />

      <PvpHistory @open="openProfile" />
    </template>
    <div v-else class="ar-login">เข้าสู่ระบบเพื่อเล่น</div>

    <TeamPicker v-model:open="pickOpen" />
    <ArenaSheet v-model:open="arenaOpen" />
    <BattleReplay :data="replay" theme="arena" @close="replay = null">
      <!-- 💊 ยาแก้แพ้: แพ้แล้วกดใช้ได้เฉพาะบนจอนี้ -->
      <template #result-extra>
        <div v-if="replay?.loss && !replay.lossUsed" class="ar-al">
          <span class="ar-al-ico"><Emoji :char="ANTI_LOSS.emoji" /></span>
          <span class="ar-al-t"><b>{{ ANTI_LOSS.name }}</b> · มี {{ antiLoss }} ชิ้น
            <small>{{ antiLoss ? `กินแล้วแต้มไม่ลด คืน ${replay.loss.from - replay.loss.to} แต้ม` : 'ได้จากลงสนามครบ 5 ครั้ง/วัน และรางวัลขั้นหอคอย' }}</small></span>
          <button v-if="canAntiLoss(replay.loss)" class="ar-al-btn" :disabled="alBusy" @click="onAntiLoss">ใช้เลย</button>
        </div>
      </template>
    </BattleReplay>
    <ProfileModal :member="profileOf" @close="profileOf = null" />
    <PvpRoulette :open="spinning" :names="rouletteList" @done="onSpinDone" />
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink, useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { useArena } from '../composables/useArena.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'
import ArenaGuide from '../components/battle/ArenaGuide.vue'
import { ANTI_LOSS } from '../utils/antiLoss.js'
import PvpHistory from '../components/battle/PvpHistory.vue'
import ArenaStatus from '../components/battle/ArenaStatus.vue'
import SeasonClaimBanner from '../components/shared/SeasonClaimBanner.vue'
import ArenaRankCard from '../components/battle/ArenaRankCard.vue'
import { arenaRanking } from '../utils/arenaRivals.js'
import { PVP_RATING_START } from '../utils/pvpRating.js'
import PvpRoulette from '../components/battle/PvpRoulette.vue'
import { rouletteNames } from '../data/pvpRoulette.js'
import { activeWeekly } from '../data/pvpWeekly.js'
import HelpButton from '../components/help/HelpButton.vue'
import { rosterArena } from '../utils/arenas.js'
import ArenaSheet from '../components/battle/ArenaSheet.vue'
import ProfileModal from '../components/members/ProfileModal.vue'
import { toMember } from '../utils/roster.js'

const authStore = useAuthStore()
const members = useMembersStore()
const { pvpOpen, rawConfig } = useAppConfig()
const { rating, wins, losses, attacksLeft, energy, energyMax, myTeam, fight, daily, dailyGoal, dailyReward, canClaim, claimDaily, antiLoss, canAntiLoss, useAntiLoss } = useArena()

// 💊 ใช้แล้วแก้ผลบนจอเดิมเลย (แต้ม ±0 · ซ่อนการ์ด)
const alBusy = ref(false)
async function onAntiLoss() {
  const r = replay.value
  if (!r?.loss || alBusy.value) return
  alBusy.value = true
  try {
    if (await useAntiLoss(r.loss)) {
      replay.value = { ...r, lossUsed: true, rating: { from: r.loss.from, to: r.loss.from, delta: 0 }, loseText: `แพ้ แต่${ANTI_LOSS.name}ช่วยไว้` }
    }
  } finally { alBusy.value = false }
}

const pickOpen = ref(false)
const arenaOpen = ref(false)
const myArena = computed(() => rosterArena(authStore.userData))
const replay = ref(null)
const busy = ref(false)

// admin บุกได้เสมอ (ทดสอบก่อนเปิดจริง) เหมือน shopOpen
const canFight = computed(() => pvpOpen.value || authStore.isAdmin)

// สนามปิด (ไม่ใช่แอดมิน) = กันเข้าตรงผ่าน URL → เด้งกลับ /play (configLoaded แล้วเสมอเมื่อ view นี้ render)
const router = useRouter()
onMounted(() => { if (!canFight.value) router.replace('/play') })
watch(canFight, (ok) => { if (!ok) router.replace('/play') })   // admin ปิดสนามระหว่างมีคนอยู่ในหน้า

const rouletteList = computed(() => rouletteNames(rawConfig.value?.pvpRoulette))
const weekly = computed(() => activeWeekly(rawConfig.value?.pvpWeekly, energyNow()))
const weeklyLeft = computed(() => fmtLeft(weekly.value ? weekly.value.endsAt - energyNow() : 0))
// energy.value ขยับทุกวิ (now ใน useArena) — ใช้เป็นนาฬิกาของหน้าไปด้วย ป้ายเอฟเฟกต์จะหายเองตอนหมดเวลา
const energyNow = () => { void energy.value; return Date.now() }
function fmtLeft(ms) {
  const m = Math.max(0, Math.floor(ms / 60000))
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60)
  return d > 0 ? `${d} วัน ${h} ชม.` : h > 0 ? `${h} ชม. ${m % 60} นาที` : `${m % 60} นาที`
}
const countdown = computed(() => {
  const t = Math.ceil(energy.value.nextMs / 1000)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
})
const findSub = computed(() => {
  if (!myTeam.value.length) return 'จัดทีมก่อนนะ'
  if (attacksLeft.value > 0) return `ใช้พลังงาน 1 หน่วย · เหลือ ${attacksLeft.value}/${energyMax}`
  return `พลังงานหมด · อีก ${Math.ceil(energy.value.nextMs / 60000)} นาทีได้เพิ่ม 1 หน่วย`
})

// อันดับแต้มประลองทั้งรุ่น — อ่าน rosterRows ดิบ (rosterUsers key ด้วย studentId แล้วตก guest)
// ค่าสดของเราจาก useArena ทับแถวตัวเองใน roster ซึ่งอาจเก่ากว่าหนึ่งไฟต์
// ⚠️ ไม่มี Firestore read เพิ่ม — roster โหลดไว้แล้วตอน onMounted
const rivals = computed(() => {
  const meUid = authStore.currentUser?.uid || 'me'
  const others = Object.entries(members.rosterRows || {})
    .filter(([uid, r]) => r && uid !== meUid)
    .map(([uid, r]) => ({
      uid,
      nickname: r.n || '?',
      rating: typeof r.r === 'number' ? r.r : PVP_RATING_START,
      wins: r.pw || 0,
      losses: r.pl || 0,
    }))
  return arenaRanking(others, {
    uid: meUid,
    nickname: authStore.userData?.nickname || 'ฉัน',
    rating: rating.value, wins: wins.value, losses: losses.value,
  })
})

// กด → ยิงไฟต์จริงทันที (เขียนผลแล้ว) คู่ขนานกับรูเล็ต · replay ขึ้นเมื่อทั้งสองเสร็จ
const spinning = ref(false)
let pending = null      // ผลไฟต์ที่รอรูเล็ตหมุนจบ
let spinDone = false
function reveal() {
  if (!spinDone || !pending) return
  spinning.value = false
  replay.value = pending
  pending = null
}
function onSpinDone() { spinDone = true; reveal() }

async function onFind() {
  if (busy.value) return
  busy.value = true; spinDone = false; pending = null
  spinning.value = true
  // ⚠️ หยิบแต้มก่อน await — fight() เขียนแต้มใหม่แบบ synchronous (CLAUDE.md ข้อ 9)
  const myRating = rating.value
  const myArenaRef = rosterArena(authStore.userData)
  try {
    const r = await fight()
    if (!r) { spinning.value = false; return }   // toast บอกเหตุแล้วใน fight()
    const opp = r.opp
    // สนามครึ่งบน = ของคู่ต่อสู้ (แถว roster · บอทไม่มีแถว = สนามฟรี) · ครึ่งล่าง = ของเรา
    const top = opp?.isBot ? null : (members.rosterRows?.[opp?.uid]?.ar ?? null)
    const sides = {
      top: { name: opp?.isBot ? 'หุ่นซ้อม' : (opp?.nickname || '?'), rating: opp?.rating ?? null },
      bot: { name: 'คุณ', rating: myRating },
    }
    pending = { ...r, sides, arenas: { top, bot: myArenaRef } }
    reveal()
  } catch (e) {
    console.error('[arena find]', e); spinning.value = false
  } finally { busy.value = false }
}

async function onClaim() {
  if (busy.value) return
  busy.value = true
  try { await claimDaily() } finally { busy.value = false }
}

onMounted(() => { members.loadRoster() })

const profileOf = ref(null)
function openProfile(uid) {
  const row = members.rosterRows?.[uid]
  if (row) profileOf.value = toMember(uid, row)
}
</script>

<style scoped>
.ar-head { display: flex; align-items: center; justify-content: space-between; }
.ar-head-r { display: flex; align-items: center; gap: 8px; }
.ar-back { font-size: .8rem; color: var(--muted); text-decoration: none; }
.ar-weekly { display: flex; align-items: center; gap: 10px; background: #fdf2f8; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); padding: 10px 12px; margin-bottom: 12px; }
.ar-weekly-ico { font-size: 1.6rem; flex-shrink: 0; }
.ar-weekly-l { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ar-weekly-cap { font-size: .7rem; font-weight: 800; color: #be185d; }
.ar-weekly-t { font-size: .88rem; }
.ar-weekly-d { font-size: .74rem; color: rgba(0,0,0,.6); line-height: 1.45; }
.ar-energy { display: flex; align-items: center; gap: 8px; background: #fff; border: var(--bw) solid var(--line); border-bottom: none; border-radius: 16px 16px 0 0; padding: 8px 12px; }
.ar-dots { display: inline-flex; gap: 4px; }
.ar-dots i { width: 14px; height: 14px; border-radius: 50%; background: rgba(0,0,0,.08); border: 1.5px solid rgba(0,0,0,.18); }
.ar-dots i.on { background: #facc15; border-color: #ca8a04; }
.ar-energy-txt { font-size: .76rem; color: rgba(0,0,0,.6); }
.ar-energy-txt b { color: var(--ink); }
.ar-energy + .ar-find { border-radius: 0 0 16px 16px; }
.ar-find { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 3px; border: var(--bw) solid var(--line); border-radius: 16px; padding: 16px 12px; margin-bottom: 12px; font-family: inherit; color: #fff; background: linear-gradient(160deg, #e11d48, #f97316); box-shadow: var(--pop); cursor: pointer; }
.ar-find:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.ar-find:disabled { background: #cbd5e1; box-shadow: none; cursor: default; }
.ar-find-main { font-size: 1.15rem; font-weight: 800; }
.ar-find-sub { font-size: .74rem; font-weight: 700; opacity: .9; }
.ar-daily { display: flex; align-items: center; gap: 10px; background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); padding: 10px 12px; margin-bottom: 16px; }
.ar-daily.ready { background: #fef9c3; }
.ar-daily-l { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.ar-daily-t { font-size: .8rem; font-weight: 800; }
.ar-daily-bar { height: 8px; border-radius: 999px; background: rgba(0,0,0,.08); overflow: hidden; }
.ar-daily-bar i { display: block; height: 100%; background: #f59e0b; border-radius: 999px; transition: width .3s; }
.ar-daily-n { font-size: .7rem; color: rgba(0,0,0,.55); font-weight: 700; }
.ar-daily-btn { flex-shrink: 0; border: var(--bw) solid var(--line); border-radius: 11px; padding: 9px 12px; font-family: inherit; font-weight: 800; font-size: .78rem; background: #fde68a; box-shadow: var(--pop); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.ar-daily-btn:disabled { background: #e2e8f0; color: rgba(0,0,0,.45); box-shadow: none; cursor: default; }
.ar-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
.ar-al { display: flex; align-items: center; gap: 10px; margin: 10px auto 0; max-width: 320px; background: #fff; color: #1e293b; border-radius: 14px; padding: 10px 12px; text-align: left; }
.ar-al-ico { font-size: 1.8rem; line-height: 1; }
.ar-al-t { flex: 1; min-width: 0; font-size: .8rem; }
.ar-al-t small { display: block; font-size: .7rem; color: #64748b; margin-top: 2px; }
.ar-al-btn { font-family: inherit; font-weight: 800; font-size: .8rem; border: 0; border-radius: 10px; padding: 8px 12px; background: var(--accent); color: #3d1830; cursor: pointer; }
.ar-al-btn:disabled { opacity: .5; }
</style>
