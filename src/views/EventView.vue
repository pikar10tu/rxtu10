<!-- ร้านอีเวนต์ประจำเดือน (ฮาโลวีน 2026 = ฟักทอง 🎃)
     แต้มได้จากทำข้อสอบเท่านั้น (QuizView/TimeAttackView → utils/event.js) · แตะของ = ลองใส่บนการ์ดด้านบน
     เดโมที่ user เคาะ 25 ต.ค. 2026: https://claude.ai/artifact/EoxFACY68DuanSKNqh56Hm -->
<template>
  <div class="tab-content ev">
    <div class="page-title ev-head">
      <RouterLink to="/play" class="ev-back" aria-label="กลับ">‹</RouterLink>
      <span>{{ ev ? ev.name : 'อีเวนต์' }}</span>
      <span v-if="ev" class="ev-pts"><Emoji :char="ev.pt" /> {{ pts.toLocaleString() }}</span>
    </div>

    <div v-if="!ev" class="ev-empty">ตอนนี้ยังไม่มีอีเวนต์ รอติดตามเดือนหน้านะ</div>

    <template v-else>
      <!-- เรื่องราวอีเวนต์ (data/events.js story) -->
      <div v-if="ev.story" class="ev-story">
        <div class="ev-story-h"><Emoji char="🧙‍♀️" /> คำขอจากแม่มดใจดี</div>
        <p v-for="(line, i) in ev.story" :key="i">{{ line }}</p>
        <div v-if="given !== null" class="ev-given">ทั้งรุ่นส่ง<Emoji :char="ev.pt" />ให้แม่มดแล้ว <b>{{ given.toLocaleString() }}</b> ลูก</div>
      </div>

      <div class="ev-how">
        <b>เก็บฟักทองจากข้อสอบและดันเจี้ยน</b>
        <span class="ev-gos">
          <RouterLink to="/quiz" class="ev-go">ไปทำข้อสอบ ›</RouterLink>
          <RouterLink to="/dungeon" class="ev-go alt">ไปฟักทองบุก ›</RouterLink>
        </span>
      </div>

      <!-- การ์ดลองใส่ -->
      <div class="ev-pv" :class="{ dark: bgItem?.dark }">
        <CosBg :id="tryOn.g" />
        <CosFrame :id="tryOn.f">
          <img class="ev-av" :src="avatar" alt="" referrerpolicy="no-referrer" @error="(e) => fallbackAvatar(e, nick)" />
        </CosFrame>
        <div class="ev-pv-name"><CosName :name="nick" :cos="tryOn" /></div>
        <div class="ev-pv-note">{{ selected?.type === 'cos' && !owns(selected.id) ? 'กำลังลองใส่ · ยังไม่ได้แลก' : 'ที่ใส่อยู่ตอนนี้' }}</div>
      </div>

      <section v-for="g in groups" :key="g.k" class="ev-sec">
        <div class="ev-sec-h"><Emoji :char="g.icon" /> {{ g.label }}</div>
        <div class="ev-grid">
          <button v-for="it in g.items" :key="it.id" class="ev-item" :class="{ sel: selected?.id === it.id }" @click="selected = it">
            <span class="ev-sample">
              <span v-if="it.kind === 'n'" class="ev-sn" :class="'cz-' + it.id">{{ nick }}</span>
              <CosFrame v-else-if="it.kind === 'f'" :id="it.id"><span class="ev-mini"><Emoji char="🧑‍⚕️" /></span></CosFrame>
              <span v-else-if="it.kind === 'b'" class="cz-bd ev-sb"><Emoji :char="it.emoji" /></span>
              <span v-else-if="it.kind === 'g'" class="ev-sg"><CosBg :id="it.id" /></span>
              <span v-else class="ev-misc"><Emoji :char="it.emoji" /></span>
            </span>
            <span class="ev-nm">{{ it.label }}</span>
            <span v-if="it.note" class="ev-note">{{ it.note }}</span>
            <span v-if="it.type === 'cos' && owns(it.id)" class="ev-st">มีแล้ว</span>
            <span v-else class="ev-price"><Emoji :char="ev.pt" /> {{ it.price }}</span>
            <span v-if="it.type === 'misc'" class="ev-left">แลกแล้ว {{ bought(it.id) }}/{{ it.max }}</span>
          </button>
        </div>
      </section>

      <!-- แลกเป็นเหรียญ ไม่จำกัด (user 25 ต.ค. 2026) · อัตราอยู่ data/events.js coinRate -->
      <section v-if="ev.coinRate" class="ev-sec">
        <div class="ev-sec-h"><Emoji char="🪙" /> แลกเป็นเหรียญ</div>
        <div class="ev-ex">
          <div class="ev-ex-rate">1 <Emoji :char="ev.pt" /> = {{ ev.coinRate.toLocaleString() }} <Emoji char="🪙" /> · แลกได้ไม่จำกัด</div>
          <div class="ev-ex-row">
            <button v-for="n in [1, 10, 50]" :key="n" class="ev-ex-q" :class="{ on: exN === n }" :disabled="pts < n" @click="exN = n">{{ n }}</button>
            <button class="ev-ex-q" :class="{ on: exN === pts && pts > 0 }" :disabled="!pts" @click="exN = pts">ทั้งหมด</button>
          </div>
          <button class="ev-btn" :disabled="busy || !exN || exN > pts" @click="doExchange">
            แลก {{ exN || 0 }} <Emoji :char="ev.pt" /> → {{ ((exN || 0) * ev.coinRate).toLocaleString() }} <Emoji char="🪙" />
          </button>
        </div>
      </section>

      <div v-if="selected" class="ev-dock">
        <button v-if="selected.type === 'cos' && owns(selected.id)" class="ev-btn ghost" :disabled="busy" @click="doWear">
          {{ wearing(selected) ? `ถอด "${selected.label}"` : `ใส่ "${selected.label}"` }}
        </button>
        <button v-else class="ev-btn" :disabled="busy || !check.ok" @click="doRedeem">
          <template v-if="check.reason === 'pts'">{{ ev.ptName }}ไม่พอ (ขาด {{ selected.price - pts }})</template>
          <template v-else-if="check.reason === 'max'">แลกครบแล้ว</template>
          <template v-else>แลก "{{ selected.label }}" · <Emoji :char="ev.pt" /> {{ selected.price }}</template>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { increment } from 'firebase/firestore'
import Emoji from '../components/shared/Emoji.vue'
import CosFrame from '../components/cosmetics/CosFrame.vue'
import CosName from '../components/cosmetics/CosName.vue'
import CosBg from '../components/cosmetics/CosBg.vue'
import { COSMETICS, getCosmetic } from '../data/cosmetics.js'
import { cosOf, afterWear } from '../utils/cosmetics.js'
import { activeEvent, evtOf, shopItems, canRedeem, evtAfterRedeem, exchangePatch } from '../utils/event.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'
import { useRosterSync } from '../composables/useRosterSync.js'
import { avatarUrl, fallbackAvatar } from '../utils/avatar.js'
import { sfx } from '../utils/sfx.js'
import { grantSecret } from '../composables/useAchievements.js'
import { fetchGlobalStats, bumpEventGive } from '../composables/useGlobalStats.js'
import { evGiveMilestone } from '../utils/newsFeed.js'

// ของแต่งตัวราคาตั้งแต่นี้ขึ้นกระดานข่าวตอนแลก (user: เอาเฉพาะของแพง) = ผีน้อยลอยวน 210 · ราชาฟักทอง 250
const NEWS_MIN_PK = 200

const auth = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const { syncRosterRow } = useRosterSync()

const ev = activeEvent()

// 🎃 ยอดรวมรุ่นที่ส่งให้แม่มด (stats/global.evGive) — อ่านครั้งเดียวตอนเปิดหน้า · แลกแล้วเขียน+อ่านกลับ
const given = ref(null)
onMounted(async () => {
  if (!ev) return
  const g = await fetchGlobalStats()
  given.value = Number(g.evGive?.[ev.id]) || 0
})
/** นับยอดรวมรุ่น + ข้ามหมุด (evGiveMilestone) ⇒ ข่าวกระดานแบบไม่ระบุชื่อ · ไม่ await จากฝั่งเรียก */
function giveToWitch(n) {
  bumpEventGive(ev.id, n).then(r => {
    if (!r) return
    given.value = r.after
    const m = evGiveMilestone(r.before, r.after)
    if (m) syncRosterRow({ event: { k: 'ew', v: m, t: Date.now() } })
  })
}
const selected = ref(null)
const busy = ref(false)

const nick = computed(() => auth.userData?.nickname || 'ฉัน')
const avatar = computed(() => avatarUrl(auth.userData, nick.value))
const mine = computed(() => cosOf(auth.userData))
const evt = computed(() => evtOf(auth.userData, ev))
const pts = computed(() => evt.value.pts)
const owns = (id) => mine.value.owned.includes(id)
const bought = (id) => evt.value.buy[id] || 0
const wearing = (it) => mine.value[it.kind] === it.id
const endText = ev ? new Date(ev.end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : ''

const items = shopItems(ev, COSMETICS)
const groups = [
  { k: 'f', icon: '🖼️', label: 'กรอบรูป' },
  { k: 'n', icon: '🎨', label: 'สีชื่อ' },
  { k: 'b', icon: '✨', label: 'ป้ายหน้าชื่อ' },
  { k: 'g', icon: '🌈', label: 'พื้นการ์ด' },
  { k: 'misc', icon: '🧺', label: 'ของจิปาถะ' },
].map(g => ({ ...g, items: items.filter(i => (i.type === 'misc' ? 'misc' : i.kind) === g.k) })).filter(g => g.items.length)

const tryOn = computed(() => ({ ...mine.value, ...(selected.value?.type === 'cos' ? { [selected.value.kind]: selected.value.id } : {}) }))
const bgItem = computed(() => getCosmetic(tryOn.value.g))
const check = computed(() => selected.value ? canRedeem(auth.userData, ev, selected.value) : { ok: false })

async function doRedeem() {
  const it = selected.value
  // ⚠️ หยิบค่าก่อน patchUser (CLAUDE.md ข้อ 9)
  if (!canRedeem(auth.userData, ev, it).ok) return
  const ok = await confirm(`แลก "${it.label}" ด้วย ${it.price} ${ev.ptName}?`)
  if (!ok) return
  busy.value = true
  const nextEvt = evtAfterRedeem(auth.userData, ev, it)
  let local = { evt: nextEvt }, server = { evt: nextEvt }
  if (it.type === 'cos') {
    const cur = mine.value
    const nextCos = { ...cur, owned: [...cur.owned, it.id], [it.kind]: it.id }
    local.cosmetics = nextCos; server.cosmetics = nextCos
  } else {
    local[it.field] = (auth.userData?.[it.field] || 0) + 1
    server[it.field] = increment(1)
  }
  const done = await auth.patchUser(local, server)
  busy.value = false
  if (!done) { toast('แลกไม่สำเร็จ', 'error'); return }
  sfx('coin')
  toast(it.type === 'cos' ? `ได้ "${it.label}" แล้ว ใส่ให้เลย` : `ได้ ${it.label} 1 ชิ้น`, 'success')
  giveToWitch(it.price)
  if (it.type === 'cos') {
    // ของแพงขึ้นกระดานข่าว (เกาะ write แถว roster ที่ต้องทำอยู่แล้ว · 0 write เพิ่ม)
    syncRosterRow(it.price >= NEWS_MIN_PK ? { event: { k: 'eb', v: it.id, t: Date.now() } } : {})
    if (it.id === 'f-hw-king') grantSecret('hw_king')
    const kinds = new Set(cosOf(auth.userData).owned.map(id => getCosmetic(id)).filter(c => c?.ev === ev.id).map(c => c.kind))
    if (kinds.size >= 4) grantSecret('hw_style')
  }
}

const exN = ref(1)
async function doExchange() {
  // ⚠️ หยิบค่าก่อน patchUser (CLAUDE.md ข้อ 9)
  const r = exchangePatch(auth.userData, ev, exN.value)
  if (!r.ok) return
  const amt = r.coins / ev.coinRate
  const ok = await confirm(`แลก ${exN.value} ${ev.ptName} เป็น ${r.coins.toLocaleString()} เหรียญ?`)
  if (!ok) return
  busy.value = true
  const done = await auth.patchUser(
    { evt: r.evt, coins: (auth.userData?.coins || 0) + r.coins },
    { evt: r.evt, coins: increment(r.coins) },
  )
  busy.value = false
  if (!done) { toast('แลกไม่สำเร็จ', 'error'); return }
  sfx('coin')
  toast(`ได้ ${r.coins.toLocaleString()} เหรียญ`, 'success')
  giveToWitch(amt)
}

async function doWear() {
  const it = selected.value
  busy.value = true
  const next = afterWear(auth.userData, it.kind, wearing(it) ? null : it.id)
  const done = await auth.patchUser({ cosmetics: next }, { cosmetics: next })
  busy.value = false
  if (!done) { toast('บันทึกไม่สำเร็จ', 'error'); return }
  syncRosterRow()
}
</script>

<style scoped>
.ev { display: flex; flex-direction: column; gap: 12px; padding-bottom: 90px; }
.ev-head { display: flex; align-items: center; gap: 8px; }
.ev-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }
.ev-pts { margin-left: auto; font-size: .9rem; font-weight: 800; background: #fff7ed; border: var(--bw) solid #fed7aa; border-radius: 999px; padding: 3px 12px; color: #9a3412; }
.ev-empty { text-align: center; color: var(--muted); padding: 40px 0; }
.ev-story { position: relative; overflow: hidden; background: linear-gradient(160deg, #3b1d5e, #7c2d12); color: #fff3e0; border-radius: 18px; padding: 14px 16px; box-shadow: 0 6px 18px rgba(124, 45, 18, .35); }
.ev-story::after { content: ''; position: absolute; top: -30px; right: -30px; width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle, #fdba74 0%, #f97316 55%, transparent 70%); opacity: .55; pointer-events: none; }
.ev-story-h { position: relative; z-index: 1; font-weight: 800; font-size: .95rem; margin-bottom: 6px; color: #fed7aa; }
.ev-story p { position: relative; z-index: 1; margin: 0 0 6px; font-size: .82rem; line-height: 1.65; }
.ev-story p:last-child { margin-bottom: 0; font-weight: 700; color: #fff; }
.ev-given { position: relative; z-index: 1; margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(254, 215, 170, .4); font-size: .8rem; color: #fed7aa; }
.ev-given b { color: #fff; font-size: .95rem; }
.ev-how { background: linear-gradient(120deg, #fed7aa, #ddd6fe); border-radius: 18px; padding: 12px 14px; font-size: .84rem; line-height: 1.6; color: #2b1f3d; display: flex; flex-direction: column; gap: 2px; }
.ev-end { font-size: .74rem; color: #4c3a63; }
.ev-gos { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.ev-go.alt { background: #7c3aed; }
.ev-go { background: #ea580c; color: #fff; text-decoration: none; font-weight: 700; border-radius: 12px; padding: 7px 14px; font-size: .82rem; }
.ev-pv { position: relative; overflow: hidden; text-align: center; padding: 20px 14px 14px; border-radius: 22px; background: linear-gradient(150deg, #ffedd5, #fff 58%, #ede9fe); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.ev-pv > :not(.cz-bgl) { position: relative; z-index: 1; }
.ev-pv :deep(.cz-fw) { width: 80px; height: 80px; margin: 0 auto; font-size: 2.2rem; }
.ev-av { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto; position: relative; z-index: 1; background: #eef4fb; }
.ev-pv-name { margin-top: 10px; font-size: 1.25rem; font-weight: 800; color: var(--ink); }
.ev-pv.dark .ev-pv-name, .ev-pv.dark .ev-pv-note { color: #fff; }
.ev-pv-note { font-size: .72rem; color: var(--muted); margin-top: 2px; }
.ev-sec-h { font-weight: 800; font-size: .9rem; margin-bottom: 6px; color: var(--ink); }
.ev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ev-item { font: inherit; border: var(--bw) solid var(--line); background: #fff; border-radius: 16px; padding: 12px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; color: var(--ink); }
.ev-item.sel { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234, 88, 12, .18); }
.ev-sample { height: 54px; display: grid; place-items: center; }
.ev-sample :deep(.cz-fw) { width: 40px; height: 40px; font-size: 1.3rem; }
.ev-mini { width: 40px; height: 40px; border-radius: 50%; background: #fde4cf; display: grid; place-items: center; }
.ev-sn { font-weight: 800; font-size: 1rem; }
.ev-sb { font-size: 1.5rem; }
.ev-sg { position: relative; display: block; width: 64px; height: 44px; border-radius: 10px; overflow: hidden; border: var(--bw) solid var(--line); }
.ev-misc { font-size: 1.8rem; }
.ev-nm { font-size: .78rem; font-weight: 700; text-align: center; line-height: 1.3; }
.ev-note { font-size: .7rem; color: var(--muted); text-align: center; line-height: 1.3; padding: 0 2px; }
.ev-price { font-size: .78rem; font-weight: 800; color: #c2410c; }
.ev-st { font-size: .72rem; font-weight: 700; color: #15803d; }
.ev-left { font-size: .7rem; color: var(--muted); }
.ev-ex { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.ev-ex-rate { font-size: .84rem; font-weight: 700; color: var(--ink); }
.ev-ex-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.ev-ex-q { font: inherit; font-size: .84rem; font-weight: 800; border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 8px 0; cursor: pointer; color: var(--ink); }
.ev-ex-q.on { border-color: #ea580c; background: #fff7ed; color: #9a3412; }
.ev-ex-q:disabled { opacity: .4; cursor: not-allowed; }
.ev-dock { position: sticky; bottom: 8px; z-index: 5; }
.ev-btn { width: 100%; font: inherit; font-weight: 800; font-size: .92rem; border: 0; border-radius: 14px; padding: 13px; background: #ea580c; color: #fff; cursor: pointer; box-shadow: var(--pop); }
.ev-btn:disabled { background: #d6cbe0; color: #fff; cursor: not-allowed; }
.ev-btn.ghost { background: #fff; color: var(--ink); border: var(--bw) solid var(--line); }
</style>
