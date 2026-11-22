<!-- 🎲 กระดาน 9×9 (32 ช่องรอบขอบ) · ตรงกลางเป็น slot (HUD) · ตัวเดินลอยทับด้วย % เพื่อให้เลื่อนลื่น -->
<template>
  <div class="tb" :class="{ 'shake-1': shake === 1, 'shake-2': shake === 2 }">
    <button
      v-for="t in TILES" :key="t.idx" type="button" class="tile" :class="[t.type, { pick: highlight.includes(t.idx), dim: dimmed(t.idx) }]"
      :style="cellStyle(t)" @click="$emit('tile', t.idx)"
    >
      <span v-if="t.type === 'city'" class="band" :style="{ background: GROUPS[t.group].color }"></span>
      <span class="ic"><Emoji :char="t.emoji" /></span>
      <span v-if="corner(t.idx)" class="cn">{{ t.name }}</span>
      <span v-if="own(t.idx)" class="owner" :style="{ background: view.players[own(t.idx).owner].color }"></span>
      <span v-if="own(t.idx)?.level === 4" class="lm"><img :src="ART.landmark" alt="" /></span>
      <span v-else-if="own(t.idx)?.level" class="hs"><img v-for="h in own(t.idx).level" :key="h" :src="ART.house" alt="" /></span>
      <span v-if="view.festival === t.idx" class="fest"><Emoji char="🎉" /></span>
      <span v-if="pop && pop.idx === t.idx" :key="pop.key" class="burst" :class="pop.kind"></span>
    </button>

    <div class="center"><slot /></div>

    <img
      v-for="(pos, seat) in pawns" v-show="!view.players[seat].out" :key="'p' + seat" :src="ART['pawn_' + seat]" alt=""
      class="pawn" :class="{ hop: hopping === seat, me: seat === mySeat }" :style="pawnStyle(pos, seat)"
    />
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { TILES, GROUPS, tileGrid } from '../../data/tycoon/board.js'

const ART = Object.fromEntries(Object.entries(import.meta.glob('../../assets/tycoon/*.png', { eager: true, import: 'default' }))
  .map(([k, v]) => [k.split('/').pop().replace('.png', ''), v]))

const props = defineProps({
  view: { type: Object, required: true },
  pawns: { type: Array, required: true },
  hopping: { type: Number, default: -1 },
  pop: { type: Object, default: null },
  shake: { type: Number, default: 0 },
  highlight: { type: Array, default: () => [] },
  mySeat: { type: Number, default: -1 },
})
defineEmits(['tile'])

const corner = (i) => i % 8 === 0
const own = (i) => props.view.tiles[i]
const dimmed = (i) => (props.view.blackout?.[i] ?? 0) > props.view.turnNo
function cellStyle(t) { const g = tileGrid(t.idx); return { gridRow: g.row, gridColumn: g.col } }
const OFF = [[-14, -12], [14, -12], [-14, 10], [14, 10]]
function pawnStyle(pos, seat) {
  const g = tileGrid(pos)
  const same = props.pawns.filter((p, s) => p === pos && !props.view.players[s].out).length > 1
  const [dx, dy] = same ? OFF[seat] : [0, -4]
  // ช่องกว้าง 1/9 ของกระดาน · คนยืนช่องเดียวกันขยับมุมละนิด (dx/dy เป็น % ของช่อง × 0.25)
  return { left: `${(g.col - 0.5) / 9 * 100 + dx * 0.25 / 9 * 4}%`, top: `${(g.row - 0.5) / 9 * 100 + dy * 0.25 / 9 * 4}%`, zIndex: 5 + seat }
}
</script>

<style scoped>
.tb { position: relative; display: grid; grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr); gap: 2px; width: 100%; aspect-ratio: 1; background: #3d3358; border-radius: 14px; padding: 3px; box-shadow: var(--pop); }
.tile { position: relative; border: 0; border-radius: 6px; background: #fffaf0; padding: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; font-family: inherit; min-width: 0; }
.tile.start { background: #d9f7d6; } .tile.jail { background: #e6e1ef; } .tile.festival { background: #ffe7c2; } .tile.travel { background: #d6ecff; }
.tile.chance { background: #ffe0ec; } .tile.tour { background: #dff6f0; } .tile.tax { background: #f4e6d6; } .tile.minigame { background: #fff3c4; }
.band { position: absolute; top: 0; left: 0; right: 0; height: 22%; }
.ic { font-size: clamp(.8rem, 3.6vw, 1.15rem); line-height: 1; margin-top: 10%; }
.cn { position: absolute; bottom: 2px; left: 0; right: 0; font-size: .7rem; font-weight: 800; text-align: center; color: #3d3358; white-space: nowrap; overflow: hidden; }
.owner { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; }
.hs { position: absolute; bottom: 5px; left: 0; right: 0; display: flex; justify-content: center; gap: 0; }
.hs img { width: 32%; image-rendering: pixelated; }
.lm { position: absolute; bottom: 4px; right: 2px; width: 45%; }
.lm img { width: 100%; image-rendering: pixelated; animation: glint 1.6s ease-in-out infinite; }
.fest { position: absolute; top: 1px; right: 1px; font-size: .7rem; animation: bob 1s ease-in-out infinite; }
.pick { outline: 3px solid #ffb020; outline-offset: -3px; animation: pulse .8s ease-in-out infinite; }
.dim { filter: grayscale(1) brightness(.75); }
.center { grid-row: 2 / 9; grid-column: 2 / 9; background: linear-gradient(160deg, #fff7fb, #eef6ff); border-radius: 10px; padding: 6px; display: flex; flex-direction: column; gap: 6px; min-width: 0; min-height: 0; overflow: hidden; }
.pawn { position: absolute; width: 7%; transform: translate(-50%, -60%); image-rendering: pixelated; transition: left .12s ease-out, top .12s ease-out; filter: drop-shadow(0 2px 0 rgba(0,0,0,.35)); pointer-events: none; }
.pawn.me { filter: drop-shadow(0 0 3px #fff) drop-shadow(0 2px 0 rgba(0,0,0,.35)); }
.pawn.hop { animation: hop .13s ease-out; }
.burst { position: absolute; inset: 0; border-radius: 6px; pointer-events: none; animation: burst .55s ease-out forwards; }
.burst.buy, .burst.build { box-shadow: inset 0 0 0 3px #3fc98a; }
.burst.landmark, .burst.festival { box-shadow: inset 0 0 0 3px #ffd25a, 0 0 14px 4px #ffd25a; }
.burst.takeover { box-shadow: inset 0 0 0 3px #ff7a9c; }
.burst.storm, .burst.blackout { box-shadow: inset 0 0 0 3px #5a5470; background: rgba(60,50,90,.25); }
.shake-1 { animation: shake1 .35s; } .shake-2 { animation: shake2 .42s; }
@keyframes hop { 0% { transform: translate(-50%, -60%) scale(1, 1); } 40% { transform: translate(-50%, -95%) scale(.9, 1.1); } 100% { transform: translate(-50%, -60%) scale(1.1, .9); } }
@keyframes burst { 0% { transform: scale(.6); opacity: 1; } 70% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }
@keyframes pulse { 50% { outline-color: #ff7a9c; } }
@keyframes bob { 50% { transform: translateY(-2px); } }
@keyframes glint { 50% { filter: brightness(1.25); } }
@keyframes shake1 { 25% { transform: translate(-2px, 1px); } 50% { transform: translate(2px, -1px); } 75% { transform: translate(-1px, 0); } }
@keyframes shake2 { 20% { transform: translate(-5px, 2px) rotate(-.5deg); } 40% { transform: translate(5px, -2px) rotate(.5deg); } 60% { transform: translate(-3px, 1px); } 80% { transform: translate(3px, 0); } }
</style>
