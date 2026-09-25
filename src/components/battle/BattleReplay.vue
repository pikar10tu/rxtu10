<!-- BattleReplay v2 — event-driven (dispatch ตาม event.t) · melee/ranged · ป้ายสาย/crit/ตาย ·
     UI: ป้ายฝั่ง + badge สาย + กรอบสีแยกข้าง = ดูรู้เรื่องว่าใครฝั่งไหน/ตีใคร/แพ้ทางมั้ย
     controls: พัก + กดค้างเร่ง (ปุ่มข้าม/เร็วถูกลบ Task 6 — heavy/finish ไม่ย่อแม้กดค้าง) · แตะตัว = pause + inspect (ช่อง passive รอ §5.5 master plan)
     จังหวะขับด้วย beat.timing (battleBeats.js) แทน baseDelay คงที่ (Task 4) — ปุ่มเร็วเดิมถูกลบ
     ⚠️ ทุก emoji ผ่าน <Emoji> (Fluent self-host) — อย่าใส่ emoji ดิบในเทมเพลต (เป็น tofu บนบางเครื่อง) -->
<template>
  <!-- Teleport ไป body: #main-content (position:fixed) = stacking context → z420 สู้ #bottom-nav (z200) ไม่ได้ถ้า render ในนี้
       → nav โผล่ทะลุก้นจอสู้. ย้ายทั้งชุด (peek/result/inspect เป็นลูกข้างใน z คงเดิม) ไป root (ดู CLAUDE.md) -->
  <Teleport to="body">
  <div v-if="data" class="br-ov" ref="ovRef">
    <!-- พื้นครึ่งสนาม: บน = สนามอีกฝ่าย · ล่าง = สนามเรา · เส้นกลาง = กึ่งกลางแถว .br-vs (ไม่ใช่กลางจอ)
         ของตกแต่งวางได้แค่ "เขตขอบนอก" ระหว่างขอบจอกับ .br-box (ArenaFloor + utils/arenaLayout.js)
         user เลือกรอยต่อแบบตรง 25 ก.ย. 2026 · สเปก 2026-09-25-arena-skins-replay-news-design.md §3.1 -->
    <div class="br-bg" :style="seam ? { top: 0, height: seam.y + 'px' } : { top: 0, height: '50%' }">
      <ArenaFloor :arena-ref="arenas.top" side="top" :zone="seam?.zTop || null" />
    </div>
    <div class="br-bg" :style="seam ? { top: seam.y + 'px', bottom: 0 } : { top: '50%', bottom: 0 }">
      <ArenaFloor :arena-ref="arenas.bot" side="bot" :zone="seam?.zBot || null" />
    </div>
    <div v-if="seam" class="br-seam" :style="{ top: seam.y + 'px' }"></div>
    <!-- ฉาก VS (สนามประลอง/ท้าสู้) แทน READY/GO: ครึ่งบนสไลด์ลง ครึ่งล่างสไลด์ขึ้น ชนที่เส้นกลาง · แตะข้ามได้ -->
    <div v-if="introPhase === 'vs'" class="br-vsi" :style="{ '--sy': (seam ? seam.y + 'px' : '50%') }" @click="skipIntro">
      <div class="br-vsi-h top"><ArenaFloor mode="thumb" :arena-ref="arenas.top" side="top" /><span class="br-vsi-n"><b>{{ sideTop.name }}</b>{{ arenaNameOf(arenas.top) }}</span></div>
      <div class="br-vsi-h bot"><ArenaFloor mode="thumb" :arena-ref="arenas.bot" side="bot" /><span class="br-vsi-n"><b>{{ sideBot.name }}</b>{{ arenaNameOf(arenas.bot) }}</span></div>
      <div class="br-vsi-bar"></div>
      <div class="br-vsi-x">VS</div>
    </div>
    <div class="br-box" ref="boxRef"
         @pointerdown="onHoldStart" @pointerup="onHoldEnd"
         @pointercancel="onHoldEnd" @pointerleave="onHoldEnd">
      <div v-if="introPhase === 'ready' || introPhase === 'go'" class="br-intro" @click="skipIntro">
        <span class="br-intro-txt" :class="introPhase">{{ introPhase === 'ready' ? 'READY?' : 'GO!' }}</span>
      </div>
      <!-- ⚠️ จบไฟต์ = ซ่อนด้วย visibility (.br-gone) ห้าม v-if — ถอดออกแล้วกล่องหด การ์ดเลื่อน 32px
           เส้นกลางสนามขยับ 2 จังหวะ + ของตกแต่งวางใหม่ ตรงกับหมัดปิดเกมพอดี (วัดจริง 25 ก.ย. 2026) -->
      <div class="br-round" :class="{ 'br-gone': done }">รอบ {{ round }}</div>
      <!-- ป้ายบอกว่ากำลังดูค่าชุดไหนอยู่ — โผล่เฉพาะไฟต์ทดสอบในห้องแล็บ (fpsMeter/?fps=1)
           เทียบท่าชน 4 แบบติดกันแล้วจำไม่ได้ว่ากำลังดูอันไหน = เทสเสียเปล่าทั้งรอบ -->
      <div v-if="showFps" class="br-lab-tag">{{ labTag }}</div>
      <div v-if="showFps" class="br-fps" :class="{ bad: fpsWorst > 33, warn: fpsWorst > fpsDropAt && fpsWorst <= 33 }">{{ fpsWorst }}ms</div>

      <!-- ป้ายชื่อ: ใคร · แต้ม · สนามอะไร (data.sides ไม่ส่งมา = "ศัตรู"/"ทีมคุณ" แบบเดิม) -->
      <div class="br-side foe-label"><i class="dot foe"></i> <b>{{ sideTop.name }}</b><span v-if="sideTop.sub" class="br-side-sub">{{ sideTop.sub }}</span></div>
      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" :ref="el => setEl('B'+i, el)"
             class="br-unit foe" @click="inspect('B'+i)">
          <span class="br-el"><Emoji :char="elEmoji(p)" /></span>
          <span v-if="skillIcon(p)" class="br-skill-dot" :class="{ lit: skillCount['B'+i] }"><Emoji :char="skillIcon(p)" /><i v-if="skillCount['B'+i] > 1">×{{ skillCount['B'+i] }}</i></span>
          <span v-if="statusOf('B'+i).length" class="br-status">
            <b v-for="st in statusOf('B'+i)" :key="st.key" :class="{ dbf: !st.buff }"><Emoji :char="st.icon" /></b>
          </span>
          <span v-if="chipOn['B'+i]" class="br-chip" :class="{ out: chipOn['B'+i].out }">
            <Emoji :char="chipOn['B'+i].icon" /> {{ chipOn['B'+i].name }}
          </span>
          <span class="br-face"><Emoji :char="defOf(p.id).emoji" /></span>
          <div class="br-hp">
            <div class="br-hp-ghost" :style="{ transform: 'scaleX(' + hpPct('B'+i) / 100 + ')' }"></div>
            <div class="br-hp-fill" :style="{ transform: 'scaleX(' + hpPct('B'+i) / 100 + ')' }"></div>
            <span v-for="(t, ti) in ticksFor('B'+i)" :key="ti" class="br-tick" :style="{ left: t + '%' }"></span>
          </div>
          <div class="br-stats"><span class="br-atk">{{ atkOf('B'+i) }}</span><span class="br-hpn foe" :class="{ hit: hpHit['B'+i] }">{{ shownHp('B'+i) }}</span></div>
        </div>
      </div>

      <div class="br-vs" ref="vsRef"><Emoji char="⚔️" /> {{ data.vsLabel ?? ('ชั้น ' + data.cleared) }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" :ref="el => setEl('A'+i, el)"
             class="br-unit me" @click="inspect('A'+i)">
          <span class="br-el"><Emoji :char="elEmoji(p)" /></span>
          <span v-if="skillIcon(p)" class="br-skill-dot" :class="{ lit: skillCount['A'+i] }"><Emoji :char="skillIcon(p)" /><i v-if="skillCount['A'+i] > 1">×{{ skillCount['A'+i] }}</i></span>
          <span v-if="statusOf('A'+i).length" class="br-status">
            <b v-for="st in statusOf('A'+i)" :key="st.key" :class="{ dbf: !st.buff }"><Emoji :char="st.icon" /></b>
          </span>
          <span v-if="chipOn['A'+i]" class="br-chip" :class="{ out: chipOn['A'+i].out }">
            <Emoji :char="chipOn['A'+i].icon" /> {{ chipOn['A'+i].name }}
          </span>
          <span class="br-face"><Emoji :char="defOf(p.id).emoji" /></span>
          <div class="br-hp">
            <div class="br-hp-ghost" :style="{ transform: 'scaleX(' + hpPct('A'+i) / 100 + ')' }"></div>
            <div class="br-hp-fill mine" :style="{ transform: 'scaleX(' + hpPct('A'+i) / 100 + ')' }"></div>
            <span v-for="(t, ti) in ticksFor('A'+i)" :key="ti" class="br-tick" :style="{ left: t + '%' }"></span>
          </div>
          <div class="br-stats"><span class="br-atk">{{ atkOf('A'+i) }}</span><span class="br-hpn me" :class="{ hit: hpHit['A'+i] }">{{ shownHp('A'+i) }}</span></div>
        </div>
      </div>
      <div class="br-side me-label"><i class="dot me"></i> <b>{{ sideBot.name }}</b><span v-if="sideBot.sub" class="br-side-sub">{{ sideBot.sub }}</span></div>

      <!-- สปอตไลต์สกิล — หรี่ฉากแล้วชูแบนเนอร์ให้อ่านก่อน ผลค่อยลงทีหลัง
           🚫 ห้ามใช้ backdrop-filter/blur ตรงนี้เด็ดขาด — เป็นตัวฆ่าเฟรมบน iOS Safari (ดูเคสกระตุก v3)
           อยู่ "ใต้" fx layer เพื่อให้เลข/ประกายของผลที่ลงตามมาไม่ถูกฉากหรี่กลบ -->
      <div v-if="spot" class="br-spot" :class="{ out: spotOut, foe: spot.side === 'B' }" :style="spotStyle" aria-hidden="true">
        <div class="br-spot-dim"></div>
        <!-- คัทอิน (user เลือกแบบ 2 จากเดโม 25 ก.ย. 2026): แถบเฉียง + หน้าเพ็ทเจ้าของสกิลทุกครั้ง
             ทีมเราเข้าจากซ้าย (ฟ้า) · ศัตรูเข้าจากขวา (แดง) · จังหวะเดิม: spotlightPassive await จนจบ = ไม่มีใครตีระหว่างนี้ -->
        <div class="br-cut">
          <span class="br-cut-face"><Emoji :char="spot.face" /></span>
          <span class="br-cut-t">
            <span class="br-cut-who">{{ spot.side === 'B' ? 'ศัตรู' : 'ทีมคุณ' }}</span>
            <b class="br-cut-name"><Emoji v-if="spot.skillIcon" :char="spot.skillIcon" /> {{ spot.name }}</b>
            <span v-if="spot.desc" class="br-cut-desc">{{ spot.desc }}</span>
          </span>
        </div>
      </div>

      <!-- fx pool layer (pops/callouts/koPuff/projectile) — พิกัดสัมพัทธ์กับ .br-box -->
      <div class="br-fx-layer" ref="fxLayerEl"></div>

      <div class="br-ctrl" :class="{ 'br-gone': done }">
        <button class="br-btn sm" @click="togglePause"><Emoji :char="paused ? '▶️' : '⏸️'" /> {{ paused ? 'เล่น' : 'พัก' }}</button>
      </div>
      <div v-if="ffActive" class="br-ff"><Emoji char="⏩" /> เร่ง</div>
      <div v-if="holdHint" class="br-hold-hint">กดค้างเพื่อเร่ง</div>
    </div>

    <!-- peek สนามหลังจบ: ปุ่มลอยกลับเข้าหน้าสรุป + ปิด (มีปุ่มปิดตรงนี้ด้วย ไม่ต้องกดดูสรุปกลับก่อน) -->
    <div v-if="resultReady && !resultOpen" class="br-peek-bar">
      <button class="br-btn sm br-peek-btn" @click="resultOpen = true"><Emoji char="📋" /> ดูสรุป</button>
      <button class="br-btn sm" @click="$emit('close')">ปิด</button>
    </div>

    <!-- modal สรุปผล — แตะนอกกล่อง = peek สนาม (ไม่ใช่ปิดทิ้ง กันกดพลาด) -->
    <div v-if="resultOpen && summary" class="br-result-ov" @click.self="resultOpen = false">
      <div class="br-modal">
        <div class="br-result" :class="{ win: data.won }">{{ data.won ? (data.winText ?? `ชนะ! ขึ้นชั้น ${data.cleared + 1}`) : (data.loseText ?? 'แพ้ ลองใหม่ได้เลย') }}</div>
        <div v-if="data.won && (data.rewardText ?? data.cleared != null)" class="br-reward"><Emoji char="🎁" /> {{ data.rewardText ?? ('ได้รับ: ขึ้นชั้น ' + (data.cleared + 1)) }}</div>

        <!-- แพ้แล้วต้องมีทางไปต่อ ไม่ใช่ทางตัน — ผู้เรียกเป็นคนเลือกว่าปุ่มควรพาไปไหน (มันเห็นเหรียญ/ตั๋วจริง)
             ที่นี่แค่วาด: ไม่รู้ราคากาชา ไม่แตะ auth store -->
        <div v-if="!data.won && data.loseTip" class="br-tip">
          <div class="br-tip-text">{{ data.loseTip.text }}</div>
          <button class="br-btn sm br-tip-btn" @click="goTip(data.loseTip.to)">{{ data.loseTip.label }}</button>
        </div>

        <div class="br-sum-team">
          <div class="br-sum-head"><i class="dot me"></i> ทีมคุณ</div>
          <div v-for="u in summary.teamA" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.A === u.uid, win: data.won, dead: u.dead }">
            <span v-if="summary.mvp.A === u.uid" class="br-mvp">MVP</span>
            <span class="br-sum-face"><Emoji :char="defOf(u.id).emoji" /></span>
            <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
            <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
          </div>
        </div>

        <div class="br-sum-team">
          <div class="br-sum-head"><i class="dot foe"></i> ศัตรู</div>
          <div v-for="u in summary.teamB" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.B === u.uid, win: !data.won, dead: u.dead }">
            <span v-if="summary.mvp.B === u.uid" class="br-mvp">MVP</span>
            <span class="br-sum-face"><Emoji :char="defOf(u.id).emoji" /></span>
            <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
            <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
          </div>
        </div>

        <!-- ป้ายตรงนี้ต้องตรงกับสิ่งที่ตัวนับ "นับจริง": เกณฑ์สะดุดคำนวณจากคาบเฟรมของจอเครื่องนี้ ไม่ใช่ 60fps ตายตัว
             และทุกตัวเลขหยุดนิ่งตั้งแต่ไฟต์จบ (stopFps snapshot) — ไม่ใช่ค่าที่ยังวิ่งอยู่ตอนกำลังอ่าน -->
        <div v-if="showFps" class="br-fps-sum">
          เฟรมแย่สุด <b>{{ Math.round(fpsPeak) }}ms</b> ·
          สะดุด (ช้ากว่า {{ Math.round(fpsDropAt) }}ms) <b>{{ fpsDrop }}</b> เฟรม ·
          ต่ำกว่า 30fps <b :class="{ bad: fpsOver33 > 0 }">{{ fpsOver33 }}</b> เฟรม
          <div class="br-fps-note">
            จอเครื่องนี้ ~{{ fpsBase ? Math.round(fpsBase) : '—' }}ms/เฟรม · นับเฉพาะช่วงที่ไฟต์กำลังเล่น
          </div>
        </div>

        <div class="br-modal-btns">
          <button class="br-btn sm" @click="resultOpen = false"><Emoji char="👀" /> ดูสนาม</button>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </div>
      </div>
    </div>

    <!-- inspect popover — pause + ดูสเตตัส combat จริง + ช่อง passive (รอบนี้ยังว่าง '—') -->
    <div v-if="inspectUid && insp" class="br-inspect" @click.self="closeInspect">
      <div class="br-card">
        <div class="br-card-emoji"><Emoji :char="insp.def.emoji" /></div>
        <div class="br-card-name">{{ insp.def.name }}</div>
        <div class="br-card-row"><span>สาย</span><b><Emoji :char="insp.elEmoji" /> {{ insp.elName }}</b></div>
        <div class="br-card-row"><span>ระดับ</span><b>{{ rarityLabel(insp.def.rarity) }} · เกรด {{ GRADE_LABELS[Math.min(5, Math.max(0, insp.grade || 0))] }}</b></div>
        <div class="br-card-row"><span>พลังโจมตี</span><b>{{ insp.atk }}</b></div>
        <div class="br-card-row"><span>พลังชีวิต</span><b>{{ insp.hpNow }} / {{ insp.hpMax }}</b></div>
        <div class="br-card-pass"><span>ทักษะเฉพาะ</span><b>{{ insp.passive ? insp.passName : 'ตัวนี้ยังไม่มี' }}</b></div>
        <!-- เดิมโชว์แค่ชื่อ เปิดมาก็ยังไม่รู้อยู่ดีว่าสกิลทำอะไร — passiveText() เติมเลขจริงของขั้นให้แล้ว -->
        <div v-if="insp.passive" class="br-card-passdesc">{{ passiveText(insp.passive) }}</div>

        <div v-if="inspBuffs.length" class="br-buffs">
          <div class="br-buffs-head">กำลังได้รับ</div>
          <div v-for="b in inspBuffs" :key="b.key" class="br-buff"
               :class="{ dbf: !b.buff, spent: b.spent }">
            <div class="br-buff-src">
              <Emoji :char="b.skillIcon" /> {{ b.skillName }}<span class="br-buff-owner">
                · <template v-if="b.self">ตัวเอง</template>
                <template v-else><Emoji :char="b.ownerEmoji" /> {{ b.ownerName }}</template>
                <template v-if="b.foeSide"> · ฝ่ายศัตรู</template>
              </span>
            </div>
            <div class="br-buff-eff">
              <Emoji :char="b.icon" /> {{ b.label }}
              <span v-if="b.spent" class="br-buff-tag">ใช้ไปแล้ว</span>
              <span v-else-if="b.maxStacks" class="br-buff-tag">{{ b.stacks }}/{{ b.maxStacks }} ชั้น</span>
              <!-- ไม่มีเพดาน (ความแค้นกอริลลา · ชั้นเชื้อ) ⇒ บอกจำนวนเฉยๆ ห้ามวาด x/0 -->
              <span v-else-if="b.stacks" class="br-buff-tag">{{ b.stacks }} ชั้น</span>
            </div>
          </div>
        </div>

        <button class="br-btn sm" @click="closeInspect">ปิด</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import Emoji from '../shared/Emoji.vue'
import ArenaFloor from './ArenaFloor.vue'
import { getArena } from '../../data/arenas.js'
import { parseArenaRef } from '../../utils/arenas.js'
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getPetDef, atkStyleOf, projectileOf, passiveOf, sparkOf, ELEMENTS, EL_NAME, GRADE_LABELS } from '../../data/index.js'
import { passiveText, passiveTitle, effectText, STATUS_MAX } from '../../data/petPassives.js'
import { buffSources, liveBuffs, badgesOf } from '../../utils/battleBuffs.js'
import { RARITY } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'
import { computeBattleSummary } from '../../utils/battleSummary.js'
import { fluentFile } from '../../utils/emoji.js'
import { createBattleFx } from '../../utils/battleFx.js'
import { buildBeats, scaleTiming, BEAT } from '../../utils/battleBeats.js'
import { readPrefs, fxFlags, paceMult, FX_LABEL, PACE_LABEL } from '../../utils/battleReplayPrefs.js'
import { createFrameMeter, FALLBACK_BASE, DROP_RATIO } from '../../utils/frameMeter.js'
import { prefersReducedMotion } from '../../utils/motionPref.js'
import { sfx } from '../../utils/sfx.js'

const props = defineProps({
  data: { type: Object, default: null },
  theme: { type: String, default: 'tower' },   // 'arena' | 'tower' — สนามดีฟอลต์ครึ่งบน ถ้า data.arenas ไม่ส่งมา
})

// ── พื้นครึ่งสนาม ──
// data.arenas = { top, bot } สตริงแบบแถว roster ('ar-lab' · 'ch-2026-09#3' · 'tower' · null = สนามฟรี)
const arenas = computed(() => ({
  top: props.data?.arenas?.top ?? (props.theme === 'tower' ? 'tower' : null),
  bot: props.data?.arenas?.bot ?? null,
}))
// ป้ายชื่อสองฝั่ง: data.sides = { top: { name, rating? }, bot: { name, rating? } } · sub = แต้ม · ชื่อสนาม
const arenaNameOf = (r) => {
  const id = parseArenaRef(r).id
  return id === 'tower' ? '' : (getArena(id)?.name || '')
}
function sideOf(key, fallback) {
  const s = props.data?.sides?.[key]
  const arena = arenaNameOf(arenas.value[key])
  if (!s) return { name: fallback, sub: '' }
  const bits = [typeof s.rating === 'number' ? s.rating.toLocaleString() : null, arena || null].filter(Boolean)
  return { name: s.name || fallback, sub: bits.join(' · ') }
}
const sideTop = computed(() => sideOf('top', 'ศัตรู'))
const sideBot = computed(() => sideOf('bot', 'ทีมคุณ'))
const ovRef = ref(null)
const vsRef = ref(null)
const seam = ref(null)   // { y, zTop, zBot } — null = ยังไม่ได้วัด (ใช้ 50% ไปก่อน)
// วัดจาก rect จริง: เส้นกลางที่แถว .br-vs · เขตขอบนอก = นอก .br-box
// ⚠️ วัดเฉพาะตอนเปิด/เปลี่ยนขนาด (ResizeObserver) — ห้ามวัดใน loop ของไฟต์
function measureSeam() {
  const ov = ovRef.value, box = boxRef.value, vs = vsRef.value
  if (!ov || !box || !vs) return
  const o = ov.getBoundingClientRect(), b = box.getBoundingClientRect(), v = vs.getBoundingClientRect()
  const y = Math.round(v.top + v.height / 2 - o.top)
  const w = Math.round(o.width)
  seam.value = {
    y,
    zTop: { y0: 0, y1: Math.round(b.top - o.top), w },
    zBot: { y0: Math.round(b.bottom - o.top) - y, y1: Math.round(o.height) - y, w },
  }
}
let seamRO = null
function watchSeam() {
  seamRO?.disconnect(); seamRO = null
  if (!ovRef.value || !boxRef.value || typeof ResizeObserver === 'undefined') return
  seamRO = new ResizeObserver(() => measureSeam())
  seamRO.observe(ovRef.value); seamRO.observe(boxRef.value)
  measureSeam()
}
const emit = defineEmits(['close'])

const router = useRouter()
// ปิด overlay ไฟต์ก่อนแล้วค่อยเปลี่ยนหน้า — ไม่งั้น overlay ค้างทับหน้าใหม่
function goTip(to) {
  emit('close')
  router.push(to)
}

const BASE_URL = import.meta.env.BASE_URL

// เวลาทั้งหมดมาจาก beat.timing แล้ว — เหลือแค่เวลา "รอบนอกไฟต์"
// resultDelayMs 900 (เดิม 500) = ให้หมัดน็อกชั้น finish ได้ลงจอดก่อนเปิด modal สรุป
const REPLAY_CFG = { resultDelayMs: 900 }

const defOf = (id) => getPetDef(id) || { emoji: '❓' }
const elEmoji = (p) => ELEMENTS[p?.element]?.emoji || '✊'

const idx = ref(0)
const round = ref(1)
const paused = ref(false)
const prefs = ref(readPrefs())          // อ่านครั้งเดียวตอน mount — พาเนล Admin เขียนก่อนเปิด replay อยู่แล้ว
const ffActive = ref(false)             // โหมดเร่ง (กดค้าง) — Task 6 เป็นคนสลับ
const pace = computed(() => paceMult(prefs.value.pace))
// speed/cycleSpeed/ปุ่ม "เร็ว ×N" ถูกลบทั้งชุด (Task 4) — เวลามาจาก beat.timing แล้ว

// ── กดค้าง = เร่ง (ไม่ใช่ข้าม) ──
// กติกาที่ทำให้มันไม่ใช่ปุ่มข้าม: FF_SCALE ใน battleBeats ย่อเฉพาะ chip/solid — heavy/finish เล่นเต็มเสมอ
// ผลคือคนรีบก็ยังได้ดูคริกับหมัดน็อกครบ แล้วจบที่หน้าสรุปเหมือนกัน
const HOLD_MS = 400
const holdHint = ref(false)
let holdTimer = null, hintTimer = null
function onHoldStart(e) {
  if (done.value || inspectUid.value || introPhase.value) return           // ไฟต์จบ/เปิด inspect/ยังโชว์ READY-GO อยู่ = ไม่ใช่จังหวะกดค้างเร่ง
  // แตะการ์ด/ปุ่ม = คนละเจตนา (เปิด inspect / พัก) · รวม .br-ctrl ด้วย เพราะ padding รอบปุ่มพักไม่ใช่ตัวปุ่ม
  // แต่คนเล็งจะกดปุ่มพัก แล้วพลาดไปโดนขอบ → กลายเป็นเริ่มกดค้างเร่งแทน
  if (e.target.closest && e.target.closest('.br-unit, .br-btn, .br-ctrl')) return
  // ผูก pointer capture กับกล่องสนามไว้ — กันเคส "ไฟต์จบกลางที่กดค้าง" ที่โมดัลสรุปลอยทับกล่องพอดี
  // ไม่ capture ไว้ pointerup ตอนปล่อยนิ้วจะไปตกที่โมดัล (topmost element ตอนนั้น) ไม่ใช่กล่อง → onHoldEnd ไม่ทำงาน → ffActive ค้าง true ข้ามไฟต์ถัดไป
  // (มี watch(done) ด้านล่างกันเหนียวอีกชั้น เผื่อ browser ไหนไม่รองรับ/ไม่ทำตาม capture)
  if (boxRef.value?.setPointerCapture) { try { boxRef.value.setPointerCapture(e.pointerId) } catch { /* บาง browser โยน ไม่ใช่สาระ */ } }
  clearTimeout(holdTimer)
  holdTimer = setTimeout(() => { ffActive.value = true; holdHint.value = false }, HOLD_MS)
}
function onHoldEnd(e) {
  clearTimeout(holdTimer)
  if (e?.pointerId != null && boxRef.value?.hasPointerCapture?.(e.pointerId)) {
    try { boxRef.value.releasePointerCapture(e.pointerId) } catch { /* เพิกเฉย */ }
  }
  if (!ffActive.value) {
    // แตะสั้นๆ โดยไม่ค้าง → บอกใบ้ว่ามีทางเร่งอยู่ (ค้นพบได้ตอนต้องการ ไม่ล่อตาตอนไม่ต้องการ)
    holdHint.value = true
    clearTimeout(hintTimer); hintTimer = setTimeout(() => { holdHint.value = false }, 1500)
  }
  ffActive.value = false
}
const hp = ref({})
const inspectUid = ref(null)
let pausedBeforeInspect = false  // คนกด ⏸️ เองอยู่ก่อนแล้วหรือเปล่า — ปิด inspect แล้วต้องคืนสถานะนั้น ไม่ใช่เล่นต่อดื้อ ๆ
// สปอตไลต์สกิล — แบนเนอร์ที่ขึ้นก่อน แล้วผลค่อยลง (ชั้น spotlight ของ battleBeats)
const spot = ref(null)           // { icon, name, desc } · null = ไม่มีสปอตไลต์อยู่
const spotOut = ref(false)       // true = กำลังเลื่อนออก (เฟสผลลง)
// ความยาวอนิเมชันผูกกับ beat.timing จริง (ไม่ใช่ค่าคงที่ใน CSS) — ไม่งั้นพอ pace ไม่ใช่ ×1
// แบนเนอร์จะยังเลื่อนเข้าไม่เสร็จตอนช่วงค้างอ่านหมดแล้ว
const spotStyle = ref({})
const introPhase = ref(null)   // 'ready' | 'go' | null (null = เริ่มเล่น log แล้ว)
const resultOpen = ref(false)
useEscapeKey(resultOpen, () => { resultOpen.value = false })    // modal สรุปโชว์อยู่
useEscapeKey(() => !!inspectUid.value, () => closeInspect())     // ปิด inspect แล้วไฟต์ต้องเดินต่อเหมือนกดปุ่มปิด
const resultReady = ref(false)   // จบไฟต์+ผ่านจังหวะรอแล้ว — ใช้โชว์ปุ่มลอย "ดูสรุป" ตอน peek
let resultTimer = null
let introTimer = null
let gen = 0                      // generation guard — reset/skip เพิ่มค่า เพื่อให้ promise chain ค้างจาก wait() รู้ตัวว่าโดนยกเลิก
let timer = null
let stepGen = -1                 // gen ของ beat chain ที่กำลังวิ่ง (-1 = ว่าง) — กันเปิดสายซ้อน ดู step()
                                 // ⚠️ ประกาศไว้บนสุดโดยตั้งใจ: reset() แตะตัวนี้ และ reset() ถูกเรียกจาก watch(immediate) ด้านล่าง
const pendingTimers = new Set()  // เก็บ timer id จาก wait() ทั้งหมด — clear ตอน reset/skip/unmount กัน promise chain ค้างมาเขียน state เก่าทับ
const pendingRafs = new Set()    // เช่นเดียวกันแต่เป็น rAF (ใช้เลื่อนอนิเมชันการ์ดไป 1 เฟรม ใน applyImpact)
function wait(ms) { return new Promise(r => { const t = setTimeout(r, ms); pendingTimers.add(t) }) }
// setTimeout ที่ยกเลิกได้แบบเดียวกับ wait() — สำหรับงานที่ไม่ต้อง await (ถอดคลาส flash)
function later(fn, ms) { const t = setTimeout(() => { pendingTimers.delete(t); fn() }, ms); pendingTimers.add(t); return t }
// รอให้เพนต์ของเฟรมปัจจุบันลงจอก่อนค่อยทำงาน (เรียกจากใน task ของ timer → callback ไปตกเฟรมถัดไป)
function nextFrame(fn) { const r = requestAnimationFrame(() => { pendingRafs.delete(r); fn() }); pendingRafs.add(r); return r }
function clearPending() {
  pendingTimers.forEach(clearTimeout); pendingTimers.clear()
  pendingRafs.forEach(cancelAnimationFrame); pendingRafs.clear()
}
// ⚠️ maxHp = ค่า "หลัง aura" ของเอนจิน (result.units) — เป็นตัวหารของ hp% และป้อน buildBeats เท่านั้น
//    ห้ามทำเป็น ref เด็ดขาด ไม่งั้น beats จะ re-compute กลางไฟต์ขณะ idx ชี้เข้าอาเรย์เก่า = พังทั้งไฟต์
//    (เลขที่ "พิมพ์บนการ์ด" เป็นคนละตัว → dispStats ด้านล่าง)
let maxHp = {}
const els = {}                   // uid → DOM el (วัดตำแหน่ง melee/ranged)
function setEl(uid, el) { if (el) els[uid] = el }

// ── ไฮไลต์ (Phase 2b): classList ตรงบน els[uid] แทน reactive ref (acting/winding/flashing) ──
// ตัด Vue reactivity ออกจาก path ที่วิ่งทุกหมัด — toggle class ตรงถูกกว่า set ref แล้วรอ re-render
function highlight(uid, cls, on = true) { const el = els[uid]; if (el) el.classList[on ? 'add' : 'remove'](cls) }
function clearHighlights() { Object.values(els).forEach(el => el && el.classList.remove('windup', 'acting', 'flash', 'spotlit')) }
// dead ก็ imperative classList เหมือนกัน (ไม่ใช่ reactive :class แล้ว) — กัน Vue re-render เขียนทับ flash/acting/windup ตอน hp เปลี่ยน (Task 9 finding #1)
function setDead(uid) { highlight(uid, 'dead', (hp.value[uid] ?? 100) <= 0) }

// ── fx pool (Phase 2a): pops/callouts/koPuff/projectile ออกจาก Vue reactivity → plain WAAPI pool ──
const fxLayerEl = ref(null)      // ref บน .br-fx-layer
const boxRef = ref(null)         // ref บน .br-box (จุดอ้างอิงพิกัด)
let fx = null
let attachedLayer = null           // .br-fx-layer element ที่ fx ผูกอยู่ตอนนี้ — เทียบกันจับ layer remount (overlay v-if สร้าง DOM ใหม่ทุกไฟต์)
function ensureFx() {
  if (!boxRef.value || !fxLayerEl.value) return
  if (!fx || attachedLayer !== fxLayerEl.value) {
    if (fx) fx.destroy()                                  // layer เปลี่ยน (ไฟต์ใหม่ remount .br-fx-layer) → ทิ้งของเก่า (listener/pool) ก่อนสร้างใหม่
    fx = createBattleFx()
    fx.attach({ boxEl: boxRef.value, layerEl: fxLayerEl.value, getEl: uid => els[uid] || null })
    attachedLayer = fxLayerEl.value
  }
  // ⚠️ ต้องอยู่นอก if — ยิงไฟต์ใหม่ "โดยไม่ปิด overlay" (ปุ่มยิงซ้ำในห้องแล็บ) จะได้ layer เดิม
  // ของเดิม set flag เฉพาะตอน attach ครั้งแรก → เปลี่ยน preset แล้วกดยิงซ้ำจะยังเล่นด้วยค่าเก่าทั้งไฟต์
  fx.setFlags(fxFlags(prefs.value.fx))
}

// ── การ์ดสไตล์ Hearthstone: ATK/HP เป็นเลข + หลอดเลือดขีดทุก 50 HP ──
function atkOf(uid) { return dispStats.value[uid]?.atk ?? 0 }
function curHp(uid) { return Math.round((dispStats.value[uid]?.maxHp || 0) * (hp.value[uid] ?? 100) / 100) }

// ── เลข HP: snap (เดิม) / flash / count — tuning.hpTick ──
const hpShown = ref({})          // uid → HP ที่โชว์ระหว่างไล่นับ (ไม่มี = ใช้ curHp ตรงๆ)
const hpHit = ref({})            // uid → true ช่วงกระพริบ
const hpAnims = new Map()        // uid → rAF id
function shownHp(uid) { return hpShown.value[uid] ?? curHp(uid) }
function tickHp(uid, from) {
  const mode = tuning.value.hpTick || 'count'   // ดีฟอลต์ = ที่ user เลือก (26 ก.ย.) · ห้องแล็บส่ง 'snap' เทียบของเดิมได้
  if (mode === 'snap') return
  hpHit.value = { ...hpHit.value, [uid]: true }
  later(() => { hpHit.value = { ...hpHit.value, [uid]: false } }, 320)
  if (mode !== 'count') return
  cancelAnimationFrame(hpAnims.get(uid))
  const to = curHp(uid), t0 = performance.now(), DUR = 350
  const step = (now) => {
    const k = Math.min(1, Math.max(0, (now - t0) / DUR))   // rAF อาจส่ง timestamp ก่อน t0 นิดหน่อย
    const v = Math.round(from + (to - from) * (1 - (1 - k) * (1 - k)))
    if (hpShown.value[uid] !== v) hpShown.value = { ...hpShown.value, [uid]: v }
    if (k < 1) hpAnims.set(uid, requestAnimationFrame(step))
    else { const n = { ...hpShown.value }; delete n[uid]; hpShown.value = n; hpAnims.delete(uid) }
  }
  hpAnims.set(uid, requestAnimationFrame(step))
}
function clearHpTicks() { hpAnims.forEach(id => cancelAnimationFrame(id)); hpAnims.clear(); hpShown.value = {}; hpHit.value = {} }

function ticksFor(uid) {
  const max = dispStats.value[uid]?.maxHp || 1, out = []
  for (let h = 50; h < max; h += 50) out.push((h / max) * 100)  // % ตำแหน่งขีดทุก 50 HP
  return out
}

// ── ป้ายสถานะบนการ์ด (สเปก §5) ──
//
// 🔒 กฎเหล็กข้อเดียวของฟีเจอร์นี้: **ห้ามแก้ป้ายขณะการ์ดมีอนิเมชันวิ่งอยู่**
//    (เปลี่ยน paint กลางอากาศ = re-raster ทั้งการ์ด — ข้อบังคับ v3)
//    ทำได้เพราะ aura ทั้ง 5 กับ onHit ทั้ง 6 "ไม่เคยเปลี่ยน" ระหว่างไฟต์เลย
//    ⇒ computed ตัวนี้ขึ้นกับ props.data อย่างเดียว = คำนวณตอนไฟต์เริ่ม แล้วนิ่งยาว
//    (ตัวที่เปลี่ยนได้ — 🧿 ใช้แล้วหมด, ⬆️ สแต็ก — ยังไม่ทำรอบนี้ ดู §5.5 ของสเปก)
//
// ต้นทุน: span static ในการ์ดที่ถูก promote เป็น layer อยู่แล้ว ⇒ 0 layer เพิ่ม 0 ต้นทุนต่อเฟรม
// (แพทเทิร์นเดียวกับ .br-skill-dot ที่ใช้อยู่จริงในโปรดักชันแล้ว)
// แหล่งความจริงเดียวของ "ใครติดบัฟอะไร มาจากใคร" (utils/battleBuffs.js)
// ป้ายบนการ์ดคือก้อนนี้ที่ตัดที่มาทิ้ง — รายการเต็มพร้อมที่มาไปโผล่ในหน้าต่าง inspect
const buffMap = computed(() => buffSources(props.data?.playerTeam || [], props.data?.botTeam || []))
const statusMap = computed(() => {
  const out = {}
  for (const [uid, list] of Object.entries(buffMap.value)) out[uid] = badgesOf(list, STATUS_MAX)
  return out
})
function statusOf(uid) { return statusMap.value[uid] || [] }

const rawLog = computed(() => props.data?.result?.log || [])
// ⚠️ maxHp เป็น plain object ที่ buildMax() เขียนทับ ไม่ใช่ ref — beats จึงไม่ re-compute เองเมื่อ maxHp เปลี่ยน
// แต่ปลอดภัยเพราะ buildMax(d) ถูกเรียกก่อน reset() ในตัว watcher เดียวกันเสมอ และ rawLog เปลี่ยนพร้อมกัน (props.data ใหม่ทั้งก้อน) ซึ่ง trigger การ compute ใหม่อยู่แล้ว
// ── เลเจนด์: โชว์ไทม์ครั้งแรกที่สกิลโปรก + เสียงประจำตัว (ดังตอนแบนเนอร์ขึ้น) ──
// ตัวที่สกิลเป็นยกแรก (🐉 🦁 🐳) ได้โชว์ยกแรกอยู่แล้ว ใส่ไว้เพื่อเสียงประจำตัว · 🐦‍🔥 revive เป็น skillMoment อยู่แล้ว
const LEGEND_SFX = {
  bahamut: 'dragon_roar', lion: 'roar', whale: 'whale', phoenix: 'phoenix', kirin: 'kirin', trex: 'trex',
  ouroboros: 'ouroboros', simurgh: 'simurgh', qilin: 'qilin', virus: 'virus_big', gorilla: 'gorilla', mammoth: 'mammoth',
}
const LEGEND_SHOW = new Set(Object.keys(LEGEND_SFX))

// data.tuning = ปุ่มจูนจากห้องแล็บ (ไม่ส่ง = ของเดิมทุกอย่าง) — ดู spec 2026-09-26 readability
const tuning = computed(() => props.data?.tuning || {})
// rng: ลำดับโชว์ยกแรกสุ่มใหม่ทุกไฟต์ (แสดงผลล้วน ไม่แตะผลไฟต์)
const beats = computed(() => buildBeats(rawLog.value, maxHp, {
  rng: Math.random, showPets: LEGEND_SHOW,
  ...(typeof tuning.value.hitSpread === 'number' ? { hitSpread: tuning.value.hitSpread } : {}),
}))
const done = computed(() => idx.value >= beats.value.length)
const summary = computed(() => done.value
  ? computeBattleSummary(rawLog.value, props.data?.playerTeam || [], props.data?.botTeam || [])
  : null)

// เลขที่ "พิมพ์บนการ์ด" — เริ่มที่ค่าดิบเหมือนตอนจัดทีม แล้ววิ่งตาม statsAfter ที่เอนจินส่งมา
// ผู้เล่นต้องได้เห็นโมเมนต์ที่สกิลทำงาน (🐳 เปล่งออร่า → เลือดทั้งทีมขยับ) ไม่ใช่แอบเป็นค่าบัฟมาแต่ต้น
const dispStats = ref({})

function buildMax(d) {
  maxHp = {}
  const disp = {}
  const add = (p, uid) => {
    const c = buildCombatant(p)
    disp[uid] = { atk: Math.round(c.atk), maxHp: Math.round(c.maxHp) || 1 }
    // 🔑 ตัวหาร hp% ต้องเป็นค่าหลัง aura ของเอนจิน ไม่ใช่ค่าดิบ — log ส่ง targetHpAfter มาบนสเกลนั้น
    //    ใช้ค่าดิบแล้วทีมที่มีคุณวาฬ (เลือด +10%) หลอดจะเริ่มเกิน 100% และเลข HP ผิดตั้งแต่หมัดแรก
    maxHp[uid] = Math.round(d?.result?.units?.[uid]?.maxHp ?? disp[uid].maxHp) || 1
  }
  ;(d?.botTeam || []).forEach((p, i) => add(p, 'B' + i))
  ;(d?.playerTeam || []).forEach((p, i) => add(p, 'A' + i))
  dispStats.value = disp
  if (import.meta.env.DEV) warnTeamMismatch(d)
}

// ── กันเคส "ทีมที่วาด ≠ ทีมที่ engine สู้ด้วย" (dev เท่านั้น) ──
// เกิดจริง 24 ส.ค.: useTower อ่าน botTeam (computed ผูกกับ floor) อีกรอบ "หลัง" patchUser ขยับชั้นแล้ว
// → ชนะชั้น 1 (บอท 1 ตัว) แต่จอวาดการ์ดศัตรู 2 ใบของชั้น 2 · log มีแค่ B0 → ตี B0 ตายแล้วจบทันที
// อาการฝั่งผู้เล่นคือ "ศัตรูมีสองตัว ตีตายตัวเดียวเกมจบเลย" ซึ่งอ่านไม่ออกเลยว่าเป็นบั๊กที่ไหน
// เช็คนี้ไม่มีทางเป็น false positive ฝั่ง "log อ้าง uid ที่ไม่มีการ์ด" · ส่วนฝั่ง "การ์ดที่ log ไม่เคยแตะ"
// เป็นได้จริงถ้าไฟต์จบเร็วมากจนสล็อตท้ายไม่ทันออกตี จึงเตือนเฉยๆ ไม่ throw
function warnTeamMismatch(d) {
  const uids = new Set()
  for (const e of (d?.result?.log || [])) {
    if (e?.t !== 'attack') continue
    if (e.attacker) uids.add(e.attacker)
    if (e.target) uids.add(e.target)
  }
  if (!uids.size) return
  const known = new Set(Object.keys(maxHp))
  const ghost = [...uids].filter(u => !known.has(u))
  const idle = [...known].filter(u => !uids.has(u))
  if (ghost.length) console.error('[BattleReplay] log อ้างถึงตัวที่ไม่มีการ์ดวาดไว้:', ghost.join(', '), '— ทีมที่ส่งเข้ามาไม่ใช่ทีมที่ engine สู้ด้วย')
  else if (idle.length) console.warn('[BattleReplay] มีการ์ดที่ไม่เคยปรากฏใน log เลย:', idle.join(', '), '— ปกติได้ถ้าไฟต์จบเร็วมาก แต่ถ้าเป็นฝั่งที่แพ้ทั้งทีม แปลว่าทีมที่วาดผิดตัว')
}

// อุ่น cache+decode asset combat ทั้งหมดก่อนเริ่มเล่น (intro หน่วง ~1.1s) — dash/pop/projectile swap src กลางไฟต์
// ไม่งั้น decoding="sync" ครั้งแรกของแต่ละรูป = บล็อกเฟรม
const preloadedImgs = []
function preloadCombat(d) {
  const chars = new Set(['⚡', '🛡️', '💀', '💥', '✨'])
  for (const p of [...(d?.playerTeam || []), ...(d?.botTeam || [])]) {
    const def = getPetDef(p?.id); if (!def) continue
    if (def.emoji) chars.add(def.emoji)                                  // หน้าเพ็ท (dash sprite)
    const spark = sparkOf(def); if (spark) chars.add(spark)               // ประกายประจำตัวตอนตีโดน
    const pas = passiveOf(def); if (pas?.icon) chars.add(pas.icon)        // ไอคอน passive (ป้าย + sweep)
  }
  for (const c of chars) {
    const f = fluentFile(c); if (!f) continue
    const img = new Image(); img.decoding = 'sync'; img.src = BASE_URL + f
    if (img.decode) img.decode().catch(() => {})                         // force decode ล่วงหน้า
    preloadedImgs.push(img)
  }
  // ฟอนต์เลขดาเมจ (Lilita One) เบราว์เซอร์โหลดแบบ lazy = ตอนมีตัวหนังสือใช้จริงครั้งแรก
  // ⇒ เลขแรกของเซสชันขึ้นฟอนต์สำรองแล้วสลับกลางอนิเมชัน · สั่งโหลดตอน intro แทน
  try { document.fonts?.load('1em "Lilita One"', '-0123456789+').catch(() => {}) } catch { /* บางเครื่องไม่มี FontFaceSet */ }
}
function reset() {
  gen++                                                                     // ยกเลิก promise chain ค้างทุกตัว (applyAttack/step เช็ค gen ทุกจุด)
  prefs.value = readPrefs()     // อ่านใหม่ทุกไฟต์ — พาเนล Admin เปลี่ยนค่าแล้วยิงไฟต์ทดสอบต้องเห็นผลทันที
  clearTimeout(timer); clearTimeout(introTimer)
  clearTimeout(resultTimer); resultOpen.value = false; resultReady.value = false
  clearPending()                                                            // ตัด wait()/later()/nextFrame() ที่ค้างอยู่ทั้งหมด (windup/motion/hitstop/flash)
  stepGen = -1                                                              // ไม่มี chain ของ gen ใหม่วิ่งอยู่ (chain เก่าคนละ gen แล้ว ปลดตัวเองไม่ได้ — ดู step())
  introPhase.value = null                                                   // กันค้างตอน replay ใหม่
  Object.values(els).forEach(el => { if (el) { el.style.transform = ''; el.style.transition = ''; el.style.zIndex = '' } })  // ล้าง lunge ค้างจากไฟต์ก่อน (component ถูก mount ค้างไว้ ใช้ซ้ำ)
  clearHighlights()                                                         // ล้างคลาส windup/acting/flash ค้าง
  idx.value = 0; round.value = 1
  paused.value = false; inspectUid.value = null; pausedBeforeInspect = false; clearSpot(); clearChips()
  ffActive.value = false; holdHint.value = false                             // เคลียร์โหมดเร่ง/คำใบ้ค้างจากไฟต์ก่อน
  clearTimeout(holdTimer); clearTimeout(hintTimer)
  const h = {}; Object.keys(maxHp).forEach(uid => { h[uid] = 100 }); hp.value = h
  clearHpTicks()                                                             // ล้างเลข HP ไล่นับ/กระพริบค้างจากไฟต์ก่อน (tuning.hpTick)
  skillCount.value = {}                                                      // ล้างตัวนับสกิลติดไฟค้างจากไฟต์ก่อน (tuning.skillMark)
  Object.keys(maxHp).forEach(setDead)                                       // ทุกตัว hp=100 → setDead ถอด class dead ค้างจากไฟต์ก่อน
  // fx: DOM ของ .br-box/.br-fx-layer ต้องพร้อมก่อน attach — รอ nextTick (ครั้งแรกอาจยัง mount ไม่เสร็จตอน watch immediate ยิง)
  nextTick(() => { ensureFx(); fx?.reset() })                              // reset() ภายใน fx = invalidateCenters + cancelAll (ยกเลิก pop/callout/projectile ค้าง)
  runIntro()
  // log ว่าง = done ค้าง true ตั้งแต่แรก → watch(done) ไม่ยิงซ้ำ ต้องเปิดสรุปเองไม่งั้น overlay ไม่มีทางออก
  if (done.value) { resultReady.value = true; resultOpen.value = true }
  startFps()   // รีเซ็ตตัวนับ fps ทุกไฟต์ใหม่ (ไม่งั้นไฟต์ที่ 2+ ในพาเนล Admin จะสะสมทับไฟต์ก่อนหน้า)
}

// intro ก่อนเริ่มเล่น log (แตะข้ามได้) — มีป้ายชื่อสองฝั่ง (สนามประลอง/ท้าสู้) = ฉาก VS · หอคอย = READY?→GO!
function runIntro() {
  if (props.data?.sides && arenas.value.top !== 'tower') {
    introPhase.value = 'vs'
    introTimer = setTimeout(() => { introPhase.value = null; step() }, 1150)
    return
  }
  introPhase.value = 'ready'
  introTimer = setTimeout(() => {
    introPhase.value = 'go'
    introTimer = setTimeout(() => { introPhase.value = null; step() }, 400)
  }, 700)
}
function skipIntro() {
  if (introPhase.value === null) return
  clearTimeout(introTimer)
  introPhase.value = null
  step()
}

// ── ตำแหน่ง/การเคลื่อนไหว ──
// centers cache ย้ายไป fx pool (battleFx.js createBattleFx().centerOf) — ใช้ fx.centerOf(uid) แทน
function entryForUid(uid) {
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  return arr?.[parseInt(uid.slice(1), 10)] || null
}
function defForUid(uid) {
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  return getPetDef(arr?.[i]?.id) || { emoji: '❓' }
}
// ── event dispatch — เพิ่ม handler ใหม่ที่นี่ (passive/heal/…) ──
const handlers = {
  round(e) { round.value = e.n },
  attack(e) { return applyAttack(e) },
  // ตัวที่รอดมาด้วยเลือด ≤25% ไม่เคยถูกสั่งปิดวงแหวน (dangerRing(uid,false) เรียกเฉพาะตอนตาย)
  // → เดิมวงแหวน iterations:Infinity เต้นค้างผ่านหน้าสรุป/ตอน peek ยาวจนกว่าจะ reset() (§5.2 บอกให้ปิดตอนจบไฟต์)
  end() { clearHighlights(); fx?.dangerClearAll() },
  // passive — ชั้นมาจาก battleBeats (spotlight/glance/openShow/mute) · เวลาเดินในตัว handler เอง
  passive(e) { return applyPassive(e) },
}

/** คำอธิบายสกิลของ event นี้ · ป้าย duo (รางวัลคนเก่ง) ไม่ใช่สกิลประจำตัวใคร → คืนค่าว่าง โชว์แค่ชื่อ
 *  🔑 เทียบกับ `e.name` ซึ่งเป็น "ชื่อจริง" ที่ log แบกมา ไม่ใช่ชื่อบนจอ (skillTitle) — ชื่อร่วมของคู่หู
 *     เป็นของฝั่งจอล้วน ถ้าเอามาเทียบตรงนี้ คำอธิบายของ 🦭 กับ 🐳 จะหายทันทีที่จับคู่ */
function passiveDescOf(e) {
  const p = passiveOf(defForUid(e.uid))
  return p && p.name === e.name ? passiveText(p) : ''
}

// ── ชื่อสกิลบนจอ (ชื่อร่วมของคู่หู) ──────────────────────────
// ทีมของแต่ละฝั่งคงที่ทั้งไฟต์ ⇒ คำนวณครั้งเดียวพอ · ตายแล้วยังนับ (ชื่อไม่ควรเปลี่ยนกลางไฟต์)
const teamIds = computed(() => ({
  A: new Set((props.data?.playerTeam || []).filter(Boolean).map(p => p.id)),
  B: new Set((props.data?.botTeam || []).filter(Boolean).map(p => p.id)),
}))
/** ชื่อที่ควรพิมพ์บนชิป/แบนเนอร์ของ event นี้ (log ยังแบกชื่อจริงไว้เสมอ) */
function skillTitle(e) {
  return passiveTitle(e.name || 'ทักษะเฉพาะ', e.petId, teamIds.value[e.side] || null)
}

// ── ประกาศสกิล: "หยุดที่เหตุ ปล่อยผลไหลตาม" (จังหวะที่ user ออกแบบเอง 28 ส.ค.) ──
//
//     0ms  ชิปชื่อสกิลเด้งขึ้นบนการ์ด            ◀ ไฟต์หยุด
//   200ms  ★ ไฟต์เดินต่อทันที — beat ถัดไปเริ่มเงื้อ
//          │ ชิปเริ่มเลือน (CHIP_OUT_MS)        ┐ ทั้งคู่วิ่งทับ beat ถัดไป
//          │ ผลของสกิลลง (เลข +N / ประกาย)      ┘ ไม่ถ่วงเวลาอะไรเลย
//
// 🔑 ตัวที่ทำให้มันไหลได้คือ "ไม่ await ตอน fade" — พอครบ hold แล้ว return ทันที
//
//   skillMoment → หรี่ฉาก + แบนเนอร์ + ผลลงทีหลัง (revive/cheatDeath/saveAlly เท่านั้น)
//   skill       → ครั้งแรกของสกิลนั้นในไฟต์: หยุด SKILL_PAUSE แล้วปล่อยไหล
//   skillQuiet  → ครั้งซ้ำ: ผลอย่างเดียว 0ms (ประกาศชื่อไปแล้วครั้งแรก)
//   openQuiet   → ยกแรก part ที่ไม่ใช่ใบท้ายของเพ็ทตัวนั้น: พักผลไว้ 0ms
//   openShow    → ยกแรก โชว์ไทม์ของเพ็ททีละตัว: แบนเนอร์หน้าเพ็ท+ชื่อสกิล+ผลสั้นๆ + เสียงของสกิล แล้วผลของทั้งก้อนลง
async function applyPassive(e) {
  if (!e?.uid) return
  const g = gen
  const t = scaleTiming(e, { pace: pace.value, ff: ffActive.value })

  if (e.kind === 'skillMoment') {
    if (LEGEND_SFX[e.petId]) sfx(LEGEND_SFX[e.petId])      // 🐦‍🔥 เกิดใหม่ ฯลฯ
    await spotlightPassive(e, t, g); return
  }
  if (e.kind === 'skillShow') {
    sfx(LEGEND_SFX[e.petId] || 'skill')
    const pet = defForUid(e.uid)
    const p = passiveOf(pet)
    await spotlightPassive(e, t, g, {
      icon: pet.emoji || e.icon || '✨',
      desc: p && p.name === e.name ? effectText(p, entryForUid(e.uid)?.passiveLv) : '',
      side: e.uid[0],
    })
    return
  }

  const hold = t.windup + t.motion + t.hitstop + t.tail

  if (e.kind === 'openQuiet') { openEvents.push(e); return }   // ผลลงพร้อมโชว์ของเพ็ทตัวเดียวกัน
  if (e.kind === 'openShow') {
    const chunk = openEvents.splice(0)
    const parts = [...chunk, e]
    openSfx(e)
    const pet = defForUid(e.uid)
    const lv = entryForUid(e.uid)?.passiveLv
    const p = passiveOf(pet)
    await spotlightPassive(e, t, g, {
      icon: pet.emoji || e.icon || '✨',
      desc: p && p.name === e.name ? effectText(p, lv) : '',
      side: e.uid[0],
      fire: () => parts.forEach(firePassiveFx),
    })
    return
  }

  if (e.kind === 'skill') {
    markSkill(e.uid)          // tuning.skillMark 'lit' — นับครั้งที่โปรกของสกิลนี้
    showChip(e.uid, e)
    sfx('skill')
    if (hold > 0) { await wait(hold); if (g !== gen) return }
    // ★ ไม่ await สองบรรทัดนี้ — ชิปเลือนและผลลง ทับ beat ถัดไปได้เลย
    hideChip(e.uid)
    firePassiveFx(e)
    return
  }

  // skillQuiet (ครั้งซ้ำ) — ผลอย่างเดียว ไม่มีชิป ไม่กินเวลา
  markSkill(e.uid)            // tuning.skillMark 'lit' — นับซ้ำด้วย (ตัวเลข ×N ต้องรวมครั้งซ้ำ)
  firePassiveFx(e)
}

// ── เสียงสกิลเปิดไฟต์ ── โชว์ทีละตัวแล้ว แต่ละตัวได้เสียงของตัวเอง (🦁 ครบ 3 สาย = คำราม)
const OPEN_SFX = {
  elementTrinity: 'roar', aoeOpener: 'dragon_roar', teamCrit: 'open_crit', teamHp: 'open_hp', teamLifesteal: 'open_drain',
  teamDamageReduction: 'open_wall', enemyVuln: 'curse',
}
function openSfx(e) {
  if (LEGEND_SFX[e.petId]) return sfx(LEGEND_SFX[e.petId])
  sfx(OPEN_SFX[e.effect] || (e.fxKind === 'debuff' ? 'curse' : e.fxKind === 'damage' ? 'p_fire' : 'aura'))
}

// ── ชิปชื่อสกิลเกาะบนการ์ด ──
// ⚠️ ใช้ชิปแทนป้ายลอย (fx.banner) เพราะป้ายลอยใช้พูลแค่ 2 ช่อง แล้วถูกยึดไปโผล่ผิดการ์ด
//    (อาการเดียวกับเลขดาเมจที่ user รายงานว่า "ป้ายขึ้นมั่ว") · ชิปผูกกับการ์ดตรงๆ ไม่มีพูลให้ยึด
const chipOn = ref({})            // uid → { name, icon, out }
const openEvents = []             // event ยกแรก (openQuiet) ที่รอลงผลพร้อมโชว์ของเพ็ทตัวเดียวกัน
const CHIP_OUT_MS = 300

// tuning.skillMark 'lit': ไอคอนมุมการ์ดขยาย + ×N เมื่อสกิลของใบนั้นโปรก (ค้างทั้งไฟต์ = อ่านย้อนได้)
const skillCount = ref({})       // uid → จำนวนครั้งที่โปรก
function markSkill(uid) {
  if ((tuning.value.skillMark || 'lit') !== 'lit' || !uid) return   // ดีฟอลต์ lit (user เลือก) · แล็บส่ง 'dot' ได้
  skillCount.value = { ...skillCount.value, [uid]: (skillCount.value[uid] || 0) + 1 }
}

function showChip(uid, e) {
  chipOn.value = { ...chipOn.value, [uid]: { name: skillTitle(e), icon: e.icon || '✨', out: false } }
}
function hideChip(uid) {
  const cur = chipOn.value[uid]; if (!cur) return
  chipOn.value = { ...chipOn.value, [uid]: { ...cur, out: true } }
  // ถอดออกจาก DOM หลังอนิเมชันจางจบ — later() ผูกกับ pendingTimers จึงถูกล้างตอน reset เสมอ
  later(() => {
    const now = chipOn.value[uid]
    if (!now || !now.out) return          // มีชิปใหม่ขึ้นมาทับแล้ว อย่าไปลบของใหม่
    const next = { ...chipOn.value }; delete next[uid]
    chipOn.value = next
  }, CHIP_OUT_MS)
}
function clearChips() { chipOn.value = {}; openEvents.length = 0 }

function clearSpot(uid) {
  spot.value = null
  spotOut.value = false
  if (uid) highlight(uid, 'spotlit', false)
  else Object.values(els).forEach(el => el && el.classList.remove('spotlit'))
}

/** ไทม์ไลน์สปอตไลต์: หรี่ฉาก+แบนเนอร์เข้า (windup) → ค้างอ่าน (hitstop) → ผลลง+แบนเนอร์ออก (tail) */
// opts (ยกแรก): icon = หน้าเพ็ท · desc = ผลสั้น (เลขตามเลเวลจริง) · side = 'A'|'B' (สีแบนเนอร์) · fire = ลงผลทั้งก้อน
async function spotlightPassive(e, t, g, opts = {}) {
  spotStyle.value = {
    '--spot-delay': `${Math.round(t.windup * 0.43)}ms`,
    '--spot-in': `${Math.round(t.windup * 0.57)}ms`,
    '--spot-out': `${Math.round(t.tail) || 1}ms`,
  }
  spot.value = {
    face: defForUid(e.uid)?.emoji || opts.icon || '✨',       // หน้าเจ้าของสกิลทุกครั้ง (เดิมมีแค่ยกแรก)
    skillIcon: e.icon || null, name: skillTitle(e),
    desc: opts.desc ?? passiveDescOf(e), side: opts.side || e.uid?.[0] || 'A',
  }
  spotOut.value = false
  highlight(e.uid, 'spotlit')
  await wait(t.windup + t.motion); if (g !== gen) return clearSpot(e.uid)
  await wait(t.hitstop); if (g !== gen) return clearSpot(e.uid)
  // ── เฟสผล: แบนเนอร์เริ่มเลื่อนออกพร้อมกับที่ผลลงจริง ──
  // ⚠️ หลอดเลือด/เลขเด้ง ต้องอยู่ตรงนี้เท่านั้น ห้ามไปอัปตั้งแต่ต้นฟังก์ชัน
  //    ไม่งั้นเลือดจะขยับตั้งแต่แบนเนอร์ยังไม่ทันขึ้น = คนดูเห็น "ผล" ก่อน "เหตุ" ซึ่งเป็นสิ่งที่ฟีเจอร์นี้ตั้งใจแก้
  spotOut.value = true
  markSkill(e.uid)     // tuning.skillMark 'lit' — นับครั้งเดียวต่อการโชว์ แม้ opts.fire ลงหลายผลของ uid เดียวกัน (openShow ก้อนเดียว)
  if (opts.fire) opts.fire(); else firePassiveFx(e)   // ป้ายเล็กเหนือหัวไม่ต้องแล้ว — แบนเนอร์ใหญ่ทำหน้าที่นั้นไปแล้ว
  await wait(t.tail); if (g !== gen) return clearSpot(e.uid)
  clearSpot(e.uid)
}

// FX ของ passive: ป้ายชื่อเหนือหัว + ประกายตามชนิดผล + ขยับหลอดเลือด
// ⚠️ ห้าม await อะไรในนี้ — ตัวเดินเวลาคือ applyPassive/spotlightPassive
// ป้ายชื่อไม่ได้อยู่ในนี้แล้ว — ชิปบนการ์ด (showChip) ทำหน้าที่นั้นแทน
function firePassiveFx(e) {
  const on = Array.isArray(e.targets) && e.targets.length ? e.targets : [e.uid]

  // ── หลอดเลือด: ฮีล/ฟื้น/รับแทน ทำให้เลือดเปลี่ยนโดยไม่มี attack event
  //    ถ้าไม่อัปเดตตรงนี้ หลอดจะค้างค่าเดิมทั้งที่เลขเด้งขึ้นแล้ว (ผู้เล่นเห็นขัดกันทันที)
  if (typeof e.hpPct === 'number' && on[0]) hp.value = { ...hp.value, [on[0]]: e.hpPct }
  if (e.guardUid && typeof e.guardHpPct === 'number') hp.value = { ...hp.value, [e.guardUid]: e.guardHpPct }
  // เลขเขียว +N ที่ตัวที่ได้รับ — ใช้เลือดจริงที่ฟื้นได้ ไม่ใช่ % ของสูตร
  // ⚠️ อ่าน fxKind (ชนิดผล) ไม่ใช่ kind — kind ของ beat คือ "เวลา" (skill/skillQuiet/openGroup/…)
  //    ทับชนิดผลไปตั้งแต่ f32b519 ⇒ ทั้งบล็อกนี้เงียบสนิท (user: "ตอนฮีล เลขไม่ขึ้น")
  if ((e.fxKind === 'heal' || e.fxKind === 'revive') && e.amount > 0) {
    fx?.pop(on[0], { dmg: e.amount, heal: true, weight: 0.45 })
  }

  // ชั้นเชื้อ — ป้ายค้างบนการ์ด "เป้า" อยู่ชั้น FX ไม่ใช่ในการ์ด (การ์ดต้อง static ตลอดไฟต์)
  // event ทั้งตอนแปะและตอนย้ายเชื้อส่ง amount = ชั้นสะสมของเป้าหลังเหตุการณ์นั้น
  if (e.effect === 'infect' || e.effect === 'infectSpread') {
    for (const t of on) fx?.stateMark(t, '🦠', e.amount || 0)
    sfx('virus')
  }

  const PSFX = { heal: 'p_heal', revive: 'p_revive', guard: 'p_guard', armor: 'p_guard', save: 'p_save', dodge: 'p_dodge',
    thorns: 'p_thorns', damage: 'p_fire', cleave: 'p_cleave', buff: 'p_buff', chain: 'p_chain', aim: 'p_aim' }
  // เสียงประจำสกิล (สัตว์ใหญ่) ทับเสียงกลางตาม fxKind
  // 🐉 ไฟลงจริงมีเสียงพ่นไฟของตัวเอง · 🐦‍🔥 เสียงเกิดใหม่ดังตอนแบนเนอร์แล้ว ไม่ซ้อนเสียงกลาง
  // (เลเจนด์ตัวอื่นเสียงประจำตัวดังตอนโชว์ไทม์ — ตอนผลลงใช้เสียงกลางตาม fxKind เป็นฟีดแบ็กสั้นๆ)
  const SIG = { aoeOpener: 'dragon_breath' }
  if (SIG[e.effect]) sfx(SIG[e.effect])
  else if (e.fxKind === 'revive' && LEGEND_SFX[e.petId]) { /* เสียงเกิดใหม่ดังไปแล้ว */ }
  else if (PSFX[e.fxKind]) sfx(PSFX[e.fxKind])
  switch (e.fxKind) {
    case 'damage':  fx?.sweep(on, e.icon, 60); break        // bahamut สาดไฟใส่ทุกตัว
    case 'cleave':  fx?.sweep(on, e.icon, 45); break        // เขี้ยว/เปลวไฟลงหลายใบในจังหวะเดียว
    case 'heal':    fx?.sweep(on, '✨', 70); break
    case 'guard':   fx?.ring(e.uid, 'windup', 320); break
    // armorStack — วงแหวนกันหมัดชุดเดียวกับ guard (ผู้เล่นอ่านทั้งคู่ว่า "หมัดนี้ไม่เข้า") แต่แยก fxKind
    // เพราะหน่วยของ amount คนละเรื่องกัน (ที่นี่ = ดาเมจสะท้อน, ของ guard = ดาเมจที่รับแทน) ·
    // ตัวก้อนสะท้อนมี attack event sub ตามมาติดๆ เล่าให้อยู่แล้ว จึงไม่ต้องยิง FX ซ้ำที่นี่
    case 'armor':   fx?.ring(e.uid, 'windup', 320); break
    case 'revive':  fx?.sweep(on, e.icon, 0); break
    case 'save':    fx?.sweep(on, '🛡️', 0); break
    case 'thorns':  fx?.sweep(on, e.icon, 0); break
    case 'dodge':   fx?.callout(e.uid, 'weak'); break        // ใช้ป้ายเทาเดิม = "ไม่โดน"
    case 'chain':
    case 'buff':    fx?.ring(e.uid, 'windup', 260); break
    case 'aim':     fx?.ring(e.uid, 'windup', 200); break
    case 'aura':    break                                    // ตอนเริ่มไฟต์มีป้ายหลายอันพร้อมกัน ยิงประกายด้วยจะรกและหนัก
    case 'reduce':  break                                    // ป้ายชื่ออย่างเดียวพอ ไม่งั้นรกทุกหมัด
    default: break
  }
}

// เวลามาตรฐานของอนิเมชันการ์ดเป้าตามสเปก (§4 ชั้น 3–4) — postMs ใช้เป็น "เพดาน" ไม่ใช่ตัวค่าเอง
// เหตุที่เคยเอา postMs มาเป็นค่าตรงๆ คือกันอนิเมชันล้นออกนอก beat ตัวเอง ซึ่งเป็นเหตุผลของ "เพดาน" ไม่ใช่ "ค่าแทน"
// ปล่อยตามเดิม heavy ได้ 850ms / finish ได้ 1320ms — บีบ-ดีดกลับยาว 1.3 วิ อ่านเป็น "เนือย" ไม่ใช่ "หนัก"
const SQUASH_MS = 300          // เพดานอนิเมชันการ์ดเป้า (งบจริงมาจาก beat ผ่าน Math.min)
const KO_MS = 520
const FLASH_MS = 250            // อายุสูงสุดของกรอบแดงตอนโดน (เมื่อไม่มีอนิเมชันการ์ดให้ผูกอายุด้วย)
const FRAME_MS = 17             // งบ 1 เฟรมที่เลื่อนอนิเมชันการ์ดออกไป (ดู applyImpact) — ต้องหักจากงบเวลาที่เหลือของ beat

// impact: hp/pop/callout/burst/ko ตอนโดนตี — รับ g เช็ค gen กัน reset ระหว่างพุ่งมาเขียน state เก่าทับ
// t = scaled timing ของ beat นี้ (จาก applyAttack) — postMs = เวลาที่ beat นี้ยังเหลืออยู่หลัง impact
//
// ⚠️ ลำดับสำคัญมาก (สองข้อบังคับที่ต้องเป็นจริงพร้อมกัน):
//   1) หลอดเลือด/เลข/หลอดผี (Vue patch) ต้องลง "ก่อน" อนิเมชันการ์ดเป้าเริ่ม — ไม่งั้น patch + หลอดผี transition 450ms
//      + fx.shake() ที่ขยับ .br-box (บรรพบุรุษร่วม) จะซ้อนอยู่ในอนิเมชันการ์ดเดียวกัน = เฟรมแพงที่สุดของทั้งฟีเจอร์
//      และเกิดทุกหมัด heavy/finish → เลื่อนอนิเมชันการ์ดไป 1 เฟรม (nextFrame) ให้เพนต์ของ patch ลงจอก่อน
//   2) คลาส dead ต้องลง "ก่อน" ko() เริ่ม ไม่ใช่ระหว่างที่มันวิ่ง (ข้อบังคับ v3) — จึงย้ายไปอยู่ต้น nextFrame
//      ติดกับ ko() ในทาสก์เดียวกัน · ใส่เร็วกว่านั้นไม่ได้ เพราะ .dead { opacity:.25 } จะถูกเพนต์ 1 เฟรม
//      แล้วเฟรมแรกของ ko (opacity 1) เด้งกลับ = การ์ดกะพริบ
// เลือดยังหดที่จังหวะ impact เป๊ะเหมือนเดิม เลื่อนแค่อนิเมชันการ์ด ~17ms ซึ่งมองไม่ออก
function applyImpact(beat, g, t) {
  if (g !== gen) return
  const tgtEl = els[beat.target]
  const postMs = Math.round(t.hitstop + t.tail)   // ช่วงหลังโดน = เวลาที่เหลือของ beat นี้
  const cardMs = Math.max(0, postMs - FRAME_MS)   // งบของอนิเมชันการ์ดเป้า (หัก 1 เฟรมที่เลื่อนไป)
  const flashOff = () => { if (g === gen) highlight(beat.target, 'flash', false) }

  // ── 1) paint บนการ์ดเป้า + Vue patch ลงให้ครบก่อน (ยังไม่มีอนิเมชันการ์ดวิ่งตอนนี้) ──
  highlight(beat.target, 'flash')
  const hpBefore = shownHp(beat.target)   // โดนซ้ำกลางการไล่นับ = นับต่อจากเลขที่เห็นอยู่ ไม่กระโดด
  hp.value = { ...hp.value, [beat.target]: Math.max(0, Math.round((beat.targetHpAfter / (maxHp[beat.target] || 1)) * 100)) }
  tickHp(beat.target, hpBefore)

  // ── 2) ของที่ไม่ได้แตะการ์ดเป้า ยิงที่จังหวะ impact ตรงๆ (จังหวะที่คนดูรู้สึกว่า "โดน") ──
  //
  // 🔒 switch ที่ทุกกิ่งเขียนครบ ไม่มี else เปล่ารับของที่หลุดมา
  //    ⚠️ ของเดิมเป็น if/else chain ปลายทาง `else { burst(92); shake(8,3) }` แล้ว tier=null
  //       ของหมัดลูก cleave/multiStrike ตกมาที่นั่น ⇒ ได้เอฟเฟกต์ระดับหมัดปิดเกม
  //       **เฉลี่ย 11.5 ครั้ง/ไฟต์ สูงสุด 16** ยิงที่ 0ms รัวติดกัน — นี่คือ "ตีแรงบ้าง" ที่ user เจอ
  //    ถ้าวันหลังเพิ่ม kind ใหม่แล้วลืมเขียนกิ่ง จะได้ default (เงียบ) ซึ่งปลอดภัย ไม่ใช่ดังสุด
  const spark = sparkOf(defForUid(beat.attacker))
  const w = beat.weight ?? 0
  // เสียงหมัดตามสายของผู้ตี (fist ทุบ · scissors ฟัน · paper ปัด) · ปิดเกม/น็อกซ้อนเสียงหนักอีกชั้น
  const elem = defForUid(beat.attacker)?.element
  if (beat.kind === 'sub') sfx('hit_sub')
  else if (!beat.silent) sfx(['fist', 'scissors', 'paper'].includes(elem) ? 'hit_' + elem : 'hit_fist', { w, crit: beat.crit })
  if (beat.kind === 'finish') sfx('boom')
  else if (beat.kill) sfx('ko')
  if (beat.eff === 'super') sfx('super')
  switch (beat.kind) {
    case 'finish':
      fx?.burst(beat.target, 92, spark); fx?.shake('finish'); break
    case 'ko':
      fx?.burst(beat.target, 66, spark); fx?.shake('ko'); break
    case 'hit':
      // ขนาดดาวไล่ต่อเนื่องตามความแรงจริง — ไม่มีขั้นบันไดตามชั้นอีกแล้ว · ไม่สั่นจอ
      fx?.burst(beat.target, Math.round(26 + w * 42), spark); break
    case 'sub':
      // หมัดลูกอยู่ในหมัดหลักที่กำลังพุ่งอยู่ — ประกายเล็กพอ ห้ามสั่นจอเด็ดขาด
      fx?.burst(beat.target, Math.round(22 + w * 24), spark); break
    default:
      break
  }

  // ── ดาเมจเชื้อ 🦠 แยกเลขออกจากหมัดหลัก (user สั่ง 11 ก.ย. "ให้เห็นว่าสกิลมันแสดงผลแน่") ──
  // เลือดที่หายจริงของหมัดนี้ = หมัดหลัก + เชื้อทุกชั้นรวมกัน (เอนจินหัก pierce ต่อจาก dmg ในหมัดเดียว)
  // ⇒ เลขหลักต้อง **หัก** ส่วนของเชื้อออก ไม่งั้นผลรวมบนจอมากกว่าที่หลอดเลือดหายจริง ยิ่งชั้นเยอะยิ่งเพี้ยน
  const infHits = Array.isArray(beat.pierceHits) ? beat.pierceHits : []
  const infSum = infHits.reduce((s, n) => s + n, 0)
  const mainDmg = Math.max(0, (beat.dmg || 0) - infSum)

  // ใบการตายเงียบ (หนาม/guardian/aoeOpener — ดู battleEngine.resolveSilentDeath) ไม่มีดาเมจของตัวเอง
  // โดยตั้งใจ (dmg: 0 คือค่าคงที่ที่หน้าสรุปพึ่งอยู่) ⇒ เด้ง "-0" ลอยบนจอจะเป็นขยะล้วน
  // ประกายน็อก + หลอดเลือดลง 0 + การ์ดจางเทา ยังทำงานครบตามปกติจาก beat.kill/targetHpAfter
  // เหตุผลเดียวกันกับหมัดที่ถูกหลบจนเหลือแต่เชื้อ (dodge ไม่กันเชื้อ) — เลขหลักเป็น 0 ก็ไม่ต้องเด้ง
  if (!beat.silent && (mainDmg > 0 || !infSum)) fx?.pop(beat.target, { dmg: mainDmg, crit: beat.crit, eff: beat.eff, weight: w })
  // เด้งไล่ทีละชั้น 90ms ให้ตาอ่านได้ว่า "3 ชั้น = 3 ก้อน" — later() ผูก pendingTimers จึงถูกล้างตอน reset เสมอ
  // (เช็ค gen ซ้ำอีกชั้นกันไฟต์ใหม่ที่เริ่มก่อน timer ครบ)
  infHits.forEach((n, k) => {
    if (n > 0) later(() => { if (g === gen) { fx?.pop(beat.target, { dmg: n, infect: true, weight: 0.12 }); sfx('virus_tick') } }, 90 * (k + 1))
  })
  if (beat.eff === 'super' || beat.eff === 'weak') fx?.callout(beat.target, beat.eff)
  if (beat.kill) fx?.dangerRing(beat.target, false)
  else {
    if (beat.danger) fx?.dangerRing(beat.target, true)
    if (beat.survive) fx?.callout(beat.target, 'survive')
  }

  // ── 3) อนิเมชันการ์ดเป้า ──
  // beat.kill ตัด squashTarget ทิ้งเสมอ เพราะ ko() ครอบการ์ดใบเดียวกันแล้ว
  // — ยิง animate() 2 ครั้งบนการ์ดใบเดียวกันผิดกฎ "1 หมัด 1 animation/การ์ด" (ข้อบังคับ v3)
  // หมัดลูก (sub) ไม่มีงบเวลาของตัวเอง (cardMs = 0) → ไม่ต้องแตะการ์ดเลย
  const wantsCardAnim = beat.kill || (beat.kind !== 'sub' && (fx ? fx.targetReacts(beat.kind) : true))
  if (!wantsCardAnim) {
    setDead(beat.target)                        // ไม่มีอนิเมชันการ์ดตามมา = ใส่ได้เลย (ปกติ no-op เพราะยังไม่ตาย)
    later(flashOff, Math.min(FLASH_MS, Math.max(postMs, 120)))
    return
  }
  const myIdx = idx.value                       // beat ที่กำลังเล่นอยู่ตอนนี้ (idx ขยับตอนจบ beat เท่านั้น)
  nextFrame(() => {
    if (g !== gen) return                       // reset/ไฟต์ใหม่แทรกระหว่างรอเฟรม
    setDead(beat.target)                        // ต้องอยู่ตรงนี้เท่านั้น — ก่อน animate() และไม่เร็วกว่านั้น
    // ⚠️ rAF หยุดสนิทเมื่อแท็บถูกพับไปหลัง แต่ setTimeout ยังเดิน → กลับมาแล้วเฟรมนี้อาจมาช้าไปหลาย beat
    if (idx.value !== myIdx) { flashOff(); return }
    let targetAnim = null                       // null = ไม่มีอนิเมชันจริง (preset ปิด/ไม่มี el)
    // ตายแล้วป้ายสถานะค้างต้องหายไปกับการ์ด (เชื้อที่เหลือถูกโยนไปโฮสต์ใหม่ผ่าน event ของตัวเองอยู่แล้ว)
    if (beat.kill) { fx?.stateMark(beat.target, '🦠', 0); targetAnim = fx?.ko(beat.target, tgtEl, Math.min(KO_MS, cardMs)) }
    else targetAnim = fx?.squashTarget(tgtEl, beat.kind, w, Math.min(SQUASH_MS, cardMs), beat.attacker, beat.target)
    if (targetAnim) targetAnim.then(flashOff)
    else later(flashOff, Math.min(FLASH_MS, Math.max(cardMs, 120)))
  })
}

// windup → motion → impact → hitstop → tail ตาม beat.timing
// การ์ดพุ่ง = 1 animation ครอบทั้ง beat (ยิงแล้วไม่ await — เราเดินเวลาด้วย wait() แยก) ตามข้อบังคับ v3
async function applyAttack(beat) {
  const g = gen
  const t = scaleTiming(beat, { pace: pace.value, ff: ffActive.value })
  const def = defForUid(beat.attacker)
  // ⚠️ ตอนนี้ atkStyleOf() คืน 'melee' เสมอ ⇒ ranged เป็น false ตลอด — สาขา ranged ด้านล่าง "หลับ" อยู่
  const ranged = atkStyleOf(def) === 'ranged'
  const w = beat.weight ?? 0

  // หมัดลูก: ไม่มีงบเวลาของตัวเอง (อยู่ในหมัดหลักที่กำลังพุ่งอยู่) → ลง impact แล้วออกทันที
  if (beat.kind === 'sub') { applyImpact(beat, g, t); return }

  const doLunge = () => { if (!ranged) fx?.lunge(els[beat.attacker], beat.attacker, beat.target, t, beat.kind, w) }

  if (t.windup > 0) {
    highlight(beat.attacker, 'windup')                       // เปลี่ยน class ให้เสร็จ "ก่อน" สั่ง animate (ข้อบังคับ v3)
    fx?.ring(beat.attacker, 'windup', t.windup)
    doLunge()
    await wait(t.windup); if (g !== gen) return
    highlight(beat.attacker, 'windup', false)
  } else {
    doLunge()
  }
  // ⚠️ จุดสลับคลาส windup → acting นี้อยู่ "กลาง" fx.lunge() ที่ยังพุ่งอยู่บนการ์ดใบเดียวกัน
  // ปลอดภัยได้เพราะ .windup กับ .acting ตั้ง border-color ค่าเดียวกัน (#fde68a) เป๊ะ = ไม่มี paint เปลี่ยนจริง
  // ⛔ วันไหนแยกสีสองคลาสนี้ = เปลี่ยน paint ระหว่างการ์ดมี animation วิ่ง = ผิดข้อบังคับ v3 ทันที
  highlight(beat.attacker, 'acting')

  if (ranged) fx?.projectile(beat.attacker, beat.target, projectileOf(def), t.motion)

  await wait(t.motion); if (g !== gen) return
  applyImpact(beat, g, t)
  await wait(t.hitstop); if (g !== gen) return
  // acting ถอดหลัง tail เท่านั้น — fx.lunge() ยังพุ่งอยู่ตลอด windup+motion+hitstop+tail (1 animation ครอบทั้ง beat)
  await wait(t.tail); if (g !== gen) return
  highlight(beat.attacker, 'acting', false)
}

// ── กันเปิด beat chain ซ้อนกัน 2 สาย ──
// step() เช็ค paused แค่ตอนต้น พอเข้าไปใน await h(b) แล้ว beat ที่กำลังเล่นจะเล่นจนจบเสมอ
// ถ้าคนกด "พัก" แล้วกด "เล่น" ก่อน beat นั้นจบ togglePause จะเรียก step() ทั้งที่ idx ยังไม่ขยับ
// → beat เดิมเล่นซ้ำพร้อมกันอีกสาย: lunge 2 ตัวบนการ์ดผู้ตีใบเดียว (เคสต้องห้ามตรงๆ), squash/ko ซ้อน,
//   เลขดาเมจเด้ง 2 ที, idx เพิ่ม 2 ครั้ง (beat หายไปเงียบๆ 1 อัน) และทั้งสองสายแย่ง timer ตัวเดียวกัน
// เลือกใช้ re-entrancy guard ที่ต้นทาง (ไม่ใช่ให้ applyAttack คอยดู paused ทุกเฟส) เพราะ
//   ก) กันได้ทุกทางเข้า — togglePause, skipIntro, timer ของ step เอง ไม่ใช่เฉพาะ pause
//   ข) ไม่ต้องแตะ applyAttack ซึ่งเป็นที่อยู่ของ "1 animation ครอบทั้ง beat" — หยุดกลางคันคือแตกสัญญาข้อนั้น
// guard ผูกกับ gen ไม่ใช่ boolean เปล่า: chain เก่าที่โดน reset ตัดกลางทาง (wait() ถูก clear แล้วไม่ resolve ตลอดกาล)
// จะไม่ล็อกไฟต์ใหม่ไว้ และถ้ามันฟื้นมาทีหลังก็ปลด guard ของ gen ใหม่ไม่ได้ — gen guard ชนะเสมอ (stepGen ประกาศไว้ด้านบน)
async function step() {
  const g = gen
  if (stepGen === g) return          // มี chain ของ gen นี้วิ่งอยู่แล้ว
  clearTimeout(timer)
  if (paused.value) return
  if (idx.value >= beats.value.length) { clearHighlights(); return }
  stepGen = g
  try {
    const b = beats.value[idx.value]
    // สกิลเปลี่ยนสเตตัสจริง → เลขบนการ์ดขยับตรงนี้ให้ผู้เล่นเห็น
    // (aura เล่นในกลุ่มเปิดตอนไม่มีการ์ดใบไหนมีอนิเมชัน · stackAtk ≤3 ครั้ง/ไฟต์ ตามเพดาน 🦖)
    // ⚠️ ที่นี่ที่เดียว อย่ากระจายใส่ตาม handler รายชนิด เดี๋ยวพลาดชนิดใดชนิดหนึ่ง
    //    และต้องอยู่นอก try ที่ครอบ dispatch — handler พังก็ยังต้องได้เลขที่ถูก
    if (b?.statsAfter) dispStats.value = { ...dispStats.value, ...b.statsAfter }
    const h = handlers[b.t]
    // 🛡️ กันไฟต์ค้าง: FX ตัวใดตัวหนึ่งพัง ต้องข้ามหมัดนั้นแล้วเล่นต่อ ห้ามหยุดทั้งไฟต์
    //    เกิดจริง 27 ส.ค.: jab() มีตัวแปรที่ไม่ได้นิยาม → throw ทุกหมัดชั้น chip (55% ของหมัด)
    //    → applyAttack reject → step หลุดออกก่อน idx++ → กระดานค้างถาวรกลางไฟต์
    //    ผู้เล่นไม่มีทางกู้เองได้เลยนอกจากออกจากหน้า จึงต้องกันไว้ที่นี่ไม่ใช่แค่แก้ jab
    try { if (h) await h(b) }   // attack = รอครบทั้ง beat จริง · round = sync · type ที่ไม่รู้จัก = ข้ามเงียบ
    catch (e) { console.error('[replay] beat', idx.value, b?.t, e) }
  } finally {
    if (stepGen === g) stepGen = -1   // chain เก่าปลดของ gen ใหม่ไม่ได้
  }
  if (g !== gen) return
  idx.value++
  // ช่องว่างระหว่างหมัดอยู่ใน beat.timing.tail แล้ว — ไม่มี baseDelay อีกต่อไป
  if (idx.value < beats.value.length) timer = setTimeout(step, 0)
  else clearHighlights()
}

function togglePause() {
  paused.value = !paused.value
  // กด "เล่น" ระหว่าง beat ยังวิ่งอยู่ = ไม่ต้องทำอะไร step() จะเด้งออกที่ guard แล้วสายเดิมเดินต่อเอง
  if (!paused.value) { clearTimeout(timer); step() }   // เคลียร์ timer ค้างก่อนเล่นต่อ (กันรันซ้อน)
}
function inspect(uid) {
  pausedBeforeInspect = paused.value   // คนกด ⏸️ เองไว้ก่อนแล้ว → ปิดหน้าต่างแล้วต้อง "ยังพักอยู่"
  paused.value = true
  clearTimeout(timer)
  inspectUid.value = uid
}
// 🐞 เดิมปิดหน้าต่างแค่ `inspectUid = null` ไม่เคยคืน paused เลย → ไฟต์ค้างจนกว่าจะไปกด ▶️ เอง
function closeInspect() {
  inspectUid.value = null
  if (pausedBeforeInspect) return      // เขาตั้งใจพักไว้เอง อย่าไปเล่นต่อให้
  paused.value = false
  clearTimeout(timer)
  step()
}

/** ไอคอนสกิลของเพ็ทตัวนี้ (static ต่อไฟต์ — อ่านจาก def ไม่ใช่ state ที่วิ่งทุกเฟรม) */
const skillIcon = (p) => passiveOf(getPetDef(p?.id))?.icon || ''

function hpPct(uid) { return hp.value[uid] ?? 100 }

// ── inspect helpers ──
function rarityLabel(r) { return RARITY[r]?.label || r }
const insp = computed(() => {
  const uid = inspectUid.value; if (!uid) return null
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  const p = arr?.[i] || {}
  const c = buildCombatant(p)
  const def = getPetDef(p.id) || { emoji: '❓', name: '?', element: 'scissors', rarity: 'common' }
  return {
    def, grade: p.grade || 0, atk: Math.round(c.atk), hpMax: Math.round(c.maxHp),
    hpNow: Math.round(c.maxHp * (hp.value[uid] ?? 100) / 100), passive: passiveOf(def),
    // ชื่อบนจอ — คู่หูที่อยู่ทีมเดียวกันใช้ชื่อร่วม (🦭+🐳 = "รางวัลคนเก่ง") · คำอธิบายยังเป็นของสกิลตัวเอง
    passName: passiveTitle(passiveOf(def), p.id, teamIds.value[uid[0]] || null),
    elEmoji: ELEMENTS[def.element]?.emoji || '✊', elName: EL_NAME[def.element] || def.element,
  }
})

// รายการบัฟที่ยูนิตนี้กำลังได้รับ — คำนวณตอนเปิดหน้าต่างเท่านั้น
// inspect() สั่ง paused=true + clearTimeout ไปแล้ว ⇒ ไม่มีการ์ดใบไหนมีอนิเมชันวิ่ง = ไม่ชนกฎเหล็ก perf
const inspBuffs = computed(() => {
  const uid = inspectUid.value
  if (!uid) return []
  // ส่ง uid ด้วย — สถานะที่ "ลงบนตัวนี้" (ชั้นเชื้อ) ไม่ได้อยู่ใน buffMap เพราะไม่ใช่ค่าคงที่ก่อนไฟต์
  return liveBuffs(buffMap.value[uid] || [], beats.value, idx.value, uid)
})

// ── มาตรวัดเฟรม — เปิดด้วย ?fps=1 ท้าย URL หรือ data.fpsMeter (พาเนล Admin) ──
// ⚠️ ต้องประกาศ "เหนือ" watch(props.data, immediate) ด้านล่าง เพราะ reset() เรียก startFps()
//    ซึ่งอ่าน showFps — ถ้าอยู่ใต้ watch จะเข้า TDZ ทันทีที่มี call site ไหน mount มาพร้อม data
// คณิตทั้งหมดอยู่ใน utils/frameMeter.js (pure, มีเทส) — ที่นี่เหลือแค่ rAF + ต่อสาย ref
//
// สิ่งที่เปลี่ยนจากของเดิม (ตัวเลขเดิมชี้นำการตัดสินใจผิดทาง):
//   · เดิม `dt > 16` = ทุกเฟรมบนจอ 60Hz (คาบจริง 16.67ms) ถูกนับว่าหลุดหมด → สอง preset ได้ ~1,200 เท่ากัน = สัญญาณรบกวนล้วน
//     ตอนนี้จูนศูนย์หาคาบจริงของจอเครื่องนั้นก่อน (มัธยฐาน 30 เฟรมแรก) แล้วนับที่ 1.5× ของคาบนั้น
//   · เดิม loop ไม่เคยหยุด และตัวเลขถูกเรนเดอร์ "ในโมดัลสรุป" → เลขวิ่งขึ้นเรื่อยๆ ระหว่างคนอ่าน
//     พร้อม re-render ทั้ง component (การ์ด 8 ใบ + v-for ขีดหลอด + ตารางสรุป 2 ชุด) ทุกเฟรม
//     และ peak ยังกลืนเอาเฟรมกระตุกตอนโมดัลเด้งเข้ามาเป็น "เฟรมแย่สุดของไฟต์" อีก
//     ตอนนี้หยุดนับตอนไฟต์จบ แล้ว snapshot ค่าลง ref ทีเดียว — เลขในสรุป = เลขของไฟต์ที่เพิ่งเล่นจบ นิ่งสนิท
const showFps = computed(() => new URLSearchParams(location.search).has('fps') || props.data?.fpsMeter === true)
// ป้ายห้องแล็บ: บอกว่าไฟต์ที่กำลังดูอยู่นี้ใช้ค่าชุดไหน + เตือนถ้าเครื่องกำลังตัดการเคลื่อนไหวทิ้งอยู่
// (ไม่งั้น "ทุกแบบเหมือนกันหมด" จะถูกตีความว่าท่าชนไม่ต่างกัน ทั้งที่ระบบตัดทิ้งไปก่อนแล้ว)
const labTag = computed(() => {
  const p = prefs.value
  const cut = prefersReducedMotion()
  return `จังหวะใหม่ ${BEAT}ms · ${FX_LABEL[p.fx] || p.fx} · ${PACE_LABEL[p.pace] || p.pace}${cut ? ' · ⚠️ Reduce Motion ตัดการเคลื่อนไหวอยู่' : ''}`
    + (typeof tuning.value.hitSpread === 'number' ? ` · กระจาย ${tuning.value.hitSpread}` : '')
})
const fpsWorst = ref(0)     // เฟรมแย่สุดในหน้าต่าง ~1 วิ (ป้ายสดมุมจอ)
const fpsDropAt = ref(FALLBACK_BASE * DROP_RATIO)   // เกณฑ์ "สะดุด" ที่คำนวณจากจอเครื่องนี้
const fpsBase = ref(0)      // คาบเฟรมของจอเครื่องนี้ (0 = ยังจูนศูนย์ไม่เสร็จ)
const fpsPeak = ref(0)
const fpsDrop = ref(0)      // เฟรมสะสมทั้งไฟต์ที่ช้ากว่าคาบปกติ 1.5 เท่า
const fpsOver33 = ref(0)    // เฟรมสะสมทั้งไฟต์ที่ต่ำกว่า 30fps (เกณฑ์สัมบูรณ์ — จงใจไม่ผูกกับจอ)
let fpsRaf = 0
let meter = createFrameMeter()
function fpsLoop(now) {
  // push() คืน true เฉพาะตอนหน้าต่าง 1 วิ ปิดรอบ → เขียน ref วินาทีละครั้ง ไม่ใช่ทุกเฟรม
  if (meter.push(now)) { const s = meter.stats(); fpsWorst.value = Math.round(s.worst); fpsDropAt.value = s.dropAt }
  fpsRaf = requestAnimationFrame(fpsLoop)
}
function startFps() {
  if (!showFps.value || done.value) return     // ไฟต์ที่ log ว่าง (done ตั้งแต่ต้น) ไม่ต้องเปิดลูป
  meter = createFrameMeter()                   // ทิ้งของเก่าทั้งชุด ไม่สะสมข้ามไฟต์
  fpsWorst.value = 0; fpsBase.value = 0; fpsPeak.value = 0; fpsDrop.value = 0; fpsOver33.value = 0
  fpsDropAt.value = FALLBACK_BASE * DROP_RATIO
  if (!fpsRaf) fpsRaf = requestAnimationFrame(fpsLoop)
}
function stopFps() {
  if (fpsRaf) { cancelAnimationFrame(fpsRaf); fpsRaf = 0 }
  const s = meter.stats()                      // snapshot ครั้งเดียว = ตัวเลขในสรุปไม่ขยับอีกเลย
  fpsBase.value = s.base; fpsPeak.value = s.peak
  fpsDrop.value = s.drop; fpsOver33.value = s.bad
  fpsDropAt.value = s.dropAt; fpsWorst.value = Math.round(s.worst)
}

watch(() => props.data, (d) => { if (d) { buildMax(d); preloadCombat(d); reset() } }, { immediate: true })
// พื้นครึ่งสนาม: วัดเส้นกลางหลัง overlay render · ปิดรีเพลย์ = ถอด observer
watch(() => props.data, async (d) => {
  if (!d) { seamRO?.disconnect(); seamRO = null; seam.value = null; return }
  await nextTick(); watchSeam()
}, { immediate: true })
// ตีจบ → เว้น ~0.5 วิ ให้เห็นสนามจบ แล้วเปิด modal สรุป (เช็ก resultReady กันตั้งซ้ำ — reset() เปิดเองทันทีถ้า log ว่างตั้งแต่แรก)
watch(done, (v) => {
  if (!v) return
  stopFps()                 // ตัวเลขที่โชว์ในสรุปต้องเป็นของ "ไฟต์ที่เพิ่งจบ" และห้ามขยับระหว่างคนอ่าน (ดูหมายเหตุมาตรวัดเฟรม)
  fx?.dangerClearAll()      // §5.2: วงแหวนอันตรายปิดเมื่อตายหรือจบไฟต์ — ครอบเคสจบแบบไม่มีหมัดสังหารปิดท้ายด้วย
  // นิ้วอาจยังกดค้างอยู่ตอนไฟต์จบพอดี (โมดัลสรุปลอยทับกล่องสนาม) — เคลียร์โหมดเร่ง/คำใบ้ทันทีกันค้างข้ามไฟต์ถัดไป
  // (ปกติ pointerup จะตกที่กล่องเดิมเพราะ setPointerCapture ไว้ใน onHoldStart แล้ว แต่กันเหนียวอีกชั้น)
  clearTimeout(holdTimer); clearTimeout(hintTimer)
  ffActive.value = false; holdHint.value = false
  if (resultReady.value) return
  resultTimer = setTimeout(() => { resultReady.value = true; resultOpen.value = true }, REPLAY_CFG.resultDelayMs)
}, { immediate: true })
// layout เปลี่ยน (หมุนจอ/ปรับขนาด) = center ที่ cache ไว้ใน fx ใช้ไม่ได้ ต้องวัดใหม่
function onResize() { fx?.invalidateCenters() }
window.addEventListener('resize', onResize)
window.addEventListener('orientationchange', onResize)

watch(showFps, (v) => { if (v) startFps() }, { immediate: true })

onUnmounted(() => {
  clearTimeout(timer); clearTimeout(introTimer); clearTimeout(resultTimer)
  clearTimeout(holdTimer); clearTimeout(hintTimer)
  clearPending()
  clearHpTicks()   // hpAnims เป็น rAF loop นอก pendingTimers — ไม่ล้างที่นี่จะยังเขียน hpShown ต่อได้ถึง 350ms หลัง unmount
  window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize)
  if (fpsRaf) { cancelAnimationFrame(fpsRaf); fpsRaf = 0 }
  fx?.destroy(); fx = null; attachedLayer = null
  seamRO?.disconnect(); seamRO = null
})
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: #0f172a; display: flex; align-items: center; justify-content: center; padding: 16px; }
/* พื้นครึ่งสนาม (ArenaFloor) อยู่ใต้ .br-box เสมอ — ชั้น: พื้น → การ์ด/ป้าย → แบนเนอร์/เลข */
.br-bg { position: absolute; left: 0; right: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.br-seam { position: absolute; left: 0; right: 0; height: 2px; margin-top: -1px; z-index: 0; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.85) 15%, #fff 50%, rgba(255,255,255,.85) 85%, transparent);
  box-shadow: 0 0 10px rgba(255,255,255,.55); }
/* พื้นหอคอย/โคลอสเซียมเดิม (.br-theme-*) ย้ายไปเป็นพื้น 'tower' / 'sand' ใน styles/arenas.css แล้ว */
/* touch-action:none + กันเลือกข้อความ/callout ของ iOS — กล่องนี้รับ pointerdown ค้างเป็น input เกม (เร่ง)
   ไม่งั้นกดค้าง ~400ms บนข้อความ (เช่น "รอบ 1") อาจเด้งเมนู copy/แว่นขยายของ Safari มาแทรกกลางค้าง */
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 1;
  touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
/* hitstop เดิม scale ทั้ง box = re-raster เต็มจอ @DPR3 ทุก crit (แพงสุด คุ้มน้อยสุด แค่เด้ง 1.2%) → ตัดทิ้ง
   crit ยังสื่อผ่านเลขใหญ่/ทอง + จังหวะ freeze (extra delay ใน step) ที่ยังอยู่ */
.br-gone { visibility: hidden; }   /* จองที่ไว้ กล่องไม่หดตอนจบไฟต์ (visibility:hidden กดไม่ได้อยู่แล้ว) */
.br-round { text-align: center; color: #fff; font-weight: 800; font-size: .82rem; letter-spacing: .06em; margin-bottom: 2px; }

/* FPS meter (?fps=1) — เขียว=ลื่น เหลือง=หลุด 60fps แดง=ต่ำกว่า 30fps (กระตุกชัด) */
.br-fps { position: absolute; top: 2px; right: 4px; z-index: 11; font-size: .7rem; font-weight: 800; font-variant-numeric: tabular-nums;
  color: #34d399; background: rgba(0,0,0,.55); border-radius: 7px; padding: 2px 6px; pointer-events: none; }
/* ป้ายค่าชุดที่กำลังเทส — อยู่ใต้ "รอบ N" ไม่ทับ fps (ขวาบน) และไม่ทับป้ายเร่ง (ซ้ายบน) */
.br-lab-tag { text-align: center; font-size: .7rem; font-weight: 700; color: rgba(255,255,255,.6);
  margin: -4px 0 2px; pointer-events: none; }
.br-fps.warn { color: #fbbf24; }
.br-fps.bad { color: #f87171; }
.br-fps-sum { text-align: center; font-size: .72rem; color: rgba(255,255,255,.72); font-variant-numeric: tabular-nums;
  border-top: 1px solid rgba(255,255,255,.15); padding-top: 7px; margin-top: 2px; }
.br-fps-sum b { color: #fde68a; }
.br-fps-sum b.bad { color: #f87171; }
.br-fps-note { font-size: .7rem; color: rgba(255,255,255,.5); margin-top: 3px; }

.br-side { display: flex; align-items: center; gap: 6px; align-self: flex-start; max-width: 100%; font-size: .72rem; font-weight: 800; color: #fff;
  padding: 3px 10px 3px 8px; border-radius: 999px; background: rgba(10,14,28,.62); white-space: nowrap; overflow: hidden; }
.br-side b { overflow: hidden; text-overflow: ellipsis; }
.br-side-sub { font-weight: 700; color: rgba(255,255,255,.7); overflow: hidden; text-overflow: ellipsis; }
/* ฉาก VS — transform/opacity ล้วน · พื้นใช้ ArenaFloor ภาพย่อ (ไม่วัดขนาด ไม่มีอนิเมชันพื้น) */
.br-vsi { position: absolute; inset: 0; z-index: 3; cursor: pointer; animation: br-vsi-out .3s ease-in .85s forwards; }
.br-vsi-h { position: absolute; left: 0; right: 0; overflow: hidden; }
.br-vsi-h.top { top: 0; height: var(--sy); animation: br-vsi-t .45s cubic-bezier(.2,.9,.3,1.15) both; }
.br-vsi-h.bot { top: var(--sy); bottom: 0; animation: br-vsi-b .45s cubic-bezier(.2,.9,.3,1.15) both; }
.br-vsi-n { position: absolute; left: 0; right: 0; z-index: 3; text-align: center; color: #fff; font-size: .8rem; text-shadow: 0 2px 8px rgba(0,0,0,.7); }
.br-vsi-n b { display: block; font-size: 1.5rem; font-weight: 800; }
.br-vsi-h.top .br-vsi-n { bottom: 28px; }
.br-vsi-h.bot .br-vsi-n { top: 28px; }
.br-vsi-bar { position: absolute; left: 0; right: 0; top: var(--sy); height: 4px; margin-top: -2px; background: #fff; box-shadow: 0 0 18px #fff; transform: scaleX(0); animation: br-vsi-bar .3s ease-out .3s forwards; }
.br-vsi-x { position: absolute; left: 50%; top: var(--sy); font-size: 3rem; font-weight: 900; color: #fff; text-shadow: 0 0 18px rgba(255,190,80,.9), 0 4px 0 #7c2d12;
  transform: translate(-50%, -50%) scale(0); animation: br-vsi-x .35s ease-out .35s forwards; }
@keyframes br-vsi-t { from { transform: translateY(-100%); } }
@keyframes br-vsi-b { from { transform: translateY(100%); } }
@keyframes br-vsi-bar { to { transform: scaleX(1); } }
@keyframes br-vsi-x { to { transform: translate(-50%, -50%) scale(1); } }
@keyframes br-vsi-out { to { opacity: 0; } }
.br-side .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
.dot.foe { background: #f87171; }
.dot.me { background: #34d399; }
.me-label { margin-top: 2px; }

.br-team { display: flex; justify-content: center; gap: 8px; }
/* ทีมละ 3 ตัว (BATTLE_SLOTS) แต่คงขนาดการ์ดเท่าตอนเป็นกริด 4 ช่อง แล้วจัดกลาง — ไม่ขยายการ์ด
   (การ์ดใหญ่ขึ้น = พื้นที่เพนต์มากขึ้น ขัดกับงาน perf ที่แก้กระตุก iOS มา) · ทีมที่ตัวน้อยกว่าก็อยู่กลางเอง */
.br-team > * { flex: 0 0 calc((100% - 24px) / 4); min-width: 0; }
/* ไม่ตั้ง will-change ถาวร — melee lunge วิ่งผ่าน fx.lunge (WAAPI el.animate ตรง ไม่ใช่ CSS transition)
   browser promote เฉพาะช่วง animation รัน แล้ว release เอง (fill:none คืน layer ทันทีที่จบ) — ไม่มี transition: transform บน .br-unit แล้ว
   เดิม promote ถาวรทั้ง 8 การ์ด = layer เปล่าค้างตลอด → WebKit thrash */
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: rgba(12,16,30,.62); border: 2px solid transparent; border-radius: 16px; cursor: pointer; }
/* ⛔ ห้ามใส่ transition: border-color กลับ — ขอบแดงตอนโดนจะไล่สี 150ms "พร้อม" squash/lunge
   = การ์ดถูกวาดใหม่ทุกเฟรมระหว่างขยับ (ผิดข้อบังคับ v3) · เปลี่ยนสีทันทีแทน */
.br-unit.foe { border-color: rgba(248,113,113,.35); }
.br-unit.me  { border-color: rgba(52,211,153,.4); }
.br-face { font-size: 2rem; line-height: 1; }
.br-el { position: absolute; top: 3px; left: 3px; font-size: .8rem; background: rgba(0,0,0,.45); border-radius: 8px; padding: 1px 3px; line-height: 1; }
/* Phase 2b: ตัด card lift/shake/glow (::after) ทิ้ง — ไฮไลต์เหลือแค่ border-color (ถูก, ไม่ re-raster)
   windup/acting เดิม telegraph ย้ายไป fx.ring (brfx-ring, plain DOM/WAAPI นอก Vue reactivity) แล้ว
   ⛔ สองคลาสนี้ต้องได้ border-color "ค่าเดียวกัน" เสมอ — จุดสลับคลาสใน applyAttack() อยู่กลาง fx.lunge()
      ที่ยังวิ่งอยู่ ถ้าแยกสีเมื่อไหร่ = paint เปลี่ยนกลางอนิเมชันการ์ด = ผิดข้อบังคับ v3 (ดูคอมเมนต์ที่ applyAttack) */
.br-unit.acting, .br-unit.windup { border-color: #fde68a; }
.br-unit.flash { border-color: #f87171; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }

/* --br-hp-h ฯลฯ = ตัวแปรจูนจากห้องแล็บ ตั้งบน body · fallback = ค่าที่ user เลือกจากห้องเทียบ v4 (26 ก.ย. 2026)
   เดิม 7px / ผีขาวจาง .75 / .45s หลัง .16s ⇒ "ตามไม่ค่อยทันว่าเลือดลด" */
.br-hp { position: relative; width: 84%; height: var(--br-hp-h, 11px); background: rgba(0,0,0,.35); border-radius: 999px; overflow: hidden; }
/* เลือด: scaleX (composite) แทน transition width (layout ทุกเฟรม) — origin ซ้าย · promote เฉพาะตอน transition รัน (ไม่ตั้ง will-change ถาวร) */
.br-hp-fill { position: relative; width: 100%; height: 100%; background: #ef4444; border-radius: 999px; transform-origin: left center; transition: transform .1s linear; }
.br-hp-fill.mine { background: #34d399; }
/* หลอดผี: อยู่ใต้หลอดจริง หดตามหลัง → ช่องส้มที่โผล่ = ดาเมจที่เพิ่งกิน */
.br-hp-ghost { position: absolute; inset: 0; background: var(--br-ghost-bg, #fbbf24); opacity: var(--br-ghost-op, 1); border-radius: 999px;
  transform-origin: left center; transition: transform var(--br-ghost-dur, .8s) ease-out var(--br-ghost-delay, .22s); }
.br-tick { position: absolute; top: 0; width: 1px; height: 100%; background: rgba(255,255,255,.55); }
.br-stats { display: flex; justify-content: space-between; align-items: center; gap: 3px; width: 88%; margin-top: 3px; }
.br-atk, .br-hpn { font-size: .72rem; font-weight: 800; color: #fff; line-height: 1; padding: 2px 6px; border-radius: 999px; min-width: 18px; text-align: center; }
.br-atk { background: #f59e0b; }       /* ATK = amber (Hearthstone-ish) */
.br-hpn.foe { background: #ef4444; }    /* HP ศัตรู = แดง */
.br-hpn.me { background: #16a34a; }     /* HP ทีมคุณ = เขียว */

/* tuning.hpTick flash/count — เด้ง + วงส้มจาง (transform/opacity ล้วน) · วงมีเฉพาะตอน .hit ไม่ค้างเป็นกล่องบนการ์ด */
.br-hpn { position: relative; }
.br-hpn.hit { animation: br-hpn-pop .32s ease-out; }
.br-hpn.hit::after { content: ''; position: absolute; inset: -3px; border-radius: 999px; box-shadow: 0 0 0 2px #fbbf24; opacity: 0; pointer-events: none; animation: br-hpn-ring .32s ease-out; }
@keyframes br-hpn-pop { 0% { transform: scale(1) } 30% { transform: scale(1.28) } 100% { transform: scale(1) } }
@keyframes br-hpn-ring { 0% { opacity: .95; transform: scale(.9) } 100% { opacity: 0; transform: scale(1.35) } }

/* pop/call/puff/proj (เลขดาเมจ, callout สาย, 💀, projectile) ย้ายไป fx pool (.brfx- ท้ายไฟล์ ไม่ scoped) แล้ว —
   CSS เดิม (br-pop, br-call, br-puff, br-proj และตัวแปรย่อย) + keyframes br-pop-rise, br-rise, br-fly ตัดทิ้ง (ไม่มี markup ใช้แล้ว) */

.br-vs { text-align: center; color: rgba(255,255,255,.85); font-weight: 800; font-size: .82rem; letter-spacing: .04em; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 3px 12px;
  /* เส้นกลางสนาม (.br-seam) วิ่งผ่านกลางแถวนี้พอดี ⇒ ป้ายต้องมีพื้นรอง ไม่งั้นเส้นขีดทับตัวอักษร · padding บน/ล่างคงเดิม = เส้นกลางไม่ขยับ */
  align-self: center; background: rgba(15,23,42,.82); border-radius: 999px; }

.br-ctrl { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.br-btn { border: 2px solid #fff; background: rgba(255,255,255,.14); color: #fff; border-radius: 12px; padding: 10px 22px; font-family: inherit; font-weight: 800; cursor: pointer; transition: background .12s; }
.br-btn:active { background: rgba(255,255,255,.28); }
.br-btn.sm { padding: 9px 14px; font-size: .82rem; }

/* ป้ายบอกสถานะเร่ง — เกาะมุมบนซ้ายของกล่อง ไม่บังสนาม */
.br-ff { position: absolute; top: 2px; left: 4px; z-index: 11; font-size: .72rem; font-weight: 800;
  color: #fde68a; background: rgba(0,0,0,.55); border-radius: 7px; padding: 2px 7px; pointer-events: none; }
.br-hold-hint { position: absolute; left: 50%; transform: translateX(-50%); bottom: 46px; z-index: 11;
  font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.75); background: rgba(0,0,0,.45);
  border-radius: 999px; padding: 4px 10px; pointer-events: none; animation: br-hint-in .2s ease; }
@keyframes br-hint-in { from { opacity: 0 } to { opacity: 1 } }

.br-result { font-size: 1.2rem; font-weight: 800; color: #fff; }
.br-tip { margin-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.br-tip-text { font-size: .78rem; font-weight: 700; color: rgba(255,255,255,.8); text-align: center; }
.br-tip-btn { background: var(--gold); color: var(--ink); }
.br-result.win { color: #34d399; }

/* ⚠️ การ์ด inspect พื้นเข้ม (#1e293b) — ตัวอักษรต้องสว่าง
   ของเดิมเป็น rgba(0,0,0,.62) = ดำบนกรมท่า contrast ~1.4:1 อ่านไม่ออกเลย
   (สไตล์นี้ถูกก๊อปมาจาก .br-spot-desc ซึ่งอยู่บนการ์ด 'พื้นขาว' จึงถูกที่นั่นแต่ผิดที่นี่)
   เกิดจริง 28 ส.ค. — user รายงานว่าตรงสกิลในหน้าข้อมูลเพ็ทอ่านยาก */
.br-card-passdesc { font-size: .74rem; line-height: 1.45; color: rgba(255,255,255,.78); margin: 2px 0 8px; text-align: left; }
.br-inspect { position: fixed; inset: 0; z-index: 430; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5); }
.br-card { background: #1e293b; color: #fff; border: 2px solid #fff; border-radius: 18px; padding: 16px 18px; width: 250px; display: flex; flex-direction: column; gap: 7px; }
.br-card-emoji { font-size: 2.8rem; text-align: center; }
.br-card-name { text-align: center; font-weight: 800; font-size: 1.1rem; margin-bottom: 4px; }
.br-card-row, .br-card-pass { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; }
.br-card-row span, .br-card-pass span { color: rgba(255,255,255,.6); }
.br-card-pass { border-top: 1px solid rgba(255,255,255,.15); margin-top: 4px; padding-top: 7px; }
.br-card .br-btn { margin-top: 10px; }

.br-intro { position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.br-intro-txt { font-weight: 900; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,.6); letter-spacing: .05em; }
.br-intro-txt.ready { font-size: 2.2rem; animation: br-ready .7s ease; }
.br-intro-txt.go { font-size: 3.4rem; color: #fde68a; animation: br-go .4s ease; }
@keyframes br-ready { from { opacity: 0; transform: scale(.7) } to { opacity: 1; transform: scale(1) } }
@keyframes br-go { from { opacity: 0; transform: scale(1.6) } to { opacity: 1; transform: scale(1) } }

.br-reward { text-align: center; color: #fde68a; font-weight: 800; font-size: .8rem; }
.br-sum-team { background: rgba(255,255,255,.06); border-radius: 12px; padding: 8px; }
.br-sum-head { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,.8); font-weight: 800; font-size: .72rem; margin-bottom: 6px; }
.br-sum-head .dot { width: 8px; height: 8px; border-radius: 999px; }
.br-sum-row { position: relative; display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 9px; border: 2px solid transparent; }
.br-sum-row.dead { opacity: .45; }
.br-sum-row.mvp.win { border-color: #fbbf24; background: rgba(251,191,36,.12); }
.br-sum-row.mvp:not(.win) { border-color: #c084fc; background: rgba(192,132,252,.12); }
.br-mvp { position: absolute; top: -8px; left: 8px; font-size: .7rem; font-weight: 900; color: #1e293b; background: #fbbf24; padding: 1px 5px; border-radius: 999px; }
.br-sum-row.mvp:not(.win) .br-mvp { background: #c084fc; color: #fff; }
.br-sum-face { font-size: 1.3rem; }
.br-sum-dmg { font-size: .7rem; font-weight: 800; color: #fde68a; display: inline-flex; align-items: center; gap: 2px; }
.br-sum-dmg.taken { color: #fca5a5; margin-left: auto; }

/* modal สรุปผล — ทับสนามที่มืดลง เลื่อนในตัวเองได้ ไม่โดน bottom-nav/safe-area บัง */
.br-result-ov { position: fixed; inset: 0; z-index: 425; background: rgba(15, 23, 42, .72);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
.br-modal { width: 100%; max-width: 380px; background: #1e293b; border: 2px solid rgba(255,255,255,.25);
  border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 8px;
  max-height: calc(100dvh - 72px); overflow-y: auto; -webkit-overflow-scrolling: touch;
  animation: br-modal-in .25s ease; }
.br-modal .br-result { text-align: center; }
@keyframes br-modal-in { from { opacity: 0; transform: scale(.92) translateY(10px) } to { opacity: 1; transform: none } }
.br-modal-btns { display: flex; gap: 8px; justify-content: center; margin-top: 4px; }
/* รายการบัฟในการ์ด inspect — พื้นการ์ดเป็น #1e293b (เข้ม)
   ⚠️ ถมเขียว/แดงทึบแล้ววางตัวอักษรสว่าง = แสบตาและอ่านยากกว่าเดิม (CLAUDE.md ข้อ 13)
   จึงใช้พื้นจาง 16% + แถบสีทึบขอบซ้าย · วัดแล้ว 9.9:1 (บัฟ) และ 11.4:1 (ดีบัฟ) ผ่าน AA สบาย
   🔑 สีไม่ใช่ตัวบอกเดียว — ตาบอดสีเขียว-แดงคือแบบที่พบบ่อยที่สุด และสองสีนี้คือคู่ที่แยกไม่ออกพอดี
      จึงมีไอคอนของผลกับคำว่า "ฝ่ายศัตรู" ซ้ำอีก 2 ชั้น สีเป็นชั้นที่สามเท่านั้น */
.br-buffs { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.br-buffs-head { font-size: .74rem; font-weight: 800; color: #94a3b8; margin-bottom: 2px; }
.br-buff { border-left: 3px solid #4ade80; border-radius: 0 10px 10px 0; background: rgba(34,197,94,.16); padding: 6px 9px; }
.br-buff.dbf { border-left-color: #f87171; background: rgba(239,68,68,.16); }
/* ใช้ไปแล้ว = ไม่ได้ให้อะไรอีก ถ้ายังเขียวอยู่จะอ่านผิดว่ายังกันตายได้ */
.br-buff.spent { border-left-color: #94a3b8; background: rgba(148,163,184,.14); opacity: .62; }
.br-buff-src { font-size: .78rem; font-weight: 800; color: #f1f5f9; }
.br-buff-owner { font-weight: 700; color: #cbd5e1; }
.br-buff-eff { font-size: .76rem; color: #e2e8f0; margin-top: 1px; }
.br-buff-tag { margin-left: 6px; font-size: .7rem; font-weight: 800; color: #cbd5e1; background: rgba(255,255,255,.12); border-radius: 999px; padding: 1px 7px; }

/* แถบปุ่มลอยตอน peek สนาม (ดูสรุป + ปิด) — เกาะล่างกลาง เหนือ safe-area */
.br-peek-bar { position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(20px + env(safe-area-inset-bottom, 0px)); z-index: 424; display: flex; gap: 8px; }
.br-peek-btn { background: #4f46e5; border-color: #fff; box-shadow: 0 6px 20px rgba(0, 0, 0, .45); }

/* reduced-motion: คงจังหวะ 4 ชั้น ขนาดเลข และ hitstop ไว้ครบ — ตัดเฉพาะของที่เคลื่อนไหว
   หลอดผีไม่แตะที่นี่โดยตั้งใจ — มัน "ไล่ตามหลัง" ด้วยแค่การ transition แถบบางๆ ไม่ถึง 0.5 วิ
   ไม่ใช่การเคลื่อนไหวแบบที่ prefers-reduced-motion กันไว้ (จอสั่น/หมุน/พุ่งข้ามจอ) แถมยังบอกดาเมจ
   ที่เพิ่งกิน — ตัดออกจะเสียข้อมูล ไม่ใช่แค่ลดความหวือหวา จึงปล่อยให้ทำงานปกติทั้งสอง mode */
</style>

<style>
/* FX pool styles — ไม่ scoped (element สร้าง imperative ไม่มี data-v-*) · namespace .brfx-* กันชน global */
.br-fx-layer { position: absolute; inset: 0; pointer-events: none; z-index: 6; }

/* ── สปอตไลต์สกิล ────────────────────────────────────────────
   z-index 4 = ใต้ fx layer (6) เพื่อให้เลข/ประกายของ "ผล" ที่ลงตามมาลอยเหนือฉากหรี่
   🚫 ห้าม backdrop-filter/blur — iOS Safari เพนต์ไม่ไหว (เคสกระตุกที่แก้ไป 4 รอบกว่าจะเจอ)
   ทุกอย่างขยับด้วย transform/opacity เท่านั้น */
.br-spot { position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
/* ⚠️ .br-spot ไม่มี z-index (ไม่สร้าง stacking context) — ม่าน z4 < การ์ดเจ้าของ .spotlit z5 ≤ แถบคัทอิน z5 (มาทีหลังใน DOM จึงอยู่บน)
   ⇒ การ์ดเจ้าของสว่างเหนือม่าน แต่ไม่บังตัวหนังสือบนแถบ · fx layer z6 อยู่บนสุดเหมือนเดิม */
/* fixed = คลุมทั้งจอ (เดิม absolute คลุมแค่ .br-box ⇒ บนมือถือเห็นสี่เหลี่ยมมืดกลางจอ ขอบบน/ล่างสว่าง — user 26 ก.ย.)
   ยังอยู่ใน stacking context ของ .br-box (z4 < การ์ด spotlit z5) · ระหว่างจอสั่น .br-box มี transform ม่านจะขยับตามกล่อง 1 จังหวะ ยอมได้ */
.br-spot-dim { position: fixed; inset: 0; z-index: 4; background: #0f172a; opacity: 0; will-change: opacity; animation: br-spot-dim-in var(--spot-delay, 180ms) ease-out forwards; }
.br-cut { position: relative; z-index: 5; width: 112%; flex: none; height: 88px; display: flex; align-items: center; gap: 12px; padding: 0 12%;
  transform: skewY(-5deg); background: linear-gradient(90deg, #2563eb 0%, #2563eb 35%, rgba(15,23,42,.96) 100%); box-shadow: 0 0 0 3px #fff;
  will-change: transform, opacity; animation: br-cut-in-l var(--spot-in, 240ms) cubic-bezier(.2,.9,.3,1.1) var(--spot-delay, 180ms) both; }
.br-spot.foe .br-cut { flex-direction: row-reverse; text-align: right;
  background: linear-gradient(270deg, #dc2626 0%, #dc2626 35%, rgba(15,23,42,.96) 100%); animation-name: br-cut-in-r; }
.br-cut-face { flex: none; width: 70px; height: 70px; display: grid; place-items: center; border-radius: 50%; font-size: 3rem; line-height: 1;
  background: rgba(255,255,255,.18); transform: skewY(5deg); }
.br-cut-t { display: flex; flex-direction: column; gap: 2px; min-width: 0; transform: skewY(5deg); }
.br-cut-who { font-size: .7rem; font-weight: 800; letter-spacing: .05em; color: rgba(255,255,255,.8); }
.br-cut-name { font-size: 1.1rem; font-weight: 800; color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.35); }
.br-cut-desc { font-size: .74rem; line-height: 1.35; color: rgba(255,255,255,.88); }
.br-spot.out .br-spot-dim { animation: br-spot-dim-out var(--spot-out, 230ms) ease-in forwards; }
.br-spot.out .br-cut { animation: br-cut-out var(--spot-out, 230ms) ease-in forwards; }
@keyframes br-spot-dim-in  { to { opacity: .55; } }
@keyframes br-spot-dim-out { from { opacity: .55; } to { opacity: 0; } }
@keyframes br-cut-in-l { from { transform: skewY(-5deg) translateX(-110%); } to { transform: skewY(-5deg); } }
@keyframes br-cut-in-r { from { transform: skewY(-5deg) translateX(110%); } to { transform: skewY(-5deg); } }
@keyframes br-cut-out { from { opacity: 1; transform: skewY(-5deg); } to { opacity: 0; transform: skewY(-5deg) scaleY(.2); } }
/* การ์ดเจ้าของสกิล — ยกขึ้นเหนือฉากหรี่ให้เห็นว่าใครเป็นคนออกท่า */
.br-unit.spotlit { z-index: 5; border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,.35); }
/* fade สำรองของสปอตไลต์ (เดิมใช้ตอนเครื่องขอลดการเคลื่อนไหว — ตอนนี้ bypass แล้ว ดู utils/motionPref.js) */
@keyframes br-spot-fade-in { from { opacity: 0; } to { opacity: 1; } }

/* จุดไอคอนสกิลมุมการ์ด — บอกว่าตัวนี้มีทักษะเฉพาะ (เดิมต้องไล่แตะทีละใบถึงจะรู้) */
.br-skill-dot { position: absolute; top: 2px; right: 4px; font-size: .72rem; line-height: 1; opacity: .85; pointer-events: none; }
/* tuning.skillMark 'lit' — ขนาดคงที่หลังติดไฟ (ไม่วิ่งอนิเมชันระหว่างการ์ดพุ่ง) */
.br-skill-dot.lit { opacity: 1; border-radius: 999px; box-shadow: 0 0 0 1.5px #fbbf24, 0 0 6px 1px rgba(251,191,36,.55); }
/* ×N ห้อยนอกมุมการ์ด — เดิมขยายเป็นเม็ดยาเข้าหากลางการ์ด ชนป้ายชั้นเชื้อ 🦠 ของ fx layer + บังหน้าเพ็ท (เห็นจริงใน Chrome 26 ก.ย.) */
.br-skill-dot i { position: absolute; top: -9px; right: -10px; font-style: normal; font-size: .7rem; font-weight: 800; line-height: 1;
  color: #451a03; background: #fbbf24; border-radius: 999px; padding: 1px 4px; }

/* ── ป้ายสถานะที่ติดอยู่บนการ์ดใบนี้ (สเปก §5) ──
   static ล้วน: ไม่มี will-change ไม่มี animation ไม่มี transition
   วาดตอนไฟต์เริ่มแล้วไม่แตะอีก ⇒ ไม่มีทางไปเปลี่ยน paint ระหว่างการ์ดพุ่ง (ข้อบังคับ v3) */
.br-status { position: absolute; left: 3px; bottom: 3px; display: flex; gap: 3px; pointer-events: none; z-index: 2; }
.br-status b { font-size: .72rem; line-height: 1; font-weight: 400; padding-bottom: 1px; border-bottom: 1.5px solid #34d399; }
.br-status b.dbf { border-bottom-color: #f87171; }

/* ── ชิปชื่อสกิลตอนโปรก ──
   ขึ้นเร็ว (110ms) ค้างระหว่าง SKILL_PAUSE แล้ว .out สั่งให้เลือน 300ms
   ⚠️ การเลือนเกิด "หลัง" ไฟต์เดินต่อแล้ว = ทับ beat ถัดไปโดยตั้งใจ (จังหวะที่ user ออกแบบ)
   อยู่บน fx layer ของตัวเอง (position:absolute + transform) จึงไม่ทำให้การ์ด re-raster */
.br-chip {
  position: absolute; left: 50%; top: -11px; white-space: nowrap; z-index: 6;
  background: #0d9488; color: #fff; font-size: .7rem; font-weight: 800;
  padding: 1px 7px; border-radius: 999px; pointer-events: none;
  box-shadow: 0 2px 6px rgba(0,0,0,.35);
  animation: br-chip-in .11s ease-out both;
}
.br-chip.out { animation: br-chip-out .3s ease-out both; }
@keyframes br-chip-in {
  from { opacity: 0; transform: translate(-50%, 5px) scale(.85); }
  to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
@keyframes br-chip-out {
  from { opacity: 1; transform: translate(-50%, 0) scale(1); }
  to   { opacity: 0; transform: translate(-50%, -9px) scale(.95); }
}
.brfx { position: absolute; left: 0; top: 0; will-change: transform; }
.brfx-call { font-weight: 800; font-size: .7rem; white-space: nowrap; padding: 2px 6px; border-radius: 7px; }
.brfx-call.super { background: #ef4444; color: #fff; }
.brfx-call.weak { background: rgba(203,213,225,.95); color: #334155; }
.brfx-puff { width: 1.2rem; height: 1.2rem; }
.brfx-burst { width: 2rem; height: 2rem; }
/* ป้ายชื่อ passive — เหนือหัวการ์ด (ไม่ใช่กลางจอ ตาม master plan §5.5) */
/* will-change: auto ทับ .brfx โดยตั้งใจ — WAAPI โปรโมต layer ให้เองระหว่างอนิเมชันวิ่งอยู่แล้ว
   การโปรโมตค้างไว้ตลอดไฟต์คือราคาที่แอนดรอยด์กลางๆ จ่ายฟรีๆ (เจอ fps drop หลังเพิ่มของวันนี้) */
.brfx-banner { font-weight: 800; font-size: .72rem; white-space: nowrap; padding: 3px 9px; border-radius: 9px;
  background: rgba(15,23,42,.92); color: #fde68a; border: 1px solid rgba(253,230,138,.55);
  transform-origin: 50% 100%; margin-left: -3.2rem; text-align: center; min-width: 6.4rem; will-change: auto; }
.brfx-sweep { width: 1.7rem; height: 1.7rem; will-change: auto; }
.brfx-proj { width: 1.4rem; height: 1.4rem; }
.brfx-dash { width: 2rem; height: 2rem; }
.brfx-ring { width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 18px; }
/* เหลือ phase เดียวคือ windup — กฎ .brfx-ring.acting ถูกลบพร้อม branch 'acting' ใน fx.ring() ที่ไม่มี call site แล้ว */
.brfx-ring.windup { box-shadow: 0 0 0 3px #fde68a, 0 0 18px 4px rgba(253,230,138,.55); }

/* ยุคเดิม (call site ที่ยังไม่ส่ง tier — battleFx.js ไม่แปะ tier class เลยเมื่อ tier undefined แล้ว
   ตกลงมาที่กฎกลุ่มนี้ตรงๆ) — Task 4 ส่ง tier ครบทุกจุดเรียกแล้วค่อยลบทิ้งได้ */
.brfx-pop { width: 0; height: 0; font-family: 'Lilita One', 'Kanit', sans-serif; font-weight: 400; font-size: 1.5rem; color: #fff; white-space: nowrap; }
/* เลขดาเมจแบบ B ระเบิดการ์ตูน (user เลือกจากเดโม 25 ก.ย. 2026) — ตัวเลขอยู่บนดาวแหลม
   element หลักกว้าง/สูง 0 = จุดกึ่งกลางการ์ดพอดี · ลูก .brfx-pop-in จัดกลางด้วย translate
   ดาวเป็นรูปนิ่ง (clip-path ไม่ขยับ) ขยับทั้งก้อนผ่าน WAAPI transform/opacity เท่านั้น */
.brfx-pop-in { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); display: block; }
.brfx-pop-n { position: relative; -webkit-text-stroke: 4px #1c1917; paint-order: stroke fill; }
.brfx-pop-bg { position: absolute; left: 50%; top: 50%; width: 2.7em; height: 2.7em; margin: -1.35em 0 0 -1.35em; z-index: -1; background: #f97316;
  clip-path: polygon(50% 0, 61% 30%, 93% 18%, 74% 45%, 100% 60%, 68% 66%, 76% 100%, 50% 76%, 24% 100%, 32% 66%, 0 60%, 26% 45%, 7% 18%, 39% 30%); }
.brfx-pop-tag { display: none; position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); margin-bottom: 2px;
  font: 900 .7rem/1 'Kanit', sans-serif; letter-spacing: .06em; padding: 2px 6px; border-radius: 6px; background: #fbbf24; color: #451a03; }
.brfx-pop.crit { color: #fde047; font-size: 2rem; }
.brfx-pop.crit .brfx-pop-bg { background: #dc2626; width: 2.9em; height: 2.9em; margin: -1.45em 0 0 -1.45em; }
.brfx-pop.crit .brfx-pop-tag { display: block; }
.brfx-pop.weak { color: #e2e8f0; font-size: 1.1rem; }
.brfx-pop.weak .brfx-pop-bg { background: #64748b; }
.brfx-pop.super { color: #fff7ed; }
.brfx-pop.super .brfx-pop-bg { background: #ea580c; }
.brfx-pop.heal { color: #dcfce7; font-size: 1.15rem; }   /* ฟื้นเลือด — วงกลมเขียวและเล็กกว่าดาเมจ ไม่แย่งสายตาหมัดจริง */
.brfx-pop.heal .brfx-pop-bg { background: #16a34a; clip-path: circle(38%); }
/* ดาเมจเชื้อ 🦠 ชั้นละก้อน — ม่วงและเล็กที่สุด อ่านเป็น "ของแถมจากสกิล" ไม่ใช่หมัดอีกดอก
   ⚠️ ขนาดจริงมาจาก inline font-size ใน fx.pop (weight) — ที่นี่คุมแค่สี/เส้นขอบ */
.brfx-pop.infect { color: #f3e8ff; }
.brfx-pop.infect .brfx-pop-bg { background: #9333ea; }
.brfx-pop.infect .brfx-pop-n { -webkit-text-stroke: 3px #1c1917; }

/* ชั้น = เจ้าของขนาด — นี่คือช่องทางหลักที่ผู้เล่นอ่านน้ำหนักของหมัดออกขณะดูเร็วๆ
   มาทีหลังด้วย specificity เท่ากัน (สองคลาสเท่ากับ .crit/.weak ด้านบน) จึงชนะเรื่องขนาดด้วยลำดับประกาศ
   ส่วนสีปล่อยให้ crit/super/weak คุมต่อ (ไม่แตะ color ในกลุ่มนี้เลย) */
/* ขนาดเลขมาจาก battleFx.pop() (0.86 + weight × 1.0 rem) แบบต่อเนื่อง — ไม่มีคลาสตามชั้นแล้ว */

.brfx-call.survive { background: #34d399; color: #06371f; }

/* วงแหวนโซนอันตราย — เต้นด้วย opacity ล้วนบน pool element ที่ promote ถาวรแล้ว */
.brfx-danger {
  width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 18px;
  box-shadow: 0 0 0 3px #ef4444, 0 0 16px 3px rgba(239, 68, 68, .5);
}
/* ป้ายสถานะค้าง (ชั้นเชื้อ) — พื้นเข้ม ตัวอักษรสว่าง (อย่าก๊อปสีจากการ์ดพื้นอ่อน) */
.brfx-mark {
  display: flex; align-items: center; gap: 2px;
  padding: 1px 5px 1px 3px; margin: -10px 0 0 -18px;
  border-radius: 999px; background: rgba(15, 23, 42, .88);
  border: 1px solid rgba(148, 163, 184, .45);
  font: 700 11px/1 system-ui, sans-serif; color: #fca5a5;
}
.brfx-mark-ico { width: 13px; height: 13px; display: block; }
</style>
