<!-- 🥊 สนามมวยเป่ายิงฉุบ (27 พ.ย. 2026 · Co-working ห้องที่ 4 "สนามมวย") — วางซ้อนในฉาก (.fo-scene) ของ FocusView
     ปุ่ม 🥊 ลอยแบบลูบแมว (เดินใกล้เวทีแล้วโผล่) → จองมุมแดง/น้ำเงิน · Bo3 ยกละ 5 วิ · หมัด = อีโมจิ 👊 ลอยใส่ ไม่มีอนิเมชันแยก
     ทุกเครื่องเล่นอนิเมชันเองจาก useRing.state (คนดูเห็นเหมือนกัน) · มือเหนือหัว/ตัวขาว/ล้ม → ringFx (FocusView วาดบนอวาตาร์)
     ผลแพ้ชนะ → แชตห้อง + กระดาน (คนปิดไฟต์คนเดียวเขียน) · ไม่มีเหรียญรางวัล (กันฟาร์ม) -->
<template>
  <div class="rg" :class="{ dim: fighting }">
    <!-- สกอร์ -->
    <template v-if="m && m.b">
      <div class="rg-sc r"><b>{{ m.r?.name || '—' }}</b><i v-for="n in WIN_ROUNDS" :key="n" :class="{ on: n <= shownScore.r }"></i></div>
      <div class="rg-sc b"><i v-for="n in WIN_ROUNDS" :key="n" :class="{ on: n <= shownScore.b }"></i><b>{{ m.b?.name || '—' }}</b></div>
    </template>

    <!-- ปุ่มลอยแบบลูบแมว -->
    <button v-if="showBtn" type="button" class="rg-btn" :style="pos(RING_BTN[0], RING_BTN[1])" :aria-label="m && !m.b ? `ชกกับ ${m.r.name}` : 'ขึ้นสังเวียน'" @click.stop="onClaim">
      <Emoji char="🥊" />
      <span v-if="m && !m.b" class="rg-btn-t">ท้าชก!</span>
    </button>

    <!-- หมัด / คำ / ดาว / ป้าย / เชียร์ -->
    <span v-for="f in fx" :key="f.id" :class="['rg-fx', f.k]" :style="f.style"><Emoji v-if="f.e" :char="f.e" />{{ f.t }}</span>
    <div v-if="flashOn" class="rg-flash"></div>
    <div v-if="banner" :key="banner.id" class="rg-banner" :class="banner.k">{{ banner.t }}</div>

    <!-- ปุ่มกระดานผล + เชียร์ -->
    <div class="rg-bar" @click.stop>
      <button type="button" class="rg-pill" @click="boardOpen = true"><Emoji char="📋" /> ผล</button>
      <template v-if="m && m.b && !mySide">
        <button v-for="c in CHEERS" :key="c" type="button" class="rg-pill" :aria-label="`เชียร์ ${c}`" @click="cheer(c)"><Emoji :char="c" /></button>
      </template>
    </div>

    <!-- แผงคู่ชก -->
    <div v-if="mySide && m && !m.b" class="rg-panel" @click.stop>
      <span>รอคู่ชก… เพื่อนเดินมาใกล้เวทีแล้วกด <Emoji char="🥊" /> ได้เลย</span>
      <button type="button" class="rg-pill" @click="stepDown">ลงจากเวที</button>
    </div>
    <div v-else-if="picking" class="rg-panel picks" @click.stop>
      <div class="rg-timer"><i :style="{ animationDuration: PICK_MS + 'ms' }" :key="pickKey"></i></div>
      <button v-for="h in HANDS" :key="h" type="button" class="rg-hand" :aria-label="HAND_LABEL[h]" @click="pick(h)"><Emoji :char="HAND_EMOJI[h]" /><small>{{ HAND_LABEL[h] }}</small></button>
    </div>
  </div>

  <BottomSheet v-model:open="boardOpen" icon="📋" title="กระดานผลสนามมวย">
    <div class="rg-board">
      <template v-if="ranking.length">
        <b>อันดับชนะ</b>
        <ol><li v-for="(r, i) in ranking" :key="r.name"><span>{{ ['🥇', '🥈', '🥉'][i] || i + 1 + '.' }} {{ r.name }}</span><span>{{ r.wins }} ครั้ง</span></li></ol>
      </template>
      <b>ไฟต์ล่าสุด</b>
      <p v-if="!ring.board.value.length" class="rg-empty">ยังไม่มีใครขึ้นชก เป็นคนแรกเลย</p>
      <ul><li v-for="r in ring.board.value.slice(0, 20)" :key="r.id"><span>{{ r.w }} ชนะ {{ r.l }}<small v-if="r.f"> (คู่ชกออก)</small></span><span>{{ r.s || '' }}</span></li></ul>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import { useRing, ringFx, clearRingFx, WAIT_MS } from '../../composables/useRing.js'
import { useFocusRoom } from '../../composables/useFocusRoom.js'
import {
  HANDS, HAND_EMOJI, HAND_LABEL, WIN_ROUNDS, PICK_MS, RING, CORNER, RING_BTN, SPECTATE,
  deriveMatch, isDecider, roundNo, resultText, scoreText, randomHand, ringRanking,
} from '../../utils/ringMatch.js'
import { sfx } from '../../utils/sfx.js'

const props = defineProps({
  me: { type: Object, default: null },        // { x, y } ตัวเรา (null = ยังไม่ได้นั่งห้องนี้)
  myName: { type: String, default: 'เพื่อน' },
  sceneEl: { type: Object, default: null },   // ไว้สั่นจอ
})
const emit = defineEmits(['goto'])
const ring = useRing()
const room = useFocusRoom()
const m = ring.match
const mySide = ring.mySide
const CHEERS = ['📣', '🔥', '👏']
const pos = (x, y) => ({ left: x / 160 * 100 + '%', top: y + '%' })

// ── ปุ่มขึ้นสังเวียน: เดินใกล้เวที + เวทีว่าง/มีคนรอคู่ ──
const near = computed(() => !!props.me && props.me.x > RING.x0 - 16 && props.me.x < RING.x1 + 16 && props.me.y > RING.y0 - 8 && props.me.y < RING.y1 + 12)
const open = computed(() => ring.isStale(m.value) || (!!m.value && !m.value.b && m.value.r?.uid !== room.myUid()))
const showBtn = computed(() => near.value && !mySide.value && open.value && !busyClaim.value)
const busyClaim = ref(false)
async function onClaim() {
  busyClaim.value = true
  const side = await ring.claim(props.myName)
  busyClaim.value = false
  if (!side) return
  sfx('tap')
  emit('goto', CORNER[side])
  room.say('ring', side === 'r' ? `🥊 ${props.myName} ขึ้นสังเวียน รอคู่ชก!` : `🥊 ${props.myName} รับคำท้า!`, { sys: 'ring' })
}

// ── อนิเมชัน: เล่นทีละยกจากข้อมูล (คู่ชก+คนดูเหมือนกัน) ──
const fx = ref([]); let fxId = 0
function addFx(k, style, { e, t, ms = 900 } = {}) { const id = ++fxId; fx.value.push({ id, k, style, e, t }); setTimeout(() => { fx.value = fx.value.filter(f => f.id !== id) }, ms) }
const banner = ref(null)
function showBanner(t, k = '', ms = 1100) { const b = { id: ++fxId, t, k }; banner.value = b; setTimeout(() => { if (banner.value === b) banner.value = null }, ms) }
const flashOn = ref(false)
function flash() { flashOn.value = false; requestAnimationFrame(() => { flashOn.value = true; setTimeout(() => { flashOn.value = false }, 180) }) }
function shake(big) { const el = props.sceneEl; if (!el) return; el.classList.remove('rg-shake', 'rg-shake-big'); void el.offsetWidth; el.classList.add(big ? 'rg-shake-big' : 'rg-shake') }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const uidOf = (s) => m.value?.[s]?.uid
function setHand(s, c, k) { const u = uidOf(s); if (u) ringFx.hands[u] = c ? { c, k } : null }
function setCls(s, c) { const u = uidOf(s); if (u) ringFx.cls[u] = c }
function stars(x, y, n, big) {
  const C = ['#ffd93d', '#ffffff', '#ff9f43', '#ff5a5f']
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = (big ? 14 : 8) + Math.random() * 6
    addFx('star', { ...pos(x, y), background: C[i % 4], '--dx': Math.cos(a) * r + 'cqw', '--dy': Math.sin(a) * r + 'cqw' }, { ms: 600 })
  }
}
function crowd(n) { for (let i = 0; i < n; i++) setTimeout(() => addFx('cheer', pos(...SPECTATE[i % SPECTATE.length]), { e: ['📣', '🔥', '👏', '😱'][i % 4], ms: 1600 }), i * 70) }
function cheer(c) { addFx('cheer', pos(10 + Math.random() * 140, 70 + Math.random() * 25), { e: c, ms: 1600 }); sfx('tap') }

const fighting = computed(() => !!m.value?.b && !m.value?.done)
const shownScore = ref({ r: 0, b: 0 })
let shownId = null, shown = 0, playing = false, ended = false

async function punch(from, to, final) {
  const [fx0, fy0] = CORNER[from], [tx, ty] = CORNER[to]
  const id = ++fxId
  fx.value.push({ id, k: 'punch' + (from === 'b' ? ' flip' : '') + (final ? ' final' : ''), style: { ...pos(fx0, fy0 - 18) }, e: '👊' })
  await sleep(30)
  const f = fx.value.find(x => x.id === id); if (f) f.style = { ...pos(tx, ty - 18), transitionDuration: final ? '.55s' : '.3s' }
  await sleep(final ? 560 : 320)
  fx.value = fx.value.filter(x => x.id !== id)
  setCls(to, 'white'); flash(); sfx('hit_fist', { w: final ? 1 : 0.6, crit: final }); if (final) sfx('boom')
  await sleep(final ? 160 : 80)
  setCls(to, 'hit'); shake(final); stars(tx, ty - 18, final ? 18 : 10, final)
  addFx('pow' + (final ? ' big' : ''), pos(tx, ty - 26), { t: final ? 'K.O.!' : ['ปั้ก!', 'โป๊ะ!', 'ตุ้บ!', 'เพี้ยะ!'][Math.floor(Math.random() * 4)], ms: 900 })
  crowd(final ? 10 : 4)
  await sleep(450); if (!final) setCls(to, null)
}

async function playThrow(t) {
  setHand('r', HAND_EMOJI[t.r], 'slam'); setHand('b', HAND_EMOJI[t.b], 'slam'); sfx('tap'); shake(false)
  await sleep(650)
  if (t.res === 'tie') { showBanner('เสมอ! อีกที', '', 800); await sleep(1000); return }
  const sc = { ...shownScore.value }; sc[t.res]++
  const final = sc[t.res] >= WIN_ROUNDS
  setHand('r', null); setHand('b', null)
  await punch(t.res, t.res === 'r' ? 'b' : 'r', final)
  shownScore.value = sc
  if (final) return
  await sleep(700)
  if (isDecider(sc)) { showBanner('ยกตัดสิน!', 'mp', 1400); sfx('super'); await sleep(1500) }
  else { showBanner(`ยกที่ ${roundNo(sc)}`, '', 800); await sleep(900) }
}

async function playEnd(winner, forfeit) {
  const cur = m.value; if (!cur || ended) return
  const wasMine = !!mySide.value   // จำไว้ก่อน — อีกเครื่องอาจล้างเวทีก่อนเราฉลองจบ แล้ว mySide กลายเป็น null (เดิมตัวค้างบนเวที)
  ended = true; picking.value = false
  const loser = winner === 'r' ? 'b' : 'r'
  if (!forfeit) { setCls(loser, 'ko'); await sleep(500) }
  sfx('finish'); addConfetti()
  setHand(winner, '🏆', 'slam'); setCls(winner, 'win')
  const wName = cur[winner]?.name || 'เพื่อน', lName = cur[loser]?.name || 'เพื่อน'
  showBanner(`🏆 ${wName} ชนะ!`, '', 2000)
  // ปิดไฟต์ครั้งเดียว: คนที่ได้ done = เขียนกระดาน + แชต
  const score = shownScore.value
  if (await ring.finish(cur.id)) {
    room.say('ring', resultText({ wName, lName, score, winner, forfeit }), { sys: 'ring' })
    ring.record({ w: wName, l: lName, s: forfeit ? '' : scoreText(score, winner), ...(forfeit ? { f: true } : {}) })
  }
  await sleep(2600)
  clearRingFx()   // 27 พ.ย. เดิมล้างตาม uid ใน match → ถ้าอีกเครื่องล้างเวทีไปก่อน ท่าล้มค้างตอนเดิน
  if (wasMine) goDown()
  ring.clear(cur.id)
}
function addConfetti() {
  const C = ['#ff5a5f', '#ffd93d', '#4cd18a', '#4da8f0', '#9b6bd9', '#ff9f43']
  for (let i = 0; i < 36; i++) addFx('confetti', { left: Math.random() * 100 + '%', background: C[i % 6], animationDelay: Math.random() * 0.5 + 's', '--dx': (Math.random() * 20 - 10) + 'cqw' }, { ms: 2400 })
}

// ── เลือกมือ (เฉพาะคู่ชก) ──
const picking = ref(false), pickKey = ref(0)
let pickTimer = 0, waitTimer = 0, pickedIdx = -1
function startPick(i) {
  if (pickedIdx === i || picking.value) return
  picking.value = true; pickKey.value++
  setHand(mySide.value, '🤔', 'think')
  clearTimeout(pickTimer)
  pickTimer = setTimeout(() => pick(randomHand()), PICK_MS)   // ไม่เลือก = สุ่มให้
}
function pick(h) {
  const i = ring.state.value.next
  if (!picking.value || pickedIdx === i) return
  picking.value = false; pickedIdx = i; clearTimeout(pickTimer)
  ring.throwHand(i, h); sfx('tap')
  setHand(mySide.value, '✅', 'on')
  // อีกฝ่ายไม่ออกมือนานผิดปกติ (ปัดแอป/เน็ตหลุดแต่ยังไม่ตัดหลุด) → ชนะไป
  clearTimeout(waitTimer)
  waitTimer = setTimeout(() => { const st = ring.state.value; if (!ended && st.next === i && m.value?.b) playEnd(mySide.value, true) }, 20000)
}

async function pump() {
  if (playing) return
  playing = true
  try {
    for (;;) {
      const cur = m.value
      if (!cur?.id || !cur.b || cur.done && ended) break
      const st = deriveMatch(cur.h)
      if (shown < st.throws.length) { const t = st.throws[shown++]; picking.value = false; clearTimeout(pickTimer); await playThrow(t); continue }
      if (st.winner) { await playEnd(st.winner, false); break }
      // ยังไม่จบ: คนดูเห็น 🤔/✅ ตามว่าใครออกมือแล้ว · คู่ชกเปิดปุ่มเลือก
      for (const s of ['r', 'b']) setHand(s, cur.h?.[s]?.[st.next] != null ? '✅' : '🤔', cur.h?.[s]?.[st.next] != null ? 'on' : 'think')
      if (mySide.value && cur.h?.[mySide.value]?.[st.next] == null) startPick(st.next)
      break
    }
  } finally { playing = false }
}

watch(m, (cur, old) => {
  // ไฟต์ใหม่ → รีเซ็ต · เปิดหน้ามากลางไฟต์ = ข้ามยกที่ผ่านไปแล้ว
  if (cur?.id !== shownId) {
    clearRingFx()
    shownId = cur?.id || null; ended = false; pickedIdx = -1; picking.value = false; clearTimeout(pickTimer); clearTimeout(waitTimer)
    const st = deriveMatch(cur?.h)
    const fresh = !old || !old.id   // เห็นตั้งแต่เริ่ม
    shown = fresh ? 0 : st.throws.length
    shownScore.value = fresh ? { r: 0, b: 0 } : { ...st.score }
  }
  if (!cur?.id) return
  // เริ่มไฟต์ (มุมน้ำเงินเพิ่งขึ้น)
  if (cur.b && !old?.b && old?.id === cur.id) { sfx('levelup'); showBanner('ยกที่ 1 · ชก!'); setTimeout(pump, 900); return }
  // คู่ชกหลุดกลางไฟต์ (มุมหาย) → ที่เหลือชนะ
  if (cur.st && (!cur.r || !cur.b) && !cur.done && !ended) { const w = cur.r ? 'r' : 'b'; if (cur[w]) playEnd(w, true); return }
  pump()
}, { deep: true })

const goDown = () => emit('goto', SPECTATE[Math.floor(Math.random() * SPECTATE.length)])
async function stepDown() { await ring.leaveRing(); goDown() }
// รอคู่ชกจนเวทีหมดอายุ → ลงเอง (เดิมค้างยืนมุมแดง)
let waitDownT = 0
watch(() => [mySide.value, !!m.value?.b], ([side, hasB]) => {
  clearTimeout(waitDownT)
  if (side && !hasB) waitDownT = setTimeout(() => { if (mySide.value && !m.value?.b) stepDown() }, WAIT_MS + 1000)
}, { immediate: true })
const ranking = computed(() => ringRanking(ring.board.value))
const boardOpen = ref(false)
onBeforeUnmount(() => { clearRingFx(); clearTimeout(waitDownT); clearTimeout(pickTimer); clearTimeout(waitTimer); ring.release(); room.release() })
</script>

<style scoped>
.rg { position: absolute; inset: 0; pointer-events: none; z-index: 900; }
.rg.dim::before { content: ""; position: absolute; inset: 0; background: rgba(20,14,30,.28); }
.rg button, .rg-panel, .rg-bar { pointer-events: auto; }
.rg-sc { position: absolute; top: 2.5cqw; display: flex; gap: .9cqw; align-items: center; background: rgba(42,34,56,.78); color: #fff; border-radius: 99px; padding: .6cqw 1.6cqw; font-size: max(.7rem, 2.4cqw); }
.rg-sc b { font-weight: 700; max-width: 22cqw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rg-sc.r { left: 2.5cqw; } .rg-sc.b { right: 2.5cqw; }
.rg-sc i { width: 2.2cqw; height: 2.2cqw; border-radius: 50%; background: rgba(255,255,255,.25); }
.rg-sc.r i.on { background: #ff6b7d; } .rg-sc.b i.on { background: #7fa6ff; }
/* ปุ่มลอยแบบลูบแมว (FocusSceneFx .pet-btn) */
.rg-btn { position: absolute; transform: translate(-50%, -100%); width: 30px; height: 30px; border: 0; border-radius: 50%; background: #fff; box-shadow: var(--pop); font-size: .95rem; display: grid; place-items: center; cursor: pointer; animation: rg-bob 1.4s ease-in-out infinite; }
.rg-btn-t { position: absolute; top: 100%; margin-top: 2px; white-space: nowrap; font-size: .7rem; font-weight: 800; color: #fff; background: #d6283c; border-radius: 99px; padding: 0 6px; }
@keyframes rg-bob { 50% { transform: translate(-50%, calc(-100% - 3px)); } }
.rg-bar { position: absolute; right: 2cqw; top: 12cqw; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }   /* ล่างซ้าย = แชต · ล่างขวา = ปุ่มไฮไฟว์ */
.rg-pill { font: inherit; font-size: .72rem; font-weight: 700; border: 0; border-radius: 99px; background: rgba(255,255,255,.92); color: var(--ink); padding: 3px 9px; box-shadow: var(--pop); cursor: pointer; }
.rg-panel { position: absolute; left: 50%; bottom: 1.5cqw; z-index: 10;   /* 27 พ.ย. user: ด้านบนโดนป้าย ยกที่… บัง → ย้ายลงล่าง */ transform: translateX(-50%); display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.95); border-radius: 14px; padding: 6px 10px; box-shadow: var(--pop); font-size: .75rem; font-weight: 600; white-space: nowrap; }
.rg-panel.picks { flex-wrap: wrap; justify-content: center; gap: 6px; padding: 6px 8px 8px; }
.rg-timer { flex-basis: 100%; height: 4px; border-radius: 99px; background: #edf0f5; overflow: hidden; }
.rg-timer i { display: block; height: 100%; background: var(--accent); transform-origin: left; animation: rg-time linear forwards; }
@keyframes rg-time { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.rg-hand { font: inherit; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 3px 12px 1px; font-size: 1.5rem; display: grid; justify-items: center; line-height: 1.15; cursor: pointer; }
.rg-hand small { font-size: .7rem; color: var(--muted); }
.rg-hand:active { transform: scale(.94); }
/* เอฟเฟกต์ */
.rg-fx { position: absolute; transform: translate(-50%, -50%); pointer-events: none; line-height: 1; }
.rg-fx.punch { font-size: 7cqw; z-index: 5; transition: left .3s cubic-bezier(.5,0,.9,.5), top .3s; }
.rg-fx.punch.flip { transform: translate(-50%, -50%) scaleX(-1); }
.rg-fx.punch.final { font-size: 11cqw; }
.rg-fx.pow { z-index: 6; font-weight: 800; font-size: 6cqw; color: #fff; -webkit-text-stroke: .5cqw var(--ink); paint-order: stroke; white-space: nowrap; animation: rg-pow .8s ease-out forwards; }
.rg-fx.pow.big { font-size: 11cqw; color: #ffd93d; -webkit-text-stroke: .8cqw #d6283c; }
@keyframes rg-pow { 0% { transform: translate(-50%, -50%) scale(.3); } 30% { transform: translate(-50%, -50%) scale(1.15); } 100% { transform: translate(-50%, -90%) scale(1); opacity: 0; } }
.rg-fx.star { width: 1.3cqw; height: 1.3cqw; z-index: 4; animation: rg-star .55s cubic-bezier(.2,.7,.4,1) forwards; }
@keyframes rg-star { to { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.2); opacity: 0; } }
.rg-fx.cheer { font-size: 4.6cqw; z-index: 3; animation: rg-rise 1.6s ease-out forwards; }
@keyframes rg-rise { to { transform: translate(-50%, -14cqw); opacity: 0; } }
.rg-fx.confetti { top: -3%; width: 1cqw; height: 1.6cqw; transform: none; z-index: 7; animation: rg-fall 1.8s linear forwards; }
@keyframes rg-fall { to { transform: translate(var(--dx), 70cqw) rotate(720deg); } }
.rg-flash { position: absolute; inset: 0; background: #fff; opacity: .5; animation: rg-flash .18s ease-out forwards; z-index: 8; }
@keyframes rg-flash { to { opacity: 0; } }
.rg-banner { position: absolute; left: 50%; top: 28%; transform: translate(-50%, -50%); z-index: 9; background: rgba(42,34,56,.88); color: #fff; font-weight: 700; font-size: max(.8rem, 4.4cqw); padding: 1cqw 4cqw; border-radius: 3cqw; white-space: nowrap; animation: rg-bn .35s cubic-bezier(.3,1.6,.5,1); }
.rg-banner.mp { background: #d6283c; animation: rg-bn .35s cubic-bezier(.3,1.6,.5,1), rg-beat .5s ease-in-out .35s 3; }
@keyframes rg-bn { from { transform: translate(-50%, -50%) scale(.5); opacity: 0; } }
@keyframes rg-beat { 50% { transform: translate(-50%, -50%) scale(1.08); } }
.rg-board { display: grid; gap: 6px; font-size: .86rem; padding-bottom: 8px; }
.rg-board ol, .rg-board ul { list-style: none; margin: 0 0 6px; padding: 0; display: grid; gap: 3px; }
.rg-board li { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dashed var(--line); padding: 3px 0; font-variant-numeric: tabular-nums; }
.rg-board small { color: var(--muted); }
.rg-empty { color: var(--muted); margin: 0; }
</style>
