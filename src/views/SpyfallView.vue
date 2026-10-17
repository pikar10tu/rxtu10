<!-- src/views/SpyfallView.vue — Pharm Spyfall · รายชื่อห้อง → ล็อบบี้ (พร้อม/เตะ/ตั้งค่า) → เล่น → โหวต → เฉลย
     ห้อง/เกมอยู่ใน RTDB (composables/useSpyfall.js) · ไม่มีแชท ตั้งใจให้คุยกันด้วยเสียงจริง
     ระหว่างเล่นกดน้อยที่สุด: ระบบบอกแค่คนเริ่มถาม + นาฬิกา · วงส่งต่อคำถามกันเอง -->
<template>
  <div class="sfv">
    <header class="sfv-head">
      <button class="sfv-back" @click="goBack">‹ กลับ</button>
      <span class="sfv-title"><Emoji char="🕵️" /> Pharm Spyfall <span class="sfv-demo">ทดสอบ</span></span>
      <span style="width:52px"></span>
    </header>

    <div v-if="error" class="sfv-err">{{ error }}</div>
    <div v-if="kicked && !roomId" class="sfv-err">หัวห้องเชิญคุณออกจากห้องแล้ว</div>

    <!-- ── รายชื่อห้อง ── -->
    <template v-if="!roomId">
      <div class="sfv-warn">
        <b><Emoji char="🗣️" /> เล่นตอนอยู่ด้วยกัน หรือโทรคุยกัน</b><br>
        ทุกคนรู้คำลับยกเว้นสปาย 1 คน · ผลัดกันถาม-ตอบ แล้วโหวตหาสปาย · 3–{{ MAX_PLAYERS }} คน
      </div>
      <button class="sfv-main" @click="createRoom">+ สร้างห้อง</button>
      <div class="sfv-sub">ห้องที่เปิดอยู่</div>
      <div v-if="!roomList.length" class="sfv-empty">ยังไม่มีห้อง สร้างเลย แล้วเรียกเพื่อนมากดเข้า</div>
      <div v-for="r in roomList" :key="r.id" class="sfv-room">
        <div class="sfv-room-info">
          <div class="sfv-room-host">ห้องของ {{ r.hostName }} <span class="sfv-mode">{{ MODES[r.mode]?.name }}</span></div>
          <div class="sfv-room-names">{{ r.names.join(', ') }}</div>
        </div>
        <span class="sfv-count">{{ r.count }}/{{ MAX_PLAYERS }}</span>
        <span v-if="r.banned" class="sfv-tag off">ถูกเชิญออก</span>
        <span v-else-if="r.playing" class="sfv-tag">กำลังเล่น</span>
        <button v-else class="sfv-join" :disabled="r.count >= MAX_PLAYERS" @click="joinRoom(r.id)">
          {{ r.count >= MAX_PLAYERS ? 'เต็ม' : 'เข้าร่วม' }}
        </button>
      </div>
      <PlayLogPanel game="spyfall" />
    </template>

    <!-- ── ล็อบบี้ ── -->
    <div v-else-if="room && !st" class="sfv-card">
      <div class="sfv-sub">ห้องของ {{ room.meta?.hostName }}</div>
      <ul class="sfv-players">
        <li v-for="p in players" :key="p.uid">
          <Emoji :char="p.uid === room.meta?.hostUid ? '👑' : '🧑‍⚕️'" />
          <span class="sfv-pname">{{ p.name }}<span v-if="p.uid === uid"> (คุณ)</span></span>
          <span v-if="p.uid === room.meta?.hostUid" class="sfv-tag host">หัวห้อง</span>
          <span v-else class="sfv-tag" :class="p.ready ? 'ok' : 'wait'">{{ p.ready ? 'พร้อม' : 'ยังไม่พร้อม' }}</span>
          <button v-if="isHost && p.uid !== uid" class="sfv-kick" :class="{ armed: kickArm === p.uid }" @click="onKick(p.uid)">
            {{ kickArm === p.uid ? 'ยืนยันเตะ' : 'เตะ' }}
          </button>
        </li>
      </ul>

      <div class="sfv-label">โหมด</div>
      <div class="sfv-seg">
        <button v-for="(m, k) in MODES" :key="k" :class="{ on: mode === k }" :disabled="!isHost" @click="setOption('mode', k)">
          <b>{{ m.name }}</b><small>{{ m.desc }}</small>
        </button>
      </div>
      <div class="sfv-label">เวลาต่อรอบ</div>
      <div class="sfv-mins">
        <button v-for="n in MINUTES" :key="n" :class="{ on: minutes === n }" :disabled="!isHost" @click="setOption('minutes', n)">{{ n }} นาที</button>
      </div>

      <template v-if="isHost">
        <button class="sfv-main" :disabled="!canStart" @click="startGame"><Emoji char="🕵️" /> เริ่มเกม ({{ players.length }} คน)</button>
        <div class="sfv-hint">
          <template v-if="players.length < minPlayers">รอเพื่อนอีก {{ minPlayers - players.length }} คน</template>
          <template v-else-if="!othersReady">รอทุกคนกดพร้อม</template>
          <template v-else-if="players.length < 3">(แอดมิน) เริ่มคนเดียวได้ไว้เทสระบบ</template>
        </div>
      </template>
      <template v-else>
        <button class="sfv-main" :class="{ alt: meReady }" @click="setReady(!meReady)">{{ meReady ? 'ยกเลิกพร้อม' : '✋ พร้อม' }}</button>
        <div class="sfv-hint">{{ meReady ? 'รอหัวห้องกดเริ่ม…' : 'กดพร้อมเมื่ออ่านกติกาแล้ว' }}</div>
      </template>
      <button class="sfv-leave" @click="leaveRoom">ออกจากห้อง</button>
    </div>

    <!-- ── ในเกม ── -->
    <template v-else-if="room && st">
      <div v-if="!inRoster" class="sfv-card sfv-hint">รอบนี้เริ่มไปแล้ว รอรอบหน้านะ</div>

      <!-- เล่น -->
      <template v-else-if="st.status === 'play'">
        <div class="sfv-timer" :class="{ low: leftSec <= 30 }">{{ clock }}</div>
        <div class="sfv-role" :class="[shown ? (mySecret?.spy ? 'spy' : 'civ') : 'hidden']" @click="shown = !shown">
          <template v-if="!shown"><b>แตะเพื่อดูบท</b><small>อย่าให้คนข้างๆ เห็นจอ</small></template>
          <template v-else-if="!mySecret"><small>กำลังโหลดบท…</small></template>
          <template v-else-if="mySecret.spy"><small>คุณคือ</small><b><Emoji char="🕵️" /> สปาย</b><small>ฟังให้ดี แล้วเดาว่า{{ MODES[st.mode].ask }}</small></template>
          <template v-else><small>{{ MODES[st.mode].label }}</small><b>{{ mySecret.word }}</b><small>บทของคุณ: {{ mySecret.role }}</small></template>
        </div>
        <div class="sfv-turn"><Emoji char="🎤" /> คนเริ่มถาม: <b>{{ st.roster[st.starterUid] }}</b><span v-if="st.starterUid === uid"> (คุณ)</span></div>

        <div class="sfv-label">{{ MODES[st.mode].label }}ที่เป็นไปได้ <small>· แตะขีดฆ่าได้ (เห็นคนเดียว)</small></div>
        <div class="sfv-grid">
          <button v-for="w in st.options" :key="w" class="sfv-opt" :class="{ x: crossed.has(w) }" @click="toggleCross(w)">{{ w }}</button>
        </div>

        <div class="sfv-actions">
          <button class="sfv-main" :class="{ armed: stopArm }" @click="onStop">{{ stopArm ? 'แตะอีกครั้ง · เข้าโหวต' : '✋ หยุดเวลา · โหวต' }}</button>
          <button v-if="mySecret?.spy" class="sfv-main spy" @click="guessing = true"><Emoji char="🕵️" /> เดาคำ</button>
        </div>
      </template>

      <!-- โหวต -->
      <div v-else-if="st.status === 'vote'" class="sfv-card">
        <div class="sfv-sub">{{ st.stoppedBy ? `${st.roster[st.stoppedBy] || 'มีคน'}หยุดเวลา` : 'หมดเวลา!' }} โหวตหาสปาย</div>
        <div class="sfv-hint">โหวตลับ เปลี่ยนใจได้จนกว่าจะครบ · ต้องได้เกินครึ่ง · โหวตแล้ว {{ votedCount }}/{{ voters.length }}</div>
        <ul class="sfv-players">
          <li v-for="id in voters.filter(v => v !== uid)" :key="id">
            <span class="sfv-pname">{{ st.roster[id] }}</span>
            <button class="sfv-vote" :class="{ on: myAct?.vote === id }" @click="vote(id)">{{ myAct?.vote === id ? 'โหวตแล้ว' : 'โหวต' }}</button>
          </li>
        </ul>
        <button v-if="mySecret?.spy" class="sfv-main spy" @click="guessing = true"><Emoji char="🕵️" /> เดาคำแทน</button>
      </div>

      <!-- เฉลย -->
      <div v-else-if="st.status === 'end' && st.result" class="sfv-card sfv-end">
        <div class="sfv-hint">{{ reasonText }}</div>
        <div class="sfv-win" :class="st.result.winner">
          {{ st.result.winner === 'spy' ? '🕵️ สปายชนะ' : st.result.winner === 'civ' ? '🧑‍⚕️ พลเมืองชนะ' : 'จบรอบ' }}
        </div>
        <div>สปายคือ <b>{{ st.roster[st.result.spyUid] }}</b> · {{ MODES[st.mode].label }} <b>{{ st.result.word }}</b></div>
        <div v-if="st.mode === 'drug' && DRUGS[st.result.word]" class="sfv-fact"><Emoji char="💊" /> <b>{{ st.result.word }}</b> — {{ DRUGS[st.result.word] }}</div>
        <ul class="sfv-players">
          <li v-for="(name, id) in st.roster" :key="id">
            <span class="sfv-pname">{{ name }}<span v-if="id === uid"> (คุณ)</span></span>
            <span class="sfv-tag" :class="id === st.result.spyUid ? 'off' : ''">{{ id === st.result.spyUid ? 'สปาย' : st.result.roles?.[id] }}</span>
          </li>
        </ul>
        <button v-if="isHost" class="sfv-main" @click="backToLobby">เล่นรอบใหม่ (กลับล็อบบี้)</button>
        <div v-else class="sfv-hint">รอหัวห้องเริ่มรอบใหม่…</div>
      </div>

      <button class="sfv-leave" :class="{ armed: quitArm }" @click="onQuit">{{ quitArm ? 'แตะอีกครั้งเพื่อออก' : 'ออกจากห้อง' }}</button>
    </template>

    <!-- สปายเดาคำ -->
    <Teleport to="body">
      <div v-if="guessing && st && mySecret?.spy && st.status !== 'end'" class="sfv-modal" @click.self="guessing = false">
        <div class="sfv-sheet">
          <div class="sfv-sub"><Emoji char="🕵️" /> เดา{{ MODES[st.mode].label }}</div>
          <div class="sfv-hint">เดาได้ครั้งเดียว · เดาผิด = แพ้ทันที</div>
          <div class="sfv-grid">
            <button v-for="w in st.options" :key="w" class="sfv-opt" :class="{ x: crossed.has(w), pick: pick === w }" @click="pick = w">{{ w }}</button>
          </div>
          <div class="sfv-actions">
            <button class="sfv-main alt" @click="guessing = false">ยกเลิก</button>
            <button class="sfv-main spy" :disabled="!pick" @click="confirmGuess">ยืนยัน: {{ pick || '…' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import PlayLogPanel from '../components/shared/PlayLogPanel.vue'
import { useSpyfall } from '../composables/useSpyfall.js'
import { MODES, DRUGS } from '../data/spyfall.js'
import { MAX_PLAYERS, MINUTES } from '../utils/spyfallEngine.js'

const router = useRouter()
const {
  uid, now, error, kicked, roomList, roomId, room, secret, isHost, players, othersReady, canStart, minPlayers,
  listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
  setOption, kick, setReady, startGame, backToLobby, callVote, vote, guess,
} = useSpyfall()

const st = computed(() => room.value?.state || null)
const mode = computed(() => room.value?.meta?.mode || 'normal')
const minutes = computed(() => room.value?.meta?.minutes || 7)
const meReady = computed(() => !!room.value?.players?.[uid.value]?.ready)
const inRoster = computed(() => !!st.value?.roster?.[uid.value])
const mySecret = computed(() => secret.value?.round === st.value?.round ? secret.value : null)
const myAct = computed(() => { const a = room.value?.acts?.[uid.value]; return a?.round === st.value?.round ? a : null })
const voters = computed(() => Object.keys(st.value?.roster || {}).filter(id => room.value?.players?.[id]))
const votedCount = computed(() => voters.value.filter(id => { const a = room.value?.acts?.[id]; return a?.round === st.value?.round && a.vote }).length)

// นาฬิกา (นับจาก endsAt ของเซิร์ฟเวอร์ — ทุกเครื่องตรงกัน)
const tickNow = ref(now())
let clockTimer = null
onMounted(() => { clockTimer = setInterval(() => { tickNow.value = now() }, 250) })
onUnmounted(() => clearInterval(clockTimer))
const leftSec = computed(() => Math.max(0, Math.ceil(((st.value?.endsAt || 0) - tickNow.value) / 1000)))
const clock = computed(() => `${Math.floor(leftSec.value / 60)}:${String(leftSec.value % 60).padStart(2, '0')}`)

// ของเฉพาะเครื่อง: เปิดบท / ขีดฆ่า / ตัวเลือกที่สปายจะเดา — รีเซ็ตทุกรอบ
const shown = ref(false)
const crossed = ref(new Set())
const guessing = ref(false)
const pick = ref(null)
watch(() => st.value?.round, () => { shown.value = false; crossed.value = new Set(); guessing.value = false; pick.value = null })
function toggleCross(w) { const s = new Set(crossed.value); s.has(w) ? s.delete(w) : s.add(w); crossed.value = s }
function confirmGuess() { if (pick.value) { guess(pick.value); guessing.value = false } }

// กดสองครั้งกันพลาด (เตะ / หยุดเวลา / ออก)
const kickArm = ref(null), stopArm = ref(false), quitArm = ref(false)
let armT = null
const disarm = () => { kickArm.value = null; stopArm.value = false; quitArm.value = false }
const arm = (fn) => { clearTimeout(armT); fn(); armT = setTimeout(disarm, 2500) }
function onKick(id) { if (kickArm.value === id) { disarm(); kick(id) } else arm(() => { disarm(); kickArm.value = id }) }
function onStop() { if (stopArm.value) { disarm(); callVote() } else arm(() => { disarm(); stopArm.value = true }) }
function onQuit() { if (quitArm.value) { disarm(); leaveRoom() } else arm(() => { disarm(); quitArm.value = true }) }

const reasonText = computed(() => {
  const r = st.value?.result, n = st.value?.roster || {}
  if (!r) return ''
  return {
    caught: `จับได้! ${n[r.target]} โดน ${r.n} เสียง`,
    wrong: `โหวตผิดคน: ${n[r.target]} ไม่ใช่สปาย`,
    split: 'เสียงโหวตไม่ถึงครึ่ง สปายรอด',
    guessed: `สปายเดาถูก: ${r.guess}`,
    badguess: `สปายเดาผิด (เดา ${r.guess})`,
    spyleft: 'สปายออกจากห้องไปแล้ว',
  }[r.reason] || ''
})

async function goBack() { if (roomId.value) await leaveRoom(); router.push('/play') }
onMounted(listenRooms)
watch(roomId, id => { if (id) stopRooms(); else listenRooms() })
</script>

<style scoped>
.sfv { max-width: 480px; margin: 0 auto; padding: 8px 12px 24px; }
.sfv-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.sfv-back { all: unset; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 4px; width: 52px; }
.sfv-title { font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 6px; }
.sfv-demo { font-size: .7rem; font-weight: 800; background: #fde68a; color: #92400e; border-radius: 8px; padding: 1px 6px; }
.sfv-warn { background: var(--primary-light); border: 1px solid var(--primary-2); color: var(--ink); border-radius: 14px; padding: 10px 12px; font-size: .85rem; line-height: 1.5; margin-bottom: 12px; }
.sfv-err { background: #fee2e2; color: #991b1b; border-radius: 10px; padding: 8px 10px; font-size: .85rem; margin-bottom: 10px; }
.sfv-main { width: 100%; padding: 13px; border: none; border-radius: 14px; background: var(--primary); color: #fff; font-weight: 800; font-size: 1rem;
  box-shadow: 0 4px var(--primary-dark); cursor: pointer; margin-top: 12px; }
.sfv-main:disabled { background: #9ca3af; box-shadow: none; cursor: not-allowed; }
.sfv-main.alt { background: #fff; color: var(--primary); border: 2px solid var(--primary); box-shadow: none; }
.sfv-main.spy { background: var(--accent); box-shadow: 0 4px #d9668f; }
.sfv-main.armed { background: #ea580c; box-shadow: 0 4px #9a3412; }
.sfv-sub { font-weight: 800; margin: 14px 0 8px; font-size: .95rem; }
.sfv-label { font-weight: 700; font-size: .85rem; margin: 14px 0 6px; }
.sfv-label small { font-weight: 500; color: rgba(0,0,0,.5); }
.sfv-empty, .sfv-hint { color: rgba(0,0,0,.55); font-size: .85rem; text-align: center; margin: 8px 0; }
.sfv-room { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; }
.sfv-room-info { flex: 1; min-width: 0; }
.sfv-room-host { font-weight: 700; }
.sfv-mode { font-size: .7rem; background: var(--mint-light); color: #115e59; border-radius: 6px; padding: 1px 6px; margin-left: 4px; }
.sfv-room-names { font-size: .75rem; color: rgba(0,0,0,.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sfv-count { font-size: .8rem; color: rgba(0,0,0,.55); }
.sfv-tag { font-size: .72rem; background: #e0e7ff; color: #3730a3; border-radius: 8px; padding: 2px 8px; white-space: nowrap; }
.sfv-tag.host { background: #fef3c7; color: #92400e; }
.sfv-tag.ok { background: #dcfce7; color: #166534; }
.sfv-tag.wait { background: #f3f4f6; color: #6b7280; }
.sfv-tag.off { background: var(--accent-light); color: #9d174d; }
.sfv-join { border: none; border-radius: 10px; background: var(--primary); color: #fff; font-weight: 700; padding: 8px 12px; cursor: pointer; }
.sfv-join:disabled { background: #9ca3af; }
.sfv-card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 4px 14px 14px; }
.sfv-players { list-style: none; padding: 0; margin: 0; }
.sfv-players li { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px dashed rgba(0,0,0,.08); font-weight: 600; }
.sfv-pname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sfv-kick { border: 1px solid var(--accent); color: var(--accent); background: #fff; border-radius: 8px; padding: 3px 9px; font-size: .75rem; font-weight: 700; cursor: pointer; }
.sfv-kick.armed { background: var(--accent); color: #fff; }
.sfv-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.sfv-seg button, .sfv-mins button { border: 2px solid rgba(0,0,0,.08); background: #f9fafb; border-radius: 12px; padding: 8px 10px; text-align: left; cursor: pointer; color: inherit; font: inherit; }
.sfv-seg button small { display: block; font-size: .72rem; color: rgba(0,0,0,.5); }
.sfv-seg button.on, .sfv-mins button.on { border-color: var(--primary); background: var(--primary-light); }
.sfv-seg button:disabled, .sfv-mins button:disabled { cursor: default; }
.sfv-mins { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.sfv-mins button { text-align: center; font-size: .85rem; font-weight: 700; padding: 7px 0; }
.sfv-leave { all: unset; cursor: pointer; display: block; text-align: center; margin-top: 14px; width: 100%; color: #dc2626; font-size: .9rem; }
.sfv-leave.armed { font-weight: 800; }
.sfv-timer { font-size: 2.6rem; font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; margin: 4px 0 8px; }
.sfv-timer.low { color: #dc2626; }
.sfv-role { border-radius: 18px; padding: 18px 14px; text-align: center; display: flex; flex-direction: column; gap: 4px; align-items: center; cursor: pointer; min-height: 120px; justify-content: center; user-select: none; }
.sfv-role b { font-size: 1.5rem; }
.sfv-role small { font-size: .8rem; color: rgba(0,0,0,.6); }
.sfv-role.hidden { background: #f3f4f6; border: 2px dashed rgba(0,0,0,.15); }
.sfv-role.civ { background: var(--mint-light); }
.sfv-role.spy { background: var(--accent-light); }
.sfv-turn { background: #fef3c7; border-radius: 12px; padding: 9px 12px; margin-top: 10px; font-size: .9rem; }
.sfv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.sfv-opt { border: 1px solid rgba(0,0,0,.1); background: #fff; border-radius: 9px; padding: 6px 4px; font: inherit; font-size: .78rem; line-height: 1.25; min-height: 38px; cursor: pointer; color: inherit; word-break: break-word; }
.sfv-opt.x { text-decoration: line-through; opacity: .45; background: #f3f4f6; }
.sfv-opt.pick { border-color: var(--accent); background: var(--accent-light); opacity: 1; }
.sfv-actions { display: flex; gap: 8px; }
.sfv-vote { border: 1px solid var(--primary); color: var(--primary); background: #fff; border-radius: 10px; padding: 5px 12px; font-weight: 700; cursor: pointer; }
.sfv-vote.on { background: var(--primary); color: #fff; }
.sfv-end { text-align: center; }
.sfv-end .sfv-players { text-align: left; margin-top: 10px; }
.sfv-win { font-size: 1.6rem; font-weight: 800; margin: 4px 0; }
.sfv-win.spy { color: var(--accent); }
.sfv-win.civ { color: var(--primary); }
.sfv-fact { background: var(--primary-light); border-radius: 12px; padding: 10px; margin-top: 10px; font-size: .88rem; text-align: left; }
.sfv-modal { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
.sfv-sheet { background: #fff; width: 100%; max-width: 480px; max-height: 88vh; overflow: auto; border-radius: 20px 20px 0 0; padding: 4px 14px calc(16px + env(safe-area-inset-bottom, 0px)); }
</style>
