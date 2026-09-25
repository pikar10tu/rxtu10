// ════════════════════════════════════════════════════════════
//  mailbox — pure helpers ระบบจดหมาย (Mailbox track)
//  ไม่ import Firestore: caller เติม serverTimestamp() เอง → เทสได้ตรง
//  mail: { type:'reward'|'gift'|'notice', title, body?, reward?:{coins?},
//          from:'system'|'daily'|'admin'|<uid>, createdAt, read:bool, claimed:bool }
// ════════════════════════════════════════════════════════════

import { WELCOME_GIFT_COINS, WELCOME_GIFT_TICKETS } from '../data/userSchema.js'
import { getArena } from '../data/arenas.js'

// เหรียญในจดหมาย (>0 เท่านั้น ไม่งั้น 0)
export function rewardCoins(mail) {
  const c = mail?.reward?.coins
  return (typeof c === 'number' && c > 0) ? c : 0
}

// ตั๋วกาชาในจดหมาย (>0 เท่านั้น ไม่งั้น 0)
export function rewardTickets(mail) {
  const t = mail?.reward?.tickets
  return (typeof t === 'number' && t > 0) ? t : 0
}

// สนามแชมป์ในจดหมาย { id, rank } — id ต้องอยู่ในทะเบียน (data/arenas.js) ไม่งั้น null
export function rewardArena(mail) {
  const a = mail?.reward?.arena
  if (!a || !getArena(a.id)) return null
  return { id: a.id, rank: Number(a.rank) || 10 }
}

// กดรับได้ไหม = มีรางวัล (เหรียญ/ตั๋ว > 0 · achievement · สนาม) และยังไม่เคยรับ
export function canClaim(mail) {
  return !!mail && !mail.claimed && (rewardCoins(mail) > 0 || rewardTickets(mail) > 0 || !!mail?.reward?.achievement || !!rewardArena(mail))
}

// ต้องสนใจไหม = ยังไม่อ่าน หรือ ยังกดรับได้ (ใช้คิด badge)
export function needsAttention(mail) {
  return !!mail && (!mail.read || canClaim(mail))
}

// นับจำนวน mail ที่ต้องสนใจ (badge)
export function attentionCount(mails) {
  return (mails || []).filter(needsAttention).length
}

// จดหมายประกาศที่ควร "เด้ง" กล่องจดหมายให้ดูเอง — คืน mail หรือ null
//   นับเฉพาะ from:'admin' (= ของที่ออกจากปุ่ม broadcast ในแอดมิน) เพราะ:
//     · จดหมายต้อนรับเป็น from:'welcome' → กันชนกับ WelcomeBox ที่เด้งอยู่แล้ว (ไม่งั้นคนสมัครใหม่โดน 2 จอซ้อน)
//     · รางวัลแจ้งข้อสอบผิดเป็น from:'system' → ไม่ใช่ประกาศ ไม่ต้องเด้ง
//     · เช็ค from ไม่ใช่ type ⇒ ประกาศที่แนบเหรียญ (type กลายเป็น 'reward') ก็ยังเด้ง
//   เงื่อนไข !read มีไว้กันเด้งใส่คนที่ไล่กดจุดแดงเจอประกาศไปเองแล้วก่อนฟีเจอร์นี้ขึ้นเว็บ
//   ⚠️ สมมติว่า mails เรียงใหม่→เก่ามาแล้ว (store ใช้ orderBy('createdAt','desc'))
export function pendingAnnounce(mails, seenId) {
  const latest = (mails || []).find(m => m?.from === 'admin')
  if (!latest || latest.read || latest.id === seenId) return null
  return latest
}

function truncate(s, n) {
  const str = String(s ?? '')
  return str.length > n ? str.slice(0, n) + '…' : str
}

// สร้าง payload จดหมายรางวัล "แจ้งข้อสอบผิด" — title ไม่ใส่ emoji (mail title render
// เป็น text ฝัง <Emoji> ไม่ได้ → ใส่ emoji จะ tofu; ไอคอนให้การ์ด render จาก type แทน)
// caller เติม createdAt = serverTimestamp()
export function buildReportRewardMail(report, coins, createdAt) {
  const q = report?.questionSnapshot?.question
  return {
    type: 'reward',
    kind: 'report',   // achievement ตาไว/นักสืบ นับตอนกดรับ (stores/mailbox claim)
    title: 'รางวัลแจ้งข้อสอบผิด',
    body: q
      ? `ขอบคุณที่ช่วยแจ้งข้อสอบ "${truncate(q, 60)}" — ทีมวิชาการตรวจแล้วว่าถูกต้อง`
      : 'ขอบคุณที่ช่วยแจ้งข้อสอบผิด ทีมวิชาการตรวจแล้วว่าถูกต้อง',
    reward: { coins },
    from: 'system',
    createdAt,
    read: false,
    claimed: false,
  }
}

// จดหมายแจ้งผู้แจ้งว่า "ข้อนี้ไม่ผิด" — ไม่มีรางวัล (notice) · note = เหตุผลที่คนตรวจเขียน (ผ่าน cleanText มาแล้ว)
// ⚠️ body แสดงด้วย {{ }} ใน MailboxCard (ไม่มี pre-wrap) — ต่อด้วย " · " ไม่ใช้ขึ้นบรรทัด
export function buildReportResultMail(report, note, createdAt) {
  const q = report?.questionSnapshot?.question
  const head = q
    ? `ทีมวิชาการตรวจข้อ "${truncate(q, 60)}" ที่คุณแจ้งแล้ว — ข้อนี้ถูกต้องอยู่แล้ว`
    : 'ทีมวิชาการตรวจข้อที่คุณแจ้งแล้ว — ข้อนี้ถูกต้องอยู่แล้ว'
  return {
    type: 'notice',
    title: 'ผลการแจ้งข้อสอบ',
    body: note ? `${head} · เหตุผล: ${note}` : head,
    from: 'system',
    createdAt,
    read: false,
    claimed: false,
  }
}

// สร้าง payload จดหมาย broadcast จาก admin (ประกาศ/ของขวัญ/achievement)
//   coins > 0 หรือ tickets > 0 หรือมี achievement → type 'reward' (มีปุ่มรับ) · ไม่งั้น 'notice' (อ่านอย่างเดียว ไม่มี key reward)
//   caller เติม createdAt = serverTimestamp()
export function buildBroadcastMail({ title, body, coins, tickets, from, achievement, arena } = {}, createdAt) {
  const c = (typeof coins === 'number' && coins > 0) ? coins : 0
  const t = (typeof tickets === 'number' && tickets > 0) ? tickets : 0
  const hasAch = achievement && achievement.id
  const reward = {}
  if (c > 0) reward.coins = c
  if (t > 0) reward.tickets = t
  if (hasAch) reward.achievement = { id: achievement.id, ...(achievement.date ? { date: achievement.date } : {}) }
  const hasArena = !!(arena && arena.id)
  if (hasArena) reward.arena = { id: arena.id, rank: Number(arena.rank) || 10 }   // สนามแชมป์ (รางวัลซีซั่นอารีน่า)
  const hasReward = c > 0 || t > 0 || hasAch || hasArena
  return {
    type: hasReward ? 'reward' : 'notice',
    title: title || '',
    body: body || '',
    ...(hasReward ? { reward } : {}),
    from: from || 'admin',
    createdAt,
    read: false,
    claimed: false,
  }
}

// จดหมายของขวัญต้อนรับ — แม่แบบเป๊ะ (rules ตรวจ from/reward เป๊ะ → ห้ามเปลี่ยนรูปร่าง)
// caller (auth self-deliver) เติม createdAt = serverTimestamp()
export function buildWelcomeGiftMail(createdAt) {
  return {
    type: 'reward',
    title: 'ของขวัญต้อนรับ',
    body: `ยินดีต้อนรับสู่ RxTU10! รับของขวัญต้อนรับ ${WELCOME_GIFT_COINS.toLocaleString()} เหรียญ + ตั๋วอัญเชิญ ${WELCOME_GIFT_TICKETS} ใบ`,
    reward: { coins: WELCOME_GIFT_COINS, tickets: WELCOME_GIFT_TICKETS },
    from: 'welcome',
    createdAt,
    read: false,
    claimed: false,
  }
}
