// ════════════════════════════════════════════════════════════
//  Minigame core — ตรรกะล้วน เทสได้ (ไม่แตะ canvas/DOM/Firestore)
//  Capsule Rush physics + collision + scoring + coin grant + leaderboard build
// ════════════════════════════════════════════════════════════

// ── Capsule Rush physics (dt = วินาที) ──
export function applyJump(bird, cfg) {
  return { ...bird, vy: cfg.jump }
}

export function stepBird(bird, dt, cfg) {
  return { y: bird.y + bird.vy * dt, vy: bird.vy + cfg.gravity * dt }
}

export function stepPipes(pipes, dt, speed) {
  return pipes
    .map(p => ({ ...p, x: p.x - speed * dt }))
    .filter(p => p.x + 70 > 0) // pipeW=70; ตัดท่อที่หลุดจอซ้าย
}

export function collides(bird, pipes, cfg) {
  // พื้น/เพดาน
  if (bird.y + cfg.birdR >= cfg.worldH || bird.y - cfg.birdR <= 0) return true
  // ท่อ: นกเป็นวงกลมที่ x=birdX รัศมี birdR — เช็คทับคอลัมน์ท่อ แล้วต้องอยู่ในช่อง
  for (const p of pipes) {
    const overlapX = cfg.birdX + cfg.birdR > p.x && cfg.birdX - cfg.birdR < p.x + cfg.pipeW
    if (!overlapX) continue
    const inGap = bird.y - cfg.birdR > p.gapY && bird.y + cfg.birdR < p.gapY + p.gapH
    if (!inGap) return true
  }
  return false
}

export function scorePassed(bird, pipes, cfg) {
  let gained = 0
  const out = pipes.map(p => {
    if (!p.scored && p.x + cfg.pipeW < cfg.birdX) {
      gained += 1
      return { ...p, scored: true }
    }
    return p
  })
  return { pipes: out, gained }
}

// ── เหรียญ (clamp เพดาน กันเงินเฟ้อ ไม่มี cap รายวัน) ──
export function grantCoins(score, game) {
  const capped = Math.min(score, game.maxPlausibleScore)
  return { coins: capped * game.coinPerPoint, flagged: score > game.maxPlausibleScore }
}

// ── Leaderboard: จาก members (fbUsers) + overlay me (best สดกว่า cache) ──
export function buildMinigameBoard(fbUsers, me, key) {
  const rows = {}
  for (const u of Object.values(fbUsers || {})) {
    rows[u.studentId || u.uid] = {
      uid: u.uid, studentId: u.studentId, nickname: u.nickname, track: u.track,
      googlePhoto: u.googlePhoto, customPhoto: u.customPhoto,
      best: u.minigames?.[key]?.best || 0, isMe: false,
    }
  }
  if (me) {
    const k = me.studentId || me.uid
    const prev = rows[k]
    rows[k] = {
      uid: me.uid, studentId: me.studentId, nickname: me.nickname, track: me.track,
      googlePhoto: me.googlePhoto, customPhoto: me.customPhoto,
      best: Math.max(me.best || 0, prev?.best || 0), isMe: true,
    }
  }
  return Object.values(rows)
    .filter(r => r.best > 0)
    .sort((a, b) => b.best - a.best)
    .slice(0, 50)
}
