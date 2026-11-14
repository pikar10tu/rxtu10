<!-- src/views/Cc2RoomView.vue — ห้องซ้อมคู่ CC2 OSPE /study/cc2/room (11 พ.ย. 2026)
     สร้างห้อง (รหัส 4 ตัว) / เข้าด้วยรหัส → ล็อบบี้ (บทบาท + หัวห้องเลือกเคส) → ซ้อม → ผล → สลับบทแล้วทำต่อ
     ห้องอยู่ใน RTDB (composables/useCc2Room.js) · เนื้อเคสโหลด static ทั้งสองเครื่อง · ผู้สอบบันทึกผลผ่าน useCc2Progress().finishCase
     CC2 เป็น self-learning — ไม่มีเหรียญ ไม่โชว์ข้อความได้เหรียญ -->
<template>
  <div class="tab-content crv">
    <header class="crv-head">
      <button type="button" class="crv-back" @click="goBack">‹ {{ roomId ? 'ออกจากห้อง' : 'คลังเคส' }}</button>
      <span class="crv-title"><Emoji char="🤝" /> ซ้อมคู่ CC2</span>
      <span style="width:72px"></span>
    </header>
    <div v-if="error" class="crv-err">{{ error }}</div>

    <div v-if="roomId && roomPw" class="crv-card crv-pw"><Emoji char="🔒" /> ห้องส่วนตัว · รหัสผ่าน <b>{{ roomPw }}</b> <small>บอกเพื่อนพร้อมรหัสห้อง</small></div>

    <!-- ── ใส่รหัสผ่านห้องส่วนตัว ── -->
    <Teleport to="body">
      <div v-if="pwAsk" class="crv-ov" @click.self="pwAsk = null">
        <form class="crv-pwbox" @submit.prevent="joinRoom(pwAsk.code, pwIn)">
          <b><Emoji char="🔒" /> ห้อง {{ pwAsk.code }} เป็นห้องส่วนตัว</b>
          <input v-model="pwIn" type="text" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="รหัสผ่าน 4 หลัก" aria-label="รหัสผ่านห้อง">
          <div v-if="error" class="crv-err">{{ error }}</div>
          <div class="crv-pwbtns">
            <button type="button" @click="pwAsk = null">ยกเลิก</button>
            <button type="submit" :disabled="pwIn.replace(/D/g, '').length !== 4">เข้าห้อง</button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- ── หน้าแรก: สร้าง / เข้าห้อง ── -->
    <template v-if="!roomId">
      <div class="crv-card crv-intro">
        <b>ซ้อม OSPE กับเพื่อน 2 คน</b> — คนหนึ่งเป็นผู้ประเมิน (อ่านบทผู้ป่วย ติ๊กเช็คลิสต์) อีกคนเป็นผู้สอบ (เห็นแค่สถานการณ์ เหมือนสอบจริง)<br>
        <small>อยู่ด้วยกันหรือโทรคุยกัน แล้วสลับบทกันทำเคสถัดไป</small>
      </div>
      <button type="button" class="crv-main" @click="createRoom({ isPrivate })">+ สร้างห้อง{{ isPrivate ? 'ส่วนตัว' : '' }}</button>
      <label class="crv-priv"><input v-model="isPrivate" type="checkbox"> <Emoji char="🔒" /> ห้องส่วนตัว <small>— ระบบสุ่มรหัสผ่านให้ เพื่อนต้องใส่ถึงเข้าได้</small></label>
      <form class="crv-join" @submit.prevent="joinRoom(code)">
        <input v-model="code" type="text" inputmode="latin" autocapitalize="characters" autocomplete="off" maxlength="6" placeholder="รหัสห้องจากเพื่อน" aria-label="รหัสห้อง">
        <button type="submit" :disabled="code.trim().length < 4">เข้าห้อง</button>
      </form>
      <div class="crv-sub">ห้องที่รอคน</div>
      <div v-if="!waiting.length" class="crv-hint">ยังไม่มีห้องเปิดอยู่ — สร้างแล้วส่งรหัสให้เพื่อน</div>
      <div v-for="r in waiting" :key="r.id" class="crv-room">
        <div class="crv-room-info"><b><Emoji v-if="r.private" char="🔒" /> ห้อง {{ r.id }}</b> · {{ r.hostName }}<small>{{ r.names.join(', ') }}</small></div>
        <button type="button" class="crv-join-btn" @click="joinRoom(r.id)">เข้าร่วม</button>
      </div>
    </template>

    <!-- ── ล็อบบี้ ── -->
    <Cc2RoomLobby v-else-if="room && !state"
      :room-id="roomId" :uid="uid" :host-uid="room.meta?.hostUid" :host-name="room.meta?.hostName" :is-host="isHost"
      :players="players" :me="me" :roles-ok="rolesOk" :can-start="canStart" :cases="cases"
      @set-role="setRole" @swap="swapRoles" @kick="kick" @start="startCase" @leave="goBack" />

    <!-- ── ซ้อม / ผล ── -->
    <template v-else-if="room && state">
      <div v-if="!myRole" class="crv-card crv-hint">รอบนี้เริ่มไปแล้ว รอรอบหน้านะ</div>
      <div v-else-if="caseError" class="crv-card crv-err">{{ caseError }}</div>
      <div v-else-if="!caseData" class="crv-card crv-hint">กำลังโหลดเคส…</div>
      <template v-else>
        <!-- ผู้สอบไม่เห็นชื่อเคสจนจบ (ชื่อบอกโรค = ใบ้คำตอบ · user 14 พ.ย.) -->
        <h1 class="crv-case"><span class="crv-cid">{{ caseData.id }}</span>{{ myRole === 'examinee' && state.status === 'play' ? 'สถานีสอบ' : caseData.title }}</h1>
        <Cc2RoomPlay v-if="state.status === 'play'"
          :case-data="caseData" :state="state" :my-role="myRole" :revealed="revealedKeys"
          :checks="checks" :answers="answers" :now="tickNow" :partner-left="partnerLeft" :busy="busy"
          @update:checks="checks = $event" @update:answers="onAnswers" @reveal="reveal" @finish="onFinish" @open-drug="openDrug" />
        <Cc2RoomResult v-else-if="result"
          :case-data="caseData" :result="result" :my-role="myRole" :is-host="isHost"
          @next="backToLobby" @open-drug="openDrug" />
        <div v-if="partnerLeft && isHost" class="crv-card crv-hint">
          คู่ซ้อมออกไปแล้ว <button type="button" class="crv-link" @click="backToLobby({})">กลับล็อบบี้</button>
        </div>
      </template>
    </template>

    <Cc2DrugSheet v-model:open="drugOpen" :drug-id="drugId" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import Cc2RoomLobby from '../components/cc2/room/Cc2RoomLobby.vue'
import Cc2RoomPlay from '../components/cc2/room/Cc2RoomPlay.vue'
import Cc2RoomResult from '../components/cc2/room/Cc2RoomResult.vue'
import Cc2DrugSheet from '../components/cc2/Cc2DrugSheet.vue'
import { useCc2Room } from '../composables/useCc2Room.js'
import { loadCc2Index, loadCc2Case } from '../composables/useCc2Data.js'
import { useToast } from '../composables/useToast.js'
import { useCc2Progress } from '../composables/useCc2Progress.js'

const progress = useCc2Progress()

const router = useRouter()
const { toast } = useToast()
const {
  uid, now, error, roomList, roomPw, pwAsk, roomId, room, state, result, revealedKeys,
  isHost, players, me, myRole, rolesOk, canStart, partnerLeft,
  listenRooms, stopRooms, createRoom, joinRoom, leaveRoom,
  setRole, swapRoles, kick, startCase, reveal, setAnswer, finishRound, backToLobby,
} = useCc2Room()

const code = ref('')
const isPrivate = ref(false)
const pwIn = ref('')
watch(pwAsk, v => { if (v) pwIn.value = '' })
const waiting = computed(() => roomList.value.filter(r => !r.playing && r.count < 2))
const cases = ref([])
onMounted(() => { loadCc2Index().then(i => { cases.value = i.cases }).catch(() => {}) })
onMounted(listenRooms)
watch(roomId, id => { if (id) stopRooms(); else listenRooms() })

// นาฬิกาเดินตามเวลาเซิร์ฟเวอร์
const tickNow = ref(now())
let clockTimer = null
onMounted(() => { clockTimer = setInterval(() => { tickNow.value = now() }, 500) })
onUnmounted(() => clearInterval(clockTimer))

// ── เคสของรอบนี้ ──
const caseData = ref(null), caseError = ref('')
const checks = ref({}), answers = ref({})
const busy = ref(false)
let savedRound = 0
watch(() => state.value?.round + ':' + state.value?.caseId, async () => {
  const st = state.value
  checks.value = {}; answers.value = {}; caseData.value = null; caseError.value = ''
  if (!st?.caseId) return
  try { caseData.value = await loadCc2Case(st.caseId); document.getElementById('main-content')?.scrollTo?.(0, 0) }
  catch (e) { caseError.value = 'โหลดเคสไม่ได้: ' + (e?.message || e) }
}, { immediate: true })

// ผู้สอบพิมพ์คำตอบ → เก็บในเครื่อง + ซิงก์ขึ้นห้องให้ผู้ประเมินตรวจ
function onAnswers(next) {
  for (const [i, v] of Object.entries(next)) if (answers.value[i] !== v) setAnswer(i, v)
  answers.value = next
}
// ผู้ประเมินตรวจช่องเติมคำจากคำตอบที่ผู้สอบส่งขึ้นมา
watch(() => room.value?.live?.answers, a => { if (myRole.value === 'examiner' && a) answers.value = { ...a } }, { deep: true })

async function onFinish(payload) {
  if (busy.value) return
  busy.value = true
  const ok = await finishRound(payload)
  busy.value = false
  if (ok) document.getElementById('main-content')?.scrollTo?.({ top: 0, behavior: 'smooth' })
}

// ผู้สอบ: เห็นผลแล้วบันทึกครั้งเดียวต่อรอบ (ผู้ประเมินไม่บันทึก) · tot 0 = ไม่มีอะไรให้วัด
watch(() => state.value?.status === 'done' && result.value?.round, async r => {
  if (!r || myRole.value !== 'examinee' || savedRound === r || !progress?.finishCase) return
  const res = result.value, st = state.value
  if (!res || res.tot <= 0) return
  savedRound = r
  try {
    const out = await progress.finishCase({ caseId: st.caseId, cat: st.cat || caseData.value?.cat || '', got: res.got, tot: res.tot })
    if (out && out.ok === false) toast('บันทึกผลไม่สำเร็จ', 'error')
  } catch { toast('บันทึกผลไม่สำเร็จ', 'error') }
})

const drugOpen = ref(false), drugId = ref('')
function openDrug(id) { drugId.value = id; drugOpen.value = true }
async function goBack() { if (roomId.value) { await leaveRoom(); return } router.push('/study/cc2') }
</script>

<style scoped>
.crv { display: flex; flex-direction: column; gap: 10px; }
.crv-head { display: flex; align-items: center; justify-content: space-between; }
.crv-back { font: inherit; background: none; border: none; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 0; width: 72px; text-align: left; }
.crv-title { font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 6px; }
.crv-err { background: #fff0f6; color: #a3345f; border-radius: 10px; padding: 8px 10px; font-size: .85rem; }
.crv-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm); }
.crv-intro { font-size: .9rem; line-height: 1.5; }
.crv-intro small { color: var(--muted); font-size: .8rem; }
.crv-main { width: 100%; font: inherit; font-weight: 800; font-size: 1rem; padding: 13px; border: none; border-radius: 14px; background: var(--primary); color: #fff; cursor: pointer; box-shadow: var(--pop); }
.crv-join { display: flex; gap: 8px; }
.crv-priv { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-weight: 700; font-size: .86rem; margin: -2px 2px 12px; cursor: pointer; }
.crv-priv small { font-weight: 500; color: var(--muted, #64748b); font-size: .76rem; }
.crv-pw { font-size: .9rem; }
.crv-pw b { font-size: 1.15rem; letter-spacing: .2em; color: var(--primary); }
.crv-pw small { display: block; color: var(--muted, #64748b); font-size: .76rem; }
.crv-ov { position: fixed; inset: 0; z-index: 400; background: rgba(15,23,42,.45); display: flex; align-items: center; justify-content: center; padding: 16px; }
.crv-pwbox { background: #fff; border-radius: 18px; padding: 18px; width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 10px; box-shadow: var(--pop); }
.crv-pwbox input { font: inherit; font-size: 1.3rem; font-weight: 800; letter-spacing: .3em; text-align: center; padding: 10px; border-radius: 12px; border: var(--bw) solid var(--line); }
.crv-pwbtns { display: flex; gap: 8px; }
.crv-pwbtns button { flex: 1; font: inherit; font-weight: 800; padding: 10px; border-radius: 12px; border: 2px solid var(--primary); background: #fff; color: var(--primary); cursor: pointer; }
.crv-pwbtns button[type=submit] { background: var(--primary); color: #fff; }
.crv-pwbtns button:disabled { opacity: .5; }
.crv-join input { flex: 1; min-width: 0; font: inherit; font-size: 1.1rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; text-align: center; padding: 10px 12px; border-radius: 12px; border: var(--bw) solid var(--line); background: #fff; }
.crv-join button { font: inherit; font-weight: 800; padding: 10px 16px; border-radius: 12px; border: 2px solid var(--primary); background: #fff; color: var(--primary); cursor: pointer; }
.crv-join button:disabled { opacity: .5; }
.crv-sub { font-weight: 800; font-size: .88rem; margin-top: 6px; }
.crv-hint { color: var(--muted); font-size: .84rem; text-align: center; }
.crv-room { display: flex; align-items: center; gap: 10px; background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; padding: 10px 12px; }
.crv-room-info { flex: 1; font-size: .9rem; }
.crv-room-info small { display: block; color: var(--muted); font-size: .76rem; }
.crv-join-btn { font: inherit; font-weight: 800; font-size: .84rem; padding: 8px 14px; border-radius: 10px; border: none; background: var(--primary); color: #fff; cursor: pointer; }
.crv-case { font-size: 1.05rem; line-height: 1.4; margin: 0; }
.crv-cid { display: inline-block; font-size: .72rem; font-weight: 800; color: var(--muted); background: var(--bg); border-radius: 6px; padding: 1px 7px; margin-right: 6px; vertical-align: middle; }
.crv-link { font: inherit; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer; }
</style>
