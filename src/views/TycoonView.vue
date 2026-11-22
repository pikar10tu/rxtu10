<!-- 🎲 เศรษฐีรอบโลก (เดโม) — เมนู · ล็อบบี้ห้องออนไลน์ · กระดาน
     spec: docs/superpowers/specs/2026-11-22-world-tycoon-design.md · เข้าได้: แอดมิน + config/app.tycoonTesters -->
<template>
  <div class="tab-content ty">
    <div class="page-title ty-head">
      <span><Emoji char="🎲" /> เศรษฐีรอบโลก <i class="beta">ทดลอง</i></span>
      <button v-if="R.mode.value !== 'menu'" type="button" class="ty-x" @click="leave">ออก</button>
    </div>

    <div v-if="!allowed" class="ty-card">เกมนี้ยังอยู่ช่วงทดลอง เปิดให้ผู้ทดสอบก่อนนะ</div>

    <!-- ───── เมนู ───── -->
    <template v-else-if="R.mode.value === 'menu'">
      <div class="ty-card">
        <div class="ty-h">🤖 เล่นกับบอท</div>
        <p class="ty-p">เล่นคนเดียวกับบอทธรรมดา ลองกติกาได้ทันที</p>
        <div class="ty-row">
          <button v-for="n in 3" :key="n" type="button" class="ty-btn" @click="R.startLocal(n)">บอท {{ n }} ตัว</button>
        </div>
      </div>
      <div class="ty-card">
        <div class="ty-h">👥 ห้องกับเพื่อน (2–4 คน)</div>
        <p class="ty-p">สร้างห้องแล้วส่งรหัสให้เพื่อน ที่ว่างเติมบอทได้</p>
        <div class="ty-row">
          <button type="button" class="ty-btn gold" :disabled="busy" @click="wrap(R.createRoom)">สร้างห้อง</button>
          <input v-model="joinCode" class="ty-in" maxlength="4" placeholder="รหัส" @keyup.enter="wrap(() => R.joinRoom(joinCode))" />
          <button type="button" class="ty-btn" :disabled="busy || joinCode.length !== 4" @click="wrap(() => R.joinRoom(joinCode))">เข้าห้อง</button>
        </div>
        <div v-if="R.error.value" class="ty-err">{{ R.error.value }}</div>
      </div>
      <div class="ty-card ty-rules">
        <div class="ty-h">📜 กติกาย่อ</div>
        <ul>
          <li>ทอยเต๋า 2 ลูก · กดค้างเพื่อเล็ง มีโอกาสได้เลขใกล้ที่เล็ง · เลขคู่ทอยต่อ คู่ 3 ครั้งติดเข้าห้องขัง</li>
          <li>รอบแรกซื้อที่ + สร้างได้ 2 หลัง · ผ่านจุดเริ่มต้นแล้วได้ 3 หลัง · ครบ 3 หลังตกซ้ำ = แลนด์มาร์ค</li>
          <li>ตกเมืองคนอื่นจ่ายค่าผ่านทาง แล้วซื้อต่อได้ราคา ×2 (แลนด์มาร์ค/ท่องเที่ยวซื้อต่อไม่ได้)</li>
          <li>ชนะ: ครบ 20 รอบทรัพย์สินมากสุด · คู่แข่งล้มละลายหมด · ครองแถว · ครอง 3 กลุ่มสี · ครองท่องเที่ยวครบ 4</li>
        </ul>
      </div>
    </template>

    <!-- ───── ล็อบบี้ ───── -->
    <div v-else-if="R.mode.value === 'lobby'" class="ty-card">
      <div class="ty-h">ห้อง <b class="code">{{ R.code.value }}</b></div>
      <p class="ty-p">ส่งรหัสนี้ให้เพื่อน แล้วรอเจ้าของห้องกดเริ่ม</p>
      <div class="seats">
        <div v-for="i in 4" :key="i" class="seat" :style="{ '--c': SEAT_COLORS[i - 1] }">
          <template v-if="R.seats.value[i - 1]">
            <img :src="pawnArt(i - 1)" alt="" />
            <span>{{ R.seats.value[i - 1].name }}<small v-if="R.seats.value[i - 1].bot"> (บอท)</small><small v-else-if="!R.pres.value[R.seats.value[i - 1].uid]"> (หลุด)</small></span>
            <button v-if="R.isHost.value && R.seats.value[i - 1].uid !== myUid" type="button" class="mini" @click="R.removeSeat(i - 1)">✕</button>
          </template>
          <template v-else><span class="empty">ว่าง</span></template>
        </div>
      </div>
      <div v-if="R.isHost.value" class="ty-row">
        <button type="button" class="ty-btn" :disabled="Object.keys(R.seats.value).length >= 4" @click="R.addBot()">+ เติมบอท</button>
        <button type="button" class="ty-btn gold" :disabled="Object.keys(R.seats.value).length < 2" @click="R.startOnline()">เริ่มเกม</button>
      </div>
      <div v-else class="ty-p">รอเจ้าของห้องกดเริ่ม…</div>
      <div v-if="R.error.value" class="ty-err">{{ R.error.value }}</div>
    </div>

    <!-- ───── เกม ───── -->
    <template v-else-if="fx.view.value">
      <TycoonBoard
        :view="fx.view.value" :pawns="fx.pawns" :hopping="fx.hopping.value" :pop="fx.pop.value" :shake="fx.shake.value"
        :highlight="highlight" :my-seat="R.mySeat.value" @tile="onTile"
      >
        <div class="hud">
          <div v-for="(p, i) in fx.view.value.players" :key="i" class="pl" :class="{ turn: fx.view.value.turn === i, out: p.out }" :style="{ '--c': p.color }">
            <img :src="pawnArt(i)" alt="" />
            <span class="nm">{{ p.name }}</span>
            <span class="cash">฿{{ p.cash.toLocaleString() }}</span>
            <span v-if="p.cards.length" class="cards"><Emoji v-for="(c, k) in p.cards" :key="k" :char="CARDS[c].emoji" /></span>
            <span v-if="p.jail" class="tag">🔒{{ p.jail }}</span>
            <span v-for="f in fx.floats.value.filter(f => f.seat === i)" :key="f.id" class="float" :class="f.kind">{{ f.text }}</span>
          </div>
        </div>
        <div class="meta">รอบ {{ Math.min(fx.view.value.round, fx.view.value.maxRounds) }}/{{ fx.view.value.maxRounds }}
          <span v-if="R.state.value && R.state.value.phase !== 'over'"> · ตา {{ R.state.value.players[R.state.value.turn].name }}<template v-if="R.online.value"> · {{ R.timeLeft.value }} วิ</template></span>
        </div>
        <TycoonDice :dice="fx.dice.value" :can-roll="rollReady" @roll="(aim) => R.act({ type: 'roll', aim })" />
        <div v-if="rollReady && extras.length" class="extras">
          <button v-for="a in extras" :key="a.type + (a.card || '')" type="button" class="mini-btn" @click="R.act(a)">{{ extraLabel(a) }}</button>
        </div>
        <TycoonPrompt v-if="R.canAct.value && R.state.value.phase === 'decide'" :state="R.state.value" @act="R.act" />
        <div v-else-if="!R.myTurn.value && R.state.value && R.state.value.phase !== 'over'" class="wait">รอ {{ R.state.value.players[R.state.value.turn].name }}…</div>
        <button v-if="R.state.value?.phase === 'over' && !fx.busy.value" type="button" class="ty-btn gold" @click="leave">กลับเมนู</button>
      </TycoonBoard>
      <p class="ty-tip">แตะช่องบนกระดานเพื่อดูรายละเอียด</p>
    </template>

    <!-- ป้ายกลางจอ + คอนเฟตตี -->
    <Teleport to="body">
      <div v-if="fx.banner.value" :key="fx.banner.value.key" class="ty-banner">
        <div class="bn-e"><Emoji :char="fx.banner.value.emoji" /></div>
        <div class="bn-t">{{ fx.banner.value.text }}</div>
        <div v-if="fx.banner.value.sub" class="bn-s">{{ fx.banner.value.sub }}</div>
      </div>
      <div v-if="fx.confetti.value && fx.view.value" class="ty-confetti" aria-hidden="true">
        <i v-for="n in 40" :key="n" :style="{ left: (n * 37 % 100) + '%', animationDelay: (n % 10) * 0.12 + 's', background: SEAT_COLORS[n % 4] }"></i>
      </div>
    </Teleport>

    <BottomSheet v-model:open="infoOpen" :title="info?.name || ''">
      <div v-if="info" class="info">
        <p>{{ info.lines.join(' · ') }}</p>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import BottomSheet from '../components/shared/BottomSheet.vue'
import TycoonBoard from '../components/tycoon/TycoonBoard.vue'
import TycoonDice from '../components/tycoon/TycoonDice.vue'
import TycoonPrompt from '../components/tycoon/TycoonPrompt.vue'
import { useAuthStore } from '../stores/auth.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { useTycoonFx } from '../composables/useTycoonFx.js'
import { useTycoonRoom } from '../composables/useTycoonRoom.js'
import { canPlayTycoon } from '../utils/tycoonAccess.js'
import { legalActions, SEAT_COLORS } from '../utils/tycoon/engine.js'
import { TILES, GROUPS, GAME } from '../data/tycoon/board.js'
import { CARDS } from '../data/tycoon/cards.js'
import { landPrice, baseToll, takeoverPrice } from '../utils/tycoon/rules.js'

const PAWNS = Object.fromEntries(Object.entries(import.meta.glob('../assets/tycoon/pawn_*.png', { eager: true, import: 'default' }))
  .map(([k, v]) => [k.split('/').pop().replace('.png', ''), v]))
const pawnArt = (i) => PAWNS['pawn_' + i]

const auth = useAuthStore()
const { rawConfig } = useAppConfig()
const allowed = computed(() => canPlayTycoon(rawConfig.value, auth.currentUser?.uid, auth.isAdmin))
const myUid = computed(() => auth.currentUser?.uid)

const fx = useTycoonFx()
const R = useTycoonRoom(fx)
const joinCode = ref('')
const busy = ref(false)
async function wrap(fn) {
  busy.value = true
  try { await fn() } catch (e) { console.error('[tycoon]', e); R.error.value = 'เชื่อมต่อห้องไม่สำเร็จ ลองใหม่อีกครั้ง' }
  busy.value = false
}
function leave() { R.leaveRoom() }

const legal = computed(() => (R.canAct.value && R.state.value ? legalActions(R.state.value) : []))
const rollReady = computed(() => R.canAct.value && R.state.value?.phase === 'roll')
const extras = computed(() => legal.value.filter(a => a.type !== 'roll'))
const extraLabel = (a) => a.type === 'payBail' ? `จ่ายประกัน ฿${GAME.bail} ออกเลย` : `${CARDS[a.card].emoji} ใช้${CARDS[a.card].name}`
const highlight = computed(() => legal.value.filter(a => a.type === 'pickTile' || a.type === 'sell').map(a => a.idx))

const infoOpen = ref(false), info = ref(null)
function onTile(idx) {
  if (highlight.value.includes(idx)) {
    const a = legal.value.find(x => x.idx === idx)
    R.act(a); return
  }
  const t = TILES[idx], s = fx.view.value, own = s.tiles[idx]
  const lines = []
  if (t.type === 'city' || t.type === 'tour') {
    lines.push(`ราคาที่ดิน ฿${landPrice(idx)}`)
    if (t.type === 'city') lines.push(`กลุ่มสี ${t.group + 1}`)
    if (own) {
      lines.push(`เจ้าของ ${s.players[own.owner].name}`)
      lines.push(own.level === 4 ? 'แลนด์มาร์ค' : t.type === 'city' ? `บ้าน ${own.level} หลัง` : 'เมืองท่องเที่ยว')
      lines.push(`ค่าผ่านทาง ฿${baseToll(idx, own.level, s.tiles) * (s.festival === idx ? 2 : 1)}`)
      if (t.type === 'city' && own.level < 4) lines.push(`ซื้อต่อ ฿${takeoverPrice(idx, own.level)}`)
    } else lines.push('ยังว่าง')
  } else {
    const D = { start: `ผ่านได้เงินเดือน ฿${GAME.salary} · ตกพอดีได้สร้างเมืองตัวเอง 1 เมือง`, jail: `ติด ${GAME.jailTurns} ตา (ทอยคู่/จ่าย ฿${GAME.bail} ออกได้)`, festival: 'เลือกเมืองตัวเอง ค่าผ่านทาง ×2', travel: `จ่าย ฿${GAME.travelFee} ตาหน้าบินไปไหนก็ได้`, chance: 'สุ่มการ์ดดวง', tax: `จ่าย ${GAME.taxPct * 100}% ของทรัพย์สิน`, minigame: `หยุดเข็มให้ตรง ได้สูงสุด ฿${GAME.minigameMax}` }
    lines.push(D[t.type])
  }
  info.value = { name: `${t.emoji} ${t.name}`, lines }
  infoOpen.value = true
}
void GROUPS
</script>

<style scoped>
.ty { padding-bottom: 24px; }
.ty-head { display: flex; justify-content: space-between; align-items: center; }
.beta { font-style: normal; font-size: .7rem; background: #ffd25a; border-radius: 6px; padding: 1px 6px; margin-left: 4px; vertical-align: middle; }
.ty-x { border: var(--bw) solid var(--line); border-radius: 10px; padding: 4px 12px; font-family: inherit; font-weight: 800; font-size: .78rem; background: #fff; cursor: pointer; }
.ty-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 12px; }
.ty-h { font-weight: 900; font-size: .95rem; margin-bottom: 4px; }
.ty-p { font-size: .78rem; color: rgba(0,0,0,.6); margin: 0 0 8px; }
.ty-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ty-btn { border: var(--bw) solid var(--line); border-radius: 12px; padding: 9px 14px; font-family: inherit; font-weight: 800; font-size: .84rem; background: #fff; box-shadow: var(--pop); cursor: pointer; }
.ty-btn.gold { background: #ffd25a; }
.ty-btn:disabled { opacity: .45; cursor: default; }
.ty-in { width: 80px; border: var(--bw) solid var(--line); border-radius: 10px; padding: 8px; font-family: inherit; font-weight: 800; font-size: .9rem; text-transform: uppercase; text-align: center; letter-spacing: 2px; }
.ty-err { margin-top: 8px; font-size: .78rem; color: #c2410c; font-weight: 700; }
.ty-rules ul { margin: 0; padding-left: 18px; font-size: .76rem; line-height: 1.6; color: rgba(0,0,0,.7); }
.code { font-size: 1.3rem; letter-spacing: 3px; color: #c94f72; }
.seats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
.seat { display: flex; align-items: center; gap: 6px; border: 2px solid var(--c); border-radius: 12px; padding: 8px; font-size: .8rem; font-weight: 700; min-height: 44px; }
.seat img { width: 22px; image-rendering: pixelated; }
.seat small { font-size: .7rem; color: rgba(0,0,0,.5); }
.seat .empty { color: rgba(0,0,0,.35); }
.mini { margin-left: auto; border: 0; background: #f3eef9; border-radius: 6px; font-size: .74rem; cursor: pointer; padding: 2px 6px; }
.hud { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.pl { position: relative; display: flex; align-items: center; gap: 3px; flex-wrap: wrap; background: #fff; border: 2px solid transparent; border-radius: 8px; padding: 2px 4px; font-size: .7rem; min-width: 0; }
.pl img { width: 14px; image-rendering: pixelated; }
.pl.turn { border-color: var(--c); box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 30%, transparent); animation: glow 1.2s ease-in-out infinite; }
.pl.out { opacity: .35; text-decoration: line-through; }
.nm { font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 58px; }
.cash { font-weight: 900; color: #15803d; }
.cards, .tag { font-size: .7rem; }
.float { position: absolute; left: 50%; top: -4px; transform: translateX(-50%); font-weight: 900; font-size: .78rem; white-space: nowrap; pointer-events: none; animation: floatUp 1.25s ease-out forwards; text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff; z-index: 3; }
.float.good { color: #15803d; } .float.bad { color: #dc2626; } .float.warn { color: #b45309; }
.meta { text-align: center; font-size: .72rem; font-weight: 800; color: #6b6185; }
.extras { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
.mini-btn { border: var(--bw) solid var(--line); border-radius: 8px; padding: 4px 8px; font-family: inherit; font-weight: 800; font-size: .72rem; background: #e7f0ff; cursor: pointer; }
.wait { text-align: center; font-size: .76rem; color: #6b6185; font-weight: 700; animation: blink 1.2s ease-in-out infinite; }
.ty-tip { text-align: center; font-size: .72rem; color: rgba(0,0,0,.45); margin-top: 6px; }
.info p { font-size: .84rem; line-height: 1.6; margin: 0; }
.ty-banner { position: fixed; left: 50%; top: 38%; transform: translate(-50%, -50%); z-index: 520; background: #fff; border: 3px solid #2b2340; border-radius: 18px; padding: 14px 20px; text-align: center; box-shadow: 0 8px 0 rgba(43,35,64,.25); animation: bannerIn .35s cubic-bezier(.2,1.6,.4,1); max-width: 86vw; pointer-events: none; }
.bn-e { font-size: 2.2rem; line-height: 1.1; }
.bn-t { font-weight: 900; font-size: 1rem; color: #2b2340; }
.bn-s { font-size: .76rem; color: rgba(0,0,0,.6); margin-top: 2px; }
.ty-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 510; overflow: hidden; }
.ty-confetti i { position: absolute; top: -12px; width: 8px; height: 12px; border-radius: 2px; animation: fall 2.6s linear infinite; }
@keyframes floatUp { 0% { transform: translate(-50%, 0) scale(.6); opacity: 0; } 15% { transform: translate(-50%, -6px) scale(1.15); opacity: 1; } 100% { transform: translate(-50%, -30px) scale(1); opacity: 0; } }
@keyframes glow { 50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 40%, transparent); } }
@keyframes blink { 50% { opacity: .5; } }
@keyframes bannerIn { from { transform: translate(-50%, -50%) scale(.4); opacity: 0; } }
@keyframes fall { to { transform: translateY(110vh) rotate(720deg); } }
</style>
