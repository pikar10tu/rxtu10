<template>
  <div class="tab-content">
    <div class="page-title tw-head">
      <span><Emoji char="🏯" /> หอคอย</span>
      <span class="tw-head-r">
        <!-- 27 ต.ค. 2026 (หน้ากระชับ): นับถอยหลังซีซั่นเป็นชิปบนหัว กดดูรางวัล -->
        <SeasonCountdown v-if="authStore.isLoggedIn" kind="tower" compact />
        <HelpButton topic="tower" />
        <RouterLink to="/play/pets" class="tw-back">‹ กลับ</RouterLink>
      </span>
    </div>

    <template v-if="authStore.isLoggedIn">
      <SeasonClaimBanner mode="tower" />
      <!-- การ์ดชั้นปัจจุบัน — อยู่บนสุด (user 27 ต.ค.: เห็นแบนเนอร์โซน+รายได้ก่อน ดูขลังกว่า) -->
      <div class="tw-card">
        <!-- แบนเนอร์โซนวาดเอง public/tower/<key>.webp (scripts/tower-art.mjs · user เคาะ 17 ต.ค. 2026) · สีพื้นเดิมเป็นสำรองตอนรูปยังไม่โหลด -->
        <div class="tw-zone tw-zone-art-bg" :class="{ 'tw-zone-royal': zone.royal }" :style="{ background: zoneBg }">
          <img v-if="zone.key" class="tw-zone-img" :src="zoneImg" alt="" aria-hidden="true" decoding="async">
          <div class="tw-zone-txt">
            <div class="tw-zone-name">{{ zone.name }}</div>
            <div class="tw-zone-floor">ชั้น {{ floor }} <span class="tw-zone-best">· สูงสุด {{ best }}</span></div>
          </div>
          <!-- ทีมศัตรูวางบนแบนเนอร์ (เดิมเป็นแถวแยกใต้การ์ด) · แตะ = สอดแนม -->
          <span class="tw-zone-foes">
            <button v-for="(p, i) in botTeam" :key="i" class="tw-mon" @click="scout = p"><PetThumb :pet="p" /></button>
          </span>
        </div>
        <div v-if="zone.endless" class="tw-max-cue">
          <div class="tw-max-cue-l1"><Emoji char="🌌" /> เพ็ทศัตรูได้รับผลกระทบจากห้วงลึก สเตตัสเปลี่ยนไป</div>
          <div class="tw-max-cue-l2">พลังโจมตี/พลังชีวิต +{{ ((endlessBoost(floor) - 1) * 100).toFixed(2).replace(/\.?0+$/, '') }}% · ยิ่งลึกยิ่งแรง ชั้นละ +{{ boostPct }}% · ทุก 10 ชั้นมีรางวัล</div>
        </div>
        <!-- โซนบัลลังก์: เดิมมีกล่อง "พลังบอทตันแล้ว · แพ้ชนะวัดที่สาย" — user 27 ต.ค. ให้เอาออก -->
        <!-- รายได้ 2 บรรทัด: ยอดรวมที่มีอยู่ (ไม่มี +) แล้วค่อยบอกส่วนต่างของชั้นถัดไป
             เดิมบรรทัดเดียวเขียน "+7,615/วัน" ทั้งที่เป็นยอดรวม → คนอ่านว่าไต่ชั้นเดียวได้เจ็ดพัน -->
        <!-- รายได้บรรทัดเดียว (27 ต.ค.) · ยังแยกยอดรวม (ไม่มี +) กับส่วนต่างชั้นนี้ (มี +) ตามเหตุผลเดิม -->
        <div class="tw-bonus">
          <span class="tw-bonus-now"><Emoji char="🪙" /> รายได้หอคอย {{ bonus.toLocaleString() }}/วัน</span>
          <span v-if="nextGain > 0" class="tw-bonus-next">ชนะชั้นนี้ <b>+{{ nextGain.toLocaleString() }}</b></span>
          <span v-else class="tw-bonus-cap">เพดานรายได้เต็มแล้ว</span>
        </div>
        <!-- 27 ต.ค. 2026 (user จัดหน้าให้เลื่อนน้อยลง): แถว "ทีมคุณ" + VS ออก — ทีมโชว์ที่แถบสู้ล่างจออยู่แล้ว
             ปุ่ม "ไต่ต่อเนื่อง" ย้ายเข้าหน้าจัดทีม (สวิตช์เหนือปุ่มเริ่ม แบบตีซ้ำของดันเจี้ยน) -->
        <div v-if="best >= TOWER_MAX" class="tw-clear"><Emoji char="🏆" /> พิชิตยอดหอคอยแล้ว! ไต่ต่อในห้วงนิรันดร์ได้เลย</div>
      </div>

      <TowerMilestones :open-now="msOpen" :best="best" :claims="claims" :claimable="claimable" :busy="msBusy" @claim="onClaimMs" />
      <TowerPath :floor="displayFloor" :best="displayBest" :max="pathMax" :crowd="crowd"
                 @pick="sheetFloor = $event" />

      <!-- อันดับหอคอย — หัวตาราง 3 อันดับ + หน้าต่างรอบตัวเรา (เดิมโชว์แค่ top 3 คนอันดับกลางเลยไม่รู้สึกอะไร)
           best-effort ทั้งใบ: ไม่มีข้อมูล = ซ่อน -->
      <div v-if="rivals && rivals.total > 0 && !(rivals.total === 1 && rivals.myRank === 1)" class="tw-rival">
        <div class="tw-rival-head">
          <span><Emoji char="🏆" /> อันดับหอคอย</span>
          <span class="tw-rival-rank">
            <template v-if="rivals.myRank === null">ยังไม่ติดอันดับ — เริ่มไต่เลย!</template>
            <template v-else-if="rivals.myRank === 1">คุณอยู่อันดับ 1 จาก {{ rivals.total }} <Emoji char="🎉" /></template>
            <template v-else>คุณอยู่อันดับ {{ rivals.myRank }} จาก {{ rivals.total }}</template>
          </span>
        </div>
        <ol class="tw-rival-list">
          <template v-for="(u, i) in rankRows" :key="u.kind === 'gap' ? 'gap' + i : u.uid">
            <li v-if="u.kind === 'gap'" class="tw-rival-gap" aria-hidden="true">⋯</li>
            <li v-else class="tw-rival-row" :class="{ 'tw-rival-me': u.isMe }">
              <span class="tw-rival-medal">{{ medal(u.rank) }}</span>
              <span class="tw-rival-name">{{ u.nickname }}<span v-if="u.isMe" class="tw-rival-badge">คุณ</span>
                <small v-if="u.isMe && rivals.chaseName && rivals.chaseGap > 0" class="tw-rival-chase-in"><Emoji char="🔥" /> ห่าง {{ rivals.chaseName }} {{ rivals.chaseGap }} ชั้น</small></span>
              <span class="tw-rival-floor">ชั้น {{ u.floor }}</span>
            </li>
          </template>
        </ol>
        <div class="tw-rival-foot">
          <button class="tw-rival-all" @click="rankOpen = true">ดูอันดับทั้งหมด ({{ rivals.total }})</button>
          <button v-if="steleCount" class="tw-rival-all" @click="steleOpen = true"><Emoji char="🪨" /> ศิลาจารึก</button>
        </div>
      </div>

      <!-- 🪨 ศิลาจารึก — ยอดเกิน 100 ต่อคนต่อซีซั่น ข้ามการรีเซต (0 read เพิ่ม · roster rows)
           27 ต.ค.: เป็นปุ่มเปิดดู (เดิมกางเต็มท้ายหน้า ยาว) · ไม่มีใครเกิน 100 = ไม่มีปุ่ม -->
      <button v-if="steleCount && !(rivals && rivals.total > 0)" class="tw-stele-btn" @click="steleOpen = true">
        <Emoji char="🪨" /> ศิลาจารึกหอคอย <small>ผู้ก้าวข้ามชั้น 100 · {{ steleCount }} ซีซั่น</small><span aria-hidden="true">›</span>
      </button>
      <BottomSheet v-model:open="steleOpen" icon="🪨" title="ศิลาจารึกหอคอย">
        <TowerStele :rows="membersStore.rosterRows" :me="meUid" />
      </BottomSheet>

      <!-- 🔻 แถบสู้ติดล่างจอ: sticky ใน #main-content (padding ล่าง 28px → bottom/margin -28px ให้ชิดขอบจริง) (ตัว scroll จริง ซึ่งจบเหนือ bottom-nav อยู่แล้ว)
           ⇒ ไม่ต้อง fixed/Teleport/z-index · อยู่ท้ายหน้าเสมอ เลื่อนไปไหนก็กดสู้ได้ -->
      <div class="tw-bar">
        <button class="tw-bar-team" :aria-label="team.length ? 'จัดทีม' : 'ยังไม่ได้จัดทีม — จัดทีม'" @click="pickOpen = true">
          <template v-if="team.length"><Emoji v-for="(p, i) in team" :key="i" :char="defOf(p.id).emoji" /></template>
          <template v-else><Emoji char="🛡️" /></template>
          <small>จัดทีม</small>
        </button>
        <!-- กดสู้ = เปิดหน้าจัดทีมก่อนเสมอ (user 25 ต.ค. 2026: อย่างน้อยต้องได้ดู/เลือกทีม) · ปุ่มในหน้าจัดทีมเป็นตัวเริ่มจริง -->
        <button class="tw-fight" :disabled="busy" @click="pickOpen = true">
          <Emoji char="⚔️" /> {{ busy ? 'กำลังสู้…' : fightLabel }}
        </button>
      </div>
    </template>
    <div v-else class="tw-login">เข้าสู่ระบบเพื่อเล่น</div>

    <TeamPicker v-model:open="pickOpen" :enemies="botTeam" :enemy-label="`ศัตรูชั้น ${floor}`" :context="`หอคอยชั้น ${floor}`" :done-label="fightLabel"
                @done="pickOpen = false; autoOn ? startAuto() : onFight()">
      <!-- ⏩ ไต่ต่อเนื่อง (27 ต.ค. ย้ายมาจากการ์ดชั้น) — ระหว่างสู้ยังเปิด/ปิดได้ที่แถบลอย AutoRepeatBar -->
      <template v-if="floor < AUTO_CLIMB_MAX" #cta-extra>
        <label class="tw-autosw">
          <input type="checkbox" v-model="autoOn" />
          <span class="tw-autosw-sw" aria-hidden="true"></span>
          <span><b>ไต่ต่อเนื่อง</b><small>ชนะแล้วสู้ชั้นถัดไปเองจนกว่าจะแพ้หรือปิด</small></span>
        </label>
      </template>
    </TeamPicker>
    <TowerRankSheet v-model:open="rankOpen" :rows="rivals ? rivals.all : []" />
    <BattleReplay :data="replay" theme="tower" exitable :exit-label="autoOn ? 'หยุดไต่ต่อเนื่อง ✕' : 'ออก ✕'" @close="onReplayClose" @done="onReplayDone" />
    <!-- สวิตช์ไต่ต่อเนื่อง + นับถอยหลัง (ของกลางกับตีซ้ำดันเจี้ยน) · เปิดกลางไฟต์ได้ด้วย -->
    <AutoRepeatBar v-model="autoOn" :show="!!replay" label="ไต่ต่อเนื่อง" count-text="ไฟต์ถัดไปใน" :left="cd.left.value" @now="cd.now()"
                   @update:model-value="v => { if (!v) cd.cancel(); else { autoLoss = 0 } }">
      <template v-if="autoOn && autoCount"> · ผ่านแล้ว {{ autoCount }} ชั้น</template>
    </AutoRepeatBar>
    <PetDetailModal :pet-id="detailId" @close="detailId = null" />
    <FloorSheet :floor="sheetFloor" :crowd="crowd" :current-floor="floor"
                @close="sheetFloor = null" @fight="onSheetFight" />

    <!-- สอดแนมศัตรู (read-only) — การ์ดกลาง จัดการ Teleport/z-index/Escape ให้เองแล้ว -->
    <PetScoutCard :pet="scout" @close="scout = null" />
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { buildLoseTip } from '../utils/loseTip.js'
import { useMembersStore } from '../stores/members.js'
import { useTower } from '../composables/useTower.js'
import { towerRanking, TOP_COUNT } from '../utils/towerRivals.js'
import { buildFloorCrowd } from '../utils/towerCrowd.js'
import { getPetDef } from '../data/index.js'
import { floorZone, towerBonusGain, BONUS_CAP_FLOOR, endlessBoost, ENDLESS_BOOST_PER_FLOOR } from '../data/towerFloors.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'
import AutoRepeatBar from '../components/battle/AutoRepeatBar.vue'
import { useToast } from '../composables/useToast.js'
import { useAutoCountdown } from '../composables/useAutoCountdown.js'
import PetDetailModal from '../components/pets/PetDetailModal.vue'
import PetScoutCard from '../components/pets/PetScoutCard.vue'
import PetThumb from '../components/shared/PetThumb.vue'
import HelpButton from '../components/help/HelpButton.vue'
import TowerStele from '../components/tower/TowerStele.vue'
import BottomSheet from '../components/shared/BottomSheet.vue'
import { buildStele } from '../utils/towerStele.js'
import TowerPath from '../components/tower/TowerPath.vue'
import SeasonCountdown from '../components/shared/SeasonCountdown.vue'
import SeasonClaimBanner from '../components/shared/SeasonClaimBanner.vue'
import FloorSheet from '../components/tower/FloorSheet.vue'
import TowerRankSheet from '../components/tower/TowerRankSheet.vue'
import TowerMilestones from '../components/tower/TowerMilestones.vue'
import { rosterArena } from '../utils/arenas.js'

const authStore = useAuthStore()
const membersStore = useMembersStore()
const steleOpen = ref(false)
const { floor, best, team, botTeam, bonus, fight, TOWER_MAX, AUTO_CLIMB_MAX, claims, claimable, claimMilestones, msOpen, loadMsOpen } = useTower()
loadMsOpen()
const msBusy = ref(false)
async function onClaimMs() {
  if (msBusy.value) return
  msBusy.value = true
  try { await claimMilestones() } finally { msBusy.value = false }
}
const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?' }

onMounted(() => { membersStore.loadRoster().catch(() => {}) })  // best-effort, 1 read

const meUid = computed(() => authStore.currentUser?.uid || '')
const steleCount = computed(() => buildStele(membersStore.rosterRows, meUid.value).length)   // 🪨 จำนวนซีซั่นบนศิลา (0 = ไม่มีปุ่ม)
// เพื่อนปักหมุดรายชั้น — อ่าน rosterRows ดิบ (rosterUsers key ด้วย studentId แล้วตก guest)
const crowd = computed(() => buildFloorCrowd(membersStore.rosterRows, meUid.value))

// แถบเทียบเพื่อน — best-effort ทั้งชุด: ไม่มีข้อมูล/total 0 → คืน null (การ์ดซ่อนทั้งใบ)
// อ่าน rosterRows ดิบให้ตรงกับเส้นทางหอคอย — เดิมอ่าน rosterUsers ซึ่ง key ด้วย studentId
// จึงตกเพื่อนที่เป็น guest ทำให้หน้าเดียวกันนับเพื่อนได้ไม่เท่ากันสองที่
const rivals = computed(() => {
  const me = meUid.value || 'me'
  const others = Object.entries(membersStore.rosterRows || {})
    .filter(([uid, r]) => r && uid !== me)
    .map(([uid, r]) => ({ uid, nickname: r.n || '?', towerBest: r.tb || 0 }))
  if (!others.length) return null
  const u = authStore.userData || {}
  const r = towerRanking(others, { uid: me, nickname: u.nickname || 'ฉัน', towerBest: best.value })
  return r.total > 0 ? r : null
})
const medal = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank))

// แถวบนการ์ด = หัวตาราง 3 อันดับ + หน้าต่างรอบตัวเรา · ตัวคั่น ⋯ เฉพาะตอนมีช่องว่างจริง
// ⚠️ ต้องกันแถวซ้ำ: ถ้าเราอยู่อันดับ 1–3 หน้าต่าง around จะทับกับ top พอดี
const rankRows = computed(() => {
  const r = rivals.value
  if (!r) return []
  const out = r.top.map(u => ({ ...u, kind: 'row' }))
  // 27 ต.ค. (หน้ากระชับ): รอบตัวเราเหลือ ±1 อันดับ — ทั้งหมดดูได้ที่ "ดูอันดับทั้งหมด"
  const extra = r.around.filter(u => u.rank > TOP_COUNT && (r.myRank == null || Math.abs(u.rank - r.myRank) <= 1))
  if (!extra.length) return out
  if (extra[0].rank > TOP_COUNT + 1) out.push({ kind: 'gap' })
  return out.concat(extra.map(u => ({ ...u, kind: 'row' })))
})

const pickOpen = ref(false)
const rankOpen = ref(false)
const replay = ref(null)
const busy = ref(false)
const detailId = ref(null)
const scout = ref(null)
const sheetFloor = ref(null)

// path หน่วงตามหลัง store: patchUser ใน fight() ขยับ floor ทันทีตั้งแต่ replay ยังไม่เปิด
// ถ้าไม่หน่วง marker จะไปถึงที่ใหม่ก่อนคนดูจะเห็น = ไม่มีอนิเมชันไต่ให้ดู
const holdPath    = ref(false)
const displayFloor = ref(floor.value)
// เส้นทางไต่: 100 แถวเดิม · เกินยอดแล้วต่อแถวทีละ 10 ชั้นให้เห็นขั้นรางวัลถัดไปเสมอ
const pathMax = computed(() => Math.max(TOWER_MAX, Math.ceil((displayFloor.value + 1) / 10) * 10))
const boostPct = String(ENDLESS_BOOST_PER_FLOOR * 100)
const displayBest  = ref(best.value)

watch([floor, best], ([f, b]) => {
  if (holdPath.value) return
  displayFloor.value = f
  displayBest.value  = b
})

// ปล่อยค่าที่หน่วงไว้ → TowerPath เห็น floor เพิ่มขึ้น แล้วเล่นซีเควนซ์ไต่เอง
function releasePath() {
  holdPath.value     = false
  displayFloor.value = floor.value
  displayBest.value  = best.value
}

// ส่วนต่างที่จะได้ถ้าชนะชั้นปัจจุบัน — 0 = เลยเพดานแล้ว (ห้ามโชว์ "+0/วัน" จะดูเหมือนบั๊ก)
const nextGain = computed(() => towerBonusGain(floor.value, best.value))
const fightLabel = computed(() => nextGain.value > 0
  ? `สู้ชั้น ${floor.value} · +${nextGain.value.toLocaleString()}/วัน`
  : `สู้ชั้น ${floor.value}`)

const zone = computed(() => floorZone(floor.value))
const zoneImg = computed(() => `${import.meta.env.BASE_URL}tower/${zone.value.key}.webp`)
const zoneBg = computed(() => zone.value.royal
  ? 'linear-gradient(135deg, var(--ink) 0%, #5b21b6 100%)'
  : `linear-gradient(135deg, ${zone.value.color}, ${zone.value.color}bb)`)

async function onFight() {
  if (busy.value) return
  busy.value = true
  holdPath.value = true          // หน่วงเส้นทางไว้จนปิดรีเพลย์ — commit ตอนรีเพลย์จบจะขยับ floor ทันที
  // ⚠️ ต้องหยิบก่อน commit — patchUser ขยับ best แบบ synchronous (CLAUDE.md ข้อ 9)
  //    อ่านทีหลังจะได้โบนัส "หลังชนะ" ทั้งคู่ = ส่วนต่างกลายเป็น 0 ทุกครั้ง
  const bonusBefore = bonus.value
  const gainOfFight = nextGain.value
  const atCap = best.value >= BONUS_CAP_FLOOR
  try {
    const r = await fight()
    // แพ้แล้วต้องมีทางไปต่อ — ปุ่มเลือกตามเหรียญ/ตั๋วที่มีอยู่จริง ณ ตอนนี้
    if (r) replay.value = {
      ...r,
      loseTip: buildLoseTip('tower', authStore.userData),
      arenas: { top: 'tower', bot: rosterArena(authStore.userData) },   // ครึ่งบน = พื้นหอคอย · ครึ่งล่าง = สนามเรา
      // รางวัลเดียวของหอคอยคือรายได้/วัน — จอชนะต้องพูดเรื่องเงิน ไม่ใช่แค่ "ขึ้นชั้น"
      rewardText: (autoOn.value ? `⏩ ไต่ต่อเนื่องชั้นที่ ${autoCount.value + (r.won ? 1 : 0)} · ` : '') + (gainOfFight > 0
        ? `รายได้รายวัน ${bonusBefore.toLocaleString()} → ${(bonusBefore + gainOfFight).toLocaleString()} (+${gainOfFight.toLocaleString()}/วัน)`
        // gain 0 ได้ 2 ทาง: เลยเพดานจริง หรือ best สูงกว่าชั้นที่สู้ (แอดมินรีเซตชั้น)
        // ทางหลังยังไม่เต็มเพดาน — ห้ามเขียนว่าเต็ม และห้ามอ้างโบนัสของชั้นที่เพิ่งสู้ (ต่ำกว่าของจริง)
        : `ขึ้นชั้น ${r.cleared + 1} · รายได้รายวันเท่าเดิม ${bonusBefore.toLocaleString()}/วัน${atCap ? ' (เต็มเพดานแล้ว)' : ''}`),
    }
    else releasePath()           // fight() คืน null (ยังไม่ได้จัดทีม) → ปล่อยเลย
  } catch (e) {
    releasePath()
    throw e
  } finally {
    busy.value = false
  }
}

// ⏩ ไต่ต่อเนื่อง (user 17 ต.ค. 2026 · ปรับ 25 ต.ค. ให้ใช้ระบบเดียวกับตีซ้ำดันเจี้ยน):
//    จบไฟต์แล้วนับถอยหลัง 5 วิ (AutoRepeatBar) · ชนะ = ชั้นถัดไป · แพ้ = ลองชั้นเดิมใหม่ (เกมมีดวง)
//    หยุดเมื่อ: แพ้ชั้นเดิมติดกัน AUTO_LOSS_MAX ครั้ง (กันวนไม่จบกับชั้นที่ทีมยังสู้ไม่ไหว) · ถึง AUTO_CLIMB_MAX · ปิดสวิตช์/กดออก
const AUTO_LOSS_MAX = 5
const { toast } = useToast()
const autoOn = ref(false)
const autoCount = ref(0)
const autoLoss = ref(0)
const cd = useAutoCountdown()
function startAuto() {
  autoOn.value = true
  autoCount.value = 0
  autoLoss.value = 0
  onFight()
}
function stopAuto() {
  autoOn.value = false
  cd.cancel()
}
// 🔒 รีเพลย์เล่นจบถึงหน้าสรุป = ค่อยนับผล (useTower.fight → commit) · ออกก่อนหน้านี้ = ไม่นับ
async function onReplayDone() {
  const r = replay.value
  if (!r) return
  await r.commit()
  if (!autoOn.value) return
  if (r.won) { autoCount.value++; autoLoss.value = 0 }
  else if (++autoLoss.value >= AUTO_LOSS_MAX) {
    stopAuto()
    toast(`แพ้ชั้นนี้ติดกัน ${AUTO_LOSS_MAX} ครั้ง หยุดไต่ต่อเนื่องก่อนนะ ลองเสริมทีมดู`, 'info')
    return
  }
  if (floor.value >= AUTO_CLIMB_MAX) { stopAuto(); return }
  cd.start(() => {
    if (!autoOn.value) return
    replay.value = null
    releasePath()
    onFight()
  })
}
onUnmounted(stopAuto)

function onReplayClose() {
  stopAuto()
  replay.value = null
  releasePath()
}

// กด "สู้ชั้นนี้" ในแผง → ปิดแผงแล้วยิงศึกเลย (ปุ่มโผล่เฉพาะตอนเป็นชั้นปัจจุบันอยู่แล้ว)
function onSheetFight() {
  sheetFloor.value = null
  pickOpen.value = true   // ผ่านหน้าจัดทีมก่อนเหมือนปุ่มสู้หลัก
}
</script>

<style scoped>
.tw-head { display: flex; align-items: center; justify-content: space-between; }
.tw-head-r { display: flex; align-items: center; gap: 8px; }
.tw-back { font-size: .8rem; color: var(--muted); text-decoration: none; }

.tw-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); overflow: hidden; }
.tw-zone { display: flex; align-items: center; gap: 12px; padding: 14px 16px; color: #fff; }
.tw-zone-art-bg { position: relative; overflow: hidden; aspect-ratio: 320 / 110; align-items: flex-end; }
.tw-zone-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tw-zone-art-bg .tw-zone-txt { position: relative; text-shadow: 0 1px 4px rgba(0,0,0,.55); }
.tw-zone-name { font-family: var(--font-display); font-size: 1.3rem; line-height: 1; }
.tw-zone-floor { font-size: .78rem; font-weight: 700; margin-top: 3px; }
.tw-zone-best { opacity: .8; font-weight: 600; }
.tw-zone-royal { border-bottom: 2px solid var(--gold); }
.tw-zone-royal .tw-zone-name { color: var(--gold); }

.tw-max-cue { margin: 10px 16px 0; padding: 8px 10px; border-radius: 10px; background: var(--primary-light); border: 1.5px dashed var(--primary); font-size: .74rem; font-weight: 700; color: var(--ink); line-height: 1.45; }
.tw-max-cue-l1 { font-weight: 800; }
.tw-max-cue-l2 { font-weight: 600; }
.tw-bonus { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; padding: 9px 16px 10px; line-height: 1.4; }
.tw-zone-foes { margin-left: auto; position: relative; display: flex; gap: 4px; }
.tw-zone-foes .tw-mon { width: 54px; }
.tw-rival-foot { display: flex; gap: 6px; }
.tw-rival-foot .tw-rival-all { flex: 1; }
.tw-rival-chase-in { display: block; font-size: .7rem; font-weight: 700; color: #c2410c; }
.tw-bonus-now { font-size: .76rem; color: #b45309; font-weight: 700; }
.tw-bonus-next { font-size: .74rem; color: var(--ink); font-weight: 600; }
.tw-bonus-next b { color: #15803d; font-weight: 800; }
.tw-bonus-cap { font-size: .74rem; font-weight: 600; color: var(--muted); }
.tw-row { display: flex; align-items: center; gap: 10px; padding: 8px 16px; }
.tw-label { font-size: .7rem; color: var(--muted); width: 48px; flex-shrink: 0; }
.tw-team { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; }
.tw-mon { border: none; background: none; padding: 0; cursor: pointer; width: 54px; }
.tw-mon:active { transform: scale(.92); }
.tw-empty { font-size: .76rem; color: var(--muted); }
.tw-vs { text-align: center; font-weight: 800; font-size: .72rem; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 4px; }
.tw-bar { position: sticky; bottom: -28px; z-index: 5; display: flex; gap: 8px; align-items: stretch; margin: 12px -14px -28px; padding: 10px 14px 12px;
  background: color-mix(in srgb, #fff 90%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border-top: var(--bw) solid var(--line); box-shadow: 0 -6px 16px -10px rgba(43,53,80,.25); }
.tw-bar-team { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; min-width: 76px; min-height: 48px; padding: 4px 8px;
  border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; font-family: inherit; cursor: pointer; box-shadow: var(--pop); font-size: 1.05rem; line-height: 1; }
.tw-bar-team small { font-size: .7rem; font-weight: 800; color: var(--primary-dark, var(--primary)); }
.tw-bar-team:active { transform: translateY(1px); }
.tw-fight { flex: 1; border: var(--bw) solid var(--line); border-radius: 12px; padding: 12px; min-height: 44px; font-family: inherit; font-size: .92rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
.tw-fight:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.tw-clear { text-align: center; padding: 0 0 14px; font-weight: 800; color: #f59e0b; }
.tw-login { text-align: center; color: var(--muted); padding: 30px 0; font-size: .85rem; }

.tw-stele-btn { display: flex; align-items: center; gap: 6px; width: 100%; margin-top: 12px; font: inherit; font-weight: 800; font-size: .88rem; color: var(--ink); background: linear-gradient(135deg, #e7e5e4, #d6d3d1); border: var(--bw) solid var(--line); border-radius: 14px; padding: 11px 14px; cursor: pointer; text-align: left; }
.tw-stele-btn small { font-weight: 600; font-size: .72rem; color: #57534e; }
.tw-stele-btn span { margin-left: auto; font-size: 1.1rem; }
.tw-autosw { display: flex; align-items: center; gap: 10px; background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; }
.tw-autosw input { position: absolute; opacity: 0; pointer-events: none; }
.tw-autosw-sw { width: 42px; height: 24px; border-radius: 999px; background: #d6cbe0; position: relative; flex-shrink: 0; transition: background .2s; }
.tw-autosw-sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; }
.tw-autosw input:checked + .tw-autosw-sw { background: var(--primary); }
.tw-autosw input:checked + .tw-autosw-sw::after { transform: translateX(18px); }
.tw-autosw input:focus-visible + .tw-autosw-sw { outline: 2px solid var(--primary); outline-offset: 2px; }
.tw-autosw span:last-child { display: flex; flex-direction: column; }
.tw-autosw b { font-size: .88rem; color: var(--ink); }
.tw-autosw small { font-size: .72rem; color: var(--muted); }
.tw-rival { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); margin-top: 12px; padding: 12px 14px; }
.tw-rival-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
.tw-rival-head > span:first-child { font-family: var(--font-display); font-size: 1.05rem; color: var(--ink); flex-shrink: 0; }
.tw-rival-rank { font-size: .72rem; font-weight: 700; color: var(--muted); text-align: right; }
.tw-rival-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.tw-rival-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 10px; }
.tw-rival-row.tw-rival-me { background: var(--primary-light); outline: 1.5px solid var(--primary); }
.tw-rival-medal { font-size: 1rem; flex-shrink: 0; }
.tw-rival-name { font-size: .84rem; font-weight: 700; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
.tw-rival-badge { display: inline-block; font-size: .7rem; font-weight: 800; color: #fff; background: var(--primary); padding: 1px 6px; border-radius: 999px; margin-left: 5px; vertical-align: middle; }
.tw-rival-floor { font-size: .8rem; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; flex-shrink: 0; }
.tw-rival-gap { text-align: center; font-size: .8rem; color: rgba(0,0,0,.28); line-height: 1; padding: 2px 0; }
.tw-rival-all { display: block; width: 100%; margin-top: 10px; border: var(--bw) solid var(--line); border-radius: 11px; background: #fff; color: var(--ink); font-family: inherit; font-size: .78rem; font-weight: 800; padding: 9px; cursor: pointer; box-shadow: var(--pop); }
.tw-rival-all:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-rival-chase { margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: #ffeef1; border: 1.5px solid var(--accent); font-size: .76rem; font-weight: 700; color: var(--ink); }

</style>
