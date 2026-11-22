// ════════════════════════════════════════════════════════════
//  focusAudio — เพลง lofi + เสียงพื้นของโหมดโฟกัส สังเคราะห์สดด้วย Web Audio (ไม่มีไฟล์เพลง ไม่ติดลิขสิทธิ์)
//  เป็น singleton: เพลงเล่นต่อได้ตอนออกไปทำข้อสอบ (ไม่ผูกกับหน้า) · ต้องเริ่มจากการกดของผู้ใช้ (iOS)
//  กฎเสียง (user 22 พ.ย. 2026): ไม่น่ารำคาญ ไม่มีเสียงแหลมจี้ถี่ · ฉาบนุ่ม ≤2 ครั้ง/ห้อง · โน้ตบนสุด ≤ ~700Hz
//  ชื่อเพลง: "lofi - <ชื่ออังกฤษตามมู้ด>" ห้ามซ้ำชื่อเพลงจริง ห้ามชนชื่อเสียงพื้น/ฝน
// ════════════════════════════════════════════════════════════
import { reactive } from 'vue'

// mood · style pad/pluck · swing+walk = แจ๊ส · hat = ฉาบนุ่มต่อห้อง (0–2)
export const TRACKS = [
  { name: 'lofi - Strawberry Milk Break', mood: 'หวาน', bpm: 74, ch: [[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]], wave: 'triangle', lp: 950, kick: [0,2.5], snare: [1,3], hat: 1 },
  { name: 'lofi - Sugar Coated Pills', mood: 'หวาน', bpm: 70, ch: [[50,54,57,61],[47,50,54,57],[55,59,62,66],[57,61,64,67]], wave: 'sine', lp: 850, kick: [0,2], snare: [3], hat: 1 },
  { name: 'lofi - Highlighter Haze', mood: 'ชิล', bpm: 66, ch: [[52,55,59,62],[48,52,55,59],[50,53,57,60],[47,50,55,59]], wave: 'sine', lp: 750, kick: [0,2], snare: [3], hat: 1 },
  { name: 'lofi - Flashcard Drift', mood: 'ชิล', bpm: 74, ch: [[55,59,62,66],[52,55,59,62],[48,52,55,59],[50,54,57,62]], wave: 'triangle', lp: 1000, kick: [0,2.75], snare: [1,3], hat: 1 },
  { name: 'lofi - Third Cup Hum', mood: 'ชิล', bpm: 72, ch: [[57,60,64,67],[53,57,60,64],[55,59,62,65],[52,55,59,64]], wave: 'triangle', lp: 900, kick: [0,2.5], snare: [1,3], hat: 2 },
  { name: 'lofi - Night Shift Notes', mood: 'ชิล', bpm: 62, ch: [[50,57,60,65],[55,58,62,65],[48,55,58,64],[53,57,60,64]], wave: 'sine', lp: 650, kick: [0], snare: [2], hat: 0 },
  { name: 'lofi - Blanket Fort Theory', mood: 'ชิล', bpm: 58, ch: [[49,56,60,63],[54,58,61,65],[51,58,61,65],[56,60,63,67]], wave: 'sine', lp: 600, kick: [0], snare: [], hat: 0 },
  { name: 'lofi - Sticky Note Parade', mood: 'ร่างเริง', bpm: 92, ch: [[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]], wave: 'triangle', lp: 1300, kick: [0,1.5,2], snare: [1,3], hat: 2, style: 'pluck' },
  { name: 'lofi - Pencil Case Shuffle', mood: 'ร่างเริง', bpm: 88, ch: [[53,57,60,64],[50,53,57,60],[55,58,62,65],[48,52,55,60]], wave: 'triangle', lp: 1200, kick: [0,2], snare: [1,3], hat: 2, style: 'pluck', swing: true },
  { name: 'lofi - Warm Mug Mornings', mood: 'อบอุ่น', bpm: 80, ch: [[60,64,67,71],[57,60,64,67],[62,65,69,72],[55,59,62,65]], wave: 'triangle', lp: 1050, kick: [0,1.5,2.5], snare: [1,3], hat: 1 },
  { name: 'lofi - Porch Light Study', mood: 'อบอุ่น', bpm: 68, ch: [[51,55,58,62],[48,51,55,58],[53,56,60,63],[46,50,53,56]], wave: 'sine', lp: 800, kick: [0,2.5], snare: [3], hat: 1 },
  { name: 'lofi - Group Study Groove', mood: 'อบอุ่น', bpm: 78, ch: [[57,60,64,69],[62,65,69,72],[55,59,62,67],[52,56,59,64]], wave: 'triangle', lp: 950, kick: [0,1.75,2.5], snare: [1,3], hat: 1 },
  { name: 'lofi - Pill Counter Jazz', mood: 'แจ๊ส', bpm: 84, ch: [[55,58,62,65],[48,52,58,62],[53,57,60,64],[50,54,57,60]], wave: 'sine', lp: 1000, kick: [0], snare: [1,3], hat: 2, swing: true, walk: true },
  { name: 'lofi - Late Lab Brushes', mood: 'แจ๊ส', bpm: 76, ch: [[50,53,57,60],[55,59,62,65],[48,52,55,59],[57,61,64,67]], wave: 'sine', lp: 900, kick: [0], snare: [1,3], hat: 2, swing: true, walk: true },
]
export const NOISES = [
  { key: 'brown', name: 'Brown noise', mood: 'ทุ้ม นุ่ม' },
  { key: 'pink', name: 'Pink noise', mood: 'สมดุล' },
  { key: 'rain', name: 'ฝนตกเบาๆ', mood: 'ธรรมชาติ' },
]

const FADE = 0.5   // วินาที — เปลี่ยนเพลงเฟดข้ามกัน (user 22 พ.ย.)
const KEY = 'rxtu.focusAudio'
function readPrefs() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const p0 = readPrefs()
export const audioState = reactive({ track: -1, noise: '', music: p0.music ?? 50, bg: p0.bg ?? 50, muted: false })
function savePrefs() { try { localStorage.setItem(KEY, JSON.stringify({ music: audioState.music, bg: audioState.bg })) } catch { /* private mode */ } }

let ac = null, master, mBus, nBus, tBus = null, timer = null, noiseNode = null
function ctx() {
  if (typeof window === 'undefined') return null
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ac = new AC()
    master = ac.createGain()
    const lim = ac.createDynamicsCompressor()
    lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.003; lim.release.value = 0.12
    master.connect(lim).connect(ac.destination)
    mBus = ac.createGain(); nBus = ac.createGain(); mBus.connect(master); nBus.connect(master)
    applyVol()
  }
  if (ac.state === 'suspended') ac.resume().catch(() => {})
  return ac
}
function applyVol() {
  if (!ac) return
  master.gain.value = audioState.muted ? 0 : 1
  mBus.gain.value = audioState.music / 100 * 0.9
  nBus.gain.value = audioState.bg / 100 * 0.9
}
export function setVolume(kind, v) { audioState[kind] = v; applyVol(); savePrefs() }
export function setMuted(v) { audioState.muted = !!v; applyVol() }

const N = (n) => 440 * Math.pow(2, (n - 69) / 12)
function hit(f, d, vol, type, at, to) {
  const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain()
  o.type = type; o.frequency.setValueAtTime(f, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + d)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d)
  o.connect(g).connect(tBus); o.start(t); o.stop(t + d + 0.05)
}
function burst(at, len, shape, filt, vol) {
  const t = ac.currentTime + at, s = ac.createBufferSource(), b = ac.createBuffer(1, Math.floor(ac.sampleRate * len), ac.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, shape)
  s.buffer = b
  let node = s
  for (const [type, f] of filt) { const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; node.connect(bq); node = bq }
  const g = ac.createGain(); g.gain.value = vol; node.connect(g).connect(tBus); s.start(t)
}
const softHat = (at) => burst(at, 0.08, 3, [['bandpass', 4500], ['lowpass', 6000]], 0.025)   // ฉาบนุ่ม
const snare = (at) => burst(at, 0.2, 1, [['lowpass', 1400]], 0.08)                          // สแนร์แบบแปรง

function fadeOutTrack() {
  clearInterval(timer); timer = null
  if (tBus && ac) {
    const g = tBus, t = ac.currentTime
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + FADE)
    setTimeout(() => g.disconnect(), FADE * 1000 + 200)
  }
  tBus = null
}
export function stopTrack() { fadeOutTrack(); audioState.track = -1 }
export function playTrack(i) {
  if (!ctx()) return
  fadeOutTrack()
  audioState.track = i
  const L = TRACKS[i], beat = 60 / L.bpm, barLen = beat * 4
  tBus = ac.createGain(); tBus.connect(mBus)
  tBus.gain.setValueAtTime(0, ac.currentTime); tBus.gain.linearRampToValueAtTime(1, ac.currentTime + FADE)
  const sw = (b) => (L.swing && b % 1 === 0.5 ? Math.floor(b) + 0.67 : b)
  let k = 0
  const bar = () => {
    if (!tBus) return
    const c = L.ch[k % 4], nx = L.ch[(k + 1) % 4]; k++
    const t = ac.currentTime, lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = L.lp; lp.connect(tBus)
    const pl = L.style === 'pluck', hits = pl ? [[0, beat * 1.6], [2, beat * 1.6]] : [[0, barLen * 0.97]]
    hits.forEach(([at, len]) => c.forEach((n, j) => {
      const o = ac.createOscillator(), g = ac.createGain(), st = t + at * beat + j * 0.035
      o.type = L.wave; o.frequency.value = N(n); o.detune.value = (Math.random() - 0.5) * 16
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(pl ? 0.05 : 0.045, st + (pl ? 0.02 : 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, st + len)
      o.connect(g).connect(lp); o.start(st); o.stop(st + len + 0.05)
    }))
    if (L.walk) { const r = c[0] - 12; [r, r + (c[1] - c[0]), r + (c[2] - c[0]), nx[0] - 13].forEach((n, b) => hit(N(n), beat * 0.9, 0.1, 'sine', b * beat)) }   // เบสเดิน
    else hit(N(c[0] - 12), barLen * 0.9, 0.12, 'sine', 0)
    if (k % 2 === 0) hit(N(c[3]), beat * 1.2, 0.025, 'sine', sw(2.5) * beat)
    if (L.hat) [1.5, 3.5].slice(0, L.hat).forEach(b => softHat(sw(b) * beat))
    L.kick.forEach(b => hit(110, 0.22, 0.3, 'sine', sw(b) * beat, 45))
    L.snare.forEach(b => snare(b * beat))
  }
  bar(); timer = setInterval(bar, barLen * 1000)
}

function noiseBuf(kind) {
  const n = ac.sampleRate * 6, b = ac.createBuffer(2, n, ac.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let l = 0, b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1
      if (kind === 'brown') { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.2 }
      else { b0 = 0.997 * b0 + 0.029591 * w; b1 = 0.985 * b1 + 0.032534 * w; b2 = 0.95 * b2 + 0.048056 * w; d[i] = (b0 + b1 + b2 + w * 0.1) * 0.35 }
    }
  }
  return b
}
export function stopNoise() {
  if (noiseNode) {
    const { s, g, drip } = noiseNode, t = ac.currentTime
    clearInterval(drip); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + FADE)
    setTimeout(() => { try { s.stop() } catch { /* already stopped */ } }, FADE * 1000 + 100)
  }
  noiseNode = null; audioState.noise = ''
}
export function playNoise(kind) {
  if (!ctx()) return
  stopNoise(); audioState.noise = kind
  const s = ac.createBufferSource(); s.buffer = noiseBuf(kind === 'brown' ? 'brown' : 'pink'); s.loop = true
  const f = ac.createBiquadFilter(), g = ac.createGain()
  let vol
  if (kind === 'rain') { f.type = 'bandpass'; f.frequency.value = 2500; f.Q.value = 0.6; vol = 0.3 }
  else { f.type = 'lowpass'; f.frequency.value = kind === 'brown' ? 500 : 3000; vol = kind === 'brown' ? 0.28 : 0.12 }
  g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(vol, ac.currentTime + FADE)
  s.connect(f).connect(g).connect(nBus); s.start()
  let drip = null
  if (kind === 'rain') drip = setInterval(() => {   // หยดน้ำเบาๆ
    if (Math.random() < 0.6) {
      const t = ac.currentTime, o = ac.createOscillator(), gg = ac.createGain()
      o.frequency.setValueAtTime(1800 + Math.random() * 1500, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.05)
      gg.gain.setValueAtTime(0.03, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
      o.connect(gg).connect(g); o.start(t); o.stop(t + 0.08)
    }
  }, 180)
  noiseNode = { s, g, drip }
}
export function stopAll() { stopTrack(); stopNoise() }

// 🔔 เสียงแจ้งในห้อง (22 พ.ย. 2026) — เบา นุ่ม ไม่แหลม · เงียบตามปุ่ม 🔇 (ผ่าน master)
//   chat = "ป๊อก" นุ่ม 1 ครั้ง · door = กระดิ่งประตูร้าน 2 โน้ต
export function chime(kind) {
  if (!ctx() || audioState.muted) return
  const t = ac.currentTime, g = ac.createGain(), lp = ac.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 1800
  g.gain.value = 0.5; lp.connect(g).connect(master)
  const note = (f, at, len, vol) => {
    const o = ac.createOscillator(), e = ac.createGain()
    o.type = 'sine'; o.frequency.setValueAtTime(f, t + at)
    e.gain.setValueAtTime(0.0001, t + at); e.gain.exponentialRampToValueAtTime(vol, t + at + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t + at + len)
    o.connect(e).connect(lp); o.start(t + at); o.stop(t + at + len + 0.05)
  }
  if (kind === 'clap') {   // แปะ! = noise สั้นๆ ผ่าน bandpass
    const n = Math.floor(ac.sampleRate * 0.12), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4)
    const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), e = ac.createGain()
    bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.8; e.gain.value = 0.9
    src.buffer = buf; src.connect(bp).connect(e).connect(master); src.start(t)
    return
  }
  if (kind === 'door') { note(784, 0, 0.9, 0.12); note(659, 0.14, 1.1, 0.1) }   // กริ๊ง
  else { note(520, 0, 0.18, 0.12); note(390, 0.03, 0.2, 0.06) }                 // ป๊อก
}
