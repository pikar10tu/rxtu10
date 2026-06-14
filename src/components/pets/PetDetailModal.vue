<template>
  <div v-if="pet" class="pd-ov" @click.self="$emit('close')">
    <div class="pd-box">
      <div class="pd-hero" :style="{ background: `linear-gradient(135deg, ${rc}, ${rc}aa)` }">
        <button class="pd-x" @click="$emit('close')">✕</button>
        <div class="pd-emoji">{{ pet.emoji }}</div>
        <div class="pd-name">{{ pet.name }}</div>
        <div class="pd-tags">
          <span class="pd-tag">{{ rarityLabel }}</span>
          <span class="pd-tag" v-if="pet.grade > 0">เกรด {{ GRADE_LABELS[pet.grade] }}</span>
          <span class="pd-tag">×{{ count }} ในคลัง</span>
        </div>
      </div>

      <!-- active team toggle -->
      <button class="pd-active" :class="{ on: isActive }" :disabled="busy" @click="toggleActive">
        {{ isActive ? '⭐ อยู่ในทีม Active (กดเพื่อเอาออก)' : `☆ ตั้งเป็นทีม Active (${activeList.length}/${battleSlots})` }}
      </button>

      <!-- stats -->
      <div class="pd-stats">
        <div class="pd-stat"><span>⚔️</span><b>{{ atk }}</b><small>ATK</small></div>
        <div class="pd-stat"><span>❤️</span><b>{{ hp }}</b><small>HP</small></div>
        <div class="pd-stat"><span>💰</span><b>{{ income }}</b><small>/วัน</small></div>
      </div>
      <div class="pd-substats">
        <span>🎯 Crit {{ crit }}%</span>
        <span>💥 CritDMG {{ critDmg }}%</span>
        <span v-if="lifesteal">🩸 Lifesteal {{ lifesteal }}%</span>
        <span v-if="dodge">💨 Dodge {{ dodge }}%</span>
      </div>

      <!-- evolve -->
      <div class="pd-section">
        <div class="pd-sec-head">🧬 วิวัฒน์ (เพิ่มเกรด)</div>
        <template v-if="pet.grade >= 12"><div class="pd-note">เกรดสูงสุดแล้ว 👑</div></template>
        <template v-else>
          <div class="pd-note">เกรด {{ GRADE_LABELS[pet.grade] || '0' }} → {{ GRADE_LABELS[pet.grade + 1] }} · ใช้ตัวซ้ำ {{ evoNeed }} ({{ dupes }}/{{ evoNeed }})</div>
          <button class="pd-btn" :class="{ ok: dupes >= evoNeed }" :disabled="dupes < evoNeed || busy" @click="evolve">วิวัฒน์</button>
        </template>
      </div>

      <!-- potential -->
      <div class="pd-section">
        <div class="pd-sec-head">⚗️ ศักยภาพ ({{ (pet.potential || []).length }}/{{ slots }})</div>
        <div class="pd-slots">
          <div v-for="i in slots" :key="i" class="pd-slot" :class="{ filled: pet.potential && pet.potential[i-1] }">
            <template v-if="pet.potential && pet.potential[i - 1]">
              <span class="pd-slot-aff">{{ affixMeta(pet.potential[i-1].stat).label }} +{{ pet.potential[i-1].value }}%</span>
              <button class="pd-reroll" :disabled="busy" @click="reroll(i - 1)">🎲</button>
            </template>
            <span v-else class="pd-slot-empty">ว่าง</span>
          </div>
        </div>
        <button v-if="(pet.potential || []).length < slots" class="pd-btn ok" :disabled="busy" @click="rollNew">
          🎲 เปิดศักยภาพ · {{ cost.toLocaleString() }}🪙 + สังเวยเพ็ทเรท{{ rarityLabel }} 1 ตัว
        </button>
        <div class="pd-note small">เปิด/รีโรล = สังเวยเพ็ท "เรทเดียวกัน" 1 ตัว (ไม่ต้องเป็นตัวซ้ำ) + เหรียญ</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { RARITY, GRADE_LABELS, GRADE_COPIES, petStats } from '../../data/index.js'
import { petDailyCoins } from '../../utils/petUtils.js'
import { AFFIXES, slotsFor, rollCost, rollAffix, statBonusPct, affixMeta } from '../../data/potential.js'
import { residenceBattleSlots } from '../../data/residence.js'

const props = defineProps({ instId: { type: String, default: null } })
defineEmits(['close'])

const auth = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const busy = ref(false)

const pets = computed(() => auth.userData?.pets || [])

// ── Active team ──
const battleSlots = computed(() => residenceBattleSlots(auth.userData?.residence?.level || 1))
// only count active pets that still exist — a consumed pet (evolve/potential
// fodder) can leave a ghost instId in activePets and inflate the count.
const activeList = computed(() => {
  const owned = new Set(pets.value.map(p => p.instId))
  return (auth.userData?.activePets || [])
    .map(x => (typeof x === 'string' ? x : x?.instId))
    .filter(id => id && owned.has(id))
})
const isActive = computed(() => pet.value && activeList.value.includes(pet.value.instId))
async function toggleActive() {
  if (busy.value || !pet.value) return
  const cur = activeList.value
  let next
  if (isActive.value) next = cur.filter(id => id !== pet.value.instId)
  else {
    if (cur.length >= battleSlots.value) { toast(`ทีม Active เต็ม (${battleSlots.value}) — เอาตัวอื่นออกก่อน`, 'info'); return }
    next = [...cur, pet.value.instId]
  }
  busy.value = true
  const ok = await auth.patchUser({ activePets: next })
  if (!ok) toast('ตั้งทีมไม่สำเร็จ', 'error')
  busy.value = false
}
const pet = computed(() => pets.value.find(p => p.instId === props.instId) || null)

const rc = computed(() => RARITY[pet.value?.rarity]?.color || '#94a3b8')
const rarityLabel = computed(() => RARITY[pet.value?.rarity]?.label || pet.value?.rarity)
const count = computed(() => pet.value ? pets.value.filter(p => p.id === pet.value.id).length : 0)
const dupes = computed(() => pet.value ? pets.value.filter(p => p.id === pet.value.id && p.instId !== pet.value.instId).length : 0)
const evoNeed = computed(() => (pet.value && pet.value.grade < 12) ? GRADE_COPIES[(pet.value.grade || 0) + 1] : 0)
const slots = computed(() => slotsFor(pet.value?.rarity))
const cost = computed(() => rollCost(pet.value?.rarity))

const base = computed(() => (pet.value ? petStats(pet.value) : { atk: 0, hp: 0 }))
const pot = computed(() => pet.value?.potential || [])
const atk = computed(() => Math.round(base.value.atk * (1 + statBonusPct(pot.value, 'atk') / 100)))
const hp = computed(() => Math.round(base.value.hp * (1 + statBonusPct(pot.value, 'hp') / 100)))
const income = computed(() => pet.value ? petDailyCoins(pet.value) : 0)
const crit = computed(() => 5 + statBonusPct(pot.value, 'crit'))
const critDmg = computed(() => 50 + statBonusPct(pot.value, 'critDmg'))
const lifesteal = computed(() => statBonusPct(pot.value, 'lifesteal'))
const dodge = computed(() => statBonusPct(pot.value, 'dodge'))

async function commit(newPets, coinDelta = 0) {
  // reconcile the active team: drop any pet that no longer exists so a
  // consumed-as-fodder pet can't linger as a ghost in activePets.
  const owned = new Set(newPets.map(p => p.instId))
  const curActive = (auth.userData?.activePets || []).map(x => (typeof x === 'string' ? x : x?.instId)).filter(Boolean)
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
  // throw on failure so the calling action's try/catch shows its error toast
  if (!(await auth.patchUser(optimistic, patch))) throw new Error('user patch failed')
}

async function evolve() {
  if (busy.value || !pet.value) return
  const p = pet.value
  const next = (p.grade || 0) + 1
  if (next > 12) return
  const need = GRADE_COPIES[next]
  const fodder = pets.value.filter(x => x.id === p.id && x.instId !== p.instId)
    .sort((a, b) => (a.grade || 0) - (b.grade || 0)).slice(0, need)
  if (fodder.length < need) { toast(`ต้องการตัวซ้ำอีก ${need - fodder.length}`, 'info'); return }
  const drop = new Set(fodder.map(x => x.instId))
  const newPets = pets.value.filter(x => !drop.has(x.instId)).map(x => x.instId === p.instId ? { ...x, grade: next } : x)
  busy.value = true
  try { await commit(newPets); toast(`วิวัฒน์ → เกรด ${GRADE_LABELS[next]}!`, 'success') }
  catch (e) { console.error('[evolve]', e); toast('วิวัฒน์ไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}

// pick the lowest-value same-rarity fodder (not this pet)
function pickFodder() {
  return pets.value.filter(x => x.rarity === pet.value.rarity && x.instId !== pet.value.instId)
    .sort((a, b) => (a.grade || 0) - (b.grade || 0) || ((a.potential?.length || 0) - (b.potential?.length || 0)))[0]
}

async function rollNew() {
  if (busy.value || !pet.value) return
  const p = pet.value
  if ((p.potential || []).length >= slots.value) return
  if ((auth.userData?.coins || 0) < cost.value) { toast(`เหรียญไม่พอ (${cost.value.toLocaleString()})`, 'error'); return }
  const fodder = pickFodder()
  if (!fodder) { toast(`ต้องมีเพ็ทเรท${rarityLabel.value}อีกตัวไว้สังเวย`, 'info'); return }
  const affix = rollAffix((p.potential || []).map(a => a.stat))
  if (!affix) return
  const newPot = [...(p.potential || []), affix]
  const newPets = pets.value.filter(x => x.instId !== fodder.instId)
    .map(x => x.instId === p.instId ? { ...x, potential: newPot } : x)
  busy.value = true
  try { await commit(newPets, -cost.value); toast(`ได้ ${affixMeta(affix.stat).label} +${affix.value}%`, 'success') }
  catch (e) { console.error('[roll]', e); toast('สุ่มไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}

async function reroll(idx) {
  if (busy.value || !pet.value) return
  const p = pet.value
  if ((auth.userData?.coins || 0) < cost.value) { toast(`เหรียญไม่พอ (${cost.value.toLocaleString()})`, 'error'); return }
  const fodder = pickFodder()
  if (!fodder) { toast(`ต้องมีเพ็ทเรท${rarityLabel.value}อีกตัวไว้สังเวย`, 'info'); return }
  const others = (p.potential || []).filter((_, i) => i !== idx).map(a => a.stat)
  const cand = rollAffix(others)
  if (!cand) return
  const cur = p.potential[idx]
  const ok = await confirm(
    `ของเดิม: ${affixMeta(cur.stat).label} +${cur.value}%\n` +
    `สุ่มได้: ${affixMeta(cand.stat).label} +${cand.value}%\n\nใช้ตัวใหม่?`
  )
  // fodder + coins are spent on the roll regardless; keep or replace the slot
  const newPot = (p.potential || []).map((a, i) => (i === idx && ok) ? cand : a)
  const newPets = pets.value.filter(x => x.instId !== fodder.instId)
    .map(x => x.instId === p.instId ? { ...x, potential: newPot } : x)
  busy.value = true
  try { await commit(newPets, -cost.value); toast(ok ? 'เปลี่ยนศักยภาพแล้ว' : 'เก็บของเดิมไว้', 'info') }
  catch (e) { console.error('[reroll]', e); toast('รีโรลไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}
</script>

<style scoped>
.pd-ov { position: fixed; inset: 0; z-index: 230; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.pd-box { background: #fff; width: 100%; max-width: 380px; border: 2px solid var(--ink); border-radius: 20px; box-shadow: var(--pop-lg); overflow: hidden; max-height: 90vh; overflow-y: auto; }
.pd-hero { position: relative; padding: 20px 16px 16px; text-align: center; color: #fff; }
.pd-x { position: absolute; left: 12px; top: 12px; border: none; background: rgba(255,255,255,.25); color: #fff; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; }
.pd-emoji { font-size: 3.4rem; }
.pd-name { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; margin-top: 2px; }
.pd-tags { display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; margin-top: 8px; }
.pd-tag { background: rgba(255,255,255,.25); font-size: .58rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
.pd-active { display: block; width: calc(100% - 28px); margin: 12px 14px 0; border: 2px solid var(--ink); border-radius: 11px; padding: 9px; font-family: inherit; font-size: .78rem; font-weight: 800; cursor: pointer; background: #fff; color: var(--ink); box-shadow: var(--pop); transition: transform .12s, box-shadow .12s; }
.pd-active.on { background: var(--gold); color: #fff; }
.pd-active:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pd-active:disabled { opacity: .6; box-shadow: none; }
.pd-stats { display: flex; }
.pd-stat { flex: 1; text-align: center; padding: 14px 4px; border-right: 1px solid rgba(0,0,0,.06); }
.pd-stat:last-child { border-right: none; }
.pd-stat span { font-size: 1.1rem; }
.pd-stat b { display: block; font-size: 1.15rem; font-weight: 800; }
.pd-stat small { font-size: .6rem; color: rgba(0,0,0,.45); }
.pd-substats { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 8px 14px 0; font-size: .64rem; color: rgba(0,0,0,.55); font-weight: 600; }
.pd-section { padding: 14px 16px; border-top: 1px solid rgba(0,0,0,.06); margin-top: 8px; }
.pd-sec-head { font-weight: 800; font-size: .82rem; margin-bottom: 8px; }
.pd-note { font-size: .68rem; color: rgba(0,0,0,.5); margin-bottom: 8px; }
.pd-note.small { font-size: .58rem; margin: 6px 0 0; }
.pd-btn { width: 100%; border: 2px solid var(--ink); border-radius: 11px; padding: 10px; font-family: inherit; font-size: .82rem; font-weight: 800; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.pd-btn.ok { background: var(--primary); box-shadow: var(--pop); }
.pd-btn:disabled { opacity: .5; cursor: default; box-shadow: none; }
.pd-btn.ok:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pd-slots { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.pd-slot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 11px; border-radius: 10px; border: 2px dashed var(--ink); }
.pd-slot.filled { border-style: solid; border-color: var(--ink); background: var(--primary-light); }
.pd-slot-aff { font-size: .78rem; font-weight: 800; color: var(--primary); }
.pd-slot-empty { font-size: .7rem; color: rgba(0,0,0,.35); }
.pd-reroll { border: none; background: rgba(0,0,0,.06); border-radius: 7px; padding: 4px 8px; cursor: pointer; font-size: .8rem; }
</style>
