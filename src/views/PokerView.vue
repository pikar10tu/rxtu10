<!-- src/views/PokerView.vue — Poker (Texas Hold'em) · รายชื่อห้อง → ล็อบบี้ → โต๊ะ
     ห้อง/เกมอยู่ใน RTDB (composables/usePoker.js) · ชิปมีแค่ในโต๊ะ ไม่ผูกเหรียญแอป
     หน้าตาตามเดโมที่ user เลือก 17 ต.ค.: ป้ายคอล/เกทับเด้ง + แถบกลางโต๊ะ · ชนะ = กล่องถ้วยทอง · เกทับ 2 ขั้น · ปุ่มลำดับไพ่ -->
<template>
  <div class="pk">
    <header class="pk-head">
      <button class="pk-back" @click="goBack">‹ กลับ</button>
      <span class="pk-title"><Emoji char="🃏" /> Poker <span class="pk-demo">ทดสอบ</span></span>
      <button class="pk-rk-btn" @click="ranksOpen = true">📖 ลำดับไพ่</button>
    </header>

    <div v-if="error" class="pk-err">{{ error }}</div>
    <div v-if="kicked && !roomId" class="pk-err">หัวห้องเชิญคุณออกจากห้องแล้ว</div>

    <!-- ── รายชื่อห้อง ── -->
    <template v-if="!roomId">
      <div class="pk-warn">
        <b>Texas Hold'em 2–{{ MAX_PLAYERS }} คน</b><br>
        ชิปมีแค่ในโต๊ะ ทุกคนเริ่ม {{ START_STACK.toLocaleString() }} · หมดแล้วเติมให้อัตโนมัติ · ไม่เกี่ยวกับเหรียญในแอป
      </div>
      <button class="pk-main" @click="createRoom">+ สร้างโต๊ะ</button>
      <div class="pk-sub">โต๊ะที่เปิดอยู่</div>
      <div v-if="!roomList.length" class="pk-empty">ยังไม่มีโต๊ะ สร้างเลย แล้วเรียกเพื่อนมากดเข้า</div>
      <div v-for="r in roomList" :key="r.id" class="pk-room">
        <div class="pk-room-info">
          <div class="pk-room-host">โต๊ะของ {{ r.hostName }} <span class="pk-mode">blind {{ r.blinds }}</span></div>
          <div class="pk-room-names">{{ r.names.join(', ') }}</div>
        </div>
        <span class="pk-count">{{ r.count }}/{{ MAX_PLAYERS }}</span>
        <span v-if="r.banned" class="pk-tag off">ถูกเชิญออก</span>
        <button v-else class="pk-join" :disabled="!r.mine && r.count >= MAX_PLAYERS" @click="joinRoom(r.id)">
          {{ r.mine ? 'กลับเข้าโต๊ะ' : r.count >= MAX_PLAYERS ? 'เต็ม' : r.playing ? 'เข้าร่วม (มือหน้า)' : 'เข้าร่วม' }}
        </button>
      </div>

      <div class="pk-sub">กำไร / ขาดทุนสะสม <small>(ทุกโต๊ะ · ไว้ขำๆ)</small></div>
      <div v-if="!stats.length" class="pk-empty">ยังไม่มีใครเล่นจบสักมือ</div>
      <table v-else class="pk-lb">
        <tr v-for="(s, i) in stats.slice(0, 15)" :key="s.uid" :class="{ me: s.uid === uid }">
          <td class="pk-lb-no">{{ i + 1 }}</td>
          <td>{{ s.name }}</td>
          <td class="n" :class="s.net > 0 ? 'pos' : s.net < 0 ? 'neg' : ''">{{ signed(s.net) }}</td>
          <td class="n"><small>ชนะ {{ s.wins || 0 }}/{{ s.hands }} มือ</small></td>
        </tr>
      </table>
      <PlayLogPanel game="poker" />
    </template>

    <!-- ── ล็อบบี้ ── -->
    <div v-else-if="room && !pub" class="pk-card">
      <div class="pk-sub">โต๊ะของ {{ room.meta?.hostName }}</div>
      <ul class="pk-players">
        <li v-for="p in players" :key="p.uid">
          <Emoji :char="p.uid === room.meta?.hostUid ? '👑' : '🧑‍⚕️'" />
          <span class="pk-pname">{{ p.name }}<span v-if="p.uid === uid"> (คุณ)</span></span>
          <span v-if="p.away" class="pk-tag wait">💤 หลุด</span>
          <span v-else-if="p.uid === room.meta?.hostUid" class="pk-tag host">หัวห้อง</span>
          <span v-else class="pk-tag" :class="p.ready ? 'ok' : 'wait'">{{ p.ready ? 'พร้อม' : 'ยังไม่พร้อม' }}</span>
          <span v-if="room.table?.[p.uid]" class="pk-lnet" :class="netClass(p.uid)">{{ signed(tableNet(p.uid)) }}</span>
          <button v-if="isHost && p.uid !== uid" class="pk-kick" :class="{ armed: kickArm === p.uid }" @click="onKick(p.uid)">
            {{ kickArm === p.uid ? 'ยืนยันเตะ' : 'เตะ' }}
          </button>
        </li>
      </ul>
      <div class="pk-label">Blind (เล็ก/ใหญ่)</div>
      <div class="pk-mins">
        <button v-for="b in BLINDS" :key="b[1]" :class="{ on: room.meta?.bb === b[1] }" :disabled="!isHost" @click="setBlinds(b)">{{ b[0] }}/{{ b[1] }}</button>
      </div>
      <template v-if="isHost">
        <button class="pk-main" :disabled="!canStart" @click="startGame"><Emoji char="🃏" /> เริ่มแจกไพ่ ({{ activeCount }} คน)</button>
        <div class="pk-hint">
          <template v-if="activeCount < MIN_PLAYERS">รอเพื่อนอีก {{ MIN_PLAYERS - activeCount }} คน</template>
          <template v-else-if="!othersReady">รอทุกคนกดพร้อม</template>
        </div>
      </template>
      <template v-else>
        <button class="pk-main" :class="{ alt: meReady }" @click="setReady(!meReady)">{{ meReady ? 'ยกเลิกพร้อม' : '✋ พร้อม' }}</button>
        <div class="pk-hint">{{ meReady ? 'รอหัวห้องกดเริ่ม…' : 'กดพร้อมเมื่อทุกคนมาครบ' }}</div>
      </template>
      <button class="pk-leave" :class="{ armed: quitArm }" @click="onQuit">{{ quitArm ? 'แตะอีกครั้งเพื่อลุกจากโต๊ะ' : 'ลุกจากโต๊ะ' }}</button>
    </div>

    <!-- ── โต๊ะ ── -->
    <template v-else-if="room && pub">
      <div class="pk-hint pk-handno">มือที่ {{ pub.handNo }} · blind {{ pub.sb }}/{{ pub.bb }}</div>
      <div class="pk-table">
        <div class="pk-seats">
          <div v-for="s in seats" :key="s.uid" class="pk-seat"
            :class="{ turn: pub.toAct === s.uid, out: s.folded || s.waiting, away: s.away, win: !!s.won }">
            <span v-if="pub.button === s.uid" class="pk-d">D</span>
            <div class="pk-nm">{{ s.name }}</div>
            <div class="pk-st">{{ s.stack.toLocaleString() }}</div>
            <div class="pk-mini">
              <template v-if="s.shown"><PokerCard v-for="c in s.shown.cards" :key="c" :c="c" sm /></template>
              <template v-else-if="s.inHand && !s.folded"><span class="pk-c sm back"></span><span class="pk-c sm back"></span></template>
            </div>
            <span :key="s.pillKey" class="pk-pill" :class="[s.pillKind, { pop: s.pillKey }]">{{ s.pill }}</span>
            <div class="pk-bar"><i :style="{ width: pub.toAct === s.uid ? timeLeftPct + '%' : '0%' }"></i></div>
          </div>
        </div>
        <div class="pk-board">
          <PokerCard v-for="i in 5" :key="i" :c="pub.board[i - 1]" :hl="hl(pub.board[i - 1])" />
        </div>
        <div :key="potBump" class="pk-pot" :class="{ bump: potBump }">กองกลาง {{ potTotal(pub).toLocaleString() }}</div>

        <div v-if="flashMsg" :key="flashMsg.key" class="pk-flash" :class="flashMsg.kind">{{ flashMsg.big }}<small v-if="flashMsg.small">{{ flashMsg.small }}</small></div>
        <!-- เอฟเฟกต์ SVG: เกทับ = วงชมพู · ออลอิน = คลื่นกระแทก+สายฟ้า · ชนะ = รัศมี + ชิปร่วง -->
        <svg v-if="burst && burst.kind !== 'win'" :key="burst.key" class="pk-fx" :class="burst.kind" viewBox="0 0 200 200" aria-hidden="true">
          <circle v-for="i in (burst.kind === 'allin' ? 3 : 1)" :key="i" cx="100" cy="100" r="20" :style="{ animationDelay: (i - 1) * .14 + 's' }" />
          <g v-if="burst.kind === 'allin'" class="pk-fx-bolt">
            <path v-for="a in 8" :key="a" d="M100 64 L104 40 L98 44 L102 18" :transform="`rotate(${a * 45} 100 100)`" />
          </g>
        </svg>
        <template v-if="burst?.kind === 'win'">
          <svg :key="burst.key" class="pk-fx win" viewBox="0 0 200 200" aria-hidden="true">
            <g class="pk-rays"><path v-for="a in 12" :key="a" d="M100 100 L92 0 L108 0 Z" :transform="`rotate(${a * 30} 100 100)`" /></g>
          </svg>
          <svg v-for="c in chipRain" :key="burst.key + '-' + c.i" class="pk-chipfall" :style="c.style" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" :fill="c.color" /><circle cx="12" cy="12" r="7" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 2.5" /><circle cx="12" cy="12" r="3.5" fill="#fff" opacity=".85" />
          </svg>
        </template>
        <div v-if="winBox" class="pk-winbox"><div><Emoji char="🏆" /> {{ winBox.names }} ชนะ<b>+{{ winBox.amount.toLocaleString() }}</b>{{ winBox.hand }}</div></div>
      </div>

      <!-- ตัวเรา -->
      <div class="pk-me" :class="{ win: !!res?.won?.[uid] }">
        <template v-if="myCards">
          <div class="pk-me-top">
            <div class="pk-me-cards"><PokerCard v-for="c in myCards" :key="c" :c="c" :hl="hl(c)" /></div>
            <div class="pk-me-info">
              ชิป <b>{{ (pub.players[uid]?.stack ?? 0).toLocaleString() }}</b>{{ pub.button === uid ? ' · D' : '' }}
              <div class="pk-hn">{{ pub.players[uid]?.folded ? 'หมอบแล้ว' : myHandDetail }}</div>
              <div class="pk-mybar"><i :style="{ width: L ? timeLeftPct + '%' : '0%' }"></i></div>
            </div>
          </div>
        </template>
        <div v-else class="pk-hint">{{ room.players?.[uid] && !pub.order.includes(uid) ? 'นั่งรอ เริ่มเล่นมือหน้า' : 'กำลังโหลดไพ่…' }}</div>

        <div v-if="res" class="pk-res">
          <b v-if="res.won?.[uid]"><Emoji char="🏆" /> คุณได้ +{{ res.won[uid].toLocaleString() }}<br></b>
          <span v-for="(pt, i) in res.pots" :key="i">
            {{ res.pots.length > 1 ? (i ? 'กองย่อย ' : 'กองหลัก ') : '' }}{{ pt.amount.toLocaleString() }} → {{ pt.winners.map(nameOf).join(', ') }}<template v-if="res.showdown"> ({{ handLabel(res.shown[pt.winners[0]]) }})</template><br>
          </span>
          <span class="pk-hint">มือถัดไปใน {{ nextSec }} วิ</span>
        </div>

        <div v-else-if="L && raiseOpen" class="pk-rp">
          <div class="pk-rp-q">จะเกทับเป็นเท่าไหร่? <span class="pk-rp-amt">{{ raiseTo.toLocaleString() }}</span></div>
          <div class="pk-rp-grid">
            <button v-for="o in presets" :key="o.v" class="pk-rp-opt" :class="{ on: raiseTo === o.v }" @click="raiseTo = o.v">
              <small>{{ o.t }}</small><b>{{ o.v.toLocaleString() }}</b>
            </button>
          </div>
          <label class="pk-rz"><span class="pk-hint">ปรับเอง</span><output class="pk-rz-out">{{ raiseTo.toLocaleString() }}</output>
            <input v-model.number="raiseTo" type="range" @input="sfx('tap')" :min="L.minTo" :max="L.maxTo" :step="pub.sb" aria-label="ยอดเกทับ">
          </label>
          <div class="pk-rp-btns">
            <button class="pk-a fold" @click="raiseOpen = false">ยกเลิก</button>
            <button class="pk-a raise" @click="doRaise">{{ raiseTo >= L.maxTo ? 'ยืนยันออลอิน' : 'ยืนยันเกทับ' }} {{ raiseTo.toLocaleString() }}</button>
          </div>
        </div>

        <div v-else-if="L" class="pk-acts">
          <button class="pk-a fold" @click="send({ type: 'fold' })">หมอบ</button>
          <button class="pk-a" @click="send({ type: L.check ? 'check' : 'call' })">{{ L.check ? 'เช็ค' : 'คอล ' + L.callAmt.toLocaleString() }}</button>
          <button class="pk-a raise" :disabled="!L.raise" @click="openRaise">เกทับ…</button>
        </div>
        <div v-else-if="myCards" class="pk-hint">{{ pub.players[uid]?.folded ? 'รอมือนี้จบ…' : pub.toAct ? `รอ ${nameOf(pub.toAct)} ตัดสินใจ…` : '' }}</div>
      </div>

      <div class="pk-card">
        <div class="pk-sub">กำไร / ขาดทุนโต๊ะนี้</div>
        <table class="pk-lb">
          <tr v-for="t in tableRows" :key="t.uid" :class="{ me: t.uid === uid, gone: t.gone }">
            <td>{{ t.name }}<small v-if="t.gone"> ลุกแล้ว</small><small v-else-if="t.away"> 💤 หลุด</small></td>
            <td class="n" :class="t.net > 0 ? 'pos' : t.net < 0 ? 'neg' : ''">{{ signed(t.net) }}</td>
          </tr>
        </table>
        <div class="pk-hint">หลุด/ปัดแอปทิ้ง: ถึงตาหมอบให้ · ไม่แจกมือใหม่ · หายเกิน {{ AWAY_HANDS }} มือ = ลุกจากโต๊ะ · กลับมาทันนั่งต่อชิปเดิม</div>
      </div>

      <button v-if="isHost && res" class="pk-leave host" @click="backToLobby">พักโต๊ะ (กลับล็อบบี้ ชิปยังอยู่)</button>
      <button class="pk-leave" :class="{ armed: quitArm }" @click="onQuit">{{ quitArm ? 'แตะอีกครั้งเพื่อลุกจากโต๊ะ' : 'ลุกจากโต๊ะ' }}</button>
    </template>

    <!-- ลำดับไพ่ เปิดได้ตลอด -->
    <Teleport to="body">
      <div v-if="ranksOpen" class="pk-modal" @click.self="ranksOpen = false">
        <div class="pk-sheet" role="dialog" aria-label="ลำดับไพ่">
          <div class="pk-sheet-h"><span>📖 ลำดับไพ่ (บนสุดใหญ่สุด)</span><button class="pk-x" @click="ranksOpen = false">ปิด</button></div>
          <ol class="pk-rk">
            <li v-for="(r, i) in RANK_INFO" :key="r.th" :class="{ mine: r.th === myHandName }">
              <span class="no">{{ i + 1 }}</span>
              <span class="t">{{ r.th }}<small>{{ r.en }}</small><small v-if="r.th === myHandName"> ← คุณถืออยู่</small></span>
              <span>
                <span class="ex"><PokerCard v-for="(c, k) in r.ex" :key="c" :c="c" sm :hl="k < r.n ? null : 'dim'" /></span>
                <span class="pk-hint">{{ r.desc }}</span>
              </span>
            </li>
          </ol>
          <p class="pk-hint pk-rk-tip">ใช้ไพ่ 5 ใบที่ดีที่สุดจาก 7 ใบ (ในมือ 2 + กลางโต๊ะ 5) · แบบเดียวกันวัดที่เลขสูงกว่า ถ้าเท่ากันดูใบประกอบ (kicker) · ดอกไม่มีศักดิ์ เสมอ = แบ่งกอง</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, h } from 'vue'
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import PlayLogPanel from '../components/shared/PlayLogPanel.vue'
import { usePoker, START_STACK, BLINDS, TURN_MS, AWAY_HANDS } from '../composables/usePoker.js'
import { legal, evaluate, potTotal, MIN_PLAYERS, MAX_PLAYERS } from '../utils/pokerEngine.js'
import { sfx } from '../utils/sfx.js'

const router = useRouter()
const {
  uid, now, error, kicked, roomList, roomId, room, secret, pub, isHost, players, othersReady, canStart, activeCount,
  stats, loadStats, listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
  setBlinds, kick, setReady, startGame, backToLobby, act,
} = usePoker()

// ── ไพ่ 1 ใบ ──
const SUIT = { s: '♠', h: '♥', d: '♦', c: '♣' }
const PokerCard = (props) => {
  const c = props.c
  const cls = ['pk-c', { sm: props.sm, r: c && 'hd'.includes(c[1]), ph: !c, win: props.hl === 'win', dim: props.hl === 'dim' }]
  return h('span', { class: cls }, c ? [c[0] === 'T' ? '10' : c[0], h('span', SUIT[c[1]])] : [])
}
PokerCard.props = { c: String, sm: Boolean, hl: String }

const RANK_INFO = [
  ['สเตรทฟลัช', 'Straight Flush', 'เรียงกัน 5 ใบ ดอกเดียวกัน', '9h Th Jh Qh Kh', 5],
  ['โฟร์การ์ด', 'Four of a Kind', 'เลขเดียวกัน 4 ใบ', 'Qs Qh Qd Qc 7s', 4],
  ['ฟูลเฮาส์', 'Full House', 'ตอง + แพร์', '8s 8h 8d 3c 3s', 5],
  ['ฟลัช', 'Flush', 'ดอกเดียวกัน 5 ใบ ไม่ต้องเรียง', 'Ad Jd 8d 5d 2d', 5],
  ['สเตรท', 'Straight', 'เรียงกัน 5 ใบ คละดอก (A-2-3-4-5 ก็ได้)', '5c 6h 7d 8s 9c', 5],
  ['ตอง', 'Three of a Kind', 'เลขเดียวกัน 3 ใบ', '7s 7h 7d Kc 2s', 3],
  ['ทูแพร์', 'Two Pair', 'แพร์ 2 คู่', 'Js Jd 4c 4h As', 4],
  ['วันแพร์', 'One Pair', 'เลขเดียวกัน 2 ใบ', 'Th Tc 9s 6d 3h', 2],
  ['ไพ่สูง', 'High Card', 'ไม่เข้าแบบไหนเลย ใบสูงสุดชนะ', 'Ac Qd 9h 6s 3c', 1],
].map(([th, en, desc, ex, n]) => ({ th, en, desc, ex: ex.split(' '), n }))
const ranksOpen = ref(false)

const signed = (n) => (n > 0 ? '+' : '') + (n || 0).toLocaleString()
const meReady = computed(() => !!room.value?.players?.[uid.value]?.ready)
const nameOf = (id) => room.value?.table?.[id]?.name || room.value?.players?.[id]?.name || '?'
const res = computed(() => (pub.value?.phase === 'showdown' ? pub.value.result : null))
const myCards = computed(() => (secret.value?.handNo === pub.value?.handNo ? secret.value.cards : null))
const L = computed(() => (pub.value ? legal(pub.value, uid.value) : null))
const handLabel = (s) => s?.detail || s?.name || ''
const myEval = computed(() => (myCards.value && pub.value.board.length ? evaluate([...myCards.value, ...pub.value.board]) : null))
const myHandDetail = computed(() => {
  if (myEval.value) return myEval.value.detail
  const c = myCards.value
  return c && c[0][0] === c[1][0] ? `คู่ ${c[0][0] === 'T' ? '10' : c[0][0]} ในมือ` : ''
})
const myHandName = computed(() => {
  const c = myCards.value
  if (!c) return null
  if (pub.value.board.length) return evaluate([...c, ...pub.value.board]).name
  return c[0][0] === c[1][0] ? 'วันแพร์' : null
})

// ไพ่ 5 ใบที่ชนะ → ยกขึ้น ที่เหลือจาง
const bestSet = computed(() => {
  const r = res.value
  if (!r?.showdown) return null
  return new Set(Object.entries(r.shown).filter(([u]) => r.won[u]).flatMap(([, s]) => s.best || []))
})
const hl = (c) => (!c || !bestSet.value ? null : bestSet.value.has(c) ? 'win' : 'dim')

// ── ป้ายการกระทำล่าสุดของแต่ละคนในรอบเดิมพันนี้ ──
function kindOf(e, p) {
  if ((e.type === 'raise' || e.type === 'call') && p?.allin) return 'allin'
  return e.type
}
function textOf(e, p) {
  if (e.auto === 'away') return '💤 หลุด → หมอบ'
  if (e.auto === 'timeout') return e.type === 'check' ? 'หมดเวลา → เช็ค' : 'หมดเวลา → หมอบ'
  const k = kindOf(e, p)
  return { fold: 'หมอบ', check: 'เช็ค', call: `คอล ${(e.amt || 0).toLocaleString()}`, raise: `เกทับ ${(e.to || 0).toLocaleString()}`, allin: `ออลอิน ${(p?.total || 0).toLocaleString()}` }[k]
}
const lastActs = computed(() => {
  const p = pub.value, out = {}
  if (!p) return out
  p.log.forEach((e, i) => { if (e.uid && e.phase === p.phase) out[e.uid] = { ...e, i } })
  return out
})

const seats = computed(() => {
  const p = pub.value
  if (!p) return []
  // เรียงที่นั่งต่อจากเรา (คนถัดไปทางซ้ายอยู่ก่อน) · คนที่ยังไม่ได้แจกมือนี้ต่อท้าย
  const order = p.order
  const me = order.indexOf(uid.value)
  const ring = me < 0 ? order : [...order.slice(me + 1), ...order.slice(0, me)]
  const waiting = players.value.filter(x => x.uid !== uid.value && !order.includes(x.uid)).map(x => x.uid)
  return [...ring, ...waiting].map(id => {
    const pl = p.players[id], presence = room.value.players?.[id]
    const shown = res.value?.shown?.[id], won = res.value?.won?.[id]
    const la = lastActs.value[id]
    let pill = '', pillKind = '', pillKey = 0
    if (won) { pill = `+${won.toLocaleString()}`; pillKind = 'win'; pillKey = 'w' + p.handNo }
    else if (shown) { pill = handLabel(shown); pillKind = 'hand' }
    else if (!presence || presence.away) { pill = '💤 หลุด'; pillKind = 'away' }
    else if (!pl) { pill = 'รอมือหน้า'; pillKind = 'away' }
    else if (la) { pill = textOf(la, pl); pillKind = la.auto ? 'fold' : kindOf(la, pl); pillKey = `${p.handNo}-${la.i}` }
    else if (pl.allin) { pill = 'ออลอิน'; pillKind = 'allin' }
    return {
      uid: id, name: nameOf(id), inHand: !!pl, folded: !!pl?.folded, waiting: !pl, away: !presence || !!presence.away,
      stack: pl ? pl.stack : (room.value.table?.[id]?.stack ?? START_STACK),
      shown, won, pill, pillKind, pillKey,
    }
  })
})

// ── แถบกลางโต๊ะ: คอล/เกทับ/ออลอิน · กล่องผู้ชนะ ──
const flashMsg = ref(null)
const potBump = ref(0)
let flashT = null
watch(() => pub.value && `${pub.value.handNo}-${pub.value.seq}`, (k, old) => {
  const p = pub.value
  if (!p || !old) return
  const e = [...p.log].reverse().find(x => x.uid)
  if (!e || e.phase === undefined) return
  const pl = p.players[e.uid]
  const kind = kindOf(e, pl)
  if (!['raise', 'call', 'allin'].includes(kind) || e.auto) return
  potBump.value++
  if (kind === 'raise' || kind === 'allin') fireBurst(kind)
  flashMsg.value = {
    key: k, kind,
    big: `${nameOf(e.uid)} ${kind === 'call' ? 'คอล' : kind === 'raise' ? 'เกทับ' : 'ออลอิน!'}`,
    small: kind === 'call' ? `ใส่ ${(e.amt || 0).toLocaleString()}` : `เป็น ${(kind === 'allin' ? pl.bet || e.to || 0 : e.to || 0).toLocaleString()}`,
  }
  clearTimeout(flashT)
  flashT = setTimeout(() => { flashMsg.value = null }, 1300)
})
// ── เอฟเฟกต์ SVG ──
const burst = ref(null)
let burstT = null
const CHIP_COLORS = ['#f28bb0', '#3593cf', '#4cc9a0', '#fcd34d', '#d1435b']
const chipRain = ref([])
function fireBurst(kind) {
  clearTimeout(burstT)
  burst.value = { kind, key: Date.now() }
  if (kind === 'win') {
    chipRain.value = Array.from({ length: 16 }, (_, i) => ({
      i, color: CHIP_COLORS[i % CHIP_COLORS.length],
      style: { left: (4 + Math.random() * 88) + '%', animationDelay: (Math.random() * .5).toFixed(2) + 's', animationDuration: (1.1 + Math.random() * .7).toFixed(2) + 's', width: (16 + Math.random() * 10) + 'px' },
    }))
  }
  burstT = setTimeout(() => { burst.value = null }, kind === 'win' ? 2600 : 1100)
}

// ── เสียง (+สั่นตอนถึงตาเรา) ──
const SND = { check: 'pk_check', fold: 'pk_fold', call: 'pk_chip', raise: 'pk_raise', allin: 'pk_allin' }
watch(() => pub.value && `${pub.value.handNo}-${pub.value.seq}`, (k, old) => {
  const p = pub.value
  if (!p || !old) return
  const e = [...p.log].reverse().find(x => x.uid)
  if (e && !e.auto && p.seq > 1) sfx(SND[kindOf(e, p.players[e.uid])] || 'tap')
})
watch(() => pub.value?.board.length, (n, o) => { if (n > (o || 0)) setTimeout(() => sfx('pk_deal'), 250) })
watch(() => pub.value?.handNo, (n, o) => { if (n && o && n !== o) sfx('pk_deal') })
watch(() => pub.value?.toAct === uid.value && pub.value?.phase !== 'showdown', (mine) => {
  if (!mine) return
  setTimeout(() => sfx('pk_turn'), 300)
  try { navigator.vibrate?.(40) } catch { /* ไม่รองรับก็ไม่เป็นไร */ }
})
watch(() => res.value && pub.value.handNo, (k) => {
  if (!k) return
  fireBurst('win')
  setTimeout(() => sfx(res.value?.won?.[uid.value] ? 'pk_win' : res.value?.showdown ? 'pk_lose' : 'pk_chip'), 200)
})

const winBox = computed(() => {
  const r = res.value
  if (!r) return null
  const ws = Object.entries(r.won || {}).sort((a, b) => b[1] - a[1])
  if (!ws.length) return null
  return {
    names: ws.map(([w]) => nameOf(w)).join(' + '),
    amount: ws.reduce((s, [, v]) => s + v, 0),
    hand: r.showdown ? handLabel(r.shown[ws[0][0]]) : 'คนอื่นหมอบหมด',
  }
})

// ── นาฬิกา ──
const tickNow = ref(now())
let clockTimer = null
onMounted(() => { clockTimer = setInterval(() => { tickNow.value = now() }, 200) })
onUnmounted(() => { clearInterval(clockTimer); clearTimeout(flashT); clearTimeout(burstT) })
const timeLeftPct = computed(() => Math.max(0, Math.min(100, ((pub.value?.deadline || 0) - tickNow.value) / TURN_MS * 100)))
const nextSec = computed(() => Math.max(0, Math.ceil(((pub.value?.nextAt || 0) - tickNow.value) / 1000)))

// ── เกทับ 2 ขั้น: กด → เลือกยอด → ยืนยัน ──
const raiseOpen = ref(false)
const raiseTo = ref(0)
watch(() => pub.value?.seq, () => { raiseOpen.value = false })
const presets = computed(() => {
  const l = L.value, p = pub.value
  if (!l) return []
  const clamp = (v) => Math.max(l.minTo, Math.min(l.maxTo, v))
  const pot = potTotal(p)
  const all = [['ขั้นต่ำ', l.minTo], ['ครึ่งกอง', clamp(p.curBet + Math.floor(pot / 2))], ['เต็มกอง', clamp(p.curBet + pot)], ['ออลอิน', l.maxTo]]
  return all.filter(([, v], i) => all.findIndex(x => x[1] === v) === i).map(([t, v]) => ({ t, v }))
})
function openRaise() { raiseTo.value = L.value.minTo; raiseOpen.value = true }
function doRaise() { raiseOpen.value = false; send({ type: 'raise', to: raiseTo.value }) }
function send(a) { act(a) }

// ── ตารางโต๊ะนี้ ──
function tableNet(id) {
  const t = room.value?.table?.[id]
  if (!t) return 0
  const pl = pub.value?.phase !== 'showdown' ? pub.value?.players?.[id] : null
  return (pl ? pl.stack + pl.total : t.stack) - t.buyIn
}
const netClass = (id) => { const n = tableNet(id); return n > 0 ? 'pos' : n < 0 ? 'neg' : '' }
const tableRows = computed(() => Object.entries(room.value?.table || {})
  .map(([id, t]) => ({ uid: id, name: t.name, gone: !!t.gone, away: !!room.value.players?.[id]?.away, net: tableNet(id) }))
  .sort((a, b) => b.net - a.net))

// กดสองครั้งกันพลาด (เตะ / ลุก)
const kickArm = ref(null), quitArm = ref(false)
let armT = null
const disarm = () => { kickArm.value = null; quitArm.value = false }
const arm = (fn) => { clearTimeout(armT); fn(); armT = setTimeout(disarm, 2500) }
function onKick(id) { if (kickArm.value === id) { disarm(); kick(id) } else arm(() => { disarm(); kickArm.value = id }) }
function onQuit() { if (quitArm.value) { disarm(); leaveRoom() } else arm(() => { disarm(); quitArm.value = true }) }

// กดกลับ = หลุดชั่วคราว (ที่นั่ง+ชิปยังอยู่ กลับมากด "กลับเข้าโต๊ะ" ได้) · ลุกจริงใช้ปุ่มลุกจากโต๊ะ
function goBack() { router.push('/play') }
onMounted(() => { listenRooms(); loadStats() })
watch(roomId, id => { if (id) stopRooms(); else { listenRooms(); loadStats() } })
</script>

<style scoped>
.pk { max-width: 480px; margin: 0 auto; padding: 8px 12px 24px; --felt: #2f8f74; --felt2: #24745e; --gold: #fcd34d; --gold-ink: #78350f; --red: #d1435b; }
.pk-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 6px; }
.pk-back { all: unset; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 4px; }
.pk-title { font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 6px; }
.pk-demo { font-size: .7rem; font-weight: 800; background: #fde68a; color: #92400e; border-radius: 8px; padding: 1px 6px; }
.pk-rk-btn { border: var(--bw) solid var(--line); background: #fff; color: var(--ink); border-radius: 10px; padding: 5px 9px; font: inherit; font-size: .8rem; font-weight: 700; cursor: pointer; }
.pk-warn { background: var(--primary-light); border: 1px solid var(--primary-2); color: var(--ink); border-radius: 14px; padding: 10px 12px; font-size: .85rem; line-height: 1.5; margin-bottom: 12px; }
.pk-err { background: #fee2e2; color: #991b1b; border-radius: 10px; padding: 8px 10px; font-size: .85rem; margin-bottom: 10px; }
.pk-main { width: 100%; padding: 13px; border: none; border-radius: 14px; background: var(--primary); color: #fff; font-weight: 800; font-size: 1rem; box-shadow: 0 4px var(--primary-dark); cursor: pointer; margin-top: 12px; }
.pk-main:disabled { background: #9ca3af; box-shadow: none; cursor: not-allowed; }
.pk-main.alt { background: #fff; color: var(--primary); border: 2px solid var(--primary); box-shadow: none; }
.pk-sub { font-weight: 800; margin: 14px 0 8px; font-size: .95rem; }
.pk-sub small { font-weight: 500; color: rgba(0,0,0,.5); font-size: .75rem; }
.pk-label { font-weight: 700; font-size: .85rem; margin: 14px 0 6px; }
.pk-empty, .pk-hint { color: rgba(0,0,0,.55); font-size: .8rem; text-align: center; margin: 6px 0; line-height: 1.5; }
.pk-handno { margin: 0 0 6px; }
.pk-room { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; }
.pk-room-info { flex: 1; min-width: 0; }
.pk-room-host { font-weight: 700; }
.pk-mode { font-size: .7rem; background: var(--mint-light); color: #115e59; border-radius: 6px; padding: 1px 6px; margin-left: 4px; }
.pk-room-names { font-size: .75rem; color: rgba(0,0,0,.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pk-count { font-size: .8rem; color: rgba(0,0,0,.55); }
.pk-tag { font-size: .72rem; background: #e0e7ff; color: #3730a3; border-radius: 8px; padding: 2px 8px; white-space: nowrap; }
.pk-tag.host { background: #fef3c7; color: #92400e; }
.pk-tag.ok { background: #dcfce7; color: #166534; }
.pk-tag.wait { background: #f3f4f6; color: #6b7280; }
.pk-tag.off { background: var(--accent-light); color: #9d174d; }
.pk-join { border: none; border-radius: 10px; background: var(--primary); color: #fff; font-weight: 700; padding: 8px 10px; cursor: pointer; font: inherit; font-size: .85rem; white-space: nowrap; }
.pk-join:disabled { background: #9ca3af; }
.pk-card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 4px 14px 12px; margin-top: 10px; }
.pk-players { list-style: none; padding: 0; margin: 0; }
.pk-players li { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px dashed rgba(0,0,0,.08); font-weight: 600; }
.pk-pname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pk-lnet { font-size: .8rem; font-variant-numeric: tabular-nums; }
.pk-kick { border: 1px solid var(--accent); color: var(--accent); background: #fff; border-radius: 8px; padding: 3px 9px; font-size: .75rem; font-weight: 700; cursor: pointer; }
.pk-kick.armed { background: var(--accent); color: #fff; }
.pk-mins { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.pk-mins button { border: 2px solid rgba(0,0,0,.08); background: #f9fafb; border-radius: 12px; padding: 7px 0; font: inherit; font-weight: 700; font-size: .85rem; cursor: pointer; color: inherit; }
.pk-mins button.on { border-color: var(--primary); background: var(--primary-light); }
.pk-mins button:disabled { cursor: default; }
.pk-leave { all: unset; cursor: pointer; display: block; text-align: center; margin-top: 14px; width: 100%; color: #dc2626; font-size: .9rem; }
.pk-leave.armed { font-weight: 800; }
.pk-leave.host { color: var(--primary-dark); }
.pk-lb { width: 100%; border-collapse: collapse; font-size: .85rem; font-variant-numeric: tabular-nums; }
.pk-lb td { padding: 5px 2px; border-bottom: 1px dashed rgba(0,0,0,.08); }
.pk-lb td.n { text-align: right; }
.pk-lb small { color: rgba(0,0,0,.5); font-size: .72rem; }
.pk-lb tr.me td { font-weight: 800; }
.pk-lb tr.gone td { color: rgba(0,0,0,.45); }
.pk-lb-no { width: 1.6em; color: rgba(0,0,0,.45); }
.pos { color: #16a34a; }
.neg { color: var(--red); }

/* โต๊ะ */
.pk-table { position: relative; overflow: hidden; background: radial-gradient(ellipse at 50% 40%, var(--felt), var(--felt2)); border-radius: 28px; padding: 14px 10px; color: #fff; display: flex; flex-direction: column; gap: 10px; box-shadow: var(--pop-lg); }
.pk-seats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.pk-seat { background: rgba(255,255,255,.12); border-radius: 14px; padding: 6px 4px 5px; text-align: center; font-size: .78rem; border: 2px solid transparent; position: relative; transition: border-color .2s, box-shadow .2s, transform .2s; min-width: 0; }
.pk-seat.turn { border-color: #fde68a; }
.pk-seat.out { opacity: .5; }
.pk-seat.away { opacity: .55; border-style: dashed; border-color: rgba(255,255,255,.4); }
.pk-seat.win { opacity: 1; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(252,211,77,.35), 0 0 22px rgba(252,211,77,.7); transform: scale(1.04); background: rgba(252,211,77,.22); }
.pk-nm { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pk-st { font-variant-numeric: tabular-nums; }
.pk-d { position: absolute; top: -7px; right: -5px; background: #fff; color: #2b3550; border-radius: 50%; width: 18px; height: 18px; font-size: .7rem; font-weight: 800; line-height: 18px; }
.pk-mini { display: flex; gap: 2px; justify-content: center; margin-top: 3px; min-height: 30px; }
.pk-bar { height: 3px; background: rgba(255,255,255,.2); border-radius: 2px; margin-top: 4px; overflow: hidden; }
.pk-bar i { display: block; height: 100%; background: #fde68a; transition: width .2s linear; }
.pk-pill { display: inline-block; margin-top: 4px; border-radius: 999px; padding: 2px 8px; font-size: .74rem; font-weight: 800; min-height: 1.3em; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.pk-pill:empty { visibility: hidden; }
.pk-pill.call { background: var(--primary); color: #fff; }
.pk-pill.check { background: rgba(255,255,255,.88); color: #2b3550; }
.pk-pill.raise { background: var(--accent); color: #fff; box-shadow: 0 0 12px rgba(242,139,176,.8); }
.pk-pill.allin { background: var(--red); color: #fff; box-shadow: 0 0 14px rgba(209,67,91,.9); }
.pk-pill.fold { background: rgba(0,0,0,.35); color: #cbd5e1; }
.pk-pill.win { background: var(--gold); color: var(--gold-ink); font-size: .9rem; padding: 3px 10px; }
.pk-pill.hand { background: rgba(255,255,255,.9); color: #2b3550; }
.pk-pill.away { background: rgba(0,0,0,.35); color: #e2e8f0; }
.pop { animation: pk-pop .45s cubic-bezier(.2,1.6,.4,1); }
@keyframes pk-pop { 0% { transform: scale(.4); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
.pk-board { display: flex; gap: 5px; justify-content: center; min-height: 62px; align-items: center; }
.pk-pot { text-align: center; font-weight: 800; font-size: 1.05rem; font-variant-numeric: tabular-nums; }
.pk-pot.bump { animation: pk-bump .5s; }
@keyframes pk-bump { 40% { transform: scale(1.25); color: var(--gold) } }
:deep(.pk-c) { background: #fff; color: #2b3550; border-radius: 7px; width: 42px; height: 60px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 1.05rem; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,.25); transition: opacity .3s, transform .3s; flex-shrink: 0; }
:deep(.pk-c.r) { color: var(--red); }
:deep(.pk-c.sm) { width: 22px; height: 30px; font-size: .72rem; border-radius: 4px; }
:deep(.pk-c.back) { background: repeating-linear-gradient(45deg, var(--primary), var(--primary) 4px, var(--primary-dark) 4px, var(--primary-dark) 8px); }
:deep(.pk-c.ph) { background: rgba(255,255,255,.08); box-shadow: none; border: 1px dashed rgba(255,255,255,.3); }
:deep(.pk-c.win) { outline: 3px solid var(--gold); transform: translateY(-6px); box-shadow: 0 6px 14px rgba(252,211,77,.6); }
:deep(.pk-c.dim) { opacity: .4; }
.pk-flash { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); background: rgba(15,23,42,.85); border-radius: 16px; padding: 10px 16px; text-align: center; pointer-events: none; white-space: nowrap; font-weight: 800; font-size: 1.05rem; animation: pk-flash 1.3s forwards; }
.pk-flash small { display: block; font-size: .8rem; font-weight: 600; opacity: .9; }
.pk-flash.raise { background: rgba(217,102,143,.95); }
.pk-flash.allin { background: rgba(209,67,91,.95); }
.pk-flash.call { background: rgba(34,113,159,.95); }
@keyframes pk-flash { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.6) } 15% { opacity: 1; transform: translate(-50%,-50%) scale(1.08) } 25% { transform: translate(-50%,-50%) scale(1) } 80% { opacity: 1 } 100% { opacity: 0 } }
.pk-winbox { position: absolute; inset: 0; border-radius: 28px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.pk-winbox div { background: var(--gold); color: var(--gold-ink); border-radius: 18px; padding: 12px 20px; text-align: center; font-weight: 800; box-shadow: 0 0 0 4px rgba(255,255,255,.5), 0 10px 30px rgba(0,0,0,.35); animation: pk-pop .5s cubic-bezier(.2,1.6,.4,1); }
.pk-winbox b { display: block; font-size: 1.5rem; font-variant-numeric: tabular-nums; }

/* ตัวเรา */
.pk-me { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; padding: 12px; display: flex; flex-direction: column; gap: 10px; margin-top: 10px; transition: box-shadow .2s; }
.pk-me.win { box-shadow: 0 0 0 3px var(--gold), 0 0 24px rgba(252,211,77,.6); }
.pk-me-top { display: flex; gap: 10px; align-items: center; }
.pk-me-cards { display: flex; gap: 5px; }
.pk-me-info { flex: 1; min-width: 0; }
.pk-me-info b { font-size: 1.1rem; font-variant-numeric: tabular-nums; }
.pk-hn { font-size: .82rem; color: var(--primary-dark); font-weight: 700; min-height: 1.2em; }
.pk-mybar { height: 4px; background: var(--line); border-radius: 2px; margin-top: 4px; overflow: hidden; }
.pk-mybar i { display: block; height: 100%; background: #f59e0b; transition: width .2s linear; }
.pk-acts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.pk-a { border: none; border-radius: 12px; padding: 12px 4px; font: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: 0 3px var(--primary-dark); cursor: pointer; }
.pk-a.fold { background: #9aa3b5; box-shadow: 0 3px #6b7590; }
.pk-a.raise { background: var(--accent); box-shadow: 0 3px #d9668f; }
.pk-a:disabled { opacity: .4; cursor: not-allowed; }
.pk-res { background: var(--mint-light); border-radius: 12px; padding: 10px; font-size: .88rem; line-height: 1.55; }
.pk-rp { display: flex; flex-direction: column; gap: 8px; background: var(--accent-light); border-radius: 14px; padding: 10px; }
.pk-rp-q { font-weight: 800; display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.pk-rp-amt { font-size: 1.5rem; color: var(--accent); font-variant-numeric: tabular-nums; }
.pk-rz-out { font-weight: 800; font-variant-numeric: tabular-nums; min-width: 3.5em; text-align: right; order: 3; }
/* SVG FX */
.pk-fx { position: absolute; left: 50%; top: 50%; width: 260px; height: 260px; margin: -130px 0 0 -130px; pointer-events: none; overflow: visible; }
.pk-fx circle { fill: none; stroke-width: 6; transform-origin: 100px 100px; animation: pk-ring .9s ease-out forwards; }
.pk-fx.raise circle { stroke: #f28bb0; }
.pk-fx.allin circle { stroke: #fcd34d; stroke-width: 8; }
.pk-fx-bolt path { fill: none; stroke: #fde68a; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; transform-origin: 100px 100px; animation: pk-bolt .7s ease-out forwards; }
@keyframes pk-ring { 0% { transform: scale(.3); opacity: 1 } 100% { transform: scale(4.5); opacity: 0 } }
@keyframes pk-bolt { 0% { opacity: 0; transform: scale(.5) } 30% { opacity: 1 } 100% { opacity: 0; transform: scale(1.6) } }
.pk-fx.win { width: 420px; height: 420px; margin: -210px 0 0 -210px; }
.pk-rays { transform-origin: 100px 100px; animation: pk-rays 2.6s linear forwards; }
.pk-rays path { fill: rgba(252,211,77,.28); }
@keyframes pk-rays { 0% { transform: rotate(0) scale(.3); opacity: 0 } 15% { opacity: 1; transform: rotate(20deg) scale(1) } 80% { opacity: 1 } 100% { transform: rotate(110deg) scale(1.05); opacity: 0 } }
.pk-chipfall { position: absolute; top: -30px; height: auto; pointer-events: none; animation: pk-fall 1.4s cubic-bezier(.4,0,.8,1) forwards; opacity: 0; filter: drop-shadow(0 2px 2px rgba(0,0,0,.3)); }
@keyframes pk-fall { 0% { transform: translateY(0) rotate(0); opacity: 1 } 85% { opacity: 1 } 100% { transform: translateY(300px) rotate(540deg); opacity: 0 } }
.pk-rp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.pk-rp-opt { border: 2px solid var(--line); background: #fff; color: var(--ink); border-radius: 12px; padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 1px; font: inherit; cursor: pointer; }
.pk-rp-opt small { font-size: .75rem; color: rgba(0,0,0,.5); }
.pk-rp-opt b { font-size: 1.05rem; font-variant-numeric: tabular-nums; }
.pk-rp-opt.on { border-color: var(--accent); background: var(--accent); color: #fff; }
.pk-rp-opt.on small { color: #fff; }
.pk-rz { display: flex; gap: 8px; align-items: center; }
.pk-rz .pk-hint { margin: 0; white-space: nowrap; }
.pk-rz input { flex: 1; min-width: 0; }
.pk-rp-btns { display: grid; grid-template-columns: 1fr 2fr; gap: 6px; }

/* ลำดับไพ่ */
.pk-modal { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 400; display: flex; align-items: flex-end; justify-content: center; }
.pk-sheet { background: #fff; width: 100%; max-width: 480px; max-height: 88vh; overflow: auto; border-radius: 20px 20px 0 0; padding: 12px 14px calc(16px + env(safe-area-inset-bottom, 0px)); }
.pk-sheet-h { display: flex; justify-content: space-between; align-items: center; font-weight: 800; margin-bottom: 6px; }
.pk-x { border: none; background: var(--primary-light); color: var(--ink); border-radius: 10px; padding: 5px 12px; font: inherit; font-weight: 700; cursor: pointer; }
.pk-rk { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.pk-rk li { display: grid; grid-template-columns: 1.6em 1fr; gap: 2px 8px; align-items: center; padding: 7px 8px; border-radius: 12px; border: 2px solid transparent; }
.pk-rk li.mine { border-color: var(--gold); background: rgba(252,211,77,.15); }
.pk-rk .no { grid-row: span 2; color: rgba(0,0,0,.45); text-align: center; font-weight: 700; }
.pk-rk .t { font-weight: 800; font-size: .92rem; }
.pk-rk .t small { font-weight: 600; color: rgba(0,0,0,.5); font-size: .75rem; margin-left: 4px; }
.pk-rk .ex { display: flex; gap: 2px; flex-wrap: wrap; }
.pk-rk .ex :deep(.pk-c) { width: 24px; height: 33px; font-size: .75rem; border: 1px solid var(--line); box-shadow: none; }
.pk-rk .ex :deep(.pk-c.dim) { opacity: .3; }
.pk-rk .pk-hint { text-align: left; margin: 2px 0 0; }
.pk-rk-tip { text-align: left; margin-top: 10px; }
</style>
