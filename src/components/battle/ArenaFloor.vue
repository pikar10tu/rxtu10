<!-- src/components/battle/ArenaFloor.vue
     วาดพื้นสนาม 1 ฝั่ง (เต็ม parent) — ใช้ในฉากต่อสู้ (mode battle) และภาพย่อ (mode thumb)
     battle: วัดขนาดของตกแต่งจริงแล้วให้ utils/arenaLayout.js วางใน "เขตขอบนอก" (zone) — ไม่ทับกล่องต่อสู้
     thumb : วางแบบเปอร์เซ็นต์ ≤ 3 ชิ้น ไม่วัด ไม่มีอนิเมชัน (การ์ดคู่ต่อสู้/ชีตสนาม)
     สเปก: docs/superpowers/specs/2026-09-25-arena-skins-replay-news-design.md §3.2 -->
<template>
  <div class="arf-host" :class="side" aria-hidden="true">
    <div class="arf-floor" :class="'arf-' + floor"></div>
    <template v-if="mode === 'battle'">
      <div v-if="plaque" ref="plaqueEl" class="arf-plaque" :class="'r' + plaque.rank" :style="posStyle('plaque')">
        <span v-if="plaque.crown" class="arf-crown"><Emoji :char="plaque.crown" /></span>{{ plaque.big }}<small>{{ plaque.small }}</small>
      </div>
      <span v-for="(d, i) in deco" :key="i" :ref="el => (decoEls[i] = el)" class="arf-deco" :class="d.anim ? 'arf-' + d.anim : ''"
            :style="{ fontSize: d.size + 'rem', opacity: d.opacity, ...posStyle(i) }"><Emoji :char="d.ch" /></span>
      <span v-for="i in petalCount" :key="'p' + i" class="arf-petal"
            :style="{ left: (30 + (i - 1) * 45) + '%', animationDuration: (7 + (i - 1) * 2) + 's', animationDelay: (-(i - 1) * 3.5) + 's' }"><Emoji :char="arena.petals" /></span>
    </template>
    <template v-else>
      <span v-for="(d, i) in deco.slice(0, 3)" :key="i" class="arf-deco"
            :style="{ fontSize: (d.size * .7) + 'rem', opacity: Math.min(1, d.opacity + .1), left: d.x + '%', top: (70 - d.d * 45) + '%' }"><Emoji :char="d.ch" /></span>
      <span v-if="plaque" class="arf-plaque mini" :class="'r' + plaque.rank" style="left:50%;top:50%">TOP {{ plaque.rank }}</span>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch, nextTick, onMounted } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { getArena, DEFAULT_ARENA } from '../../data/arenas.js'
import { parseArenaRef } from '../../utils/arenas.js'
import { layoutDeco } from '../../utils/arenaLayout.js'

const props = defineProps({
  arenaRef: { type: String, default: null },          // สตริงแบบแถว roster: 'ar-lab' · 'ch-2026-09#3' · 'tower' · null = สนามฟรี
  side: { type: String, default: 'top' },             // 'top' | 'bot' — ครึ่งบน (ศัตรู) / ครึ่งล่าง (เรา)
  zone: { type: Object, default: null },              // { y0, y1 } เขตขอบนอก ในพิกัดของ element นี้ (battle เท่านั้น)
  mode: { type: String, default: 'battle' },          // 'battle' | 'thumb'
})

const MONTHS_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

const ref_ = computed(() => parseArenaRef(props.arenaRef))
const arena = computed(() => ref_.value.id === 'tower' ? null : (getArena(ref_.value.id) || getArena(DEFAULT_ARENA)))
const floor = computed(() => ref_.value.id === 'tower' ? 'tower' : arena.value.floor)
const deco = computed(() => (arena.value?.deco || []).map(([ch, x, d, size, opacity, anim]) => ({ ch, x, d, size, opacity, anim })))
const petalCount = computed(() => (arena.value?.petals ? 2 : 0))   // ของขยับ ≤ 2 ชิ้น (perf iOS)

// ป้ายสลักแชมป์: อันดับ + เดือน/ปี ค.ศ. จาก season (user ขอ 25 ก.ย. 2026)
const plaque = computed(() => {
  const a = arena.value
  if (!a?.season) return null
  const rank = ref_.value.rank || 10
  const [y, m] = a.season.split('-')
  return {
    rank,
    crown: rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '',
    big: rank <= 3 ? `TOP ${rank} · ARENA CHAMPION` : 'TOP 10 · ARENA ELITE',
    small: `${MONTHS_EN[Number(m) - 1]} ${y}`,
  }
})

// ── วางของ (battle) ──
const plaqueEl = ref(null)
const decoEls = []
const pos = reactive({})   // key → { x, y } | { skip }
const posStyle = (key) => {
  const p = pos[key]
  if (!p) return { visibility: 'hidden' }          // ยังไม่วาง = ซ่อนไว้ก่อน (วัดขนาดได้)
  if (p.skip) return { display: 'none' }
  return { left: p.x + 'px', top: p.y + 'px' }
}

async function place() {
  if (props.mode !== 'battle' || !props.zone) return
  for (const k of Object.keys(pos)) delete pos[k]
  await nextTick()
  const root = plaqueEl.value?.parentElement || decoEls.find(Boolean)?.parentElement
  if (!root) return
  const W = root.clientWidth
  const items = []
  if (plaque.value && plaqueEl.value) items.push({ key: 'plaque', w: plaqueEl.value.offsetWidth, h: plaqueEl.value.offsetHeight, x: 50, d: .5 })
  deco.value.forEach((d, i) => {
    const el = decoEls[i]
    if (el) items.push({ key: i, w: el.offsetWidth, h: el.offsetHeight, x: d.x, d: d.d })
  })
  for (const p of layoutDeco({ W, zone: props.zone, side: props.side, items })) pos[p.key] = p
}

watch(() => [props.arenaRef, props.zone?.y0, props.zone?.y1, props.zone?.w, props.side], place)
onMounted(place)
defineExpose({ place })
</script>

<style scoped>
.arf-host { position: absolute; inset: 0; overflow: hidden; }
</style>
