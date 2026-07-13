import { ref } from 'vue'
import { applyJump, stepBird, stepPipes, collides, scorePassed } from '../utils/minigameCore.js'

// Canvas game loop สำหรับ Capsule Rush — physics จาก core (เทสแล้ว), ที่นี่คุมแค่ loop/วาด/อินพุต
// rAF: clamp dt + pause ตอนสลับแอป (กัน dt spike = ตายฟรี/พุ่งทะลุท่อ)
export function useCapsuleRush(canvasRef, { onGameOver }) {
  const score = ref(0)
  const running = ref(false)

  const CFG = { gravity: 1600, jump: -520, birdX: 80, birdR: 18, pipeW: 70, worldH: 600 }
  const WORLD_W = 400
  let bird, pipes, speed, spawnTimer, sprite, raf, lastT

  function reset() {
    bird = { y: 300, vy: 0 }
    pipes = []
    speed = 170
    spawnTimer = 0
    score.value = 0
  }

  function spawnPipe() {
    const gapH = 190
    const margin = 60
    const gapY = margin + Math.random() * (CFG.worldH - gapH - margin * 2)
    pipes.push({ x: WORLD_W, gapY, gapH, scored: false })
  }

  function flap() { if (running.value) bird = applyJump(bird, CFG) }

  function loop(t) {
    if (!running.value) return
    let dt = (t - lastT) / 1000
    lastT = t
    if (dt > 0.05) dt = 0.05 // clamp กัน spike (สลับแอป/เฟรมตก)

    bird = stepBird(bird, dt, CFG)
    pipes = stepPipes(pipes, dt, speed)
    spawnTimer += dt
    if (spawnTimer > 1.6) { spawnPipe(); spawnTimer = 0 }

    const sr = scorePassed(bird, pipes, CFG)
    pipes = sr.pipes
    if (sr.gained) { score.value += sr.gained; speed += 4 } // เร่งขึ้นเรื่อยๆ

    draw()

    if (collides(bird, pipes, CFG)) { end(); return }
    raf = requestAnimationFrame(loop)
  }

  function draw() {
    const cv = canvasRef.value
    if (!cv) return
    const ctx = cv.getContext('2d')
    ctx.clearRect(0, 0, WORLD_W, CFG.worldH)
    // ท่อ (ชั้นวางยา)
    ctx.fillStyle = '#a7f3d0'
    for (const p of pipes) {
      ctx.fillRect(p.x, 0, CFG.pipeW, p.gapY)
      ctx.fillRect(p.x, p.gapY + p.gapH, CFG.pipeW, CFG.worldH - p.gapY - p.gapH)
    }
    // เพ็ท
    const r = CFG.birdR
    if (sprite) ctx.drawImage(sprite, CFG.birdX - r, bird.y - r, r * 2, r * 2)
    else { ctx.font = `${r * 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
           ctx.fillText('💊', CFG.birdX, bird.y) }
  }

  function start(spriteImg) {
    sprite = spriteImg || null
    reset()
    running.value = true
    lastT = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function end() {
    running.value = false
    cancelAnimationFrame(raf)
    onGameOver(score.value)
  }

  function stop() { running.value = false; cancelAnimationFrame(raf) }

  // pause ตอนสลับแอป — กลับมาแล้วต่อ lastT ใหม่ (ไม่ให้ dt พุ่ง)
  function onVisibility() {
    if (document.hidden) { cancelAnimationFrame(raf) }
    else if (running.value) { lastT = performance.now(); raf = requestAnimationFrame(loop) }
  }
  document.addEventListener('visibilitychange', onVisibility)
  const dispose = () => document.removeEventListener('visibilitychange', onVisibility)

  return { score, running, start, stop, flap, dispose, WORLD_W, WORLD_H: CFG.worldH }
}
