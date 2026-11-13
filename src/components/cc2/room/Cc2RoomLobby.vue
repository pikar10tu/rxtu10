<!-- src/components/cc2/room/Cc2RoomLobby.vue — ล็อบบี้ห้องซ้อมคู่: รหัสห้อง · 2 คน + บทบาท · ผู้ประเมินเลือกเคส/เวลา แล้วเริ่ม -->
<template>
  <div class="crl">
    <div class="crl-code-card">
      <div class="crl-code-l">รหัสห้อง — บอกเพื่อนให้พิมพ์เข้ามา</div>
      <div class="crl-code">{{ roomId }}</div>
      <button type="button" class="crl-copy" @click="copy">{{ copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก' }}</button>
    </div>

    <section class="crl-card">
      <div class="crl-h">คนในห้อง <small>{{ players.length }}/{{ ROOM_SIZE }}</small></div>
      <ul class="crl-players">
        <li v-for="p in players" :key="p.uid">
          <Emoji :char="p.uid === hostUid ? '👑' : '🧑‍⚕️'" />
          <span class="crl-name">{{ p.name }}<span v-if="p.uid === uid"> (คุณ)</span></span>
          <span class="crl-role" :class="p.role">{{ ROLES[p.role] || 'ยังไม่เลือก' }}</span>
          <button v-if="isHost && p.uid !== uid" type="button" class="crl-kick" @click="emit('kick', p.uid)">เชิญออก</button>
        </li>
        <li v-if="players.length < ROOM_SIZE" class="crl-empty">รอเพื่อนอีก 1 คน — ส่งรหัสห้องให้เลย</li>
      </ul>
      <div class="crl-h">บทบาทของคุณ</div>
      <div class="crl-seg">
        <button v-for="(label, r) in ROLES" :key="r" type="button" :class="{ on: me?.role === r }" @click="emit('set-role', r)">
          <b>{{ label }}</b><small>{{ r === 'examiner' ? 'อ่านบทผู้ป่วย ติ๊กเช็คลิสต์ ส่งข้อมูล' : 'ซักประวัติ/ให้คำแนะนำ ไม่เห็นเฉลย' }}</small>
        </button>
      </div>
      <div v-if="players.length === ROOM_SIZE && !rolesOk" class="crl-warn">ทั้งคู่เลือกบทบาทเดียวกันอยู่ — ต้องมีผู้ประเมิน 1 ผู้สอบ 1</div>
      <button v-if="isHost && players.length === ROOM_SIZE" type="button" class="crl-link" @click="emit('swap')">สลับบทบาทกัน</button>
    </section>

    <section v-if="iPick" class="crl-card">
      <div class="crl-h">เลือกเคส <small>(ผู้ประเมินเป็นคนเลือก)</small></div>
      <div class="crl-cats">
        <button v-for="c in CATS" :key="c.v" type="button" :class="{ on: cat === c.v }" @click="cat = c.v">{{ c.t }}</button>
      </div>
      <div class="crl-pick-row">
        <button type="button" class="crl-rand" :disabled="!pool.length" @click="random"><Emoji char="🎲" /> สุ่มเคส</button>
        <input v-model="q" type="search" placeholder="หรือค้นชื่อเคส / รหัส" aria-label="ค้นหาเคส">
      </div>
      <ul v-if="q.trim()" class="crl-list">
        <li v-for="c in matches" :key="c.id"><button type="button" @click="choose(c)"><span class="crl-cid">{{ c.id }}</span>{{ c.title }}<small>{{ c.cat }} · {{ c.group }}</small></button></li>
        <li v-if="!matches.length" class="crl-empty">ไม่เจอ "{{ q.trim() }}"</li>
      </ul>
      <div v-if="picked" class="crl-picked">
        <span class="crl-cid">{{ picked.id }}</span><b>{{ picked.title }}</b>
        <small>{{ picked.cat }} · {{ picked.group }} · เต็ม {{ picked.tot }} คะแนน</small>
      </div>
      <div v-else class="crl-hint">ยังไม่ได้เลือกเคส — กดสุ่ม หรือค้นชื่อ</div>

      <div class="crl-h">เวลา</div>
      <div class="crl-mins">
        <button v-for="m in MINUTES" :key="m" type="button" :class="{ on: mins === m }" @click="mins = m">{{ m ? `${m} นาที` : 'ไม่จับ' }}</button>
      </div>

      <button type="button" class="crl-main" :disabled="!canStart || !picked" @click="emit('start', { caseId: picked.id, caseTitle: picked.title, cat: picked.cat, durationMin: mins })">
        เริ่มเคส
      </button>
      <div class="crl-hint">
        <template v-if="players.length < ROOM_SIZE">รอเพื่อนเข้าห้องก่อน</template>
        <template v-else-if="!rolesOk">เลือกบทบาทให้ครบก่อน</template>
        <template v-else-if="!picked">เลือกเคสก่อน</template>
        <template v-else>ผู้สอบจะเห็นแค่สถานการณ์ — ส่วนที่ต้องส่งให้ ผู้ประเมินกดส่งระหว่างสอบ</template>
      </div>
    </section>
    <section v-else class="crl-card crl-hint">
      <template v-if="examinerCount === 1">ผู้ประเมิน ({{ players.find(p => p.role === 'examiner')?.name }}) กำลังเลือกเคส — พร้อมแล้วเริ่มได้เลย</template>
      <template v-else-if="examinerCount > 1">มีผู้ประเมิน 2 คน — ต้องให้คนหนึ่งเปลี่ยนเป็นผู้สอบก่อน ถึงจะเลือกเคสได้</template>
      <template v-else>ผู้ประเมินเป็นคนเลือกเคส — เลือกบทบาทก่อนนะ</template>
    </section>

    <button type="button" class="crl-leave" @click="emit('leave')">ออกจากห้อง</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Emoji from '../../shared/Emoji.vue'
import { ROLES, ROOM_SIZE } from '../../../composables/useCc2Room.js'

const props = defineProps({
  roomId: { type: String, default: '' },
  uid: { type: String, default: '' },
  hostUid: { type: String, default: '' },
  hostName: { type: String, default: '' },
  isHost: Boolean,
  players: { type: Array, default: () => [] },
  me: { type: Object, default: null },
  rolesOk: Boolean,
  canStart: Boolean,
  cases: { type: Array, default: () => [] },   // index.cases
})
const emit = defineEmits(['set-role', 'swap', 'kick', 'start', 'leave'])

const CATS = [{ v: '', t: 'ทั้งหมด' }, { v: 'Clinic', t: 'Clinic' }, { v: 'Product', t: 'Product' }, { v: 'SAP', t: 'SAP' }]
const MINUTES = [0, 4, 5, 7, 10, 15]   // 4 นาที = เกณฑ์สอบสภา
// คนเลือกเคส/สุ่ม/เริ่ม = ผู้ประเมิน (ต้องมีผู้ประเมินคนเดียว) · user ขอ 13 พ.ย.
const examinerCount = computed(() => props.players.filter(p => p.role === 'examiner').length)
const iPick = computed(() => props.me?.role === 'examiner' && examinerCount.value === 1)
const cat = ref(''), q = ref(''), mins = ref(0), picked = ref(null), copied = ref(false)

const pool = computed(() => props.cases.filter(c => c.mode !== 'rest' && (!cat.value || c.cat === cat.value)))
const matches = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return []
  return pool.value.filter(c => (c.id + ' ' + c.title + ' ' + (c.topic || '') + ' ' + (c.group || '')).toLowerCase().includes(s)).slice(0, 30)
})
function random() { const p = pool.value; if (p.length) choose(p[Math.floor(Math.random() * p.length)]) }
function choose(c) { picked.value = c; q.value = ''; if (!mins.value && c.durationMin) mins.value = c.durationMin }
watch(cat, () => { if (picked.value && cat.value && picked.value.cat !== cat.value) picked.value = null })
async function copy() {
  try { await navigator.clipboard.writeText(props.roomId); copied.value = true; setTimeout(() => { copied.value = false }, 1500) } catch {}
}
</script>

<style scoped>
.crl { display: flex; flex-direction: column; gap: 10px; }
.crl-code-card { text-align: center; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #fff; border-radius: 18px; padding: 14px; box-shadow: var(--pop); }
.crl-code-l { font-size: .78rem; opacity: .9; }
.crl-code { font-size: 2.4rem; font-weight: 800; letter-spacing: .35em; margin: 2px 0 6px; padding-left: .35em; font-variant-numeric: tabular-nums; }
.crl-copy { font: inherit; font-size: .8rem; font-weight: 700; background: rgba(255,255,255,.22); color: #fff; border: 1px solid rgba(255,255,255,.5); border-radius: 999px; padding: 5px 14px; cursor: pointer; }
.crl-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 12px 14px; box-shadow: var(--shadow-sm); }
.crl-h { font-weight: 800; font-size: .88rem; margin: 6px 0 6px; }
.crl-h small { font-weight: 600; color: var(--muted); }
.crl-players { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.crl-players li { display: flex; align-items: center; gap: 8px; font-size: .9rem; }
.crl-name { flex: 1; font-weight: 700; }
.crl-role { font-size: .72rem; font-weight: 700; border-radius: 8px; padding: 2px 8px; background: #f3f4f6; color: #6b7280; }
.crl-role.examiner { background: #fff3d6; color: #8a5a00; }
.crl-role.examinee { background: var(--primary-light); color: var(--primary-dark); }
.crl-kick { font: inherit; font-size: .72rem; border: none; background: none; color: #c2415f; cursor: pointer; }
.crl-empty { color: var(--muted); font-size: .84rem; }
.crl-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.crl-seg button, .crl-cats button, .crl-mins button { font: inherit; border: 2px solid var(--border); background: #fff; border-radius: 12px; padding: 8px 10px; text-align: left; cursor: pointer; color: inherit; }
.crl-seg button small { display: block; font-size: .72rem; color: var(--muted); line-height: 1.35; margin-top: 2px; }
.crl-seg button.on, .crl-cats button.on, .crl-mins button.on { border-color: var(--primary); background: var(--primary-light); }
.crl-warn { margin-top: 8px; font-size: .8rem; color: #a3345f; background: #fff0f6; border-radius: 10px; padding: 6px 10px; }
.crl-link { font: inherit; font-size: .84rem; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer; margin-top: 8px; padding: 4px 0; }
.crl-cats, .crl-mins { display: flex; flex-wrap: wrap; gap: 6px; }
.crl-cats button, .crl-mins button { padding: 6px 12px; font-size: .84rem; font-weight: 700; border-radius: 999px; }
.crl-pick-row { display: flex; gap: 8px; margin-top: 8px; }
.crl-rand { font: inherit; font-weight: 800; font-size: .88rem; border: none; background: var(--accent); color: #fff; border-radius: 12px; padding: 9px 14px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
.crl-rand:disabled { opacity: .5; }
.crl-pick-row input { flex: 1; min-width: 0; font: inherit; font-size: .9rem; padding: 8px 12px; border-radius: 12px; border: var(--bw) solid var(--line); }
.crl-list { list-style: none; margin: 8px 0 0; padding: 0; max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.crl-list button { font: inherit; width: 100%; text-align: left; border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 7px 10px; cursor: pointer; font-size: .86rem; line-height: 1.35; }
.crl-list button small { display: block; color: var(--muted); font-size: .72rem; }
.crl-cid { font-size: .7rem; font-weight: 800; color: var(--muted); background: var(--bg); border-radius: 6px; padding: 1px 6px; margin-right: 6px; }
.crl-picked { margin-top: 10px; background: var(--primary-light); border-radius: 12px; padding: 10px 12px; font-size: .9rem; line-height: 1.4; }
.crl-picked small { display: block; color: var(--muted); font-size: .76rem; margin-top: 2px; }
.crl-hint { color: var(--muted); font-size: .82rem; margin-top: 8px; text-align: center; }
.crl-main { width: 100%; margin-top: 12px; font: inherit; font-weight: 800; font-size: 1rem; padding: 13px; border: none; border-radius: 14px; background: var(--primary); color: #fff; cursor: pointer; box-shadow: var(--pop); }
.crl-main:disabled { background: #b8c2d6; box-shadow: none; cursor: default; }
.crl-leave { font: inherit; background: none; border: none; color: #c2415f; font-size: .9rem; cursor: pointer; padding: 10px; }
</style>
