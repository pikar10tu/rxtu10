<!-- 🌳 ต้นไม้รุ่น 10 — ให้ดอกไม้ รดน้ำ ใส่ปุ๋ย ติดอาวุธ ให้เพื่อนๆ (15 พ.ย. 2026)
     ต้นเดียวทั้งรุ่น · ชิ้นบนต้น = ข้อความสุ่มจากเพื่อน (ไม่ระบุชื่อ) · เขย่าต้น = สุ่มชุดใหม่ · ดู data/tree.js + composables/useTree.js -->
<template>
  <div class="tab-content tr">
    <div class="page-title bb-head"><BackButton to="/" /><Emoji char="🌳" /> ต้นไม้รุ่น 10</div>
    <p class="tr-lede">ให้ดอกไม้ รดน้ำ ใส่ปุ๋ย ติดอาวุธ ให้เพื่อนๆ — แตะดอกไม้หรืออาวุธบนต้นเพื่ออ่านคำจากเพื่อน</p>

    <div class="tr-stage">
      <!-- ฉาก: ฟ้า อาทิตย์ เมฆ เนิน หญ้า ดอกไม้ (ตายตัว) -->
      <svg class="tr-scene" viewBox="0 0 400 420" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tr-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff1fb" /><stop offset="1" stop-color="#f6fbef" /></linearGradient>
          <radialGradient id="tr-sun"><stop offset="0" stop-color="#fff6c9" /><stop offset=".55" stop-color="#ffe58a" stop-opacity=".7" /><stop offset="1" stop-color="#ffe58a" stop-opacity="0" /></radialGradient>
          <linearGradient id="tr-h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd69a" /><stop offset="1" stop-color="#6fb57a" /></linearGradient>
          <linearGradient id="tr-h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3e6b5" /><stop offset="1" stop-color="#a5d69c" /></linearGradient>
        </defs>
        <rect width="400" height="420" fill="url(#tr-sk)" />
        <circle cx="340" cy="56" r="58" fill="url(#tr-sun)" />
        <g v-for="(c, i) in CLOUDS" :key="'c' + i" opacity=".9" :transform="`translate(${c[0]} ${c[1]}) scale(${c[2]})`">
          <circle cx="0" cy="0" r="16" fill="#fff" /><circle cx="18" cy="-6" r="20" fill="#fff" /><circle cx="38" cy="0" r="15" fill="#fff" /><circle cx="18" cy="6" r="17" fill="#fff" />
        </g>
        <path d="M0 330 C80 300 150 318 220 306 C290 294 350 312 400 300 L400 420 L0 420Z" fill="url(#tr-h2)" />
        <path d="M0 360 C90 340 170 352 240 344 C310 336 360 350 400 342 L400 420 L0 420Z" fill="url(#tr-h1)" />
        <ellipse cx="200" cy="368" rx="120" ry="13" fill="#3c6e45" opacity=".25" />
        <path v-for="(g, i) in GRASS" :key="'g' + i" :d="`M${g[0]} ${g[1]} q2 -9 4 0 q2 -7 4 0`" stroke="#4f9a5c" stroke-width="1.6" fill="none" stroke-linecap="round" />
        <g v-for="(f, i) in FLOWERS" :key="'f' + i">
          <circle v-for="k in 5" :key="k" :cx="f[0] + Math.cos(k * 1.256) * 3.4" :cy="f[1] + Math.sin(k * 1.256) * 3.4" r="2.6" :fill="f[2]" />
          <circle :cx="f[0]" :cy="f[1]" r="2" fill="#f2b33d" />
        </g>
      </svg>

      <div class="tr-tree" :class="{ bump: anim === 'bump', shake: anim === 'shake' }" @animationend.self="anim = ''">
        <img class="tr-tree-img" :src="base + 'tree/tree.webp'" alt="" draggable="false" />
        <button v-for="p in shown" :key="p.key" type="button" class="tr-piece" :class="[p.note.k, { fresh: p.fresh, fall: falling }]"
                :style="pieceStyle(p)" :aria-label="p.note.k === 'a' ? 'อ่านคำปลุกใจจากเพื่อน' : 'อ่านคำให้กำลังใจจากเพื่อน'" @click="open = p.note">
          <img :src="base + fluentFile(p.note.e)" alt="" draggable="false" />
          <span v-if="isNew(p.note)" class="tr-new" aria-hidden="true">✦</span>
        </button>
      </div>

      <img v-if="drop" :key="drop.key" class="tr-drop" :src="base + fluentFile(drop.e)" alt="" />

      <span v-if="state === 'ready'" class="tr-count">{{ pool.length ? `${pool.length} ข้อความจากเพื่อน` : 'ยังไม่มีข้อความ' }}</span>
      <button v-if="pool.length > 1" type="button" class="tr-shake" :disabled="busy" @click="shake"><Emoji char="🍃" /> เขย่าต้น</button>

      <div v-if="state !== 'ready'" class="tr-veil">
        {{ state === 'error' ? 'โหลดต้นไม้ไม่ได้ ลองเข้าใหม่อีกครั้งนะ' : state === 'missing' ? 'ต้นไม้กำลังปลูกอยู่ เดี๋ยวกลับมาใหม่นะ' : 'กำลังโหลด…' }}
      </div>
      <div v-else-if="!pool.length" class="tr-veil soft">ต้นยังโล่งอยู่เลย มาเป็นคนแรกที่รดน้ำให้เพื่อนกัน</div>
    </div>

    <div v-if="myCount" class="tr-mine"><Emoji char="💌" /> เราเขียนไปแล้ว {{ myCount }} ข้อความ<template v-if="myThanks"> · เพื่อนส่งใจกลับมา {{ myThanks }} ครั้ง</template></div>

    <div class="tr-tabs">
      <button v-for="(K, k) in TREE_KINDS" :key="k" type="button" :class="[k, { on: kind === k }]" :aria-pressed="kind === k" @click="kind = k">
        <span><Emoji :char="K.icon" /> {{ K.label }}</span><small>{{ K.sub }}</small>
      </button>
    </div>

    <form class="tr-compose" @submit.prevent="send">
      <label class="tr-hint" for="tr-txt">{{ K.hint }}</label>
      <textarea id="tr-txt" v-model="text" rows="2" :maxlength="TREE_MAX" :placeholder="K.ph" />
      <div class="tr-chips">
        <button v-for="c in K.chips" :key="c" type="button" @click="text = c">{{ c }}</button>
      </div>
      <div class="tr-row">
        <span class="tr-hint">{{ text.length }}/{{ TREE_MAX }} · ไม่ระบุชื่อเสมอ</span>
        <button class="tr-send" :class="kind" :disabled="!text.trim() || busy || state !== 'ready'"><Emoji :char="K.icon" /> {{ K.send }}</button>
      </div>
    </form>

    <!-- แอดมิน: ข้อความที่เพื่อนแจ้งลบ -->
    <section v-if="auth.isAdmin && flagged.length" class="tr-admin">
      <b><Emoji char="🚩" /> มีคนแจ้งลบ {{ flagged.length }} ข้อความ</b>
      <div v-for="n in flagged" :key="n.id" class="tr-admin-row">
        <span class="tr-admin-t">{{ n.t }}<small> · แจ้ง {{ n.flags }} คน{{ who[n.id] ? ` · เขียนโดย ${who[n.id]}` : '' }}</small></span>
        <button type="button" @click="reveal(n.id)">ใครเขียน</button>
        <button type="button" class="del" @click="adminRemove(n)">ลบ</button>
      </div>
    </section>

    <!-- การ์ดอ่านข้อความ — Teleport (กับดักข้อ 6) · z400 ชั้น sheet ฐาน -->
    <Teleport to="body">
      <div v-if="open" class="tr-ov" @click.self="open = null">
        <div class="tr-note" role="dialog" aria-label="ข้อความจากเพื่อน">
          <span class="tr-tag" :class="open.k"><Emoji :char="TREE_KINDS[open.k].icon" /> {{ TREE_KINDS[open.k].label }}</span>
          <div class="tr-msg">{{ open.t }}</div>
          <div class="tr-who">
            <template v-if="mine[open.id]">คำของเรา (เพื่อนเห็นแบบไม่ระบุชื่อ){{ thanksCount(open.id) ? ` · ได้ใจ ${thanksCount(open.id)} ครั้ง` : '' }}</template>
            <template v-else>จากเพื่อนในรุ่นคนหนึ่ง{{ isNew(open) ? ' · ใหม่' : '' }}</template>
            <template v-if="who[open.id]"> · เขียนโดย {{ who[open.id] }}</template>
          </div>
          <div class="tr-acts">
            <button v-if="!mine[open.id]" type="button" class="tr-thx" :class="{ on: thanked(open.id) }" @click="thank(open.id)">
              <Emoji :char="thanked(open.id) ? '❤️' : '🤍'" /> {{ thanked(open.id) ? 'ส่งใจแล้ว' : 'ขอบคุณ' }}<b v-if="thanksCount(open.id)" class="tr-thx-n"> · {{ thanksCount(open.id) }}</b>
            </button>
            <button type="button" @click="open = null">ปิด</button>
            <span class="tr-acts-gap" />
            <button v-if="auth.isAdmin" type="button" class="tr-link" @click="reveal(open.id)">ใครเขียน</button>
            <button v-if="auth.isAdmin" type="button" class="tr-link" @click="adminRemove(open)">ลบ</button>
            <button v-else-if="!mine[open.id]" type="button" class="tr-link" @click="report(open)">{{ flaggedByMe(open.id) ? 'แจ้งแล้ว' : 'แจ้งลบ' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import BackButton from '../components/shared/BackButton.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'
import { useEscapeKey } from '../composables/useEscapeKey.js'
import { fluentFile } from '../utils/emoji.js'
import { TREE_KINDS, TREE_MAX, TREE_SHOW, TREE_SLOTS, TREE_VIEW, TREE_WEAPONS, TREE_MIX } from '../data/tree.js'
import { useTree, loadTree, plantNote, toggleThanks, toggleFlag, removeNote, whoPlanted } from '../composables/useTree.js'

const base = import.meta.env.BASE_URL
const auth = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const { notes, thanks, flags, mine, state, thanksCount, flagged, myThanks } = useTree()
const uid = computed(() => auth.currentUser?.uid)

// ฉากตายตัว (พิกัดในกรอบ 400×420)
const CLOUDS = [[60, 58, 1], [292, 112, .8], [150, 34, .6]]
const GRASS = Array.from({ length: 26 }, (_, i) => [12 + i * 15 + (i * 37 % 9), 372 + (i * 53 % 30)])
const FLOWERS = [[60, 390, '#ffd1dc'], [340, 384, '#fff1a8'], [110, 404, '#ffffff'], [300, 402, '#ffd1dc']]

const kind = ref('w')
const K = computed(() => TREE_KINDS[kind.value])
const text = ref('')
const busy = ref(false)
const open = ref(null)
const anim = ref('')
const falling = ref(false)
const drop = ref(null)
const who = ref({})
const shown = ref([])   // [{ key, slot, note, fresh }]
let seq = 0
const timers = []
const later = (fn, ms) => timers.push(setTimeout(fn, ms))
onUnmounted(() => timers.forEach(clearTimeout))
useEscapeKey(() => !!open.value, () => { open.value = null })

const flaggedByMe = id => !!flags.value[uid.value]?.[id]
const thanked = id => !!thanks.value[uid.value]?.[id]
// ข้อความที่เราแจ้งลบไปแล้ว ไม่ขึ้นต้นของเราอีก
const pool = computed(() => notes.value.filter(n => !flaggedByMe(n.id)))
const myCount = computed(() => notes.value.filter(n => mine.value[n.id]).length)

const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }

function pieceStyle(p) {
  const [x, y, rot] = TREE_SLOTS[p.slot]
  const arm = p.note.k === 'a'
  return {
    left: x / TREE_VIEW.w * 100 + '%', top: y / TREE_VIEW.h * 100 + '%',
    width: (arm ? TREE_VIEW.weapon : TREE_VIEW.leaf) * boost(p.note) / TREE_VIEW.w * 100 + 'cqw',
    '--rot': (arm ? rot * .6 : rot) + 'deg',
    animationDelay: (falling.value ? p.slot % 5 * .04 : p.fresh ? p.fresh * .09 : 0) + 's',
  }
}

// ── สูตรผสม (15 พ.ย.): ใหม่ ≤3 วัน + ยอดนิยม (สุ่มจากกลุ่มใจมากสุด) + สุ่มทั้งกอง · กลุ่มไหนไม่พอเติมจากสุ่ม ──
const atMs = n => n.at?.toMillis ? n.at.toMillis() : n.at?.seconds ? n.at.seconds * 1000 : Date.now()   // ไม่มี at = เพิ่งเขียนในเครื่อง
const isNew = n => Date.now() - atMs(n) < TREE_MIX.freshDays * 864e5
const popularIds = computed(() => new Set(pool.value.map(n => [n.id, thanksCount(n.id)]).filter(x => x[1] > 0)
  .sort((a, b) => b[1] - a[1]).slice(0, TREE_MIX.popularPool).map(x => x[0])))
function pickMix() {
  const out = [], taken = new Set()
  const take = (list, n) => { for (const x of shuffle([...list])) { if (out.length >= TREE_SHOW || n <= 0) break; if (!taken.has(x.id)) { taken.add(x.id); out.push(x); n-- } } }
  take(pool.value.filter(isNew), TREE_MIX.fresh)
  take(pool.value.filter(n => popularIds.value.has(n.id)), TREE_MIX.popular)
  take(pool.value, TREE_SHOW)
  return shuffle(out)
}
// ใหญ่ขึ้นตามใจ (สูงสุด +18%) — ยอดนิยมเห็นได้ด้วยตา
const boost = n => 1 + Math.min(.18, thanksCount(n.id) * .03)

/** สุ่มชุดใหม่ทั้งต้น */
function fill() {
  const slots = shuffle([...TREE_SLOTS.keys()])
  shown.value = pickMix().map((note, i) => ({ key: ++seq, slot: slots[i], note, fresh: i + 1 }))
}

function shake() {
  if (busy.value) return
  busy.value = true; open.value = null
  anim.value = 'shake'; falling.value = true
  later(() => { falling.value = false; fill(); busy.value = false }, 620)
}

/** ผลิชิ้นใหม่ n ชิ้นจากข้อความที่ยังไม่อยู่บนต้น (ของเพื่อนก่อน) — ต้นเต็มแล้วแทนชิ้นเก่า */
function sprout(n) {
  const on = new Set(shown.value.map(p => p.note.id))
  const cand = shuffle(pool.value.filter(x => !on.has(x.id))).sort((a, b) => (mine.value[a.id] ? 1 : 0) - (mine.value[b.id] ? 1 : 0)).slice(0, n)
  const next = shown.value.map(p => ({ ...p, fresh: 0 }))
  cand.forEach((note, i) => {
    const used = new Set(next.map(p => p.slot))
    const free = [...TREE_SLOTS.keys()].filter(s => !used.has(s))
    let slot
    if (next.length < TREE_SHOW && free.length) slot = free[Math.floor(Math.random() * free.length)]
    else { const old = next.filter(p => !p.fresh); if (!old.length) return; const out = old[Math.floor(Math.random() * old.length)]; slot = out.slot; next.splice(next.indexOf(out), 1) }
    next.push({ key: ++seq, slot, note, fresh: i + 1 })
  })
  shown.value = next
}

async function send() {
  const t = text.value.trim()
  if (!t || busy.value) return
  busy.value = true
  try {
    const note = await plantNote(uid.value, kind.value, t)
    if (!note) return
    text.value = ''
    // ของตกลงดิน → ต้นไม้เด้ง → ผลิ 4–8 ชิ้นจากเพื่อน
    drop.value = { key: ++seq, e: note.k === 'a' ? TREE_WEAPONS[Math.floor(Math.random() * TREE_WEAPONS.length)] : '💧' }
    later(() => { drop.value = null; anim.value = 'bump'; sprout(4 + Math.floor(Math.random() * 5)) }, 900)
    toast('ส่งถึงเพื่อนแล้ว ขอบคุณที่ดูแลกันนะ', 'success')
  } catch (e) {
    console.error('[tree plant]', e)
    toast('ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ', 'error')
  } finally { later(() => { busy.value = false }, 900) }
}

async function thank(id) {
  try { await toggleThanks(uid.value, id) } catch { toast('ส่งใจไม่สำเร็จ ลองใหม่อีกครั้งนะ', 'error') }
}

async function report(n) {
  if (flaggedByMe(n.id)) return
  if (!await confirm('แจ้งลบข้อความนี้? ผู้ดูแลจะเข้ามาตรวจ และข้อความนี้จะไม่ขึ้นบนต้นของคุณอีก')) return
  try {
    await toggleFlag(uid.value, n.id)
    open.value = null
    shown.value = shown.value.filter(p => p.note.id !== n.id)
    toast('แจ้งผู้ดูแลแล้ว ขอบคุณที่ช่วยดูแลต้นไม้', 'success')
  } catch { toast('แจ้งไม่สำเร็จ ลองใหม่อีกครั้งนะ', 'error') }
}

async function reveal(id) {
  try { who.value = { ...who.value, [id]: await whoPlanted(id) } } catch (e) { console.error(e); toast('ดูคนเขียนไม่ได้', 'error') }
}
async function adminRemove(n) {
  if (!await confirm(`ลบข้อความ "${n.t}" ออกจากต้นไม้?`)) return
  try {
    await removeNote(n.id)
    open.value = null
    shown.value = shown.value.filter(p => p.note.id !== n.id)
    toast('ลบแล้ว', 'success')
  } catch (e) { console.error(e); toast('ลบไม่สำเร็จ', 'error') }
}

onMounted(async () => {
  await loadTree(uid.value, { isAdmin: auth.isAdmin })
  if (state.value === 'ready') fill()
})
</script>

<style scoped>
.tr { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.tr-back { font-size: .85rem; color: var(--muted); font-weight: 600; margin-bottom: -6px; }
.tr .page-title { margin-bottom: 0; }
.tr-lede { font-size: .82rem; color: var(--muted); line-height: 1.5; margin-top: -6px; }

/* ── ฉาก: สัดส่วน 400:420 ตายตัว ทุกชิ้นวางเป็น % / cqw → หน้าตาเหมือนกันทุกจอ ── */
.tr-stage { position: relative; aspect-ratio: 400 / 420; container-type: inline-size; border-radius: 22px; overflow: hidden; border: var(--bw) solid var(--line); box-shadow: var(--pop); background: #dff1fb; }
.tr-scene { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.tr-tree { position: absolute; inset: 0; transform-origin: 50% 88%; }
.tr-tree.bump { animation: tr-bump .6s; }
.tr-tree.shake { animation: tr-shake .62s ease-in-out; }
@keyframes tr-bump { 40% { transform: scale(1.03, .98); } }
@keyframes tr-shake { 15% { transform: rotate(-3deg); } 35% { transform: rotate(2.6deg); } 55% { transform: rotate(-2deg); } 75% { transform: rotate(1.2deg); } }
.tr-tree-img { position: absolute; left: -3.5%; top: -5.238%; width: 107%; height: 102.857%; user-select: none; pointer-events: none; }

.tr-piece { all: unset; box-sizing: border-box; position: absolute; aspect-ratio: 1; cursor: pointer; transform: translate(-50%, -50%) rotate(var(--rot, 0deg)); transition: transform .18s; filter: drop-shadow(0 0 2.5px rgba(255,255,255,.7)) drop-shadow(0 1.5px 1.5px rgba(29,59,38,.4)); }
/* เป้าแตะกว้างกว่ารูป (ชิ้นเล็กสุด ~23px บนมือถือ) */
.tr-piece::after { content: ''; position: absolute; inset: -22%; border-radius: 50%; }
.tr-piece img { width: 100%; height: 100%; display: block; object-fit: contain; pointer-events: none; }
.tr-piece:hover, .tr-piece:focus-visible { transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(1.2); z-index: 2; }
.tr-piece:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 50%; }
.tr-new { position: absolute; right: -28%; top: -30%; font-size: .78rem; line-height: 1; color: #ffd84a; text-shadow: 0 0 3px #fff, 0 0 6px #fff7c2; animation: tr-twinkle 1.6s ease-in-out infinite; pointer-events: none; }
@keyframes tr-twinkle { 50% { opacity: .35; transform: scale(.7) rotate(25deg); } }
.tr-piece.fresh { animation: tr-sprout .6s cubic-bezier(.3, 1.6, .5, 1) both; }
.tr-piece.fall { animation: tr-fall .55s ease-in both; pointer-events: none; }
@keyframes tr-sprout { from { transform: translate(-50%, -50%) rotate(calc(var(--rot, 0deg) - 30deg)) scale(0); } }
@keyframes tr-fall { to { transform: translate(-50%, 260%) rotate(calc(var(--rot, 0deg) + 80deg)); opacity: 0; } }

.tr-drop { position: absolute; left: 46%; top: 2%; width: 8cqw; height: 8cqw; animation: tr-drop .9s ease-in forwards; pointer-events: none; }
@keyframes tr-drop { to { transform: translateY(78cqw); opacity: .2; } }

.tr-count { position: absolute; top: 10px; left: 12px; font-size: .72rem; background: rgba(255,255,255,.88); border: var(--bw) solid var(--line); border-radius: 999px; padding: 3px 10px; color: var(--muted); }
.tr-shake { position: absolute; right: 10px; bottom: 10px; font: inherit; font-size: .8rem; font-weight: 700; color: var(--ink); background: rgba(255,255,255,.92); border: var(--bw) solid var(--line); border-radius: 999px; padding: 8px 14px; cursor: pointer; box-shadow: var(--pop); }
.tr-shake:active { transform: scale(.96); }
.tr-shake:disabled { opacity: .6; }
.tr-veil { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 24px; font-size: .85rem; font-weight: 600; color: var(--ink); background: rgba(255,255,255,.55); }
.tr-veil.soft { inset: auto 0 14%; background: none; pointer-events: none; text-shadow: 0 0 6px #fff, 0 0 6px #fff; }

.tr-mine { font-size: .78rem; color: var(--muted); text-align: center; }

.tr-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tr-tabs button { font: inherit; font-size: .9rem; font-weight: 700; color: var(--ink); background: #fff; border: 2px solid var(--line); border-radius: 14px; padding: 9px 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1px; }
.tr-tabs small { font-weight: 400; font-size: .72rem; color: var(--muted); }
.tr-tabs button.on.w { border-color: var(--primary); background: var(--primary-light); }
.tr-tabs button.on.a { border-color: #d98a3d; background: #fff4e6; }

.tr-compose { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; padding: 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: var(--pop); }
.tr-compose textarea { font: inherit; font-size: 1rem; color: var(--ink); border: var(--bw) solid var(--line); border-radius: 12px; padding: 9px 11px; resize: none; background: #fff; }
.tr-compose textarea:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
.tr-hint { font-size: .75rem; color: var(--muted); }
.tr-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.tr-chips button { font: inherit; font-size: .78rem; color: var(--muted); background: none; border: 1px dashed rgba(43,53,80,.28); border-radius: 999px; padding: 4px 11px; cursor: pointer; }
.tr-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tr-send { margin-left: auto; font: inherit; font-size: .9rem; font-weight: 700; color: #fff; border: 0; border-radius: 999px; padding: 9px 18px; cursor: pointer; }
.tr-send.w { background: var(--primary); }
.tr-send.a { background: #c9672c; }
.tr-send:disabled { opacity: .4; cursor: default; }

.tr-admin { background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px; font-size: .82rem; }
.tr-admin-row { display: flex; align-items: center; gap: 6px; }
.tr-admin-t { flex: 1; min-width: 0; }
.tr-admin-t small { color: var(--muted); font-size: .72rem; }
.tr-admin-row button { font: inherit; font-size: .74rem; border: var(--bw) solid var(--line); background: #fff; border-radius: 8px; padding: 5px 9px; cursor: pointer; flex-shrink: 0; }
.tr-admin-row button.del { color: #dc2626; border-color: #fca5a5; }
</style>

<!-- การ์ดอ่านข้อความถูก Teleport ไป body → scoped ใช้ไม่ได้กับตำแหน่งนอก component root จึงแยกบล็อก -->
<style>
.tr-ov { position: fixed; inset: 0; z-index: 400; background: rgba(43,53,80,.28); display: flex; align-items: flex-end; justify-content: center; padding: 0 14px calc(var(--btm, 66px) + 16px); }
.tr-note { width: 100%; max-width: 420px; background: #fff; border: var(--bw) solid var(--line); border-radius: 20px; padding: 16px 18px; box-shadow: var(--pop-lg); display: flex; flex-direction: column; gap: 8px; animation: tr-up .25s ease-out; }
@keyframes tr-up { from { transform: translateY(18px); opacity: 0; } }
.tr-tag { align-self: flex-start; font-size: .74rem; font-weight: 700; border-radius: 999px; padding: 2px 10px; }
.tr-tag.w { background: var(--mint-light); color: #23805f; }
.tr-tag.a { background: #fff0d9; color: #a8551f; }
.tr-msg { font-size: 1.2rem; line-height: 1.5; color: var(--ink); font-weight: 500; overflow-wrap: anywhere; }
.tr-who { font-size: .76rem; color: var(--muted); }
.tr-acts { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.tr-acts button { font: inherit; font-size: .84rem; color: var(--ink); background: #fff; border: var(--bw) solid var(--line); border-radius: 999px; padding: 7px 14px; cursor: pointer; }
.tr-acts .tr-thx.on { background: var(--accent-light); border-color: var(--accent); }
.tr-acts-gap { flex: 1; }
.tr-thx-n { font-weight: 700; }
.tr-acts .tr-link { border: 0; padding: 7px 4px; color: var(--muted); font-size: .76rem; text-decoration: underline; background: none; }
</style>
