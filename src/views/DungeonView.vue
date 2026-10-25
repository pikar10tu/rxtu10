<!-- ดันฟักทอง (อีเวนต์ฮาโลวีน 2026) — เล่นคนเดียว · 1 ตา = 3 เวฟ · ชนะครบถึงได้ฟักทอง
     ตาที่ชนะ 5 ตาแรกของวัน ×5 แล้วได้ฐานปกติ (data/dungeons.js · utils/dungeon.js)
     🔒 นับผลเมื่อดูรีเพลย์เวฟสุดท้ายจบถึงหน้าสรุป (แบบเดียวกับหอคอย) · กดออกกลางทาง = ไม่ได้รางวัล -->
<template>
  <div class="tab-content dg">
    <div class="page-title dg-head">
      <RouterLink to="/play/pets" class="dg-back" aria-label="กลับ">‹</RouterLink>
      <span class="dg-title"><small>ดันเจี้ยน ›</small> <Emoji :char="D.emoji" /> {{ D.name }}</span>
      <RouterLink v-if="ev" to="/event" class="dg-pts"><Emoji :char="ev.pt" /> {{ pts.toLocaleString() }}</RouterLink>
    </div>

    <div v-if="!ev" class="dg-empty">ฟักทองบุกจบแล้ว ไว้เจอกันอีเวนต์หน้านะ</div>

    <template v-else>
      <div class="dg-how">
        <b>ชนะครบ 3 ด่านในตาเดียว ได้ฟักทอง</b>
        <span v-if="left">โบนัส ×{{ BONUS_MULT }} วันนี้เหลือ <span class="dg-candy-inline"><Emoji v-for="i in left" :key="i" char="🍬" /></span></span>
        <span v-else>โบนัส ×{{ BONUS_MULT }} วันนี้หมดแล้ว</span>
      </div>

      <div class="dg-team">
        <span class="dg-team-l">ทีมที่จะลง</span>
        <span v-for="(p, i) in teamFaces" :key="i" class="dg-face"><Emoji :char="p" /></span>
        <RouterLink to="/team" class="dg-edit">จัดทีม ›</RouterLink>
      </div>

      <!-- ปลดตามลำดับ ง่าย → กลาง → ยาก (ต้องชนะขั้นก่อนหน้า 1 ครั้ง) -->
      <button v-for="(t, i) in D.tiers" :key="t.t" class="dg-tier" :class="['t' + t.t, { locked: !tierUnlocked(auth.userData, ev, t) }]"
              :disabled="busy || !tierUnlocked(auth.userData, ev, t)" @click="pickTier = t">
        <span class="dg-tier-t"><b><template v-if="!tierUnlocked(auth.userData, ev, t)"><Emoji char="🔒" /> </template>{{ t.label }}</b>
          <small>{{ tierUnlocked(auth.userData, ev, t) ? t.hint : `ผ่าน${D.tiers[i - 1].label}ก่อน` }}</small></span>
        <span class="dg-tier-r"><b><Emoji :char="ev.pt" /> {{ rewardOf(t) }}</b><small v-if="left">ปกติ {{ t.reward }}</small></span>
      </button>
    </template>

    <!-- เลือกขั้นแล้วจัดทีมก่อนเริ่ม (user 25 ต.ค. 2026) · ศัตรูที่โชว์ = ด่านสุดท้ายของขั้น -->
    <TeamPicker :open="!!pickTier" @update:open="v => { if (!v) pickTier = null }" :enemies="pickTier ? waveTeam(pickTier.waves[pickTier.waves.length - 1]) : []"
                :enemy-label="'บอสด่านสุดท้าย'" :context="pickTier ? `${D.name} · ${pickTier.label}` : ''" done-label="🎃 เริ่มลุย"
                @done="startPicked">
      <template #cta-extra>
        <div class="dg-cta">
          <!-- 🍬 = ตา ×5 ที่เหลือวันนี้ (นับถอยหลัง) -->
          <div class="dg-candy" :title="`เหลือ ×${BONUS_MULT} อีก ${left} ตา`">
            <span class="dg-candy-l">×{{ BONUS_MULT }} เหลือ</span>
            <span v-for="i in DUNGEON_BONUS_RUNS" :key="i" class="dg-candy-i" :class="{ used: i > left }"><Emoji char="🍬" /></span>
          </div>
          <!-- ตีซ้ำอัตโนมัติ (user 25 ต.ค. 2026: อยู่ในหน้าจัดทีม) — ระหว่างสู้ยังเปิด/ปิดได้ที่ปุ่มลอย -->
          <label class="dg-auto">
            <input type="checkbox" v-model="autoOn" />
            <span class="dg-auto-sw" aria-hidden="true"></span>
            <span><b>ตีซ้ำอัตโนมัติ</b><small>เล่นขั้นนี้ต่อเองจนกว่าจะปิด</small></span>
          </label>
        </div>
      </template>
    </TeamPicker>
    <!-- ตีซ้ำ: สวิตช์ + นับถอยหลัง 5 วิ ลอยเหนือรีเพลย์ (ของกลางกับหอคอย) -->
    <AutoRepeatBar v-model="autoOn" :show="!!replay" :left="cd.left.value" @now="cd.now()"
                   @update:model-value="v => { if (!v) cd.cancel() }">
      <template v-if="autoOn && autoCount"> · ตาที่ {{ autoCount + 1 }}</template>
      <span class="dg-float-candy"><Emoji char="🍬" />×{{ left }}</span>
    </AutoRepeatBar>
    <BattleReplay :data="replay" theme="tower" exitable exit-label="ออก ✕" @close="onClose" @done="onDone" />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { increment } from 'firebase/firestore'
import Emoji from '../components/shared/Emoji.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'
import TeamPicker from '../components/battle/TeamPicker.vue'
import AutoRepeatBar from '../components/battle/AutoRepeatBar.vue'
import { useAutoCountdown } from '../composables/useAutoCountdown.js'
import { PUMPKIN_DUNGEON as D, DUNGEON_BONUS_MULT as BONUS_MULT, DUNGEON_BONUS_RUNS, waveTeam } from '../data/dungeons.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { getPetDef } from '../data/index.js'
import { activeEvent, evtOf, EVT_HUNTER_GOAL } from '../utils/event.js'
import { dunWinsToday, dunReward, bonusLeft, dunWinPatch, tierUnlocked } from '../utils/dungeon.js'
import { buildLoseTip } from '../utils/loseTip.js'
import { rosterArena } from '../utils/arenas.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { sfx } from '../utils/sfx.js'
import { grantSecret } from '../composables/useAchievements.js'

const auth = useAuthStore()
const { toast } = useToast()

const evNow = activeEvent()
const ev = evNow && evNow.id === D.ev ? evNow : null
const today = () => new Date().toLocaleDateString('sv-SE')   // YYYY-MM-DD เวลาเครื่อง (ไทย)

const pts = computed(() => evtOf(auth.userData, ev).pts)
const wins = computed(() => dunWinsToday(auth.userData, ev, today()))
const left = computed(() => bonusLeft(wins.value))
const rewardOf = (t) => dunReward(t, wins.value)
const team = computed(() => resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets))
const teamFaces = computed(() => team.value.map(p => getPetDef(p.id)?.emoji || '❔'))

const busy = ref(false)
const autoOn = ref(false)
const autoCount = ref(0)   // ตาที่ตีไปแล้วในโหมดตีซ้ำ (โชว์บนปุ่มลอย)
const pickTier = ref(null)
function startPicked() { const t = pickTier.value; pickTier.value = null; if (t) run(t) }
const replay = ref(null)
let run$ = null        // ตาปัจจุบัน { tier, waves: [{result, bots}], at }
let nextTimer = null

function waveData(i) {
  const w = run$.waves[i]
  const last = i === run$.waves.length - 1
  const won = w.result.winner === 'A'
  return {
    result: w.result, botTeam: w.bots, playerTeam: run$.players, won,
    vsLabel: `ด่าน ${i + 1}/${run$.waves.length}`,
    arenas: { top: 'tower', bot: rosterArena(auth.userData) },
    winText: last ? `ผ่าน${run$.tier.label}แล้ว!` : `ผ่านด่าน ${i + 1} ไปต่อเลย`,
    loseText: `แพ้ที่ด่าน ${i + 1}`,
    rewardText: `ได้ ${ev.pt} ${run$.reward}`,
    // ชนะด่านกลางทาง = รีเพลย์ขึ้นฉากเปลี่ยนด่านแทนหน้าสรุป
    nextWave: !last && won ? { label: `ด่าน ${i + 2}/${run$.waves.length}` } : null,
    loseTip: won ? null : buildLoseTip('dungeon', auth.userData),
  }
}

function run(tier) {
  if (busy.value || !ev) return
  const players = team.value
  if (!players.length) { toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info'); return }
  busy.value = true
  // ซิมทุกด่านล่วงหน้า หยุดที่ด่านแรกที่แพ้ · ⚠️ หยิบรางวัลไว้ตอนนี้ (CLAUDE.md ข้อ 9)
  const waves = []
  const seed = Date.now()
  for (let i = 0; i < tier.waves.length; i++) {
    const bots = waveTeam(tier.waves[i])
    const result = simulateBattle(players, bots, seed + i)
    waves.push({ result, bots })
    if (result.winner !== 'A') break
  }
  run$ = { tier, players, waves, at: 0, reward: dunReward(tier, wins.value), done: false }
  replay.value = waveData(0)
}

async function onDone() {
  if (!run$) return
  const w = run$.waves[run$.at]
  const won = w.result.winner === 'A'
  if (!won) {
    busy.value = false
    // ตีซ้ำ: แพ้ก็ลองใหม่ให้เอง (เกมมีดวง) — นับถอยหลังเหมือนตอนชนะ
    if (autoOn.value) queueNext()
    return
  }
  if (run$.at < run$.waves.length - 1) {
    nextTimer = setTimeout(() => {
      if (!run$) return
      run$.at++
      replay.value = waveData(run$.at)
    }, 1300)
    return
  }
  // ชนะด่านสุดท้าย → ให้รางวัลครั้งเดียว
  if (run$.done) return
  run$.done = true
  const p = dunWinPatch(auth.userData, ev, run$.tier, today(), increment)
  const ok = await auth.patchUser(p.local, p.server)
  busy.value = false
  if (ok) {
    sfx('coin')
    if ((evtOf(auth.userData, ev).got || 0) >= EVT_HUNTER_GOAL) grantSecret('hw_hunter')
  }
  else { toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'error'); autoOn.value = false; return }
  if (autoOn.value) queueNext()
}

// ตีซ้ำ: นับถอยหลัง 5 วิ แล้วเริ่มตาใหม่ขั้นเดิม (ไม่ผ่านหน้าจัดทีม) · ปิดสวิตช์/กดออก = ยกเลิก
const cd = useAutoCountdown()
function queueNext() {
  const tier = run$?.tier
  if (!tier) return
  autoCount.value++
  cd.start(() => { if (autoOn.value && run$) run(tier) })
}

function onClose() {
  clearTimeout(nextTimer)
  cd.cancel()
  autoCount.value = 0
  run$ = null
  replay.value = null
  busy.value = false
}
onUnmounted(() => clearTimeout(nextTimer))
</script>

<style scoped>
.dg { display: flex; flex-direction: column; gap: 12px; padding-bottom: 90px; }
.dg-title small { font-size: .62em; color: var(--muted); font-weight: 700; }
.dg-head { display: flex; align-items: center; gap: 8px; }
.dg-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }
.dg-pts { margin-left: auto; font-size: .9rem; font-weight: 800; background: #fff7ed; border: var(--bw) solid #fed7aa; border-radius: 999px; padding: 3px 12px; color: #9a3412; text-decoration: none; }
.dg-empty { text-align: center; color: var(--muted); padding: 40px 0; }
.dg-how { background: linear-gradient(120deg, #fed7aa, #ddd6fe); border-radius: 18px; padding: 12px 14px; font-size: .84rem; line-height: 1.6; color: #2b1f3d; display: flex; flex-direction: column; }
.dg-team { display: flex; align-items: center; gap: 6px; background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; padding: 10px 12px; }
.dg-team-l { font-size: .78rem; font-weight: 700; color: var(--muted); margin-right: 4px; }
.dg-face { width: 36px; height: 36px; border-radius: 10px; background: #f6f2fb; display: grid; place-items: center; font-size: 1.3rem; }
.dg-edit { margin-left: auto; font-size: .8rem; font-weight: 700; color: var(--primary); text-decoration: none; }
.dg-tier { font: inherit; color: #2b1f3d; display: flex; align-items: center; gap: 12px; border: 0; border-radius: 18px; padding: 16px; cursor: pointer; text-align: left; box-shadow: var(--pop); }
.dg-tier:disabled { opacity: .6; cursor: wait; }
.dg-tier.locked { filter: grayscale(.7); opacity: .55; cursor: not-allowed; }
.dg-tier.t1 { background: linear-gradient(120deg, #ffedd5, #fed7aa); }
.dg-tier.t2 { background: linear-gradient(120deg, #fed7aa, #fdba74); }
.dg-tier.t3 { background: linear-gradient(120deg, #e9d5ff, #c4b5fd); }
.dg-tier-t { flex: 1; display: flex; flex-direction: column; }
.dg-tier-t b { font-size: 1rem; }
.dg-tier small { font-size: .72rem; opacity: .75; }
.dg-tier-r { display: flex; flex-direction: column; align-items: flex-end; }
.dg-tier-r b { font-size: 1.15rem; }
.dg-cta { display: flex; flex-direction: column; gap: 8px; max-width: 488px; margin: 0 auto 10px; }
.dg-candy { display: flex; align-items: center; gap: 4px; font-size: .8rem; font-weight: 800; color: #9a3412; }
.dg-candy-l { margin-right: 4px; }
.dg-candy-i { font-size: 1.15rem; transition: opacity .2s, filter .2s; }
.dg-candy-i.used { opacity: .25; filter: grayscale(1); }
.dg-candy-inline { letter-spacing: -2px; }
.dg-auto { display: flex; align-items: center; gap: 10px; background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; padding: 10px 12px; cursor: pointer; }
.dg-auto input { position: absolute; opacity: 0; pointer-events: none; }
.dg-auto-sw { width: 42px; height: 24px; border-radius: 999px; background: #d6cbe0; position: relative; flex-shrink: 0; transition: background .2s; }
.dg-auto-sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; }
.dg-auto input:checked + .dg-auto-sw { background: #ea580c; }
.dg-auto input:checked + .dg-auto-sw::after { transform: translateX(18px); }
.dg-auto input:focus-visible + .dg-auto-sw { outline: 2px solid var(--primary); outline-offset: 2px; }
.dg-auto span:last-child { display: flex; flex-direction: column; }
.dg-auto b { font-size: .88rem; color: var(--ink); }
.dg-auto small { font-size: .72rem; color: var(--muted); }
</style>
<style>
/* ปุ่มลอยอยู่นอก scoped เพราะ Teleport ไป body */
.dg-float-candy { margin-left: 6px; padding-left: 8px; border-left: 1px solid rgba(0,0,0,.15); }
</style>
