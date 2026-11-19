<template>
  <!-- 🎨 editor ชิ้นตุ๊กตา (18 พ.ย. 2026) — dev เท่านั้น · บันทึกผ่าน vite plugin (vite.config.js dollEditorSave)
       แก้ทีละชิ้น: จิ้มกริดบนตัวตุ๊กตาจริง · ชั้น m/back = สะท้อนซ้ายขวาอัตโนมัติ · o/ob = วาดตรงตำแหน่ง -->
  <Teleport to="body">
  <div class="de">
    <aside class="de-list">
      <div class="de-filter">
        <button v-for="f in FILTERS" :key="f.k" :class="{ on: filter === f.k }" @click="filter = f.k">{{ f.label }}</button>
      </div>
      <template v-for="sl in SLOTS" :key="sl.k">
        <div v-if="partsOf(sl.k).length" class="de-slot">{{ sl.label }}</div>
        <button
          v-for="p in partsOf(sl.k)" :key="p.id"
          class="de-item" :class="{ on: p.id === curId }" @click="select(p.id)"
        >
          <span class="de-st">{{ review[p.id]?.s === 'ok' ? '✅' : review[p.id]?.s === 'redo' ? '🔁' : '·' }}</span>
          <span>{{ p.label }}</span>
          <small>{{ p.id }}{{ edits[p.id] ? ' ✎' : '' }}{{ dirty.has(p.id) ? ' •' : '' }}</small>
        </button>
      </template>
    </aside>

    <main v-if="cur" class="de-main">
      <div class="de-top">
        <b>{{ cur.label }}</b> <small>{{ cur.id }} · {{ slotLabel(cur.slot) }} · {{ cur.theme }}</small>
        <span class="de-sp"></span>
        <button class="de-mini" @click="router.push('/')">✕ ออก</button>
        <button class="de-save" :disabled="!dirty.size && !reviewDirty" @click="save">💾 บันทึก{{ dirty.size ? ` (${dirty.size} ชิ้น)` : '' }}</button>
      </div>

      <div class="de-work">
        <div>
          <canvas
            ref="cv" class="de-cv" :width="CW * Z" :height="CH * Z" :style="{ width: CW * Z / DPR + 'px' }"
            @pointerdown="down" @pointermove="move" @pointerup="up" @pointerleave="up" @contextmenu.prevent
          ></canvas>
          <div class="de-hint">คลิกซ้าย = ลงสี · คลิกขวา = ลบ · Ctrl+Z = ย้อน · ชั้น <b>สะท้อน</b> วาดซีกไหนก็ได้ อีกซีกตามเอง</div>
        </div>

        <div class="de-side">
          <div class="de-box">
            <div class="de-lab">ชั้นที่วาด</div>
            <div class="de-row">
              <button v-for="l in layerList" :key="l.k" :class="{ on: layer === l.k }" @click="layer = l.k">
                {{ l.label }} <small>{{ countOf(l.k) }}</small>
              </button>
            </div>
            <label v-if="cur.st" class="de-chk"><input type="checkbox" :checked="cur.st.mir" @change="setMir($event.target.checked)"> สะท้อนอีกข้างให้เอง</label>
            <div v-if="cur.st" class="de-hint">🪽 สติกเกอร์ ติดที่จุดยึด "{{ cur.st.at }}" (กากบาทแดง) · วาดพ้นตัวได้ถึงกรอบนอก</div>
            <div class="de-row">
              <small>ตัวอื่น</small>
              <button v-for="f in FOCUS" :key="f.k" :class="{ on: focus === f.k }" @click="focus = f.k">{{ f.label }}</button>
            </div>
            <label class="de-chk"><input v-model="gridOn" type="checkbox"> เส้นกริด</label>
          </div>

          <div class="de-box">
            <div class="de-lab">สี (ตัวอักษร = ช่องสี)</div>
            <div class="de-pal">
              <button class="de-sw erase" :class="{ on: brush === null }" title="ยางลบ" @click="brush = null">⌫</button>
              <button
                v-for="k in palKeys" :key="k" class="de-sw" :class="{ on: brush === k }"
                :style="{ background: colorOf(k) }" :title="k + (GLOBAL_INFO[k] ? ' · ' + GLOBAL_INFO[k] : '')" @click="brush = k"
              ><span>{{ k }}</span></button>
            </div>
            <div v-if="brush && !GLOBAL_INFO[brush]" class="de-row">
              <input type="color" :value="colorOf(brush)" @input="setPal(brush, $event.target.value)">
              <small>สีของชิ้นนี้ ({{ brush }})</small>
            </div>
            <div v-else-if="brush" class="de-hint">{{ GLOBAL_INFO[brush] }} — เปลี่ยนตามตัวละคร</div>
            <button class="de-mini" @click="addColor">+ สีใหม่</button>
          </div>

          <div class="de-box">
            <div class="de-lab">ลองกับ</div>
            <select v-model="outfitIx">
              <option :value="-1">ชุดเริ่มต้น</option>
              <option v-for="(o, i) in OUTFITS" :key="o.name" :value="i">{{ o.name }}</option>
            </select>
            <div class="de-row">
              <button v-for="sk in SKINS" :key="sk.id" class="de-dot" :class="{ on: skin === sk.id }" :style="{ background: sk.S }" :title="sk.label" @click="skin = sk.id"></button>
            </div>
            <div class="de-row">
              <button v-for="hc in HAIRC" :key="hc.id" class="de-dot" :class="{ on: hair === hc.id }" :style="{ background: hc.H }" :title="hc.label" @click="hair = hc.id"></button>
            </div>
          </div>

          <div class="de-box">
            <div class="de-lab">ขนาดจริง</div>
            <div class="de-prev">
              <DollFigure :key="'a' + tick" :eq="eq" :scale="3" />
              <DollFigure :key="'b' + tick" :eq="eq" :scale="2" />
              <DollFigure :key="'c' + tick" :eq="eq" :scale="1" />
            </div>
          </div>

          <div class="de-box">
            <div class="de-lab">รีวิว</div>
            <div class="de-row">
              <button :class="{ on: review[curId]?.s === 'ok' }" @click="setReview('ok')">✅ ผ่าน</button>
              <button :class="{ on: review[curId]?.s === 'redo' }" @click="setReview('redo')">🔁 วาดใหม่</button>
              <button @click="setReview(null)">ล้าง</button>
            </div>
            <textarea v-model="note" rows="2" placeholder="โน้ต เช่น ปีกเล็กไป อยากได้ขนนกชัดขึ้น" @change="setNote"></textarea>
          </div>

          <div class="de-row">
            <button class="de-mini" :disabled="!undoStack.length" @click="undo">↶ ย้อน</button>
            <button class="de-mini" @click="revert">↺ คืนต้นฉบับ</button>
          </div>
        </div>
      </div>
    </main>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DollFigure from '../components/doll/DollFigure.vue'
import { W, H, PAD, XM, ANCH, PARTS, PART, SLOTS, SKINS, HAIRC, OUTFITS, DEFAULT_EQ, INK } from '../data/dollParts.js'
import EDITS from '../data/dollEdits.js'
import { render, composeWide, outline } from '../utils/dollRender.js'

const DPR = window.devicePixelRatio || 1
const Z = Math.round(10 * DPR)      // ขยายจอแก้ · จุดจอจริงเต็มจำนวนต่อช่อง (จอสเกลเศษไม่ทำช่องกว้างไม่เท่ากัน)
const FW = W + XM * 2
const CW = FW + PAD * 2, CH = H + PAD * 2
const FOCUS = [{ k: 'normal', label: 'ปกติ' }, { k: 'dim', label: 'จาง' }, { k: 'hide', label: 'ซ่อน (วาดแยก)' }]
const ST_LAYERS = [{ k: 'sb', label: 'สติกเกอร์·หลังตัว' }, { k: 'sf', label: 'สติกเกอร์·ทับเสื้อ' }]
const ST_KEY = { sb: 'back', sf: 'front' }
const LAYER_KEYS = ['m', 'o', 'back', 'ob']
const LAYERS = [
  { k: 'm', label: 'หน้า·สะท้อน', mirror: true },
  { k: 'o', label: 'หน้า·ตรง', mirror: false },
  { k: 'back', label: 'หลัง·สะท้อน', mirror: true },
  { k: 'ob', label: 'หลัง·ตรง', mirror: false },
]
const MIRROR = { m: true, o: false, back: true, ob: false }
const GLOBAL = { S: '#FFD9BF', s: '#F2BFA0', H: '#2F2A3A', h: '#1F1B28', L: '#4A4458', K: INK, W: '#FFFFFF', C: '#FFB3A7', M: '#D9665F' }
const GLOBAL_INFO = { S: 'ผิว', s: 'ผิวเงา', H: 'ผม', h: 'ผมเงา', L: 'ผมไฮไลต์', K: 'หมึก', W: 'ขาว', C: 'แก้ม', M: 'ปาก' }
const FREE_LETTERS = 'ABDEFGIJNOQRTUVXYZabcdefgijklmnopqrtuvwxyz'.split('')
const FILTERS = [{ k: 'all', label: 'ทั้งหมด' }, { k: 'todo', label: 'ยังไม่ดู' }, { k: 'redo', label: '🔁' }, { k: 'ok', label: '✅' }]

const route = useRoute(), router = useRouter()
const ORIG = Object.fromEntries(PARTS.map(p => [p.id, clone(pick(p))]))   // ณ ตอนโหลด (รวม edit เดิม)
const edits = reactive({ ...EDITS })
const dirty = reactive(new Set())
const review = ref({})
const reviewDirty = ref(false)
const filter = ref('all')
const curId = ref(String(route.query.p || 'w1'))
const layer = ref('m')
const brush = ref('K')
const focus = ref('dim')
const gridOn = ref(true)
const outfitIx = ref(-1)
const skin = ref('s2'), hair = ref('c1')
const note = ref('')
const tick = ref(0)
const undoStack = ref([])
const cv = ref(null)
const grids = ref({})   // ชั้นของชิ้นปัจจุบันเป็นกริดตัวอักษร (พิกัดชั้น ไม่รวม off)

function clone(x) { return JSON.parse(JSON.stringify(x)) }
function pick(p) { const o = {}; for (const k of [...LAYER_KEYS, 'pal', 'st']) if (p[k] !== undefined) o[k] = p[k]; return o }   // null = ตั้งใจลบชั้นเดิม ต้องเก็บไว้
const cur = computed(() => (tick.value, PART[curId.value]))
const layerList = computed(() => (cur.value?.st ? ST_LAYERS : LAYERS))
const isSt = k => k === 'sb' || k === 'sf'
const slotLabel = k => SLOTS.find(s => s.k === k)?.label || k
function partsOf(slot) {
  return PARTS.filter(p => p.slot === slot && (filter.value === 'all'
    || (filter.value === 'todo' ? !review.value[p.id]?.s : review.value[p.id]?.s === filter.value)))
}

// ── ops ⇄ กริด ──
function opsToGrid(ops) {
  const g = Array.from({ length: H }, () => Array(W).fill(null))
  const put = (x, y, ch) => { if (ch !== '.' && x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch }
  for (const op of ops || []) {
    if (op[0] === 'r') { const [, x, y, w, h, c] = op; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c) }
    else { const [, x, y, s] = op; for (let i = 0; i < s.length; i++) put(x + i, y, s[i]) }
  }
  return g
}
function gridToOps(g) {
  const ops = []
  for (let y = 0; y < H; y++) {
    let x = 0
    while (x < W) {
      if (!g[y][x]) { x++; continue }
      const x0 = x; let s = ''
      while (x < W && g[y][x]) s += g[y][x++]
      ops.push(['p', x0, y, s])
    }
  }
  return ops
}
function loadGrids() {
  const p = cur.value; if (!p) return
  grids.value = Object.fromEntries(LAYER_KEYS.map(k => [k, opsToGrid(p[k])]))
  if (p.st) for (const k of ['sb', 'sf']) grids.value[k] = stToGrid(p.st, ST_KEY[k])
  undoStack.value = []
  note.value = review.value[p.id]?.n || ''
  // ชั้นเริ่มต้น = ชั้นที่มีของ
  layer.value = p.st ? 'sb' : (LAYER_KEYS.find(k => p[k]?.length) || 'm')
}
// สติกเกอร์ ⇄ กริดกรอบรวม (index = x ตัว + XM) — วาดในพิกัดบนตัว แล้วตอนเก็บค่อยตัดขอบ+คิดจุดยึดใหม่
function stToGrid(st, key) {
  const g = Array.from({ length: H }, () => Array(FW).fill(null))
  const [ax, ay] = ANCH[st.at] || [0, 0]
  ;(st.L?.[key] || []).forEach((row, sy) => {
    for (let sx = 0; sx < row.length; sx++) {
      const x = ax - st.ax + sx + XM, y = ay - st.ay + sy
      if (row[sx] !== '.' && x >= 0 && x < FW && y >= 0 && y < H) g[y][x] = row[sx]
    }
  })
  return g
}
function gridsToSt(st) {
  let x0 = FW, y0 = H, x1 = -1, y1 = -1
  for (const k of ['sb', 'sf']) grids.value[k].forEach((r, y) => r.forEach((v, x) => {
    if (v) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  }))
  if (x1 < 0) return { ...st, ax: 0, ay: 0, w: 0, h: 0, L: {} }
  const [ax, ay] = ANCH[st.at] || [0, 0]
  const L = {}
  for (const k of ['sb', 'sf']) {
    const g = grids.value[k]
    if (!g.some(r => r.some(Boolean))) continue
    L[ST_KEY[k]] = g.slice(y0, y1 + 1).map(r => r.slice(x0, x1 + 1).map(v => v || '.').join(''))
  }
  return { ...st, ax: ax + XM - x0, ay: ay - y0, w: x1 - x0 + 1, h: y1 - y0 + 1, L }
}
function commitGrids() {   // กริด → ชิ้นจริงในหน่วยความจำ (ให้ render เห็นทันที)
  const p = cur.value
  if (p.st) p.st = gridsToSt(p.st)
  else for (const k of LAYER_KEYS) {
    const ops = gridToOps(grids.value[k])
    if (ops.length) p[k] = ops; else if (p[k] !== undefined) p[k] = null
  }
  dirty.add(p.id)
  tick.value++
}

// ── ชุดที่ใส่ลอง ──
const eq = computed(() => {
  tick.value // eslint-disable-line no-unused-expressions
  const base = outfitIx.value >= 0 ? { ...OUTFITS[outfitIx.value].eq } : { ...DEFAULT_EQ }
  const p = cur.value
  if (p) base[p.slot] = p.id
  if (p?.full) delete base.b
  if (p?.slot === 'b' && PART[base.t]?.full) base.t = 't1'
  return { ...base, s: skin.value, c: hair.value }
})
const palKeys = computed(() => {
  tick.value // eslint-disable-line no-unused-expressions
  return [...Object.keys(GLOBAL), ...Object.keys(cur.value?.pal || {})]
})
function colorOf(k) {
  const sk = SKINS.find(s => s.id === skin.value), hc = HAIRC.find(c => c.id === hair.value)
  const g = { ...GLOBAL, S: sk.S, s: sk.s, H: hc.H, h: hc.h, L: hc.L }
  return cur.value?.pal?.[k] || g[k] || '#FF00FF'
}
function countOf(k) { return (grids.value[k] || []).flat().filter(Boolean).length }

// ── วาด ──
const offOf = () => (cur.value?.slot === 'h' && (layer.value === 'back' || layer.value === 'ob')) ? [0, 0] : (cur.value?.off || [0, 0])
function partMask() {   // พิกเซลไหนบนจอเป็นของชิ้นนี้ (ทุกชั้น)
  const m = new Set()
  const p = cur.value
  if (p.st) {
    for (const k of ['sb', 'sf']) grids.value[k]?.forEach((r, y) => r.forEach((v, x) => {
      if (!v) return
      m.add(`${x - XM},${y}`)
      if (p.st.mir) m.add(`${W - 1 - (x - XM)},${y}`)
    }))
    return m
  }
  for (const k of LAYER_KEYS) {
    const g = grids.value[k]; if (!g) continue
    const [ox, oy] = (p.slot === 'h' && (k === 'back' || k === 'ob')) ? [0, 0] : (p.off || [0, 0])
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!g[y][x]) continue
      m.add(`${x + ox},${y + oy}`)
      if (MIRROR[k]) m.add(`${W - 1 - x - ox},${y + oy}`)
    }
  }
  return m
}
function draw() {
  const c = cv.value; if (!c) return
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#E8ECF3'; ctx.fillRect(0, 0, c.width, c.height)
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if ((x + y) % 2) { ctx.fillStyle = '#DDE2EB'; ctx.fillRect(x * Z, y * Z, Z, Z) }
  const mask = focus.value !== 'normal' ? partMask() : null
  let px
  if (focus.value === 'hide') {   // วาดแยก: เหลือแค่พิกเซลของชิ้นนี้ + ขอบของมันเอง
    let g
    if (cur.value?.st) {   // สติกเกอร์: วาดจากชั้นตรงๆ เห็นส่วนที่ซ่อนหลังตัวด้วย (หลังก่อน หน้าทับ)
      g = Array.from({ length: H }, () => Array(FW).fill(null))
      const mir = cur.value.st.mir
      for (const k of ['sb', 'sf']) grids.value[k]?.forEach((r, y) => r.forEach((ch, x) => {
        if (!ch) return
        g[y][x] = colorOf(ch)
        if (mir) { const xm = W - 1 - (x - XM) + XM; if (xm >= 0 && xm < FW) g[y][xm] = colorOf(ch) }
      }))
    } else g = composeWide(eq.value).map((r, y) => r.map((v, x) => (mask.has(`${x - XM},${y}`) ? v : null)))
    px = outline(g).px
  } else px = render(eq.value).px
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    const v = px[y][x]; if (!v) continue
    ctx.globalAlpha = focus.value === 'dim' && !mask.has(`${x - PAD - XM},${y - PAD}`) ? 0.3 : 1
    ctx.fillStyle = v; ctx.fillRect(x * Z, y * Z, Z, Z)
  }
  ctx.globalAlpha = 1
  if (gridOn.value) {
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1; ctx.beginPath()
    for (let x = 0; x <= CW; x++) { ctx.moveTo(x * Z + .5, 0); ctx.lineTo(x * Z + .5, CH * Z) }
    for (let y = 0; y <= CH; y++) { ctx.moveTo(0, y * Z + .5); ctx.lineTo(CW * Z, y * Z + .5) }
    ctx.stroke()
  }
  // แกนสะท้อน + กรอบ 40x44
  ctx.strokeStyle = 'rgba(79,163,217,.6)'; ctx.setLineDash([4, 4]); ctx.beginPath()
  ctx.moveTo((PAD + XM + W / 2) * Z, 0); ctx.lineTo((PAD + XM + W / 2) * Z, CH * Z); ctx.stroke()
  ctx.setLineDash([]); ctx.strokeStyle = 'rgba(224,82,74,.3)'; ctx.strokeRect((PAD + XM) * Z, PAD * Z, W * Z, H * Z)
  ctx.strokeStyle = 'rgba(224,82,74,.7)'; ctx.strokeRect(PAD * Z, PAD * Z, FW * Z, H * Z)
  const st = cur.value?.st
  if (st && ANCH[st.at]) {   // จุดยึด
    const [ax, ay] = ANCH[st.at]
    ctx.strokeStyle = '#E0524A'; ctx.lineWidth = 2
    for (const bx of st.mir ? [ax, W - 1 - ax] : [ax]) {
      const cx = (PAD + XM + bx + .5) * Z, cy = (PAD + ay + .5) * Z, d = Z / 2
      ctx.beginPath(); ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d); ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d); ctx.stroke()
    }
    ctx.lineWidth = 1
  }
}
watch([eq, focus, gridOn, grids], () => requestAnimationFrame(draw), { deep: true })

// ── จิ้ม ──
let painting = null
function cellAt(e) {
  const r = cv.value.getBoundingClientRect()
  const X = Math.floor((e.clientX - r.left) / r.width * CW) - PAD - XM   // พิกัดบนตัว (ติดลบได้ = ที่ว่างข้าง)
  const Y = Math.floor((e.clientY - r.top) / r.height * CH) - PAD
  return [X, Y]
}
function paintAt(X, Y, erase) {
  if (isSt(layer.value)) {
    if (Y < 0 || Y >= H) return false
    const g = grids.value[layer.value]
    let changed = false
    const set = (bx, v) => { const i = bx + XM; if (i >= 0 && i < FW && g[Y][i] !== v) { g[Y][i] = v; changed = true } }
    const mir = cur.value.st.mir
    if (erase) { set(X, null); if (mir) set(W - 1 - X, null) }
    else set(mir && X >= W / 2 ? W - 1 - X : X, brush.value)
    return changed
  }
  const [ox, oy] = offOf()
  const y = Y - oy; if (y < 0 || y >= H) return false
  const g = grids.value[layer.value]
  const direct = X - ox, mir = W - 1 - X - ox
  const inb = x => x >= 0 && x < W
  let changed = false
  const set = (x, v) => { if (inb(x) && g[y][x] !== v) { g[y][x] = v; changed = true } }
  if (erase) { set(direct, null); if (MIRROR[layer.value]) set(mir, null) }
  else if (MIRROR[layer.value] && X >= W / 2) set(mir, brush.value)
  else set(direct, brush.value)
  return changed
}
function down(e) {
  e.preventDefault()
  undoStack.value.push(clone(grids.value))
  if (undoStack.value.length > 80) undoStack.value.shift()
  painting = { erase: e.button === 2 || brush.value === null, changed: false }
  move(e)
}
function move(e) {
  if (!painting) return
  const [X, Y] = cellAt(e)
  // ลากเร็ว pointermove ห่าง → เติมเส้นระหว่างจุดเดิมกับจุดใหม่
  const [x0, y0] = painting.last || [X, Y]
  const n = Math.max(Math.abs(X - x0), Math.abs(Y - y0), 1)
  let any = false
  for (let i = 0; i <= n; i++) {
    if (paintAt(Math.round(x0 + (X - x0) * i / n), Math.round(y0 + (Y - y0) * i / n), painting.erase)) any = true
  }
  painting.last = [X, Y]
  if (any) { painting.changed = true; commitGrids() }
}
function up() {
  if (painting && !painting.changed) undoStack.value.pop()
  painting = null
}
function undo() {
  const g = undoStack.value.pop(); if (!g) return
  grids.value = g; commitGrids()
}
function revert() {
  const p = cur.value
  undoStack.value.push(clone(grids.value))
  for (const k of [...LAYER_KEYS, 'st', 'pal']) delete p[k]
  Object.assign(p, clone(ORIG[p.id]))
  const keep = layer.value
  loadGrids()
  if (layerList.value.some(l => l.k === keep)) layer.value = keep
  dirty.add(p.id); tick.value++
}
function onKey(e) { if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() } }

function setMir(on) {
  undoStack.value.push(clone(grids.value))
  cur.value.st = { ...cur.value.st, mir: on }
  commitGrids()
}

// ── สี ──
function setPal(k, hex) {
  const p = cur.value
  p.pal = { ...(p.pal || {}), [k]: hex.toUpperCase() }
  dirty.add(p.id); tick.value++
}
function addColor() {
  const used = new Set(palKeys.value)
  const k = FREE_LETTERS.find(l => !used.has(l)); if (!k) return
  setPal(k, '#888888'); brush.value = k
}

// ── รีวิว ──
function setReview(s) {
  const r = { ...review.value }
  if (s) r[curId.value] = { ...(r[curId.value] || {}), s }
  else delete r[curId.value]
  review.value = r; reviewDirty.value = true
}
function setNote() {
  const r = { ...review.value }
  const n = note.value.trim()
  r[curId.value] = { ...(r[curId.value] || {}), n }
  if (!n) delete r[curId.value].n
  if (!Object.keys(r[curId.value]).length) delete r[curId.value]
  review.value = r; reviewDirty.value = true
}

async function save() {
  for (const id of dirty) edits[id] = pick(PART[id])
  const res = await fetch('/__doll/save', { method: 'POST', body: JSON.stringify({ edits, review: review.value }) })
  if (res.ok) { dirty.clear(); reviewDirty.value = false }
  else alert('บันทึกไม่สำเร็จ: ' + await res.text())
}

function select(id) {
  curId.value = id
  router.replace({ query: { p: id } })
}
watch(curId, () => { loadGrids(); nextTick(draw) })
watch(() => route.query.p, p => { if (p && PART[p] && p !== curId.value) curId.value = String(p) })

function beforeUnload(e) { if (dirty.size || reviewDirty.value) { e.preventDefault(); e.returnValue = '' } }
onMounted(async () => {
  try { review.value = await (await fetch('/__doll/review')).json() } catch { /* ยังไม่มีไฟล์ */ }
  loadGrids(); nextTick(draw)
  window.addEventListener('keydown', onKey)
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.de { position: fixed; inset: 0; z-index: 450; display: flex; gap: 12px; overflow: hidden; padding: 8px; font-size: .8rem; background: var(--bg, #f6f7fb); }
.de-list { width: 190px; flex-shrink: 0; overflow-y: auto; background: #fff; border-radius: 12px; padding: 6px; }
.de-filter { display: flex; gap: 3px; margin-bottom: 6px; flex-wrap: wrap; }
.de-filter button, .de-row button, .de-mini { font: inherit; font-size: .74rem; border: 1px solid var(--line); background: #fff; border-radius: 8px; padding: 4px 8px; cursor: pointer; }
.de-filter button.on, .de-row button.on { background: var(--primary); color: #fff; border-color: var(--primary); }
.de-slot { font-weight: 800; color: var(--muted); margin: 8px 4px 2px; font-size: .72rem; }
.de-item { display: flex; gap: 6px; align-items: baseline; width: 100%; font: inherit; text-align: left; border: 0; background: none; padding: 4px 6px; border-radius: 8px; cursor: pointer; }
.de-item small { margin-left: auto; color: var(--muted); font-size: .7rem; }
.de-item.on { background: var(--primary-light); }
.de-st { width: 1.2em; }
.de-main { flex: 1; overflow: auto; }
.de-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.de-top small { color: var(--muted); }
.de-sp { flex: 1; }
.de-save { font: inherit; font-weight: 800; border: 0; border-radius: 10px; padding: 8px 14px; background: var(--primary); color: #fff; cursor: pointer; }
.de-save:disabled { opacity: .45; }
.de-work { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
.de-cv { image-rendering: pixelated; border-radius: 10px; cursor: crosshair; touch-action: none; display: block; }
.de-hint { color: var(--muted); font-size: .72rem; margin-top: 4px; }
.de-side { width: 260px; display: flex; flex-direction: column; gap: 8px; }
.de-box { background: #fff; border-radius: 12px; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.de-lab { font-weight: 800; font-size: .74rem; }
.de-row { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
.de-chk { display: flex; gap: 4px; align-items: center; }
.de-pal { display: flex; flex-wrap: wrap; gap: 4px; }
.de-sw { width: 30px; height: 30px; border-radius: 8px; border: 2px solid rgba(0,0,0,.15); cursor: pointer; position: relative; padding: 0; }
.de-sw span { position: absolute; right: 1px; bottom: 0; font-size: .7rem; font-weight: 800; color: #fff; text-shadow: 0 0 2px #000; }
.de-sw.on { outline: 3px solid var(--primary); outline-offset: 1px; }
.de-sw.erase { background: #fff; font-size: .9rem; }
.de-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15) !important; padding: 0 !important; }
.de-dot.on { outline: 3px solid var(--primary); }
.de-prev { display: flex; gap: 10px; align-items: flex-end; background: #E8ECF3; border-radius: 8px; padding: 8px; }
.de-mini:disabled { opacity: .45; }
textarea { font: inherit; border: 1px solid var(--line); border-radius: 8px; padding: 6px; resize: vertical; }
select { font: inherit; padding: 4px; border-radius: 8px; border: 1px solid var(--line); }
</style>
