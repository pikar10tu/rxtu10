// ════════════════════════════════════════════════════════════
//  ย้ายเครดิตตรวจข้อสอบจากบัญชีซ้ำ → บัญชีหลัก (ตรรกะล้วน)
//  เคสจริง 24 ก.ย. 2026: เพื่อนวิชาการล็อกอินด้วย 2 อีเมล = 2 uid ⇒ ผลตรวจไปนับอยู่อีกบัญชี
//
//  เครดิตตรวจผูกกับ uid 3 ที่ ต้องย้ายครบทุกที่:
//   1) questions/{id}.reviewedBy — แหล่งความจริง (ปุ่ม "ซิงก์ระบบตรวจ" นับตัวนับใหม่จากตรงนี้
//      ถ้าย้ายแค่ตัวนับ กดซิงก์รอบหน้าเครดิตจะเด้งกลับบัญชีเก่า)
//   2) questions/{id}/reviews/{uid} — รายละเอียดผลตรวจ (ถ้าทิ้งไว้ ReviewView จะโชว์เป็น
//      "ผลตรวจรอบก่อนแก้" เพราะ uid ไม่อยู่ใน reviewedBy แล้ว)
//   3) reviewMeta/main.counts/names — ตัวนับ leaderboard (ทำฝั่ง view)
//  + lastFixBy ย้ายตามด้วย ไม่งั้น needsReviewBy กันผิดคน
// ════════════════════════════════════════════════════════════

// → { updates: [{ id, patch, moveReviewDoc }], moved, dup }
//  moved = ข้อที่บัญชีใหม่ได้เครดิตเพิ่ม · fixedOnly = ข้อที่แก้ไว้แต่ไม่มีเครดิต (แก้ในหน้าคลัง
//  = ล้างผลตรวจ+ส่งกลับคิว ไม่นับให้คนแก้) — ใช้ตอบคำถาม "ตรวจแล้วทำไมไม่ขึ้น" · dup = ข้อที่ตรวจไว้ทั้งสองบัญชี (ตัดตัวเก่าทิ้ง
//  คงผลตรวจของบัญชีใหม่ไว้ ตัวนับเสียง pass/fail บนข้อไม่แตะ)
export function planReviewCreditMove(questions, fromUid, toUid) {
  const out = { updates: [], moved: 0, dup: 0, fixedOnly: 0 }
  if (!fromUid || !toUid || fromUid === toUid) return out
  for (const q of questions || []) {
    const by = q.reviewedBy || []
    const inBy = by.includes(fromUid)
    const fixed = q.lastFixBy === fromUid
    if (!inBy && !fixed) continue
    const patch = {}
    let moveReviewDoc = false
    if (inBy) {
      if (by.includes(toUid)) {
        patch.reviewedBy = by.filter(u => u !== fromUid)
        out.dup++
      } else {
        patch.reviewedBy = by.map(u => (u === fromUid ? toUid : u))
        moveReviewDoc = true
        out.moved++
      }
    }
    if (fixed) patch.lastFixBy = toUid
    if (fixed && !inBy) out.fixedOnly++
    out.updates.push({ id: q.id, patch, moveReviewDoc })
  }
  return out
}

// รายชื่อบัญชีให้เลือกต้นทาง/ปลายทาง — users ทุก doc + uid ที่มีแค่ในตัวนับ
//  (บัญชีที่ยังไม่กรอกข้อมูลถูกซ่อนจากแผงแอดมินปกติ แต่อาจเป็นบัญชีที่ถือเครดิตอยู่)
export function reviewerAccounts(users, meta) {
  const counts = meta?.counts || {}
  const names = meta?.names || {}
  const rows = new Map()
  for (const u of users || []) {
    const nick = u.nickname || null
    const real = u.realName || null
    const name = real && nick ? `${real} (${nick})` : (real || nick || names[u.uid] || '(ยังไม่ตั้งชื่อ)')
    rows.set(u.uid, { uid: u.uid, name, email: u.email || null, role: u.role || 'student', count: counts[u.uid] || 0 })
  }
  for (const uid of Object.keys(counts)) {
    if (!rows.has(uid)) rows.set(uid, { uid, name: names[uid] || '(ไม่มีบัญชีนี้แล้ว)', email: null, role: null, count: counts[uid] || 0 })
  }
  return [...rows.values()]
    .map(r => ({ ...r, search: [r.name, names[r.uid], r.email, r.uid].filter(Boolean).join(' ').toLowerCase() }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
