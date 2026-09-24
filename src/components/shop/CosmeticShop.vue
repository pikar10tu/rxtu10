<!-- ร้านตกแต่ง — แท็บในร้านค้า · แตะชิ้นไหน = ลองใส่บนการ์ดตัวเองด้านบนทันที (ยังไม่ซื้อ)
     ซื้อครั้งเดียวเก็บถาวร · ใส่ได้หมวดละ 1 · สีชื่อ/กรอบ/ป้ายทั้งรุ่นเห็น (แถว roster) · พื้นการ์ดเห็นในโปรไฟล์ -->
<template>
  <div class="cs">
    <!-- การ์ดลองใส่ -->
    <div class="cs-pv" :class="{ dark: bgItem?.dark }">
      <CosBg :id="tryOn.g" />
      <CosFrame :id="tryOn.f">
        <img class="cs-av" :src="avatar" alt="" referrerpolicy="no-referrer" @error="(e) => fallbackAvatar(e, nick)" />
      </CosFrame>
      <div class="cs-pv-name"><CosName :name="nick" :cos="tryOn" /></div>
      <div class="cs-pv-note">{{ selected && !owns(selected.id) ? 'กำลังลองใส่ · ยังไม่ได้ซื้อ' : 'ที่ใส่อยู่ตอนนี้' }}</div>
    </div>

    <div class="cs-kinds" role="tablist">
      <button v-for="k in COS_KINDS" :key="k.k" class="cs-kind" :class="{ on: kind === k.k }" role="tab" :aria-selected="kind === k.k" @click="kind = k.k; selected = null">
        <Emoji :char="k.icon" /> {{ k.label }}
      </button>
    </div>

    <section v-for="t in COS_TIERS" :key="t.t" class="cs-tier">
      <div class="cs-tier-h">{{ t.label }}</div>
      <div class="cs-grid">
        <button v-for="c in itemsOf(t.t)" :key="c.id" class="cs-item" :class="{ sel: selected?.id === c.id, wear: wearing === c.id }" @click="selected = c">
          <span class="cs-sample">
            <span v-if="c.kind === 'n'" class="cs-sn" :class="'cz-' + c.id">{{ nick }}</span>
            <CosFrame v-else-if="c.kind === 'f'" :id="c.id"><span class="cs-mini">🧑‍⚕️</span></CosFrame>
            <span v-else-if="c.kind === 'b'" class="cz-bd cs-sb" :class="c.fx ? 'cz-bd-' + c.fx : null"><Emoji :char="c.emoji" /></span>
            <span v-else class="cs-sg"><CosBg :id="c.id" /></span>
          </span>
          <span class="cs-nm">{{ c.label }}</span>
          <span v-if="wearing === c.id" class="cs-st on">ใส่อยู่</span>
          <span v-else-if="owns(c.id)" class="cs-st">มีแล้ว</span>
          <span v-else class="cs-price">🪙 {{ fmt(c.price) }}</span>
        </button>
      </div>
    </section>

    <!-- ปุ่มติดขอบล่าง -->
    <div v-if="selected" class="cs-dock">
      <button v-if="!owns(selected.id)" class="cs-btn" :disabled="busy || !buy.ok" @click="doBuy">
        {{ buy.reason === 'coins' ? `เหรียญไม่พอ (ขาด ${(selected.price - coins).toLocaleString()})` : `ซื้อ "${selected.label}" · 🪙 ${selected.price.toLocaleString()}` }}
      </button>
      <button v-else-if="wearing === selected.id" class="cs-btn ghost" :disabled="busy" @click="doWear(null)">ถอด "{{ selected.label }}"</button>
      <button v-else class="cs-btn" :disabled="busy" @click="doWear(selected.id)">ใส่ "{{ selected.label }}"</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { increment } from 'firebase/firestore'
import Emoji from '../shared/Emoji.vue'
import CosFrame from '../cosmetics/CosFrame.vue'
import CosName from '../cosmetics/CosName.vue'
import CosBg from '../cosmetics/CosBg.vue'
import { COS_KINDS, COS_TIERS, COSMETICS, getCosmetic } from '../../data/cosmetics.js'
import { cosOf, canBuy, afterBuy, afterWear } from '../../utils/cosmetics.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { useRosterSync } from '../../composables/useRosterSync.js'
import { avatarUrl, fallbackAvatar } from '../../utils/avatar.js'
import { sfx } from '../../utils/sfx.js'

const auth = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const { syncRosterRow } = useRosterSync()

const kind = ref('n')
const selected = ref(null)
const busy = ref(false)

const nick = computed(() => auth.userData?.nickname || 'ฉัน')
const avatar = computed(() => avatarUrl(auth.userData, nick.value))
const coins = computed(() => auth.userData?.coins || 0)
const mine = computed(() => cosOf(auth.userData))
const owns = (id) => mine.value.owned.includes(id)
const wearing = computed(() => mine.value[kind.value])
const itemsOf = (t) => COSMETICS.filter(c => c.kind === kind.value && c.tier === t)
// ลองใส่ = ของที่ใส่อยู่ทุกหมวด ทับด้วยชิ้นที่เลือกในหมวดนี้
const tryOn = computed(() => ({ ...mine.value, ...(selected.value ? { [selected.value.kind]: selected.value.id } : {}) }))
const bgItem = computed(() => getCosmetic(tryOn.value.g))
const buy = computed(() => selected.value ? canBuy(auth.userData, selected.value.id) : { ok: false })
const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M` : `${n / 1000}k`

async function doBuy() {
  const c = selected.value
  // ⚠️ หยิบค่าก่อน patchUser (CLAUDE.md ข้อ 9)
  const check = canBuy(auth.userData, c.id)
  if (!check.ok) return
  const ok = await confirm(`ซื้อ "${c.label}" ราคา ${c.price.toLocaleString()} เหรียญ?\nซื้อแล้วเก็บถาวร ใส่/ถอดได้ตลอด`)
  if (!ok) return
  busy.value = true
  const next = afterBuy(auth.userData, c.id)
  const done = await auth.patchUser(
    { coins: coins.value - c.price, totalSpent: (auth.userData?.totalSpent || 0) + c.price, cosmetics: next },
    { coins: increment(-c.price), totalSpent: increment(c.price), cosmetics: next },
  )
  busy.value = false
  if (!done) { toast('ซื้อไม่สำเร็จ', 'error'); return }
  sfx('coin')
  toast(`ได้ "${c.label}" แล้ว ใส่ให้เลย`, 'success')
  syncRosterRow()
}

async function doWear(id) {
  const k = kind.value
  busy.value = true
  const next = afterWear(auth.userData, k, id)
  const done = await auth.patchUser({ cosmetics: next }, { cosmetics: next })
  busy.value = false
  if (!done) { toast('บันทึกไม่สำเร็จ', 'error'); return }
  syncRosterRow()
}
</script>

<style scoped>
.cs { display: flex; flex-direction: column; gap: 12px; }
.cs-pv { position: relative; overflow: hidden; text-align: center; padding: 20px 14px 14px; border-radius: 22px; background: linear-gradient(150deg, #fde2ee, #fff 58%, var(--primary-light)); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.cs-pv > :not(.cz-bgl) { position: relative; z-index: 1; }
.cs-pv :deep(.cz-fw) { width: 80px; height: 80px; margin: 0 auto; font-size: 2.2rem; }
.cs-av { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto; position: relative; z-index: 1; background: #eef4fb; }
.cs-pv-name { margin-top: 10px; font-size: 1.25rem; font-weight: 800; color: var(--ink); }
.cs-pv.dark .cs-pv-name, .cs-pv.dark .cs-pv-note { color: #fff; }
.cs-pv-note { font-size: .72rem; color: var(--muted); margin-top: 2px; }
.cs-kinds { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; background: var(--primary-light); border-radius: 12px; padding: 3px; }
.cs-kind { font: inherit; font-size: .74rem; font-weight: 700; border: 0; background: transparent; color: var(--muted); border-radius: 9px; padding: 8px 2px; cursor: pointer; }
.cs-kind.on { background: var(--surface); color: var(--primary-dark); box-shadow: 0 1px 3px rgba(43,53,80,.14); }
.cs-tier { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); padding: 10px 12px 12px; }
.cs-tier-h { font-size: .85rem; font-weight: 800; margin-bottom: 8px; }
.cs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.cs-item { font: inherit; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 4px 8px; background: #fff; border: 1.5px solid var(--line); border-radius: 14px; cursor: pointer; color: var(--ink); overflow: hidden; }
.cs-item.sel { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(53,147,207,.18); }
.cs-item.wear { background: var(--primary-light); }
.cs-sample { height: 50px; width: 100%; display: grid; place-items: center; }
.cs-sn { font-weight: 800; font-size: .95rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-mini { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 1.3rem; background: #eef4fb; position: relative; z-index: 1; }
.cs-sample :deep(.cz-fw) { font-size: 1.3rem; }
.cs-sb { font-size: 1.6rem; }
.cs-sg { position: relative; display: block; width: 100%; height: 46px; border-radius: 10px; overflow: hidden; }
.cs-nm { font-size: .72rem; font-weight: 700; color: var(--muted); text-align: center; line-height: 1.2; }
.cs-price { font-size: .76rem; font-weight: 800; color: #b7791f; font-variant-numeric: tabular-nums; }
.cs-st { font-size: .7rem; font-weight: 800; color: var(--muted); }
.cs-st.on { color: var(--primary-dark); }
.cs-dock { position: sticky; bottom: 0; z-index: 3; padding: 10px 0 4px; background: linear-gradient(0deg, rgba(247,249,253,.97) 72%, rgba(247,249,253,0)); }
.cs-btn { width: 100%; font: inherit; font-size: .92rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-2)); border: 0; border-radius: 14px; padding: 13px; cursor: pointer; box-shadow: var(--pop); }
.cs-btn.ghost { color: var(--primary-dark); background: var(--surface); border: var(--bw) solid var(--line); }
.cs-btn:disabled { background: #cbd5e1; color: #fff; cursor: default; }
</style>
