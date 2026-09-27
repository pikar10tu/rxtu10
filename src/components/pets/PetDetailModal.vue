<template>
  <!-- Teleport ไป body: #main-content (position:fixed) = stacking context → z-index สู้ #bottom-nav (z200) ไม่ได้ถ้า render ในนี้ (ดู CLAUDE.md) -->
  <Teleport to="body">
  <div v-if="pet" class="pd-ov" @click.self="$emit('close')">
    <div class="pd-box">
      <!-- รีดีไซน์ 27 ก.ย. 2026 — user เลือกแนว "โปรไฟล์ตัวละคร" จากเดโม artifact -->
      <div class="pd-top" :style="{ '--rc': rc, '--fw': `${gradeNow * 1.2}px` }">
        <button class="pd-x" aria-label="ปิด" @click="$emit('close')">✕</button>
        <!-- ตราเกรด: ริบบิ้นห้อย + กรอบขาวหนาขึ้นทีละขั้น (user เลือกแบบ E 27 ก.ย. 2026) -->
        <span class="pd-ribbon" :aria-label="`เกรด ${gradeLabel}`">{{ gradeLabel }}</span>
        <div class="pd-head">
          <div class="pd-emoji"><Emoji :char="pet.emoji" /></div>
          <div class="pd-id">
            <div class="pd-name">
              {{ pet.name }}
              <span v-if="balTag" class="pd-baltag" :class="balTag.kind" :title="`ปรับสมดุล: ${balTag.label}`" :aria-label="`ปรับสมดุล: ${balTag.label}`"><Emoji :char="balTag.icon" /></span>
            </div>
            <div class="pd-tags">
              <span class="pd-tag">{{ RARITY[pet.rarity]?.label }}</span>
              <span class="pd-tag"><Emoji :char="ELEMENTS[elDef]?.emoji || '✊'" /> {{ EL_NAME[elDef] || elDef }}</span>
              <HelpButton topic="element" style="width:18px;height:18px;font-size: .7rem" />
            </div>
          </div>
        </div>
        <!-- คำพูดประจำตัว (flavor ใน data/index.js) — ตัดบรรทัดด้วยตัวขึ้นบรรทัดใหม่ในสตริง · เรื่องเล่า (lore) พับไว้ก่อน -->
        <p v-if="quote" class="pd-quote">{{ quote }}</p>
      </div>

      <div class="pd-body">
        <div class="pd-skill" :class="{ none: !pdPassive }">
          <div class="pd-skill-ic"><Emoji :char="pdPassive ? pdPassive.icon : '✨'" /></div>
          <div>
            <div class="pd-skill-name">{{ pdPassive ? pdPassive.name : 'ยังไม่มีทักษะเฉพาะ' }}</div>
            <!-- passiveText() เติมตัวเลขจริงของขั้นนั้นให้แล้ว — ห้ามพิมพ์ตัวเลขลง desc เอง (petPassives.js) -->
            <div class="pd-skill-desc">{{ pdPassive ? passiveText(pdPassive) : 'เพ็ทตัวนี้ยังไม่มีทักษะติดตัว' }}</div>
          </div>
        </div>

        <!-- หลอดค่าพลัง: เพดาน = ค่าสูงสุดในเกม (ATK ตำนานจู่โจม V · HP ตำนานพิทักษ์ V · รายได้ ตำนาน V)
             ⇒ ไม่มีตัวไหนเต็มทุกหลอด แม้อัพสุด (user กำหนด 27 ก.ย. 2026) · ดู STAT_MAX -->
        <section>
          <div class="pd-sec">ค่าพลัง</div>
          <div class="pd-bars">
            <div v-for="b in bars" :key="b.k" class="pd-bar">
              <span><Emoji :char="b.icon" /> {{ b.label }}</span>
              <span class="pd-track"><i :style="{ width: b.pct + '%', background: b.color }"></i></span>
              <b>{{ b.shown }}</b>
            </div>
          </div>
        </section>

        <section class="pd-evo">
          <div class="pd-sec pd-sec-help">เกรด<HelpButton topic="grade" style="width:18px;height:18px;font-size: .7rem" /></div>
          <div class="pd-steps">
            <span v-for="n in MAX_GRADE" :key="n" :class="{ on: n <= gradeNow, next: n === gradeNow + 1 }">{{ GRADE_LABELS[n] }}</span>
          </div>
          <template v-if="gradeNow < MAX_GRADE && upCost">
            <button class="pd-btn" :class="{ ok: canUp }" :disabled="!canUp || busy" @click="evolve">วิวัฒน์ → เกรด {{ GRADE_LABELS[gradeNow + 1] }}</button>
            <!-- ของที่ต้องใช้ แยก 2 แถว มี/ต้องใช้ — ปุ่ม :disabled กดไม่ติด เหตุผลต้องมองเห็นก่อนกด
                 (เพื่อนแจ้ง 31 ส.ค. "มีตัวซ้ำ 11 แต่อัพไม่ได้" ทั้งที่ตัวจริงคือเหรียญไม่พอ) -->
            <div class="pd-need">
              <div v-for="n in needs" :key="n.k" class="pd-need-row" :class="{ short: n.short > 0 }">
                <span><Emoji :char="n.icon" /> {{ n.label }}</span>
                <span class="pd-track sm"><i :style="{ width: n.pct + '%' }"></i></span>
                <b>{{ n.have.toLocaleString() }} / {{ n.need.toLocaleString() }}</b>
                <small>{{ n.short > 0 ? `ขาด ${n.short.toLocaleString()}` : 'ครบ' }}</small>
              </div>
            </div>
          </template>
          <div v-else class="pd-max">วิวัฒน์ถึงเกรด V แล้ว</div>
        </section>

        <section class="pd-team">
          <template v-if="isActive">
            <div class="pd-slotrow">
              <span class="pd-slotrow-label">ลำดับในทีม: ช่อง {{ activeSlotIndex + 1 }}<small>ช่อง 1 ลงสนามก่อน · กดเลขเพื่อย้ายช่อง</small></span>
              <div class="pd-slotbtns">
                <button
                  v-for="n in battleSlots" :key="n" type="button" class="pd-slotbtn"
                  :class="{ cur: n - 1 === activeSlotIndex }" :disabled="busy || n - 1 === activeSlotIndex"
                  :aria-pressed="n - 1 === activeSlotIndex" :aria-label="`ย้ายไปช่อง ${n}`"
                  @click="swapSlot(n - 1)"
                >{{ n }}</button>
              </div>
            </div>
            <button class="pd-active on" :disabled="busy" @click="removeFromTeam">
              <Emoji char="⭐" /> อยู่ในทีมต่อสู้ · กดเพื่อเอาออก
            </button>
          </template>
          <template v-else>
            <button class="pd-active add" :disabled="busy" @click="onAddTap">
              <Emoji char="➕" /> ใส่ในทีมต่อสู้ ({{ activeList.length }}/{{ battleSlots }})
            </button>
            <div v-if="pickerOpen" class="pd-picker">
              <div class="pd-picker-label">แทนตัวไหน?</div>
              <button
                v-for="(id, i) in activeList" :key="id" type="button" class="pd-picker-row"
                :disabled="busy" @click="replaceSlot(i)"
              >
                <Emoji :char="teamPetOf(id).emoji" /> <span class="pd-picker-name">{{ teamPetOf(id).name }}</span>
                <span class="pd-picker-slot">ช่อง {{ i + 1 }}</span>
              </button>
              <button type="button" class="pd-picker-cancel" :disabled="busy" @click="pickerOpen = false">ยกเลิก</button>
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Emoji from '../shared/Emoji.vue'
import HelpButton from '../help/HelpButton.vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { RARITY, GRADE_LABELS, getPetDef, ELEMENTS, EL_NAME, passiveOf } from '../../data/index.js'
import { passiveText } from '../../data/petPassives.js'
import { buildCombatant } from '../../data/battle.js'
import { petDailyCoins } from '../../utils/petUtils.js'
import { BATTLE_SLOTS } from '../../data/residence.js'
import { gradeUpCost, upgradeBlock, MAX_GRADE } from '../../utils/petGrade.js'
import { replaceAt, swapTo } from '../../utils/teamSlots.js'
import { balanceTagOf } from '../../utils/balanceTag.js'
import { useRosterSync } from '../../composables/useRosterSync.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import { COMBAT_BASE, COMBAT_GRADE, ELEMENT_BIAS, RARITY_DAILY_BASE, GRADE_MULTI_V2 } from '../../data/petPower.js'

// เพดานหลอดค่าพลัง = ค่าสูงสุดที่มีในเกม (ตำนานเกรด V ในสายที่ถนัดด้านนั้น) — คำนวณจากสูตรจริง ไม่ฝังเลข
// ⇒ ปรับตัวเลขใน petPower.js แล้วหลอดตามเอง · จู่โจม ATK นำ / สมดุลเท่ากัน / พิทักษ์ HP นำ มาจาก ELEMENT_BIAS
const TOP = COMBAT_GRADE[COMBAT_GRADE.length - 1]
const STAT_MAX = {
  atk: Math.max(...Object.values(COMBAT_BASE).map(b => b.atk)) * TOP * Math.max(...Object.values(ELEMENT_BIAS).map(e => e.atk)),
  hp: Math.max(...Object.values(COMBAT_BASE).map(b => b.hp)) * TOP * Math.max(...Object.values(ELEMENT_BIAS).map(e => e.hp)),
  income: Math.max(...Object.values(RARITY_DAILY_BASE)) * GRADE_MULTI_V2[GRADE_MULTI_V2.length - 1],
}
// ขั้นต่ำ 3% ให้หลอดของตัวเล็กยังเห็นเป็นขีด ไม่หายไปทั้งหลอด
const pctOf = (v, max) => Math.max(3, Math.min(100, (v / max) * 100))

const props = defineProps({ petId: { type: String, default: null } })
const emit = defineEmits(['close'])
useEscapeKey(() => !!props.petId, () => emit('close'))

const auth = useAuthStore()
const { syncRosterRow } = useRosterSync()
const { toast } = useToast()
const { confirm } = useConfirm()
const busy = ref(false)

const pdPassive = computed(() => passiveOf({ id: props.petId }))   // passiveOf ใช้ id เป็นกุญแจ
const pets = computed(() => auth.userData?.pets || [])

// ── Active team ──
const battleSlots = computed(() => BATTLE_SLOTS)
// only count active pets that are still owned — a species removed from the
// collection can leave a ghost id in activePets and inflate the count.
const activeList = computed(() => {
  const owned = new Set(pets.value.map(p => p.id))
  return (auth.userData?.activePets || []).filter(id => id && owned.has(id))
})
const isActive = computed(() => pet.value && activeList.value.includes(pet.value.id))
const activeSlotIndex = computed(() => (pet.value ? activeList.value.indexOf(pet.value.id) : -1))
const teamPetOf = (id) => pets.value.find(p => p.id === id) || getPetDef(id) || { id, emoji: '❓', name: '?' }

const pickerOpen = ref(false)
// โมดัลนี้ mount ค้างไว้ (parent ส่ง :pet-id ไม่มี v-if) — เปลี่ยนตัว/ปิดโมดัลแล้วต้องล้าง picker
// ไม่งั้นเปิดเพ็ทตัวถัดไปแล้วเจอ "แทนตัวไหน?" ค้างจากตัวก่อนหน้า
watch(() => props.petId, () => { pickerOpen.value = false })

async function writeTeam(next) {
  busy.value = true
  const ok = await auth.patchUser({ activePets: next })
  if (!ok) toast('ตั้งทีมไม่สำเร็จ', 'error')
  else syncRosterRow()   // ทีมเปลี่ยน → คู่ต่อสู้ใน Arena ต้องเห็นทีมใหม่
  busy.value = false
}

async function removeFromTeam() {
  if (busy.value || !pet.value) return
  await writeTeam(activeList.value.filter(id => id !== pet.value.id))
}

// ทีมยังไม่เต็ม → ใส่ต่อท้ายทันที · ทีมเต็มแล้ว → เปิดตัวเลือก "แทนตัวไหน?" (ไม่แทนเงียบๆ)
async function onAddTap() {
  if (busy.value || !pet.value) return
  const cur = activeList.value
  if (cur.length >= battleSlots.value) { pickerOpen.value = true; return }
  await writeTeam([...cur, pet.value.id])
}

async function replaceSlot(idx) {
  if (busy.value || !pet.value) return
  pickerOpen.value = false
  await writeTeam(replaceAt(activeList.value, idx, pet.value.id))
}

// ตัวนี้อยู่ในทีมแล้ว แตะเลขช่องอื่น = สลับตำแหน่งกับตัวที่อยู่ช่องนั้น (หรือย้ายไปท้ายสุดถ้าช่องนั้นเกินจำนวนตัวที่มี)
async function swapSlot(idx) {
  if (busy.value || !pet.value || idx === activeSlotIndex.value) return
  await writeTeam(swapTo(activeList.value, pet.value.id, idx))
}
const pet = computed(() => pets.value.find(p => p.id === props.petId) || null)
const balTag = computed(() => (pet.value ? balanceTagOf(pet.value.id) : null))

const rc = computed(() => RARITY[pet.value?.rarity]?.color || '#94a3b8')
const quote = computed(() => getPetDef(pet.value?.id)?.flavor || '')
const elDef = computed(() => getPetDef(pet.value?.id)?.element || pet.value?.element || 'scissors')

const gradeNow = computed(() => pet.value?.grade || 0)
const gradeLabel = computed(() => GRADE_LABELS[gradeNow.value] || '0')
const upCost = computed(() => pet.value ? gradeUpCost(pet.value) : null)
// แหล่งความจริงเดียวของ "อัพได้ไหม" — อย่าแยกเป็นสองสูตร เดี๋ยวปุ่มกับข้อความไม่ตรงกัน
const block = computed(() => pet.value ? upgradeBlock(pet.value, auth.userData?.coins || 0) : { reason: 'maxed' })
const canUp = computed(() => !!pet.value && block.value === null)
// แถว "มี / ต้องใช้" ของตัวซ้ำและเหรียญ (แทนประโยคยาวบรรทัดเดียวเดิม — user บอกว่ารก)
const needs = computed(() => {
  const c = upCost.value
  if (!c || !pet.value) return []
  const copies = pet.value.copies || 0
  const coins = auth.userData?.coins || 0
  const row = (k, icon, label, have, need) => ({
    k, icon, label, have, need, short: Math.max(0, need - have), pct: need ? Math.min(100, (have / need) * 100) : 100,
  })
  return [row('cp', '🧬', 'ตัวซ้ำ', copies, c.copies), row('co', '🪙', 'เหรียญ', coins, c.coins)]
})

// เลข combat จริง (= ที่ใช้สู้) — element ดึงจาก def (per-species), grade V = ×2
const combat = computed(() => {
  const p = pet.value; if (!p) return { atk: 0, maxHp: 0 }
  return buildCombatant({ rarity: p.rarity, element: getPetDef(p.id)?.element || p.element, grade: p.grade })
})
const atk = computed(() => Math.round(combat.value.atk))
const hp = computed(() => Math.round(combat.value.maxHp))
const income = computed(() => pet.value ? petDailyCoins(pet.value) : 0)
const bars = computed(() => [
  { k: 'atk', icon: '⚔️', label: 'ATK', color: '#f59e0b', pct: pctOf(combat.value.atk, STAT_MAX.atk), shown: atk.value },
  { k: 'hp', icon: '❤️', label: 'HP', color: '#ef4444', pct: pctOf(combat.value.maxHp, STAT_MAX.hp), shown: hp.value },
  { k: 'inc', icon: '💰', label: '/วัน', color: '#4cc9a0', pct: pctOf(income.value, STAT_MAX.income), shown: income.value.toLocaleString() },
])

async function commit(newPets, coinDelta = 0) {
  // reconcile the active team: drop any species no longer owned so a
  // consumed pet can't linger as a ghost in activePets.
  const owned = new Set(newPets.map(p => p.id))
  const curActive = (auth.userData?.activePets || []).filter(Boolean)
  const nextActive = curActive.filter(id => owned.has(id))
  const activeChanged = nextActive.length !== curActive.length

  const optimistic = {
    pets: newPets,
    ...(activeChanged ? { activePets: nextActive } : {}),
    ...(coinDelta ? { coins: (auth.userData?.coins || 0) + coinDelta } : {}),
  }
  const patch = { pets: newPets }
  if (activeChanged) patch.activePets = nextActive
  if (coinDelta) patch.coins = increment(coinDelta)
  // ข่าวกระดาน: เกรดสูงสุดที่ถืออยู่ขยับขึ้นถึง IV/V — ⚠️ อ่านเกรดเดิม "ก่อน" patchUser (CLAUDE.md ข้อ 9)
  const topBefore = Math.max(0, ...(auth.userData?.pets || []).map(p => Number(p?.grade) || 0))
  const topAfter  = Math.max(0, ...newPets.map(p => Number(p?.grade) || 0))
  // throw on failure so the calling action's try/catch shows its error toast
  if (!(await auth.patchUser(optimistic, patch))) throw new Error('user patch failed')
  // เกรด/ทีมเพ็ทเปลี่ยน → อัปแถวตัวเอง (เขียนเฉพาะตอนค่าเปลี่ยนจริง)
  syncRosterRow({ event: (topAfter > topBefore && topAfter >= 4) ? { k: 'pg', v: topAfter, t: Date.now() } : null })
}

async function evolve() {
  if (busy.value || !pet.value || !upCost.value) return
  const p = pet.value
  if (!canUp.value) { toast('ตัวซ้ำหรือเหรียญของคุณไม่พอ', 'info'); return }
  if (!(await confirm(`วิวัฒน์ ${p.name || 'เพ็ท'} เป็นเกรด ${GRADE_LABELS[(p.grade || 0) + 1]}?\nใช้ ${upCost.value.copies} ตัวซ้ำ + ${upCost.value.coins.toLocaleString()} เหรียญ`))) return
  const newPets = pets.value.map(x => x.id === p.id
    ? { ...x, grade: (x.grade || 0) + 1, copies: (x.copies || 0) - upCost.value.copies } : x)
  busy.value = true
  try { await commit(newPets, -upCost.value.coins); toast(`วิวัฒน์สำเร็จ! ได้เกรด ${GRADE_LABELS[(p.grade || 0) + 1]}`, 'success') }
  catch (e) { console.error('[evolve]', e); toast('วิวัฒน์ไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}
</script>

<style scoped>
/* ⚠️ z410 ไม่ใช่ 230 — โมดัลนี้ถูกเปิดจาก 'ข้างใน' BottomSheet (z400) ที่หน้าจัดทีม
   ทั้งคู่ Teleport ไป body = เป็นพี่น้องกันที่ root → z ต่ำกว่าจะไปโผล่ 'ใต้' แผ่นจัดทีม
   คนเล่นกด ⋯ แล้วเห็นแค่จอมืดลง (เกิดจริง 28 ส.ค. ที่หอคอยและสนามประลอง)
   บันไดชั้น: sheet/modal ฐาน = 400 · อะไรที่เปิดจากในนั้น = 410 (ดู SeedPicker, SpendCopiesModal) */
.pd-ov { position: fixed; inset: 0; z-index: 410; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.pd-box { width: 100%; max-width: 380px; border-radius: 22px; box-shadow: var(--pop-lg); overflow: hidden; max-height: 90vh; overflow-y: auto; background: #fff; color: var(--ink); }

/* หัวการ์ด: ไล่สีความหายาก → ม่วงโลกเพ็ท */
.pd-top { box-shadow: inset 0 0 0 var(--fw) rgba(255,255,255,.85); position: relative; padding: 14px 14px 18px; color: #fff; overflow: hidden;
  background: linear-gradient(160deg, var(--rc), color-mix(in srgb, var(--rc) 45%, #e6dcfd)); }
.pd-top::after { content: ''; position: absolute; right: -40px; top: -40px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,.18); pointer-events: none; }
.pd-x { position: absolute; left: 10px; top: 10px; z-index: 2; border: none; background: rgba(255,255,255,.28); color: #fff; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.pd-ribbon { position: absolute; top: 0; right: 16px; z-index: 2; min-width: 36px; padding: 6px 8px 12px; text-align: center; background: #fff; color: color-mix(in srgb, var(--rc) 55%, #1e293b); font-size: 1rem; font-weight: 800; letter-spacing: .04em; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%); filter: drop-shadow(0 2px 3px rgba(0,0,0,.2)); }
.pd-head { position: relative; z-index: 1; display: flex; gap: 12px; align-items: center; margin-top: 36px; }
.pd-emoji { width: 88px; height: 88px; flex: none; border-radius: 24px; background: rgba(255,255,255,.3); display: grid; place-items: center; font-size: 3.4rem; }
.pd-id { min-width: 0; }
.pd-name { font-size: 1.4rem; font-weight: 800; line-height: 1.15; }
.pd-tags { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; margin-top: 6px; }
.pd-tag { background: rgba(255,255,255,.28); font-size: .7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.pd-quote { position: relative; z-index: 1; margin: 12px 2px 0; white-space: pre-line; text-wrap: balance; font-style: italic; font-size: .88rem; line-height: 1.5; text-shadow: 0 1px 2px rgba(0,0,0,.18); }
.pd-quote::before { content: '“'; }
.pd-quote::after { content: '”'; }
/* ป้ายบาลานซ์ — เล็ก ไม่แย่งซีน (หายเองหลัง 14 วัน — ดู utils/balanceTag.js) */
.pd-baltag { display: inline-flex; font-size: .78rem; vertical-align: middle; margin-left: 2px; border-radius: 999px; padding: 1px 4px; }
.pd-baltag.buff { background: color-mix(in srgb, var(--mint) 45%, transparent); }
.pd-baltag.nerf { background: color-mix(in srgb, var(--accent) 45%, transparent); }
.pd-baltag.rework { background: color-mix(in srgb, var(--primary) 45%, transparent); }

.pd-body { padding: 14px; display: grid; gap: 14px; }
.pd-sec { font-size: .7rem; font-weight: 800; letter-spacing: .06em; color: #8a93ab; margin-bottom: 6px; }
.pd-sec-help { display: flex; align-items: center; gap: 4px; }
.pd-skill { display: flex; gap: 10px; align-items: flex-start; background: #f5f3ff; border-radius: 14px; padding: 10px; }
.pd-skill.none { background: #f8fafc; }
.pd-skill-ic { width: 40px; height: 40px; flex: none; border-radius: 12px; background: #fff; display: grid; place-items: center; font-size: 1.4rem; box-shadow: var(--pop); }
.pd-skill-name { font-weight: 800; color: #6a52b8; }
.pd-skill.none .pd-skill-name { color: rgba(0,0,0,.45); }
.pd-skill-desc { font-size: .8rem; color: #434a63; line-height: 1.5; margin-top: 2px; }

.pd-bars { display: grid; gap: 7px; }
.pd-bar { display: grid; grid-template-columns: 62px 1fr 56px; gap: 8px; align-items: center; font-size: .78rem; }
.pd-bar b { text-align: right; font-variant-numeric: tabular-nums; }
.pd-track { height: 8px; border-radius: 4px; background: #eef1f7; overflow: hidden; }
.pd-track i { display: block; height: 100%; border-radius: 4px; transition: width .35s; }
.pd-track.sm { height: 6px; }

.pd-evo { display: grid; gap: 8px; }
.pd-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.pd-steps span { height: 26px; border-radius: 8px; background: #eef1f7; color: #8a93ab; display: grid; place-items: center; font-size: .74rem; font-weight: 800; }
.pd-steps span.on { background: #2b3550; color: #fff; }
.pd-steps span.next { outline: 2px dashed var(--primary); outline-offset: -2px; color: var(--primary); background: #fff; }
.pd-btn { width: 100%; border: 0; border-radius: 12px; padding: 10px; font-family: inherit; font-size: .85rem; font-weight: 800; color: #fff; background: #c9c2d4; cursor: pointer; }
.pd-btn.ok { background: linear-gradient(135deg, var(--primary), var(--primary-2)); box-shadow: var(--pop); }
.pd-btn:disabled { opacity: .55; cursor: default; box-shadow: none; }
.pd-need { display: grid; gap: 5px; }
.pd-need-row { display: grid; grid-template-columns: 68px 1fr auto 56px; gap: 8px; align-items: center; font-size: .74rem; }
.pd-need-row b { font-variant-numeric: tabular-nums; font-weight: 700; }
.pd-need-row small { font-size: .7rem; font-weight: 800; text-align: right; color: #15803d; }
.pd-need-row .pd-track i { background: var(--mint); }
/* พื้นขาว — แดงเข้มพอให้ contrast ผ่าน (CLAUDE.md ข้อ 13 ก่อนก๊อปสีไปที่อื่น) */
.pd-need-row.short small { color: #b91c1c; }
.pd-need-row.short .pd-track i { background: var(--accent); }
.pd-max { font-size: .78rem; color: #15803d; font-weight: 800; }

.pd-team { display: grid; gap: 8px; }
.pd-slotrow { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: .78rem; font-weight: 800; }
.pd-slotrow-label small { display: block; font-size: .7rem; font-weight: 600; color: rgba(0,0,0,.55); }
.pd-slotbtns { display: flex; gap: 5px; }
.pd-slotbtn { width: 34px; height: 34px; border-radius: 10px; border: var(--bw) solid var(--line); background: #fff; color: var(--ink); font-family: inherit; font-size: .78rem; font-weight: 800; cursor: pointer; }
.pd-slotbtn.cur { background: var(--primary); color: #fff; cursor: default; }
.pd-slotbtn:disabled:not(.cur) { opacity: .5; }
.pd-active { width: 100%; border: var(--bw) solid var(--line); border-radius: 12px; padding: 10px; font-family: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; background: #fff; color: var(--ink); }
.pd-active.add { border: 0; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #fff; box-shadow: var(--pop); }
.pd-active.on { background: var(--accent-light); color: #c2477a; border-color: #f7c1d6; }
.pd-active:disabled { opacity: .6; box-shadow: none; }
.pd-picker { border: var(--bw) solid var(--line); border-radius: 12px; padding: 8px; background: #f8fafc; display: flex; flex-direction: column; gap: 6px; }
.pd-picker-label { font-size: .74rem; font-weight: 800; }
.pd-picker-row { display: flex; align-items: center; gap: 6px; border: var(--bw) solid var(--line); border-radius: 10px; background: #fff; padding: 7px 10px; font-family: inherit; font-size: .78rem; font-weight: 700; cursor: pointer; text-align: left; }
.pd-picker-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pd-picker-slot { font-size: .7rem; font-weight: 800; color: var(--muted, #64748b); }
.pd-picker-cancel { border: none; background: none; color: var(--muted, #64748b); font-family: inherit; font-size: .74rem; font-weight: 700; padding: 4px; cursor: pointer; }
</style>
