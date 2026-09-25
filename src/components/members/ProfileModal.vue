<template>
  <!-- Teleport ไป body: #main-content (position:fixed) = stacking context → z-index สู้ #bottom-nav (z200) ไม่ได้ถ้า render ในนี้ (ดู CLAUDE.md) -->
  <Teleport to="body">
  <div v-if="member" class="pf-ov" @click.self="$emit('close')">
    <div class="pf-box">
      <!-- Tier 1: hero (residence art = the flex background) -->
      <div class="pf-hero" :class="{ 'pf-lightbg': cosBg && !cosBg.dark }" :style="heroStyle">
        <CosBg :id="cos.g" />
        <button class="pf-x" @click="$emit('close')">✕</button>
        <div class="pf-hero-art"><Emoji :char="tier.art" /></div>
        <CosFrame :id="cos.f" class="pf-av-frame">
          <img class="pf-avatar" :src="avatar" :alt="view.nickname" referrerpolicy="no-referrer" @error="(e) => fallbackAvatar(e, view?.nickname)" />
        </CosFrame>
        <div v-if="view.realName" class="pf-real">{{ view.realName }}</div>
        <div class="pf-name"><CosName :name="view.nickname" :cos="cos" /></div>
        <div v-if="title" class="pf-title"><TitlePill :label="title.label" :icon="title.icon" :base="0.74" :fit="22" /></div>
        <div class="pf-residence"><Emoji :char="tier.art" /> {{ tier.tierName }} · Lv.{{ lvl }}</div>
        <div class="pf-chips">
          <span class="pf-chip" :style="{ background: trackColor }">{{ trackLabel }}</span>
        </div>
        <div class="pf-chips" style="margin-top:5px"><TagChips :member="view" /></div>
      </div>

      <!-- 🏆 ตู้โชว์: 3 ชิ้นที่เจ้าของปักไว้ (ไม่ได้ปัก = ล่าสุด 3) · ทั้งหมดพับไว้ใต้ปุ่ม
           โหลด achievements ครั้งเดียวที่นี่ แล้วส่ง items ให้กริด = ไม่ query ซ้ำตอนกาง -->
      <div class="pf-shelf-wrap">
        <div class="pf-shelf-head"><Emoji char="🏆" /> ตู้โชว์</div>
        <div v-if="achLoading" class="pf-shelf-empty">กำลังโหลด…</div>
        <div v-else-if="!shelf.length" class="pf-shelf-empty">ยังไม่มีของโชว์</div>
        <div v-else class="pf-shelf">
          <div v-for="a in shelf" :key="a.docId" class="pf-trophy">
            <span class="pf-trophy-icon"><Emoji :char="a.icon" /></span>
            <span class="pf-trophy-name">{{ a.label }}</span>
          </div>
        </div>
        <button v-if="achItems.length > shelf.length" class="pf-more" :aria-expanded="showAll" @click="showAll = !showAll">
          {{ showAll ? 'ซ่อน' : `ดูความสำเร็จทั้งหมด (${achItems.length})` }} <span :class="{ up: showAll }">▾</span>
        </button>
        <AchievementGrid v-if="showAll" :items="achItems" class="pf-allgrid" />
      </div>

      <!-- Tier 2: stat strip (max 3, no coins) — การ์ดจิ๋วขอบหมึก+เงา เข้าชุดกับ AchievementGrid -->
      <div class="pf-stats">
        <div class="pf-stat" style="background:rgba(255,176,32,.12)"><span><Emoji char="⚔️" /></span><b>{{ view.pvp?.wins || 0 }}</b><small>ชนะ (ซีซั่นนี้)</small></div>
        <div class="pf-stat" style="background:rgba(45,168,255,.12)"><span><Emoji char="🏯" /></span><b>{{ view.towerBest || 0 }}</b><small>หอคอย</small></div>
        <div class="pf-stat" style="background:rgba(23,195,154,.12)"><span><Emoji char="🐾" /></span><b>{{ (view.pets || []).length }}</b><small>สัตว์เลี้ยง</small></div>
      </div>

      <!-- Tier 3: active team (tap to see stats) -->
      <div class="pf-team-label">
        <Emoji char="⭐" /> ทีมต่อสู้
        <button v-if="canDuel" class="pf-duel-btn" type="button" @click="startDuel">
          <Emoji char="⚔️" /> ท้าสู้
        </button>
      </div>
      <div v-if="showcase.length" class="pf-showcase">
        <button v-for="(p, i) in showcase" :key="p.id || i" class="pf-pet" @click="petPopup = p">
          <PetThumb :pet="p" />
        </button>
      </div>
      <div v-else class="pf-team-empty">ยังไม่ได้ตั้งทีม</div>

      <PetStatPopup :pet="petPopup" @close="petPopup = null" />
      <BattleReplay :data="duelReplay" theme="arena" @close="duelReplay = null" />

      <!-- Tier 4: contact (only filled rows) — ชิปแคปซูล เข้าชุดกับ pf-chip/pf-tag บนหัวการ์ด -->
      <div v-if="hasContact" class="pf-contact">
        <span v-if="view.contact?.phone" class="pf-contact-chip"><Emoji char="📞" /> {{ view.contact.phone }}</span>
        <span v-if="view.contact?.ig" class="pf-contact-chip"><Emoji char="📷" /> {{ view.contact.ig }}</span>
        <span v-if="view.contact?.line" class="pf-contact-chip"><Emoji char="💬" /> {{ view.contact.line }}</span>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useMembersStore } from '../../stores/members.js'
import { useAuthStore } from '../../stores/auth.js'
import Emoji from '../shared/Emoji.vue'
import { getTier } from '../../data/residence.js'
import { getPetDef } from '../../data/index.js'
import { avatarUrl, fallbackAvatar } from '../../utils/avatar.js'
import { resolveBattleTeam } from '../../utils/petTeam.js'
import { petSpeciesOf } from '../../utils/roster.js'
import { simulateBattle } from '../../utils/battleEngine.js'
import TagChips from '../shared/TagChips.vue'
import AchievementGrid from '../shared/AchievementGrid.vue'
import { fetchAchievementItems } from '../../composables/useAchievementItems.js'
import CosFrame from '../cosmetics/CosFrame.vue'
import CosName from '../cosmetics/CosName.vue'
import CosBg from '../cosmetics/CosBg.vue'
import TitlePill from '../shared/TitlePill.vue'
import { cosOf } from '../../utils/cosmetics.js'
import { getCosmetic } from '../../data/cosmetics.js'
import { resolveShowcase, resolveTitle } from '../../utils/achievements.js'
import PetStatPopup from '../pets/PetStatPopup.vue'
import PetThumb from '../shared/PetThumb.vue'
import BattleReplay from '../battle/BattleReplay.vue'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import { useToast } from '../../composables/useToast.js'
import { useRosterSync } from '../../composables/useRosterSync.js'
import { shouldLogFriendly } from '../../utils/pvpHistory.js'
import { noteProfileView } from '../../utils/gags.js'
import { grantSecret } from '../../composables/useAchievements.js'
import { rosterArena } from '../../utils/arenas.js'

const props = defineProps({ member: { type: Object, default: null } })
const emit = defineEmits(['close'])
useEscapeKey(() => !!props.member, () => emit('close'))

// roster เก็บแค่แถวย่อ (ชื่อ/รูป/เลเวล/สถิติบอร์ด) — ของหนัก (pets/contact/realName ฯลฯ)
// โหลด doc คนนั้นตอนเปิดโปรไฟล์เท่านั้น 1 read/คน แล้ว store จำไว้ในเซสชัน กดซ้ำไม่เสีย read
const members = useMembersStore()
const full = ref(null)
watch(() => props.member?.uid, async (uid) => {
  // achievement ลับ: ส่องโปรไฟล์คนอื่นติดกัน (ของตัวเองไม่นับ)
  // ⚠️ ใช้ useAuthStore() ตรงๆ — const auth ประกาศทีหลังในไฟล์ watch immediate จะชน TDZ
  if (uid && uid !== useAuthStore().currentUser?.uid) {
    const n = noteProfileView(uid)
    if (n >= 5) grantSecret('gag_stalker')
    if (n >= 10) grantSecret('gag_fbi')
  }
  full.value = null
  if (!uid || String(uid).startsWith('static_')) return   // คนที่ยังไม่เข้าระบบ ไม่มี doc ให้อ่าน
  full.value = await members.loadProfile(uid)
}, { immediate: true })

// ── ตู้โชว์ + ฉายา ── (ค่าบน user doc เช็คกับของที่มีจริงเสมอ — resolveShowcase/resolveTitle)
const achItems = ref([])
const achLoading = ref(false)
const showAll = ref(false)
watch(() => props.member?.uid, async (uid) => {
  achItems.value = []; showAll.value = false
  if (!uid || String(uid).startsWith('static_')) return
  achLoading.value = true
  try { achItems.value = await fetchAchievementItems(uid) }
  catch (e) { console.error('[profile ach]', e) }
  finally { achLoading.value = false }
}, { immediate: true })
const shelf = computed(() => resolveShowcase(achItems.value, view.value?.pinnedAch))
const title = computed(() => resolveTitle(achItems.value, view.value?.equipTitle))

// ระหว่างรอ doc เต็ม ใช้แถวย่อไปก่อน (ชื่อ/รูป/เลเวลมีครบแล้ว) — จอไม่กระพริบ
const view = computed(() => ({ ...(props.member || {}), ...(full.value || {}) }))

const petPopup = ref(null)

// ร้านตกแต่ง — doc เต็มมีครบทุกหมวด (รวมพื้นการ์ด) · ระหว่างรอใช้ของจากแถว roster (n/f/b)
const cos = computed(() => full.value ? cosOf(full.value) : (props.member?.cosmetics || {}))
const cosBg = computed(() => getCosmetic(cos.value.g))

const lvl  = computed(() => view.value?.residence?.level || 1)
const tier = computed(() => getTier(lvl.value))

const avatar = computed(() => avatarUrl(view.value, view.value?.nickname))
const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tier.value.frameColor}, ${tier.value.frameColor}99)`,
}))

const TRACK = { sci: ['Sci', '#22c55e'], care: ['Care', '#3b82f6'], guest: ['Guest', '#9ca3af'] }
const isGuest = computed(() => view.value?.accountType === 'guest' || view.value?.track === 'guest')
const trackLabel = computed(() => (isGuest.value ? 'ผู้เยี่ยมชม' : (TRACK[view.value?.track]?.[0]) || 'สมาชิก'))
const trackColor = computed(() => (isGuest.value ? (TRACK.guest[1]) : (TRACK[view.value?.track]?.[1]) || '#6366f1'))

// active team only: resolve activePets (species id, with instId fallback for not-yet-migrated members)
const showcase = computed(() => {
  const pets = view.value?.pets || []
  const ids = (view.value?.activePets || []).map(x => (typeof x === 'string' ? x : x?.instId)).filter(Boolean)
  return ids.map(id => pets.find(p => p.id === id || p.instId === id)).filter(Boolean)
})
const hasContact = computed(() => {
  const c = view.value?.contact || {}
  return !!(c.phone || c.ig || c.line)
})

// ── ท้าสู้กระชับมิตร — จำลองสู้ฝั่ง client ไม่มีรางวัล ไม่จำกัดโควตา ไม่กระทบ pvp.rating/wins/losses จริง
//    25 ก.ย. 2026 user สั่งให้คนถูกท้ารู้ด้วย ⇒ จดผลลงประวัติในแถว roster ของเรา (f:1) ทางเดียวกับประวัติบุก
//    กดท้าคนเดิมรัวๆ จดครั้งเดียวต่อ 10 นาที (shouldLogFriendly) กันช่องประวัติเต็ม + เขียน roster ถี่
const auth = useAuthStore()
const { toast } = useToast()
const { syncRosterRow } = useRosterSync()
const myUid = computed(() => auth.currentUser?.uid)
const canDuel = computed(() => !!view.value?.uid && view.value.uid !== myUid.value && showcase.value.length > 0)

const duelReplay = ref(null)
function startDuel() {
  const myTeam = resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets)
  if (!myTeam.length) { toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info'); return }
  // showcase resolve instId-safe มาให้แล้ว (match ทั้ง p.id/p.instId) — กันทีมผีถ้า activePets ของอีกฝ่ายยังเป็น legacy instId
  const opponentTeam = showcase.value.map(p => {
    const species = petSpeciesOf(p.id || p.species)
    if (!species) return null
    const def = getPetDef(species) || {}
    return { id: species, rarity: p.rarity || def.rarity || 'common', element: def.element || 'scissors', grade: p.grade || 0 }
  }).filter(Boolean)
  if (!opponentTeam.length) { toast('คู่ต่อสู้ยังไม่ได้จัดทีม', 'info'); return }
  const result = simulateBattle(myTeam, opponentTeam, Date.now())
  duelReplay.value = {
    result, playerTeam: myTeam, botTeam: opponentTeam, won: result.winner === 'A',
    vsLabel: `กระชับมิตร VS ${view.value.nickname}`,
    winText: 'ชนะ! (ท้าสู้กันเอง ไม่กระทบแต้มประลอง)',
    loseText: 'แพ้ไปหน่อย (ท้าสู้กันเอง ไม่กระทบแต้มประลอง)',
    // ครึ่งบน = สนามของคนที่เราท้า · ครึ่งล่าง = ของเรา
    arenas: { top: members.rosterRows?.[view.value.uid]?.ar ?? null, bot: rosterArena(auth.userData) },
    sides: { top: { name: view.value.nickname || '?' }, bot: { name: 'คุณ' } },
  }
  const target = view.value.uid
  if (shouldLogFriendly(members.rosterRows?.[myUid.value]?.h, target)) {
    syncRosterRow({ history: { u: target, w: result.winner === 'A' ? 1 : 0, c: 0, t: Date.now(), f: 1 } })
  }
}
</script>

<style scoped>
.pf-ov { position: fixed; inset: 0; z-index: 220; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.pf-box { scrollbar-gutter: stable; background: #fff; width: 100%; max-width: 400px; border: var(--bw) solid var(--line); border-radius: 20px; box-shadow: var(--pop-lg); overflow: hidden; max-height: 88vh; overflow-y: auto; }
.pf-hero { position: relative; padding: 22px 16px 16px; text-align: center; color: #fff; overflow: hidden; }
.pf-hero > :not(.cz-bgl):not(.pf-x) { position: relative; z-index: 1; }
.pf-hero .pf-x { z-index: 2; }
/* พื้นการ์ดสีอ่อนจากร้าน → ตัวอักษรเข้ม (พื้นเดิมของ hero เข้ม ตัวอักษรขาว) */
.pf-hero.pf-lightbg { color: var(--ink); }
/* ไม่ override display ของ .cz-fw (inline-flex) — inline-block ทำให้รูปมีช่องใต้บรรทัด วงกรอบเหลื่อม */
.pf-hero-art { position: absolute; right: -10px; top: -10px; font-size: 5rem; opacity: .25; }
.pf-x { position: absolute; left: 12px; top: 12px; border: none; background: rgba(255,255,255,.25); color: #fff; border-radius: 8px; width: 40px; height: 40px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.pf-avatar { width: 72px; height: 72px; border-radius: 50%; border: 3px solid rgba(255,255,255,.7); object-fit: cover; background: #fff; }
.pf-real {
  font-family: var(--font-display); font-weight: 400;
  font-size: 1.3rem; margin-top: 8px; padding: 0 14px;
  line-height: 1.25;
}
.pf-name { font-size: .82rem; font-weight: 600; opacity: .85; margin-top: 1px; }
.pf-chips { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 10px; }
.pf-chip { font-size: .7rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: #fff; }
.pf-chip.founder { background: rgba(0,0,0,.3); }
.pf-residence {
  font-size: .72rem; font-weight: 700; margin-top: 6px; opacity: .95; padding: 0 14px;
  line-height: 1.3;
}
.pf-title { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: .74rem; font-weight: 800; color: #a23b6c; background: rgba(255,240,246,.95); border: 1px solid #f4a6c8; border-radius: 999px; padding: 2px 10px; }
.pf-shelf-wrap { margin: 12px 16px 0; padding: 10px 12px; border-radius: 16px; background: linear-gradient(180deg, var(--primary-light), #fff); border: var(--bw) solid var(--line); }
.pf-shelf-head { font-size: .78rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
.pf-shelf-empty { font-size: .72rem; color: var(--muted); }
.pf-shelf { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.pf-trophy { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; padding: 8px 4px 6px; background: #fff; border-radius: 12px; box-shadow: var(--pop); }
.pf-trophy-icon { font-size: 1.7rem; line-height: 1; }
.pf-trophy-name { font-size: .7rem; font-weight: 700; color: var(--ink); line-height: 1.25; }
.pf-more { width: 100%; margin-top: 8px; font: inherit; font-size: .74rem; font-weight: 700; color: var(--primary-dark); background: none; border: 0; cursor: pointer; padding: 4px; }
.pf-more span { display: inline-block; transition: transform .15s; }
.pf-more span.up { transform: rotate(180deg); }
.pf-allgrid { margin-top: 6px; }
.pf-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 14px 16px 0; }
.pf-stat { text-align: center; padding: 10px 4px 8px; border: var(--bw) solid var(--line); border-radius: 12px; box-shadow: var(--pop); }
.pf-stat span { font-size: 1.1rem; }
.pf-stat b { display: block; font-size: 1.1rem; font-weight: 800; }
.pf-stat small { font-size: .7rem; color: rgba(0,0,0,.45); font-weight: 700; }
.pf-team-label { font-size: .7rem; font-weight: 800; color: var(--muted, #9b8fb0); text-align: center; padding: 12px 0 0; border-top: 1px solid rgba(0,0,0,.06); position: relative; }
.pf-duel-btn {
  position: absolute; right: 12px; top: 6px; font-family: inherit; font-size: .7rem; font-weight: 800;
  color: #fff; background: var(--primary); border: none; border-radius: 999px; padding: 5px 10px;
  cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
}
.pf-duel-btn:active { opacity: .8; }
.pf-team-empty { text-align: center; font-size: .7rem; color: rgba(0,0,0,.35); padding: 8px 0 14px; }
.pf-showcase { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 10px 12px 12px; max-height: 180px; overflow-y: auto; }
.pf-pet { width: 58px; padding: 0; border: none; background: none; cursor: pointer; font-family: inherit; }
.pf-pet:active { transform: scale(.92); }
.pf-contact { padding: 14px 16px 16px; border-top: 1px solid rgba(0,0,0,.06); display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.pf-contact-chip {
  display: inline-flex; align-items: center; gap: 6px; font-size: .76rem; font-weight: 700; color: var(--ink);
  background: #fff; border: var(--bw) solid var(--line); border-radius: 999px; padding: 6px 12px;
}
</style>
