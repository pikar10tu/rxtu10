<template>
  <div class="tab-content">
    <div class="pt-head">
      <button class="pt-back" aria-label="กลับ" @click="$router.push('/play/pets')">‹</button>
      <span><Emoji char="🐾" /> สัตว์เลี้ยง</span>
      <HelpButton topic="pets" style="margin-left:auto" />
      <button v-if="authStore.isLoggedIn" class="pt-to-team" @click="$router.push('/team')">จัดทีม →</button>
    </div>

    <template v-if="authStore.isLoggedIn">
      <!-- 18 ต.ค. 2026 (user เคาะ แบบ 7DS): หน้าคลังไว้ดูตัว/อ่านสกิล/วิวัฒน์อย่างเดียว — ทีมไปจัดที่ /team
           ไม่มีกล่องทีม ไม่มีป้าย "ช่อง N" (มีหลายทีม ใส่แล้วงง) ไม่มี ATK/HP บนการ์ด ต้องแตะดูก่อน -->
      <div class="pt-summary">
        <div><b>{{ pets.length }}</b>/{{ catalog.length }} <small>ชนิด</small></div>
        <div><b>{{ totalIncome.toLocaleString() }}</b><small><Emoji char="🪙" />/วัน</small></div>
        <div><b>{{ species }}</b><small>สายพันธุ์</small></div>
      </div>

      <!-- แจ้งครั้งเดียวว่าเพ็ทที่ถืออยู่เปลี่ยนกลไก — ไม่ใช้ป๊อปอัป ไม่ส่งจดหมาย (user เคาะ 10 ก.ย.)
           ขึ้นเฉพาะคนที่มีเพ็ทในรายการจริง ⇒ คนที่ไม่ได้รับผลกระทบจะไม่โดนกวน -->
      <div v-if="showPassiveNews" class="pt-news">
        <div class="pt-news-txt">
          <b>พาสสีฟอัปเดต</b>
          <span>เพ็ทของคุณ {{ changedMine.length }} ตัวเปลี่ยนความสามารถ ({{ changedNames }}) — แตะการ์ดเพื่ออ่านของใหม่</span>
        </div>
        <button class="pt-news-x" @click="dismissPassiveNews">รับทราบ</button>
      </div>

      <div v-if="!sorted.length" class="pt-empty">
        ยังไม่มีสัตว์เลี้ยง — ไปกดอัญเชิญตัวแรกกันเถอะ <Emoji char="🥚" />
        <RouterLink to="/shop" class="pt-empty-cta">ไปอัญเชิญเลย →</RouterLink>
      </div>

      <template v-else>
      <PetFilterBar v-model="flt" />
      <div v-if="!shown.length" class="pt-empty">ไม่มีเพ็ทที่ตรงกับตัวกรอง</div>
      <div class="pt-grid">
        <button
          v-for="p in shown" :key="p.id"
          class="pt-cell" :style="{ '--rc': rarityColor(p.rarity) }"
          @click="sel = p.id"
        >
          <span v-if="favSet.has(p.id)" class="pt-cell-fav" aria-label="ตัวโปรด">♥</span>
          <span v-if="p.copies > 0" class="pt-cell-copies">×{{ p.copies }}</span>
          <span class="pt-cell-el"><Emoji :char="ELEMENTS[defOf(p.id).element]?.icon || 'el:fist'" /></span>
          <span v-if="balTagOf(p.id)" class="pt-cell-bal" :class="balTagOf(p.id).kind" :title="`ปรับสมดุล: ${balTagOf(p.id).label}`" :aria-label="`ปรับสมดุล: ${balTagOf(p.id).label}`"><Emoji :char="balTagOf(p.id).icon" /></span>
          <span class="pt-cell-emoji"><Emoji :char="p.emoji" /></span>
          <span class="pt-cell-name">{{ p.name }}</span>
          <span v-if="p.grade" class="pt-cell-gr">{{ GRADE_LABELS[p.grade] }}</span>
        </button>
      </div>
      </template>

      <!-- เพ็ทที่ยังไม่ปลดล็อก — เงาดำ ชื่อเป็น ????? (user เคาะ 11 ก.ย.)
           รวมทุกตัวที่ยังหาได้ ไม่ใช่แค่ตัวใหม่ · กดไม่ได้โดยตั้งใจ (การ์ดที่กดแล้วเงียบทำให้คนคิดว่าแอปค้าง) -->
      <template v-if="locked.length">
        <div class="pt-soon-head">
          <b>ยังไม่ปลดล็อก</b><small>{{ locked.length }} ชนิด</small>
        </div>
        <div class="pt-grid">
          <div v-for="p in locked" :key="p.id" class="pt-cell soon">
            <span class="pt-cell-emoji shade"><Emoji :char="p.emoji" /></span>
            <span class="pt-cell-name">?????</span>
          </div>
        </div>
      </template>
    </template>
    <div v-else class="pt-empty">เข้าสู่ระบบก่อนนะ</div>

    <PetDetailModal :pet-id="sel" @close="sel = null" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { useAuthStore } from '../stores/auth.js'
import { RARITY, PETS, ELEMENTS, GRADE_LABELS } from '../data/index.js'
import { PET_PASSIVES, PASSIVE_V2_CHANGED } from '../data/petPassives.js'
import { balanceTagOf } from '../utils/balanceTag.js'
import { petDailyCoins } from '../utils/petUtils.js'
import PetDetailModal from '../components/pets/PetDetailModal.vue'
import PetFilterBar from '../components/pets/PetFilterBar.vue'
import { filterPets, sortCollection, DEFAULT_FILTER } from '../utils/petFilter.js'
import { obtainablePets } from '../utils/petCatalog.js'
import { useAppConfig } from '../composables/useAppConfig.js'

const authStore = useAuthStore()
const { rawConfig } = useAppConfig()
// ตัวหารคือ "จำนวนที่หมุนได้จริง" ไม่ใช่ทั้งคลัง — defOf ยังอ่าน PETS เต็มเพราะต้องหาเพ็ทที่ถืออยู่ให้เจอเสมอ
// ตัวหาร "x/y ชนิด" ต้องเป็น "หาได้จริงตอนนี้" ไม่ใช่ "ตู้ปกติมีอะไร" — เปิดอีเวนต์แล้วหาได้ 33
const catalog = computed(() => obtainablePets(rawConfig.value?.gachaEvent))
// ยังไม่ปลดล็อก = ของที่ยังหาได้ แต่ยังไม่มีในกรง
const locked = computed(() => {
  const own = new Set(pets.value.map(p => p.id))
  return catalog.value.filter(p => !own.has(p.id))
})
const passiveOf = (id) => PET_PASSIVES[id] || null

const changedMine = computed(() => {
  const own = new Set(pets.value.map(p => p.id))
  return PASSIVE_V2_CHANGED.filter(id => own.has(id))
})
const changedNames = computed(() => {
  const names = changedMine.value.slice(0, 3).map(id => defOf(id).name).filter(Boolean)
  return changedMine.value.length > 3 ? `${names.join(' · ')} และอื่นๆ` : names.join(' · ')
})
const showPassiveNews = computed(() => !authStore.userData?.passiveV2Seen && changedMine.value.length > 0)
async function dismissPassiveNews() {
  await authStore.patchUser({ passiveV2Seen: true }, { passiveV2Seen: true })
}
const sel = ref(null)
const flt = ref({ ...DEFAULT_FILTER })

const pets = computed(() => authStore.userData?.pets || [])
const favs = computed(() => authStore.userData?.petFavs || [])
const favSet = computed(() => new Set(favs.value))
const defOf = (id) => PETS.find(p => p.id === id) || { emoji: '❓' }
const balTagOf = (id) => balanceTagOf(id)
const totalIncome = computed(() => pets.value.reduce((s, p) => s + petDailyCoins(p), 0))
const species = computed(() => new Set(pets.value.map(p => p.id)).size)

const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const RANK = { legendary: 0, epic: 1, rare: 2, common: 3 }
// คลังที่โชว์ = กรองสาย/โปรด/ระดับ + เรียง โปรด→เกรด→ระดับ→ออกใหม่ก่อน (utils/petFilter.js · 18 ต.ค. 2026)
const shown = computed(() => sortCollection(filterPets(pets.value, flt.value, [], favs.value), favs.value))
const sorted = computed(() => pets.value.slice().sort((a, b) =>
  (RANK[a.rarity] - RANK[b.rarity]) || ((b.grade || 0) - (a.grade || 0)) || a.name.localeCompare(b.name)
))
</script>

<style scoped>
.pt-head { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; color: var(--ink); margin-bottom: 14px; }
.pt-back { border: var(--bw) solid var(--line); background: #fff; width: 40px; height: 40px; border-radius: 10px; font-size: 1.2rem; cursor: pointer; line-height: 1; box-shadow: var(--pop); }
.pt-back:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-to-team { border: 0; border-radius: 999px; padding: 8px 14px; font-family: inherit; font-size: .8rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-2)); box-shadow: var(--pop); cursor: pointer; white-space: nowrap; }
.pt-summary { display: flex; background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); overflow: hidden; margin-bottom: 10px; }
.pt-summary > div { flex: 1; text-align: center; padding: 12px 4px; border-right: 1px solid var(--border, #efe7fb); }
.pt-summary > div:last-child { border-right: none; }
.pt-summary b { font-size: 1.05rem; font-weight: 800; }
.pt-summary small { display: block; font-size: .7rem; color: rgba(0,0,0,.45); }
.pt-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; color: rgba(0,0,0,.45); padding: 30px 16px; font-size: .85rem; }
.pt-empty-cta { border: var(--bw) solid var(--line); background: var(--primary); color: #fff; border-radius: 12px; padding: 11px 20px; font-weight: 800; font-size: .85rem; text-decoration: none; box-shadow: var(--pop); }
.pt-empty-cta:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.pt-cell {
  position: relative; background: #fff; border: var(--bw) solid var(--line); border-radius: 14px;
  padding: 12px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  cursor: pointer; font-family: inherit; box-shadow: var(--pop);
  transition: transform .1s, box-shadow .1s;
}
.pt-cell:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-cell-emoji { font-size: 1.8rem; line-height: 1; }
.pt-cell-name { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pt-cell-copies { position: absolute; bottom: 2px; left: 4px; font-size: .7rem; font-weight: 800; color: rgba(0,0,0,.4); }
.pt-cell-el { position: absolute; top: 4px; left: 4px; font-size: .7rem; background: rgba(0,0,0,.06); border-radius: 7px; padding: 1px 3px; line-height: 1; }
/* ป้ายบาลานซ์ 27 ก.ย. 2026 — เล็ก มุมขวาบน หายเองหลัง 14 วัน (utils/balanceTag.js) */
.pt-cell-bal { position: absolute; top: 4px; right: 4px; font-size: .7rem; line-height: 1; border-radius: 7px; padding: 1px 3px; background: rgba(255,255,255,.85); }
.pt-cell-bal.buff { background: color-mix(in srgb, var(--mint) 55%, #fff); }
.pt-cell-bal.nerf { background: color-mix(in srgb, var(--accent) 45%, #fff); }
.pt-cell-bal.rework { background: color-mix(in srgb, var(--primary) 40%, #fff); }
.pt-cell-grade { position: absolute; bottom: -5px; right: -5px; background: #1e293b; color: #fff; font-size: .7rem; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 2px solid #fff; line-height: 1.3; }
.pt-news { display: flex; align-items: center; gap: 10px; margin: 10px 0 4px; padding: 10px 12px;
  background: #eef2ff; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); }
.pt-news-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pt-news-txt b { font-size: .85rem; }
.pt-news-txt span { font-size: .75rem; color: rgba(0,0,0,.6); line-height: 1.35; }
.pt-news-x { flex: none; align-self: center; background: var(--ink); color: #fff; border: 0;
  border-radius: 999px; padding: 6px 12px; font: 700 .75rem inherit; font-family: inherit; cursor: pointer; }
.pt-soon-head { display: flex; align-items: baseline; gap: 8px; margin: 18px 0 8px; }
.pt-soon-head b { font-size: .95rem; }
.pt-soon-head small { color: rgba(0,0,0,.45); font-size: .75rem; }
.pt-cell.soon { background: #f1f5f9; border-color: rgba(0,0,0,.15); box-shadow: none; cursor: default; }
.pt-cell-emoji.shade { filter: brightness(0); opacity: .38; }

/* ═══ จัดใหม่ 25 ก.ย. 2026 — การ์ดย้อมสีตามความหายาก (--rc) ═══ */
.pt-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: none; border: 0; box-shadow: none; overflow: visible; }
.pt-summary > div { border: var(--bw) solid var(--line); border-right: var(--bw) solid var(--line); border-radius: 14px; background: #fff; box-shadow: var(--pop); }
.pt-grid { gap: 10px; }
.pt-cell { border: 1.5px solid color-mix(in srgb, var(--rc) 60%, #fff); border-radius: 16px; background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 14%, #fff), #fff 70%); }
.pt-cell:active { transform: scale(.96); box-shadow: var(--pop); }
.pt-cell-emoji { font-size: 2rem; }
.pt-cell-name { color: var(--ink); }
.pt-cell-el { background: rgba(255,255,255,.8); }
.pt-cell-grade { background: var(--rc); }
.pt-cell.soon { background: rgba(255,255,255,.55); border: 1.5px dashed #cbd5e1; }
.pt-cell-fav { position: absolute; bottom: 3px; right: 6px; font-size: .74rem; line-height: 1; color: #e0719a; }
.pt-cell-gr { font-size: .7rem; font-weight: 800; color: #fff; background: var(--rc); border-radius: 999px; padding: 0 7px; line-height: 1.4; }
</style>
