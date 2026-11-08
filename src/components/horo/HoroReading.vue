<!--
  ดวงเต็มของวัน: วงจักรราศี (จันทร์จรจริง) · ไพ่ประจำวัน · ดวงรายวัน 3 ด้าน · สีมงคล · ลัคนา
  ลายเซ็นของหน้า = วงจักรราศีที่โชว์ตำแหน่งจันทร์จริงวันนี้เทียบราศีเกิด (ที่มาของคำทำนาย)
-->
<template>
  <div class="hr">
    <!-- ท้องฟ้าวันนี้ -->
    <section class="hr-sky">
      <svg class="hr-dial" viewBox="-110 -110 220 220" role="img"
           :aria-label="profile ? `ดวงจันทร์วันนี้อยู่ราศี${SIGNS[moon]} เรือนที่ ${reading.house.n} นับจากราศี${SIGNS[profile.sign]}` : `ดวงจันทร์วันนี้อยู่ราศี${SIGNS[moon]}`">
        <circle r="96" class="ring" />
        <circle r="64" class="ring in" />
        <path v-if="profile" :d="arc" class="hr-arc" />
        <g v-for="(s, i) in SIGNS" :key="i">
          <line :x1="pt(i * 30, 64).x" :y1="pt(i * 30, 64).y" :x2="pt(i * 30, 96).x" :y2="pt(i * 30, 96).y" class="tick" />
          <text :x="pt(i * 30 + 15, 80).x" :y="pt(i * 30 + 15, 80).y" class="glyph" :class="{ me: profile && i === profile.sign, moon: i === moon }">{{ s }}</text>
        </g>
        <g :transform="`translate(${pt(moon * 30 + 15, 104).x} ${pt(moon * 30 + 15, 104).y})`">
          <circle r="9" class="moon-bg" /><text class="moon-ic" y="1">☾</text>
        </g>
        <text y="-16" class="c-sm">{{ profile ? 'จันทร์จร' : 'จันทร์อยู่ราศี' }}</text>
        <text y="4" class="c-big">{{ profile ? `เรือน ${reading.house.n}` : SIGNS[moon] }}</text>
        <text v-if="profile" y="22" class="c-sm">{{ reading.house.name }}</text>
      </svg>
      <div class="hr-sky-t">
        <small>{{ thaiDate }}</small>
        <b v-if="profile">{{ reading.house.head }}</b>
        <b v-else>ท้องฟ้าวันนี้</b>
        <p v-if="profile">ดวงจันทร์จรราศี{{ SIGNS[moon] }} เป็นเรือนที่ {{ reading.house.n }} ({{ reading.house.name }}) นับจากราศี{{ SIGNS[profile.sign] }}ของคุณ</p>
        <p v-if="profile" class="hr-about">{{ reading.house.about }}</p>
        <p v-else>ดวงจันทร์อยู่ราศี{{ SIGNS[moon] }} กรอกวันเกิดเพื่อดูว่าวันนี้ตรงกับเรือนไหนของคุณ</p>
      </div>
    </section>

    <!-- ไพ่ประจำวัน -->
    <section class="hr-tarot">
      <h3>ไพ่ประจำวัน</h3>
      <div class="hr-tarot-body">
        <button class="hr-card" :class="{ flip: opened }" :aria-label="opened ? tarot.card.en : 'แตะเพื่อเปิดไพ่'" @click="openCard">
          <span class="face back"><span class="back-mark">☾ ✦ ☽</span></span>
          <span class="face front"><img :src="tarotSrc(tarot.card.img)" :alt="tarot.card.en" :class="{ rev: tarot.reversed }" loading="lazy" /></span>
        </button>
        <div class="hr-tarot-t">
          <template v-if="opened">
            <b class="hr-cn">{{ tarot.card.en }}</b>
            <small>{{ tarot.card.th }}<span class="hr-pill">{{ tarot.reversed ? 'กลับหัว' : 'หัวตั้ง' }}</span></small>
            <p>{{ tarot.reversed ? tarot.card.rv : tarot.card.up }}</p>
            <p class="hr-tip">✦ คำแนะนำ: {{ tarot.reversed ? tarot.card.rvTip : tarot.card.upTip }}</p>
          </template>
          <template v-else>
            <b class="hr-cn">แตะเพื่อเปิดไพ่วันนี้</b>
            <p>เปิดได้วันละ 1 ใบ พรุ่งนี้มาเปิดใบใหม่ได้</p>
          </template>
        </div>
      </div>
    </section>

    <!-- ดวงรายวัน -->
    <section v-if="profile" class="hr-daily">
      <h3>ดวงวันนี้ · ราศี{{ SIGNS[profile.sign] }}</h3>
      <div v-for="a in aspects" :key="a.k" class="hr-asp">
        <div class="hr-asp-h"><span>{{ a.label }}</span><span class="hr-stars" :aria-label="`${a.stars} จาก 5`">{{ '★'.repeat(a.stars) }}<i>{{ '★'.repeat(5 - a.stars) }}</i></span></div>
        <p>{{ a.text }}</p>
      </div>
      <p class="hr-tip">✦ คำแนะนำ: {{ reading.house.tip }}</p>
      <div class="hr-lucky">เลขนำโชค <b>{{ reading.luckyNums.join(' · ') }}</b></div>
    </section>

    <!-- สีมงคล -->
    <section v-if="colors" class="hr-colors">
      <h3>สีมงคล · คนเกิดวัน{{ DAY_NAMES[profile.dow] }}</h3>
      <div class="hr-sw">
        <div v-for="c in colorRows" :key="c.k" class="hr-sw-i" :class="{ avoid: c.k === 'avoid' }">
          <span class="dot" :style="{ background: c.hex }"></span><small>{{ c.label }}</small><b>{{ c.name }}</b>
        </div>
      </div>
    </section>

    <!-- ลัคนา -->
    <section v-if="profile && profile.asc != null" class="hr-asc">
      <span>ลัคนา</span><b>ราศี{{ SIGNS[profile.asc] }}</b>
      <small v-if="profile.ascApprox">โดยประมาณ (ไม่ได้ระบุเวลาเกิด)</small>
    </section>

    <button v-if="!profile || !colors" class="hr-setup" @click="$emit('setup')">
      {{ profile ? 'เพิ่มปีเกิด เพื่อดูสีมงคลและลัคนา ›' : 'กรอกวันเกิด เพื่อดูดวงตามราศี ›' }}
    </button>
    <p class="hr-fine">คำนวณจากตำแหน่งดาวจริง (ระบบไทย) · อ่านไว้เป็นกำลังใจ ตัดสินใจด้วยตัวเองนะ</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { tarotSrc } from '../../data/tarot.js'
import { DAY_NAMES } from '../../data/horoHouses.js'
import { SIGNS, dailyCard, dailyReading, moonSign, noonOf, colorsFor } from '../../utils/horo.js'
import { dayKey } from '../../utils/dailyChallenge.js'

defineEmits(['setup'])
const auth = useAuthStore()
const day = dayKey()
const uid = computed(() => auth.currentUser?.uid || 'guest')
const profile = computed(() => auth.userData?.horo || null)
const moon = moonSign(noonOf(day))
const reading = computed(() => dailyReading(profile.value?.sign ?? 0, day, uid.value))
const tarot = computed(() => dailyCard(uid.value, day))
const colors = computed(() => colorsFor(profile.value?.dow))
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const thaiDate = (() => { const [y, m, d] = day.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y + 543}` })()

const aspects = computed(() => {
  const r = reading.value, s = r.house.stars
  return [
    { k: 'w', label: 'การงาน / การเรียน', stars: s[0], text: r.work },
    { k: 'm', label: 'การเงิน', stars: s[1], text: r.money },
    { k: 'l', label: 'ความรัก', stars: s[2], text: r.love },
  ]
})
const colorRows = computed(() => {
  const c = colors.value
  return [
    { k: 'work', label: 'งาน', name: c.work[0], hex: c.work[1] },
    { k: 'money', label: 'การเงิน', name: c.money[0], hex: c.money[1] },
    { k: 'charm', label: 'เสน่ห์', name: c.charm[0], hex: c.charm[1] },
    { k: 'avoid', label: 'ควรเลี่ยง', name: c.avoid[0], hex: c.avoid[1] },
  ]
})

// วงจักรราศี: เมษอยู่บนสุด เวียนตามเข็ม
const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return { x: +(r * Math.cos(a)).toFixed(2), y: +(r * Math.sin(a)).toFixed(2) } }
const arc = computed(() => {
  const a0 = profile.value.sign * 30 + 15
  let span = ((moon - profile.value.sign + 12) % 12) * 30
  if (!span) return ''
  const p0 = pt(a0, 58), p1 = pt(a0 + span, 58)
  return `M ${p0.x} ${p0.y} A 58 58 0 ${span > 180 ? 1 : 0} 1 ${p1.x} ${p1.y}`
})

// เปิดไพ่แล้ว → จำไว้ทั้งวัน (สะดวกเฉยๆ ถ้าอ่านไม่ได้ก็แค่ต้องแตะใหม่)
const KEY = `horo-open-${day}`
const opened = ref((() => { try { return localStorage.getItem(KEY) === '1' } catch { return false } })())
function openCard() {
  if (opened.value) return
  opened.value = true
  try { localStorage.setItem(KEY, '1') } catch { /* ไม่เป็นไร */ }
}
</script>

<style scoped>
.hr { --night: #23264f; --night2: #3a3f86; --gold: #e9c46a; display: flex; flex-direction: column; gap: 14px; padding-bottom: 76px; }
.hr h3 { margin: 0 0 8px; font-size: .92rem; font-weight: 800; color: var(--ink); }

.hr-sky { display: flex; gap: 14px; align-items: center; background: radial-gradient(120% 140% at 0% 0%, var(--night2), var(--night)); color: #eef0ff; border-radius: 20px; padding: 14px; }
.hr-dial { width: 148px; flex-shrink: 0; overflow: visible; }
.ring { fill: none; stroke: rgba(255, 255, 255, .22); stroke-width: 1; }
.ring.in { fill: rgba(255, 255, 255, .04); }
.tick { stroke: rgba(255, 255, 255, .16); stroke-width: 1; }
.glyph { fill: rgba(238, 240, 255, .55); font-size: 10.5px; text-anchor: middle; dominant-baseline: central; }
.glyph.me { fill: var(--gold); font-weight: 800; font-size: 12px; }
.glyph.moon { fill: #fff; }
.hr-arc { fill: none; stroke: var(--gold); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 2 5; }
.moon-bg { fill: #fdf6dc; }
.moon-ic { fill: var(--night); font-size: 13px; text-anchor: middle; dominant-baseline: central; }
.c-big { fill: #fff; font-size: 18px; dominant-baseline: central; font-weight: 800; text-anchor: middle; }
.c-sm { fill: rgba(238, 240, 255, .7); font-size: 11px; dominant-baseline: central; text-anchor: middle; }
.hr-sky-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.hr-sky-t small { font-size: .72rem; color: rgba(238, 240, 255, .7); letter-spacing: .04em; }
.hr-sky-t b { font-size: 1.05rem; color: var(--gold); }
.hr-about { margin-top: 4px !important; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, .14); color: #fff !important; }
.hr-sky-t p { margin: 0; font-size: .78rem; line-height: 1.55; color: rgba(238, 240, 255, .88); }

.hr-tarot-body { display: flex; gap: 14px; align-items: flex-start; }
.hr-card { flex-shrink: 0; width: 112px; aspect-ratio: 11 / 19; position: relative; border: 0; padding: 0; background: none; cursor: pointer; perspective: 800px; }
.hr-card .face { position: absolute; inset: 0; border-radius: 10px; backface-visibility: hidden; overflow: hidden; transition: transform .7s cubic-bezier(.2, .8, .2, 1); box-shadow: 0 6px 16px rgba(35, 38, 79, .22); }
.hr-card .back { background: radial-gradient(circle at 50% 45%, rgba(233, 196, 106, .28), transparent 55%), linear-gradient(160deg, var(--night2), var(--night)); border: 4px solid #fff; display: grid; place-items: center; }
.back-mark { color: var(--gold); font-size: .9rem; letter-spacing: .2em; border: 1px solid rgba(233, 196, 106, .6); border-radius: 999px; padding: 6px 8px; }
.hr-card .front { transform: rotateY(180deg); background: #fff; border: 4px solid #fff; }
.hr-card.flip .back { transform: rotateY(-180deg); }
.hr-card.flip .front { transform: rotateY(0); }
.hr-card:not(.flip) .back { animation: hr-breathe 2.8s ease-in-out infinite; }
.front img { width: 100%; height: 100%; object-fit: cover; display: block; }
.front img.rev { transform: rotate(180deg); }
@keyframes hr-breathe { 50% { box-shadow: 0 6px 22px rgba(233, 196, 106, .55); } }
.hr-tarot-t { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.hr-cn { font-size: 1rem; color: var(--ink); }
.hr-tarot-t small { font-size: .78rem; color: var(--muted); }
.hr-pill { margin-left: 6px; font-size: .7rem; font-weight: 800; padding: 1px 8px; border-radius: 999px; background: var(--primary-light, #e7f1fb); color: var(--primary); }
.hr-tarot-t p, .hr-asp p { margin: 0; font-size: .84rem; line-height: 1.65; color: var(--ink); }
.hr-tip { margin: 6px 0 0; font-size: .82rem; line-height: 1.6; color: #6b4e0f; background: #fdf6dc; border-radius: 12px; padding: 8px 10px; }

.hr-daily { display: flex; flex-direction: column; gap: 10px; }
.hr-asp { border-top: 1px solid var(--line); padding-top: 9px; }
.hr-asp-h { display: flex; justify-content: space-between; align-items: center; font-size: .8rem; font-weight: 800; color: var(--muted); margin-bottom: 3px; }
.hr-stars { color: #e0a82e; letter-spacing: 1px; font-size: .86rem; }
.hr-stars i { font-style: normal; color: var(--line); }
.hr-lucky { font-size: .82rem; color: var(--muted); }
.hr-lucky b { color: var(--ink); font-size: 1rem; margin-left: 6px; }

.hr-sw { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.hr-sw-i { display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
.hr-sw-i .dot { width: 34px; height: 34px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 1px var(--line); }
.hr-sw-i.avoid .dot { opacity: .55; background-image: linear-gradient(135deg, transparent 46%, #fff 46%, #fff 54%, transparent 54%) !important; }
.hr-sw-i small { font-size: .7rem; color: var(--muted); }
.hr-sw-i b { font-size: .8rem; color: var(--ink); }

.hr-asc { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: .82rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 10px; }
.hr-asc b { font-size: .95rem; color: var(--ink); }
.hr-asc small { font-size: .72rem; }
.hr-setup { font: inherit; font-weight: 800; font-size: .84rem; border: var(--bw) dashed var(--primary); color: var(--primary); background: transparent; border-radius: 14px; padding: 11px; cursor: pointer; }
.hr-fine { margin: 0; text-align: center; font-size: .7rem; color: var(--muted); }
@media (max-width: 380px) { .hr-dial { width: 112px; } .hr-card { width: 96px; } }
</style>
